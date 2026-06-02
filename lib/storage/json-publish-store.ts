import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  PostRecord,
  PublicationLogRecord,
  PublishStore,
  SchedulerRunRecord,
  SchedulerRunResult,
} from "./types";

interface WeeklyPlanState {
  version?: number;
  updatedAt?: string;
  items: Array<Record<string, unknown>>;
}

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const planPath = path.join(runtimeDir, "weekly-content-plan.json");
const logsPath = path.join(runtimeDir, "publication_logs.json");
const statusPath = path.join(runtimeDir, "publish-scheduler.json");
const dueStatuses = ["scheduled", "draft", "approved", "ready_to_publish"];

export class JsonPublishStore implements PublishStore {
  mode = "json" as const;

  async getDuePosts(now: Date): Promise<PostRecord[]> {
    const state = readJson<WeeklyPlanState>(planPath, { version: 1, items: [] });
    const timestamp = now.getTime();

    return state.items
      .filter((item) => dueStatuses.includes(String(item.status ?? "")))
      .filter((item) => new Date(String(item.publishAt ?? item.scheduledAt ?? 0)).getTime() <= timestamp)
      .sort((a, b) => new Date(String(a.publishAt ?? a.scheduledAt ?? 0)).getTime() - new Date(String(b.publishAt ?? b.scheduledAt ?? 0)).getTime())
      .map(mapPlanItemToPostRecord);
  }

  async markPostPublished(postId: string, telegramMessageId: number, telegramMessageLink: string | null = null): Promise<void> {
    const state = readJson<WeeklyPlanState>(planPath, { version: 1, items: [] });
    const now = new Date().toISOString();

    state.items = state.items.map((item) =>
      String(item.postId ?? item.id) === postId
        ? {
            ...item,
            status: "published",
            publishResult: "success",
            telegramMessageId,
            telegramMessageLink,
            telegramPublishedAt: now,
            updatedAt: now,
          }
        : item,
    );
    state.updatedAt = now;
    writeJson(planPath, state);
  }

  async markPostFailed(postId: string, error: string): Promise<void> {
    const state = readJson<WeeklyPlanState>(planPath, { version: 1, items: [] });
    const now = new Date().toISOString();

    state.items = state.items.map((item) =>
      String(item.postId ?? item.id) === postId
        ? {
            ...item,
            status: "failed",
            publishResult: "failed",
            publishError: error,
            errorMessage: error,
            updatedAt: now,
          }
        : item,
    );
    state.updatedAt = now;
    writeJson(planPath, state);
  }

  async appendPublicationLog(log: PublicationLogRecord): Promise<PublicationLogRecord> {
    const logs = readJson<PublicationLogRecord[]>(logsPath, []);
    const nextLog: PublicationLogRecord = {
      ...log,
      id: log.id ?? randomUUID(),
      createdAt: log.createdAt ?? new Date().toISOString(),
    };

    logs.push(nextLog);
    writeJson(logsPath, logs.slice(-1000));
    return nextLog;
  }

  async getPublicationLogs(limit: number): Promise<PublicationLogRecord[]> {
    return readJson<PublicationLogRecord[]>(logsPath, []).slice(-Math.max(1, limit));
  }

  async getSchedulerStatus(): Promise<SchedulerRunRecord | null> {
    if (!existsSync(statusPath)) return null;
    const status = readJson<Record<string, unknown>>(statusPath, {});
    return {
      id: String(status.runId ?? "latest-json-run"),
      source: typeof status.source === "string" ? status.source : null,
      storeMode: String(status.storeMode ?? "json"),
      dryRun: Boolean(status.dryRun),
      realPublishEnabled: Boolean(status.realPublishEnabled),
      checked: Number(status.checked ?? 0),
      published: Number(status.published ?? 0),
      skipped: Number(status.skipped ?? 0),
      errors: Number(status.errors ?? 0),
      message: typeof status.message === "string" ? status.message : null,
      startedAt: String(status.startedAt ?? status.updatedAt ?? new Date(0).toISOString()),
      finishedAt: typeof status.finishedAt === "string" ? status.finishedAt : null,
    };
  }

  async createSchedulerRun(data: SchedulerRunRecord): Promise<SchedulerRunRecord> {
    writeJson(statusPath, {
      runId: data.id,
      source: data.source,
      startedAt: data.startedAt,
      finishedAt: data.finishedAt,
      storeMode: data.storeMode,
      dryRun: data.dryRun,
      realPublishEnabled: data.realPublishEnabled,
      checked: data.checked,
      published: data.published,
      skipped: data.skipped,
      errors: data.errors,
      message: data.message,
      updatedAt: new Date().toISOString(),
    });
    return data;
  }

  async finishSchedulerRun(runId: string, result: SchedulerRunResult): Promise<void> {
    const current = readJson<Record<string, unknown>>(statusPath, {});
    writeJson(statusPath, {
      ...current,
      runId,
      checked: result.checked,
      published: result.published,
      skipped: result.skipped,
      errors: result.errors,
      message: result.message,
      finishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

function mapPlanItemToPostRecord(item: Record<string, unknown>): PostRecord {
  return {
    id: String(item.id ?? item.postId ?? ""),
    postId: String(item.postId ?? item.id ?? ""),
    channelId: String(item.channelId ?? ""),
    channelName: typeof item.channelName === "string" ? item.channelName : null,
    title: typeof item.title === "string" ? item.title : null,
    text: typeof item.body === "string" ? item.body : null,
    telegramCaption: typeof item.telegramCaption === "string" ? item.telegramCaption : null,
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
    imagePath: typeof item.imagePath === "string" ? item.imagePath : null,
    telegramImagePath: typeof item.telegramImagePath === "string" ? item.telegramImagePath : null,
    status: String(item.status ?? "draft"),
    publishAt: typeof item.publishAt === "string" ? item.publishAt : typeof item.scheduledAt === "string" ? item.scheduledAt : null,
    telegramMessageId: typeof item.telegramMessageId === "number" ? item.telegramMessageId : null,
    telegramMessageLink: typeof item.telegramMessageLink === "string" ? item.telegramMessageLink : null,
    errorMessage: typeof item.errorMessage === "string" ? item.errorMessage : typeof item.publishError === "string" ? item.publishError : null,
    publishResult: typeof item.publishResult === "string" ? item.publishResult : null,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : null,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : null,
    raw: item,
  };
}

function readJson<T>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function writeJson(filePath: string, value: unknown) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}
