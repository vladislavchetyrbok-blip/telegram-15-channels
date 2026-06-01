import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { posts } from "@/data/posts";
import { checkTelegramChannelAccess } from "@/lib/telegram-access";
import { getTelegramConfig } from "@/lib/telegram";
import { listTelegramTargetBindings, seedTelegramTargetsFromKnownChatIds } from "@/lib/telegram-target-store";
import { runTelegramTestSend } from "@/lib/telegram-test-send";
import { getPostReadiness } from "@/lib/post-media";
import { inspectTelegramImage } from "@/lib/telegram-post-images";
import type { Post } from "@/types";

const statePath = path.join(process.cwd(), "data", "runtime", "telegram-quick-test.json");

type QuickTestMode = "batch" | "retry_failed" | "force_repeat";
type QuickSendStatus = "pending" | "skipped" | "sent" | "failed" | "already_test_published";
type QuickPublishResult = "success" | "failed" | "skipped" | "already_test_published" | null;
type QuickLogResult = Exclude<QuickPublishResult, null>;

export interface TelegramQuickTestItem {
  channelId: string;
  channelTitle: string;
  telegramTarget: string;
  botAccess: string;
  selectedPost: string | null;
  selectedPostTitle: string | null;
  imagePath: string | null;
  imageStatus: string;
  textStatus: string;
  sendStatus: QuickSendStatus;
  telegramMessageId: number | null;
  telegramPublishedAt: string | null;
  testPublishResult: QuickPublishResult;
  testPublishError: string | null;
}

export interface TelegramQuickTestLogEntry {
  id: string;
  channelId: string;
  channelName: string;
  telegramTarget: string;
  postId: string | null;
  title: string | null;
  imagePath: string | null;
  attemptedAt: string;
  result: QuickLogResult;
  telegramMessageId: number | null;
  error: string | null;
}

export interface TelegramQuickTestResult {
  ok: boolean;
  confirmed: boolean;
  mode: QuickTestMode;
  channelsTotal: 15;
  readyToSend: number;
  sentSuccess: number;
  sentFailed: number;
  alreadyTestPublished: number;
  skipped: number;
  realPublishDisabled: true;
  autopostingDisabled: true;
  allowRealPublish: false;
  telegramRealPublishEnabled: false;
  seededTargets: number;
  items: TelegramQuickTestItem[];
  attemptLog: TelegramQuickTestLogEntry[];
  message: string;
  updatedAt: string;
}

interface QuickRuntimeState {
  publishedPostIds: Record<string, {
    channelId: string;
    telegramMessageId: number | null;
    telegramPublishedAt: string;
    telegramTarget: string;
    testPublishResult: "success";
  }>;
  attemptLog: TelegramQuickTestLogEntry[];
  lastResult: TelegramQuickTestResult | null;
}

export function getTelegramQuickTestStatus() {
  const state = readState();
  const targets = listTelegramTargetBindings();

  return {
    ok: true,
    channelsTotal: 15,
    linkedTargets: targets.filter((item) => item.telegramTarget).length,
    realPublishDisabled: true,
    autopostingDisabled: true,
    allowRealPublish: false,
    attemptLog: state.attemptLog.slice(-100).reverse(),
    lastResult: state.lastResult,
  };
}

