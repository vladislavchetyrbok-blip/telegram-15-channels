import process from "process";
import { buildWeeklyReport } from "./lib/zodiac-weekly-pipeline.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { week: null, json: false };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--week") options.week = args[++index] ?? null;
    else if (arg === "--json") options.json = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.week) errors.push("Missing --week YYYY-Www.");
  return { options, errors };
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const { report, ledgerProblems } = buildWeeklyReport(options.week);
  if (options.json) {
    console.log(JSON.stringify({ ...report, ledgerProblems }, null, 2));
    return;
  }

  console.log("=== Zodiac Weekly Report ===");
  console.log(`Week              : ${report.week}`);
  console.log(`Period            : ${report.startDate} -> ${report.endDate}`);
  console.log(`Expected Posts    : ${report.expectedPosts}`);
  console.log(`Image Posts       : ${report.imagePosts}`);
  console.log(`TextOnly Posts    : ${report.textOnlyPosts}`);
  console.log(`Failed            : ${report.failed}`);
  console.log(`Skipped           : ${report.skipped}`);
  console.log(`Duplicate Blocked : ${report.duplicateBlocked}`);
  console.log(`Button Status     : ${report.buttonStatus}`);
  console.log(`Ledger Status     : ${report.ledgerStatus}`);
  console.log("--- Per Channel ---");
  for (const row of report.perChannel) {
    console.log(`- ${row.slug}: action=${row.action}, media=${row.mediaMode}, ledger=${row.ledgerStatus}, buttons=${row.buttonStatus} (${row.buttonCount})`);
  }
  if (ledgerProblems.length > 0) {
    console.log("--- Ledger Problems ---");
    ledgerProblems.forEach((problem) => console.log(`- ${problem}`));
  }
  console.log("============================");

  if (ledgerProblems.length > 0 || report.buttonStatus !== "OK") {
    process.exit(1);
  }
}

main();
