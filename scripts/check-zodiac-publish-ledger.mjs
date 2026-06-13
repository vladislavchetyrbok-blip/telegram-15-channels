import { summarizeLedger } from "./lib/zodiac-publish-ledger.mjs";

function main() {
  console.log("=== Zodiac Publish Ledger Summary ===");
  try {
    const summary = summarizeLedger();
    console.log(`Total Entries : ${summary.totalEntries}`);
    console.log(`Sent Count    : ${summary.sentCount}`);
    console.log(`Pending Count : ${summary.pendingCount}`);
    console.log(`Failed Count  : ${summary.failedCount}`);
    
    if (summary.datesCovered.length > 0) {
      console.log(`Dates Covered : ${summary.datesCovered.join(", ")}`);
    } else {
      console.log(`Dates Covered : none`);
    }
    
    if (summary.slugsCovered.length > 0) {
      console.log(`Slugs Covered : ${summary.slugsCovered.join(", ")}`);
    } else {
      console.log(`Slugs Covered : none`);
    }
    
    console.log("=====================================");
  } catch (error) {
    console.error("Error reading ledger:", error.message);
  }
}

main();
