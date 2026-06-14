import fs from "fs";
import path from "path";
import process from "process";

const EXPECTED_SLUGS = [
  "zodiac-general",
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

const LEDGER_PATH = path.resolve(process.cwd(), "data", "runtime", "zodiac-publish-ledger.json");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { date: null };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--date") {
      options.date = args[++i] ?? null;
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  return { options, errors };
}

function validateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    return { ok: false, error: "Missing --date YYYY-MM-DD" };
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const valid =
    !Number.isNaN(parsed.getTime()) &&
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  return valid
    ? { ok: true, error: null }
    : { ok: false, error: `Invalid --date value: ${value}` };
}

function readLedger() {
  if (!fs.existsSync(LEDGER_PATH)) {
    return { entries: {}, warning: "Ledger file not found; treating ledger as empty." };
  }

  const raw = fs.readFileSync(LEDGER_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return {
    entries: parsed && typeof parsed.entries === "object" && parsed.entries !== null ? parsed.entries : {},
    warning: null,
  };
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function normalizeMediaMode(mediaMode) {
  return String(mediaMode || "").trim().toLowerCase();
}

function buildDailyReport(date, entries) {
  const expectedKeys = new Set(EXPECTED_SLUGS.map((slug) => `${date}:${slug}`));
  const dateEntries = Object.entries(entries)
    .filter(([key, entry]) => expectedKeys.has(key) || entry?.date === date)
    .map(([key, entry]) => ({ key, ...entry }));

  const counts = {
    sent: 0,
    failed: 0,
    pending: 0,
    skipped: 0,
    image: 0,
    textOnly: 0,
  };

  const coveredKeys = new Set();

  for (const entry of dateEntries) {
    coveredKeys.add(entry.key || `${entry.date}:${entry.slug}`);

    const status = normalizeStatus(entry.status);
    if (status === "sent") counts.sent++;
    else if (status === "failed") counts.failed++;
    else if (status === "pending") counts.pending++;
    else if (status === "skipped") counts.skipped++;

    const mediaMode = normalizeMediaMode(entry.mediaMode);
    if (mediaMode === "image") counts.image++;
    else if (mediaMode === "text_only" || mediaMode === "textonly") counts.textOnly++;
  }

  const missingExpectedCount = Array.from(expectedKeys).filter((key) => !coveredKeys.has(key)).length;
  const computedSkippedCount = counts.skipped + missingExpectedCount;

  return {
    date,
    expectedCount: EXPECTED_SLUGS.length,
    sentCount: counts.sent,
    failedCount: counts.failed,
    pendingCount: counts.pending,
    skippedCount: computedSkippedCount,
    imageCount: counts.image,
    textOnlyCount: counts.textOnly,
  };
}

function printReport(report, warning) {
  console.log("=== Zodiac Daily Report ===");
  console.log(`Date           : ${report.date}`);
  console.log(`Expected Count : ${report.expectedCount}`);
  console.log(`Sent Count     : ${report.sentCount}`);
  console.log(`Failed Count   : ${report.failedCount}`);
  console.log(`Pending Count  : ${report.pendingCount}`);
  console.log(`Skipped Count  : ${report.skippedCount}`);
  console.log(`Image Count    : ${report.imageCount}`);
  console.log(`TextOnly Count : ${report.textOnlyCount}`);
  console.log("Ledger Writes  : 0");
  console.log("Publish Calls  : 0");
  console.log("Scheduler Calls: 0");
  if (warning) {
    console.log(`Warning        : ${warning}`);
  }
  console.log("===========================");
}

function main() {
  const { options, errors } = parseArgs();
  const dateValidation = validateDate(options.date);

  if (!dateValidation.ok) {
    errors.push(dateValidation.error);
  }

  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  try {
    const ledger = readLedger();
    const report = buildDailyReport(options.date, ledger.entries);
    printReport(report, ledger.warning);
  } catch (error) {
    console.error(`Unable to generate zodiac daily report: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
