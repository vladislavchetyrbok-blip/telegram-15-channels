import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const planPath = path.join(runtimeDir, "weekly-content-plan.json");
const targetsPath = path.join(runtimeDir, "telegram-targets.json");
const logsPath = path.join(runtimeDir, "publication_logs.json");
const statusPath = path.join(runtimeDir, "publish-scheduler.json");
const lockPath = path.join(runtimeDir, "publish-due.lock");

const dueStatuses = (process.env.PUBLISH_DUE_STATUSES || "scheduled,draft,approved,ready_to_publish")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const dryRun = process.env.PUBLISH_DUE_DRY_RUN !== "false";
const maxPerRun = Math.max(1, Number(process.env.PUBLISH_DUE_MAX_PER_RUN || "1"));
const storeMode = process.env.PUBLISH_DUE_STORE || (process.env.DATABASE_URL ? "postgres" : "json");
const lockMaxAgeMs = 30 * 60_000;

async function main() {
  mkdirSync(runtimeDir, { recursive: true });
  acquireLock();
  const startedAt = new Date().toISOString();

  try {
    const result = storeMode === "postgres" ? await publishDueFromPostgres(startedAt) : await publishDueFromJson(startedAt);
    writeSchedulerStatus({ ...result, startedAt, finishedAt: new Date().toISOString(), storeMode, dryRun });
    console.log(JSON.stringify({ ok: true, ...result, storeMode, dryRun }, null, 2));
    if (result.errors > 0) process.exitCode = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const result = { checked: 0, published: 0, skipped: 0, errors: 1, error: message, details: [] };
    appendLocalPublicationLog({ channelId: null, postId: null, status: "error", message });
    writeSchedulerStatus({ ...result, startedAt, finishedAt: new Date().toISOString(), storeMode, dryRun });
    console.error(JSON.stringify({ ok: false, ...result, storeMode, dryRun }, null, 2));
    process.exitCode = 1;
  } finally {
    releaseLock();
  }
}

async function publishDueFromJson(startedAt) {
  const state = readJson(planPath, { version: 1, items: [] });
  const targets = readJson(targetsPath, {});
  const logs = readPublicationLogs();
  const successPostIds = new Set(logs.filter((entry) => entry.status === "success").map((entry) => entry.postId).filter(Boolean));
  const now = Date.now();
  const candidates = state.items
    .filter((item) => dueStatuses.includes(item.status))
    .filter((item) => new Date(item.publishAt || item.scheduledAt || 0).getTime() <= now)
    .filter((item) => !item.telegramMessageId && item.publishResult !== "success" && !successPostIds.has(item.postId))
    .sort((a, b) => new Date(a.publishAt || a.scheduledAt).getTime() - new Date(b.publishAt || b.scheduledAt).getTime())
    .slice(0, maxPerRun);

  const details = [];
  let published = 0;
  let skipped = 0;
  let errors = 0;
  let planChanged = false;

  for (const item of candidates) {
    const target = targets[item.channelId]?.telegramTarget || item.telegramTarget || "";
    const quality = checkQualityGate(item);

    if (!quality.ok) {
      skipped += 1;
      const message = `quality_gate_failed: ${quality.issues.join("; ")}`;
      details.push({ channelId: item.channelId, postId: item.postId, status: "skipped", message });
      appendLocalPublicationLog({ channelId: item.channelId, postId: item.postId, status: "skipped", message });
      if (!dryRun) {
        markJsonItemFailed(state, item.id, message);
        planChanged = true;
      }
      continue;
    }

    if (!target) {
      errors += 1;
      const message = "telegram target missing";
      details.push({ channelId: item.channelId, postId: item.postId, status: "error", message });
      appendLocalPublicationLog({ channelId: item.channelId, postId: item.postId, status: "error", message });
      if (!dryRun) {
        markJsonItemFailed(state, item.id, message);
        planChanged = true;
      }
      continue;
    }

    if (dryRun) {
      skipped += 1;
      const message = "dry_run: due post was not sent";
      details.push({ channelId: item.channelId, postId: item.postId, status: "skipped", message });
      appendLocalPublicationLog({ channelId: item.channelId, postId: item.postId, status: "skipped", message });
      continue;
    }

    const send = await sendPhoto({
      token: process.env.TELEGRAM_BOT_TOKEN || "",
      telegramTarget: target,
      caption: item.telegramCaption,
      imageFilePath: resolveAssetPath(item.telegramImagePath || item.imagePath || item.imageUrl),
    });

    if (send.ok) {
      published += 1;
      const message = `published message_id=${send.messageId}`;
      markJsonItemPublished(state, item.id, send.messageId);
      planChanged = true;
      details.push({ channelId: item.channelId, postId: item.postId, status: "success", message, messageId: send.messageId });
      appendLocalPublicationLog({ channelId: item.channelId, postId: item.postId, status: "success", message, telegramMessageId: send.messageId, telegramMessageLink: buildTelegramMessageLink(target, send.messageId) });
    } else {
      errors += 1;
      const message = send.error || "telegram send failed";
      markJsonItemFailed(state, item.id, message);
      planChanged = true;
      details.push({ channelId: item.channelId, postId: item.postId, status: "error", message });
      appendLocalPublicationLog({ channelId: item.channelId, postId: item.postId, status: "error", message });
    }
  }

  if (planChanged) {
    state.updatedAt = new Date().toISOString();
    writeJson(planPath, state);
  }

  return {
    checked: candidates.length,
    published,
    skipped,
    errors,
    details,
    message: candidates.length ? `Processed ${candidates.length} due post(s).` : "No due posts found.",
  };
}

