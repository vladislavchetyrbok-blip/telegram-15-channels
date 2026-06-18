import fs from "fs";
import path from "path";
import process from "process";
import {
  generateWeeklyPosts,
  getWeeklyLedgerEntry,
  getWeeklyTelegramTargetEnv,
  isProtectedWeeklyStatus,
  loadWeeklyLedger,
  markWeeklyEntry,
  normalizeWeeklyStatus,
  validateWeeklyPostQuality,
} from "./lib/zodiac-weekly-pipeline.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { week: null, dryRun: false, live: false, approved: false };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--week") options.week = args[++index] ?? null;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--live") options.live = true;
    else if (arg === "--approved") options.approved = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.week) errors.push("Missing --week YYYY-Www.");
  if (!options.dryRun && !options.live) options.dryRun = true;
  if (options.dryRun && options.live) errors.push("Use either --dry-run or --live, not both.");
  if (options.live && !options.approved) errors.push("Live mode requires --approved.");

  return { options, errors };
}

function createReport(plan, mode) {
  return {
    week: plan.week,
    period: `${plan.startDate} -> ${plan.endDate}`,
    weekRange: plan.weekRange,
    mode,
    expected: plan.posts.length,
    wouldPublish: 0,
    published: 0,
    failed: 0,
    skipped: 0,
    duplicateBlocked: 0,
    weeklyRangeMatched: 0,
    weeklyRangeMissing: 0,
    ctaRowsChecked: 0,
    ctaRowsOk: 0,
    ctaErrors: [],
    contentQualityErrors: [],
    image: 0,
    textOnly: 0,
    ledgerWrites: 0,
    livePublishCalls: 0,
    telegramApiCalls: mode === "DRY-RUN" ? 0 : "live mode requested",
    perSlug: [],
  };
}

function printSummary(report) {
  console.log("");
  console.log("=== Zodiac Weekly Publish Summary ===");
  console.log(`Week                 : ${report.week}`);
  console.log(`Period               : ${report.period}`);
  console.log(`Week Range           : ${report.weekRange}`);
  console.log(`Mode                 : ${report.mode}`);
  console.log(`Expected             : ${report.expected}`);
  console.log(`Would Publish        : ${report.wouldPublish}`);
  console.log(`Published This Run   : ${report.published}`);
  console.log(`Failed               : ${report.failed}`);
  console.log(`Skipped              : ${report.skipped}`);
  console.log(`Duplicate Blocked    : ${report.duplicateBlocked}`);
  console.log(`Weekly Range Lines   : ${report.weeklyRangeMatched}/${report.expected}`);
  console.log(`Weekly Range Missing : ${report.weeklyRangeMissing}`);
  console.log(`CTA Rows Checked     : ${report.ctaRowsChecked}/${report.expected}`);
  console.log(`CTA Rows OK          : ${report.ctaRowsOk}/${report.expected}`);
  console.log(`Content Errors       : ${report.contentQualityErrors.length}`);
  console.log(`Image Posts          : ${report.image}`);
  console.log(`TextOnly Posts       : ${report.textOnly}`);
  console.log(`Ledger Writes        : ${report.ledgerWrites}`);
  console.log(`Live Publish Calls   : ${report.livePublishCalls}`);
  console.log(`Telegram API Calls   : ${report.telegramApiCalls}`);
  console.log("--- Per Slug ---");
  for (const row of report.perSlug) {
    console.log(`- ${row.slug}: action=${row.action}, media=${row.mediaMode}, ledger=${row.ledgerStatus}, range=${row.firstLineStatus}, buttons=${row.buttonStatus}`);
  }
  if (report.ctaErrors.length > 0) {
    console.log("--- CTA Errors ---");
    for (const error of report.ctaErrors) {
      console.log(`- ${error}`);
    }
  }
  if (report.contentQualityErrors.length > 0) {
    console.log("--- Content Quality Errors ---");
    for (const error of report.contentQualityErrors) {
      console.log(`- ${error}`);
    }
  }
  console.log("=====================================");
}

