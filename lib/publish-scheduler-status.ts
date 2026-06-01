import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export interface PublicationLogStatusEntry {
  id: string;
  channelId: string | null;
  postId: string | null;
  status: "success" | "error" | "skipped" | string;
  message: string | null;
  telegramMessageId?: number | null;
  telegramMessageLink?: string | null;
  createdAt: string;
}

export interface PublishSchedulerStatus {
  ok: boolean;
  lastRunAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  checked: number;
  published: number;
  skipped: number;
  errors: number;
  dryRun: boolean | null;
  storeMode: string | null;
  message: string | null;
  lastErrors: PublicationLogStatusEntry[];
  recentLogs: PublicationLogStatusEntry[];
}

const runtimeDir = path.join(process.cwd(), "data", "runtime");
const statusPath = path.join(runtimeDir, "publish-scheduler.json");
const logsPath = path.join(runtimeDir, "publication_logs.json");

export function getPublishSchedulerStatus(): PublishSchedulerStatus {
  const status = readJson<Partial<PublishSchedulerStatus> & { updatedAt?: string }>(statusPath, {});
  const logs = readJson<PublicationLogStatusEntry[]>(logsPath, []);
  const recentLogs = [...logs].reverse().slice(0, 20);
  const lastErrors = (status.lastErrors ?? recentLogs.filter((entry) => entry.status === "error")).slice(0, 10);

  return {
    ok: true,
    lastRunAt: status.updatedAt ?? status.finishedAt ?? null,
    startedAt: status.startedAt ?? null,
    finishedAt: status.finishedAt ?? null,
    checked: Number(status.checked ?? 0),
    published: Number(status.published ?? 0),
    skipped: Number(status.skipped ?? 0),
    errors: Number(status.errors ?? 0),
    dryRun: typeof status.dryRun === "boolean" ? status.dryRun : null,
    storeMode: status.storeMode ?? null,
    message: status.message ?? null,
    lastErrors,
    recentLogs,
  };
}

function readJson<T>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}