async function publishDueFromPostgres(startedAt) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required when PUBLISH_DUE_STORE=postgres.");
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await ensurePostgresTables(client);
    const table = safeIdentifier(process.env.PUBLISH_POSTS_TABLE || "posts");
    const rows = await client.query(
      `
        select
          id::text as "id",
          coalesce(post_id::text, id::text) as "postId",
          channel_id as "channelId",
          channel_name as "channelName",
          telegram_target as "telegramTarget",
          title,
          body,
          telegram_caption as "telegramCaption",
          image_path as "imagePath",
          telegram_image_path as "telegramImagePath",
          image_url as "imageUrl",
          status,
          publish_at as "publishAt",
          text_quality as "textQuality",
          image_quality as "imageQuality",
          telegram_caption_status as "telegramCaptionStatus",
          telegram_image_status as "telegramImageStatus",
          quality_issues as "qualityIssues",
          telegram_message_id as "telegramMessageId",
          publish_result as "publishResult"
        from ${table}
        where status = any($1::text[])
          and publish_at <= now()
          and coalesce(publish_result, '') <> 'success'
          and telegram_message_id is null
          and not exists (
            select 1 from publication_logs logs
            where logs.post_id = coalesce(${table}.post_id::text, ${table}.id::text)
              and logs.status = 'success'
          )
        order by publish_at asc
        limit $2
      `,
      [dueStatuses.filter((status) => status !== "ready_to_publish"), maxPerRun],
    );

    const details = [];
    let published = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of rows.rows) {
      const quality = checkQualityGate(item);
      if (!quality.ok) {
        skipped += 1;
        const message = `quality_gate_failed: ${quality.issues.join("; ")}`;
        await insertPostgresPublicationLog(client, item, "skipped", message);
        if (!dryRun) await markPostgresFailed(client, table, item.id, message);
        details.push({ channelId: item.channelId, postId: item.postId, status: "skipped", message });
        continue;
      }

      if (dryRun) {
        skipped += 1;
        const message = "dry_run: due post was not sent";
        await insertPostgresPublicationLog(client, item, "skipped", message);
        details.push({ channelId: item.channelId, postId: item.postId, status: "skipped", message });
        continue;
      }

      const send = await sendPhoto({
        token: process.env.TELEGRAM_BOT_TOKEN || "",
        telegramTarget: item.telegramTarget,
        caption: item.telegramCaption,
        imageFilePath: resolveAssetPath(item.telegramImagePath || item.imagePath || item.imageUrl),
      });

      if (send.ok) {
        published += 1;
        const link = buildTelegramMessageLink(item.telegramTarget, send.messageId);
        await client.query(
          `update ${table}
           set status = 'published', publish_result = 'success', telegram_message_id = $1, telegram_published_at = now(), updated_at = now()
           where id = $2 and coalesce(publish_result, '') <> 'success'`,
          [send.messageId, item.id],
        );
        await insertPostgresPublicationLog(client, item, "success", `published message_id=${send.messageId}`, send.messageId, link);
        details.push({ channelId: item.channelId, postId: item.postId, status: "success", message: `published message_id=${send.messageId}`, messageId: send.messageId });
      } else {
        errors += 1;
        const message = send.error || "telegram send failed";
        await insertPostgresPublicationLog(client, item, "error", message);
        await markPostgresFailed(client, table, item.id, message);
        details.push({ channelId: item.channelId, postId: item.postId, status: "error", message });
      }
    }

    await client.query(
      `insert into scheduler_runs(id, started_at, finished_at, checked, published, skipped, errors, message)
       values($1, $2, now(), $3, $4, $5, $6, $7)`,
      [randomUUID(), startedAt, rows.rows.length, published, skipped, errors, rows.rows.length ? `Processed ${rows.rows.length} due post(s).` : "No due posts found."],
    );

    return {
      checked: rows.rows.length,
      published,
      skipped,
      errors,
      details,
      message: rows.rows.length ? `Processed ${rows.rows.length} due post(s).` : "No due posts found.",
    };
  } finally {
    await client.end();
  }
}

