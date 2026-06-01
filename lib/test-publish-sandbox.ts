import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { posts } from "@/data/posts";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import {
  getPostReadiness,
  hasWorkingPublicAsset,
  isChannelAssetImagePath,
  publicPathToFilePath,
} from "@/lib/post-media";
import { checkTelegramConfig } from "@/lib/telegram";

const sandboxChannelId = "ukraine-market";
const sandboxPostId = "ukraine-market-post-001";
const sandboxStatePath = path.join(process.cwd(), "data", "runtime", "test-publish-sandbox.json");
const batchSandboxStatePath = path.join(process.cwd(), "data", "runtime", "test-publish-batch-sandbox.json");

export interface TestPublishSandboxResult {
  ok: boolean;
  mode: "dry-run" | "real-test";
  telegramSent: boolean;
  telegramApiCalled: boolean;
  selectedChannelTitle: string;
  selectedPost: string;
  target: string;
  postStatus: "ready_for_test" | "test_published" | "not_ready";
  result: "ready" | "sent" | "blocked" | "failed";
  error: string | null;
  payload: {
    target: string;
    title: string;
    text: string;
    imageUrl: string;
    imageFilePath: string;
    parseMode: "HTML";
    buttons: Array<{ text: string; url: string }>;
  };
  checks: {
    channelId: boolean;
    title: boolean;
    text: boolean;
    imageUrl: boolean;
    imageFileExists: boolean;
    imageBrowserPath: boolean;
    imageIsPostAsset: boolean;
    forbiddenCurrency: number;
    readyForTest: boolean;
    realChannelsUntouched: true;
  };
  message: string;
  updatedAt: string;
}

export type TestBatchIssue =
  | "missing_post_image"
  | "broken_image_path"
  | "image_not_found"
  | "invalid_post_image_uses_channel_asset"
  | "missing_title"
  | "missing_text"
  | "forbidden_currency_detected"
  | "mojibake_detected"
  | "other";

export interface TestPublishBatchPayload {
  sourceChannelId: string;
  sourceChannelName: string;
  postId: string;
  title: string;
  text: string;
  imageUrl: string;
  imageFilePath: string;
  targetMode: "sandbox" | "test_chat" | "mock";
  target: string;
  parseMode: "HTML";
  buttons: Array<{ text: string; url: string }>;
  status: "ready_for_test" | "dry_run_success" | "test_published" | "not_ready";
  issues: TestBatchIssue[];
}

export interface TestPublishBatchResult {
  ok: boolean;
  mode: "dry-run" | "real-test";
  telegramSent: boolean;
  telegramApiCalled: boolean;
  allowRealPublish: false;
  realChannelsUntouched: true;
  totalChannels: number;
  selectedTestPosts: number;
  postImages: number;
  passedPreflight: number;
  failedPreflight: number;
  testPublished: number;
  dryRunSuccess: number;
  errors: Array<{
    channelId: string;
    channelName: string;
    postId: string | null;
    issues: TestBatchIssue[];
  }>;
  payloads: TestPublishBatchPayload[];
  message: string;
  updatedAt: string;
}

export function getTestPublishSandboxStatus() {
  const result = readSandboxState();

  return {
    ok: true,
    mode: "dry-run" as const,
    selectedChannelId: sandboxChannelId,
    selectedPost: "post-001",
    latest: result,
  };
}

export function getTestPublishBatchSandboxStatus() {
  const result = readBatchSandboxState();

  return {
    ok: true,
    mode: "dry-run" as const,
    latest: result,
  };
}

