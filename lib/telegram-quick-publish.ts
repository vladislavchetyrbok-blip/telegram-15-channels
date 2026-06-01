import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { posts } from "@/data/posts";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { getPostReadiness, isChannelAssetImagePath } from "@/lib/post-media";
import { checkTelegramChannelAccess } from "@/lib/telegram-access";
import { getTelegramConfig, maskTelegramToken } from "@/lib/telegram";
import { listTelegramTargetBindings, seedTelegramTargetsFromKnownChatIds } from "@/lib/telegram-target-store";
import { hasBrokenText, isFailedGenerationText } from "@/lib/text-quality";
import { ensureTelegramImageForPost, getTelegramImageMime, inspectTelegramImage } from "@/lib/telegram-post-images";
import { evaluatePostQuality } from "@/lib/post-quality";
import { buildTelegramCaption, telegramCaptionSafeLimit } from "@/lib/telegram-caption";
import type { Post } from "@/types";

const statePath = path.join(process.cwd(), "data", "runtime", "telegram-quick-publish.json");
const testSendStatePath = path.join(process.cwd(), "data", "runtime", "telegram-test-send.json");
const maxTelegramPhotoCaptionLength = telegramCaptionSafeLimit;

export type QuickPublishMode = "quick_publish" | "retry_failed" | "continue_queue" | "autopublish";
type QuickPublishStatus =
  | "ready_to_publish"
  | "published"
  | "failed"
  | "skipped"
  | "already_published"
  | "blocked"
  | "no_ready_posts"
  | "target_missing"
  | "bot_access_failed"
  | "image_missing"
  | "text_broken"
  | "forbidden_currency";
type QuickPublishResultValue = "success" | "failed" | "skipped" | "blocked" | "already_published" | null;
type QuickPublishLogResult = Exclude<QuickPublishResultValue, null>;

export interface TelegramQuickPublishItem {
  channelId: string;
  channelName: string;
  telegramTarget: string;
  selectedPost: string | null;
  selectedPostTitle: string | null;
  imagePath: string | null;
  telegramImagePath: string | null;
  telegramImageStatus: string;
  botAccess: string;
  imageStatus: string;
  textStatus: string;
  status: QuickPublishStatus;
  blockerReason: string | null;
  lastSendAt: string | null;
  telegramMessageId: number | null;
  telegramPublishedAt: string | null;
  publishResult: QuickPublishResultValue;
  publishError: string | null;
}

export interface TelegramQuickPublishLogEntry {
  id: string;
  channelId: string;
  channelName: string;
  telegramTarget: string;
  postId: string | null;
  title: string | null;
  imagePath: string | null;
  telegramImagePath: string | null;
  telegramImageStatus: string | null;
  attemptedAt: string;
  result: QuickPublishLogResult;
  telegramMessageId: number | null;
  error: string | null;
  mode: QuickPublishMode;
}

export interface TelegramPublishingCenterStatus {
  ok: boolean;
  channelsTotal: 15;
  linkedTargets: number;
  botAccessOk: number;
  readyPosts: number;
  published: number;
  errors: number;
  skipped: number;
  alreadyPublished: number;
  remainingInQueue: number;
  maxPostsPerRun: 15;
  maxPostsPerChannel: 1;
  realMassPublishEnabled: false;
  autopostingDisabled: true;
  allowRealPublish: false;
  queue: TelegramQuickPublishItem[];
  publishLog: TelegramQuickPublishLogEntry[];
  lastResult: TelegramQuickPublishResult | null;
  updatedAt: string;
}

export interface TelegramQuickPublishResult {
  ok: boolean;
  confirmed: boolean;
  mode: QuickPublishMode;
  channelsTotal: 15;
  linkedTargets: number;
  botAccessOk: number;
  readyPosts: number;
  published: number;
  errors: number;
  skippedTotal: number;
  alreadyPublishedTotal: number;
  remainingInQueue: number;
  readyToPublish: number;
  publishedSuccess: number;
  failed: number;
  skipped: number;
  alreadyPublished: number;
  maxPostsPerRun: 15;
  maxPostsPerChannel: 1;
  realMassPublishEnabled: false;
  autopostingDisabled: true;
  allowRealPublish: false;
  seededTargets: number;
  items: TelegramQuickPublishItem[];
  queue: TelegramQuickPublishItem[];
  publishLog: TelegramQuickPublishLogEntry[];
  message: string;
  updatedAt: string;
}

