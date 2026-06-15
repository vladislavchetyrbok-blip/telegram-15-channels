import process from "process";
import {
  getLedgerEntry,
  isActiveLockStatus,
  isProtectedPublishStatus,
  loadLedger,
  normalizeLedgerStatus
} from "./lib/zodiac-publish-ledger.mjs";
import { resolveZodiacWeeklyVisualAsset } from "./zodiac-weekly-asset-resolver.mjs";

const ZODIAC_SLUGS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo", 
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { date: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--date") {
      options.date = args[++i];
    }
  }
  return options;
}

function main() {
  const options = parseArgs();
  if (!options.date) {
    console.error("Error: --date YYYY-MM-DD is required.");
    process.exit(1);
  }

  const ledger = loadLedger();
  
  const report = {
    date: options.date,
    totalSlugs: ZODIAC_SLUGS.length,
    sentCount: 0,
    pendingCount: 0,
    lockedInProgressCount: 0,
    failedCount: 0,
    missingLedgerCount: 0,
    protectedSkippedCount: 0,
    imageCount: 0,
    textOnlyCount: 0,
    missingExactImageList: [],
    suppressedMediaList: [],
    wouldPublishList: [],
    duplicateProtectedList: []
  };

  for (const slug of ZODIAC_SLUGS) {
    const entry = getLedgerEntry(ledger, options.date, slug);
    const status = normalizeLedgerStatus(entry?.status);

    if (status === "sent" || status === "published") report.sentCount++;
    else if (isActiveLockStatus(status)) {
      report.pendingCount++;
      report.lockedInProgressCount++;
    }
    else if (status === "failed") report.failedCount++;
    else report.missingLedgerCount++;

    if (isProtectedPublishStatus(status)) {
      report.protectedSkippedCount++;
      report.duplicateProtectedList.push(slug);
    } else {
      report.wouldPublishList.push(slug);
    }

    const asset = resolveZodiacWeeklyVisualAsset(slug, options.date, "weekly");
    if (asset.path) {
      report.imageCount++;
    } else {
      report.textOnlyCount++;
      if (asset.suppressed) {
        report.suppressedMediaList.push(`${slug} (${asset.suppressionReason})`);
      } else {
        report.missingExactImageList.push(slug);
      }
    }
  }

  console.log("=== Zodiac Publish Date Health Check ===");
  console.log(`Date                   : ${report.date}`);
  console.log(`Total Slugs            : ${report.totalSlugs}`);
  console.log(`Sent Count             : ${report.sentCount}`);
  console.log(`Pending Count          : ${report.pendingCount}`);
  console.log(`Locked/InProgress Count: ${report.lockedInProgressCount}`);
  console.log(`Failed Count           : ${report.failedCount}`);
  console.log(`Missing Ledger Count   : ${report.missingLedgerCount}`);
  console.log(`Protected/Skipped      : ${report.protectedSkippedCount}`);
  console.log(`Image Count            : ${report.imageCount}`);
  console.log(`Text Only Count        : ${report.textOnlyCount}`);
  
  console.log("\n--- Missing Exact Image List ---");
  console.log(report.missingExactImageList.length > 0 ? report.missingExactImageList.join(", ") : "none");

  console.log("\n--- Suppressed Media List ---");
  console.log(report.suppressedMediaList.length > 0 ? report.suppressedMediaList.join(", ") : "none");
  
  console.log("\n--- Duplicate Protected List (Skipped) ---");
  console.log(report.duplicateProtectedList.length > 0 ? report.duplicateProtectedList.join(", ") : "none");

  console.log("\n--- Would Publish List ---");
  console.log(report.wouldPublishList.length > 0 ? report.wouldPublishList.join(", ") : "none");
  
  console.log("\n=========================================");
}

main();
