import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const planPath = path.join(runtimeDir, "weekly-content-plan.json");
const targetsPath = path.join(runtimeDir, "telegram-targets.json");
const logsPath = path.join(runtimeDir, "publication_logs.json");
const schedulerPath = path.join(runtimeDir, "publish-scheduler.json");
const apply = process.argv.includes("--apply");
const dryRun = !apply;

async function main() {
  const rawSource = readSourceData();
  let source = {
    channels: dedupeById(rawSource.channels),
    posts: dedupeById(rawSource.posts),
    publicationLogs: dedupeById(rawSource.publicationLogs),
    schedulerRuns: dedupeById(rawSource.schedulerRuns),
  };
  const sourceDuplicates = {
    channels: rawSource.channels.length - source.channels.length,
    posts: rawSource.posts.length - source.posts.length,
    publicationLogs: rawSource.publicationLogs.length - source.publicationLogs.length,
    schedulerRuns: rawSource.schedulerRuns.length - source.schedulerRuns.length,
  };
  const relationProblems = findRelationProblems(source);
  const problems = [
    ...rawSource.problems,
    ...duplicateProblems(sourceDuplicates),
    ...relationProblems,
  ];
  source = clearMissingPublicationLogRelations(source);

  const report = {
    ok: true,
    mode: dryRun ? "dry-run" : "apply",
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    found: {
      channels: rawSource.channels.length,
      posts: rawSource.posts.length,
      publicationLogs: rawSource.publicationLogs.length,
      schedulerRuns: rawSource.schedulerRuns.length,
    },
    unique: {
      channels: source.channels.length,
      posts: source.posts.length,
      publicationLogs: source.publicationLogs.length,
      schedulerRuns: source.schedulerRuns.length,
    },
    inserts: {
      channels: 0,
      posts: 0,
      publicationLogs: 0,
      schedulerRuns: 0,
    },
    skippedDuplicates: sourceDuplicates,
    problems,
  };

  if (!process.env.DATABASE_URL) {
    report.inserts.channels = source.channels.length;
    report.inserts.posts = source.posts.length;
    report.inserts.publicationLogs = source.publicationLogs.length;
    report.inserts.schedulerRuns = source.schedulerRuns.length;
    report.problems.push("DATABASE_URL is not configured. JSON was read successfully, but database duplicate checks/apply were skipped.");
    report.problems.push("Duplicate counts only include duplicates found inside local JSON. Existing database duplicates are unknown without DATABASE_URL.");

    if (apply) {
      report.ok = false;
      report.problems.push("Apply mode requires DATABASE_URL. No database writes were made.");
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = 1;
      return;
    }

    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const { Client } = await import("pg");
  const client = new Client(buildPgConfig(process.env.DATABASE_URL));
  await client.connect();

  try {
    const existing = await readExistingIds(client, source);
    report.skippedDuplicates.channels += existing.channels;
    report.skippedDuplicates.posts += existing.posts;
    report.skippedDuplicates.publicationLogs += existing.publicationLogs;
    report.skippedDuplicates.schedulerRuns += existing.schedulerRuns;
    report.inserts.channels = source.channels.length - existing.channels;
    report.inserts.posts = source.posts.length - existing.posts;
    report.inserts.publicationLogs = source.publicationLogs.length - existing.publicationLogs;
    report.inserts.schedulerRuns = source.schedulerRuns.length - existing.schedulerRuns;

    if (dryRun) {
      report.problems.push("Dry-run only. No database writes were made.");
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    await client.query("begin");
    await insertChannels(client, source.channels);
    await insertPosts(client, source.posts);
    await insertPublicationLogs(client, source.publicationLogs);
    await insertSchedulerRuns(client, source.schedulerRuns);
    await client.query("commit");

    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    if (apply) await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

function readSourceData() {
  const problems = [];
  const plan = readJson(planPath, { items: [] }, problems);
  const targets = readJson(targetsPath, {}, problems);
  const logs = readJson(logsPath, [], problems);
  const scheduler = readJson(schedulerPath, null, problems);
  const items = Array.isArray(plan.items) ? plan.items : [];
  const channelsById = new Map();

  if (!Array.isArray(plan.items)) {
    problems.push("weekly-content-plan.json does not contain an items array.");
  }

  for (const item of items) {
    const channelId = stringOrNull(item.channelId);
    if (!channelId) {
      problems.push(`Post ${String(item.postId ?? item.id ?? "unknown")} has no channelId and was skipped.`);
      continue;
    }
    const target = targets[channelId] ?? {};
    channelsById.set(channelId, {
      id: channelId,
      title: stringOrNull(target.channelTitle) ?? stringOrNull(item.channelName) ?? channelId,
      slug: channelId,
      telegram_chat_id: stringOrNull(target.telegramTarget),
      language: stringOrNull(item.language),
      category: stringOrNull(item.contentTopic),
      is_active: true,
      created_at: dateOrNow(item.createdAt, problems, `channel ${channelId} created_at`),
      updated_at: dateOrNow(item.updatedAt, problems, `channel ${channelId} updated_at`),
    });
  }

  for (const [channelId, target] of Object.entries(targets)) {
    if (channelsById.has(channelId)) continue;
    channelsById.set(channelId, {
      id: channelId,
      title: stringOrNull(target.channelTitle) ?? channelId,
      slug: channelId,
      telegram_chat_id: stringOrNull(target.telegramTarget),
      language: null,
      category: null,
      is_active: true,
      created_at: dateOrNow(target.telegramLinkedAt, problems, `channel ${channelId} created_at`),
      updated_at: dateOrNow(target.telegramLinkedAt, problems, `channel ${channelId} updated_at`),
    });
  }

  for (const channel of channelsById.values()) {
    if (!channel.telegram_chat_id) {
      problems.push(`Channel ${channel.id} has no telegram_chat_id in telegram-targets.json.`);
    }
  }

  const posts = items.flatMap((item) => {
    const postId = stringOrNull(item.postId) ?? stringOrNull(item.id);
    const channelId = stringOrNull(item.channelId);
    if (!postId || !channelId) return [];

    return [{
      id: postId,
      channel_id: channelId,
      title: stringOrNull(item.title),
      text: stringOrNull(item.body) ?? stringOrNull(item.text),
      image_url: stringOrNull(item.imageUrl),
      image_path: stringOrNull(item.telegramImagePath) ?? stringOrNull(item.imagePath),
      status: normalizePostStatus(item.status, problems, postId),
      publish_at: dateOrNull(item.publishAt ?? item.scheduledAt, problems, `post ${postId} publish_at`),
      telegram_message_id: toNumberOrNull(item.telegramMessageId),
      telegram_message_link: stringOrNull(item.telegramMessageLink),
      error_message: stringOrNull(item.errorMessage) ?? stringOrNull(item.publishError),
      created_at: dateOrNow(item.createdAt, problems, `post ${postId} created_at`),
      updated_at: dateOrNow(item.updatedAt, problems, `post ${postId} updated_at`),
    }];
  });

  const publicationLogs = (Array.isArray(logs) ? logs : []).map((log, index) => ({
    id: String(log.id ?? `json-log-${index}-${log.createdAt ?? Date.now()}`),
    run_id: stringOrNull(log.runId),
    source: stringOrNull(log.source) ?? "local",
    channel_id: stringOrNull(log.channelId),
    post_id: stringOrNull(log.postId),
    status: normalizeLogStatus(log.status, problems, `publication log ${index}`),
    message: stringOrNull(log.message),
    telegram_message_id: toNumberOrNull(log.telegramMessageId),
    telegram_message_link: stringOrNull(log.telegramMessageLink),
    dry_run: typeof log.dryRun === "boolean" ? log.dryRun : null,
    created_at: dateOrNow(log.createdAt, problems, `publication log ${index} created_at`),
  }));

  if (!Array.isArray(logs)) {
    problems.push("publication_logs.json is not an array.");
  }

  const schedulerRuns = scheduler
    ? [{
        id: String(scheduler.runId ?? "latest-json-scheduler-run"),
        source: stringOrNull(scheduler.source) ?? "local",
        store_mode: stringOrNull(scheduler.storeMode) ?? "json",
        dry_run: Boolean(scheduler.dryRun),
        real_publish_enabled: Boolean(scheduler.realPublishEnabled),
        checked: Number(scheduler.checked ?? 0),
        published: Number(scheduler.published ?? 0),
        skipped: Number(scheduler.skipped ?? 0),
        errors: Number(scheduler.errors ?? 0),
        message: stringOrNull(scheduler.message),
        started_at: dateOrNow(scheduler.startedAt ?? scheduler.updatedAt, problems, "scheduler run started_at"),
        finished_at: dateOrNull(scheduler.finishedAt, problems, "scheduler run finished_at"),
      }]
    : [];

  return {
    channels: Array.from(channelsById.values()),
    posts,
    publicationLogs,
    schedulerRuns,
    problems,
  };
}

async function readExistingIds(client, source) {
  const [channels, posts, publicationLogs, schedulerRuns] = await Promise.all([
    countExisting(client, "channels", source.channels.map((item) => item.id)),
    countExisting(client, "posts", source.posts.map((item) => item.id)),
    countExisting(client, "publication_logs", source.publicationLogs.map((item) => item.id)),
    countExisting(client, "scheduler_runs", source.schedulerRuns.map((item) => item.id)),
  ]);
  return { channels, posts, publicationLogs, schedulerRuns };
}

async function countExisting(client, table, ids) {
  if (!ids.length) return 0;
  const result = await client.query(`select count(*)::int as count from ${table} where id = any($1::text[])`, [ids]);
  return Number(result.rows[0]?.count ?? 0);
}

async function insertChannels(client, rows) {
  for (const row of rows) {
    await client.query(
      `insert into channels(id, title, slug, telegram_chat_id, language, category, is_active, created_at, updated_at)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do nothing`,
      [row.id, row.title, row.slug, row.telegram_chat_id, row.language, row.category, row.is_active, row.created_at, row.updated_at],
    );
  }
}

async function insertPosts(client, rows) {
  for (const row of rows) {
    await client.query(
      `insert into posts(id, channel_id, title, text, image_url, image_path, status, publish_at,
                         telegram_message_id, telegram_message_link, error_message, created_at, updated_at)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       on conflict (id) do nothing`,
      [
        row.id,
        row.channel_id,
        row.title,
        row.text,
        row.image_url,
        row.image_path,
        row.status,
        row.publish_at,
        row.telegram_message_id,
        row.telegram_message_link,
        row.error_message,
        row.created_at,
        row.updated_at,
      ],
    );
  }
}

async function insertPublicationLogs(client, rows) {
  for (const row of rows) {
    await client.query(
      `insert into publication_logs(id, run_id, source, channel_id, post_id, status, message,
                                    telegram_message_id, telegram_message_link, dry_run, created_at)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       on conflict (id) do nothing`,
      [row.id, row.run_id, row.source, row.channel_id, row.post_id, row.status, row.message, row.telegram_message_id, row.telegram_message_link, row.dry_run, row.created_at],
    );
  }
}

async function insertSchedulerRuns(client, rows) {
  for (const row of rows) {
    await client.query(
      `insert into scheduler_runs(id, source, store_mode, dry_run, real_publish_enabled, checked,
                                  published, skipped, errors, message, started_at, finished_at)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       on conflict (id) do nothing`,
      [row.id, row.source, row.store_mode, row.dry_run, row.real_publish_enabled, row.checked, row.published, row.skipped, row.errors, row.message, row.started_at, row.finished_at],
    );
  }
}

function readJson(filePath, fallback, problems) {
  if (!existsSync(filePath)) {
    problems.push(`${path.relative(root, filePath)} is missing. Using an empty fallback.`);
    return fallback;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    problems.push(`${path.relative(root, filePath)} could not be parsed: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

function dedupeById(rows) {
  const byId = new Map();
  for (const row of rows) {
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
  return Array.from(byId.values());
}

function duplicateProblems(sourceDuplicates) {
  return Object.entries(sourceDuplicates)
    .filter(([, count]) => count > 0)
    .map(([table, count]) => `${count} duplicate ${table} id(s) were found in local JSON and will be skipped.`);
}

function findRelationProblems(source) {
  const problems = [];
  const channelIds = new Set(source.channels.map((channel) => channel.id));
  const postIds = new Set(source.posts.map((post) => post.id));

  for (const post of source.posts) {
    if (!channelIds.has(post.channel_id)) {
      problems.push(`Post ${post.id} references missing channel ${post.channel_id}.`);
    }
  }

  for (const log of source.publicationLogs) {
    if (log.channel_id && !channelIds.has(log.channel_id)) {
      problems.push(`Publication log ${log.id} references channel ${log.channel_id}, which is not present in local channels and will be imported with channel_id=null.`);
    }
    if (log.post_id && !postIds.has(log.post_id)) {
      problems.push(`Publication log ${log.id} references post ${log.post_id}, which is not present in local posts and will be imported with post_id=null.`);
    }
  }

  return problems;
}

function clearMissingPublicationLogRelations(source) {
  const channelIds = new Set(source.channels.map((channel) => channel.id));
  const postIds = new Set(source.posts.map((post) => post.id));
  return {
    ...source,
    publicationLogs: source.publicationLogs.map((log) => ({
      ...log,
      channel_id: log.channel_id && channelIds.has(log.channel_id) ? log.channel_id : null,
      post_id: log.post_id && postIds.has(log.post_id) ? log.post_id : null,
    })),
  };
}

function normalizePostStatus(status, problems, postId) {
  const value = String(status ?? "draft");
  if (["draft", "scheduled", "approved", "ready_to_publish", "published", "failed", "skipped", "blocked"].includes(value)) return value;
  if (value === "ready") return "ready_to_publish";
  problems.push(`Post ${postId} has unsupported status "${value}" and will be imported as skipped.`);
  return "skipped";
}

function normalizeLogStatus(status, problems, label) {
  const value = String(status ?? "failed");
  if (value === "error") return "failed";
  if (["success", "skipped", "failed"].includes(value)) return value;
  problems.push(`${label} has unsupported status "${value}" and will be imported as failed.`);
  return "failed";
}

function dateOrNow(value, problems, label) {
  return dateOrNull(value, problems, label) ?? new Date().toISOString();
}

function dateOrNull(value, problems, label) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    problems.push(`${label} has an invalid date value "${String(value)}".`);
    return null;
  }
  return parsed.toISOString();
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function toNumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function buildPgConfig(databaseUrl) {
  const sslMode = process.env.PGSSLMODE;
  const likelySupabase = /supabase\.(co|com)|pooler\.supabase/i.test(databaseUrl);
  if (sslMode === "disable") return { connectionString: databaseUrl };
  if (sslMode === "require" || likelySupabase) {
    return { connectionString: databaseUrl, ssl: { rejectUnauthorized: false } };
  }
  return { connectionString: databaseUrl };
}

await main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
});