interface QuickPublishRuntimeState {
  publishedPostIds: Record<string, {
    channelId: string;
    telegramMessageId: number | null;
    telegramPublishedAt: string;
    telegramTarget: string;
    publishResult: "success";
  }>;
  publishLog: TelegramQuickPublishLogEntry[];
  lastResult: TelegramQuickPublishResult | null;
}

export async function getTelegramQuickPublishStatus(): Promise<TelegramPublishingCenterStatus> {
  const state = readState();
  const queue = await buildPublishingQueue(state);
  const counters = buildCounters(queue, state);

  return {
    ok: queue.some((item) => item.status === "ready_to_publish"),
    channelsTotal: 15,
    ...counters,
    maxPostsPerRun: 15,
    maxPostsPerChannel: 1,
    realMassPublishEnabled: false,
    autopostingDisabled: true,
    allowRealPublish: false,
    queue,
    publishLog: state.publishLog.slice(-100).reverse(),
    lastResult: state.lastResult,
    updatedAt: new Date().toISOString(),
  };
}

export async function runTelegramQuickPublish({
  confirmed,
  mode = "quick_publish",
  channelIds,
}: {
  confirmed: boolean;
  mode?: QuickPublishMode;
  channelIds?: string[];
}): Promise<TelegramQuickPublishResult> {
  const updatedAt = new Date().toISOString();
  const seeded = seedTelegramTargetsFromKnownChatIds();
  const state = readState();
  const items: TelegramQuickPublishItem[] = [];
  const bindings = listTelegramTargetBindings().filter((binding) => !channelIds?.length || channelIds.includes(binding.channelId));

  if (!confirmed) {
    const queue = await buildPublishingQueue(state);
    const counters = buildCounters(queue, state);

    return persistResult(state, {
      ok: false,
      confirmed: false,
      mode,
      channelsTotal: 15,
      ...counters,
      readyToPublish: 0,
      publishedSuccess: 0,
      failed: 0,
      skipped: 15,
      skippedTotal: 15,
      alreadyPublished: 0,
      alreadyPublishedTotal: 0,
      maxPostsPerRun: 15,
      maxPostsPerChannel: 1,
      realMassPublishEnabled: false,
      autopostingDisabled: true,
      allowRealPublish: false,
      seededTargets: seeded.created,
      items: bindings.map((binding) =>
        buildItem({
          channelId: binding.channelId,
          channelName: binding.channelTitle,
          telegramTarget: binding.telegramTarget,
          status: "blocked",
          result: "blocked",
          reason: "confirmation required",
        }),
      ),
      queue,
      publishLog: state.publishLog.slice(-100),
      message: "РџРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ РЅРµ РїРѕР»СѓС‡РµРЅРѕ. РџСѓР±Р»РёРєР°С†РёСЏ РЅРµ Р·Р°РїСѓСЃРєР°Р»Р°СЃСЊ.",
      updatedAt,
    });
  }

  for (const binding of bindings) {
    const planned = await buildQueueItemForChannel(state, binding, mode);

    if (planned.status !== "ready_to_publish" || !planned.selectedPost) {
      const item = {
        ...planned,
        publishResult: planned.publishResult ?? statusToResult(planned.status),
      };
      items.push(item);
      appendPublishLog(state, item, updatedAt, mode);
      continue;
    }

    const post = posts.find((item) => item.id === planned.selectedPost);

    if (!post) {
      const item = {
        ...planned,
        status: "no_ready_posts" as const,
        publishResult: "skipped" as const,
        publishError: "post not found",
        blockerReason: "post not found",
      };
      items.push(item);
      appendPublishLog(state, item, updatedAt, mode);
      continue;
    }

    const send = await sendPhotoToTelegramChannel({
      token: process.env.TELEGRAM_BOT_TOKEN ?? "",
      telegramTarget: planned.telegramTarget,
      title: post.title,
      text: post.excerpt,
      caption: buildTelegramCaption({ title: post.title, body: post.excerpt }).caption,
      imageFilePath: planned.telegramImagePath ?? ensureTelegramImageForPost(post).telegramImagePath,
    });
    const sentAt = send.ok ? new Date().toISOString() : null;

    if (send.ok) {
      state.publishedPostIds[post.id] = {
        channelId: binding.channelId,
        telegramMessageId: send.messageId,
        telegramPublishedAt: sentAt ?? updatedAt,
        telegramTarget: planned.telegramTarget,
        publishResult: "success",
      };
    }

    const item: TelegramQuickPublishItem = {
      ...planned,
      status: send.ok ? "published" : "failed",
      telegramMessageId: send.messageId,
      telegramPublishedAt: sentAt,
      publishResult: send.ok ? "success" : "failed",
      publishError: send.error,
      blockerReason: send.error,
      lastSendAt: sentAt ?? updatedAt,
    };

    items.push(item);
    appendPublishLog(state, item, updatedAt, mode);
  }

  const queue = await buildPublishingQueue(state);
  const counters = buildCounters(queue, state);

  return persistResult(state, {
    ok: items.some((item) => item.status === "published"),
    confirmed: true,
    mode,
    channelsTotal: 15,
    ...counters,
    readyToPublish: items.filter((item) => item.status === "published" || item.status === "failed").length,
    publishedSuccess: items.filter((item) => item.status === "published").length,
    failed: items.filter((item) => item.status === "failed").length,
    skipped: items.filter((item) => isSkippedLike(item.status)).length,
    skippedTotal: items.filter((item) => isSkippedLike(item.status)).length,
    alreadyPublished: items.filter((item) => item.status === "already_published").length,
    alreadyPublishedTotal: items.filter((item) => item.status === "already_published").length,
    maxPostsPerRun: 15,
    maxPostsPerChannel: 1,
    realMassPublishEnabled: false,
    autopostingDisabled: true,
    allowRealPublish: false,
    seededTargets: seeded.created,
    items,
    queue,
    publishLog: state.publishLog.slice(-100),
    message: getResultMessage(mode),
    updatedAt,
  });
}

