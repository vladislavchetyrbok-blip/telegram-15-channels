import process from "process";
import { loadLedger, summarizeLedger } from "./lib/zodiac-publish-ledger.mjs";

const VALID_STATUSES = new Set(["pending", "sent", "failed", "skipped"]);

function validateLedger() {
  const ledger = loadLedger();
  const entries = ledger.entries && typeof ledger.entries === "object" ? ledger.entries : {};
  const logicalKeys = new Map();
  const problems = [];

  for (const [key, entry] of Object.entries(entries)) {
    if (!entry || typeof entry !== "object") {
      problems.push(`Entry ${key} is not an object.`);
      continue;
    }

    const logicalKey = `${entry.date ?? ""}:${entry.slug ?? ""}`;
    if (logicalKey !== key) {
      problems.push(`Entry key mismatch: ${key} contains ${logicalKey}.`);
    }
    if (!entry.date || !/^\d{4}-\d{2}-\d{2}$/.test(String(entry.date))) {
      problems.push(`Entry ${key} has invalid date.`);
    }
    if (!entry.slug) {
      problems.push(`Entry ${key} has missing slug.`);
    }
    if (!VALID_STATUSES.has(String(entry.status || ""))) {
      problems.push(`Entry ${key} has invalid status: ${entry.status ?? "missing"}.`);
    }

    if (logicalKeys.has(logicalKey)) {
      problems.push(`Duplicate logical date+slug key: ${logicalKey}.`);
    }
    logicalKeys.set(logicalKey, key);
  }

  return problems;
}

function main() {
  console.log("=== Zodiac Publish Ledger Summary ===");
  try {
    const summary = summarizeLedger();
    const problems = validateLedger();

    console.log(`Total Entries : ${summary.totalEntries}`);
    console.log(`Sent Count    : ${summary.sentCount}`);
    console.log(`Pending Count : ${summary.pendingCount}`);
    console.log(`Failed Count  : ${summary.failedCount}`);

    if (summary.datesCovered.length > 0) {
      console.log(`Dates Covered : ${summary.datesCovered.join(", ")}`);
    } else {
      console.log("Dates Covered : none");
    }

    if (summary.slugsCovered.length > 0) {
      console.log(`Slugs Covered : ${summary.slugsCovered.join(", ")}`);
    } else {
      console.log("Slugs Covered : none");
    }

    console.log(`Problems      : ${problems.length}`);
    for (const problem of problems) {
      console.log(`- ${problem}`);
    }
    console.log("=====================================");

    if (problems.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Error reading ledger:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