function loadLocalEnvForLive() {
  for (const fileName of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(path.resolve(process.cwd(), fileName));
    } catch {
      // Optional local env files may be absent in CI or operator environments.
    }
  }
}

async function postTelegramJson({ token, method, body }) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    throw new Error(result?.description || `Telegram ${method} returned HTTP ${response.status}`);
  }
  return result.result;
}

async function postTelegramPhoto({ token, chatId, post }) {
  const imageBuffer = fs.readFileSync(post.imagePath);
  const form = new FormData();
  form.set("chat_id", chatId);
  form.set("photo", new Blob([new Uint8Array(imageBuffer)], { type: "image/jpeg" }), path.basename(post.imagePath));
  form.set("caption", post.text);
  form.set("parse_mode", "HTML");
  form.set("reply_markup", JSON.stringify(post.keyboard));

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: "POST", body: form });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    throw new Error(result?.description || `Telegram sendPhoto returned HTTP ${response.status}`);
  }
  return result.result;
}

async function publishLivePost({ post, token }) {
  const envName = getWeeklyTelegramTargetEnv(post.slug);
  const chatId = envName ? process.env[envName]?.trim() : null;
  if (!envName) throw new Error(`Unknown Telegram target for ${post.slug}.`);
  if (!chatId) throw new Error(`${envName} is missing.`);

  if (post.imagePath) {
    return postTelegramPhoto({ token, chatId, post });
  }

  return postTelegramJson({
    token,
    method: "sendMessage",
    body: {
      chat_id: chatId,
      text: post.text,
      parse_mode: "HTML",
      reply_markup: post.keyboard,
    },
  });
}

