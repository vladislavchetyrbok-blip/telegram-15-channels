import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { channels } from "@/data/channels";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { channelPostImageFolders, publicPathToFilePath } from "@/lib/post-media";
import { buildPostVisualPng } from "@/lib/post-visual-generator";
import { premiumVisualAspectRatio, validatePremiumVisual } from "@/lib/premium-visual-generator";
import { buildTelegramCaption, telegramCaptionSafeLimit } from "@/lib/telegram-caption";
import { hasBrokenText, isFailedGenerationText } from "@/lib/text-quality";
import { providerSource, type ImageProviderType } from "@/lib/visual-engine-config";
import {
  findGenericContentIssues,
  generateChannelPostContent,
  getChannelRubric,
  getChannelVisualBrief,
  hasServiceVisualLabel,
} from "@/lib/channel-content-strategy";
import { getZonedNow, zonedDateTimeToUtcIso } from "@/lib/autopublish-schedule";
import type { PostQuality } from "@/types";

export type WeeklyContentPlanStatus =
  | "draft"
  | "ready_to_publish"
  | "scheduled"
  | "published"
  | "blocked"
  | "failed";

export type WeeklyContentPlanItemAction =
  | "open"
  | "regenerate_text"
  | "regenerate_image"
  | "regenerate_full"
  | "mark_ready"
  | "skip"
  | "block"
  | "delete";

