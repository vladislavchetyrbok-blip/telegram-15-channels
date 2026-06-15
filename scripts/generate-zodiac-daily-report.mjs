import fs from "fs";
import path from "path";
import process from "process";
import { readLedgerReadOnly, summarizeDate, validateIsoDate } from "./lib/zodiac-autonomy.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { date: null, out: null, json: false };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--date") {
      options.date = args[++i] ?? null;
    } else if (arg === "--out") {
      options.out = args[++i] ?? null;
    } else if (arg === "--json") {
      options.json = true;
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  return { options, errors };
}

function writeReport(outPath, report, warning) {
  const absolutePath = path.resolve(process.cwd(), outPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify({ ...report, warning, ledgerWrites: 0, publishCalls: 0, schedulerCalls: 0 }, null, 2)}\n`, "utf8");
  return absolutePath;
}

function printReport(report, warning, outPath) {
  console.log("=== Zodiac Daily Report ===");
  console.log(`Date                    : ${report.date}`);
  console.log(`Expected Count          : ${report.expectedCount}`);
  console.log(`Sent Count              : ${report.sentCount}`);
  console.log(`Failed Count            : ${report.failedCount}`);
  console.log(`Pending Count           : ${report.pendingCount}`);
  console.log(`Locked/InProgress Count : ${report.lockedInProgressCount}`);
  console.log(`Skipped Count           : ${report.skippedCount}`);
  console.log(`Image Count             : ${report.imageCount}`);
  console.log(`TextOnly Count          : ${report.textOnlyCount}`);
  console.log(`Fallback Count          : ${report.fallbackCount}`);
  console.log(`Duplicate Blocked Count : ${report.duplicateBlockedCount}`);
  console.log("Ledger Writes           : 0");
  console.log("Publish Calls           : 0");
  console.log("Scheduler Calls         : 0");
  console.log("\n--- Per-Channel Result ---");
  for (const row of report.perChannel) {
    const suppression = row.suppressed ? `, suppressed=${row.suppressionReason}` : "";
    console.log(`- ${row.slug}: status=${row.status}, media=${row.mediaMode}, ledger=${row.hasLedgerEntry ? "yes" : "no"}${suppression}`);
  }
  if (warning) {
    console.log(`Warning                 : ${warning}`);
  }
  if (outPath) {
    console.log(`Report File             : ${outPath}`);
  }
  console.log("===========================");
}

function main() {
  const { options, errors } = parseArgs();
  const dateValidation = validateIsoDate(options.date);

  if (!dateValidation.ok) {
    errors.push(dateValidation.error);
  }
  if (options.out !== null && !String(options.out || "").trim()) {
    errors.push("--out requires a file path.");
  }

  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  try {
    const ledger = readLedgerReadOnly();
    const report = summarizeDate(ledger.entries, options.date);
    const outPath = options.out ? writeReport(options.out, report, ledger.warning) : null;
    if (options.json) {
      console.log(JSON.stringify({ ...report, warning: ledger.warning, reportFile: outPath }, null, 2));
    } else {
      printReport(report, ledger.warning, outPath);
    }
  } catch (error) {
    console.error(`Unable to generate zodiac daily report: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
