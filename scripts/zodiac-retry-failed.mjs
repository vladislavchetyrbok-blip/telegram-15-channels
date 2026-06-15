import { spawnSync } from "child_process";
import process from "process";
import { resolveZodiacWeeklyVisualAsset } from "./zodiac-weekly-asset-resolver.mjs";
import { acquireLock, releaseLock, markFailed, markPending, markSent } from "./lib/zodiac-publish-ledger.mjs";
import {
  ZODIAC_SLUGS,
  getPublishKey,
  normalizeStatus,
  readLedgerReadOnly,
  validateIsoDate,
} from "./lib/zodiac-autonomy.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
    slug: null,
    dryRun: false,
    live: false,
    approved: false,
  };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--date") options.date = args[++i] ?? null;
    else if (arg === "--slug") options.slug = args[++i] ?? null;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--live") options.live = true;
    else if (arg === "--approved") options.approved = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.dryRun && !options.live) options.dryRun = true;
  if (options.dryRun && options.live) errors.push("Use either --dry-run or --live, not both.");
  if (options.live && !options.approved) errors.push("--live requires --approved.");
  const dateValidation = validateIsoDate(options.date);
  if (!dateValidation.ok) errors.push(dateValidation.error);
  if (options.slug && !ZODIAC_SLUGS.includes(options.slug)) errors.push(`Unknown zodiac slug: ${options.slug}`);

  return { options, errors };
}

function failedCandidates(entries, date, slugFilter) {
  return ZODIAC_SLUGS.filter((slug) => !slugFilter || slug === slugFilter)
    .map((slug) => ({ slug, key: getPublishKey(date, slug), entry: entries[getPublishKey(date, slug)] }))
    .filter((row) => normalizeStatus(row.entry?.status) === "failed");
}

function runPipeline(date, slug) {
  const result = spawnSync(
    "npm",
    [
      "run",
      "zodiac:pipeline",
      "--",
      "--start-date",
      date,
      "--days",
      "1",
      "--style",
      "luxury-mystic",
      "--channel",
      slug,
      "--limit",
      "1",
      "--live",
      "--approved",
    ],
    {
      stdio: "inherit",
      env: { ...process.env, ZODIAC_PUBLISH_BY_DATE_CHILD: "true" },
      shell: process.platform === "win32",
    }
  );

  if (result.error || result.status !== 0) {
    throw new Error(`Retry child pipeline failed with status ${result.status}`);
  }
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const ledger = readLedgerReadOnly();
  const candidates = failedCandidates(ledger.entries, options.date, options.slug);

  console.log("=== Zodiac Retry Failed ===");
  console.log(`Date              : ${options.date}`);
  console.log(`Mode              : ${options.dryRun ? "DRY-RUN" : "LIVE"}`);
  console.log(`Candidate Count   : ${candidates.length}`);
  console.log(`Telegram Calls    : ${options.dryRun ? 0 : "live mode requested"}`);
  console.log(`Already Sent Skip : enforced`);

  if (candidates.length === 0) {
    console.log("No failed ledger entries found for retry.");
    console.log("===========================");
    return;
  }

  for (const candidate of candidates) {
    const asset = resolveZodiacWeeklyVisualAsset(candidate.slug, options.date, "weekly");
    const mediaMode = asset.path ? "image" : "text_only";
    console.log(`- ${candidate.slug}: status=failed, retryable=yes, media=${mediaMode}`);
  }

  if (options.dryRun) {
    console.log("Ledger Writes     : 0");
    console.log("Live Publish Calls: 0");
    console.log("===========================");
    return;
  }

  let failed = 0;
  try {
    acquireLock();
    for (const candidate of candidates) {
      const asset = resolveZodiacWeeklyVisualAsset(candidate.slug, options.date, "weekly");
      const mediaMode = asset.path ? "image" : "text_only";
      markPending(options.date, candidate.slug, { mediaMode, source: "retry_failed", retryAt: new Date().toISOString() });
      try {
        runPipeline(options.date, candidate.slug);
        markSent(options.date, candidate.slug, { mediaMode, source: "retry_failed" });
      } catch (error) {
        failed++;
        markFailed(options.date, candidate.slug, {
          mediaMode,
          source: "retry_failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } finally {
    releaseLock();
  }

  console.log(`Retry Failures    : ${failed}`);
  console.log("===========================");
  process.exit(failed > 0 ? 1 : 0);
}

main();
