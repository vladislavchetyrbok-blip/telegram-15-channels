import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { channels } from "@/data/channels";
import { posts } from "@/data/posts";
import { auditPostQuality, improveWeakPostMaterials } from "@/lib/post-quality";
import { checkTelegramChannelAccess } from "@/lib/telegram-access";
import { getTelegramConfig } from "@/lib/telegram";
import { auditTelegramPostImages } from "@/lib/telegram-post-images";
import { runTelegramQuickPublish, sendPhotoToTelegramChannel, type QuickPublishMode } from "@/lib/telegram-quick-publish";
import { listTelegramTargetBindings } from "@/lib/telegram-target-store";
import {
  checkWeeklyContentPlan,
  clearBlockedWeeklyContentPlan,
  findWeeklyPlanItemForChannelDate,
  generateWeeklyContentPlan,
  getWeeklyContentPlanState,
  improveWeakWeeklyContentPlan,
  isWeeklyPlanItemReadyToPublish,
  markWeeklyPlanPublishResult,
  repairWeeklyTelegramCaptions,
  runWeeklyContentPlanItemAction,
  scheduleReadyWeeklyContentPlan,
  type WeeklyContentPlanItem,
  type WeeklyContentPlanSummary,
  type WeeklyContentPlanItemAction,
} from "@/lib/weekly-content-plan";
import { hasBrokenText, isFailedGenerationText } from "@/lib/text-quality";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { checkAllTelegramAccess, getLastTelegramAccessDiagnostics } from "@/lib/telegram-diagnostics";
import { getCanonicalChannelTitle } from "@/lib/channel-canonical";
import { buildTelegramCaption, telegramCaptionSafeLimit } from "@/lib/telegram-caption";
import {
  getTwiceWeeklyAutopublishSchedule,
  isScheduledAutopublishDue,
  type TwiceWeeklyAutopublishSchedule,
} from "@/lib/autopublish-schedule";
import { findGenericContentIssues, hasServiceVisualLabel } from "@/lib/channel-content-strategy";

const statePath = path.join(process.cwd(), "data", "runtime", "autopublish.json");
const workerHeartbeatPath = path.join(process.cwd(), "data", "runtime", "autopublish-worker-heartbeat.json");
const runLockPath = path.join(process.cwd(), "data", "runtime", "autopublish-run.lock");
const manualMassPublishDelayMs = 3_000;

export type AutopublishStrategy = "manual_now" | "spread_day" | "custom_schedule";
export type AutopublishLogResult = "success" | "failed" | "blocked" | "skipped" | "already_published";
export type AutopublishMode = "daily schedule" | "manual" | "paused" | "stopped";
type WeeklyPublishMode = "manual" | "autopublish" | "manual_mass" | "retry_failed";
export type AutopublishPlanStatus =
  | "scheduled"
  | "due"
  | "publishing"
  | "published"
  | "failed"
  | "blocked"
  | "skipped"
  | "daily_limit_reached"
  | "already_published";

export interface AutopublishConfig {
  enabled: boolean;
  pausedToday: boolean;
  emergencyStop: boolean;
  dailyLimitPerChannel: number;
  maxPostsPerDay: number;
  timeStart: string;
  timeEnd: string;
  timezone: string;
  strategy: AutopublishStrategy;
  minMinutesBetweenPosts: number;
  updatedAt: string;
}

export interface AutopublishEnablePreflight {
  ok: boolean;
  checkedAt: string;
  blockers: string[];
  telegram: {
    tokenConfigured: boolean;
    linkedTargets: number;
    botAccessOk: number;
    canPost: number;
  };
  posts: {
    readyChannels: number;
    readyPosts: number;
    weakText: number;
    weakImage: number;
    postsWithoutImages: number;
    telegramImagesOk: number;
  };
  limits: {
    dailyLimitPerChannel: number;
    maxPostsPerDay: number;
    timezone: string;
  };
}

export interface AutopublishLogEntry {
  id: string;
  mode: "manual" | "quick_publish" | "autopublish" | "manual_mass" | "retry_failed";
  date: string;
  channelId: string | null;
  channelName: string | null;
  telegramTarget: string | null;
  postId: string | null;
  title: string | null;
  imagePath: string | null;
  telegramImagePath: string | null;
  scheduledAt: string | null;
  attemptedAt: string;
  result: AutopublishLogResult;
  telegramMessageId: number | null;
  error: string | null;
  duration: number;
  retryCount: number;
  timings?: AutopublishTimingBreakdown | null;
  active?: boolean;
  resolvedAt?: string | null;
  resolution?: string | null;
}

export interface AutopublishTimingBreakdown {
  textMs: number;
  imageMs: number;
  telegramMs: number;
  totalMs: number;
}

export interface AutopublishStatus {
  ok: boolean;
  config: AutopublishConfig;
  currentMode: AutopublishMode;
  envDefaults: {
    AUTOPUBLISH_ENABLED: string;
    AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL: string;
    AUTOPUBLISH_MAX_POSTS_PER_DAY: string;
    AUTOPUBLISH_TIME_START: string;
    AUTOPUBLISH_TIME_END: string;
    AUTOPUBLISH_TIMEZONE: string;
  };
  channelsTotal: number;
  linkedTargets: number;
  botAccessOk: number;
  readyPosts: number;
  tomorrowPosts: number;
  postsWithoutImages: number;
  weakText: number;
  weakImage: number;
  telegramImagesOk: number;
  todayPublished: number;
  failedToday: number;
  skippedToday: number;
  todayErrors: number;
  blockedToday: number;
  channelsWithoutReadyPosts: string[];
  nextPublication: string | null;
  nextChannel: string | null;
  nextPost: string | null;
  scheduler: {
    intervalMinutes: number;
    status: "running" | "stopped" | "paused" | "waiting" | "error";
    lastCheck: string | null;
    nextCheck: string | null;
    lastMessage: string | null;
    runtime: "server_worker" | "dev_endpoint";
    workerRunning: boolean;
  };
  queueHealth: "OK" | "needs attention";
  telegramConnection: "OK" | "error";
  contentQuality: "OK" | "weak items found";
  schedule: Array<{
    channelId: string;
    channelName: string;
    plannedAt: string;
    strategy: AutopublishStrategy;
  }>;
  publishLog: AutopublishLogEntry[];
  todayLog: AutopublishLogEntry[];
  queue: AutopublishQueueItem[];
  todayPlan: AutopublishDailyPlanItem[];
  tomorrowPlan: AutopublishDailyPlanItem[];
  weeklyPlan: WeeklyContentPlanSummary;
  weeklyPlanItems: WeeklyContentPlanItem[];
  diagnostics: string[];
  lastManualRun: Awaited<ReturnType<typeof runTelegramQuickPublish>> | null;
  lastEnablePreflight: AutopublishEnablePreflight | null;
  message: string;
  updatedAt: string;
}

export interface TomorrowSchedulePlanItem {
  channelId: string;
  channelName: string;
  plannedAt: string;
  telegramTarget: string;
  selectedPost: string | null;
  selectedPostTitle: string | null;
  textQuality: "strong" | "medium" | "weak" | "unknown";
  imageQuality: "strong" | "medium" | "weak" | "unknown";
  telegramImageStatus: string;
  bodyLength: number;
  telegramCaptionLength: number;
  telegramCaptionStatus: string;
  status: "ready" | "blocked";
  blockerReason: string | null;
}

export interface TomorrowSchedulePlan {
  ok: boolean;
  mode: "dry-run";
  channelsTotal: number;
  planned: number;
  blocked: number;
  schedule: TomorrowSchedulePlanItem[];
  message: string;
}

export interface AutopublishDailyPlanItem {
  date: string;
  plannedAt: string;
  channelId: string;
  channelName: string;
  telegramTarget: string;
  selectedPost: string | null;
  selectedPostTitle: string | null;
  textQuality: "strong" | "medium" | "weak" | "unknown";
  imageQuality: "strong" | "medium" | "weak" | "unknown";
  telegramImageStatus: string;
  bodyLength: number;
  telegramCaptionLength: number;
  telegramCaptionStatus: string;
  status: AutopublishPlanStatus;
  blockerReason: string | null;
}

export interface ScheduledAutopublishDetail {
  channelId: string;
  channelName: string;
  postId: string | null;
  title: string | null;
  status: "published" | "skipped" | "error" | "already_published";
  reason: string | null;
  telegramMessageId: number | null;
  timings?: AutopublishTimingBreakdown | null;
}

export interface ScheduledAutopublishRunResult {
  ok: boolean;
  enabled: boolean;
  dueToday: boolean;
  schedule: TwiceWeeklyAutopublishSchedule;
  scheduledAt: string;
  totalChannels: number;
  published: number;
  skipped: number;
  errors: number;
  details: ScheduledAutopublishDetail[];
  message: string;
  checkedAt: string;
  durationMs: number | null;
}

export interface ScheduledAutopublishStatus {
  ok: boolean;
  enabled: boolean;
  days: string[];
  daysOfWeek: number[];
  time: string;
  timezone: string;
  dueToday: boolean;
  scheduledDay: boolean;
  beforeScheduledTime: boolean;
  scheduledAt: string;
  lastRun: string | null;
  totalChannels: number;
  publishedToday: number;
  waitingToday: number;
  publishedChannels: Array<{ channelId: string; channelName: string; postId: string | null; telegramMessageId: number | null }>;
  waitingChannels: Array<{ channelId: string; channelName: string; postId: string | null; title: string | null; reason: string | null }>;
  errorsToday: Array<{ channelId: string | null; channelName: string | null; error: string | null }>;
  channels: Array<{ channelId: string; channelName: string }>;
  journal: Array<{
    attemptedAt: string;
    channelId: string | null;
    channelName: string | null;
    postId: string | null;
    title: string | null;
    status: "success" | "error" | "skipped" | "already_published";
    error: string | null;
    telegramMessageId: number | null;
    timings: AutopublishTimingBreakdown | null;
  }>;
  message: string;
  checkedAt: string;
}

export type WeeklyContentPlanAction =
  | "generate_weekly_plan"
  | "check_weekly_plan"
  | "improve_weak_weekly"
  | "schedule_weekly_ready"
  | "clear_blocked_weekly"
  | "repair_captions";

