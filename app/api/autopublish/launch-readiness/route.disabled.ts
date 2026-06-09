import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAutopublishStatus } from "@/lib/autopublish";
import { getTelegramConfig } from "@/lib/telegram";
import { getLastTelegramAccessDiagnostics } from "@/lib/telegram-diagnostics";
import { getVisualEngineStatus } from "@/lib/visuals/image-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const [autopublish, visuals] = await Promise.all([getAutopublishStatus(), getVisualEngineStatus()]);
  const telegram = getTelegramConfig();
  const access = getLastTelegramAccessDiagnostics();
  const weeklyItems = autopublish.weeklyPlanItems ?? [];
  const currentChecksOk =
    telegram.tokenStatus === "configured" &&
    Boolean(access?.getMeOk) &&
    (access?.accessOk ?? autopublish.botAccessOk) === autopublish.channelsTotal &&
    autopublish.readyPosts > 0 &&
    autopublish.postsWithoutImages === 0 &&
    autopublish.weakText === 0 &&
    autopublish.weakImage === 0 &&
    autopublish.telegramImagesOk === autopublish.weeklyPlan.total &&
    autopublish.weeklyPlan.blocked === 0 &&
    visuals.summary.premiumV2 === visuals.summary.totalImages &&
    visuals.summary.telegramImageOk === visuals.summary.totalImages &&
    visuals.summary.weak === 0 &&
    visuals.summary.providerMetadataMissing === 0;

  const captionOk = weeklyItems.every(
    (item) => item.telegramCaptionStatus === "OK" && item.telegramCaptionLength > 0 && item.telegramCaptionLength <= 900,
  );
  const mojibakeOk = weeklyItems.every((item) => !hasMojibake(`${item.title}\n${item.body}\n${item.telegramCaption}\n${item.contentTopic}`));
  const oldErrors = readHistoricalTelegramErrors();
  const oldErrorsAreHistoryOnly = oldErrors.total === 0 || (currentChecksOk && autopublish.failedToday === 0 && autopublish.blockedToday === 0);
  const imageOk = visuals.summary.totalImages > 0 && visuals.summary.telegramImageOk === visuals.summary.totalImages && visuals.summary.weak === 0;
  const textOk = autopublish.weakText === 0 && autopublish.weeklyPlan.blocked === 0;
  const botAccessOk = access?.accessOk ?? autopublish.botAccessOk;
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (telegram.tokenStatus !== "configured") blockers.push("Telegram token is not configured");
  if (!access?.getMeOk) blockers.push("Telegram getMe is not OK in the latest saved diagnostics");
  if (botAccessOk !== autopublish.channelsTotal) blockers.push(`Bot access OK ${botAccessOk}/${autopublish.channelsTotal}`);
  if (autopublish.readyPosts === 0) blockers.push("No ready posts");
  if (!imageOk) blockers.push("Premium Telegram images are not fully ready");
  if (!textOk) blockers.push("Text quality has blockers");
  if (!captionOk) blockers.push("Captions are not all OK");
  if (!mojibakeOk) blockers.push("Mojibake detected in weekly plan text");
  if (!oldErrorsAreHistoryOnly) blockers.push("Historical Telegram errors still look active");

  if (!autopublish.config.enabled) warnings.push("Autopublish is disabled. Enabling remains a separate manual action.");
  if (autopublish.scheduler.workerRunning && !autopublish.config.enabled) {
    warnings.push("Worker is running, but publishing is blocked because autopublish is disabled.");
  }
  if (!visuals.comfyui.available) warnings.push("ComfyUI is unavailable; local_template fallback is active.");
  if (oldErrors.total > 0 && oldErrorsAreHistoryOnly) warnings.push("Old IMAGE_PROCESS_FAILED/wrong chat_id entries are historical only.");

  const ready = blockers.length === 0;

  return NextResponse.json({
    ready,
    blockers,
    warnings,
    canEnableAutopublish: ready,
    safeToRunNextPost: ready,
    readyPosts: autopublish.readyPosts,
    publishedPosts: autopublish.weeklyPlan.published,
    botAccessOk,
    imageOk,
    textOk,
    captionOk,
    mojibakeOk,
    oldErrorsAreHistoryOnly,
    telegram: {
      tokenConfigured: telegram.tokenStatus === "configured",
      getMeOk: Boolean(access?.getMeOk),
      botUsername: access?.botUsername ?? null,
      accessOk: botAccessOk,
      channelsTotal: autopublish.channelsTotal,
    },
    visuals: {
      premiumV2: visuals.summary.premiumV2,
      totalImages: visuals.summary.totalImages,
      telegramImageOk: visuals.summary.telegramImageOk,
      weakImages: visuals.summary.weak,
      provider: visuals.config.imageProvider,
      fallbackProvider: visuals.config.fallbackProvider,
      fallbackUsed: false,
    },
    autopublish: {
      enabled: autopublish.config.enabled,
      workerRunning: autopublish.scheduler.workerRunning,
      schedulerStatus: !autopublish.config.enabled && autopublish.scheduler.status === "stopped" ? "stopped_by_disabled" : autopublish.scheduler.status,
      publishedToday: autopublish.todayPublished,
      failedToday: autopublish.failedToday,
      blockedToday: autopublish.blockedToday,
    },
    oldErrors,
    checkedAt: new Date().toISOString(),
    telegramSent: false,
    autopublishEnabledChanged: false,
    targetsChanged: false,
  });
}

function hasMojibake(value: string) {
  return mojibakePattern.test(value);
}

const mojibakePattern = new RegExp(
  [
    "\\u0420[\\u00A0-\\u00BF\\u0402-\\u040F\\u0452-\\u045F\\u2018-\\u201F]",
    "\\u0421[\\u00A0-\\u00BF\\u0402-\\u040F\\u0452-\\u045F\\u2018-\\u201F]",
    "\\u0432\\u0402",
    "[\\u00D0\\u00D1\\uFFFD]",
  ].join("|"),
);

function readHistoricalTelegramErrors() {
  const files = ["telegram-quick-publish.json", "telegram-quick-test.json"];
  let imageProcessFailed = 0;
  let wrongChatId = 0;

  for (const file of files) {
    const filePath = path.join(process.cwd(), "data", "runtime", file);
    if (!existsSync(filePath)) continue;
    const raw = readFileSync(filePath, "utf8");
    imageProcessFailed += count(raw, "IMAGE_PROCESS_FAILED");
    wrongChatId += count(raw, "wrong chat_id");
  }

  return {
    total: imageProcessFailed + wrongChatId,
    imageProcessFailed,
    wrongChatId,
    filesChecked: files,
  };
}

function count(value: string, needle: string) {
  let total = 0;
  let index = 0;

  while ((index = value.indexOf(needle, index)) !== -1) {
    total += 1;
    index += needle.length;
  }

  return total;
}
