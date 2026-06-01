import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { posts } from "@/data/posts";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { getPostReadiness, hasWorkingPublicAsset, isChannelAssetImagePath } from "@/lib/post-media";
import { getTelegramConfig, maskTelegramToken } from "@/lib/telegram";
import { checkTelegramChannelAccess } from "@/lib/telegram-access";
import {
  getDefaultTelegramTestTarget,
  getTelegramChannelTargetByChannelId,
  getTelegramChannelTargetByKey,
  getTelegramChannelTargetByValue,
  getTelegramChannelTargets,
  maskTelegramTarget,
} from "@/lib/telegram-channel-targets";
import { hasBrokenText } from "@/lib/text-quality";
import { ensureTelegramImageForPost, getTelegramImageMime } from "@/lib/telegram-post-images";

const statePath = path.join(process.cwd(), "data", "runtime", "telegram-test-send.json");

export interface TelegramTestSendPayload {
  targetMode: "dry-run" | "real_single_test";
  target: string;
  method: "sendPhoto";
  postId: string;
  channelId: string;
  sourceChannelTitle: string;
  selectedChannelTitle: string;
  title: string;
  text: string;
  caption: string;
  imageUrl: string;
  imageFilePath: string;
  parseMode: "HTML";
}

export interface TelegramTestSendResult {
  ok: boolean;
  mode: "dry-run" | "real_single_test";
  telegramSent: boolean;
  telegramApiCalled: boolean;
  realMassPublishEnabled: false;
  massBroadcast: false;
  channelsTouched: 0 | 1;
  tokenMasked: string;
  testChannelConfigured: boolean;
  selectedPost: string | null;
  selectedChannelTitle: string | null;
  messageId: number | null;
  status: "dry_run_preview" | "test_published" | "blocked" | "failed";
  message: string;
  error: string | null;
  payload: TelegramTestSendPayload | null;
  checks: Array<{ key: string; ok: boolean; message: string }>;
  updatedAt: string;
}

export function getTelegramTestSendStatus() {
  const config = getTelegramConfig();
  const target = getDefaultTelegramTestTarget();

  return {
    ok: true,
    mode: config.dryRun ? "dry-run" : "real_single_test",
    telegramSent: false,
    realMassPublishEnabled: false,
    massBroadcast: false,
    tokenMasked: maskTelegramToken(),
    testChannelConfigured: Boolean(target?.target),
    selectedChannelTitle: target?.channelTitle ?? null,
    targets: getTelegramChannelTargets().map((item) => ({
      envKey: item.envKey,
      channelId: item.channelId,
      channelTitle: item.channelTitle,
      configured: item.configured,
      targetMasked: maskTelegramTarget(item.target),
    })),
    latest: readState(),
  };
}

