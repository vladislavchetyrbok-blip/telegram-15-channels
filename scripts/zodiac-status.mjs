import process from "process";
import { resolveZodiacWeeklyVisualAsset } from "./zodiac-weekly-asset-resolver.mjs";
import {
  CHANNEL_TARGET_ENV_BY_SLUG,
  ZODIAC_SLUGS,
  findStalePending,
  getKyivDate,
  loadLocalEnvFiles,
  readLedgerReadOnly,
  summarizeDate,
  summarizeLedger,
  validateIsoDate,
} from "./lib/zodiac-autonomy.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: getKyivDate(0),
    staleMinutes: 60,
  };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--date") {
      options.date = args[++i] ?? null;
    } else if (arg === "--stale-minutes") {
      options.staleMinutes = Number(args[++i]);
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  const dateValidation = validateIsoDate(options.date);
  if (!dateValidation.ok) errors.push(dateValidation.error);
  if (!Number.isInteger(options.staleMinutes) || options.staleMinutes <= 0) {
    errors.push("--stale-minutes must be a positive integer.");
  }

  return { options, errors };
}

function summarizeAssets(date) {
  const rows = ZODIAC_SLUGS.map((slug) => {
    const asset = resolveZodiacWeeklyVisualAsset(slug, date, "weekly");
    return {
      slug,
      mediaMode: asset.path ? "image" : "text_only",
      weekday: asset.weekday ?? "unknown",
      ok: asset.ok,
      suppressed: Boolean(asset.suppressed),
      suppressionReason: asset.suppressionReason ?? null,
    };
  });

  return {
    imageCount: rows.filter((row) => row.mediaMode === "image").length,
    textOnlyCount: rows.filter((row) => row.mediaMode === "text_only").length,
    missingImageSlugs: rows.filter((row) => row.mediaMode === "text_only" && !row.suppressed).map((row) => row.slug),
    suppressedMediaSlugs: rows
      .filter((row) => row.mediaMode === "text_only" && row.suppressed)
      .map((row) => `${row.slug} (${row.suppressionReason})`),
  };
}

function countConfiguredTargets() {
  return ZODIAC_SLUGS.filter((slug) => {
    const envName = CHANNEL_TARGET_ENV_BY_SLUG[slug];
    return envName && String(process.env[envName] || "").trim();
  }).length;
}

function isBotTokenConfigured() {
  return Boolean(String(process.env.TELEGRAM_BOT_TOKEN || "").trim());
}

function main() {
  loadLocalEnvFiles();
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const ledger = readLedgerReadOnly();
  const ledgerSummary = summarizeLedger(ledger.entries);
  const dateSummary = summarizeDate(ledger.entries, options.date);
  const assetSummary = summarizeAssets(options.date);
  const stalePending = findStalePending(ledger.entries, options.staleMinutes);
  const configuredTargets = countConfiguredTargets();
  const botTokenConfigured = isBotTokenConfigured();

  console.log("=== Zodiac Autonomy Status ===");
  console.log(`Date                    : ${options.date}`);
  console.log(`Ledger Entries          : ${ledgerSummary.totalEntries}`);
  console.log(`Ledger Sent             : ${ledgerSummary.sentCount}`);
  console.log(`Ledger Pending          : ${ledgerSummary.pendingCount}`);
  console.log(`Ledger Failed           : ${ledgerSummary.failedCount}`);
  console.log(`Dates Covered           : ${ledgerSummary.datesCovered.length ? ledgerSummary.datesCovered.join(", ") : "none"}`);
  console.log(`Channel Targets         : ${configuredTargets}/${ZODIAC_SLUGS.length} configured (values hidden)`);
  console.log(`Bot Token               : ${botTokenConfigured ? "configured (value hidden)" : "missing"}`);
  console.log(`Expected Today          : ${dateSummary.expectedCount}`);
  console.log(`Sent Today              : ${dateSummary.sentCount}`);
  console.log(`Failed Today            : ${dateSummary.failedCount}`);
  console.log(`Pending Today           : ${dateSummary.pendingCount}`);
  console.log(`Locked/InProgress Today : ${dateSummary.lockedInProgressCount}`);
  console.log(`Skipped/Missing Today   : ${dateSummary.skippedCount}`);
  console.log(`Image Assets Today      : ${assetSummary.imageCount}`);
  console.log(`TextOnly Assets Today   : ${assetSummary.textOnlyCount}`);
  console.log(`Missing Image Slugs     : ${assetSummary.missingImageSlugs.length ? assetSummary.missingImageSlugs.join(", ") : "none"}`);
  console.log(`Suppressed Media Slugs  : ${assetSummary.suppressedMediaSlugs.length ? assetSummary.suppressedMediaSlugs.join(", ") : "none"}`);
  console.log(`Stale Pending Threshold : ${options.staleMinutes} minutes`);
  console.log(`Stale Pending Count     : ${stalePending.length}`);
  console.log("Telegram API Calls      : 0");
  console.log("Live Publish Calls      : 0");
  console.log("Ledger Writes           : 0");
  if (ledger.warning) console.log(`Warning                 : ${ledger.warning}`);
  console.log("==============================");
}

main();
