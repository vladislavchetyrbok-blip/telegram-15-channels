import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { missingPostImageMessage, validatePostHasImage } from "@/lib/post-media";
import { getPostDraftById, listPostDrafts } from "@/lib/post-draft-store";
import { validateTelegramSendSafety } from "@/lib/telegram-safety";
import { checkTelegramConfig, validateTelegramSettings } from "@/lib/telegram";
import type { PublicationScheduleItem, PublicationScheduleLog } from "@/types";

interface ScheduleStore {
  items: PublicationScheduleItem[];
  logs: PublicationScheduleLog[];
}

interface CreateScheduleInput {
  draftId: string;
  scheduledFor?: string;
  allowDuplicate?: boolean;
}

interface ScheduleMutationResult {
  ok: boolean;
  item?: PublicationScheduleItem;
  error?: string;
}

const timezone = "Europe/Kyiv";
const scheduleStoragePath = join(process.cwd(), "data", "runtime", "scheduled-posts.json");
const scheduleLogsStoragePath = join(process.cwd(), "data", "runtime", "scheduled-post-logs.json");

const suggestedTimes = [
  "09:00",
  "09:15",
  "09:35",
  "10:00",
  "10:20",
  "13:00",
  "13:15",
  "13:35",
  "14:00",
  "14:20",
  "18:00",
  "18:15",
  "18:35",
  "19:00",
  "19:20",
];

const dailyTimes = [
  ["09:00", "18:00"],
  ["09:15", "18:15"],
  ["09:35"],
  ["10:00", "18:35"],
  ["10:20"],
  ["13:00", "19:00"],
  ["13:15", "19:20"],
  ["13:35"],
  ["14:00", "20:00"],
  ["14:20"],
  ["09:50", "18:50"],
  ["10:10"],
  ["13:50", "20:20"],
  ["14:10"],
  ["14:30", "20:40"],
];

const globalForSchedule = globalThis as typeof globalThis & {
  __telegramPublicationScheduleStore?: ScheduleStore;
};

const store =
  globalForSchedule.__telegramPublicationScheduleStore ??
  (globalForSchedule.__telegramPublicationScheduleStore = {
    items: readPersistedScheduleItems(),
    logs: readPersistedScheduleLogs(),
  });

export function getPublicationScheduleState() {
  const drafts = listPostDrafts();
  const items = listPublicationScheduleItems();
  const telegram = checkTelegramConfig();

  return {
    ok: true,
    mode: "dry-run" as const,
    dryRun: true,
    telegramSent: false,
    realSendsTotal: telegram.realSendsTotal,
    timezone,
    suggestedTimes,
    baseSchedule: getBaseChannelSchedule(),
    approvedDrafts: drafts.filter((draft) => draft.status === "approved"),
    items,
    counters: {
      channelsTotal: channelGenerationConfigs.length,
      drafts: drafts.length,
      approved: drafts.filter((draft) => draft.status === "approved").length,
      scheduled: items.filter((item) => item.status === "scheduled" || item.status === "dry_run_ready").length,
      cancelled: items.filter((item) => item.status === "cancelled").length,
      dryRunReady: items.filter((item) => item.status === "dry_run_ready").length,
      dryRunSent: items.filter((item) => item.status === "dry_run_sent").length,
      realSent: telegram.realSendsTotal,
    },
    calendar: {
      today: filterScheduleByRange(items, 0, 1),
      tomorrow: filterScheduleByRange(items, 1, 2),
      week: filterScheduleByRange(items, 0, 7),
    },
    logs: listPublicationScheduleLogs(),
  };
}

export function listPublicationScheduleItems() {
  return [...store.items].sort((left, right) => left.scheduledFor.localeCompare(right.scheduledFor));
}

