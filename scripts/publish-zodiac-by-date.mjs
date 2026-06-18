import child_process from "child_process";
import process from "process";
import {
  LEDGER_PATH,
  acquireLock,
  getLedgerEntry,
  isActiveLockStatus,
  isProtectedPublishStatus,
  loadLedger,
  markFailed,
  markLocked,
  markSent,
  normalizeLedgerStatus,
  releaseLock
} from "./lib/zodiac-publish-ledger.mjs";
import { resolveZodiacWeeklyVisualAsset } from "./zodiac-weekly-asset-resolver.mjs";
import { DAILY_RETENTION_CTA_LABELS, buildZodiacNavigationKeyboard, getZodiacNavigationCtaButtons } from "./zodiac-telegram-publisher.mjs";
import { buildZodiacPost } from "./generate-zodiac-plan.mjs";
import {
  validateZodiacDailyGuidanceUniqueness,
  validateZodiacDailyOpeningUniqueness,
  validateZodiacDailyPostGuidance,
} from "./lib/zodiac-daily-guidance.mjs";
import { getCompatibilityButtonReport } from "./lib/zodiac-compatibility-bot.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
    dryRun: false,
    live: false,
    approved: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--date") options.date = args[++i];
    else if (args[i] === "--dry-run") options.dryRun = true;
    else if (args[i] === "--live") options.live = true;
    else if (args[i] === "--approved") options.approved = true;
  }
  return options;
}

const ZODIAC_SLUGS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo", 
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const SAMPLE_OUTPUT_SLUGS = new Set(["zodiac-general", "gemini", "leo"]);