interface AutopublishQueueItem {
  channelId: string;
  channelName: string;
  telegramTarget: string;
  selectedPost: string | null;
  selectedPostTitle: string | null;
  status: "ready_to_publish" | "target_missing" | "no_ready_posts" | "blocked";
  blockerReason: string | null;
  telegramImageStatus: string;
  bodyLength: number;
  telegramCaptionLength: number;
  telegramCaptionStatus: string;
  mojibakeStatus: "TEXT OK" | "BROKEN TEXT";
  realReadyStatus: "READY" | "NOT READY";
  botAccess: "not checked" | "ok" | "unknown";
}

interface AutopublishState {
  config: AutopublishConfig;
  log: AutopublishLogEntry[];
  lastManualRun: Awaited<ReturnType<typeof runTelegramQuickPublish>> | null;
  lastEnablePreflight: AutopublishEnablePreflight | null;
  schedulerLastCheck: string | null;
  schedulerNextCheck: string | null;
  schedulerLastMessage: string | null;
}

export async function getAutopublishStatus(): Promise<AutopublishStatus> {
  const state = readState();
  const quality = auditPostQuality();
  const weeklyState = getWeeklyContentPlanState();
  const queue = buildLocalAutopublishQueue(state, quality.items);
  const lastTelegramAccess = getLastTelegramAccessDiagnostics();
  const today = dayKey(new Date());
  const todayLog = state.log.filter((entry) => dayKey(new Date(entry.attemptedAt)) === today);
  const activeTodayIssues = todayLog.filter((entry) => isActiveAutopublishIssue(entry, weeklyState.items, queue, lastTelegramAccess));
  const readyByChannel = new Map<string, number>();

  for (const item of weeklyState.items) {
    if (item.status !== "ready_to_publish" && item.status !== "scheduled") continue;
    if (item.textQuality === "weak" || item.imageQuality === "weak" || item.telegramImageStatus !== "OK") continue;
    readyByChannel.set(item.channelId, (readyByChannel.get(item.channelId) ?? 0) + 1);
  }

  const channelsWithoutReadyPosts = channels
    .filter((channel) => (readyByChannel.get(channel.id) ?? 0) === 0)
    .map((channel) => channel.name);
  const schedule = buildDailySchedule(state.config);
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const todayPlan = buildDailyPlan(state, quality.items, new Date());
  const tomorrowPlan = buildDailyPlan(state, quality.items, tomorrowDate);
  const nextItem = findNextScheduledItem(todayPlan, state.config);
  const workerHeartbeat = readWorkerHeartbeat();
  const todayPublished = todayLog.filter((entry) => entry.result === "success" && Boolean(entry.postId) && Boolean(entry.telegramMessageId)).length;
  const failedToday = activeTodayIssues.filter((entry) => entry.result === "failed").length;
  const skippedToday = todayLog.filter((entry) => entry.result === "skipped").length;
  const blockedToday = activeTodayIssues.filter((entry) => entry.result === "blocked").length;
  const todayErrors = failedToday + blockedToday;
  const weeklyBlocked = weeklyState.summary.blocked;
  const weeklyReady = weeklyState.summary.readyToPublish + weeklyState.summary.scheduled;

  return {
    ok: !state.config.emergencyStop,
    config: state.config,
    currentMode: getCurrentMode(state.config),
    envDefaults: getEnvDefaults(),
    channelsTotal: channels.length,
    linkedTargets: queue.filter((item) => item.telegramTarget).length,
    botAccessOk: lastTelegramAccess?.accessOk ?? state.lastEnablePreflight?.telegram.botAccessOk ?? queue.filter((item) => item.botAccess === "ok").length,
    readyPosts: weeklyReady,
    tomorrowPosts: tomorrowPlan.filter((item) => item.status === "scheduled" || item.status === "due").length,
    postsWithoutImages: weeklyState.summary.missingImages,
    weakText: weeklyState.summary.weakText,
    weakImage: weeklyState.summary.weakImage,
    telegramImagesOk: weeklyState.summary.telegramImageStatusOk,
    todayPublished,
    failedToday,
    skippedToday,
    todayErrors,
    blockedToday,
    channelsWithoutReadyPosts,
    nextPublication: nextItem?.plannedAt ?? null,
    nextChannel: nextItem?.channelName ?? null,
    nextPost: nextItem?.selectedPostTitle ?? null,
    scheduler: {
      intervalMinutes: 5,
      status: getSchedulerStatus(state, nextItem),
      lastCheck: state.schedulerLastCheck,
      nextCheck: state.schedulerNextCheck,
      lastMessage: state.schedulerLastMessage,
      runtime: "server_worker",
      workerRunning: workerHeartbeat.running,
    },
    queueHealth: weeklyReady >= channels.length && weeklyBlocked === 0 ? "OK" : "needs attention",
    telegramConnection: lastTelegramAccess?.getMeOk && lastTelegramAccess.accessOk > 0 ? "OK" : "error",
    contentQuality: weeklyState.summary.weakText === 0 && weeklyState.summary.weakImage === 0 ? "OK" : "weak items found",
    schedule,
    publishLog: state.log.slice(-200).reverse(),
    todayLog: todayLog.slice(-100).reverse(),
    queue,
    todayPlan,
    tomorrowPlan,
    weeklyPlan: weeklyState.summary,
    weeklyPlanItems: weeklyState.items,
    diagnostics: buildDiagnostics({
      state,
      queue,
      quality,
      todayPlan,
      todayPublished,
      failedToday,
      skippedToday,
      nextItem,
    }),
    lastManualRun: state.lastManualRun,
    lastEnablePreflight: state.lastEnablePreflight,
    message: buildStatusMessage(state),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateAutopublishConfig(
  action: "enable" | "disable" | "pause_today" | "resume_today" | "emergency_stop" | "update",
  patch: Partial<AutopublishConfig> = {},
) {
  const state = readState();

  if (action === "enable") {
    state.config = sanitizeConfig({
      ...state.config,
      dailyLimitPerChannel: 1,
      maxPostsPerDay: 15,
      timeStart: "09:00",
      timeEnd: "21:00",
      timezone: "Europe/Kyiv",
      strategy: "spread_day",
    });

    const preflight = await runAutopublishEnablePreflight(state.config);
    state.lastEnablePreflight = preflight;

    if (!preflight.ok) {
      state.config.enabled = false;
      state.config.updatedAt = new Date().toISOString();
      appendAutopublishLog(state, {
        mode: "manual",
        channelId: null,
        channelName: null,
        telegramTarget: null,
        postId: null,
        title: null,
        imagePath: null,
        scheduledAt: null,
        result: "blocked",
        telegramMessageId: null,
        error: `enable preflight failed: ${preflight.blockers.join("; ")}`,
        duration: 0,
        retryCount: 0,
      });
      writeState(state);

      return getAutopublishStatus();
    }

    state.config.enabled = true;
    state.config.pausedToday = false;
    state.config.emergencyStop = false;
  }

  if (action === "disable") {
    state.config.enabled = false;
    state.lastEnablePreflight = null;
  }
  if (action === "pause_today") state.config.pausedToday = true;
  if (action === "resume_today") state.config.pausedToday = false;
  if (action === "emergency_stop") {
    state.config.enabled = false;
    state.config.emergencyStop = true;
    state.lastEnablePreflight = null;
  }
  if (action === "update") {
    state.config = sanitizeConfig({ ...state.config, ...patch });
  }

  state.config.updatedAt = new Date().toISOString();
  appendAutopublishLog(state, {
    mode: "manual",
    channelId: null,
    channelName: null,
    telegramTarget: null,
    postId: null,
    title: null,
    imagePath: null,
    scheduledAt: null,
    result: action === "emergency_stop" ? "blocked" : "success",
    telegramMessageId: null,
    error: null,
    duration: 0,
    retryCount: 0,
  });
  writeState(state);

  return getAutopublishStatus();
}

export async function prepareTomorrowContent() {
  const startedAt = Date.now();
  const state = readState();
  const qualityBefore = auditPostQuality();
  const improved = improveWeakPostMaterials();
  const telegramImages = auditTelegramPostImages({ createMissing: true });
  const qualityAfter = auditPostQuality();

  appendAutopublishLog(state, {
    mode: "manual",
    channelId: null,
    channelName: null,
    telegramTarget: null,
    postId: null,
    title: null,
    imagePath: null,
    scheduledAt: null,
    result: qualityAfter.weakText === 0 && qualityAfter.weakImage === 0 ? "success" : "blocked",
    telegramMessageId: null,
    error: qualityAfter.weakText || qualityAfter.weakImage ? "weak materials remain after preparation" : null,
    duration: Date.now() - startedAt,
    retryCount: 0,
  });
  writeState(state);

  return {
    ok: qualityAfter.weakText === 0 && qualityAfter.weakImage === 0,
    qualityBefore,
    improved,
    telegramImages,
    qualityAfter,
    readyChannelsWithTwoPosts: qualityAfter.channelsWithTwoQualityPosts,
    message: "Tomorrow content and Telegram-ready images were checked. No new sends were started.",
  };

}

export async function checkTomorrowSchedule(): Promise<TomorrowSchedulePlan> {
  const state = readState();
  const quality = auditPostQuality();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const schedule = buildDailyPlan(state, quality.items, tomorrow).map<TomorrowSchedulePlanItem>((item) => ({
    channelId: item.channelId,
    channelName: item.channelName,
    plannedAt: item.plannedAt,
    telegramTarget: item.telegramTarget,
    selectedPost: item.selectedPost,
    selectedPostTitle: item.selectedPostTitle,
    textQuality: item.textQuality,
    imageQuality: item.imageQuality,
    telegramImageStatus: item.telegramImageStatus,
    bodyLength: item.bodyLength,
    telegramCaptionLength: item.telegramCaptionLength,
    telegramCaptionStatus: item.telegramCaptionStatus,
    status: item.status === "scheduled" || item.status === "due" ? "ready" : "blocked",
    blockerReason: item.blockerReason,
  }));
  const blocked = schedule.filter((item) => item.status === "blocked").length;

  return {
    ok: blocked === 0,
    mode: "dry-run",
    channelsTotal: channels.length,
    planned: schedule.length - blocked,
    blocked,
    schedule,
    message: "Tomorrow schedule was checked in dry-run mode. Telegram was not called.",
  };
}

export async function getScheduledAutopublishStatus(date = new Date()): Promise<ScheduledAutopublishStatus> {
  const state = readState();
  const quality = auditPostQuality();
  const baseSchedule = getTwiceWeeklyAutopublishSchedule();
  const schedule = { ...baseSchedule, enabled: baseSchedule.enabled && state.config.enabled };
  const due = isScheduledAutopublishDue(date, schedule);
  const plan = buildScheduledAutopublishPlan(state, quality.items, date, due.scheduledAt);
  const todayLog = state.log.filter((entry) => dayKey(new Date(entry.attemptedAt)) === due.dateKey);
  const publishedEntries = channels
    .map((channel) => {
      const entry = [...todayLog]
        .reverse()
        .find((item) => isPublicationJournalMode(item.mode) && item.channelId === channel.id && item.result === "success");
      return entry
        ? {
            channelId: channel.id,
            channelName: getCanonicalChannelTitle(channel.id, channel.name),
            postId: entry.postId,
            telegramMessageId: entry.telegramMessageId,
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const waitingChannels = due.scheduledDay
    ? plan
        .filter((item) => !channelHasPublishedToday(state, item.channelId, date))
        .map((item) => ({
          channelId: item.channelId,
          channelName: item.channelName,
          postId: item.selectedPost,
          title: item.selectedPostTitle,
          reason: item.blockerReason,
        }))
    : [];
  const errorsToday = todayLog
    .filter((entry) => isPublicationJournalMode(entry.mode) && (entry.result === "failed" || entry.result === "blocked"))
    .map((entry) => ({
      channelId: entry.channelId,
      channelName: entry.channelId ? getCanonicalChannelTitle(entry.channelId, entry.channelName ?? entry.channelId) : entry.channelName,
      error: entry.error,
    }));
  const journal = state.log
    .filter((entry) => isPublicationJournalMode(entry.mode))
    .slice(-50)
    .reverse()
    .map((entry) => ({
      attemptedAt: entry.attemptedAt,
      channelId: entry.channelId,
      channelName: entry.channelId ? getCanonicalChannelTitle(entry.channelId, entry.channelName ?? entry.channelId) : entry.channelName,
      postId: entry.postId,
      title: entry.title && !hasBrokenText(entry.title) ? entry.title : entry.postId,
      status:
        entry.result === "success"
          ? ("success" as const)
          : entry.result === "already_published"
            ? ("already_published" as const)
            : entry.result === "skipped"
              ? ("skipped" as const)
              : ("error" as const),
      error: entry.error,
      telegramMessageId: entry.telegramMessageId,
      timings: entry.timings ?? null,
    }));
  const lastRun =
    [...state.log].reverse().find((entry) => isPublicationJournalMode(entry.mode))?.attemptedAt ??
    state.schedulerLastCheck ??
    null;

  return {
    ok: true,
    enabled: schedule.enabled,
    days: schedule.dayLabels,
    daysOfWeek: schedule.daysOfWeek,
    time: schedule.time,
    timezone: schedule.timezone,
    dueToday: due.due,
    scheduledDay: due.scheduledDay,
    beforeScheduledTime: due.beforeScheduledTime,
    scheduledAt: due.scheduledAt,
    lastRun,
    totalChannels: channels.length,
    publishedToday: publishedEntries.length,
    waitingToday: waitingChannels.length,
    publishedChannels: publishedEntries,
    waitingChannels,
    errorsToday,
    channels: channels.map((channel) => ({
      channelId: channel.id,
      channelName: getCanonicalChannelTitle(channel.id, channel.name),
    })),
    journal,
    message: buildScheduledAutopublishStatusMessage(schedule.enabled, due.due, due.scheduledDay, due.beforeScheduledTime),
    checkedAt: new Date().toISOString(),
  };
}

export async function runScheduledAutopublish(date = new Date()): Promise<ScheduledAutopublishRunResult> {
  return withAutopublishRunLock(() => runScheduledAutopublishUnlocked(date));
}

async function runScheduledAutopublishUnlocked(date = new Date()): Promise<ScheduledAutopublishRunResult> {
  const state = readState();
  const quality = auditPostQuality();
  const baseSchedule = getTwiceWeeklyAutopublishSchedule();
  const schedule = { ...baseSchedule, enabled: baseSchedule.enabled && state.config.enabled };
  const due = isScheduledAutopublishDue(date, schedule);
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();
  const details: ScheduledAutopublishDetail[] = [];

  state.schedulerLastCheck = checkedAt;
  state.schedulerNextCheck = null;

  if (!schedule.enabled || !due.due || state.config.pausedToday || state.config.emergencyStop) {
    const reason = !schedule.enabled
      ? "autopublish disabled"
      : state.config.emergencyStop
        ? "emergency stop active"
        : state.config.pausedToday
          ? "paused today"
          : due.scheduledDay
            ? "waiting scheduled time"
            : "not a scheduled publication day";

    for (const channel of channels) {
      details.push({
        channelId: channel.id,
        channelName: getCanonicalChannelTitle(channel.id, channel.name),
        postId: null,
        title: null,
        status: "skipped",
        reason,
        telegramMessageId: null,
      });
    }

    state.schedulerLastMessage = reason;
    writeState(state);

    return summarizeScheduledAutopublishRun({
      enabled: schedule.enabled,
      dueToday: due.due,
      schedule,
      scheduledAt: due.scheduledAt,
      details,
      checkedAt,
      message: `Autopublish skipped: ${reason}.`,
    });
  }

  const plan = buildScheduledAutopublishPlan(state, quality.items, date, due.scheduledAt);

  for (const planItem of plan) {
    if (channelHasPublishedToday(state, planItem.channelId, date)) {
      const item: WeeklyPublishAttempt = {
        channelId: planItem.channelId,
        channelName: planItem.channelName,
        telegramTarget: planItem.telegramTarget,
        selectedPost: planItem.selectedPost,
        selectedPostTitle: planItem.selectedPostTitle,
        telegramImagePath: null,
        publishResult: "already_published",
        telegramMessageId: null,
        publishError: "already published today",
        timings: buildTimingBreakdown(startedAt),
      };
      recordWeeklyAttempt(state, startedAt, "autopublish", planItem, item);
      details.push(toScheduledDetail(item));
      continue;
    }

    const result = await publishOneWeeklyPlanItem({
      state,
      planItem,
      mode: "autopublish",
      startedAt,
    });
    details.push(...result.items.map(toScheduledDetail));
  }

  state.schedulerLastMessage = `Twice-weekly autopublish run completed: ${details.filter((item) => item.status === "published").length} published.`;
  writeState(state);

  return summarizeScheduledAutopublishRun({
    enabled: schedule.enabled,
    dueToday: due.due,
    schedule,
    scheduledAt: due.scheduledAt,
    details,
    checkedAt,
    message: "Autopublish run completed.",
  });
}

export async function runSingleChannelTestAutopublish(channelId: string, date = new Date()): Promise<ScheduledAutopublishRunResult> {
  return withAutopublishRunLock(() => runSingleChannelTestAutopublishUnlocked(channelId, date));
}

async function runSingleChannelTestAutopublishUnlocked(channelId: string, date = new Date()): Promise<ScheduledAutopublishRunResult> {
  const state = readState();
  const quality = auditPostQuality();
  const baseSchedule = getTwiceWeeklyAutopublishSchedule();
  const schedule = { ...baseSchedule, enabled: baseSchedule.enabled && state.config.enabled };
  const due = isScheduledAutopublishDue(date, { ...schedule, enabled: true });
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();
  const channel = channels.find((item) => item.id === channelId);

  if (!channel) {
    return summarizeScheduledAutopublishRun({
      enabled: schedule.enabled,
      dueToday: true,
      schedule,
      scheduledAt: due.scheduledAt,
      details: [
        {
          channelId,
          channelName: channelId,
          postId: null,
          title: null,
          status: "error",
          reason: "channel not found",
          telegramMessageId: null,
          timings: buildTimingBreakdown(startedAt),
        },
      ],
      checkedAt,
      message: "Test publication failed: channel not found.",
    });
  }

  const planItem = buildScheduledAutopublishPlan(state, quality.items, date, new Date().toISOString()).find((item) => item.channelId === channelId);

  if (!planItem) {
    return summarizeScheduledAutopublishRun({
      enabled: schedule.enabled,
      dueToday: true,
      schedule,
      scheduledAt: due.scheduledAt,
      details: [
        {
          channelId,
          channelName: getCanonicalChannelTitle(channel.id, channel.name),
          postId: null,
          title: null,
          status: "error",
          reason: "no plan item for channel",
          telegramMessageId: null,
          timings: buildTimingBreakdown(startedAt),
        },
      ],
      checkedAt,
      message: "Test publication failed: no plan item for channel.",
    });
  }

  if (channelHasPublishedToday(state, channelId, date)) {
    const item: WeeklyPublishAttempt = {
      channelId: planItem.channelId,
      channelName: planItem.channelName,
      telegramTarget: planItem.telegramTarget,
      selectedPost: planItem.selectedPost,
      selectedPostTitle: planItem.selectedPostTitle,
      telegramImagePath: null,
      publishResult: "already_published",
      telegramMessageId: null,
      publishError: "already published today",
      timings: buildTimingBreakdown(startedAt),
    };
    recordWeeklyAttempt(state, startedAt, "autopublish", planItem, item);
    writeState(state);

    return summarizeScheduledAutopublishRun({
      enabled: schedule.enabled,
      dueToday: true,
      schedule,
      scheduledAt: due.scheduledAt,
      details: [toScheduledDetail(item)],
      checkedAt,
      message: "Test publication skipped: already published today.",
    });
  }

  const result = await publishOneWeeklyPlanItem({
    state,
    planItem,
    mode: "autopublish",
    startedAt,
  });
  writeState(state);

  return summarizeScheduledAutopublishRun({
    enabled: schedule.enabled,
    dueToday: true,
    schedule,
    scheduledAt: due.scheduledAt,
    details: result.items.map(toScheduledDetail),
    checkedAt,
    startedAt,
    message: "Test publication completed.",
  });
}

export async function runManualMassAutopublishNow(date = new Date()): Promise<ScheduledAutopublishRunResult> {
  return withAutopublishRunLock(() => runManualMassAutopublishNowUnlocked(date));
}

async function runManualMassAutopublishNowUnlocked(date = new Date()): Promise<ScheduledAutopublishRunResult> {
  const state = readState();
  const quality = auditPostQuality();
  const baseSchedule = getTwiceWeeklyAutopublishSchedule();
  const schedule = { ...baseSchedule, enabled: baseSchedule.enabled && state.config.enabled };
  const due = isScheduledAutopublishDue(date, { ...schedule, enabled: true });
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();
  const details: ScheduledAutopublishDetail[] = [];
  const plan = buildScheduledAutopublishPlan(state, quality.items, date, new Date().toISOString());

  for (let index = 0; index < plan.length; index += 1) {
    const planItem = plan[index];

    try {
      if (channelHasPublishedToday(state, planItem.channelId, date)) {
        const item: WeeklyPublishAttempt = {
          channelId: planItem.channelId,
          channelName: planItem.channelName,
          telegramTarget: planItem.telegramTarget,
          selectedPost: planItem.selectedPost,
          selectedPostTitle: planItem.selectedPostTitle,
          telegramImagePath: null,
          publishResult: "already_published",
          telegramMessageId: null,
          publishError: "already published today",
          timings: buildTimingBreakdown(startedAt),
        };
        recordWeeklyAttempt(state, startedAt, "manual_mass", planItem, item);
        details.push(toScheduledDetail(item));
      } else {
        const result = await publishOneWeeklyPlanItem({
          state,
          planItem,
          mode: "manual_mass",
          startedAt,
        });
        details.push(...result.items.map(toScheduledDetail));
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "unknown publish error";
      appendAutopublishLog(state, {
        mode: "manual_mass",
        channelId: planItem.channelId,
        channelName: planItem.channelName,
        telegramTarget: planItem.telegramTarget,
        postId: planItem.selectedPost,
        title: planItem.selectedPostTitle,
        imagePath: null,
        scheduledAt: planItem.plannedAt,
        result: "failed",
        telegramMessageId: null,
        error: message,
        duration: Date.now() - startedAt,
        retryCount: 0,
        timings: buildTimingBreakdown(startedAt),
      });
      details.push({
        channelId: planItem.channelId,
        channelName: planItem.channelName,
        postId: planItem.selectedPost,
        title: planItem.selectedPostTitle,
        status: "error",
        reason: message,
        telegramMessageId: null,
        timings: buildTimingBreakdown(startedAt),
      });
    }

    writeState(state);

    if (index < plan.length - 1) {
      await delay(manualMassPublishDelayMs);
    }
  }

  return summarizeScheduledAutopublishRun({
    enabled: schedule.enabled,
    dueToday: true,
    schedule,
    scheduledAt: due.scheduledAt,
    details,
    checkedAt,
    startedAt,
    message: "Manual mass publication completed.",
  });
}

export function runWeeklyContentPlanAction(action: WeeklyContentPlanAction, confirmed = false) {
  if (action === "generate_weekly_plan") return generateWeeklyContentPlan();
  if (action === "check_weekly_plan") return checkWeeklyContentPlan();
  if (action === "improve_weak_weekly") return improveWeakWeeklyContentPlan();
  if (action === "repair_captions") {
    const result = repairWeeklyTelegramCaptions();
    markResolvedAutopublishLogs("caption");
    return result;
  }
  if (action === "schedule_weekly_ready") return scheduleReadyWeeklyContentPlan();
  return clearBlockedWeeklyContentPlan({ confirmed });
}

export function runWeeklyContentPlanRowAction(itemId: string, action: WeeklyContentPlanItemAction) {
  return runWeeklyContentPlanItemAction({ itemId, action });
}

export async function runAutopublishToday({
  confirmed,
  mode = "autopublish",
}: {
  confirmed: boolean;
  mode?: QuickPublishMode;
}) {
  const state = readState();
  const startedAt = Date.now();

  if (!confirmed) {
    appendAutopublishLog(state, {
      mode: "manual",
      channelId: null,
      channelName: null,
      telegramTarget: null,
      postId: null,
      title: null,
      imagePath: null,
      scheduledAt: null,
      result: "blocked",
      telegramMessageId: null,
      error: "confirmation_required",
      duration: Date.now() - startedAt,
      retryCount: 0,
    });
    writeState(state);

    return {
      ok: false,
      message: "Manual confirmation is required. Autopublish was not started.",
      result: null,
    };
  }

  if (!state.config.enabled || state.config.pausedToday || state.config.emergencyStop) {
    const reason = state.config.emergencyStop
      ? "emergency_stop_active"
      : state.config.pausedToday
        ? "paused_for_today"
        : "autopublish_disabled";
    appendAutopublishLog(state, {
      mode: "manual",
      channelId: null,
      channelName: null,
      telegramTarget: null,
      postId: null,
      title: null,
      imagePath: null,
      scheduledAt: null,
      result: "blocked",
      telegramMessageId: null,
      error: reason,
      duration: Date.now() - startedAt,
      retryCount: 0,
    });
    writeState(state);

    return {
      ok: false,
      message: `Daily publication is blocked: ${reason}.`,
      started: false,
      status: "skipped",
      reason,
      result: null,
    };
  }

  const quality = auditPostQuality();
  const todayPlan = buildDailyPlan(state, quality.items, new Date());
  const result = await publishWeeklyDailyPlan({
    state,
    plan: todayPlan,
    mode: mode === "retry_failed" ? "retry_failed" : "autopublish",
    retryOnly: mode === "retry_failed",
    startedAt,
  });
  writeState(state);

  return {
    ok: result.ok,
    message: "Daily weekly-plan pass completed: maximum 1 post per channel, no timer, no duplicates.",
    result,
  };
}

export async function runAutopublishSchedulerTick() {
  const state = readState();
  const startedAt = Date.now();
  const now = new Date();
  const quality = auditPostQuality();
  const todayPlan = buildDailyPlan(state, quality.items, now);
  const nextCheck = new Date(now.getTime() + 5 * 60_000).toISOString();
  const dueItem = todayPlan.find((item) => (item.status === "due" || item.status === "scheduled") && new Date(item.plannedAt).getTime() <= now.getTime());

  state.schedulerLastCheck = now.toISOString();
  state.schedulerNextCheck = nextCheck;

  if (!state.config.enabled || state.config.pausedToday || state.config.emergencyStop) {
    const reason = state.config.emergencyStop
      ? "Autopublish stopped"
      : state.config.pausedToday
        ? "Autopublish paused today"
        : "Autopublish disabled";
    state.schedulerLastMessage = reason;
    writeState(state);

    return {
      ok: true,
      published: false,
      reason,
      nextCheck,
      message: "Scheduler checked state and did not publish.",
    };
  }

  if (!dueItem) {
    state.schedulerLastMessage = "Scheduler waiting time";
    writeState(state);

    return {
      ok: true,
      published: false,
      reason: "Scheduler waiting time",
      nextCheck,
      message: "No due scheduled post at this check.",
    };
  }

  if (channelHasPublishedToday(state, dueItem.channelId, now)) {
    appendAutopublishLog(state, {
      mode: "autopublish",
      channelId: dueItem.channelId,
      channelName: dueItem.channelName,
      telegramTarget: dueItem.telegramTarget,
      postId: dueItem.selectedPost,
      title: dueItem.selectedPostTitle,
      imagePath: null,
      scheduledAt: dueItem.plannedAt,
      result: "skipped",
      telegramMessageId: null,
      error: "daily_limit_reached",
      duration: Date.now() - startedAt,
      retryCount: 0,
    });
    state.schedulerLastMessage = "Daily limit reached for due channel";
    writeState(state);

    return {
      ok: true,
      published: false,
      reason: "daily_limit_reached",
      nextCheck,
      message: "Due channel already received a post today.",
    };
  }

  const result = await publishOneWeeklyPlanItem({
    state,
    planItem: dueItem,
    mode: "autopublish",
    startedAt,
  });

  state.schedulerLastMessage = result.ok ? "Published one due scheduled weekly-plan post" : "Due weekly-plan post was not published";
  writeState(state);

  return {
    ok: result.ok,
    published: result.publishedSuccess === 1,
    reason: result.ok ? null : "publish_failed_or_blocked",
    nextCheck,
    result,
    message: "Scheduler processed one due channel only.",
  };
}

export async function runNextScheduledPublicationNow({ confirmed }: { confirmed: boolean }) {
  const state = readState();
  const startedAt = Date.now();

  if (!confirmed) {
    appendAutopublishLog(state, {
      mode: "manual",
      channelId: null,
      channelName: null,
      telegramTarget: null,
      postId: null,
      title: null,
      imagePath: null,
      scheduledAt: null,
      result: "blocked",
      telegramMessageId: null,
      error: "confirmation_required",
      duration: Date.now() - startedAt,
      retryCount: 0,
    });
    writeState(state);

    return {
      ok: false,
      message: "Confirmation required: nearest publication was not started.",
      started: false,
      status: "blocked",
      reason: "confirmation_required",
      result: null,
    };
  }

  if (state.config.pausedToday || state.config.emergencyStop) {
    const reason = state.config.emergencyStop ? "emergency_stop_active" : "paused_for_today";
    appendAutopublishLog(state, {
      mode: "manual",
      channelId: null,
      channelName: null,
      telegramTarget: null,
      postId: null,
      title: null,
      imagePath: null,
      scheduledAt: null,
      result: "blocked",
      telegramMessageId: null,
      error: reason,
      duration: Date.now() - startedAt,
      retryCount: 0,
    });
    writeState(state);

    return {
      ok: false,
      message: `Manual nearest publication is blocked: ${reason}.`,
      started: false,
      status: "blocked",
      reason,
      result: null,
    };
  }

  const quality = auditPostQuality();
  const todayPlan = buildDailyPlan(state, quality.items, new Date());
  const nextItem = findManualNextPublishItem(todayPlan);

  if (!nextItem) {
    state.schedulerLastMessage = "No ready scheduled post available for manual override";
    appendAutopublishLog(state, {
      mode: "manual",
      channelId: null,
      channelName: null,
      telegramTarget: null,
      postId: null,
      title: null,
      imagePath: null,
      scheduledAt: null,
      result: "skipped",
      telegramMessageId: null,
      error: "no_ready_post",
      duration: Date.now() - startedAt,
      retryCount: 0,
    });
    writeState(state);

    return {
      ok: false,
      message: "Nearest publication was not found: no ready_to_publish scheduled/due post.",
      started: false,
      status: "skipped",
      reason: "no_ready_post",
      result: null,
    };
  }

  const result = await publishOneWeeklyPlanItem({
    state,
    planItem: nextItem,
    mode: "manual",
    startedAt,
  });
  state.schedulerLastMessage = result.ok ? "Manual one-item run published one post" : `Manual one-item run did not publish: ${result.reason ?? "unknown"}`;
  writeState(state);

  return {
    ok: result.ok,
    message: result.ok
      ? "Nearest publication sent: exactly 1 postId was processed."
      : `Nearest publication was not sent: ${result.reason ?? "publish_failed_or_blocked"}.`,
    started: true,
    status: result.status,
    reason: result.reason,
    selected: result.items[0] ?? null,
    telegramAttempted: result.telegramAttempted,
    result,
  };
}

interface WeeklyPublishAttempt {
  channelId: string;
  channelName: string;
  telegramTarget: string;
  selectedPost: string | null;
  selectedPostTitle: string | null;
  telegramImagePath: string | null;
  publishResult: AutopublishLogResult;
  telegramMessageId: number | null;
  publishError: string | null;
  timings?: AutopublishTimingBreakdown | null;
}

interface WeeklyPublishSummary {
  ok: boolean;
  status: "started" | "success" | "failed" | "skipped" | "blocked" | "already_published";
  reason: string | null;
  telegramAttempted: boolean;
  publishedSuccess: number;
  failed: number;
  blocked: number;
  skipped: number;
  alreadyPublished: number;
  items: WeeklyPublishAttempt[];
}

async function publishWeeklyDailyPlan({
  state,
  plan,
  mode,
  retryOnly,
  startedAt,
}: {
  state: AutopublishState;
  plan: AutopublishDailyPlanItem[];
  mode: WeeklyPublishMode;
  retryOnly: boolean;
  startedAt: number;
}): Promise<WeeklyPublishSummary> {
  const items: WeeklyPublishAttempt[] = [];

  for (const planItem of plan) {
    if (retryOnly && !hasRetryableAutopublishLogForDay(state, planItem, new Date())) {
      continue;
    }

    const result = await publishOneWeeklyPlanItem({ state, planItem, mode, startedAt });
    items.push(result.items[0]);
  }

  return summarizeWeeklyPublishAttempts(items);
}

async function publishOneWeeklyPlanItem({
  state,
  planItem,
  mode,
  startedAt,
}: {
  state: AutopublishState;
  planItem: AutopublishDailyPlanItem;
  mode: WeeklyPublishMode;
  startedAt: number;
}): Promise<WeeklyPublishSummary> {
  const itemStartedAt = Date.now();
  const textStartedAt = Date.now();
  const weeklyState = getWeeklyContentPlanState();
  const weeklyItem = planItem.selectedPost
    ? weeklyState.items.find((item) => item.postId === planItem.selectedPost || item.id === planItem.selectedPost)
    : null;
  const textMs = Date.now() - textStartedAt;
  const imageStartedAt = Date.now();
  if (weeklyItem?.telegramImagePath) {
    existsSync(weeklyItem.telegramImagePath);
  }
  const imageMs = Date.now() - imageStartedAt;
  const attemptBase = {
    channelId: planItem.channelId,
    channelName: planItem.channelName,
    telegramTarget: planItem.telegramTarget,
    selectedPost: planItem.selectedPost,
    selectedPostTitle: planItem.selectedPostTitle,
    telegramImagePath: weeklyItem?.telegramImagePath ?? null,
  };
  const timings = (telegramMs = 0): AutopublishTimingBreakdown => ({
    textMs,
    imageMs,
    telegramMs,
    totalMs: Date.now() - itemStartedAt,
  });

  if (!weeklyItem) {
    return recordWeeklyAttempt(state, startedAt, mode, planItem, {
      ...attemptBase,
      publishResult: "blocked",
      telegramMessageId: null,
      publishError: "No weekly plan item selected",
      timings: timings(),
    });
  }

  if (weeklyItem.status === "published" || weeklyItem.telegramMessageId || hasSuccessForPost(state, weeklyItem.postId)) {
    return recordWeeklyAttempt(state, startedAt, mode, planItem, {
      ...attemptBase,
      publishResult: "already_published",
      telegramMessageId: weeklyItem.telegramMessageId ?? null,
      publishError: "Post already published",
      timings: timings(),
    });
  }

  if (channelHasPublishedToday(state, weeklyItem.channelId, new Date())) {
    return recordWeeklyAttempt(state, startedAt, mode, planItem, {
      ...attemptBase,
      publishResult: "skipped",
      telegramMessageId: null,
      publishError: "daily_limit_reached",
      timings: timings(),
    });
  }

  const preflight = await preflightWeeklyPlanItem({ state, weeklyItem, planItem });

  if (!preflight.ok) {
    markWeeklyPlanPublishResult({
      itemId: weeklyItem.id,
      result: "blocked",
      error: preflight.blockers.join("; "),
    });

    return recordWeeklyAttempt(state, startedAt, mode, planItem, {
      ...attemptBase,
      publishResult: "blocked",
      telegramMessageId: null,
      publishError: preflight.blockers.join("; "),
      timings: timings(),
    });
  }

  const telegramStartedAt = Date.now();
  const send = await sendPhotoToTelegramChannel({
    token: process.env.TELEGRAM_BOT_TOKEN ?? "",
    telegramTarget: planItem.telegramTarget,
    title: weeklyItem.title,
    text: weeklyItem.body,
    caption: weeklyItem.telegramCaption,
    imageFilePath: weeklyItem.telegramImagePath,
  });
  const telegramMs = Date.now() - telegramStartedAt;

  if (!send.ok || !send.messageId) {
    markWeeklyPlanPublishResult({
      itemId: weeklyItem.id,
      result: "failed",
      error: send.error ?? "Telegram API error",
    });

    return recordWeeklyAttempt(state, startedAt, mode, planItem, {
      ...attemptBase,
      publishResult: "failed",
      telegramMessageId: null,
      publishError: send.error ?? "Telegram API error",
      timings: timings(telegramMs),
    });
  }

  markWeeklyPlanPublishResult({
    itemId: weeklyItem.id,
    result: "success",
    telegramMessageId: send.messageId,
  });

  return recordWeeklyAttempt(state, startedAt, mode, planItem, {
    ...attemptBase,
    publishResult: "success",
    telegramMessageId: send.messageId,
    publishError: null,
    timings: timings(telegramMs),
  });
}

async function preflightWeeklyPlanItem({
  state,
  weeklyItem,
  planItem,
}: {
  state: AutopublishState;
  weeklyItem: WeeklyContentPlanItem;
  planItem: AutopublishDailyPlanItem;
}) {
  const blockers: string[] = [];
  const telegramConfig = getTelegramConfig();
  const combinedText = `${weeklyItem.title}\n${weeklyItem.body}`;
  const imagePath = weeklyItem.telegramImagePath;
  const imageExtension = path.extname(imagePath).toLowerCase();
  const caption = buildTelegramCaption({ title: weeklyItem.title, body: weeklyItem.body });

  if (telegramConfig.tokenStatus !== "configured") blockers.push("Telegram token missing");
  if (!planItem.telegramTarget) blockers.push("Telegram target missing");
  if (!weeklyItem.channelId) blockers.push("missing_channel");
  if (!weeklyItem.title.trim()) blockers.push("missing_title");
  if (!weeklyItem.body.trim()) blockers.push("missing_text");
  if (weeklyItem.textLength < 500) blockers.push("text_too_short");
  if (weeklyItem.textQuality === "weak") blockers.push("Weak text");
  if (weeklyItem.imageQuality === "weak") blockers.push("Weak image");
  if (weeklyItem.telegramImageStatus !== "OK") blockers.push("Image not ready");
  if (caption.status === "missing") blockers.push("telegramCaption missing");
  if (caption.status === "invalid_text") blockers.push("telegramCaption invalid text");
  if (caption.status !== "OK" || caption.length > telegramCaptionSafeLimit) blockers.push("needs_caption_fix");
  if (!imagePath || !existsSync(imagePath)) blockers.push("image file missing");
  if (imagePath.includes("logo.svg") || imagePath.includes("icon.svg") || imagePath.includes("preview.svg")) blockers.push("invalid post image uses channel asset");
  if (![".png", ".jpg", ".jpeg"].includes(imageExtension)) blockers.push("Telegram image must be PNG/JPG");
  if (hasBrokenText(combinedText) || isFailedGenerationText(combinedText)) blockers.push("broken text");
  blockers.push(...findGenericContentIssues({ channelId: weeklyItem.channelId, title: weeklyItem.title, body: weeklyItem.body, topic: weeklyItem.contentTopic }));
  if (!validateCurrencyPolicy(combinedText).ok) blockers.push("forbidden currency");
  if (hasServiceVisualLabel(`${weeklyItem.title}\n${weeklyItem.contentTopic}\n${JSON.stringify(weeklyItem.visualMetadata ?? {})}`)) blockers.push("service visual label detected");
  if (weeklyItem.qualityIssues.some((issue) => issue.includes("generic_phrase") || issue === "service_visual_label_detected" || issue.includes("topic_mismatch"))) {
    blockers.push(`quality gate failed: ${weeklyItem.qualityIssues.join("; ")}`);
  }
  if (hasSuccessForPost(state, weeklyItem.postId) || weeklyItem.telegramMessageId) blockers.push("Post already published");
  if (channelHasPublishedToday(state, weeklyItem.channelId, new Date())) blockers.push("Already published today");
  if (hasPublishedDuplicateTopicWithinSevenDays(weeklyItem)) blockers.push("duplicate topic last 7 days");

  if (!blockers.length && planItem.telegramTarget) {
    const access = await checkTelegramChannelAccess({
      channelId: weeklyItem.channelId,
      telegramTarget: planItem.telegramTarget,
    });

    if (access.accessStatus !== "ok" || !access.canPost) {
      blockers.push(access.error ?? access.accessStatus);
    }
  }

  return {
    ok: blockers.length === 0,
    blockers,
  };
}

function recordWeeklyAttempt(
  state: AutopublishState,
  startedAt: number,
  mode: WeeklyPublishMode,
  planItem: AutopublishDailyPlanItem,
  item: WeeklyPublishAttempt,
): WeeklyPublishSummary {
  appendAutopublishLog(state, {
    mode,
    channelId: item.channelId,
    channelName: item.channelName,
    telegramTarget: item.telegramTarget,
    postId: item.selectedPost,
    title: item.selectedPostTitle,
    imagePath: item.telegramImagePath,
    telegramImagePath: item.telegramImagePath,
    scheduledAt: planItem.plannedAt,
    result: item.publishResult,
    telegramMessageId: item.telegramMessageId,
    error: item.publishError,
    duration: Date.now() - startedAt,
    retryCount: mode === "retry_failed" ? 1 : 0,
    timings: item.timings ?? null,
  });

  return summarizeWeeklyPublishAttempts([item]);
}

function summarizeWeeklyPublishAttempts(items: WeeklyPublishAttempt[]): WeeklyPublishSummary {
  const publishedSuccess = items.filter((item) => item.publishResult === "success").length;
  const failed = items.filter((item) => item.publishResult === "failed").length;
  const blocked = items.filter((item) => item.publishResult === "blocked").length;
  const skipped = items.filter((item) => item.publishResult === "skipped").length;
  const alreadyPublished = items.filter((item) => item.publishResult === "already_published").length;
  const first = items[0];
  const status =
    publishedSuccess > 0
      ? "success"
      : failed > 0
        ? "failed"
        : blocked > 0
          ? "blocked"
          : skipped > 0
            ? "skipped"
            : alreadyPublished > 0
              ? "already_published"
              : "skipped";

  return {
    ok: failed === 0 && blocked === 0,
    status,
    reason: first?.publishError ?? null,
    telegramAttempted: Boolean(first && first.publishResult !== "blocked" && first.publishResult !== "skipped" && first.publishResult !== "already_published"),
    publishedSuccess,
    failed,
    blocked,
    skipped,
    alreadyPublished,
    items,
  };
}

function hasRetryableAutopublishLogForDay(state: AutopublishState, planItem: AutopublishDailyPlanItem, date: Date) {
  const dateKey = dayKey(date);

  return state.log.some(
    (entry) =>
      entry.channelId === planItem.channelId &&
      entry.postId === planItem.selectedPost &&
      (entry.result === "failed" || entry.result === "blocked") &&
      dayKey(new Date(entry.attemptedAt)) === dateKey,
  );
}

function hasPublishedDuplicateTopicWithinSevenDays(item: WeeklyContentPlanItem) {
  const state = getWeeklyContentPlanState();
  const currentDate = new Date(item.contentPlanDate).getTime();
  const topic = item.contentTopic.trim().toLowerCase();

  return state.items.some((candidate) => {
    if (candidate.id === item.id) return false;
    if (candidate.channelId !== item.channelId) return false;
    if (candidate.contentTopic.trim().toLowerCase() !== topic) return false;
    if (candidate.status !== "published" && !candidate.telegramMessageId) return false;
    const diffDays = Math.abs(currentDate - new Date(candidate.contentPlanDate).getTime()) / 86_400_000;
    return diffDays < 7;
  });
}

function readState(): AutopublishState {
  if (!existsSync(statePath)) {
    return {
      config: getDefaultConfig(),
      log: [],
      lastManualRun: null,
      lastEnablePreflight: null,
      schedulerLastCheck: null,
      schedulerNextCheck: null,
      schedulerLastMessage: null,
    };
  }

  const raw = JSON.parse(readFileSync(statePath, "utf8")) as Partial<AutopublishState>;

  return {
    config: sanitizeConfig({ ...getDefaultConfig(), ...raw.config }),
    log: (raw.log ?? []).map((entry) => ({
      ...entry,
      date: entry.date ?? dayKey(new Date(entry.attemptedAt ?? new Date().toISOString())),
      telegramImagePath: entry.telegramImagePath ?? entry.imagePath ?? null,
      result: entry.result ?? "skipped",
    })) as AutopublishLogEntry[],
    lastManualRun: raw.lastManualRun ?? null,
    lastEnablePreflight: raw.lastEnablePreflight ?? null,
    schedulerLastCheck: raw.schedulerLastCheck ?? null,
    schedulerNextCheck: raw.schedulerNextCheck ?? null,
    schedulerLastMessage: raw.schedulerLastMessage ?? null,
  };
}

function writeState(state: AutopublishState) {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

async function withAutopublishRunLock<T>(task: () => Promise<T>): Promise<T> {
  if (isAutopublishRunLocked()) {
    return {
      ok: false,
      enabled: false,
      dueToday: false,
      schedule: getTwiceWeeklyAutopublishSchedule(),
      scheduledAt: new Date().toISOString(),
      totalChannels: channels.length,
      published: 0,
      skipped: channels.length,
      errors: 1,
      details: [],
      message: "Autopublish is already running.",
      checkedAt: new Date().toISOString(),
      durationMs: null,
    } as T;
  }

  mkdirSync(path.dirname(runLockPath), { recursive: true });
  writeFileSync(runLockPath, JSON.stringify({ startedAt: new Date().toISOString() }, null, 2), "utf8");

  try {
    return await task();
  } finally {
    rmSync(runLockPath, { force: true });
  }
}

function isAutopublishRunLocked() {
  if (!existsSync(runLockPath)) return false;

  try {
    const lock = JSON.parse(readFileSync(runLockPath, "utf8")) as { startedAt?: string };
    const startedAt = lock.startedAt ? new Date(lock.startedAt).getTime() : 0;

    if (startedAt && Date.now() - startedAt < 15 * 60_000) {
      return true;
    }
  } catch {
    return true;
  }

  rmSync(runLockPath, { force: true });
  return false;
}

function markResolvedAutopublishLogs(kind: "caption") {
  const state = readState();
  const weeklyState = getWeeklyContentPlanState();
  const now = new Date().toISOString();
  let changed = false;

  state.log = state.log.map((entry) => {
    const error = (entry.error ?? "").toLowerCase();
    if (kind !== "caption") return entry;
    if (!entry.postId) return entry;
    if (!error.includes("caption too long") && !error.includes("needs_caption_fix")) return entry;
    if (entry.resolvedAt || entry.active === false) return entry;

    const weeklyItem = weeklyState.items.find((item) => item.postId === entry.postId);
    if (!weeklyItem || weeklyItem.telegramCaptionStatus !== "OK" || weeklyItem.telegramCaptionLength > telegramCaptionSafeLimit) return entry;

    changed = true;
    return {
      ...entry,
      active: false,
      resolvedAt: now,
      resolution: `telegramCaption regenerated <= ${telegramCaptionSafeLimit} chars`,
    };
  });

  if (changed) writeState(state);
}

function readWorkerHeartbeat() {
  if (!existsSync(workerHeartbeatPath)) {
    return { running: false };
  }

  try {
    const heartbeat = JSON.parse(readFileSync(workerHeartbeatPath, "utf8")) as { updatedAt?: string; nextTickAt?: string; lastError?: string | null };
    const updatedAt = heartbeat.updatedAt ? new Date(heartbeat.updatedAt).getTime() : 0;
    return {
      running: Boolean(updatedAt && Date.now() - updatedAt < 10 * 60_000 && !heartbeat.lastError),
    };
  } catch {
    return { running: false };
  }
}

function appendAutopublishLog(
  state: AutopublishState,
  entry: Omit<AutopublishLogEntry, "id" | "attemptedAt" | "date" | "telegramImagePath"> &
    Partial<Pick<AutopublishLogEntry, "date" | "telegramImagePath">>,
) {
  const attemptedAt = new Date().toISOString();
  state.log.push({
    id: `${attemptedAt}-${entry.mode}-${state.log.length + 1}`,
    date: entry.date ?? dayKey(new Date(attemptedAt)),
    attemptedAt,
    ...entry,
    telegramImagePath: entry.telegramImagePath ?? entry.imagePath ?? null,
  });
  state.log = state.log.slice(-1000);
}

function getDefaultConfig(): AutopublishConfig {
  const env = getEnvDefaults();

  return sanitizeConfig({
    enabled: env.AUTOPUBLISH_ENABLED === "true",
    pausedToday: false,
    emergencyStop: false,
    dailyLimitPerChannel: Number(env.AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL),
    maxPostsPerDay: Number(env.AUTOPUBLISH_MAX_POSTS_PER_DAY),
    timeStart: env.AUTOPUBLISH_TIME_START,
    timeEnd: env.AUTOPUBLISH_TIME_END,
    timezone: env.AUTOPUBLISH_TIMEZONE,
    strategy: "spread_day",
    minMinutesBetweenPosts: 20,
    updatedAt: new Date().toISOString(),
  });
}

function sanitizeConfig(config: AutopublishConfig): AutopublishConfig {
  return {
    ...config,
    enabled: Boolean(config.enabled),
    pausedToday: Boolean(config.pausedToday),
    emergencyStop: Boolean(config.emergencyStop),
    dailyLimitPerChannel: Math.max(1, Math.min(1, Number(config.dailyLimitPerChannel) || 1)),
    maxPostsPerDay: Math.max(1, Math.min(15, Number(config.maxPostsPerDay) || 15)),
    timeStart: config.timeStart || "09:00",
    timeEnd: config.timeEnd || "21:00",
    timezone: config.timezone || "Europe/Kyiv",
    strategy: config.strategy ?? "spread_day",
    minMinutesBetweenPosts: Math.max(20, Number(config.minMinutesBetweenPosts) || 20),
  };
}

function getEnvDefaults() {
  return {
    AUTOPUBLISH_ENABLED: process.env.AUTOPUBLISH_ENABLED ?? "false",
    AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL: process.env.AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL ?? "1",
    AUTOPUBLISH_MAX_POSTS_PER_DAY: process.env.AUTOPUBLISH_MAX_POSTS_PER_DAY ?? "15",
    AUTOPUBLISH_TIME_START: process.env.AUTOPUBLISH_TIME_START ?? "09:00",
    AUTOPUBLISH_TIME_END: process.env.AUTOPUBLISH_TIME_END ?? "21:00",
    AUTOPUBLISH_TIMEZONE: process.env.AUTOPUBLISH_TIMEZONE ?? "Europe/Kyiv",
  };
}

function buildDailySchedule(config: AutopublishConfig, baseDate = new Date()) {
  const today = new Date(baseDate);
  const [startHour, startMinute] = config.timeStart.split(":").map(Number);
  const [endHour, endMinute] = config.timeEnd.split(":").map(Number);
  const start = new Date(today);
  start.setHours(startHour || 9, startMinute || 0, 0, 0);
  const end = new Date(today);
  end.setHours(endHour || 21, endMinute || 0, 0, 0);

  const count = Math.min(config.maxPostsPerDay, channels.length);
  const minimumStepMs = config.minMinutesBetweenPosts * 60_000;
  const windowMs = Math.max(end.getTime() - start.getTime(), minimumStepMs * Math.max(0, count - 1));
  const stepMs = count <= 1 ? 0 : Math.max(minimumStepMs, Math.floor(windowMs / (count - 1)));

  return channels.slice(0, count).map((channel, index) => {
    const planned = new Date(start.getTime() + index * stepMs);

    return {
      channelId: channel.id,
      channelName: channel.name,
      plannedAt: planned.toISOString(),
      strategy: config.strategy,
    };
  });
}

function buildLocalAutopublishQueue(state: AutopublishState, qualityItems: ReturnType<typeof auditPostQuality>["items"]): AutopublishQueueItem[] {
  const bindings = listTelegramTargetBindings();
  const weeklyState = getWeeklyContentPlanState();
  const lastAccess = getLastTelegramAccessDiagnostics();

  return channels.map((channel) => {
    const binding = bindings.find((item) => item.channelId === channel.id);
    const access = lastAccess?.checks.find((item) => item.channelId === channel.id);
    const channelName = getCanonicalChannelTitle(channel.id, channel.name);
    const weeklyPost = weeklyState.items
      .filter((candidate) => {
        if (candidate.channelId !== channel.id) return false;
        if (!isWeeklyPlanItemReadyToPublish(candidate)) return false;
        if (candidate.telegramMessageId || hasSuccessForPost(state, candidate.postId)) return false;
        return true;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
    const post = weeklyPost
      ? null
      : posts.find((candidate) => {
          if (candidate.channelId !== channel.id) return false;
          if (hasSuccessForPost(state, candidate.id)) return false;
          const quality = qualityItems.find((item) => item.postId === candidate.id);
          return quality ? quality.textQuality !== "weak" && quality.imageQuality !== "weak" && quality.telegramImageReady : false;
        });

    if (!binding?.telegramTarget) {
      return {
        channelId: channel.id,
        channelName,
        telegramTarget: "",
        selectedPost: weeklyPost?.postId ?? post?.id ?? null,
        selectedPostTitle: weeklyPost?.title ?? post?.title ?? null,
        status: "target_missing",
        blockerReason: "telegramTarget missing",
        telegramImageStatus: post ? "OK" : "not checked",
        bodyLength: weeklyPost?.body.length ?? post?.excerpt.length ?? 0,
        telegramCaptionLength: weeklyPost?.telegramCaptionLength ?? 0,
        telegramCaptionStatus: weeklyPost?.telegramCaptionStatus ?? "not checked",
        mojibakeStatus: weeklyPost && hasBrokenText(`${weeklyPost.title}\n${weeklyPost.body}\n${weeklyPost.telegramCaption}`) ? "BROKEN TEXT" : "TEXT OK",
        realReadyStatus: "NOT READY",
        botAccess: "not checked",
      };
    }

    if (!weeklyPost && !post) {
      return {
        channelId: channel.id,
        channelName,
        telegramTarget: binding.telegramTarget,
        selectedPost: null,
        selectedPostTitle: null,
        status: "no_ready_posts",
        blockerReason: "no ready strong/medium post with Telegram image",
        telegramImageStatus: "not checked",
        bodyLength: 0,
        telegramCaptionLength: 0,
        telegramCaptionStatus: "not checked",
        mojibakeStatus: "TEXT OK",
        realReadyStatus: "NOT READY",
        botAccess: "not checked",
      };
    }

    const selectedWeeklyText = weeklyPost ? `${weeklyPost.title}\n${weeklyPost.body}\n${weeklyPost.telegramCaption}` : "";
    const mojibakeStatus = weeklyPost && hasBrokenText(selectedWeeklyText) ? "BROKEN TEXT" : "TEXT OK";
    const realReadyStatus =
      weeklyPost && isWeeklyPlanItemReadyToPublish(weeklyPost) && (!access || access.accessStatus === "OK") ? "READY" : "NOT READY";

    return {
      channelId: channel.id,
      channelName,
      telegramTarget: binding.telegramTarget,
      selectedPost: weeklyPost?.postId ?? post?.id ?? null,
      selectedPostTitle: weeklyPost?.title ?? post?.title ?? null,
      status: access && access.accessStatus !== "OK" ? "blocked" : "ready_to_publish",
      blockerReason: access && access.accessStatus !== "OK" ? access.exactError ?? "bot access failed" : null,
      telegramImageStatus: weeklyPost?.telegramImageStatus ?? "OK",
      bodyLength: weeklyPost?.body.length ?? post?.excerpt.length ?? 0,
      telegramCaptionLength: weeklyPost?.telegramCaptionLength ?? 0,
      telegramCaptionStatus: weeklyPost?.telegramCaptionStatus ?? (post ? "legacy post" : "not checked"),
      mojibakeStatus,
      realReadyStatus,
      botAccess: access?.accessStatus === "OK" ? "ok" : access ? "unknown" : "not checked",
    };
  });
}

function buildDailyPlan(state: AutopublishState, qualityItems: ReturnType<typeof auditPostQuality>["items"], date: Date): AutopublishDailyPlanItem[] {
  const queue = buildLocalAutopublishQueue(state, qualityItems);
  const times = buildDailySchedule(state.config, date);

  return queue.map((item, index) => {
    const weeklyItem = findWeeklyPlanItemForChannelDate(item.channelId, date);
    const selectedPost = weeklyItem?.postId ?? item.selectedPost;
    const selectedPostTitle = weeklyItem?.title ?? item.selectedPostTitle;
    const qualityItem = selectedPost ? qualityItems.find((candidate) => candidate.postId === selectedPost) : null;
    const plannedAt = times[index]?.plannedAt ?? times[0]?.plannedAt ?? date.toISOString();
    const successToday = findChannelLogForDay(state, item.channelId, date, "success");
    const failedToday = findChannelLogForDay(state, item.channelId, date, "failed");
    const skippedToday = findChannelLogForDay(state, item.channelId, date, "skipped");
    const alreadyPublished = Boolean(selectedPost && (hasSuccessForPost(state, selectedPost) || weeklyItem?.telegramMessageId));
    const weeklyBlockedReason = weeklyItem?.status === "blocked" ? weeklyItem.qualityIssues.join("; ") || "weekly plan item blocked" : null;
    const blockedReason =
      weeklyBlockedReason ??
      item.blockerReason ??
      (weeklyItem
        ? weeklyItem.textQuality === "weak"
          ? "Weak text"
          : weeklyItem.imageQuality === "weak"
            ? "Weak image"
            : weeklyItem.telegramImageStatus !== "OK"
              ? "Image not ready"
              : null
        : !qualityItem
        ? "No ready posts"
        : qualityItem.textQuality === "weak"
          ? "Weak text"
          : qualityItem.imageQuality === "weak"
            ? "Weak image"
            : !qualityItem.telegramImageReady
              ? "Image not ready"
              : null);

    let status: AutopublishPlanStatus = new Date(weeklyItem?.scheduledAt ?? plannedAt).getTime() <= Date.now() ? "due" : "scheduled";
    let reason = blockedReason;

    if (successToday) {
      status = "published";
      reason = null;
    } else if (failedToday) {
      status = "failed";
      reason = failedToday.error ?? "failed today";
    } else if (skippedToday) {
      status = "skipped";
      reason = skippedToday.error ?? "skipped today";
    } else if (alreadyPublished) {
      status = "already_published";
      reason = "Post already published";
    } else if (channelHasPublishedToday(state, item.channelId, date)) {
      status = "daily_limit_reached";
      reason = "Already published today";
    } else if (
      (weeklyItem ? weeklyItem.status !== "ready_to_publish" && weeklyItem.status !== "scheduled" : item.status !== "ready_to_publish") ||
      blockedReason
    ) {
      status = "blocked";
      reason = blockedReason ?? weeklyItem?.status ?? item.status;
    }

    return {
      date: dayKey(date),
      plannedAt: weeklyItem?.scheduledAt ?? plannedAt,
      channelId: item.channelId,
      channelName: item.channelName,
      telegramTarget: item.telegramTarget,
      selectedPost,
      selectedPostTitle,
      textQuality: weeklyItem?.textQuality ?? qualityItem?.textQuality ?? "unknown",
      imageQuality: weeklyItem?.imageQuality ?? qualityItem?.imageQuality ?? "unknown",
      telegramImageStatus: weeklyItem?.telegramImageStatus ?? item.telegramImageStatus,
      bodyLength: weeklyItem?.body.length ?? item.bodyLength,
      telegramCaptionLength: weeklyItem?.telegramCaptionLength ?? item.telegramCaptionLength,
      telegramCaptionStatus: weeklyItem?.telegramCaptionStatus ?? item.telegramCaptionStatus,
      status,
      blockerReason: reason,
    };
  });
}

function buildScheduledAutopublishPlan(
  state: AutopublishState,
  qualityItems: ReturnType<typeof auditPostQuality>["items"],
  date: Date,
  scheduledAt: string,
) {
  return buildDailyPlan(state, qualityItems, date).map((item) => ({
    ...item,
    plannedAt: scheduledAt,
    status: item.status === "published" || item.status === "already_published" || item.status === "daily_limit_reached" ? item.status : ("due" as const),
    blockerReason: item.blockerReason,
  }));
}

function toScheduledDetail(item: WeeklyPublishAttempt): ScheduledAutopublishDetail {
  return {
    channelId: item.channelId,
    channelName: item.channelName,
    postId: item.selectedPost,
    title: item.selectedPostTitle,
    status:
      item.publishResult === "success"
        ? "published"
        : item.publishResult === "failed" || item.publishResult === "blocked"
          ? "error"
          : item.publishResult === "already_published"
            ? "already_published"
            : "skipped",
    reason: item.publishError,
    telegramMessageId: item.telegramMessageId,
    timings: item.timings ?? null,
  };
}

function summarizeScheduledAutopublishRun({
  enabled,
  dueToday,
  schedule,
  scheduledAt,
  details,
  checkedAt,
  startedAt,
  message,
}: {
  enabled: boolean;
  dueToday: boolean;
  schedule: TwiceWeeklyAutopublishSchedule;
  scheduledAt: string;
  details: ScheduledAutopublishDetail[];
  checkedAt: string;
  startedAt?: number;
  message: string;
}): ScheduledAutopublishRunResult {
  const published = details.filter((item) => item.status === "published").length;
  const errors = details.filter((item) => item.status === "error").length;

  return {
    ok: errors === 0,
    enabled,
    dueToday,
    schedule,
    scheduledAt,
    totalChannels: channels.length,
    published,
    skipped: details.length - published - errors,
    errors,
    details,
    message,
    checkedAt,
    durationMs: startedAt ? Date.now() - startedAt : null,
  };
}

function isPublicationJournalMode(mode: AutopublishLogEntry["mode"]) {
  return mode === "autopublish" || mode === "manual_mass";
}

function buildScheduledAutopublishStatusMessage(enabled: boolean, dueToday: boolean, scheduledDay: boolean, beforeScheduledTime: boolean) {
  if (!enabled) return "Twice-weekly autopublish is disabled.";
  if (dueToday) return "Twice-weekly autopublish is due now.";
  if (beforeScheduledTime) return "Today is a publication day, waiting for scheduled time.";
  if (!scheduledDay) return "Today is not a scheduled publication day.";
  return "Twice-weekly autopublish is waiting.";
}

function buildTimingBreakdown(startedAt: number, telegramMs = 0): AutopublishTimingBreakdown {
  return {
    textMs: 0,
    imageMs: 0,
    telegramMs,
    totalMs: Date.now() - startedAt,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findNextScheduledItem(plan: AutopublishDailyPlanItem[], config: AutopublishConfig) {
  if (!config.enabled || config.pausedToday || config.emergencyStop) return null;
  const now = Date.now();

  return (
    plan.find((item) => item.status === "scheduled" && new Date(item.plannedAt).getTime() >= now) ??
    plan.find((item) => item.status === "due") ??
    plan.find((item) => item.status === "scheduled") ??
    null
  );
}

function findManualNextPublishItem(plan: AutopublishDailyPlanItem[]) {
  const runnable = plan
    .filter((item) => item.selectedPost && (item.status === "due" || item.status === "scheduled"))
    .sort((a, b) => {
      const aDue = a.status === "due" ? 0 : 1;
      const bDue = b.status === "due" ? 0 : 1;
      if (aDue !== bDue) return aDue - bDue;
      return new Date(a.plannedAt).getTime() - new Date(b.plannedAt).getTime();
    });

  return runnable[0] ?? null;
}

function getCurrentMode(config: AutopublishConfig): AutopublishMode {
  if (config.emergencyStop) return "stopped";
  if (config.pausedToday) return "paused";
  if (config.enabled) return "daily schedule";
  return "manual";
}

function getSchedulerStatus(state: AutopublishState, nextItem: AutopublishDailyPlanItem | null): AutopublishStatus["scheduler"]["status"] {
  if (state.config.emergencyStop) return "stopped";
  if (state.config.pausedToday) return "paused";
  if (!state.config.enabled) return "stopped";
  if (!nextItem) return "waiting";
  return "running";
}

function buildDiagnostics({
  state,
  queue,
  quality,
  todayPlan,
  todayPublished,
  failedToday,
  skippedToday,
  nextItem,
}: {
  state: AutopublishState;
  queue: AutopublishQueueItem[];
  quality: ReturnType<typeof auditPostQuality>;
  todayPlan: AutopublishDailyPlanItem[];
  todayPublished: number;
  failedToday: number;
  skippedToday: number;
  nextItem: AutopublishDailyPlanItem | null;
}) {
  const reasons: string[] = [];

  if (!state.config.enabled) reasons.push("Autopublish disabled");
  if (state.config.emergencyStop) reasons.push("Emergency stop active");
  if (state.config.pausedToday) reasons.push("Paused today");
  if (queue.every((item) => item.status !== "ready_to_publish")) reasons.push("No ready posts");
  if (todayPublished >= state.config.maxPostsPerDay) reasons.push("Daily limit reached");
  if (state.config.enabled && !nextItem) reasons.push("Scheduler waiting time");
  if (state.lastEnablePreflight && !state.lastEnablePreflight.ok) reasons.push("Bot access failed");
  if (queue.some((item) => item.status === "target_missing")) reasons.push("Telegram target missing");
  if (queue.some((item) => item.telegramImageStatus !== "OK" && item.selectedPost)) reasons.push("Image not ready");
  if (quality.weakText > 0) reasons.push("Weak text");
  if (quality.weakImage > 0) reasons.push("Weak image");
  if (todayPlan.some((item) => item.status === "already_published")) reasons.push("Already published today");
  if (failedToday > 0) reasons.push(`Failed today: ${failedToday}`);
  if (skippedToday > 0) reasons.push(`Skipped today: ${skippedToday}`);

  return reasons.length ? reasons : ["System is waiting for scheduled time"];
}

function channelHasPublishedToday(state: AutopublishState, channelId: string, date: Date) {
  return Boolean(findChannelLogForDay(state, channelId, date, "success"));
}

function isActiveAutopublishIssue(
  entry: AutopublishLogEntry,
  weeklyItems: WeeklyContentPlanItem[],
  queue: AutopublishQueueItem[],
  access: Awaited<ReturnType<typeof getLastTelegramAccessDiagnostics>>,
) {
  if (entry.result !== "failed" && entry.result !== "blocked") return false;
  if (entry.active === false || entry.resolvedAt) return false;

  const error = (entry.error ?? "").toLowerCase();
  const weeklyItem = entry.postId ? weeklyItems.find((item) => item.postId === entry.postId || item.id === entry.postId) : null;
  const queueItem = entry.channelId ? queue.find((item) => item.channelId === entry.channelId) : null;
  const accessItem = entry.channelId ? access?.checks.find((item) => item.channelId === entry.channelId) : null;

  if (error.includes("caption too long") || error.includes("needs_caption_fix")) {
    return Boolean(
      weeklyItem &&
        (weeklyItem.status === "blocked" ||
          weeklyItem.telegramCaptionStatus !== "OK" ||
          weeklyItem.telegramCaptionLength > telegramCaptionSafeLimit ||
          weeklyItem.qualityIssues.some((issue) => issue === "caption too long" || issue === "needs_caption_fix")),
    );
  }

  if (error.includes("chat not found") || error.includes("wrong chat_id") || error.includes("bot access") || error.includes("not enough rights")) {
    return accessItem ? accessItem.accessStatus !== "OK" : true;
  }

  if (error.includes("image") || error.includes("photo")) {
    return Boolean(
      (weeklyItem && weeklyItem.telegramImageStatus !== "OK") ||
        (queueItem && queueItem.telegramImageStatus !== "OK"),
    );
  }

  return true;
}

function findChannelLogForDay(state: AutopublishState, channelId: string, date: Date, result: AutopublishLogResult) {
  const dateKey = dayKey(date);

  return [...state.log].reverse().find((entry) => entry.channelId === channelId && entry.result === result && dayKey(new Date(entry.attemptedAt)) === dateKey);
}

async function runAutopublishEnablePreflight(config: AutopublishConfig): Promise<AutopublishEnablePreflight> {
  const blockers: string[] = [];
  const telegramConfig = getTelegramConfig();
  const weeklyState = getWeeklyContentPlanState();
  const bindings = listTelegramTargetBindings();
  const linkedTargets = bindings.filter((item) => Boolean(item.telegramTarget)).length;
  const readyPosts = weeklyState.items.filter((item) => (item.status === "ready_to_publish" || item.status === "scheduled") && item.textQuality !== "weak" && item.imageQuality !== "weak" && item.telegramImageStatus === "OK" && item.qualityIssues.length === 0);
  const readyChannels = new Set(readyPosts.map((item) => item.channelId));
  const postsWithoutImages = weeklyState.summary.missingImages;
  let botAccessOk = 0;
  let canPost = 0;

  if (telegramConfig.tokenStatus !== "configured") blockers.push("Telegram Bot token is missing");
  if (linkedTargets === 0) blockers.push("telegramTarget linked 0/15");
  if (readyChannels.size === 0) blockers.push("ready_to_publish channels 0/15");
  if (weeklyState.summary.weakText > 0) blockers.push(`weak text ${weeklyState.summary.weakText}`);
  if (weeklyState.summary.weakImage > 0) blockers.push(`weak image ${weeklyState.summary.weakImage}`);
  if (postsWithoutImages > 0) blockers.push(`posts without Telegram-ready image ${postsWithoutImages}`);
  if (weeklyState.summary.telegramImageStatusOk < weeklyState.summary.total) blockers.push(`telegram images OK ${weeklyState.summary.telegramImageStatusOk}/${weeklyState.summary.total}`);
  if (config.dailyLimitPerChannel !== 1) blockers.push("daily limit per channel must be 1");
  if (config.maxPostsPerDay !== 15) blockers.push("max posts per day must be 15");
  if (config.timezone !== "Europe/Kyiv") blockers.push("timezone must be Europe/Kyiv");

  if (telegramConfig.tokenStatus === "configured" && linkedTargets > 0) {
    try {
      const access = await checkAllTelegramAccess();
      botAccessOk = access.accessOk;
      canPost = access.canPost;
      if (!access.getMeOk) {
        blockers.push(`Telegram getMe failed: ${access.exactError ?? "unknown error"}`);
      }
      if (access.accessOk === 0) {
        const failed = access.checks.map((item) => `${item.channelName}: ${item.exactError ?? item.accessStatus}`);
        blockers.push(`bot access OK 0/${channels.length}: ${failed.join("; ")}`);
      }
    } catch (error) {
      blockers.push(`bot access check failed: ${error instanceof Error ? error.message : "Telegram API error"}`);
    }
  }

  return {
    ok: blockers.length === 0,
    checkedAt: new Date().toISOString(),
    blockers,
    telegram: {
      tokenConfigured: telegramConfig.tokenStatus === "configured",
      linkedTargets,
      botAccessOk,
      canPost,
    },
    posts: {
      readyChannels: readyChannels.size,
      readyPosts: readyPosts.length,
      weakText: weeklyState.summary.weakText,
      weakImage: weeklyState.summary.weakImage,
      postsWithoutImages,
      telegramImagesOk: weeklyState.summary.telegramImageStatusOk,
    },
    limits: {
      dailyLimitPerChannel: config.dailyLimitPerChannel,
      maxPostsPerDay: config.maxPostsPerDay,
      timezone: config.timezone,
    },
  };
}

function buildStatusMessage(state: AutopublishState) {
  if (state.lastEnablePreflight && !state.lastEnablePreflight.ok) {
    return `Autopublish was not enabled: ${state.lastEnablePreflight.blockers.join("; ")}`;
  }

  if (state.config.emergencyStop) {
    return "Autopublish is stopped by emergency stop. New publications will not start.";
  }

  if (state.config.pausedToday) {
    return "Autopublish is paused for today.";
  }

  if (state.config.enabled) {
    return "Autopublish is enabled. Posts are sent only by the daily schedule or by a separately confirmed manual run.";
  }

  return "Autopublish is disabled. The system is prepared, but nothing is sent until manual enablement.";
}

function hasSuccessForPost(state: AutopublishState, postId: string) {
  return state.log.some((entry) => entry.postId === postId && entry.result === "success");
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