export function listPublicationScheduleLogs() {
  return [...store.logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

export function createPublicationSchedule(input: CreateScheduleInput): ScheduleMutationResult {
  return createPublicationScheduleFromDraft(input);
}

export function createPublicationScheduleFromDraft({
  draftId,
  scheduledFor,
  allowDuplicate = false,
}: CreateScheduleInput): ScheduleMutationResult {
  const telegram = validateTelegramSettings();

  if (!telegram.config.dryRun) {
    return { ok: false, error: "Telegram dry-run is disabled. Real scheduling is blocked." };
  }

  if (checkTelegramConfig().realSendingEnabled) {
    return { ok: false, error: "Real Telegram sending is enabled. Scheduling is blocked for safety." };
  }

  const draft = getPostDraftById(draftId);

  if (!draft) {
    return { ok: false, error: "Approved draft was not found." };
  }

  if (draft.status !== "approved") {
    return { ok: false, error: "Only approved drafts can be scheduled." };
  }

  if (!validateCurrencyPolicy(draft.content).ok) {
    return { ok: false, error: "Forbidden currency detected" };
  }

  if (!validatePostHasImage(draft)) {
    return { ok: false, error: missingPostImageMessage };
  }

  const existingActive = store.items.find(
    (item) => item.draftId === draft.id && item.status !== "cancelled",
  );

  if (existingActive && !allowDuplicate) {
    return { ok: false, item: existingActive, error: "Draft is already scheduled. Pass allowDuplicate=true to schedule another slot." };
  }

  const targetTime = scheduledFor || getNextSlotForChannel(draft.channelId);

  if (!isFutureDate(targetTime)) {
    return { ok: false, error: "scheduledFor must be in the future." };
  }

  const now = new Date().toISOString();
  const item: PublicationScheduleItem = {
    id: createId("schedule"),
    channelId: draft.channelId,
    channelTitle: draft.channelTitle ?? draft.channelName ?? draft.channelId,
    telegramChatId: draft.telegramChatId,
    draftId: draft.id,
    contentPreview: createPreview(draft.content),
    scheduledFor: targetTime,
    timezone,
    status: "scheduled",
    dryRun: true,
    telegramSent: false,
    createdAt: now,
    updatedAt: now,
  };

  draft.scheduledFor = item.scheduledFor;
  draft.updatedAt = now;
  draft.telegramSent = false;
  store.items.unshift(item);
  persistScheduleItems();
  addScheduleLog(item, "scheduledPostCreated");

  return { ok: true, item };
}

export function cancelPublicationSchedule(id: string): ScheduleMutationResult {
  const item = findScheduleItem(id);

  if (!item) {
    return { ok: false, error: "Schedule item was not found." };
  }

  item.status = "cancelled";
  item.updatedAt = new Date().toISOString();
  item.telegramSent = false;
  persistScheduleItems();
  addScheduleLog(item, "scheduledPostCancelled");

  return { ok: true, item };
}

export function previewPublicationSchedule(id: string): ScheduleMutationResult {
  const item = findScheduleItem(id);

  if (!item) {
    return { ok: false, error: "Schedule item was not found." };
  }

  if (item.status === "scheduled") {
    item.status = "dry_run_ready";
    item.updatedAt = new Date().toISOString();
    persistScheduleItems();
  }

  addScheduleLog(item, "scheduledPostPreviewed");

  return { ok: true, item };
}

export function dryRunSendPublicationSchedule(id: string): ScheduleMutationResult {
  const telegram = validateTelegramSettings();

  if (!telegram.config.dryRun) {
    return { ok: false, error: "Telegram dry-run is disabled. Real sendMessage is blocked." };
  }

  if (checkTelegramConfig().realSendingEnabled) {
    return { ok: false, error: "Real Telegram sending is enabled. Dry-run endpoint is blocked for safety." };
  }

  const item = findScheduleItem(id);

  if (!item) {
    return { ok: false, error: "Schedule item was not found." };
  }

  if (item.status === "cancelled") {
    return { ok: false, item, error: "Cancelled schedule item cannot be sent in dry-run." };
  }

  const draft = getPostDraftById(item.draftId);

  if (!draft) {
    return { ok: false, item, error: "Draft was not found." };
  }

  if (draft.status !== "approved") {
    return { ok: false, item, error: "Only approved drafts can be dry-run sent from schedule." };
  }

  if (!validateCurrencyPolicy(draft.content).ok) {
    draft.status = "needs_revision";
    draft.validationReasons = Array.from(new Set([...(draft.validationReasons ?? []), "Forbidden currency detected"]));
    draft.updatedAt = new Date().toISOString();

    return { ok: false, item, error: "Forbidden currency detected" };
  }

  if (!validatePostHasImage(draft)) {
    return { ok: false, item, error: missingPostImageMessage };
  }

  const safety = validateTelegramSendSafety({
    channelId: item.channelId,
    telegramChatId: item.telegramChatId,
    draftId: item.draftId,
    draftStatus: draft.status,
  });

  if (!safety.dryRun && !safety.canSendReal) {
    return { ok: false, item, error: safety.reasons.join(" ") || "Telegram safety check failed." };
  }

  item.status = "dry_run_sent";
  item.updatedAt = new Date().toISOString();
  item.telegramSent = false;
  persistScheduleItems();
  addScheduleLog(item, "scheduledDryRunSent");

  draft.updatedAt = item.updatedAt;
  draft.telegramSent = false;

  return { ok: true, item };
}

function getBaseChannelSchedule() {
  return channelGenerationConfigs.map((channel, index) => ({
    id: `base-${channel.id}`,
    channelId: channel.id,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    timezone,
    windows: {
      morning: "09:00-11:00",
      day: "13:00-15:00",
      evening: "18:00-21:00",
    },
    times: dailyTimes[index] ?? ["10:00"],
    nextPublicationAt: getNextSlotForChannel(channel.id),
    dryRun: true,
    telegramSent: false,
  }));
}

function getNextSlotForChannel(channelId: string) {
  const channelIndex = channelGenerationConfigs.findIndex((channel) => channel.id === channelId);
  const times = dailyTimes[channelIndex] ?? ["10:00"];
  const now = new Date();
  const today = formatDate(now);

  for (const time of times) {
    const candidate = new Date(`${today}T${time}:00+03:00`);

    if (candidate.getTime() > now.getTime()) {
      return `${today}T${time}:00+03:00`;
    }
  }

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return `${formatDate(tomorrow)}T${times[0]}:00+03:00`;
}

function filterScheduleByRange(items: PublicationScheduleItem[], startDays: number, endDays: number) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + startDays);
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + endDays);

  return items.filter((item) => {
    const time = new Date(item.scheduledFor).getTime();

    return time >= start.getTime() && time < end.getTime();
  });
}

