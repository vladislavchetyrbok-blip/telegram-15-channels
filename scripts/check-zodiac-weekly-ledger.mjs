import process from "process";
import { summarizeWeeklyLedger, validateWeeklyLedger, WEEKLY_LEDGER_PATH } from "./lib/zodiac-weekly-pipeline.mjs";

function main() {
  console.log("=== Zodiac Weekly Publish Ledger Summary ===");
  console.log(`Ledger Path   : ${WEEKLY_LEDGER_PATH}`);

  try {
    const summary = summarizeWeeklyLedger();
    const problems = validateWeeklyLedger();

    console.log(`Total Entries : ${summary.totalEntries}`);
    console.log(`Sent Count    : ${summary.sentCount}`);
    console.log(`Pending Count : ${summary.pendingCount}`);
    console.log(`Failed Count  : ${summary.failedCount}`);
    console.log(`Weeks Covered : ${summary.weeksCovered.length ? summary.weeksCovered.join(", ") : "none"}`);
    console.log(`Slugs Covered : ${summary.slugsCovered.length ? summary.slugsCovered.join(", ") : "none"}`);
    console.log(`Problems      : ${problems.length}`);
    problems.forEach((problem) => console.log(`- ${problem}`));
    console.log("===========================================");

    if (problems.length > 0) process.exit(1);
  } catch (error) {
    console.error("Error reading weekly ledger:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