export async function runTelegramTestSend({
  postId,
  channelId,
  targetEnvKey,
  telegramTarget,
  force = false,
}: {
  postId?: string;
  channelId?: string;
  targetEnvKey?: string;
  telegramTarget?: string;
  force?: boolean;
} = {}): Promise<TelegramTestSendResult> {
  const updatedAt = new Date().toISOString();
  const config = getTelegramConfig();
  const requestedTarget =
    getTelegramChannelTargetByKey(targetEnvKey) ??
    getTelegramChannelTargetByValue(telegramTarget) ??
    getTelegramChannelTargetByChannelId(channelId) ??
    getDefaultTelegramTestTarget();
  const testChannelId = telegramTarget?.trim() || requestedTarget?.target || "";
  const post = resolvePost({ postId, channelId });
  const checks: TelegramTestSendResult["checks"] = [];

  if (!post) {
    addCheck(checks, "post", false, "Post was not found.");

    return writeAndReturn({
      ok: false,
      mode: config.dryRun ? "dry-run" : "real_single_test",
      telegramSent: false,
      telegramApiCalled: false,
      realMassPublishEnabled: false,
      massBroadcast: false,
      channelsTouched: 0,
      tokenMasked: config.tokenMasked,
      testChannelConfigured: Boolean(testChannelId),
      selectedPost: null,
      selectedChannelTitle: requestedTarget?.channelTitle ?? null,
      messageId: null,
      status: "blocked",
      message: "Test send preflight failed.",
      error: "Post was not found.",
      payload: null,
      checks,
      updatedAt,
    });
  }

  const previous = readState();

  if (!force && wasAlreadyTestPublished(previous, post.id)) {
    addCheck(checks, "duplicateProtection", false, "Post was already test published.");

    return writeAndReturn({
      ok: false,
      mode: config.dryRun ? "dry-run" : "real_single_test",
      telegramSent: false,
      telegramApiCalled: false,
      realMassPublishEnabled: false,
      massBroadcast: false,
      channelsTouched: 0,
      tokenMasked: config.tokenMasked,
      testChannelConfigured: Boolean(testChannelId),
      selectedPost: post.id,
      selectedChannelTitle: requestedTarget?.channelTitle ?? null,
      messageId: previous?.messageId ?? null,
      status: "blocked",
      message: "Пост уже был тестово отправлен. Повторная отправка заблокирована.",
      error: "already_test_published",
      payload: null,
      checks,
      updatedAt,
    });
  }

  const text = post.excerpt || "";
  const imageUrl = post.imageUrl || "";
  const telegramImage = ensureTelegramImageForPost(post);
  const imageFilePath = telegramImage.telegramImagePath;
  const readiness = getPostReadiness({
    id: post.id,
    channelId: post.channelId,
    title: post.title,
    excerpt: text,
    imageUrl,
  });
  const currency = validateCurrencyPolicy([post.title, text].join("\n"));
  const brokenText = hasBrokenText([post.title, text].join("\n"));

  addCheck(checks, "channelId", Boolean(post.channelId.trim()), "channelId is required.");
  addCheck(checks, "title", Boolean(post.title.trim()), "Title is required.");
  addCheck(checks, "text", Boolean(text.trim()), "Text/body is required.");
  addCheck(checks, "imageUrl", Boolean(imageUrl.trim()), "Post image is required.");
  addCheck(checks, "imageFileExists", imageUrl ? hasWorkingPublicAsset(imageUrl) : false, "Post image file is missing.");
  addCheck(checks, "imageIsPostAsset", imageUrl.startsWith("/assets/posts/") && !isChannelAssetImagePath(imageUrl), "Post image must not be logo/icon/preview.");
  addCheck(checks, "telegramImageStatus", telegramImage.telegramImageStatus === "OK", telegramImage.reason ?? "Telegram-ready PNG/JPG image is required.");
  addCheck(checks, "telegramImageFile", existsSync(telegramImage.telegramImagePath), "Telegram-ready image file is missing.");
  addCheck(checks, "textEncoding", !brokenText, "Text has invalid encoding.");
  addCheck(checks, "forbiddenCurrency", currency.matches.length === 0, "Forbidden currency detected.");
  addCheck(checks, "readyForTest", readiness.status === "ready_for_test", "Post must be ready_for_test.");
  addCheck(checks, "token", config.tokenStatus === "configured" || config.dryRun, "Telegram Bot token is missing.");
  addCheck(checks, "testChannel", Boolean(testChannelId) || config.dryRun, "Telegram test channel target is missing.");
  addCheck(checks, "singleTarget", true, "Only one selected Telegram channel target can be used.");
  addCheck(checks, "massPublishDisabled", !config.realPublishEnabled, "TELEGRAM_REAL_PUBLISH_ENABLED must stay false for this test.");

  let selectedAccessError: string | null = null;

  if (!config.dryRun && testChannelId) {
    const selectedAccess = await checkTelegramChannelAccess({
      channelId: requestedTarget?.channelId ?? channelId,
      telegramTarget: testChannelId,
    });
    selectedAccessError = selectedAccess?.error ?? null;
    addCheck(checks, "botAccess", selectedAccess?.accessStatus === "ok", selectedAccess?.error ?? "Bot access was not confirmed for selected channel.");
    addCheck(checks, "botAdmin", Boolean(selectedAccess?.botAdmin), selectedAccess?.error ?? "Bot is not admin in selected channel.");
    addCheck(checks, "botCanPost", Boolean(selectedAccess?.canPost), selectedAccess?.error ?? "Bot cannot publish messages in selected channel.");
  }

  const payload: TelegramTestSendPayload = {
    targetMode: config.dryRun ? "dry-run" : "real_single_test",
    target: config.dryRun ? "dry-run preview" : maskTelegramTarget(testChannelId),
    method: "sendPhoto",
    postId: post.id,
    channelId: post.channelId,
    sourceChannelTitle: post.channelId,
    selectedChannelTitle: requestedTarget?.channelTitle ?? "Selected Telegram channel",
    title: post.title,
    text,
    caption: `<b>${escapeTelegramHtml(post.title)}</b>\n\n${escapeTelegramHtml(text)}`,
    imageUrl,
    imageFilePath,
    parseMode: "HTML",
  };
  const preflightOk = checks.every((check) => check.ok);

  if (!preflightOk) {
    return writeAndReturn({
      ok: false,
      mode: config.dryRun ? "dry-run" : "real_single_test",
      telegramSent: false,
      telegramApiCalled: false,
      realMassPublishEnabled: false,
      massBroadcast: false,
      channelsTouched: 0,
      tokenMasked: config.tokenMasked,
      testChannelConfigured: Boolean(testChannelId),
      selectedPost: post.id,
      selectedChannelTitle: requestedTarget?.channelTitle ?? null,
      messageId: null,
      status: "blocked",
      message: "Test send preflight failed.",
      error: selectedAccessError ?? checks.find((check) => !check.ok)?.message ?? "Test send preflight failed.",
      payload,
      checks,
      updatedAt,
    });
  }

  if (config.dryRun) {
    return writeAndReturn({
      ok: true,
      mode: "dry-run",
      telegramSent: false,
      telegramApiCalled: false,
      realMassPublishEnabled: false,
      massBroadcast: false,
      channelsTouched: 0,
      tokenMasked: config.tokenMasked,
      testChannelConfigured: Boolean(testChannelId),
      selectedPost: post.id,
      selectedChannelTitle: requestedTarget?.channelTitle ?? null,
      messageId: null,
      status: "dry_run_preview",
      message: "Dry-run preview prepared. Telegram API was not called.",
      error: null,
      payload,
      checks,
      updatedAt,
    });
  }

  const sendResult = await sendPhotoToSelectedChannel({
    token: process.env.TELEGRAM_BOT_TOKEN ?? "",
    testChannelId,
    payload,
  });

  return writeAndReturn({
    ok: sendResult.ok,
    mode: "real_single_test",
    telegramSent: sendResult.ok,
    telegramApiCalled: true,
    realMassPublishEnabled: false,
    massBroadcast: false,
    channelsTouched: sendResult.ok ? 1 : 0,
    tokenMasked: config.tokenMasked,
    testChannelConfigured: Boolean(testChannelId),
    selectedPost: post.id,
    selectedChannelTitle: requestedTarget?.channelTitle ?? null,
    messageId: sendResult.messageId,
    status: sendResult.ok ? "test_published" : "failed",
    message: sendResult.ok
      ? "1 тестовый пост отправлен. Проверь Telegram. Если не нужен — удали вручную."
      : "Telegram test send failed.",
    error: sendResult.error,
    payload,
    checks,
    updatedAt,
  });
}

