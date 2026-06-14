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

const ZODIAC_ONLY_SLUGS = EXPECTED_SLUGS.filter((slug) => slug !== "zodiac-general");
const LEDGER_PATH = path.resolve(process.cwd(), "data", "runtime", "zodiac-publish-ledger.json");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { days: null, from: null, to: null };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--days") {
      options.days = args[++i] ?? null;
    } else if (arg === "--from") {
      options.from = args[++i] ?? null;
    } else if (arg === "--to") {
      options.to = args[++i] ?? null;
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  return { options, errors };
}

function validateDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    return { ok: false, error: `Missing ${label} YYYY-MM-DD` };
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
    : { ok: false, error: `Invalid ${label} value: ${value}` };
}

function validateDays(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return { ok: false, days: null, error: "--days must be a positive integer." };
  }

  return { ok: true, days: parsed, error: null };
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
  const normalized = String(mediaMode || "").trim().toLowerCase();
  return normalized === "textonly" ? "text_only" : normalized;
}

function addDays(dateString, offset) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}

function diffDays(from, to) {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  const fromTime = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toTime = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((toTime - fromTime) / 86400000);
}

function listDates(from, to) {
  const count = diffDays(from, to);
  return Array.from({ length: count + 1 }, (_, index) => addDays(from, index));
}

function latestLedgerDate(entries) {
  return Object.values(entries)
    .map((entry) => entry?.date)
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(String(date || "")))
    .sort()
    .at(-1) ?? null;
}

function resolvePeriod(options, entries, errors) {
  const hasFromOrTo = Boolean(options.from || options.to);
  const hasDays = options.days !== null;

  if (hasFromOrTo) {
    if (hasDays) {
      errors.push("Use either --days or --from/--to, not both.");
    }

    const fromValidation = validateDate(options.from, "--from");
    const toValidation = validateDate(options.to, "--to");
    if (!fromValidation.ok) errors.push(fromValidation.error);
    if (!toValidation.ok) errors.push(toValidation.error);
    if (fromValidation.ok && toValidation.ok && diffDays(options.from, options.to) < 0) {
      errors.push("--from must be before or equal to --to.");
    }

    return { from: options.from, to: options.to };
  }

  const daysValidation = validateDays(options.days ?? "7");
  if (!daysValidation.ok) {
    errors.push(daysValidation.error);
    return { from: null, to: null };
  }

  const latest = latestLedgerDate(entries);
  if (!latest) {
    errors.push("Cannot use --days because ledger has no dated entries. Use --from YYYY-MM-DD --to YYYY-MM-DD.");
    return { from: null, to: null };
  }

  return {
    from: addDays(latest, -(daysValidation.days - 1)),
    to: latest,
  };
}

function createBreakdownItem(slug) {
  return {
    slug,
    expected: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    skipped: 0,
    image: 0,
    textOnly: 0,
    missingDates: [],
  };
}

