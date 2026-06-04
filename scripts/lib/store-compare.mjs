import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadLocalEnv } from "./load-local-env.mjs";
import { buildPgConfig } from "./pg-config.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const tableKeys = ["channels", "posts", "publication_logs", "scheduler_runs"];

export async function compareJsonSupabaseStore(options = {}) {
  if (options.loadEnv) {
    loadLocalEnv({ cwd: root });
  }

  const checkedAt = new Date().toISOString();
  const local = readLocalJsonStoreSnapshot();
  const baseReport = {
    ok: false,
    status: "error",
    checkedAt,
    supabaseConfigured: Boolean(process.env.DATABASE_URL),
    localCounts: local.counts,
    supabaseCounts: zeroCounts(),
    missingInSupabase: emptyIdGroups(),
    extraInSupabase: emptyIdGroups(),
    duplicates: {
      local: local.duplicates,
      supabase: emptyDuplicateGroups(),
    },
    warnings: [...local.warnings],
    problems: [...local.problems],
  };

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return {
      ...baseReport,
      message: "DATABASE_URL is not configured",
      problems: [...baseReport.problems, "DATABASE_URL is not configured"],
    };
  }

  let client;
  try {
    const { Client } = await import("pg");
    client = new Client(buildPgConfig(databaseUrl));
    await client.connect();

    const supabase = await readSupabaseSnapshot(client);
    const missingInSupabase = diffIdGroups(local.ids, supabase.ids);
    const extraInSupabase = diffIdGroups(supabase.ids, local.ids);
    const duplicateGroups = {
      local: local.duplicates,
      supabase: supabase.duplicates,
    };
    const mismatch = hasAnyIds(missingInSupabase) || hasAnyIds(extraInSupabase);
    const hasDuplicates = hasAnyDuplicates(duplicateGroups.local) || hasAnyDuplicates(duplicateGroups.supabase);
    const warnings = [...baseReport.warnings];

    if (mismatch) warnings.push("JSON and Supabase IDs do not match.");
    if (hasDuplicates) warnings.push("Duplicate IDs were found.");

    const status = baseReport.problems.length ? "error" : mismatch || hasDuplicates || warnings.length ? "warning" : "ok";

    return {
      ...baseReport,
      ok: status === "ok",
      status,
      message: status === "ok" ? "JSON and Supabase stores are synced by IDs and counts." : "JSON and Supabase comparison finished with warnings.",
      supabaseCounts: supabase.counts,
      missingInSupabase,
      extraInSupabase,
      duplicates: duplicateGroups,
      warnings: Array.from(new Set(warnings)),
    };
  } catch (error) {
    return {
      ...baseReport,
      status: "error",
      message: "Supabase comparison failed.",
      problems: [...baseReport.problems, sanitizeError(error, databaseUrl)],
    };
  } finally {
    if (client) {
      await client.end().catch(() => undefined);
    }
  }
}

function readLocalJsonStoreSnapshot() {
  const problems = [];
  const warnings = [];
  const plan = readJson(path.join(runtimeDir, "weekly-content-plan.json"), { items: [] }, problems);
  const targets = readJson(path.join(runtimeDir, "telegram-targets.json"), {}, problems);
  const logs = readJson(path.join(runtimeDir, "publication_logs.json"), [], problems);
  const scheduler = readJson(path.join(runtimeDir, "publish-scheduler.json"), null, problems);
  const items = Array.isArray(plan.items) ? plan.items : [];

  if (!Array.isArray(plan.items)) {
    problems.push("weekly-content-plan.json does not contain an items array.");
  }

  const channelIds = uniqueSorted([
    ...items.map((item) => stringOrNull(item.channelId)).filter(Boolean),
    ...Object.keys(isPlainObject(targets) ? targets : {}),
  ]);
  const postIds = items
    .filter((item) => stringOrNull(item.channelId))
    .map((item) => stringOrNull(item.postId) ?? stringOrNull(item.id))
    .filter(Boolean);
  const publicationLogIds = Array.isArray(logs)
    ? logs.map((log, index) => {
        const id = stringOrNull(log.id);
        if (id) return id;
        warnings.push(`publication_logs.json item ${index} has no id; using a deterministic local fallback for compare only.`);
        return `json-log-${index}-${log.createdAt ?? "missing-created-at"}`;
      })
    : [];
  const schedulerRunIds = scheduler ? [String(scheduler.runId ?? "latest-json-scheduler-run")] : [];

  if (!Array.isArray(logs)) {
    problems.push("publication_logs.json is not an array.");
  }

  const ids = {
    channels: uniqueSorted(channelIds),
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

async function readSupabaseSnapshot(client) {
  const entries = [];
  for (const table of tableKeys) {
    const result = await client.query(`select id::text as id from ${table} order by id asc`);
    entries.push([table, result.rows.map((row) => String(row.id))]);
  }

  const ids = Object.fromEntries(entries);
  const duplicateEntries = [];
  for (const table of tableKeys) {
    const result = await client.query(`select id::text as id, count(*)::int as count from ${table} group by id having count(*) > 1 order by id asc`);
    duplicateEntries.push([table, result.rows.map((row) => ({ id: String(row.id), count: Number(row.count) }))]);
  }

  return {
    ids,
    counts: countsFromIds(ids),
    duplicates: Object.fromEntries(duplicateEntries),
  };
}

function readJson(filePath, fallback, problems) {
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

function countsFromIds(ids) {
  return Object.fromEntries(tableKeys.map((key) => [key, ids[key].length]));
}

function zeroCounts() {
  return Object.fromEntries(tableKeys.map((key) => [key, 0]));
}

function emptyIdGroups() {
  return Object.fromEntries(tableKeys.map((key) => [key, []]));
}

function emptyDuplicateGroups() {
  return Object.fromEntries(tableKeys.map((key) => [key, []]));
}

function diffIdGroups(source, target) {
  return Object.fromEntries(tableKeys.map((key) => {
    const targetSet = new Set(target[key]);
    return [key, source[key].filter((id) => !targetSet.has(id))];
  }));
}

function duplicateIds(ids) {
  const counts = new Map();
  for (const id of ids) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function uniqueSorted(ids) {
  return Array.from(new Set(ids)).sort((left, right) => left.localeCompare(right));
}

function hasAnyIds(groups) {
  return tableKeys.some((key) => groups[key].length > 0);
}

function hasAnyDuplicates(groups) {
  return tableKeys.some((key) => groups[key].length > 0);
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeError(error, databaseUrl) {
  let message = error instanceof Error ? error.message : String(error);
  if (databaseUrl) {
    message = message.split(databaseUrl).join("[redacted DATABASE_URL]");
    try {
      const parsed = new URL(databaseUrl);
      if (parsed.password) {
        message = message.split(decodeURIComponent(parsed.password)).join("[redacted password]");
        message = message.split(parsed.password).join("[redacted password]");
      }
    } catch {
      // Keep the original safe replacement above.
    }
  }
  return message;
}