function checkQualityGate(item) {
  const issues = [];
  const text = `${item.title || ""}\n${item.body || ""}\n${item.telegramCaption || ""}`;
  const qualityIssues = normalizeQualityIssues(item.qualityIssues);

  if (!item.title || !String(item.title).trim()) issues.push("missing_title");
  if (!item.body || !String(item.body).trim()) issues.push("missing_body");
  if (!item.telegramCaption || item.telegramCaptionStatus !== "OK") issues.push("caption_not_ready");
  if (item.telegramCaption && String(item.telegramCaption).length > 1024) issues.push("caption_too_long");
  if (item.textQuality === "weak" || item.imageQuality === "weak") issues.push("weak_quality");
  if (item.telegramImageStatus !== "OK") issues.push("image_not_ready");
  if (!resolveAssetPath(item.telegramImagePath || item.imagePath || item.imageUrl)) issues.push("image_missing");
  if (qualityIssues.length) issues.push(...qualityIssues);
  if (/PREMIUM_V2|TELEGRAM READY|debug label|service label|version label/i.test(text)) issues.push("service_label_detected");

  return { ok: issues.length === 0, issues };
}

function normalizeQualityIssues(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value].filter(Boolean);
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

async function sendPhoto({ token, telegramTarget, caption, imageFilePath }) {
  if (!token) return { ok: false, messageId: null, error: "TELEGRAM_BOT_TOKEN missing" };
  if (!telegramTarget) return { ok: false, messageId: null, error: "telegram target missing" };
  if (!imageFilePath || !existsSync(imageFilePath)) return { ok: false, messageId: null, error: "image file missing" };

  const imageBuffer = readFileSync(imageFilePath);
  const form = new FormData();
  form.set("chat_id", telegramTarget);
  form.set("photo", new Blob([new Uint8Array(imageBuffer)], { type: getImageMime(imageFilePath) }), path.basename(imageFilePath));
  form.set("caption", caption);
  form.set("parse_mode", "HTML");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: "POST", body: form });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    return { ok: false, messageId: null, error: body?.description || `Telegram API returned ${response.status}` };
  }
  return { ok: true, messageId: body.result?.message_id ?? null, error: null };
}

function resolveAssetPath(value) {
  if (!value) return "";
  const normalized = String(value).replaceAll("\\", "/");
  const candidates = [];
  if (path.isAbsolute(value)) candidates.push(value);
  if (normalized.startsWith("/assets/")) candidates.push(path.join(root, "public", normalized));
  const publicIndex = normalized.lastIndexOf("/public/");
  if (publicIndex >= 0) candidates.push(path.join(root, normalized.slice(publicIndex + 1)));
  candidates.push(path.join(root, normalized));
  return candidates.find((candidate) => candidate && existsSync(candidate)) || "";
}

