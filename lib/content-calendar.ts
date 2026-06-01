import { existsSync } from "node:fs";
import { channels } from "@/data/channels";
import { getCanonicalChannelTitle } from "@/lib/channel-canonical";
import { findGenericContentIssues, getChannelVisualBrief, hasServiceVisualLabel } from "@/lib/channel-content-strategy";
import { getTelegramConfig } from "@/lib/telegram";
import { listTelegramTargetBindings } from "@/lib/telegram-target-store";
import {
  contentCalendarDailySlots,
  getContentCalendarSlot,
  getWeeklyContentPlanState,
  isWeeklyPlanItemReadyToPublish,
  type WeeklyContentPlanItem,
} from "@/lib/weekly-content-plan";

export type ContentCalendarQueueStatus = "planned" | "ready" | "published" | "skipped" | "error" | "needs_review";
export type ContentCalendarQualityStatus = "ready" | "blocked" | "needs_review";

export interface ContentCalendarItem {
  id: string;
  date: string;
  time: string;
  timezone: "Europe/Kyiv";
  channelId: string;
  channelName: string;
  language: "ru" | "uk";
  rubric: string;
  category: string;
  title: string;
  shortDescription: string;
  postText: string;
  visualBrief: string;
  visualPath: string;
  visualConfig: Record<string, unknown>;
  qualityStatus: ContentCalendarQualityStatus;
  qualityIssues: string[];
  status: ContentCalendarQueueStatus;
  message_id: number | null;
  link: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentCalendarAudit {
  ok: boolean;
  checkedAt: string;
  expectedRows: number;
  totalRows: number;
  expectedDays: number;
  days: string[];
  channelsPerDay: Array<{ date: string; count: number; missing: string[]; extra: string[] }>;
  duplicateTitles: string[];
  serviceLabels: string[];
  genericText: string[];
  emptyImages: string[];
  missingTimes: string[];
  timezoneErrors: string[];
  timeCollisions: string[];
  preservedPublishedWarnings: string[];
  summary: {
    ready: number;
    planned: number;
    published: number;
    skipped: number;
    error: number;
    needsReview: number;
  };
}

const timezone = "Europe/Kyiv" as const;
const expectedRows = 105;
const serviceLabelTerms = ["PREMIUM_V2", "TELEGRAM READY", "debug label", "version label", "service label"];

export function getContentCalendarState() {
  const weekly = getWeeklyContentPlanState();
  const items = weekly.items
    .map(normalizeCalendarItem)
    .sort((a, b) => `${a.date} ${a.time} ${a.channelId}`.localeCompare(`${b.date} ${b.time} ${b.channelId}`));

  return {
    ok: items.length === expectedRows,
    generatedAt: weekly.generatedAt,
    updatedAt: weekly.updatedAt,
    timezone,
    expectedRows,
    slots: contentCalendarDailySlots,
    summary: buildCalendarSummary(items),
    items,
  };
}

export function getContentCalendarPreview(id: string) {
  const state = getContentCalendarState();
  const item = state.items.find((candidate) => candidate.id === id) ?? null;

  return {
    ok: Boolean(item),
    preview: item
      ? {
          id: item.id,
          channelId: item.channelId,
          channelName: item.channelName,
          date: item.date,
          time: item.time,
          timezone: item.timezone,
          title: item.title,
          text: item.postText,
          imagePath: item.visualPath,
          visualBrief: item.visualBrief,
          qualityIssues: item.qualityIssues,
          qualityStatus: item.qualityStatus,
          canPublish: item.status === "ready" && item.qualityStatus === "ready" && item.qualityIssues.length === 0 && Boolean(item.visualPath),
        }
      : null,
    message: item ? "Content calendar preview loaded. Telegram was not touched." : "Content calendar item was not found.",
  };
}

export function auditContentCalendar(): ContentCalendarAudit {
  const checkedAt = new Date().toISOString();
  const state = getContentCalendarState();
  const items = state.items;
  const channelIds = channels.map((channel) => channel.id);
  const days = Array.from(new Set(items.map((item) => item.date))).sort();
  const blockers: string[] = [];
  const nonPublished = items.filter((item) => item.status !== "published");
  const preservedPublishedWarnings: string[] = [];

  const channelsPerDay = days.map((date) => {
    const ids = items.filter((item) => item.date === date).map((item) => item.channelId);
    return {
      date,
      count: ids.length,
      missing: channelIds.filter((channelId) => !ids.includes(channelId)),
      extra: ids.filter((channelId) => !channelIds.includes(channelId)),
    };
  });

  const duplicateTitles = findDuplicates(nonPublished.map((item) => item.title.trim().toLowerCase()).filter(Boolean));
  const serviceLabels = nonPublished
    .filter((item) => hasServiceVisualLabel(`${item.title}\n${item.rubric}\n${item.visualBrief}`) || serviceLabelTerms.some((term) => `${item.title}\n${item.postText}\n${item.visualBrief}`.toLowerCase().includes(term.toLowerCase())))
    .map((item) => item.id);
  const genericText = nonPublished.filter((item) => item.qualityIssues.some((issue) => issue.includes("generic") || issue.includes("topic_mismatch"))).map((item) => item.id);
  const emptyImages = items.filter((item) => !item.visualPath || !existsSync(item.visualPath)).map((item) => item.id);
  const missingTimes = items.filter((item) => !item.time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)).map((item) => item.id);
  const timezoneErrors = items.filter((item) => item.timezone !== timezone).map((item) => item.id);
  const timeCollisions = findTimeCollisions(items);

  for (const item of items.filter((candidate) => candidate.status === "published")) {
    if (item.qualityIssues.some((issue) => issue.includes("generic") || issue.includes("service"))) {
      preservedPublishedWarnings.push(`${item.id}: historical published item was not changed`);
    }
  }