export async function runTelegramQuickTest({
  confirmed,
  mode = "batch",
  channelId,
  postId,
}: {
  confirmed: boolean;
  mode?: QuickTestMode;
  channelId?: string;
  postId?: string;
}): Promise<TelegramQuickTestResult> {
  const updatedAt = new Date().toISOString();
  const config = getTelegramConfig();
  const seeded = seedTelegramTargetsFromKnownChatIds();
  const state = readState();
  const items: TelegramQuickTestItem[] = [];

  if (!confirmed) {
    return persistResult(state, {
      ok: false,
      confirmed: false,
      mode,
      channelsTotal: 15,
      readyToSend: 0,
      sentSuccess: 0,
      sentFailed: 0,
      alreadyTestPublished: 0,
      skipped: 15,
      realPublishDisabled: true,
      autopostingDisabled: true,
      allowRealPublish: false,
      telegramRealPublishEnabled: false,
      seededTargets: seeded.created,
      items: listTelegramTargetBindings().map((binding) =>
        buildSkippedItem(binding.channelId, binding.channelTitle, binding.telegramTarget, "confirmation required"),
      ),
      attemptLog: state.attemptLog.slice(-100),
      message: "Подтверждение не получено. Быстрый тест не запускался.",
      updatedAt,
    });
  }

  for (const binding of listTelegramTargetBindings()) {
    const post = findReadyPost(binding.channelId);

    if (mode === "force_repeat" && (binding.channelId !== channelId || post?.id !== postId)) {
      items.push(buildSkippedItem(binding.channelId, binding.channelTitle, binding.telegramTarget, "not selected for force repeat", post));
      continue;
    }

    if (mode === "retry_failed" && !wasLastAttemptFailed(state, binding.channelId, post?.id ?? null)) {
      items.push(buildSkippedItem(binding.channelId, binding.channelTitle, binding.telegramTarget, "not a failed test send", post));
      continue;
    }

    if (!binding.telegramTarget) {
      const item = buildSkippedItem(binding.channelId, binding.channelTitle, binding.telegramTarget, "target missing", post);
      items.push(item);
      appendAttemptLog(state, item, updatedAt);
      continue;
    }

    if (config.tokenStatus !== "configured") {
      const item = buildSkippedItem(binding.channelId, binding.channelTitle, binding.telegramTarget, "token missing", post);
      items.push(item);
      appendAttemptLog(state, item, updatedAt);
      continue;
    }

    if (!post) {
      const item = buildSkippedItem(binding.channelId, binding.channelTitle, binding.telegramTarget, "no ready_for_test post");
      items.push(item);
      appendAttemptLog(state, item, updatedAt);
      continue;
    }

    if (mode !== "force_repeat" && hasAlreadyBeenTestPublished(state, post)) {
      const item: TelegramQuickTestItem = {
        channelId: binding.channelId,
        channelTitle: binding.channelTitle,
        telegramTarget: binding.telegramTarget,
        botAccess: "skipped",
        selectedPost: post.id,
        selectedPostTitle: post.title,
        imagePath: inspectTelegramImage(post).telegramImagePath,
        imageStatus: "OK",
        textStatus: "TEXT OK",
        sendStatus: "already_test_published",
        telegramMessageId: state.publishedPostIds[post.id]?.telegramMessageId ?? findLastMessageId(state, post.id),
        telegramPublishedAt: state.publishedPostIds[post.id]?.telegramPublishedAt ?? findLastPublishedAt(state, post.id),
        testPublishResult: "already_test_published",
        testPublishError: "Пост уже был тестово отправлен. Повторная отправка заблокирована.",
      };

      items.push(item);
      appendAttemptLog(state, item, updatedAt);
      continue;
    }

    const access = await checkTelegramChannelAccess({
      channelId: binding.channelId,
      telegramTarget: binding.telegramTarget,
    });

    if (access.accessStatus !== "ok") {
      const item: TelegramQuickTestItem = {
        channelId: binding.channelId,
        channelTitle: binding.channelTitle,
        telegramTarget: binding.telegramTarget,
        botAccess: access.accessStatus,
        selectedPost: post.id,
        selectedPostTitle: post.title,
        imagePath: inspectTelegramImage(post).telegramImagePath,
        imageStatus: "OK",
        textStatus: "TEXT OK",
        sendStatus: "skipped",
        telegramMessageId: null,
        telegramPublishedAt: null,
        testPublishResult: "skipped",
        testPublishError: access.error ?? access.accessStatus,
      };

      items.push(item);
      appendAttemptLog(state, item, updatedAt);
      continue;
    }

    const send = await runTelegramTestSend({
      channelId: binding.channelId,
      postId: post.id,
      telegramTarget: binding.telegramTarget,
      force: mode === "force_repeat",
    });
    const sentAt = send.ok ? new Date().toISOString() : null;

    if (send.ok) {
      state.publishedPostIds[post.id] = {
        channelId: binding.channelId,
        telegramMessageId: send.messageId,
        telegramPublishedAt: sentAt ?? updatedAt,
        telegramTarget: binding.telegramTarget,
        testPublishResult: "success",
      };
    }

    const item: TelegramQuickTestItem = {
      channelId: binding.channelId,
      channelTitle: binding.channelTitle,
      telegramTarget: binding.telegramTarget,
      botAccess: access.accessStatus,
      selectedPost: post.id,
      selectedPostTitle: post.title,
      imagePath: inspectTelegramImage(post).telegramImagePath,
      imageStatus: send.checks.find((check) => check.key === "imageFileExists")?.ok ? "OK" : "image file missing",
      textStatus: send.checks.find((check) => check.key === "textEncoding")?.ok ? "TEXT OK" : "broken text",
      sendStatus: send.ok ? "sent" : "failed",
      telegramMessageId: send.messageId,
      telegramPublishedAt: sentAt,
      testPublishResult: send.ok ? "success" : "failed",
      testPublishError: send.ok ? null : send.error,
    };

    items.push(item);
    appendAttemptLog(state, item, updatedAt);
  }

  return persistResult(state, {
    ok: items.some((item) => item.sendStatus === "sent"),
    confirmed: true,
    mode,
    channelsTotal: 15,
    readyToSend: items.filter((item) => item.sendStatus === "sent" || item.sendStatus === "failed").length,
    sentSuccess: items.filter((item) => item.sendStatus === "sent").length,
    sentFailed: items.filter((item) => item.sendStatus === "failed").length,
    alreadyTestPublished: items.filter((item) => item.sendStatus === "already_test_published").length,
    skipped: items.filter((item) => item.sendStatus === "skipped").length,
    realPublishDisabled: true,
    autopostingDisabled: true,
    allowRealPublish: false,
    telegramRealPublishEnabled: false,
    seededTargets: seeded.created,
    items,
    attemptLog: state.attemptLog.slice(-100),
    message: getResultMessage(mode),
    updatedAt,
  });
}