export async function runTestPublishSandbox(): Promise<TestPublishSandboxResult> {
  const timestamp = new Date().toISOString();
  const channel = channelGenerationConfigs.find((item) => item.id === sandboxChannelId);
  const post = posts.find((item) => item.id === sandboxPostId);
  const telegram = checkTelegramConfig();
  const testTarget = process.env.TELEGRAM_TEST_TARGET_CHAT_ID || "mock/test receiver";
  const realTestMode = process.env.TELEGRAM_TEST_PUBLISH_MODE === "real_test";
  const canCallTelegramApi = Boolean(
    realTestMode &&
      process.env.TELEGRAM_TEST_TARGET_CHAT_ID &&
      telegram.tokenPresent &&
      !telegram.dryRun &&
      telegram.realSendingEnabled,
  );

  const emptyPayload = {
    target: testTarget,
    title: "",
    text: "",
    imageUrl: "",
    imageFilePath: "",
    parseMode: "HTML" as const,
    buttons: [],
  };

  if (!channel || !post) {
    const result = buildResult({
      ok: false,
      mode: "dry-run",
      telegramSent: false,
      telegramApiCalled: false,
      target: testTarget,
      payload: emptyPayload,
      postStatus: "not_ready",
      result: "blocked",
      error: "Sandbox channel or post was not found.",
      checks: buildChecks({}),
      updatedAt: timestamp,
    });
    writeSandboxState(result);
    return result;
  }

  const text = post.excerpt || "";
  const imageUrl = post.imageUrl || "";
  const imageFilePath = imageUrl ? publicPathToFilePath(imageUrl) : "";
  const currency = validateCurrencyPolicy([post.title, text].join("\n"));
  const readiness = getPostReadiness({
    id: post.id,
    channelId: post.channelId,
    title: post.title,
    excerpt: text,
    imageUrl,
  });
  const checks = buildChecks({
    channelId: post.channelId === sandboxChannelId,
    title: Boolean(post.title?.trim()),
    text: Boolean(text.trim()),
    imageUrl: Boolean(imageUrl.trim()),
    imageFileExists: imageUrl ? hasWorkingPublicAsset(imageUrl) : false,
    imageBrowserPath: imageUrl.startsWith("/assets/posts/"),
    imageIsPostAsset: imageUrl.startsWith("/assets/posts/") && !isChannelAssetImagePath(imageUrl),
    forbiddenCurrency: currency.matches.length,
    readyForTest: readiness.status === "ready_for_test",
  });
  const payload = {
    target: testTarget,
    title: post.title,
    text,
    imageUrl,
    imageFilePath,
    parseMode: "HTML" as const,
    buttons: [],
  };
  const preflightOk = Object.entries(checks)
    .filter(([key]) => key !== "realChannelsUntouched")
    .every(([, value]) => (typeof value === "number" ? value === 0 : value));

  if (!preflightOk) {
    const result = buildResult({
      ok: false,
      mode: "dry-run",
      telegramSent: false,
      telegramApiCalled: false,
      target: testTarget,
      payload,
      postStatus: "not_ready",
      result: "blocked",
      error: "Post is not ready for test publication.",
      checks,
      updatedAt: timestamp,
    });
    writeSandboxState(result);
    return result;
  }

  if (!canCallTelegramApi) {
    const result = buildResult({
      ok: true,
      mode: "dry-run",
      telegramSent: false,
      telegramApiCalled: false,
      target: testTarget,
      payload,
      postStatus: "test_published",
      result: "sent",
      error: null,
      checks,
      updatedAt: timestamp,
      message: "Dry-run sandbox completed. Telegram API was not called.",
    });
    writeSandboxState(result);
    return result;
  }

  const sendResult = await sendOnlyToTestTarget({
    token: process.env.TELEGRAM_BOT_TOKEN ?? "",
    target: process.env.TELEGRAM_TEST_TARGET_CHAT_ID ?? "",
    payload,
  });
  const result = buildResult({
    ok: sendResult.ok,
    mode: "real-test",
    telegramSent: sendResult.ok,
    telegramApiCalled: true,
    target: testTarget,
    payload,
    postStatus: sendResult.ok ? "test_published" : "ready_for_test",
    result: sendResult.ok ? "sent" : "failed",
    error: sendResult.error,
    checks,
    updatedAt: timestamp,
    message: sendResult.ok
      ? "Real test send completed only to the configured test target."
      : "Real test send failed before touching production channels.",
  });
  writeSandboxState(result);
  return result;
}