export interface WeeklyContentPlanItem {
  id: string;
  postId: string;
  channelId: string;
  channelName: string;
  contentPlanDate: string;
  contentTopic: string;
  scheduledAt: string;
  publishTime: string;
  title: string;
  body: string;
  telegramCaption: string;
  telegramCaptionLength: number;
  telegramCaptionStatus: "OK" | "missing" | "too_long" | "invalid_text";
  language: "ru" | "uk";
  textQuality: PostQuality;
  textLength: number;
  imageUrl: string;
  imagePath: string;
  telegramImagePath: string;
  telegramImageStatus: "OK" | "missing" | "broken_file" | "unsupported_format" | "conversion_failed";
  imageQuality: PostQuality;
  visualStyle?: string;
  visualPreset?: string;
  visualVersion?: string;
  visualGeneratedAt?: string;
  provider?: ImageProviderType;
  fallbackProvider?: ImageProviderType;
  fallbackUsed?: boolean;
  premiumVersion?: string;
  source?: "template" | "comfyui" | "external_api" | "disabled";
  imageDimensions?: { width: number; height: number } | null;
  visualMetadata?: Record<string, unknown>;
  status: WeeklyContentPlanStatus;
  qualityIssues: string[];
  duplicateTopic: boolean;
  telegramMessageId?: number | null;
  telegramPublishedAt?: string | null;
  publishResult?: "success" | "failed" | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyContentPlanSummary {
  days: number;
  channels: number;
  total: number;
  readyToPublish: number;
  scheduled: number;
  published: number;
  blocked: number;
  failed: number;
  weakText: number;
  weakImage: number;
  telegramImageStatusOk: number;
  uniqueTopics: number;
  duplicateTopics: number;
  missingImages: number;
  generatedImages: number;
}

export interface WeeklyContentPlanState {
  version: 1;
  generatedAt: string | null;
  updatedAt: string;
  items: WeeklyContentPlanItem[];
  summary: WeeklyContentPlanSummary;
}

export interface WeeklyContentPlanResult {
  ok: boolean;
  action: "generate" | "check" | "improve_weak" | "schedule_ready" | "clear_blocked" | "repair_caption";
  summary: WeeklyContentPlanSummary;
  items: WeeklyContentPlanItem[];
  message: string;
}

export interface WeeklyContentPlanItemActionResult extends WeeklyContentPlanResult {
  item: WeeklyContentPlanItem | null;
}

const planPath = path.join(process.cwd(), "data", "runtime", "weekly-content-plan.json");
const planDays = 7;
const forbiddenTopicLookbackDays = 7;
const contentCalendarTimezone = "Europe/Kyiv";

export const contentCalendarDailySlots = [
  { channelId: "money-opportunities", time: "09:00" },
  { channelId: "ai-tech", time: "09:30" },
  { channelId: "ukraine-market", time: "10:00" },
  { channelId: "mens-style", time: "10:30" },
  { channelId: "home-tech", time: "11:00" },
  { channelId: "fishing-rest", time: "11:30" },
  { channelId: "dnipro-city", time: "12:00" },
  { channelId: "auto-comfort", time: "12:30" },
  { channelId: "business-ideas", time: "13:00" },
  { channelId: "personal-progress", time: "13:30" },
  { channelId: "dnipro-real-estate-ru", time: "14:00" },
  { channelId: "dnipro-real-estate-ua", time: "14:30" },
  { channelId: "commercial-real-estate", time: "15:00" },
  { channelId: "land-houses", time: "15:30" },
  { channelId: "real-estate-investments", time: "16:00" },
] as const;

export function getContentCalendarSlot(channelId: string, fallbackIndex = 0) {
  return contentCalendarDailySlots.find((slot) => slot.channelId === channelId) ?? contentCalendarDailySlots[fallbackIndex] ?? contentCalendarDailySlots[0];
}


export function getWeeklyContentPlanState(): WeeklyContentPlanState {
  if (!existsSync(planPath)) {
    return emptyState();
  }

  const raw = JSON.parse(readFileSync(planPath, "utf8")) as Partial<WeeklyContentPlanState>;
  const items = Array.isArray(raw.items) ? raw.items.map(validatePlanItem) : [];

  return {
    version: 1,
    generatedAt: raw.generatedAt ?? null,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    items,
    summary: buildSummary(items),
  };
}

export function getWeeklyContentPlanItems() {
  return getWeeklyContentPlanState().items;
}

export function getWeeklyContentPlanForDate(date: Date | string) {
  const dateKey = typeof date === "string" ? date : formatDate(date);
  return getWeeklyContentPlanState().items.filter((item) => item.contentPlanDate === dateKey);
}

export function findWeeklyPlanItemForChannelDate(channelId: string, date: Date | string) {
  const dateKey = typeof date === "string" ? date : formatDate(date);
  const state = getWeeklyContentPlanState();

  return (
    state.items.find(
      (item) => item.channelId === channelId && item.contentPlanDate === dateKey && isWeeklyPlanItemReadyToPublish(item),
    ) ??
    state.items.find(
      (item) => item.channelId === channelId && item.contentPlanDate >= dateKey && isWeeklyPlanItemReadyToPublish(item),
    ) ??
    null
  );
}

export function generateWeeklyContentPlan(): WeeklyContentPlanResult {
  const previous = getWeeklyContentPlanState();
  const now = new Date().toISOString();
  const preservedPublished = previous.items.filter((item) => item.status === "published" || Boolean(item.telegramMessageId));
  const generated: WeeklyContentPlanItem[] = [];

  for (let dayIndex = 0; dayIndex < planDays; dayIndex += 1) {
    const date = addDays(new Date(), dayIndex);
    const dateKey = formatDate(date);

    channels.forEach((channel, channelIndex) => {
      const postId = `weekly-${dateKey}-${folderForChannel(channel.id)}-${String(channelIndex + 1).padStart(2, "0")}`;
      const topic = getTopic(channel.id, dayIndex);
      const language = isUkrainianChannel(channel.id) ? "uk" : "ru";
      const title = buildTitle(channel.id, topic);
      const body = buildBody(channel.id, topic);
      const scheduledAt = buildScheduledAt(date, channelIndex);
      const image = ensureWeeklyImage({ channelId: channel.id, postId, dateKey, title, topic });
      const item = validatePlanItem({
        id: `${dateKey}-${channel.id}`,
        postId,
        channelId: channel.id,
        channelName: channel.name,
        contentPlanDate: dateKey,
        contentTopic: topic,
        scheduledAt,
        publishTime: getContentCalendarSlot(channel.id, channelIndex).time,
        title,
        body,
        telegramCaption: "",
        telegramCaptionLength: 0,
        telegramCaptionStatus: "missing",
        language,
        textQuality: "medium",
        textLength: body.length,
        imageUrl: image.publicUrl,
        imagePath: image.filePath,
        telegramImagePath: image.filePath,
        telegramImageStatus: image.ok ? "OK" : "conversion_failed",
        imageQuality: image.ok ? "strong" : "weak",
        provider: "local_template",
        fallbackProvider: "local_template",
        fallbackUsed: false,
        premiumVersion: "premium_v2",
        source: "template",
        visualStyle: `${image.visualMode}, ${image.rubricLabel}`,
        visualPreset: image.visualMode,
        visualVersion: "premium_v2",
        visualGeneratedAt: now,
        visualMetadata: {
          mode: image.visualMode,
          rubric: image.rubricLabel,
          overlay: "channel/rubric/title only",
          serviceLabels: false,
        },
        status: "draft",
        qualityIssues: [],
        duplicateTopic: false,
        createdAt: now,
        updatedAt: now,
      });
      generated.push(applyQualityGate(item, [...preservedPublished, ...generated]));
    });
  }

  const items = [...preservedPublished, ...generated];
  const state: WeeklyContentPlanState = {
    version: 1,
    generatedAt: now,
    updatedAt: now,
    items,
    summary: buildSummary(items),
  };
  writeState(state);

  return {
    ok: state.summary.blocked === 0,
    action: "generate",
    summary: state.summary,
    items: state.items,
    message: `7-day plan prepared: ${state.summary.total} rows, ${state.summary.readyToPublish} ready_to_publish, ${state.summary.blocked} blocked. Telegram was not called.`,
  };
}

export function checkWeeklyContentPlan(): WeeklyContentPlanResult {
  const state = getWeeklyContentPlanState();
  const items: WeeklyContentPlanItem[] = [];

  for (const item of state.items) {
    const validated = applyQualityGate(validatePlanItem(item), items);
    items.push(validated);
  }

  const next = { ...state, updatedAt: new Date().toISOString(), items, summary: buildSummary(items) };
  writeState(next);

  return {
    ok: next.summary.blocked === 0,
    action: "check",
    summary: next.summary,
    items: next.items,
    message: `Plan checked: ${next.summary.readyToPublish} ready_to_publish, ${next.summary.blocked} blocked.`,
  };
}

export function improveWeakWeeklyContentPlan(): WeeklyContentPlanResult {
  const state = getWeeklyContentPlanState();
  const now = new Date().toISOString();
  const items: WeeklyContentPlanItem[] = [];

  for (const current of state.items) {
    if (current.status === "published" || current.telegramMessageId) {
      items.push(current);
      continue;
    }

    const needsText =
      current.textQuality === "weak" ||
      current.qualityIssues.some((issue) => issue.includes("text") || issue.includes("mojibake"));
    const needsImage = current.imageQuality === "weak" || current.telegramImageStatus !== "OK";
    const title = needsText ? buildTitle(current.channelId, current.contentTopic) : current.title;
    const body = needsText ? buildBody(current.channelId, current.contentTopic) : current.body;
    const image = needsImage
      ? ensureWeeklyImage({ channelId: current.channelId, postId: current.postId, dateKey: current.contentPlanDate, title, topic: current.contentTopic, force: true })
      : { ok: existsSync(current.telegramImagePath), publicUrl: current.imageUrl, filePath: current.telegramImagePath };

    const repaired = applyQualityGate(
      validatePlanItem({
        ...current,
        title,
        body,
        textLength: body.length,
        imageUrl: image.publicUrl,
        imagePath: image.filePath,
        telegramImagePath: image.filePath,
        telegramImageStatus: image.ok ? "OK" : "conversion_failed",
        imageQuality: image.ok ? "strong" : "weak",
        visualStyle: "visualMode" in image ? `${image.visualMode}, ${image.rubricLabel}` : current.visualStyle,
        visualPreset: "visualMode" in image ? image.visualMode : current.visualPreset,
        visualVersion: "premium_v2",
        visualGeneratedAt: "visualMode" in image ? now : current.visualGeneratedAt,
        visualMetadata:
          "visualMode" in image
            ? { mode: image.visualMode, rubric: image.rubricLabel, overlay: "channel/rubric/title only", serviceLabels: false }
            : current.visualMetadata,
        updatedAt: now,
      }),
      items,
    );
    items.push(repaired);
  }

  const next = { ...state, updatedAt: now, items, summary: buildSummary(items) };
  writeState(next);

  return {
    ok: next.summary.blocked === 0,
    action: "improve_weak",
    summary: next.summary,
    items: next.items,
    message: `Weak rows rechecked: ${next.summary.weakText} weak text, ${next.summary.weakImage} weak image.`,
  };
}

export function repairWeeklyTelegramCaptions(): WeeklyContentPlanResult & {
  checked: number;
  repaired: number;
  tooLongBefore: number;
  tooLongAfter: number;
  returnedToReady: number;
  safeLimit: number;
} {
  const state = getWeeklyContentPlanState();
  const before = state.items.filter(
    (item) =>
      item.telegramCaptionStatus !== "OK" ||
      item.telegramCaptionLength > telegramCaptionSafeLimit ||
      item.qualityIssues.some((issue) => issue === "caption too long" || issue === "needs_caption_fix"),
  ).length;
  const now = new Date().toISOString();
  let repaired = 0;
  let returnedToReady = 0;
  const items: WeeklyContentPlanItem[] = [];

  for (const current of state.items) {
    if (current.status === "published" || current.telegramMessageId) {
      items.push(current);
      continue;
    }

    const beforeStatus = current.status;
    const validated = applyQualityGate(
      validatePlanItem({
        ...current,
        qualityIssues: current.qualityIssues.filter((issue) => issue !== "caption too long" && issue !== "needs_caption_fix"),
        updatedAt: now,
      }),
      items,
    );

    if (
      validated.telegramCaptionStatus === "OK" &&
      validated.telegramCaptionLength <= telegramCaptionSafeLimit &&
      (current.telegramCaption !== validated.telegramCaption ||
        current.qualityIssues.includes("caption too long") ||
        current.qualityIssues.includes("needs_caption_fix"))
    ) {
      repaired += 1;
    }
    if (beforeStatus === "blocked" && validated.status === "ready_to_publish") {
      returnedToReady += 1;
    }
    items.push(validated);
  }

  const next = { ...state, updatedAt: now, items, summary: buildSummary(items) };
  const after = next.items.filter(
    (item) => item.telegramCaptionStatus !== "OK" || item.telegramCaptionLength > telegramCaptionSafeLimit,
  ).length;
  writeState(next);

  return {
    ok: after === 0,
    action: "repair_caption",
    summary: next.summary,
    items: next.items,
    checked: next.items.length,
    repaired,
    tooLongBefore: before,
    tooLongAfter: after,
    returnedToReady,
    safeLimit: telegramCaptionSafeLimit,
    message: `Telegram captions repaired: ${repaired}, returned to ready_to_publish: ${returnedToReady}, too long left: ${after}. Telegram was not called.`,
  };
}

export function scheduleReadyWeeklyContentPlan(): WeeklyContentPlanResult {
  const state = getWeeklyContentPlanState();
  const now = new Date().toISOString();
  const items = state.items.map((item) =>
    item.status === "ready_to_publish" ? { ...item, status: "scheduled" as const, updatedAt: now } : item,
  );
  const next = { ...state, updatedAt: now, items, summary: buildSummary(items) };
  writeState(next);

  return {
    ok: true,
    action: "schedule_ready",
    summary: next.summary,
    items: next.items,
    message: `Ready rows marked as scheduled: ${next.summary.scheduled}. Telegram was not called.`,
  };
}

export function clearBlockedWeeklyContentPlan({ confirmed = false }: { confirmed?: boolean } = {}): WeeklyContentPlanResult {
  const state = getWeeklyContentPlanState();

  if (!confirmed) {
    return {
      ok: false,
      action: "clear_blocked",
      summary: state.summary,
      items: state.items,
      message: "Clearing blocked rows requires confirmation.",
    };
  }

  const items = state.items.filter((item) => item.status !== "blocked");
  const next = { ...state, updatedAt: new Date().toISOString(), items, summary: buildSummary(items) };
  writeState(next);

  return {
    ok: true,
    action: "clear_blocked",
    summary: next.summary,
    items: next.items,
    message: `Blocked rows cleared. Remaining rows: ${next.summary.total}.`,
  };
}

export function runWeeklyContentPlanItemAction({
  itemId,
  action,
}: {
  itemId: string;
  action: WeeklyContentPlanItemAction;
}): WeeklyContentPlanItemActionResult {
  const state = getWeeklyContentPlanState();
  const item = state.items.find((candidate) => candidate.id === itemId);

  if (!item) {
    return {
      ok: false,
      action: "check",
      item: null,
      summary: state.summary,
      items: state.items,
      message: "Weekly plan row was not found.",
    };
  }

  if (action === "open") {
    return {
      ok: true,
      action: "check",
      item,
      summary: state.summary,
      items: state.items,
      message: `${item.channelName}: ${item.title}`,
    };
  }

  if (item.status === "published" || item.telegramMessageId) {
    return {
      ok: false,
      action: "check",
      item,
      summary: state.summary,
      items: state.items,
      message: "Published post was not changed. Duplicate protection is active.",
    };
  }

  if (action === "delete") {
    const items = state.items.filter((candidate) => candidate.id !== itemId);
    const next = { ...state, updatedAt: new Date().toISOString(), items, summary: buildSummary(items) };
    writeState(next);

    return {
      ok: true,
      action: "check",
      item: null,
      summary: next.summary,
      items: next.items,
      message: "Row removed from queue.",
    };
  }

  const updatedAt = new Date().toISOString();
  const items: WeeklyContentPlanItem[] = [];

  for (const current of state.items) {
    if (current.id !== itemId) {
      items.push(current);
      continue;
    }

    if (action === "block" || action === "skip") {
      items.push({
        ...current,
        status: "blocked",
        qualityIssues: Array.from(new Set([...current.qualityIssues, action === "skip" ? "manual_skipped" : "manual_blocked"])),
        updatedAt,
      });
      continue;
    }

    const shouldRegenerateText = action === "regenerate_text" || action === "regenerate_full";
    const shouldRegenerateImage = action === "regenerate_image" || action === "regenerate_full";
    const title = shouldRegenerateText ? buildTitle(current.channelId, current.contentTopic) : current.title;
    const body = shouldRegenerateText ? buildBody(current.channelId, current.contentTopic) : current.body;
    const image =
      shouldRegenerateImage
        ? ensureWeeklyImage({ channelId: current.channelId, postId: current.postId, dateKey: current.contentPlanDate, title, topic: current.contentTopic, force: true })
        : { ok: existsSync(current.telegramImagePath), publicUrl: current.imageUrl, filePath: current.telegramImagePath };

    const repaired = applyQualityGate(
      validatePlanItem({
        ...current,
        title,
        body,
        textLength: body.length,
        imageUrl: image.publicUrl,
        imagePath: image.filePath,
        telegramImagePath: image.filePath,
        telegramImageStatus: image.ok ? "OK" : "conversion_failed",
        imageQuality: image.ok ? "strong" : "weak",
        visualStyle: "visualMode" in image ? `${image.visualMode}, ${image.rubricLabel}` : current.visualStyle,
        visualPreset: "visualMode" in image ? image.visualMode : current.visualPreset,
        visualVersion: "premium_v2",
        visualGeneratedAt: "visualMode" in image ? updatedAt : current.visualGeneratedAt,
        visualMetadata:
          "visualMode" in image
            ? { mode: image.visualMode, rubric: image.rubricLabel, overlay: "channel/rubric/title only", serviceLabels: false }
            : current.visualMetadata,
        updatedAt,
      }),
      items,
    );
    items.push(action === "mark_ready" && repaired.qualityIssues.length === 0 ? { ...repaired, status: "ready_to_publish" } : repaired);
  }

  const next = { ...state, updatedAt, items, summary: buildSummary(items) };
  writeState(next);
  const updatedItem = next.items.find((candidate) => candidate.id === itemId) ?? null;

  return {
    ok: Boolean(updatedItem && updatedItem.status !== "blocked"),
    action: "check",
    item: updatedItem,
    summary: next.summary,
    items: next.items,
    message: updatedItem ? `${updatedItem.channelName}: ${updatedItem.status}` : "Row updated.",
  };
}

export function markWeeklyPlanPublishResult({
  itemId,
  result,
  telegramMessageId = null,
  error = null,
}: {
  itemId: string;
  result: "success" | "failed" | "blocked" | "skipped";
  telegramMessageId?: number | null;
  error?: string | null;
}) {
  const state = getWeeklyContentPlanState();
  const updatedAt = new Date().toISOString();
  const items = state.items.map((item) => {
    if (item.id !== itemId && item.postId !== itemId) return item;

    if (item.status === "published" || item.telegramMessageId) {
      return item;
    }

    if (result === "success") {
      return {
        ...item,
        status: "published" as const,
        publishResult: "success" as const,
        telegramMessageId,
        telegramPublishedAt: updatedAt,
        updatedAt,
      };
    }

    if (result === "failed") {
      return {
        ...item,
        publishResult: "failed" as const,
        qualityIssues: Array.from(new Set([...item.qualityIssues, error ?? "publish_failed"])),
        updatedAt,
      };
    }

    return {
      ...item,
      status: "blocked" as const,
      qualityIssues: Array.from(new Set([...item.qualityIssues, error ?? result])),
      updatedAt,
    };
  });
  const next = { ...state, updatedAt, items, summary: buildSummary(items) };
  writeState(next);

  return next.items.find((item) => item.id === itemId || item.postId === itemId) ?? null;
}

function emptyState(): WeeklyContentPlanState {
  const items: WeeklyContentPlanItem[] = [];
  return {
    version: 1,
    generatedAt: null,
    updatedAt: new Date().toISOString(),
    items,
    summary: buildSummary(items),
  };
}

function writeState(state: WeeklyContentPlanState) {
  mkdirSync(path.dirname(planPath), { recursive: true });
  writeFileSync(planPath, JSON.stringify({ ...state, summary: buildSummary(state.items) }, null, 2), "utf8");
}

function validatePlanItem(item: WeeklyContentPlanItem): WeeklyContentPlanItem {
  const imageExists = Boolean(item.telegramImagePath && existsSync(item.telegramImagePath));
  const imageValidation = imageExists ? validatePremiumVisual(item.telegramImagePath, `${item.title}\n${item.contentTopic}`) : null;
  const inputText = `${item.title}\n${item.body}\n${item.telegramCaption ?? ""}`;
  const invalidText =
    hasBrokenText(inputText) ||
    isFailedGenerationText(inputText) ||
    !validateCurrencyPolicy(inputText).ok;
  const caption = buildTelegramCaption({ title: item.title, body: item.body });

  return {
    ...item,
    provider: item.provider ?? (item.visualVersion === "premium_v2" ? "local_template" : undefined),
    fallbackProvider: item.fallbackProvider ?? "local_template",
    fallbackUsed: item.fallbackUsed ?? false,
    premiumVersion: item.premiumVersion ?? item.visualVersion ?? (item.visualVersion === "premium_v2" ? "premium_v2" : undefined),
    source: item.source ?? providerSource((item.provider ?? "local_template") as ImageProviderType),
    textLength: item.body.length,
    telegramCaption: invalidText ? "" : caption.caption,
    telegramCaptionLength: invalidText ? 0 : caption.length,
    telegramCaptionStatus: invalidText ? "invalid_text" : caption.status,
    telegramImageStatus: imageValidation?.ok ? "OK" : imageExists ? "broken_file" : "missing",
    imageQuality: imageValidation?.qualityStatus ?? "weak",
    imageDimensions: imageValidation?.width && imageValidation.height ? { width: imageValidation.width, height: imageValidation.height } : item.imageDimensions ?? null,
  };
}

function applyQualityGate(item: WeeklyContentPlanItem, context: WeeklyContentPlanItem[]): WeeklyContentPlanItem {
  const qualityIssues: string[] = [];
  const combinedText = `${item.title}\n${item.body}\n${item.telegramCaption}`;
  const duplicateTopic = hasDuplicateTopic(item, context);

  if (!item.title.trim()) qualityIssues.push("missing_title");
  if (!item.body.trim()) qualityIssues.push("missing_text");
  if (item.textLength < 500) qualityIssues.push("text_too_short");
  if (item.textLength > 1200) qualityIssues.push("text_too_long");
  if (hasBrokenText(combinedText) || isFailedGenerationText(combinedText)) qualityIssues.push("mojibake_or_failed_generation");
  qualityIssues.push(...findGenericContentIssues({ channelId: item.channelId, title: item.title, body: item.body, topic: item.contentTopic }));
  if (!validateCurrencyPolicy(combinedText).ok) qualityIssues.push("forbidden_currency_detected");
  if (item.telegramCaptionStatus === "missing") qualityIssues.push("missing_telegram_caption");
  if (item.telegramCaptionStatus === "invalid_text") qualityIssues.push("invalid_telegram_caption_text");
  if (item.telegramCaptionStatus === "too_long" || item.telegramCaptionLength > telegramCaptionSafeLimit) qualityIssues.push("needs_caption_fix");
  if (item.telegramCaptionStatus === "OK" && item.telegramCaptionLength < 300) qualityIssues.push("telegram_caption_too_short");
  if (!item.telegramImagePath || item.telegramImageStatus !== "OK") qualityIssues.push("telegram_image_not_ready");
  if (item.imageDimensions && Math.abs(item.imageDimensions.width / item.imageDimensions.height - premiumVisualAspectRatio) > 0.04) qualityIssues.push("image_quality_failed");
  if (item.imageQuality === "weak") qualityIssues.push("weak_image");
  if (hasServiceVisualLabel(`${item.title}\n${item.contentTopic}\n${JSON.stringify(item.visualMetadata ?? {})}`)) qualityIssues.push("service_visual_label_detected");
  if (!item.provider) qualityIssues.push("provider_metadata_missing");
  if (item.provider && item.provider !== "local_template" && !item.fallbackUsed) qualityIssues.push("provider_status_not_confirmed");
  if (item.fallbackUsed && item.fallbackProvider !== "local_template") qualityIssues.push("provider_fallback_not_safe");
  if (duplicateTopic) qualityIssues.push(`duplicate_topic_last_${forbiddenTopicLookbackDays}_days`);

  const textQuality = getTextQuality(item.body, qualityIssues);
  const imageQuality = qualityIssues.includes("weak_image") || qualityIssues.includes("telegram_image_not_ready") ? "weak" : item.imageQuality;
  const status = qualityIssues.length === 0 && textQuality !== "weak" && imageQuality !== "weak" ? "ready_to_publish" : "blocked";

  return {
    ...item,
    textQuality,
    imageQuality,
    status: item.status === "published" ? "published" : status,
    duplicateTopic,
    qualityIssues,
    updatedAt: new Date().toISOString(),
  };
}

function buildSummary(items: WeeklyContentPlanItem[]): WeeklyContentPlanSummary {
  const topicKeys = new Set(items.map((item) => `${item.channelId}:${normalizeTopic(item.contentTopic)}`));

  return {
    days: planDays,
    channels: channels.length,
    total: items.length,
    readyToPublish: items.filter(isWeeklyPlanItemReadyToPublish).length,
    scheduled: items.filter((item) => item.status === "scheduled").length,
    published: items.filter((item) => item.status === "published").length,
    blocked: items.filter((item) => item.status === "blocked").length,
    failed: items.filter((item) => item.status === "failed").length,
    weakText: items.filter((item) => item.textQuality === "weak").length,
    weakImage: items.filter((item) => item.imageQuality === "weak").length,
    telegramImageStatusOk: items.filter((item) => item.telegramImageStatus === "OK").length,
    uniqueTopics: topicKeys.size,
    duplicateTopics: items.filter((item) => item.duplicateTopic).length,
    missingImages: items.filter((item) => item.telegramImageStatus !== "OK").length,
    generatedImages: items.filter((item) => item.telegramImagePath.endsWith(".png") && existsSync(item.telegramImagePath)).length,
  };
}

export function isWeeklyPlanItemReadyToPublish(item: WeeklyContentPlanItem) {
  if (item.status !== "ready_to_publish" && item.status !== "scheduled") return false;
  if (item.telegramMessageId || item.publishResult === "success") return false;
  if (!item.title.trim() || !item.body.trim()) return false;
  if (item.textLength < 500 || item.textLength > 1200) return false;
  if (item.textQuality === "weak" || item.imageQuality === "weak") return false;
  if (!item.telegramImagePath || item.telegramImageStatus !== "OK") return false;
  if (!item.provider) return false;
  if (item.provider !== "local_template" && !item.fallbackUsed) return false;
  if (item.fallbackUsed && item.fallbackProvider !== "local_template") return false;
  if (item.telegramCaptionStatus !== "OK") return false;
  if (item.telegramCaptionLength < 300 || item.telegramCaptionLength > telegramCaptionSafeLimit) return false;
  if (item.qualityIssues.length > 0) return false;

  const combinedText = `${item.title}\n${item.body}\n${item.telegramCaption}`;
  if (hasBrokenText(combinedText) || isFailedGenerationText(combinedText)) return false;
  if (!validateCurrencyPolicy(combinedText).ok) return false;

  return true;
}

export function normalizeWeeklyContentPlanSchedule() {
  const state = getWeeklyContentPlanState();
  const updatedAt = new Date().toISOString();
  let changed = 0;
  const items = state.items.map((item) => {
    if (item.status === "published" || item.telegramMessageId) return item;
    const slot = getContentCalendarSlot(item.channelId);
    const scheduledAt = zonedDateTimeToUtcIso(item.contentPlanDate, slot.time, contentCalendarTimezone);
    if (item.scheduledAt === scheduledAt && item.publishTime === slot.time) return item;
    changed += 1;
    return {
      ...item,
      scheduledAt,
      publishTime: slot.time,
      updatedAt,
    };
  });

  if (changed > 0) {
    writeState({ ...state, updatedAt, items, summary: buildSummary(items) });
  }

  return {
    ok: true,
    changed,
    total: items.length,
    message: `Content calendar schedule normalized: ${changed} unpublished rows updated. Published history was not changed.`,
  };
}

function ensureWeeklyImage({
  channelId,
  postId,
  dateKey,
  title,
  topic,
  force = false,
}: {
  channelId: string;
  postId: string;
  dateKey: string;
  title: string;
  topic?: string;
  force?: boolean;
}) {
  const folder = folderForChannel(channelId);
  const publicUrl = `/assets/telegram-posts/${dateKey}/${folder}/${postId}.png`;
  const filePath = publicPathToFilePath(publicUrl);
  const visualBrief = getChannelVisualBrief(channelId, topic ?? title);

  try {
    if (force || !existsSync(filePath)) {
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, buildPostVisualPng({ channelId, postId, title, topic, visualMode: visualBrief.visualMode }));
    }

    const size = statSync(filePath).size;
    return { ok: size > 64, publicUrl, filePath, visualMode: visualBrief.visualMode, rubricLabel: visualBrief.rubricLabel };
  } catch {
    return { ok: false, publicUrl, filePath, visualMode: visualBrief.visualMode, rubricLabel: visualBrief.rubricLabel };
  }
}

