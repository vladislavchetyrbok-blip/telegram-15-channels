import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const storeKeys = ["channels", "posts", "publication_logs", "scheduler_runs"] as const;

export type StoreKey = (typeof storeKeys)[number];
export type StoreCounts = Record<StoreKey, number>;
export type StoreIds = Record<StoreKey, string[]>;

export interface DuplicateId {
  id: string;
  count: number;
}

export type DuplicateIds = Record<StoreKey, DuplicateId[]>;

export interface StoreReaderSnapshot {
  counts: StoreCounts;
  ids: StoreIds;
  duplicates: DuplicateIds;
  warnings: string[];
  problems: string[];
}

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");

export function readJsonStoreSnapshot(): StoreReaderSnapshot {
  const problems: string[] = [];
  const warnings: string[] = [];
  const plan = readJson(path.join(runtimeDir, "weekly-content-plan.json"), { items: [] }, problems);
  const targets = readJson(path.join(runtimeDir, "telegram-targets.json"), {}, problems);
  const logs = readJson(path.join(runtimeDir, "publication_logs.json"), [], problems);
  const scheduler = readJson(path.join(runtimeDir, "publish-scheduler.json"), null, problems);
  const items = Array.isArray(plan.items) ? plan.items : [];

  if (!Array.isArray(plan.items)) {
    problems.push("weekly-content-plan.json does not contain an items array.");
  }

  const channelIds = uniqueSorted([
    ...items.map((item: Record<string, unknown>) => stringOrNull(item.channelId)).filter(Boolean),
    ...Object.keys(isPlainObject(targets) ? targets : {}),
  ] as string[]);
  const postIds = items
    .filter((item: Record<string, unknown>) => stringOrNull(item.channelId))
    .map((item: Record<string, unknown>) => stringOrNull(item.postId) ?? stringOrNull(item.id))
    .filter(Boolean) as string[];
  const publicationLogIds = Array.isArray(logs)
    ? logs.map((log: Record<string, unknown>, index: number) => {
        const id = stringOrNull(log.id);
        if (id) return id;
        warnings.push(`publication_logs.json item ${index} has no id; using a deterministic local fallback for dual-read compare only.`);
        return `json-log-${index}-${String(log.createdAt ?? "missing-created-at")}`;
      })
    : [];
  const schedulerRunIds = scheduler ? [String(scheduler.runId ?? "latest-json-scheduler-run")] : [];

  if (!Array.isArray(logs)) {
    problems.push("publication_logs.json is not an array.");
  }

  const ids: StoreIds = {
    channels: channelIds,
    posts: uniqueSorted(postIds),
    publication_logs: uniqueSorted(publicationLogIds),
    scheduler_runs: uniqueSorted(schedulerRunIds),
  };

  return {
    ids,
    counts: countsFromIds(ids),
    duplicates: {
      channels: [],
      posts: duplicateIds(postIds),
      publication_logs: duplicateIds(publicationLogIds),
      scheduler_runs: duplicateIds(schedulerRunIds),
    },
    warnings: Array.from(new Set(warnings)),
    problems: Array.from(new Set(problems)),
  };
}

export function emptyStoreCounts(): StoreCounts {
  return {
    channels: 0,
    posts: 0,
    publication_logs: 0,
    scheduler_runs: 0,
  };
}

export function emptyStoreIds(): StoreIds {
  return {
    channels: [],
    posts: [],
    publication_logs: [],
    scheduler_runs: [],
  };
}

export function emptyDuplicateIds(): DuplicateIds {
  return {
    channels: [],
    posts: [],
    publication_logs: [],
    scheduler_runs: [],
  };
}

export function countsFromIds(ids: StoreIds): StoreCounts {
  return {
    channels: ids.channels.length,
    posts: ids.posts.length,
    publication_logs: ids.publication_logs.length,
    scheduler_runs: ids.scheduler_runs.length,
  };
}

export function diffStoreIds(source: StoreIds, target: StoreIds): StoreIds {
  return {
    channels: diffIds(source.channels, target.channels),
    posts: diffIds(source.posts, target.posts),
    publication_logs: diffIds(source.publication_logs, target.publication_logs),
    scheduler_runs: diffIds(source.scheduler_runs, target.scheduler_runs),
  };
}

export function hasAnyStoreIds(ids: StoreIds): boolean {
  return storeKeys.some((key) => ids[key].length > 0);
}

export function hasAnyDuplicates(duplicates: DuplicateIds): boolean {
  return storeKeys.some((key) => duplicates[key].length > 0);
}

function readJson(filePath: string, fallback: any, problems: string[]) {
  if (!existsSync(filePath)) {
    problems.push(`${path.relative(root, filePath)} is missing.`);
    return fallback;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    problems.push(`${path.relative(root, filePath)} could not be parsed: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

function diffIds(source: string[], target: string[]) {
  const targetSet = new Set(target);
  return source.filter((id) => !targetSet.has(id));
}

function duplicateIds(ids: string[]): DuplicateId[] {
  const counts = new Map<string, number>();
  for (const id of ids) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function uniqueSorted(ids: string[]) {
  return Array.from(new Set(ids)).sort((left, right) => left.localeCompare(right));
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