function findScheduleItem(id: string) {
  return store.items.find((item) => item.id === id);
}

function addScheduleLog(item: PublicationScheduleItem, action: PublicationScheduleLog["action"]) {
  store.logs.unshift({
    scheduleId: item.id,
    draftId: item.draftId,
    channelId: item.channelId,
    action,
    status: item.status,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
  persistScheduleLogs();
}

function readPersistedScheduleItems() {
  try {
    if (!existsSync(scheduleStoragePath)) {
      return [];
    }

    const raw = readFileSync(scheduleStoragePath, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? (parsed as PublicationScheduleItem[]) : [];
  } catch {
    return [];
  }
}

function readPersistedScheduleLogs() {
  try {
    if (!existsSync(scheduleLogsStoragePath)) {
      return [];
    }

    const raw = readFileSync(scheduleLogsStoragePath, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? (parsed as PublicationScheduleLog[]) : [];
  } catch {
    return [];
  }
}

function persistScheduleItems() {
  try {
    mkdirSync(dirname(scheduleStoragePath), { recursive: true });
    writeFileSync(scheduleStoragePath, JSON.stringify(store.items, null, 2), "utf8");
  } catch {
    // Local mock persistence must not break safe scheduling.
  }
}

function persistScheduleLogs() {
  try {
    mkdirSync(dirname(scheduleLogsStoragePath), { recursive: true });
    writeFileSync(scheduleLogsStoragePath, JSON.stringify(store.logs, null, 2), "utf8");
  } catch {
    // Local mock persistence must not break safe scheduling.
  }
}

function isFutureDate(value: string) {
  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) && timestamp > Date.now();
}

function createPreview(content: string) {
  return content.length > 220 ? `${content.slice(0, 217)}...` : content;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