function resolvePost({ postId, channelId }: { postId?: string; channelId?: string }) {
  if (postId) {
    return posts.find((post) => post.id === postId);
  }

  if (channelId) {
    return posts.find((post) => post.channelId === channelId && getPostReadiness({
      id: post.id,
      channelId: post.channelId,
      title: post.title,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl,
    }).status === "ready_for_test");
  }

  return posts.find((post) => post.id === "ukraine-market-post-001") ?? posts[0];
}

async function sendPhotoToSelectedChannel({
  token,
  testChannelId,
  payload,
}: {
  token: string;
  testChannelId: string;
  payload: TelegramTestSendPayload;
}) {
  if (!token || !testChannelId) {
    return { ok: false, messageId: null, error: "Telegram token or test channel target is missing." };
  }

  if (!existsSync(payload.imageFilePath)) {
    return { ok: false, messageId: null, error: "Image file missing." };
  }

  try {
    const imageBuffer = readFileSync(payload.imageFilePath);
    const form = new FormData();
    form.set("chat_id", testChannelId);
    form.set("photo", new Blob([new Uint8Array(imageBuffer)], { type: getTelegramImageMime(payload.imageFilePath) }), path.basename(payload.imageFilePath));
    form.set("caption", payload.caption);
    form.set("parse_mode", payload.parseMode);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      body: form,
    });
    const body = await response.json().catch(() => null) as TelegramApiSendPhotoResponse | null;

    if (!response.ok || !body?.ok) {
      return { ok: false, messageId: null, error: friendlyTelegramError(body?.description || `Telegram API returned ${response.status}`) };
    }

    return { ok: true, messageId: body.result?.message_id ?? null, error: null };
  } catch (error) {
    return { ok: false, messageId: null, error: error instanceof Error ? friendlyTelegramError(error.message) : "Telegram API error." };
  }
}

function addCheck(checks: TelegramTestSendResult["checks"], key: string, ok: boolean, message: string) {
  checks.push({ key, ok, message: ok ? "ok" : message });
}

function readState(): TelegramTestSendResult | null {
  if (!existsSync(statePath)) {
    return null;
  }

  return JSON.parse(readFileSync(statePath, "utf8")) as TelegramTestSendResult;
}

function writeAndReturn(result: TelegramTestSendResult) {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(result, null, 2), "utf8");

  return result;
}

function wasAlreadyTestPublished(previous: TelegramTestSendResult | null, postId: string) {
  return (
    previous?.selectedPost === postId &&
    (previous.status === "test_published" || previous.ok || Boolean(previous.messageId))
  );
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function friendlyTelegramError(value: string) {
  const sanitized = sanitizeTelegramError(value);
  const lower = sanitized.toLowerCase();

  if (lower.includes("not enough rights") || lower.includes("administrator")) return "bot is not admin or does not have enough rights in the selected channel.";
  if (lower.includes("chat not found")) return "chat not found. Check selected Telegram channel target.";
  if (lower.includes("chat_id") || lower.includes("bad request")) return `Telegram API error: ${sanitized}. Possible wrong chat_id.`;
  if (lower.includes("unauthorized") || lower.includes("token")) return "token invalid or Telegram Bot API rejected the token.";
  if (lower.includes("caption") && lower.includes("too long")) return "caption too long. Shorten title/text before test send.";
  if (lower.includes("image") || lower.includes("photo")) return `Telegram API image error: ${sanitized}`;

  return `Telegram API error: ${sanitized}`;
}

function sanitizeTelegramError(value: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return value;
  }

  return value.replaceAll(token, maskTelegramToken(token));
}

interface TelegramApiSendPhotoResponse {
  ok: boolean;
  description?: string;
  result?: {
    message_id?: number;
  };
}