async function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const plan = generateWeeklyPosts(options.week);
  const report = createReport(plan, options.live ? "LIVE" : "DRY-RUN");
  const ledger = loadWeeklyLedger();
  const token = options.live ? loadTokenForLive() : null;

  console.log("=== Zodiac Weekly Publish By Week ===");
  console.log(`Week        : ${plan.week}`);
  console.log(`Period      : ${plan.startDate} -> ${plan.endDate}`);
  console.log(`Week Range  : ${plan.weekRange}`);
  console.log(`Mode        : ${report.mode}`);
  console.log("=====================================");

  for (const post of plan.posts) {
    if (post.mediaMode === "image") report.image += 1;
    else report.textOnly += 1;
    const qualityErrors = validateWeeklyPostQuality(post);
    if (qualityErrors.length > 0) {
      report.contentQualityErrors.push(...qualityErrors.map((error) => `${post.slug}: ${error}`));
    }
    const firstLineHasRange = post.firstLine.includes(plan.weekRange);
    if (firstLineHasRange) report.weeklyRangeMatched += 1;
    else report.weeklyRangeMissing += 1;
    report.ctaRowsChecked += 1;
    if (post.buttonStatus.ok && post.buttonStatus.ctaLabels?.length >= 2) {
      report.ctaRowsOk += 1;
    } else {
      report.ctaErrors.push(`${post.slug}: CTA buttons invalid or missing (${post.buttonStatus.ctaLabels?.join(" | ") || "none"})`);
    }

    const entry = getWeeklyLedgerEntry(ledger, plan.week, post.slug);
    const status = normalizeWeeklyStatus(entry?.status);

    if (isProtectedWeeklyStatus(status)) {
      report.skipped += 1;
      report.duplicateBlocked += 1;
      report.perSlug.push({ slug: post.slug, action: "skip_duplicate", mediaMode: post.mediaMode, ledgerStatus: status, firstLine: post.firstLine, firstLineStatus: firstLineHasRange ? "OK" : "MISSING_RANGE", buttonStatus: post.buttonStatus.ok ? "OK" : "PROBLEMS" });
      console.log(`[skip_duplicate] ${post.slug} | ${plan.week} | Mode: ${post.mediaMode} | Ledger: ${status}`);
      continue;
    }

    if (status === "failed") {
      report.skipped += 1;
      report.failed += 1;
      report.perSlug.push({ slug: post.slug, action: "skip_failed_requires_manual_review", mediaMode: post.mediaMode, ledgerStatus: status, firstLine: post.firstLine, firstLineStatus: firstLineHasRange ? "OK" : "MISSING_RANGE", buttonStatus: post.buttonStatus.ok ? "OK" : "PROBLEMS" });
      console.log(`[skip_failed] ${post.slug} | ${plan.week} | Mode: ${post.mediaMode}`);
      continue;
    }

    if (!post.text.trim() || !post.buttonStatus.ok || !firstLineHasRange || qualityErrors.length > 0) {
      report.failed += 1;
      report.perSlug.push({ slug: post.slug, action: "failed_preflight", mediaMode: post.mediaMode, ledgerStatus: status || "missing", firstLine: post.firstLine, firstLineStatus: firstLineHasRange ? "OK" : "MISSING_RANGE", buttonStatus: post.buttonStatus.ok ? "OK" : "PROBLEMS" });
      console.log(`[failed_preflight] ${post.slug} | ${plan.week} | text/buttons/range/quality invalid`);
      continue;
    }

    if (options.dryRun) {
      report.wouldPublish += 1;
      report.perSlug.push({ slug: post.slug, action: "dry_run_would_publish", mediaMode: post.mediaMode, ledgerStatus: status || "missing", firstLine: post.firstLine, firstLineStatus: "OK", buttonStatus: "OK" });
      console.log(`[dry_run_would_publish] ${post.slug} | ${plan.week} | Mode: ${post.mediaMode}`);
      console.log(`  -> first line: ${post.firstLine}`);
      console.log(`  -> CTA buttons: ${(post.buttonStatus.ctaLabels ?? []).join(" | ")}`);
      console.log(`  -> button count: ${post.buttonStatus.buttonCount}`);
      console.log(`  -> button URL presence: ${post.keyboard.inline_keyboard.flat().every((button) => Boolean(button.url))}`);
      continue;
    }

    try {
      markWeeklyEntry(plan.week, post.slug, "locked", { mediaMode: post.mediaMode, source: "weekly-pipeline" });
      report.ledgerWrites += 1;
      const result = await publishLivePost({ post, token });
      markWeeklyEntry(plan.week, post.slug, "sent", {
        mediaMode: post.mediaMode,
        source: "weekly-pipeline",
        messageId: result?.message_id ?? null,
        sentAt: new Date().toISOString(),
      });
      report.ledgerWrites += 1;
      report.published += 1;
      report.livePublishCalls += 1;
      report.perSlug.push({ slug: post.slug, action: "published", mediaMode: post.mediaMode, ledgerStatus: "sent", firstLine: post.firstLine, firstLineStatus: "OK", buttonStatus: "OK" });
      console.log(`[sent] ${post.slug} | ${plan.week} | message_id=${result?.message_id ?? "unknown"}`);
    } catch (error) {
      markWeeklyEntry(plan.week, post.slug, "failed", { mediaMode: post.mediaMode, error: error instanceof Error ? error.message : String(error) });
      report.ledgerWrites += 1;
      report.failed += 1;
      report.perSlug.push({ slug: post.slug, action: "failed", mediaMode: post.mediaMode, ledgerStatus: "failed", firstLine: post.firstLine, firstLineStatus: firstLineHasRange ? "OK" : "MISSING_RANGE", buttonStatus: post.buttonStatus.ok ? "OK" : "PROBLEMS" });
      console.error(`[failed] ${post.slug} | ${plan.week}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  printSummary(report);
  if (report.weeklyRangeMissing > 0 || report.ctaErrors.length > 0 || report.contentQualityErrors.length > 0) {
    process.exitCode = 1;
  }
}

function loadTokenForLive() {
  loadLocalEnvForLive();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing.");
  return token;
}

main().catch((error) => {
  console.error(`Unable to process zodiac weekly publish: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