function buildHistoryReport({ from, to, entries }) {
  const dates = listDates(from, to);
  const bySlug = Object.fromEntries(EXPECTED_SLUGS.map((slug) => [slug, createBreakdownItem(slug)]));
  const partialDays = [];
  let totalSent = 0;
  let totalImage = 0;
  let totalTextOnly = 0;
  let totalFailed = 0;
  let totalPending = 0;
  let totalSkipped = 0;

  for (const date of dates) {
    let daySent = 0;
    let dayFailed = 0;
    let dayPending = 0;
    let daySkipped = 0;

    for (const slug of EXPECTED_SLUGS) {
      const item = bySlug[slug];
      item.expected++;

      const key = `${date}:${slug}`;
      const entry = entries[key] ?? Object.values(entries).find((candidate) => candidate?.date === date && candidate?.slug === slug);
      const status = normalizeStatus(entry?.status);
      const mediaMode = normalizeMediaMode(entry?.mediaMode);

      if (status === "sent") {
        item.sent++;
        totalSent++;
        daySent++;

        if (mediaMode === "image") {
          item.image++;
          totalImage++;
        } else if (mediaMode === "text_only") {
          item.textOnly++;
          totalTextOnly++;
        }
      } else if (status === "failed") {
        item.failed++;
        totalFailed++;
        dayFailed++;
      } else if (status === "pending") {
        item.pending++;
        totalPending++;
        dayPending++;
      } else {
        item.skipped++;
        item.missingDates.push(date);
        totalSkipped++;
        daySkipped++;
      }
    }

    if (daySent !== EXPECTED_SLUGS.length) {
      partialDays.push({
        date,
        sent: daySent,
        failed: dayFailed,
        pending: dayPending,
        skipped: daySkipped,
      });
    }
  }

  const expectedPosts = dates.length * EXPECTED_SLUGS.length;
  const consistency = expectedPosts > 0 ? (totalSent / expectedPosts) * 100 : 0;

  return {
    from,
    to,
    daysAnalyzed: dates.length,
    expectedPosts,
    totalSent,
    totalImage,
    totalTextOnly,
    totalFailed,
    totalPending,
    totalSkipped,
    consistency,
    bySlug,
    perChannel: EXPECTED_SLUGS.map((slug) => bySlug[slug]),
    perZodiac: ZODIAC_ONLY_SLUGS.map((slug) => bySlug[slug]),
    partialDays,
  };
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function printBreakdown(title, rows) {
  console.log(`\n${title}`);
  for (const row of rows) {
    const completion = `${row.sent}/${row.expected}`;
    console.log(`- ${row.slug}: ${completion} sent, image=${row.image}, textOnly=${row.textOnly}, failed=${row.failed}, pending=${row.pending}, skipped=${row.skipped}`);
  }
}

function printMissing(rows) {
  const missingRows = rows.filter((row) => row.missingDates.length > 0);
  console.log("\nMissing Publication Dates");
  if (missingRows.length === 0) {
    console.log("none");
    return;
  }

  for (const row of missingRows) {
    console.log(`- ${row.slug}: ${row.missingDates.join(", ")}`);
  }
}

function printPartialDays(rows) {
  console.log("\nDays With Partial Publication");
  if (rows.length === 0) {
    console.log("none");
    return;
  }

  for (const row of rows) {
    console.log(`- ${row.date}: sent=${row.sent}, failed=${row.failed}, pending=${row.pending}, skipped=${row.skipped}`);
  }
}

function printBestCompletion(rows) {
  const sorted = [...rows].sort((a, b) => b.sent - a.sent || a.slug.localeCompare(b.slug));
  console.log("\nBest Completion");
  for (const row of sorted) {
    console.log(`- ${row.slug}: ${row.sent}/${row.expected}`);
  }
}

function printReport(report, warning) {
  console.log("=== Zodiac History Report ===");
  console.log(`Period: ${report.from} -> ${report.to}`);
  console.log(`Days analyzed: ${report.daysAnalyzed}`);
  console.log(`Expected posts: ${report.expectedPosts}`);
  console.log(`Posts sent: ${report.totalSent}`);
  console.log(`Image posts: ${report.totalImage}`);
  console.log(`Text posts: ${report.totalTextOnly}`);
  console.log(`Failed posts: ${report.totalFailed}`);
  console.log(`Pending posts: ${report.totalPending}`);
  console.log(`Skipped posts: ${report.totalSkipped}`);
  console.log(`Consistency: ${formatPercent(report.consistency)}`);
  console.log("Ledger Writes: 0");
  console.log("Publish Calls: 0");
  console.log("Scheduler Calls: 0");
  if (warning) {
    console.log(`Warning: ${warning}`);
  }

  printBestCompletion(report.perZodiac);
  printBreakdown("Per-Channel Breakdown", report.perChannel);
  printBreakdown("Per-Zodiac Breakdown", report.perZodiac);
  printMissing(report.perChannel);
  printPartialDays(report.partialDays);
  console.log("=============================");
}

function main() {
  const { options, errors } = parseArgs();

  try {
    const ledger = readLedger();
    const period = resolvePeriod(options, ledger.entries, errors);

    if (errors.length > 0) {
      errors.forEach((error) => console.error(error));
      process.exit(1);
    }

    const report = buildHistoryReport({ from: period.from, to: period.to, entries: ledger.entries });
    printReport(report, ledger.warning);
  } catch (error) {
    console.error(`Unable to generate zodiac history report: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
