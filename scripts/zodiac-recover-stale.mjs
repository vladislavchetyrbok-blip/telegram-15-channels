import process from "process";
import {
  findStalePending,
  readLedgerForWrite,
  readLedgerReadOnly,
  validateIsoDate,
  writeLedger,
} from "./lib/zodiac-autonomy.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
    staleMinutes: 60,
    dryRun: false,
    markFailed: false,
    approved: false,
  };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--date") options.date = args[++i] ?? null;
    else if (arg === "--stale-minutes") options.staleMinutes = Number(args[++i]);
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--mark-failed") options.markFailed = true;
    else if (arg === "--approved") options.approved = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.dryRun && !options.markFailed) options.dryRun = true;
  if (options.date) {
    const dateValidation = validateIsoDate(options.date);
    if (!dateValidation.ok) errors.push(dateValidation.error);
  }
  if (!Number.isInteger(options.staleMinutes) || options.staleMinutes <= 0) {
    errors.push("--stale-minutes must be a positive integer.");
  }
  if (options.markFailed && !options.approved) {
    errors.push("--mark-failed requires --approved.");
  }

  return { options, errors };
}

function filterByDate(rows, date) {
  return date ? rows.filter((row) => row.date === date) : rows;
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const readOnlyLedger = readLedgerReadOnly();
  const staleRows = filterByDate(findStalePending(readOnlyLedger.entries, options.staleMinutes), options.date);

  console.log("=== Zodiac Stale Pending Recovery ===");
  console.log(`Date Filter             : ${options.date ?? "all"}`);
  console.log(`Stale Threshold Minutes : ${options.staleMinutes}`);
  console.log(`Mode                    : ${options.markFailed ? "MARK_FAILED" : "DRY-RUN"}`);
  console.log(`Stale Pending Count     : ${staleRows.length}`);

  for (const row of staleRows) {
    console.log(`- ${row.key}: updatedAt=${row.updatedAt ?? "missing"}`);
  }

  if (!options.markFailed) {
    console.log("Ledger Writes           : 0");
    console.log("Telegram API Calls      : 0");
    console.log("Live Publish Calls      : 0");
    console.log("=====================================");
    return;
  }

  const ledger = readLedgerForWrite();
  const now = new Date().toISOString();
  for (const row of staleRows) {
    const existing = ledger.entries[row.key];
    if (!existing || existing.status !== "pending") continue;
    ledger.entries[row.key] = {
      ...existing,
      status: "failed",
      error: `Recovered stale pending after ${options.staleMinutes} minutes.`,
      recoveredFromStalePendingAt: now,
      updatedAt: now,
    };
  }
  writeLedger(ledger);

  console.log(`Ledger Writes           : ${staleRows.length}`);
  console.log("Telegram API Calls      : 0");
  console.log("Live Publish Calls      : 0");
  console.log("=====================================");
}

main();