export async function runTestPublishBatchSandbox(): Promise<TestPublishBatchResult> {
  const timestamp = new Date().toISOString();
  const telegram = checkTelegramConfig();
  const testTarget = process.env.TELEGRAM_TEST_TARGET_CHAT_ID || "mock/test receiver";
  const targetMode = process.env.TELEGRAM_TEST_TARGET_CHAT_ID ? "test_chat" : "mock";
  const realTestMode = process.env.TELEGRAM_TEST_PUBLISH_MODE === "real_test";
  const canCallTelegramApi = Boolean(
    realTestMode &&
      process.env.TELEGRAM_TEST_TARGET_CHAT_ID &&
      telegram.tokenPresent &&
      !telegram.dryRun &&
      telegram.realSendingEnabled,
  );
  const payloads: TestPublishBatchPayload[] = [];
  const errors: TestPublishBatchResult["errors"] = [];

  for (const channel of channelGenerationConfigs) {
    const post = selectReadyPostForChannel(channel.id);

    if (!post) {
      const issues: TestBatchIssue[] = ["other"];
      errors.push({
        channelId: channel.id,
        channelName: channel.name,
        postId: null,
        issues,
      });
      payloads.push({
        sourceChannelId: channel.id,
        sourceChannelName: channel.name,
        postId: "",
        title: "",
        text: "",
        imageUrl: "",
        imageFilePath: "",
        targetMode,
        target: testTarget,
        parseMode: "HTML",
        buttons: [],
        status: "not_ready",
        issues,
      });
      continue;
    }

    const payload = await buildBatchPayload({
      channelId: channel.id,
      channelName: channel.name,
      postId: post.id,
      title: post.title,
      text: post.excerpt ?? "",
      imageUrl: post.imageUrl ?? "",
      target: testTarget,
      targetMode,
    });
    payloads.push(payload);

    if (payload.issues.length > 0) {
      errors.push({
        channelId: channel.id,
        channelName: channel.name,
        postId: post.id,
        issues: payload.issues,
      });
    }
  }

  if (errors.length > 0) {
    const result = buildBatchResult({
      ok: false,
      mode: "dry-run",
      telegramSent: false,
      telegramApiCalled: false,
      payloads,
      errors,
      updatedAt: timestamp,
      message: "Batch preflight failed. Test publish was not started.",
    });
    writeBatchSandboxState(result);
    return result;
  }

  if (!canCallTelegramApi) {
    const completedPayloads = payloads.map((payload) => ({
      ...payload,
      status: "dry_run_success" as const,
    }));
    const result = buildBatchResult({
      ok: true,
      mode: "dry-run",
      telegramSent: false,
      telegramApiCalled: false,
      payloads: completedPayloads,
      errors: [],
      updatedAt: timestamp,
      message: "Batch dry-run completed for 15 test posts. Telegram API was not called.",
    });
    writeBatchSandboxState(result);
    return result;
  }

  const sentPayloads: TestPublishBatchPayload[] = [];
  const sendErrors: TestPublishBatchResult["errors"] = [];

  for (const payload of payloads) {
    const sendResult = await sendOnlyToTestTarget({
      token: process.env.TELEGRAM_BOT_TOKEN ?? "",
      target: process.env.TELEGRAM_TEST_TARGET_CHAT_ID ?? "",
      payload,
    });

    if (!sendResult.ok) {
      sendErrors.push({
        channelId: payload.sourceChannelId,
        channelName: payload.sourceChannelName,
        postId: payload.postId,
        issues: ["other"],
      });
    }

    sentPayloads.push({
      ...payload,
      status: sendResult.ok ? "test_published" : "ready_for_test",
    });
  }

  const result = buildBatchResult({
    ok: sendErrors.length === 0,
    mode: "real-test",
    telegramSent: sendErrors.length === 0,
    telegramApiCalled: true,
    payloads: sentPayloads,
    errors: sendErrors,
    updatedAt: timestamp,
    message:
      sendErrors.length === 0
        ? "Real test batch sent only to the configured test target."
        : "Real test batch had errors. Production channels were not touched.",
  });
  writeBatchSandboxState(result);
  return result;
}

function buildResult(
  input: Omit<TestPublishSandboxResult, "selectedChannelTitle" | "selectedPost" | "message"> & {
    message?: string;
  },
): TestPublishSandboxResult {
  return {
    selectedChannelTitle: "Україна: можливості та ринок",
    selectedPost: "post-001",
    message: input.message ?? input.error ?? "Test publish sandbox result is ready.",
    ...input,
  };
}

function buildBatchResult({
  ok,
  mode,
  telegramSent,
  telegramApiCalled,
  payloads,
  errors,
  updatedAt,
  message,
}: {
  ok: boolean;
  mode: TestPublishBatchResult["mode"];
  telegramSent: boolean;
  telegramApiCalled: boolean;
  payloads: TestPublishBatchPayload[];
  errors: TestPublishBatchResult["errors"];
  updatedAt: string;
  message: string;
}): TestPublishBatchResult {
  return {
    ok,
    mode,
    telegramSent,
    telegramApiCalled,
    allowRealPublish: false,
    realChannelsUntouched: true,
    totalChannels: channelGenerationConfigs.length,
    selectedTestPosts: payloads.filter((payload) => payload.postId).length,
    postImages: payloads.filter((payload) => payload.imageUrl && payload.issues.every((issue) => issue !== "missing_post_image" && issue !== "broken_image_path")).length,
    passedPreflight: payloads.filter((payload) => payload.issues.length === 0).length,
    failedPreflight: payloads.filter((payload) => payload.issues.length > 0).length,
    testPublished: payloads.filter((payload) => payload.status === "test_published").length,
    dryRunSuccess: payloads.filter((payload) => payload.status === "dry_run_success").length,
    errors,
    payloads,
    message,
    updatedAt,
  };
}

function buildChecks(partial: Partial<TestPublishSandboxResult["checks"]>): TestPublishSandboxResult["checks"] {
  return {
    channelId: false,
    title: false,
    text: false,
    imageUrl: false,
    imageFileExists: false,
    imageBrowserPath: false,
    imageIsPostAsset: false,
    forbiddenCurrency: 1,
    readyForTest: false,
    realChannelsUntouched: true,
    ...partial,
  };
}

