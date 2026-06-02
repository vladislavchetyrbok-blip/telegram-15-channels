import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export interface PublicationLogStatusEntry {
  id: string;
  runId: string | null;
  source: "local" | "github" | "manual" | "api" | string | null;
  channelId: string | null;
  postId: string | null;
  status: "success" | "failed" | "skipped" | "error" | string;
  message: string | null;
  telegramMessageId?: number | null;
  telegramMessageLink?: string | null;
  dryRun: boolean | null;
  createdAt: string;
}

export interface PublishSchedulerStatus {
  ok: boolean;
  storeMode: string;
  dryRun: boolean;
  realPublishEnabled: boolean;
  autopublishEnabled: boolean;
  timezone: string;
  dailyLimitPerChannel: number;
  maxPostsPerDay: number;
  lastRun: {
    runId: string | null;
    source: string | null;
    startedAt: string | null;
    finishedAt: string | null;
    lastRunAt: string | null;
    message: string | null;
  };
  checked: number;
  published: number;
  skipped: number;
  errors: number;
  message: string | null;
  lastPublished: PublicationLogStatusEntry[];
  lastErrors: PublicationLogStatusEntry[];
  recentLogs: PublicationLogStatusEntry[];
}

interface RawPublishSchedulerStatus {
  runId?: string | null;
  source?: string | null;
  storeMode?: string;
  dryRun?: boolean;
  startedAt?: string | null;
  finishedAt?: string | null;
  updatedAt?: string;
  checked?: number;
  published?: number;
  skipped?: number;
  errors?: number;
  message?: string | null;
  lastErrors?: Array<Partial<PublicationLogStatusEntry>>;
}

const runtimeDir = path.join(process.cwd(), "data", "runtime");
const statusPath = path.join(runtimeDir, "publish-scheduler.json");
const logsPath = path.join(runtimeDir, "publication_logs.json");

export function getPublishSchedulerStatus(): PublishSchedulerStatus {
  const status = readJson<RawPublishSchedulerStatus>(statusPath, {});
  const logs = getPublicationLogs();
  const recentLogs = [...logs].reverse().slice(0, 20);
  const lastErrors = (status.lastErrors ?? recentLogs.filter((entry) => isErrorStatus(entry.status))).map(normalizePublicationLog).slice(0, 10);
  const lastPublished = recentLogs.filter((entry) => entry.status === "success").slice(0, 10);
  const realPublishEnabled = process.env.TELEGRAM_REAL_PUBLISH_ENABLED === "true";
  const telegramDryRun = process.env.TELEGRAM_DRY_RUN === "true";
  const requestedDryRun = process.env.PUBLISH_DUE_DRY_RUN === undefined ? true : process.env.PUBLISH_DUE_DRY_RUN !== "false";
  const effectiveDryRun = typeof status.dryRun === "boolean" ? status.dryRun : requestedDryRun || telegramDryRun || !realPublishEnabled;

  return {
    ok: true,
    storeMode: status.storeMode ?? process.env.PUBLISH_DUE_STORE ?? (process.env.DATABASE_URL ? "postgres" : "json"),
    dryRun: effectiveDryRun,
    realPublishEnabled,
    autopublishEnabled: process.env.AUTOPUBLISH_ENABLED === "true",
    timezone: process.env.AUTOPUBLISH_TIMEZONE ?? "Europe/Kyiv",
    dailyLimitPerChannel: Number(process.env.AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL ?? 1),
    maxPostsPerDay: Number(process.env.AUTOPUBLISH_MAX_POSTS_PER_DAY ?? 15),
    lastRun: {
      runId: status.runId ?? null,
      source: status.source ?? null,
      startedAt: status.startedAt ?? null,
      finishedAt: status.finishedAt ?? null,
      lastRunAt: status.updatedAt ?? status.finishedAt ?? null,
      message: status.message ?? null,
    },
    checked: Number(status.checked ?? 0),
    published: Number(status.published ?? 0),
    skipped: Number(status.skipped ?? 0),
    errors: Number(status.errors ?? 0),
    message: status.message ?? null,
    lastPublished,
    lastErrors,
    recentLogs,
  };
}

export function getPublicationLogs(limit = 100): PublicationLogStatusEntry[] {
  return readJson<PublicationLogStatusEntry[]>(logsPath, []).map(normalizePublicationLog).slice(-limit);
}

function normalizePublicationLog(entry: Partial<PublicationLogStatusEntry>): PublicationLogStatusEntry {
  return {
    id: entry.id ?? `${entry.createdAt ?? "unknown"}-${entry.postId ?? "system"}`,
    runId: entry.runId ?? null,
    source: entry.source ?? null,
    channelId: entry.channelId ?? null,
    postId: entry.postId ?? null,
    status: entry.status === "error" ? "failed" : entry.status ?? "skipped",
    message: entry.message ?? null,
    telegramMessageId: entry.telegramMessageId ?? null,
    telegramMessageLink: entry.telegramMessageLink ?? null,
    dryRun: typeof entry.dryRun === "boolean" ? entry.dryRun : null,
    createdAt: entry.createdAt ?? new Date(0).toISOString(),
  };
}

function isErrorStatus(status: string) {
  return status === "failed" || status === "error";
}

function readJson<T>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}