function buildTitle(channelId: string, topic: string) {
  return generateChannelPostContent(channelId, topic).title;
}

function buildBody(channelId: string, topic: string) {
  return generateChannelPostContent(channelId, topic).body;
}

function getTextQuality(body: string, issues: string[]): PostQuality {
  if (issues.some((issue) => issue.includes("text") || issue.includes("mojibake") || issue.includes("forbidden"))) return "weak";
  if (body.length >= 650 && body.includes("\n\n")) return "strong";
  return "medium";
}

function hasDuplicateTopic(item: WeeklyContentPlanItem, context: WeeklyContentPlanItem[]) {
  const topic = normalizeTopic(item.contentTopic);
  const currentDate = new Date(item.contentPlanDate).getTime();

  return context.some((candidate) => {
    if (candidate.channelId !== item.channelId) return false;
    if (normalizeTopic(candidate.contentTopic) !== topic) return false;
    const candidateDate = new Date(candidate.contentPlanDate).getTime();
    const diffDays = Math.abs(currentDate - candidateDate) / 86_400_000;
    return diffDays < forbiddenTopicLookbackDays;
  });
}

function normalizeTopic(topic: string) {
  return topic.trim().toLowerCase();
}

function capitalize(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

function getTopic(channelId: string, dayIndex: number) {
  return getChannelRubric(channelId, dayIndex);
}

function folderForChannel(channelId: string) {
  return channelPostImageFolders[channelId] ?? channelId;
}

function isUkrainianChannel(channelId: string) {
  return channelId === "ukraine-market" || channelId === "dnipro-city";
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildScheduledAt(date: Date, index: number) {
  const dateKey = getZonedNow(date, contentCalendarTimezone).dateKey;
  const slot = getContentCalendarSlot(channels[index]?.id ?? "", index);
  return zonedDateTimeToUtcIso(dateKey, slot.time, contentCalendarTimezone);
}

function formatClock(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