function selectReadyPostForChannel(channelId: string) {
  return posts
    .filter((post) => post.channelId === channelId)
    .sort((left, right) => {
      const leftPreferred = left.id.endsWith("post-001") ? 0 : 1;
      const rightPreferred = right.id.endsWith("post-001") ? 0 : 1;

      return leftPreferred - rightPreferred;
    })
    .find((post) => {
      const readiness = getPostReadiness({
        id: post.id,
        channelId: post.channelId,
        title: post.title,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
      });

      return readiness.status === "ready_for_test";
    });
}

async function buildBatchPayload({
  channelId,
  channelName,
  postId,
  title,
  text,
  imageUrl,
  target,
  targetMode,
}: {
  channelId: string;
  channelName: string;
  postId: string;
  title: string;
  text: string;
  imageUrl: string;
  target: string;
  targetMode: TestPublishBatchPayload["targetMode"];
}): Promise<TestPublishBatchPayload> {
  const imageFilePath = imageUrl ? publicPathToFilePath(imageUrl) : "";
  const readiness = getPostReadiness({
    id: postId,
    channelId,
    title,
    excerpt: text,
    imageUrl,
  });
  const currency = validateCurrencyPolicy([title, text].join("\n"));
  const imageFileExists = imageUrl ? hasWorkingPublicAsset(imageUrl) : false;
  const imageBrowserOk = imageUrl ? await checkLocalAssetUrl(imageUrl) : false;
  const issues: TestBatchIssue[] = [];

  if (!channelId || !channelName) issues.push("other");
  if (!title.trim()) issues.push("missing_title");
  if (!text.trim()) issues.push("missing_text");
  if (!imageUrl.trim()) issues.push("missing_post_image");
  if (isChannelAssetImagePath(imageUrl)) issues.push("invalid_post_image_uses_channel_asset");
  if (imageUrl && (!imageFileExists || !imageBrowserOk)) issues.push("broken_image_path");
  if (currency.matches.length > 0) issues.push("forbidden_currency_detected");
  if (readiness.status !== "ready_for_test") {
    for (const reason of readiness.reasons) {
      if (reason !== "missing_channel" && reason !== "test_publish_required") {
        issues.push(reason);
      }
    }
  }

  return {
    sourceChannelId: channelId,
    sourceChannelName: channelName,
    postId,
    title,
    text,
    imageUrl,
    imageFilePath,
    targetMode,
    target,
    parseMode: "HTML",
    buttons: [],
    status: issues.length ? "not_ready" : "ready_for_test",
    issues: Array.from(new Set(issues)),
  };
}

function readSandboxState(): TestPublishSandboxResult | null {
  if (!existsSync(sandboxStatePath)) {
    return null;
  }

  return JSON.parse(readFileSync(sandboxStatePath, "utf8")) as TestPublishSandboxResult;
}

function readBatchSandboxState(): TestPublishBatchResult | null {
  if (!existsSync(batchSandboxStatePath)) {
    return null;
  }

  return JSON.parse(readFileSync(batchSandboxStatePath, "utf8")) as TestPublishBatchResult;
}

function writeSandboxState(result: TestPublishSandboxResult) {
  mkdirSync(path.dirname(sandboxStatePath), { recursive: true });
  writeFileSync(sandboxStatePath, JSON.stringify(result, null, 2), "utf8");
}

function writeBatchSandboxState(result: TestPublishBatchResult) {
  mkdirSync(path.dirname(batchSandboxStatePath), { recursive: true });
  writeFileSync(batchSandboxStatePath, JSON.stringify(result, null, 2), "utf8");
}

async function checkLocalAssetUrl(publicPath: string) {
  if (!publicPath.startsWith("/assets/posts/")) {
    return false;
  }

  try {
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const response = await fetch(new URL(publicPath, appUrl), { cache: "no-store" });

    return response.ok;
  } catch {
    return false;
  }
}

async function sendOnlyToTestTarget({
  token,
  target,
  payload,
}: {
  token: string;
  target: string;
  payload: TestPublishSandboxResult["payload"];
}) {
  if (!token || !target) {
    return { ok: false, error: "Test target or token is missing." };
  }

  const imageBuffer = readFileSync(payload.imageFilePath);
  const form = new FormData();
  form.set("chat_id", target);
  form.set("document", new Blob([imageBuffer], { type: "image/svg+xml" }), path.basename(payload.imageFilePath));
  form.set("caption", `<b>${escapeTelegramHtml(payload.title)}</b>\n\n${escapeTelegramHtml(payload.text)}`);
  form.set("parse_mode", payload.parseMode);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return { ok: false, error: body || `Telegram API returned ${response.status}` };
  }

  return { ok: true, error: null };
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
