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
  const source = readSourceData();
  const report = {
    ok: true,
    mode: dryRun ? "dry-run" : "apply",
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    found: {
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
    skippedDuplicates: {
      channels: 0,
      posts: 0,
      publicationLogs: 0,
      schedulerRuns: 0,
    },
    problems: [],
  };

  if (!process.env.DATABASE_URL) {
    report.problems.push("DATABASE_URL is not configured. JSON was read successfully, but database duplicate checks/apply were skipped.");
    report.inserts.channels = source.channels.length;
    report.inserts.posts = source.posts.length;
    report.inserts.publicationLogs = source.publicationLogs.length;
    report.inserts.schedulerRuns = source.schedulerRuns.length;
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const existing = await readExistingIds(client, source);
    report.skippedDuplicates = existing;
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
    await upsertChannels(client, source.channels);
    await upsertPosts(client, source.posts);
    await upsertPublicationLogs(client, source.publicationLogs);
    await upsertSchedulerRuns(client, source.schedulerRuns);
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
  const plan = readJson(planPath, { items: [] });
  const targets = readJson(targetsPath, {});
  const logs = readJson(logsPath, []);
  const scheduler = readJson(schedulerPath, null);
  const items = Array.isArray(plan.items) ? plan.items : [];
  const channelsById = new Map();

  for (const item of items) {
    if (!item.channelId) continue;
    const target = targets[item.channelId] ?? {};
    channelsById.set(item.channelId, {
      id: item.channelId,
      title: target.channelTitle ?? item.channelName ?? item.channelId,
      slug: item.channelId,
      telegram_chat_id: target.telegramTarget ?? null,
      language: item.language ?? null,
      category: item.contentTopic ?? null,
      is_active: true,
      created_at: item.createdAt ?? new Date().toISOString(),
      updated_at: item.updatedAt ?? new Date().toISOString(),
    });
  }

  for (const [channelId, target] of Object.entries(targets)) {
    if (channelsById.has(channelId)) continue;
    channelsById.set(channelId, {
      id: channelId,
      title: target.channelTitle ?? channelId,
      slug: channelId,
      telegram_chat_id: target.telegramTarget ?? null,
      language: null,
      category: null,
      is_active: true,
      created_at: target.telegramLinkedAt ?? new Date().toISOString(),
      updated_at: target.telegramLinkedAt ?? new Date().toISOString(),
    });
  }

  const posts = items
    .filter((item) => item.channelId)
    .map((item) => ({
      id: String(item.postId ?? item.id),
      channel_id: String(item.channelId),
      title: item.title ?? null,
      text: item.body ?? item.text ?? null,
      image_url: item.imageUrl ?? null,
      image_path: item.telegramImagePath ?? item.imagePath ?? null,
      status: normalizePostStatus(item.status),
      publish_at: item.publishAt ?? item.scheduledAt ?? null,
      telegram_message_id: toNumberOrNull(item.telegramMessageId),
      telegram_message_link: item.telegramMessageLink ?? null,
      error_message: item.errorMessage ?? item.publishError ?? null,
      created_at: item.createdAt ?? new Date().toISOString(),
      updated_at: item.updatedAt ?? new Date().toISOString(),
    }));

  const publicationLogs = logs.map((log, index) => ({
    id: String(log.id ?? `json-log-${index}-${log.createdAt ?? Date.now()}`),
    run_id: log.runId ?? null,
    source: log.source ?? "local",
    channel_id: log.channelId ?? null,
    post_id: log.postId ?? null,
    status: normalizeLogStatus(log.status),
    message: log.message ?? null,
    telegram_message_id: toNumberOrNull(log.telegramMessageId),
    telegram_message_link: log.telegramMessageLink ?? null,
    dry_run: typeof log.dryRun === "boolean" ? log.dryRun : null,
    created_at: log.createdAt ?? new Date().toISOString(),
  }));

  const schedulerRuns = scheduler
    ? [{
        id: String(scheduler.runId ?? "latest-json-scheduler-run"),
        source: scheduler.source ?? "local",
        store_mode: scheduler.storeMode ?? "json",
        dry_run: Boolean(scheduler.dryRun),
        real_publish_enabled: Boolean(scheduler.realPublishEnabled),
        checked: Number(scheduler.checked ?? 0),
        published: Number(scheduler.published ?? 0),
        skipped: Number(scheduler.skipped ?? 0),
        errors: Number(scheduler.errors ?? 0),
        message: scheduler.message ?? null,
        started_at: scheduler.startedAt ?? scheduler.updatedAt ?? new Date().toISOString(),
        finished_at: scheduler.finishedAt ?? null,
      }]
    : [];

  return {
    channels: Array.from(channelsById.values()),
    posts,
    publicationLogs,
    schedulerRuns,
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

async function upsertChannels(client, rows) {
  for (const row of rows) {
    await client.query(
      `insert into channels(id, title, slug, telegram_chat_id, language, category, is_active, created_at, updated_at)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do update set
         title = excluded.title,
         slug = excluded.slug,
         telegram_chat_id = excluded.telegram_chat_id,
         language = excluded.language,
         category = excluded.category,
         is_active = excluded.is_active,
         updated_at = excluded.updated_at`,
      [row.id, row.title, row.slug, row.telegram_chat_id, row.language, row.category, row.is_active, row.created_at, row.updated_at],
    );
  }
}

async function upsertPosts(client, rows) {
  for (const row of rows) {
    await client.query(
      `insert into posts(id, channel_id, title, text, image_url, image_path, status, publish_at,
                         telegram_message_id, telegram_message_link, error_message, created_at, updated_at)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       on conflict (id) do update set
         channel_id = excluded.channel_id,
         title = excluded.title,
         text = excluded.text,
         image_url = excluded.image_url,
         image_path = excluded.image_path,
         status = excluded.status,
         publish_at = excluded.publish_at,
         telegram_message_id = excluded.telegram_message_id,
         telegram_message_link = excluded.telegram_message_link,
         error_message = excluded.error_message,
         updated_at = excluded.updated_at`,
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

async function upsertPublicationLogs(client, rows) {
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

async function upsertSchedulerRuns(client, rows) {
  for (const row of rows) {
    await client.query(
      `insert into scheduler_runs(id, source, store_mode, dry_run, real_publish_enabled, checked,
                                  published, skipped, errors, message, started_at, finished_at)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       on conflict (id) do update set
         source = excluded.source,
         store_mode = excluded.store_mode,
         dry_run = excluded.dry_run,
         real_publish_enabled = excluded.real_publish_enabled,
         checked = excluded.checked,
         published = excluded.published,
         skipped = excluded.skipped,
         errors = excluded.errors,
         message = excluded.message,
         finished_at = excluded.finished_at`,
      [row.id, row.source, row.store_mode, row.dry_run, row.real_publish_enabled, row.checked, row.published, row.skipped, row.errors, row.message, row.started_at, row.finished_at],
    );
  }
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function normalizePostStatus(status) {
  const value = String(status ?? "draft");
  if (["draft", "scheduled", "approved", "ready_to_publish", "published", "failed", "skipped"].includes(value)) return value;
  if (value === "ready") return "ready_to_publish";
  return "draft";
}

function normalizeLogStatus(status) {
  const value = String(status ?? "failed");
  if (value === "error") return "failed";
  return ["success", "skipped", "failed"].includes(value) ? value : "failed";
}

function toNumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

await main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
});