function markJsonItemPublished(state, itemId, messageId) {
  const now = new Date().toISOString();
  state.items = state.items.map((item) =>
    item.id === itemId
      ? { ...item, status: "published", publishResult: "success", telegramMessageId: messageId, telegramPublishedAt: now, updatedAt: now }
      : item,
  );
}

function markJsonItemFailed(state, itemId, message) {
  const now = new Date().toISOString();
  state.items = state.items.map((item) =>
    item.id === itemId
      ? { ...item, status: "failed", publishResult: "failed", publishError: message, qualityIssues: Array.from(new Set([...(item.qualityIssues || []), message])), updatedAt: now }
      : item,
  );
}

async function ensurePostgresTables(client) {
  await client.query(`
    create table if not exists publication_logs (
      id text primary key,
      channel_id text,
      post_id text,
      status text not null,
      message text,
      telegram_message_id integer,
      telegram_message_link text,
      created_at timestamptz not null default now()
    )
  `);
  await client.query(`
    create table if not exists scheduler_runs (
      id text primary key,
      started_at timestamptz not null,
      finished_at timestamptz,
      checked integer not null default 0,
      published integer not null default 0,
      skipped integer not null default 0,
      errors integer not null default 0,
      message text
    )
  `);
}

async function insertPostgresPublicationLog(client, item, status, message, telegramMessageId = null, telegramMessageLink = null) {
  await client.query(
    `insert into publication_logs(id, channel_id, post_id, status, message, telegram_message_id, telegram_message_link, created_at)
     values($1, $2, $3, $4, $5, $6, $7, now())`,
    [randomUUID(), item.channelId ?? null, item.postId ?? item.id ?? null, status, message, telegramMessageId, telegramMessageLink],
  );
}

async function markPostgresFailed(client, table, id, message) {
  await client.query(
    `update ${table}
     set status = 'failed', publish_result = 'failed', publish_error = $1, updated_at = now()
     where id = $2 and coalesce(publish_result, '') <> 'success'`,
    [message, id],
  );
}

function appendLocalPublicationLog(entry) {
  const logs = readPublicationLogs();
  logs.push({
    id: randomUUID(),
    channelId: entry.channelId ?? null,
    postId: entry.postId ?? null,
    status: entry.status,
    message: entry.message ?? null,
    telegramMessageId: entry.telegramMessageId ?? null,
    telegramMessageLink: entry.telegramMessageLink ?? null,
    createdAt: new Date().toISOString(),
  });
  writeJson(logsPath, logs.slice(-1000));
}

function readPublicationLogs() {
  return readJson(logsPath, []);
}

function writeSchedulerStatus(status) {
  const logs = readPublicationLogs();
  const errors = [...logs].reverse().filter((entry) => entry.status === "error").slice(0, 10);
  writeJson(statusPath, {
    ...status,
    lastErrors: errors,
    updatedAt: new Date().toISOString(),
  });
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function acquireLock() {
  if (existsSync(lockPath)) {
    const locked = readJson(lockPath, {});
    const age = Date.now() - new Date(locked.createdAt || 0).getTime();
    if (Number.isFinite(age) && age < lockMaxAgeMs) {
      throw new Error(`publish:due is already running; lock=${lockPath}`);
    }
  }
  writeJson(lockPath, { pid: process.pid, createdAt: new Date().toISOString() });
}

function releaseLock() {
  if (existsSync(lockPath)) rmSync(lockPath, { force: true });
}

function buildTelegramMessageLink(telegramTarget, messageId) {
  if (!telegramTarget || !messageId) return null;
  return telegramTarget.startsWith("-100") ? `https://t.me/c/${telegramTarget.slice(4)}/${messageId}` : null;
}

function getImageMime(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
}

function safeIdentifier(value) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) throw new Error(`Unsafe SQL identifier: ${value}`);
  return value;
}

await main();
