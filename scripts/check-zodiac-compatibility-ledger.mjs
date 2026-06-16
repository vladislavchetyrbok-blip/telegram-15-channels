import process from "process";
import {
  COMPATIBILITY_CONFIG_PATH,
  COMPATIBILITY_LEDGER_PATH,
  loadCompatibilityConfig,
  summarizeCompatibilityLedger,
  validateCompatibilityConfig,
  validateCompatibilityLedger,
} from "./lib/zodiac-compatibility-pipeline.mjs";

function main() {
  console.log("=== Zodiac Compatibility Ledger Summary ===");
  console.log(`Config Path  : ${COMPATIBILITY_CONFIG_PATH}`);
  console.log(`Ledger Path  : ${COMPATIBILITY_LEDGER_PATH}`);

  try {
    const config = loadCompatibilityConfig();
    const configProblems = validateCompatibilityConfig(config);
    const ledgerProblems = validateCompatibilityLedger();
    const summary = summarizeCompatibilityLedger();

    console.log(`Pair Count   : ${config.pairs.length}`);
    console.log(`Total Entries: ${summary.totalEntries}`);
    console.log(`Sent Count   : ${summary.sentCount}`);
    console.log(`Pending Count: ${summary.pendingCount}`);
    console.log(`Failed Count : ${summary.failedCount}`);
    console.log(`Dates Covered: ${summary.datesCovered.length ? summary.datesCovered.join(", ") : "none"}`);
    console.log(`Pairs Covered: ${summary.pairsCovered.length ? summary.pairsCovered.join(", ") : "none"}`);
    console.log(`Config Issues: ${configProblems.length}`);
    configProblems.forEach((problem) => console.log(`- ${problem}`));
    console.log(`Ledger Issues: ${ledgerProblems.length}`);
    ledgerProblems.forEach((problem) => console.log(`- ${problem}`));
    console.log("==========================================");

    if (configProblems.length > 0 || ledgerProblems.length > 0) process.exit(1);
  } catch (error) {
    console.error("Error checking compatibility ledger:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