async function buildPublishingQueue(state: QuickPublishRuntimeState) {
  const rows: TelegramQuickPublishItem[] = [];

  for (const binding of listTelegramTargetBindings()) {
    rows.push(await buildQueueItemForChannel(state, binding, "continue_queue"));
  }

  return rows;
}

async function buildQueueItemForChannel(
  state: QuickPublishRuntimeState,
  binding: ReturnType<typeof listTelegramTargetBindings>[number],
  mode: QuickPublishMode,
): Promise<TelegramQuickPublishItem> {
  const config = getTelegramConfig();
  const post = findNextPublishablePost(binding.channelId, state, mode);

  if (!binding.telegramTarget) {
    return buildItem({
      binding,
      post,
      status: "target_missing",
      result: "skipped",
      reason: "telegramTarget missing",
    });
  }

  if (config.tokenStatus !== "configured") {
    return buildItem({
      binding,
      post,
      status: "blocked",
      result: "blocked",
      reason: "Telegram Bot token is missing",
    });
  }

  if (config.dryRun) {
    return buildItem({
      binding,
      post,
      status: "blocked",
      result: "blocked",
      reason: "TELEGRAM_DRY_RUN=true",
    });
  }

  if (!post) {
    const published = findLastSuccessfulPublication(state, binding.channelId);

    if (published) {
      return buildItem({
        binding,
        post: published.post,
        status: "already_published",
        result: "already_published",
        reason: "All currently ready posts were already published or attempted",
        messageId: published.messageId,
        publishedAt: published.publishedAt,
      });
    }

    return buildItem({
      binding,
      post,
      status: "no_ready_posts",
      result: "skipped",
      reason: "no ready posts",
    });
  }

  if (hasAlreadyBeenPublished(state, post)) {
    return buildItem({
      binding,
      post,
      status: "already_published",
      result: "already_published",
      reason: "Post already published. Duplicate publish is blocked.",
      messageId: state.publishedPostIds[post.id]?.telegramMessageId ?? findLastMessageId(state, post.id),
      publishedAt: state.publishedPostIds[post.id]?.telegramPublishedAt ?? findLastPublishedAt(state, post.id),
    });
  }

  const access = await checkTelegramChannelAccess({
    channelId: binding.channelId,
    telegramTarget: binding.telegramTarget,
  });

  if (access.accessStatus !== "ok") {
    return buildItem({
      binding,
      post,
      status: "bot_access_failed",
      result: "blocked",
      reason: access.error ?? access.accessStatus,
      botAccess: access.accessStatus,
    });
  }

  const preflight = validatePublishPreflight(post, binding.telegramTarget);

  if (!preflight.ok) {
    return buildItem({
      binding,
      post,
      status: preflight.status,
      result: "blocked",
      reason: preflight.reason,
      botAccess: access.accessStatus,
      imageStatus: preflight.imageStatus,
      textStatus: preflight.textStatus,
    });
  }

  return buildItem({
    binding,
    post,
    status: "ready_to_publish",
    result: null,
    reason: null,
    botAccess: access.accessStatus,
    imageStatus: preflight.imageStatus,
    textStatus: preflight.textStatus,
  });
}