function findReadyPost(channelId: string) {
  return posts.find((post) => {
    if (post.channelId !== channelId) return false;

    return getPostReadiness({
      id: post.id,
      channelId: post.channelId,
      title: post.title,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl,
    }).status === "ready_for_test";
  });
}

function buildSkippedItem(
  channelId: string,
  channelTitle: string,
  telegramTarget: string,
  reason: string,
  post?: Post,
): TelegramQuickTestItem {
  return {
    channelId,
    channelTitle,
    telegramTarget,
    botAccess: "skipped",
    selectedPost: post?.id ?? null,
    selectedPostTitle: post?.title ?? null,
    imagePath: post ? inspectTelegramImage(post).telegramImagePath : null,
    imageStatus: "not checked",
    textStatus: "not checked",
    sendStatus: "skipped",
    telegramMessageId: null,
    telegramPublishedAt: null,
    testPublishResult: "skipped",
    testPublishError: reason,
  };
}

function readState(): QuickRuntimeState {
  if (!existsSync(statePath)) {
    return {
      publishedPostIds: {},
      attemptLog: [],
      lastResult: null,
    };
  }

  const state = JSON.parse(readFileSync(statePath, "utf8")) as Partial<QuickRuntimeState>;

  return {
    publishedPostIds: state.publishedPostIds ?? {},
    attemptLog: state.attemptLog ?? [],
    lastResult: state.lastResult ?? null,
  };
}

function persistResult(state: QuickRuntimeState, result: TelegramQuickTestResult) {
  state.lastResult = result;
  writeState(state);

  return result;
}

function writeState(state: QuickRuntimeState) {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

function hasAlreadyBeenTestPublished(state: QuickRuntimeState, post: Post) {
  const postRecord = post as Omit<Post, "status"> & {
    telegramMessageId?: number | null;
    testPublishResult?: string | null;
    status?: string;
  };

  return (
    postRecord.status === "test_published" ||
    Boolean(postRecord.telegramMessageId) ||
    postRecord.testPublishResult === "success" ||
    Boolean(state.publishedPostIds[post.id]) ||
    state.attemptLog.some((entry) => entry.postId === post.id && entry.result === "success")
  );
}

function wasLastAttemptFailed(state: QuickRuntimeState, channelId: string, postId: string | null) {
  const item = [...(state.lastResult?.items ?? [])]
    .reverse()
    .find((entry) => entry.channelId === channelId && (!postId || entry.selectedPost === postId));

  if (item?.testPublishResult === "failed") {
    return true;
  }

  const logEntry = [...state.attemptLog]
    .reverse()
    .find((entry) => entry.channelId === channelId && (!postId || entry.postId === postId));

  return logEntry?.result === "failed";
}

function findLastMessageId(state: QuickRuntimeState, postId: string) {
  return [...state.attemptLog].reverse().find((entry) => entry.postId === postId && entry.telegramMessageId)?.telegramMessageId ?? null;
}

function findLastPublishedAt(state: QuickRuntimeState, postId: string) {
  return [...state.attemptLog].reverse().find((entry) => entry.postId === postId && entry.result === "success")?.attemptedAt ?? null;
}

function appendAttemptLog(state: QuickRuntimeState, item: TelegramQuickTestItem, attemptedAt: string) {
  state.attemptLog.push({
    id: `${attemptedAt}-${item.channelId}-${item.selectedPost ?? "none"}-${state.attemptLog.length + 1}`,
    channelId: item.channelId,
    channelName: item.channelTitle,
    telegramTarget: item.telegramTarget,
    postId: item.selectedPost,
    title: item.selectedPostTitle,
    imagePath: item.imagePath,
    attemptedAt,
    result: item.testPublishResult ?? (item.sendStatus === "sent" ? "success" : item.sendStatus === "failed" ? "failed" : "skipped"),
    telegramMessageId: item.telegramMessageId,
    error: item.testPublishError,
  });

  state.attemptLog = state.attemptLog.slice(-300);
}

function getResultMessage(mode: QuickTestMode) {
  if (mode === "retry_failed") {
    return "Повтор неудачных отправок завершён. Успешные и уже отправленные посты не трогались.";
  }

  if (mode === "force_repeat") {
    return "Принудительный повтор выбранного поста завершён. Массовая отправка не запускалась.";
  }

  return "Быстрый тест завершён. Автопостинг и real publish остались отключены.";
}
