import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { channels } from "@/data/channels";
import { getPublicationLogs, type PublicationLogStatusEntry } from "@/lib/publish-scheduler-status";

type QueueStatus = "ready" | "scheduled" | "published" | "skipped" | "failed" | string;

interface WeeklyPlanItem {
  id?: string;
  postId?: string;
  channelId?: string;
  channelName?: string;
  title?: string;
  status?: QueueStatus;
  contentPlanDate?: string;
  scheduledAt?: string;
  publishTime?: string;
  telegramMessageId?: number | null;
  telegramMessageLink?: string | null;
  telegramPublishedAt?: string | null;
  publishResult?: string | null;
}

interface WeeklyPlanFile {
  items?: WeeklyPlanItem[];
  summary?: {
    total?: number;
    readyToPublish?: number;
    scheduled?: number;
    published?: number;
    failed?: number;
    blocked?: number;
  };
}

export interface WorkflowChecklistItem {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

export interface PublishMonitorStatus {
  ok: boolean;
  storeMode: string;
  dryRun: boolean;
  realPublishEnabled: boolean;
  maxPostsPerRun: number;
  maxPostsPerDay: number;
  dailyLimitPerChannel: number;
  timezone: string;
  nextScheduledCheck: string | null;
  queue: {
    total: number;
    ready: number;
    scheduled: number;
    published: number;
    skipped: number;
    failed: number;
  };
  reserve: {
    postsRemaining: number;
    estimatedDaysLeft: number;
    requiredUntilJune7: number;
    enoughUntilJune7: boolean;
  };
  today: {
    date: string;
    publishedCount: number;
    channelsPublished: string[];
    channelsMissing: string[];
    maxPostsPerDay: number;
  };
  recent: {
    published: PublicationLogStatusEntry[];
    skipped: PublicationLogStatusEntry[];
    failed: PublicationLogStatusEntry[];
  };
  githubActions: {
    workflowExists: boolean;
    checklist: WorkflowChecklistItem[];
  };
  warnings: string[];
  nextSteps: string[];
}

const root = process.cwd();
const weeklyPlanPath = path.join(root, "data", "runtime", "weekly-content-plan.json");
const workflowPath = path.join(root, ".github", "workflows", "publish-scheduler.yml");
const JUNE_7_2026 = "2026-06-07";

export function getPublishMonitorStatus(now = new Date()): PublishMonitorStatus {
  const plan = readJson<WeeklyPlanFile>(weeklyPlanPath, {});
  const items = Array.isArray(plan.items) ? plan.items : [];
  const logs = getPublicationLogs(500).reverse();
  const workflowText = existsSync(workflowPath) ? readFileSync(workflowPath, "utf8") : "";
  const workflowConfig = readWorkflowConfig(workflowText);
  const timezone = concreteWorkflowValue(workflowConfig.AUTOPUBLISH_TIMEZONE) || process.env.AUTOPUBLISH_TIMEZONE || "Europe/Kyiv";
  const maxPostsPerDay = numberFromEnvOrWorkflow("AUTOPUBLISH_MAX_POSTS_PER_DAY", workflowConfig, 15);
  const maxPostsPerRun = numberFromEnvOrWorkflow("PUBLISH_DUE_MAX_PER_RUN", workflowConfig, 15);
  const dailyLimitPerChannel = numberFromEnvOrWorkflow("AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL", workflowConfig, 1);
  const storeMode = concreteWorkflowValue(workflowConfig.PUBLISH_DUE_STORE) || process.env.PUBLISH_DUE_STORE || (process.env.DATABASE_URL ? "postgres" : "json");
  const dryRun = booleanFromEnvOrWorkflow("TELEGRAM_DRY_RUN", workflowConfig, true) || booleanFromEnvOrWorkflow("PUBLISH_DUE_DRY_RUN", workflowConfig, false);
  const realPublishEnabled = booleanFromEnvOrWorkflow("TELEGRAM_REAL_PUBLISH_ENABLED", workflowConfig, false);
  const todayDate = formatDateInTimeZone(now, timezone);
  const queue = getQueueCounts(items, plan.summary);
  const logsPublishedToday = logs.filter((entry) => entry.status === "success" && !entry.dryRun && isSameLocalDate(entry.createdAt, todayDate, timezone));
  const itemPublishedToday = items.filter((item) => isItemPublishedToday(item, todayDate, timezone));
  const channelsPublished = uniqueSorted([
    ...logsPublishedToday.map((entry) => entry.channelId).filter(Boolean),
    ...itemPublishedToday.map((item) => item.channelId).filter(Boolean),
  ] as string[]);
  const allChannelIds = channels.map((channel) => channel.id).sort();
  const channelsMissing = allChannelIds.filter((channelId) => !channelsPublished.includes(channelId));
  const postsRemaining = countPostsRemainingUntilJune7(items, todayDate);
  const requiredUntilJune7 = Math.max(0, daysInclusive(todayDate, JUNE_7_2026)) * maxPostsPerDay;
  const estimatedDaysLeft = maxPostsPerDay > 0 ? roundOne(postsRemaining / maxPostsPerDay) : 0;
  const githubActions = getWorkflowChecklist(workflowText, workflowConfig);
  const warnings = getWarnings({ queue, postsRemaining, requiredUntilJune7, dryRun, realPublishEnabled, storeMode, githubActions });
  const nextSteps = getNextSteps({ warnings, postsRemaining, requiredUntilJune7, channelsMissing });

  return {
    ok: true,
    storeMode,
    dryRun,
    realPublishEnabled,
    maxPostsPerRun,
    maxPostsPerDay,
    dailyLimitPerChannel,
    timezone,
    nextScheduledCheck: getNextHourlyCronCheck(now, 17),
    queue,
    reserve: {
      postsRemaining,
      estimatedDaysLeft,
      requiredUntilJune7,
      enoughUntilJune7: postsRemaining >= requiredUntilJune7,
    },
    today: {
      date: todayDate,
      publishedCount: channelsPublished.length,
      channelsPublished,
      channelsMissing,
      maxPostsPerDay,
    },
    recent: {
      published: logs.filter((entry) => entry.status === "success").slice(0, 30),
      skipped: logs.filter((entry) => entry.status === "skipped").slice(0, 30),
      failed: logs.filter((entry) => entry.status === "failed" || entry.status === "error").slice(0, 30),
    },
    githubActions,
    warnings,
    nextSteps,
  };
}

function getQueueCounts(items: WeeklyPlanItem[], summary: WeeklyPlanFile["summary"]): PublishMonitorStatus["queue"] {
  const scheduled = countByStatus(items, ["scheduled"]);
  const readyExplicit = countByStatus(items, ["ready", "approved", "draft"]);
  const published = countByStatus(items, ["published"]);
  const skipped = countByStatus(items, ["skipped"]);
  const failed = countByStatus(items, ["failed", "error"]);

  return {
    total: Number(summary?.total ?? items.length),
    ready: Number(summary?.readyToPublish ?? readyExplicit + scheduled),
    scheduled: Number(summary?.scheduled ?? scheduled),
    published: Number(summary?.published ?? published),
    skipped,
    failed: Number(summary?.failed ?? failed),
  };
}

function countByStatus(items: WeeklyPlanItem[], statuses: string[]) {
  return items.filter((item) => statuses.includes(String(item.status ?? "").toLowerCase())).length;
}

function countPostsRemainingUntilJune7(items: WeeklyPlanItem[], todayDate: string) {
  return items.filter((item) => {
    const itemDate = item.contentPlanDate || toDateOnly(item.scheduledAt);
    if (!itemDate || itemDate < todayDate || itemDate > JUNE_7_2026) return false;
    const status = String(item.status ?? "").toLowerCase();
    return ["ready", "approved", "draft", "scheduled"].includes(status);
  }).length;
}

function isItemPublishedToday(item: WeeklyPlanItem, todayDate: string, timezone: string) {
  const status = String(item.status ?? "").toLowerCase();
  if (status !== "published" && item.publishResult !== "success" && !item.telegramMessageId) return false;
  const publishedAt = item.telegramPublishedAt || item.scheduledAt;
  return Boolean(publishedAt && isSameLocalDate(publishedAt, todayDate, timezone));
}

function getWorkflowChecklist(workflowText: string, workflowConfig: Record<string, string>) {
  const workflowExists = workflowText.length > 0;
  const checklist: WorkflowChecklistItem[] = [
    { key: "workflow_exists", label: ".github/workflows/publish-scheduler.yml exists", ok: workflowExists, detail: workflowExists ? "found" : "missing" },
    { key: "cron_enabled", label: "cron enabled", ok: /schedule:\s*[\s\S]*cron:/m.test(workflowText), detail: findFirst(workflowText, /cron:\s*["']?([^"'\n]+)/) ?? "not found" },
    { key: "workflow_dispatch", label: "workflow_dispatch enabled", ok: workflowText.includes("workflow_dispatch:"), detail: workflowText.includes("workflow_dispatch:") ? "enabled" : "missing" },
    { key: "store_json", label: "PUBLISH_DUE_STORE=json", ok: workflowConfig.PUBLISH_DUE_STORE === "json", detail: workflowConfig.PUBLISH_DUE_STORE ?? "not set" },
    { key: "max_per_run", label: "PUBLISH_DUE_MAX_PER_RUN=15", ok: workflowConfig.PUBLISH_DUE_MAX_PER_RUN === "15", detail: workflowConfig.PUBLISH_DUE_MAX_PER_RUN ?? "not set" },
    { key: "telegram_dry_run", label: "TELEGRAM_DRY_RUN is not true", ok: workflowConfig.TELEGRAM_DRY_RUN !== "true", detail: workflowConfig.TELEGRAM_DRY_RUN ?? "not set" },
    { key: "real_publish", label: "TELEGRAM_REAL_PUBLISH_ENABLED is not false", ok: workflowConfig.TELEGRAM_REAL_PUBLISH_ENABLED !== "false", detail: workflowConfig.TELEGRAM_REAL_PUBLISH_ENABLED ?? "not set" },
    { key: "timeout", label: "timeout-minutes exists", ok: /timeout-minutes:\s*\d+/m.test(workflowText), detail: findFirst(workflowText, /timeout-minutes:\s*(\d+)/) ?? "not found" },
    { key: "runtime_cache", label: "runtime cache enabled", ok: workflowText.includes("actions/cache") && workflowText.includes("data/runtime/publication_logs.json") && workflowText.includes("data/runtime/publish-scheduler.json"), detail: workflowText.includes("actions/cache") ? "actions/cache configured" : "missing" },
  ];

  return { workflowExists, checklist };
}

function readWorkflowConfig(workflowText: string) {
  const config: Record<string, string> = {};
  for (const key of [
    "PUBLISH_DUE_STORE",
    "PUBLISH_DUE_MAX_PER_RUN",
    "PUBLISH_DUE_DRY_RUN",
    "PUBLISH_DUE_REAL_PUBLISH_ENABLED",
    "TELEGRAM_DRY_RUN",
    "TELEGRAM_REAL_PUBLISH_ENABLED",
    "AUTOPUBLISH_MAX_POSTS_PER_DAY",
    "AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL",
    "AUTOPUBLISH_TIMEZONE",
  ]) {
    const value = findFirst(workflowText, new RegExp(`${key}:\\s*["']?([^"'\\n]+)`));
    if (value) config[key] = value.trim();
  }
  return config;
}

function getWarnings(input: {
  queue: PublishMonitorStatus["queue"];
  postsRemaining: number;
  requiredUntilJune7: number;
  dryRun: boolean;
  realPublishEnabled: boolean;
  storeMode: string;
  githubActions: PublishMonitorStatus["githubActions"];
}) {
  const warnings: string[] = [];
  if (input.dryRun) warnings.push("GitHub Actions config currently resolves as dryRun=true.");
  if (!input.realPublishEnabled) warnings.push("GitHub Actions config currently resolves as realPublishEnabled=false.");
  if (input.storeMode !== "json") warnings.push(`Store mode is ${input.storeMode}; expected json for the current production setup.`);
  if (input.queue.ready <= 0 && input.queue.scheduled <= 0) warnings.push("No ready/scheduled posts found in the JSON queue.");
  if (input.postsRemaining < input.requiredUntilJune7) warnings.push("Prepared post reserve may be insufficient through June 7 at the current daily limit.");
  for (const check of input.githubActions.checklist) {
    if (!check.ok) warnings.push(`GitHub Actions checklist failed: ${check.label}.`);
  }
  return Array.from(new Set(warnings));
}

function getNextSteps(input: { warnings: string[]; postsRemaining: number; requiredUntilJune7: number; channelsMissing: string[] }) {
  const nextSteps: string[] = [];
  if (input.warnings.length === 0) nextSteps.push("Keep monitoring GitHub Actions runs and Telegram channels once per day.");
  if (input.postsRemaining < input.requiredUntilJune7) nextSteps.push("Generate or approve more scheduled posts before June 7.");
  if (input.channelsMissing.length > 0) nextSteps.push("Let GitHub Actions continue hourly; missing channels may be waiting for their due publishAt time.");
  nextSteps.push("Do not run real publish:due from Codex; use GitHub Actions for real publishing.");
  return Array.from(new Set(nextSteps));
}

function numberFromEnvOrWorkflow(key: string, workflowConfig: Record<string, string>, fallback: number) {
  const raw = concreteWorkflowValue(workflowConfig[key]) ?? process.env[key];
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function booleanFromEnvOrWorkflow(key: string, workflowConfig: Record<string, string>, fallback: boolean) {
  const raw = concreteWorkflowValue(workflowConfig[key]) ?? process.env[key];
  if (raw === "true") return true;
  if (raw === "false") return false;
  return fallback;
}

function concreteWorkflowValue(value?: string) {
  if (!value || value.includes("${{")) return undefined;
  return value;
}

function getNextHourlyCronCheck(now: Date, minute: number) {
  const next = new Date(now);
  next.setUTCSeconds(0, 0);
  if (next.getUTCMinutes() >= minute) next.setUTCHours(next.getUTCHours() + 1);
  next.setUTCMinutes(minute);
  return next.toISOString();
}

function formatDateInTimeZone(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function isSameLocalDate(value: string, date: string, timezone: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return formatDateInTimeZone(parsed, timezone) === date;
}

function daysInclusive(start: string, end: string) {
  if (start > end) return 0;
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate = new Date(`${end}T00:00:00.000Z`);
  return Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function toDateOnly(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function findFirst(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  return match?.[1]?.trim().replace(/["']$/, "");
}

function readJson<T>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}