function findNextPublishablePost(channelId: string, state: QuickPublishRuntimeState, mode: QuickPublishMode) {
  if (channelHasSuccessfulPublicationToday(state, channelId)) {
    return undefined;
  }

  const candidates = posts.filter((post) => {
    if (post.channelId !== channelId) return false;
    if (isBlockedStatus(post)) return false;

    const readiness = getPostReadiness({
      id: post.id,
      channelId: post.channelId,
      title: post.title,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl,
    });

    return readiness.status === "ready_for_test";
  });

  if (mode === "retry_failed") {
    return candidates.find((post) => hasRetryableAttempt(state, post.id) && !hasSuccessfulPublication(state, post.id));
  }

  return candidates.find((post) => !hasSuccessfulPublication(state, post.id) && !hasFailedAttempt(state, post.id));
}

function channelHasSuccessfulPublicationToday(state: QuickPublishRuntimeState, channelId: string) {
  const today = new Date().toISOString().slice(0, 10);

  return state.publishLog.some((entry) => entry.channelId === channelId && entry.result === "success" && entry.attemptedAt.slice(0, 10) === today);
}

function isBlockedStatus(post: Post) {
  const status = (post as Omit<Post, "status"> & { status?: string }).status;

  return status === "published" || status === "test_published" || status === "sent";
}

function validatePublishPreflight(post: Post, telegramTarget: string): {
  ok: boolean;
  status: QuickPublishStatus;
  reason: string | null;
  imageStatus: string;
  textStatus: string;
} {
  if (!post.channelId?.trim()) return { ok: false, status: "blocked", reason: "channelId missing", imageStatus: "not checked", textStatus: "not checked" };
  if (!telegramTarget?.trim()) return { ok: false, status: "target_missing", reason: "telegramTarget missing", imageStatus: "not checked", textStatus: "not checked" };
  if (!post.title?.trim()) return { ok: false, status: "blocked", reason: "missing title", imageStatus: "not checked", textStatus: "not checked" };
  if (!post.excerpt?.trim()) return { ok: false, status: "blocked", reason: "missing text/body", imageStatus: "not checked", textStatus: "not checked" };
  if (!post.imageUrl?.trim()) return { ok: false, status: "image_missing", reason: "missing post image", imageStatus: "missing", textStatus: "not checked" };
  if (!post.imageUrl.startsWith("/assets/posts/") || isChannelAssetImagePath(post.imageUrl)) {
    return { ok: false, status: "image_missing", reason: "invalid post image uses channel asset", imageStatus: "invalid", textStatus: "not checked" };
  }
  const quality = evaluatePostQuality(post);
  if (quality.textQuality === "weak") {
    return { ok: false, status: "text_broken", reason: `weak textQuality: ${quality.issues.join(", ")}`, imageStatus: "not checked", textStatus: "weak" };
  }
  if (quality.imageQuality === "weak") {
    return { ok: false, status: "image_missing", reason: `weak imageQuality: ${quality.issues.join(", ")}`, imageStatus: "weak", textStatus: "TEXT OK" };
  }
  const telegramImage = ensureTelegramImageForPost(post);
  if (telegramImage.telegramImageStatus !== "OK") {
    return { ok: false, status: "image_missing", reason: telegramImage.reason ?? telegramImage.telegramImageStatus, imageStatus: telegramImage.telegramImageStatus, textStatus: "not checked" };
  }
  if (hasBrokenText(`${post.title}\n${post.excerpt}`) || isFailedGenerationText(`${post.title}\n${post.excerpt}`)) {
    return { ok: false, status: "text_broken", reason: "broken text", imageStatus: "OK", textStatus: "broken text" };
  }
  if (validateCurrencyPolicy(`${post.title}\n${post.excerpt}`).matches.length > 0) {
    return { ok: false, status: "forbidden_currency", reason: "forbidden currency detected", imageStatus: "OK", textStatus: "TEXT OK" };
  }
  const caption = buildTelegramCaption({ title: post.title, body: post.excerpt });
  if (caption.status !== "OK" || caption.length > maxTelegramPhotoCaptionLength) {
    return { ok: false, status: "blocked", reason: "needs_caption_fix", imageStatus: "OK", textStatus: "TEXT OK" };
  }

  return { ok: true, status: "ready_to_publish", reason: null, imageStatus: "OK", textStatus: "TEXT OK" };
}