  if (items.length !== expectedRows) blockers.push("wrong_row_count");
  if (days.length !== 7) blockers.push("wrong_day_count");
  if (channelsPerDay.some((day) => day.count !== channelIds.length || day.missing.length || day.extra.length)) blockers.push("wrong_channels_per_day");
  if (duplicateTitles.length) blockers.push("duplicate_titles");
  if (serviceLabels.length) blockers.push("service_labels");
  if (genericText.length) blockers.push("generic_text");
  if (emptyImages.length) blockers.push("empty_images");
  if (missingTimes.length) blockers.push("missing_times");
  if (timezoneErrors.length) blockers.push("timezone_errors");
  if (timeCollisions.length) blockers.push("time_collisions");

  return {
    ok: blockers.length === 0,
    checkedAt,
    expectedRows,
    totalRows: items.length,
    expectedDays: 7,
    days,
    channelsPerDay,
    duplicateTitles,
    serviceLabels,
    genericText,
    emptyImages,
    missingTimes,
    timezoneErrors,
    timeCollisions,
    preservedPublishedWarnings,
    summary: state.summary,
  };
}

function normalizeCalendarItem(item: WeeklyContentPlanItem): ContentCalendarItem {
  const slot = getContentCalendarSlot(item.channelId);
  const visual = getChannelVisualBrief(item.channelId, item.contentTopic || item.title);
  const target = listTelegramTargetBindings().find((binding) => binding.channelId === item.channelId)?.telegramTarget ?? "";
  const qualityIssues = normalizeQualityIssues(item);
  const status = normalizeQueueStatus(item);
  const qualityStatus = status === "published" || (isWeeklyPlanItemReadyToPublish(item) && qualityIssues.length === 0) ? "ready" : status === "needs_review" ? "needs_review" : "blocked";

  return {
    id: item.id,
    date: item.contentPlanDate,
    time: slot.time,
    timezone,
    channelId: item.channelId,
    channelName: getCanonicalChannelTitle(item.channelId, item.channelName),
    language: item.language,
    rubric: item.contentTopic,
    category: visual.rubricLabel,
    title: item.title,
    shortDescription: buildShortDescription(item.body),
    postText: item.body,
    visualBrief: `${visual.rubricLabel}: ${visual.visualMode}`,
    visualPath: item.telegramImagePath || item.imagePath,
    visualConfig: {
      imageUrl: item.imageUrl,
      visualStyle: item.visualStyle,
      visualPreset: item.visualPreset,
      visualVersion: item.visualVersion,
      provider: item.provider,
      source: item.source,
      metadata: item.visualMetadata ?? {},
    },
    qualityStatus,
    qualityIssues,
    status,
    message_id: item.telegramMessageId ?? null,
    link: buildTelegramMessageLink(target, item.telegramMessageId ?? null),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function normalizeQueueStatus(item: WeeklyContentPlanItem): ContentCalendarQueueStatus {
  if (item.status === "published" || item.telegramMessageId) return "published";
  if (item.publishResult === "failed") return "error";
  if (item.qualityIssues.includes("manual_skipped")) return "skipped";
  if (item.status === "blocked") return "needs_review";
  if (item.status === "ready_to_publish" || item.status === "scheduled") return "ready";
  return "planned";
}

function normalizeQualityIssues(item: WeeklyContentPlanItem) {
  const issues = new Set(item.qualityIssues);
  for (const issue of findGenericContentIssues({ channelId: item.channelId, title: item.title, body: item.body, topic: item.contentTopic })) {
    issues.add(issue);
  }
  if (hasServiceVisualLabel(`${item.title}\n${item.contentTopic}\n${JSON.stringify(item.visualMetadata ?? {})}`)) {
    issues.add("service_visual_label_detected");
  }
  if (!item.telegramImagePath || !existsSync(item.telegramImagePath)) issues.add("telegram_image_missing");
  return Array.from(issues);
}

function buildShortDescription(body: string) {
  const oneLine = body.replace(/\s+/g, " ").trim();
  return oneLine.length > 180 ? `${oneLine.slice(0, 177)}...` : oneLine;
}

function buildCalendarSummary(items: ContentCalendarItem[]) {
  return {
    ready: items.filter((item) => item.status === "ready").length,
    planned: items.filter((item) => item.status === "planned").length,
    published: items.filter((item) => item.status === "published").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    error: items.filter((item) => item.status === "error").length,
    needsReview: items.filter((item) => item.status === "needs_review").length,
  };
}

function findDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value);
    seen.add(value);
  }
  return Array.from(duplicate);
}

function findTimeCollisions(items: ContentCalendarItem[]) {
  const seen = new Set<string>();
  const collisions = new Set<string>();
  for (const item of items) {
    const key = `${item.date}:${item.time}`;
    if (seen.has(key)) collisions.add(key);
    seen.add(key);
  }
  return Array.from(collisions);
}

function buildTelegramMessageLink(telegramTarget: string | null | undefined, messageId: number | null | undefined) {
  if (!telegramTarget || !messageId) return null;
  if (telegramTarget.startsWith("-100")) return `https://t.me/c/${telegramTarget.slice(4)}/${messageId}`;
  if (telegramTarget.startsWith("@")) return `https://t.me/${telegramTarget.slice(1)}/${messageId}`;
  return null;
}

export function getContentCalendarReadiness() {
  const state = getContentCalendarState();
  const telegram = getTelegramConfig();
  const targets = listTelegramTargetBindings();

  return {
    tokenConfigured: telegram.tokenStatus === "configured",
    linkedChannels: targets.filter((target) => Boolean(target.telegramTarget)).length,
    totalChannels: channels.length,
    readyItems: state.summary.ready,
    needsReview: state.summary.needsReview,
  };
}