function persistLedgerIfEnabled(reason) {
  if (process.env.ZODIAC_LEDGER_GIT_PERSIST !== "true") {
    return { attempted: false, committed: false };
  }

  const add = child_process.spawnSync("git", ["add", LEDGER_PATH], {
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  if (add.error || add.status !== 0) {
    throw new Error(`Failed to stage durable ledger for ${reason}.`);
  }

  const diff = child_process.spawnSync("git", ["diff", "--cached", "--quiet", "--", LEDGER_PATH], {
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  if (diff.status === 0) {
    return { attempted: true, committed: false };
  }

  const commit = child_process.spawnSync("git", ["commit", "-m", `chore(zodiac): update publish ledger [skip ci]`], {
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  if (commit.error || commit.status !== 0) {
    throw new Error(`Failed to commit durable ledger for ${reason}.`);
  }

  const push = child_process.spawnSync("git", ["push", "origin", "HEAD:main"], {
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  if (push.error || push.status !== 0) {
    throw new Error(`Failed to push durable ledger for ${reason}.`);
  }

  return { attempted: true, committed: true };
}

function runPipeline(date, slug) {
  const env = { ...process.env, ZODIAC_PUBLISH_BY_DATE_CHILD: "true" };
  const childArgs = [
    "run", "zodiac:pipeline", "--",
    "--start-date", date,
    "--days", "1",
    "--style", "luxury-mystic",
    "--channel", slug,
    "--limit", "1",
    "--live", "--approved"
  ];

  const result = child_process.spawnSync("npm", childArgs, {
    stdio: ["ignore", "pipe", "pipe"],
    env,
    shell: process.platform === "win32",
    encoding: "utf8"
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.error || result.status !== 0) {
    throw new Error(`Child process failed with status ${result.status}`);
  }

  const messageIdMatch = String(result.stdout || "").match(/message_id=([^\s]+)/);
  return { messageId: messageIdMatch?.[1] ?? null };
}

function markAndPersistFailure(date, slug, metadata, reason) {
  markFailed(date, slug, metadata);
  persistLedgerIfEnabled(reason);
}

function createReport(date, mode) {
  return {
    date,
    mode,
    expected: ZODIAC_SLUGS.length,
    published: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    duplicateBlocked: 0,
    lockedInProgress: 0,
    image: 0,
    textOnly: 0,
    fallbackTextOnly: 0,
    contentValidationErrors: [],
    ctaRowsChecked: 0,
    ctaRowsOk: 0,
    ctaErrors: [],
    ledgerWrites: 0,
    livePublishCalls: 0,
    telegramApiCalls: mode === "DRY-RUN" ? 0 : "live mode requested",
    perSlug: []
  };
}

function printSummary(report) {
  console.log("");
  console.log("=== Zodiac Publish By Date Summary ===");
  console.log(`Date                 : ${report.date}`);
  console.log(`Mode                 : ${report.mode}`);
  console.log(`Expected             : ${report.expected}`);
  console.log(`Published This Run   : ${report.published}`);
  console.log(`Already Sent         : ${report.sent}`);
  console.log(`Failed               : ${report.failed}`);
  console.log(`Skipped              : ${report.skipped}`);
  console.log(`Duplicate Blocked    : ${report.duplicateBlocked}`);
  console.log(`Locked/In Progress   : ${report.lockedInProgress}`);
  console.log(`Image Posts          : ${report.image}`);
  console.log(`TextOnly Posts       : ${report.textOnly}`);
  console.log(`Fallback/TextOnly    : ${report.fallbackTextOnly}`);
  console.log(`Content Errors       : ${report.contentValidationErrors.length}`);
  console.log(`CTA Rows Checked     : ${report.ctaRowsChecked}/${report.expected}`);
  console.log(`CTA Rows OK          : ${report.ctaRowsOk}/${report.expected}`);
  console.log(`Ledger Writes        : ${report.ledgerWrites}`);
  console.log(`Live Publish Calls   : ${report.livePublishCalls}`);
  console.log(`Telegram API Calls   : ${report.telegramApiCalls}`);
  console.log("--- Per Slug ---");
  for (const row of report.perSlug) {
    const status = row.ledgerStatus ? ` ledger=${row.ledgerStatus}` : "";
    const note = row.note ? ` ${row.note}` : "";
    console.log(`- ${row.slug}: action=${row.action}, media=${row.mediaMode}${status}${note}`);
  }
  if (report.contentValidationErrors.length > 0) {
    console.log("--- Content Validation Errors ---");
    for (const error of report.contentValidationErrors) {
      console.log(`- ${error}`);
    }
  }
  if (report.ctaErrors.length > 0) {
    console.log("--- CTA Errors ---");
    for (const error of report.ctaErrors) {
      console.log(`- ${error}`);
    }
  }
  console.log("======================================");
}

function buildDryRunContentPreview(date, slug, report) {
  const post = buildZodiacPost({ date, channelId: slug, stylePresetId: "luxury-mystic" });
  const issues = validateZodiacDailyPostGuidance(post);
  for (const issue of issues) {
    report.contentValidationErrors.push(`${slug}: ${issue}`);
  }
  return post;
}

function logSampleOutput(slug, post) {
  if (!SAMPLE_OUTPUT_SLUGS.has(slug) || !post) return;

  const preview = String(post.text || "")
    .split(/\r?\n/)
    .slice(0, 10)
    .join("\n");
  console.log(`  -> sample output (${slug}):`);
  for (const line of preview.split(/\r?\n/)) {
    console.log(`     ${line}`);
  }
}

function logCompatibilityButtonPreview(slug) {
  const report = getCompatibilityButtonReport(slug);
  console.log(`  -> compatibility mode: interactive_only`);
  console.log(`  -> compatibility start: ${report.start}`);
  console.log(`  -> compatibility target: ${report.targetType}`);
  console.log(`  -> compatibility URL: ${report.url || report.previewUrl}`);
  if (report.warning) {
    console.log(`  -> compatibility warning: ${report.warning}`);
  }
}

function main() {
  const options = parseArgs();
  
  if (!options.date) {
    console.error("Error: --date YYYY-MM-DD is required.");
    process.exit(1);
  }
  if (!options.dryRun && !options.live) {
    console.error("Error: Must specify either --dry-run or --live");
    process.exit(1);
  }
  if (options.live && !options.approved) {
    console.error("Error: --live requires --approved");
    process.exit(1);
  }

  console.log(`=== Zodiac Publish By Date Orchestrator ===`);
  console.log(`Target Date : ${options.date}`);
  console.log(`Mode        : ${options.dryRun ? "DRY-RUN" : "LIVE"}`);
  console.log(`=========================================`);
  const report = createReport(options.date, options.dryRun ? "DRY-RUN" : "LIVE");

  if (options.live) {
    try {
      acquireLock();
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  try {
    const ledger = loadLedger();
    const dryRunPreviewPosts = [];
    
    for (const slug of ZODIAC_SLUGS) {
      const entry = getLedgerEntry(ledger, options.date, slug);
      const status = normalizeLedgerStatus(entry?.status);
      
      const asset = resolveZodiacWeeklyVisualAsset(slug, options.date, "weekly");
      const mediaMode = asset.path ? "image" : "text_only";
      const mediaNote = asset.suppressed ? ` | Suppressed: ${asset.suppressionReason}` : "";
      const previewPost = options.dryRun ? buildDryRunContentPreview(options.date, slug, report) : null;
      if (previewPost) dryRunPreviewPosts.push(previewPost);
      if (mediaMode === "image") report.image++;
      else report.textOnly++;
      if (asset.fallback) report.fallbackTextOnly++;

      if (isProtectedPublishStatus(status)) {
        const action = isActiveLockStatus(status) ? "skip_locked" : "skip_duplicate";
        report.skipped++;
        report.duplicateBlocked++;
        if (status === "sent" || status === "published") report.sent++;
        if (isActiveLockStatus(status)) report.lockedInProgress++;
        report.perSlug.push({ slug, action, mediaMode, ledgerStatus: status, note: mediaNote.trim() });
        console.log(`[${action}] ${slug} | ${options.date} | Mode: ${mediaMode} | Ledger: ${status}${mediaNote}`);
        if (options.dryRun) {
          logSampleOutput(slug, previewPost);
        }
        continue;
      }

      if (status === "failed") {
        report.skipped++;
        report.failed++;
        report.perSlug.push({ slug, action: "skip_failed_requires_retry", mediaMode, ledgerStatus: status, note: mediaNote.trim() });
        console.log(`[skip_failed] ${slug} | ${options.date} | Mode: ${mediaMode} (use zodiac:retry:failed)${mediaNote}`);
        if (options.dryRun) {
          logSampleOutput(slug, previewPost);
        }
        continue;
      }

      if (options.dryRun) {
        report.perSlug.push({ slug, action: "dry_run_would_publish", mediaMode, ledgerStatus: status || "missing", note: mediaNote.trim() });
        console.log(`[dry_run_would_publish] ${slug} | ${options.date} | Mode: ${mediaMode}${mediaNote}`);
        logSampleOutput(slug, previewPost);
        
        const replyMarkup = buildZodiacNavigationKeyboard(slug, { previewCompatibilityButton: true });
        if (replyMarkup && replyMarkup.inline_keyboard) {
          const buttons = replyMarkup.inline_keyboard.flat();
          const ctaButtons = getZodiacNavigationCtaButtons(replyMarkup);
          const ctaLabels = ctaButtons.map((button) => button.text);
          const missingCtaLabels = Object.values(DAILY_RETENTION_CTA_LABELS).filter((label) => !ctaLabels.includes(label));
          report.ctaRowsChecked += 1;
          if (ctaButtons.length === Object.values(DAILY_RETENTION_CTA_LABELS).length && ctaButtons.every((button) => Boolean(button.url)) && missingCtaLabels.length === 0) {
            report.ctaRowsOk += 1;
          } else {
            report.ctaErrors.push(`${slug}: CTA buttons invalid or missing (${missingCtaLabels.join(", ") || "url missing"})`);
          }
          console.log(`  -> CTA buttons: ${ctaButtons.map(b => `${b.text}=${b.url}`).join(" | ")}`);
          console.log(`  -> button labels: ${buttons.map(b => b.text).join(" | ")}`);
          console.log(`  -> button URL presence: ${buttons.every(b => !!b.url)}`);
          console.log(`  -> reply_markup preview: ${JSON.stringify(replyMarkup)}`);
        }
        logCompatibilityButtonPreview(slug);
        
        continue;
      }

      // Live publish logic
      console.log(`[locked] ${slug} | ${options.date} | Mode: ${mediaMode}${mediaNote}`);
      markLocked(options.date, slug, {
        mediaMode,
        source: "pipeline",
        mediaSuppressed: Boolean(asset.suppressed),
        suppressionReason: asset.suppressionReason ?? null
      });
      report.ledgerWrites++;
      persistLedgerIfEnabled(`lock ${options.date}:${slug}`);

      let publishSucceeded = false;
      try {
        const publishResult = runPipeline(options.date, slug);
        publishSucceeded = true;

        console.log(`[sent] ${slug} | ${options.date}`);
        markSent(options.date, slug, {
          mediaMode,
          source: "pipeline",
          mediaSuppressed: Boolean(asset.suppressed),
          suppressionReason: asset.suppressionReason ?? null,
          messageId: publishResult.messageId,
          sentAt: new Date().toISOString()
        });
        report.ledgerWrites++;
        report.published++;
        report.livePublishCalls++;
        report.perSlug.push({ slug, action: "published", mediaMode, ledgerStatus: "sent", note: mediaNote.trim() });
        persistLedgerIfEnabled(`sent ${options.date}:${slug}`);
      } catch (err) {
        if (publishSucceeded) {
          console.error(`[durability_failed_after_send] ${slug} | ${options.date} - ${err.message}`);
          throw err;
        }

        console.error(`[failed] ${slug} | ${options.date} - Error executing pipeline`);
        markAndPersistFailure(options.date, slug, {
          mediaMode,
          source: "pipeline",
          mediaSuppressed: Boolean(asset.suppressed),
          suppressionReason: asset.suppressionReason ?? null,
          error: err.message
        }, `failed ${options.date}:${slug}`);
        report.ledgerWrites++;
        report.failed++;
        report.perSlug.push({ slug, action: "failed", mediaMode, ledgerStatus: "failed", note: mediaNote.trim() });
      }
    }
    if (options.dryRun) {
      for (const issue of validateZodiacDailyGuidanceUniqueness(dryRunPreviewPosts)) {
        report.contentValidationErrors.push(`duplicate guidance: ${issue}`);
      }
      for (const issue of validateZodiacDailyOpeningUniqueness(dryRunPreviewPosts)) {
        report.contentValidationErrors.push(`duplicate opening: ${issue}`);
      }
    }
    printSummary(report);
    if (report.contentValidationErrors.length > 0 || report.ctaErrors.length > 0) {
      process.exit(1);
    }
  } finally {
    if (options.live) {
      releaseLock();
    }
  }
}

main();