function buildItem({
  binding,
  channelId,
  channelName,
  telegramTarget,
  post,
  status,
  result,
  reason,
  botAccess = "not checked",
  imageStatus,
  textStatus,
  messageId = null,
  publishedAt = null,
}: {
  binding?: ReturnType<typeof listTelegramTargetBindings>[number];
  channelId?: string;
  channelName?: string;
  telegramTarget?: string;
  post?: Post | null;
  status: QuickPublishStatus;
  result: QuickPublishResultValue;
  reason: string | null;
  botAccess?: string;
  imageStatus?: string;
  textStatus?: string;
  messageId?: number | null;
  publishedAt?: string | null;
}): TelegramQuickPublishItem {
  const telegramImage = post ? inspectTelegramImage(post) : null;

  return {
    channelId: binding?.channelId ?? channelId ?? "",
    channelName: binding?.channelTitle ?? channelName ?? "",
    telegramTarget: binding?.telegramTarget ?? telegramTarget ?? "",
    selectedPost: post?.id ?? null,
    selectedPostTitle: post?.title ?? null,
    imagePath: post?.imageUrl ?? null,
    telegramImagePath: telegramImage?.telegramImagePath ?? null,
    telegramImageStatus: telegramImage?.telegramImageStatus ?? (post ? "missing" : "not checked"),
    botAccess,
    imageStatus: imageStatus ?? (post?.imageUrl ? "not checked" : "missing"),
    textStatus: textStatus ?? "not checked",
    status,
    blockerReason: reason,
    lastSendAt: publishedAt,
    telegramMessageId: messageId,
    telegramPublishedAt: publishedAt,
    publishResult: result,
    publishError: reason,
  };
}

function readState(): QuickPublishRuntimeState {
  if (!existsSync(statePath)) {
    return {
      publishedPostIds: {},
      publishLog: [],
      lastResult: null,
    };
  }

  const state = JSON.parse(readFileSync(statePath, "utf8")) as Partial<QuickPublishRuntimeState>;

  return {
    publishedPostIds: state.publishedPostIds ?? {},
    publishLog: state.publishLog ?? [],
    lastResult: state.lastResult ?? null,
  };
}

function persistResult(state: QuickPublishRuntimeState, result: TelegramQuickPublishResult) {
  state.lastResult = result;
  writeState(state);

  return result;
}

function writeState(state: QuickPublishRuntimeState) {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

function appendPublishLog(state: QuickPublishRuntimeState, item: TelegramQuickPublishItem, attemptedAt: string, mode: QuickPublishMode) {
  state.publishLog.push({
    id: `${attemptedAt}-${item.channelId}-${item.selectedPost ?? "none"}-${state.publishLog.length + 1}`,
    channelId: item.channelId,
    channelName: item.channelName,
    telegramTarget: item.telegramTarget,
    postId: item.selectedPost,
    title: item.selectedPostTitle,
    imagePath: item.imagePath,
    telegramImagePath: item.telegramImagePath,
    telegramImageStatus: item.telegramImageStatus,
    attemptedAt,
    result: item.publishResult ?? statusToResult(item.status),
    telegramMessageId: item.telegramMessageId,
    error: item.publishError,
    mode,
  });

  state.publishLog = state.publishLog.slice(-500);
}

function hasAlreadyBeenPublished(state: QuickPublishRuntimeState, post: Post) {
  const postRecord = post as Omit<Post, "status"> & {
    status?: string;
    telegramMessageId?: number | null;
    publishResult?: string | null;
  };

  return (
    postRecord.status === "published" ||
    postRecord.status === "test_published" ||
    Boolean(postRecord.telegramMessageId) ||
    postRecord.publishResult === "success" ||
    hasSuccessfulPublication(state, post.id)
  );
}

function hasSuccessfulPublication(state: QuickPublishRuntimeState, postId: string) {
  const testState = readJson<{ selectedPost?: string | null; messageId?: number | null; status?: string; ok?: boolean }>(testSendStatePath);

  return (
    Boolean(state.publishedPostIds[postId]) ||
    state.publishLog.some((entry) => entry.postId === postId && entry.result === "success") ||
    Boolean(testState?.selectedPost === postId && testState.ok && testState.messageId)
  );
}

function hasFailedAttempt(state: QuickPublishRuntimeState, postId: string) {
  return state.publishLog.some((entry) => entry.postId === postId && entry.result === "failed");
}

function hasRetryableAttempt(state: QuickPublishRuntimeState, postId: string) {
  return state.publishLog.some((entry) => {
    if (entry.postId !== postId) return false;
    if (entry.result === "success" || entry.result === "already_published") return false;

    const error = (entry.error ?? "").toLowerCase();
    return (
      entry.result === "failed" ||
      error.includes("image") ||
      error.includes("photo") ||
      error.includes("chat not found") ||
      error.includes("target") ||
      error.includes("not enough rights")
    );
  });
}

function findLastSuccessfulPublication(state: QuickPublishRuntimeState, channelId: string) {
  const entry = [...state.publishLog].reverse().find((item) => item.channelId === channelId && item.result === "success");

  if (!entry?.postId) {
    return null;
  }

  return {
    post: posts.find((post) => post.id === entry.postId) ?? null,
    messageId: entry.telegramMessageId,
    publishedAt: entry.attemptedAt,
  };
}

function findLastMessageId(state: QuickPublishRuntimeState, postId: string) {
  return [...state.publishLog].reverse().find((entry) => entry.postId === postId && entry.telegramMessageId)?.telegramMessageId ?? null;
}

function findLastPublishedAt(state: QuickPublishRuntimeState, postId: string) {
  return [...state.publishLog].reverse().find((entry) => entry.postId === postId && entry.result === "success")?.attemptedAt ?? null;
}

function statusToResult(status: QuickPublishStatus): QuickPublishLogResult {
  if (status === "published") return "success";
  if (status === "failed") return "failed";
  if (status === "already_published") return "already_published";
  if (status === "blocked" || status === "bot_access_failed" || status === "image_missing" || status === "text_broken" || status === "forbidden_currency") return "blocked";

  return "skipped";
}

function isSkippedLike(status: QuickPublishStatus) {
  return status === "skipped" || status === "blocked" || status === "no_ready_posts" || status === "target_missing" || status === "bot_access_failed" || status === "image_missing" || status === "text_broken" || status === "forbidden_currency";
}

function buildCounters(queue: TelegramQuickPublishItem[], state: QuickPublishRuntimeState) {
  const successEntries = state.publishLog.filter((entry) => entry.result === "success");
  const failedEntries = state.publishLog.filter((entry) => entry.result === "failed");
  const skippedEntries = state.publishLog.filter((entry) => entry.result === "skipped" || entry.result === "blocked");
  const alreadyEntries = state.publishLog.filter((entry) => entry.result === "already_published");

  return {
    linkedTargets: queue.filter((item) => item.telegramTarget).length,
    botAccessOk: queue.filter((item) => item.botAccess === "ok").length,
    readyPosts: queue.filter((item) => item.status === "ready_to_publish").length,
    published: successEntries.length,
    errors: failedEntries.length,
    skipped: skippedEntries.length,
    alreadyPublished: alreadyEntries.length,
    remainingInQueue: queue.filter((item) => item.status === "ready_to_publish").length,
  };
}

function readJson<T>(filePath: string): T | null {
  if (!existsSync(filePath)) {
    return null;
  }

  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export async function sendPhotoToTelegramChannel({
  token,
  telegramTarget,
  title,
  text,
  caption,
  imageFilePath,
}: {
  token: string;
  telegramTarget: string;
  title: string;
  text: string;
  caption?: string;
  imageFilePath: string;
}) {
  if (!token || !telegramTarget) {
    return { ok: false, messageId: null, error: "token missing or target missing" };
  }

  if (!existsSync(imageFilePath)) {
    return { ok: false, messageId: null, error: "image file missing" };
  }

  try {
    const imageBuffer = readFileSync(imageFilePath);
    const form = new FormData();
    form.set("chat_id", telegramTarget);
    form.set("photo", new Blob([new Uint8Array(imageBuffer)], { type: getTelegramImageMime(imageFilePath) }), path.basename(imageFilePath));
    const safeCaption = caption || buildTelegramCaption({ title, body: text }).caption;
    if (!safeCaption || safeCaption.length > maxTelegramPhotoCaptionLength) {
      return { ok: false, messageId: null, error: "needs_caption_fix" };
    }
    form.set("caption", safeCaption);
    form.set("parse_mode", "HTML");

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
    return { ok: false, messageId: null, error: error instanceof Error ? friendlyTelegramError(error.message) : "Telegram API error" };
  }
}

function buildCaption(title: string, text: string) {
  return `<b>${escapeTelegramHtml(title)}</b>\n\n${escapeTelegramHtml(text)}`;
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

  if (lower.includes("not enough rights") || lower.includes("administrator")) return "bot is not admin or does not have enough rights";
  if (lower.includes("chat not found")) return "chat not found";
  if (lower.includes("caption") && lower.includes("too long")) return "caption too long";
  if (lower.includes("unauthorized") || lower.includes("token")) return "token invalid";
  if (lower.includes("chat_id") || lower.includes("bad request")) return `Telegram API error: ${sanitized}. Possible wrong chat_id.`;
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

function getResultMessage(mode: QuickPublishMode) {
  if (mode === "autopublish") {
    return "Р•Р¶РµРґРЅРµРІРЅР°СЏ РїСѓР±Р»РёРєР°С†РёСЏ РІС‹РїРѕР»РЅРµРЅР° РѕРґРЅРёРј Р±РµР·РѕРїР°СЃРЅС‹Рј РїСЂРѕС…РѕРґРѕРј: РјР°РєСЃРёРјСѓРј 1 РїРѕСЃС‚ РЅР° РєР°РЅР°Р», Р±РµР· С‚Р°Р№РјРµСЂР° Рё Р±РµР· Р°РІС‚РѕРїРѕРІС‚РѕСЂР°.";
  }

  if (mode === "retry_failed") {
    return "РџРѕРІС‚РѕСЂ РѕС€РёР±РѕРє Р·Р°РІРµСЂС€С‘РЅ. РЈСЃРїРµС€РЅС‹Рµ, РѕРїСѓР±Р»РёРєРѕРІР°РЅРЅС‹Рµ Рё РїСЂРѕРїСѓС‰РµРЅРЅС‹Рµ РїРѕСЃС‚С‹ РЅРµ С‚СЂРѕРіР°Р»РёСЃСЊ.";
  }

  if (mode === "continue_queue") {
    return "РћС‡РµСЂРµРґСЊ РїСЂРѕРґРѕР»Р¶РµРЅР°. РЎРёСЃС‚РµРјР° РІР·СЏР»Р° СЃР»РµРґСѓСЋС‰РёРµ РЅРµРѕРїСѓР±Р»РёРєРѕРІР°РЅРЅС‹Рµ РїРѕСЃС‚С‹ Рё РѕСЃС‚Р°РЅРѕРІРёР»Р°СЃСЊ РїРѕСЃР»Рµ РѕРґРЅРѕРіРѕ РїСЂРѕС…РѕРґР°.";
  }

  return "Р‘С‹СЃС‚СЂР°СЏ РїСѓР±Р»РёРєР°С†РёСЏ Р·Р°РІРµСЂС€РµРЅР°. РђРІС‚РѕРїРѕСЃС‚РёРЅРі РЅРµ РІРєР»СЋС‡Р°Р»СЃСЏ.";
}

interface TelegramApiSendPhotoResponse {
  ok: boolean;
  description?: string;
  result?: {
    message_id?: number;
  };
}

