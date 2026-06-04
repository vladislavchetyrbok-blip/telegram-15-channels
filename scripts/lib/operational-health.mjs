import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadLocalEnv } from "./load-local-env.mjs";
import { compareJsonSupabaseStore } from "./store-compare.mjs";
import { runMirrorSync } from "./mirror-sync.mjs";
import { getBackupCenterStatus } from "./backup-center.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const workflowPath = path.join(root, ".github", "workflows", "publish-scheduler.yml");
const countKeys = ["channels", "posts", "publication_logs", "scheduler_runs"];

export async function getOperationalHealthReport(options = {}) {
  if (options.loadEnv) {
    loadLocalEnv({ cwd: root });
  }

  const lastCheckedAt = new Date().toISOString();
  const runtime = readRuntime(lastCheckedAt);
  const queue = buildQueueHealth(runtime, lastCheckedAt);
  const logs = buildLogsHealth(runtime.logs, lastCheckedAt);
  const scheduler = buildSchedulerHealth(runtime.scheduler, lastCheckedAt);
  const contentQuality = buildContentQuality(runtime.items);
  const telegram = buildTelegramHealth();
  const store = await buildStoreHealth();
  const backups = await buildBackupHealth(lastCheckedAt);
  const whyNotPublishing = buildWhyNotPublishing({ queue, scheduler, telegram, store });
  const warnings = [
    ...runtime.warnings,
    ...queue.warnings,
    ...logs.warnings,
    ...scheduler.warnings,
    ...contentQuality.warnings,
    ...telegram.warnings,
    ...store.warnings,
    ...backups.warnings,
  ];
  const errors = [
    ...runtime.errors,
    ...queue.errors,
    ...logs.errors,
    ...scheduler.errors,
    ...contentQuality.errors,
    ...telegram.errors,
    ...store.errors,
    ...backups.errors,
  ];

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    whyNotPublishing,
    runtime: runtime.summary,
    queue,
    logs,
    scheduler,
    contentQuality,
    telegram,
    store,
    backups,
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt,
  };
}

function readRuntime(nowIso) {
  const warnings = [];
  const errors = [];
  const plan = readJson(path.join(runtimeDir, "weekly-content-plan.json"), { items: [] }, errors);
  const scheduledPosts = readJson(path.join(runtimeDir, "scheduled-posts.json"), [], errors);
  const logs = readJson(path.join(runtimeDir, "publication_logs.json"), [], errors);
  const scheduler = readJson(path.join(runtimeDir, "publish-scheduler.json"), null, errors);
  const targets = readJson(path.join(runtimeDir, "telegram-targets.json"), {}, errors);
  const items = Array.isArray(plan.items) ? plan.items : [];
  const publicationLogs = Array.isArray(logs) ? logs : [];
  const queue = Array.isArray(scheduledPosts) ? scheduledPosts : [];
  const channelIds = new Set([
    ...items.map((item) => stringOrNull(item.channelId)).filter(Boolean),
    ...Object.keys(isPlainObject(targets) ? targets : {}),
  ]);

  if (!Array.isArray(plan.items)) errors.push("weekly-content-plan.json does not contain an items array.");
  if (!Array.isArray(logs)) errors.push("publication_logs.json is not an array.");
  if (!Array.isArray(scheduledPosts)) warnings.push("scheduled-posts.json is not an array.");

  return {
    items,
    scheduledPosts: queue,
    logs: publicationLogs,
    scheduler,
    targets,
    summary: {
      channelsCount: channelIds.size,
      postsCount: items.length,
      publicationLogsCount: publicationLogs.length,
      schedulerRunsCount: scheduler ? 1 : 0,
      checkedAt: nowIso,
    },
    warnings,
    errors,
  };
}

function buildQueueHealth(runtime, nowIso) {
  const warnings = [];
  const errors = [];
  const posts = runtime.items;
  const queue = runtime.scheduledPosts;
  const candidates = [...posts, ...queue]
    .map((post) => normalizePost(post))
    .filter((post) => post.scheduledAt && !["published", "cancelled", "canceled"].includes(post.status))
    .sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime());
  const now = new Date(nowIso);
  const nextDue = candidates.find((post) => new Date(post.scheduledAt).getTime() >= now.getTime()) ?? candidates[0] ?? null;
  const statusCounts = countBy(posts.map((post) => String(post.status ?? "unknown").toLowerCase()));
  const postsWithoutImages = posts.filter((post) => !hasImage(post)).length;
  const weakTextCount = posts.filter((post) => isWeak(post.textQuality)).length;
  const weakImageCount = posts.filter((post) => isWeak(post.imageQuality) || isWeak(post.telegramImageStatus)).length;

  if (postsWithoutImages > 0) warnings.push(`${postsWithoutImages} posts have no image path.`);

  return {
    channelsCount: runtime.summary.channelsCount,
    postsCount: posts.length,
    publicationLogsCount: runtime.logs.length,
    schedulerRunsCount: runtime.scheduler ? 1 : 0,
    readyPosts: posts.filter((post) => ["ready", "approved"].includes(String(post.status ?? "").toLowerCase())).length,
    scheduledPosts: posts.filter((post) => String(post.status ?? "").toLowerCase() === "scheduled").length + queue.length,
    publishedPosts: Number(statusCounts.published ?? 0),
    failedPosts: Number(statusCounts.failed ?? 0) + Number(statusCounts.error ?? 0),
    skippedPosts: Number(statusCounts.skipped ?? 0),
    blockedPosts: Number(statusCounts.blocked ?? 0),
    postsWithoutImages,
    weakTextCount,
    weakImageCount,
    nextDuePost: nextDue?.postId ?? null,
    nextDueChannel: nextDue?.channelId ?? null,
    nextDueChannelName: nextDue?.channelName ?? null,
    nextDueTime: nextDue?.scheduledAt ?? null,
    warnings,
    errors,
  };
}

function buildLogsHealth(logs, nowIso) {
  const today = nowIso.slice(0, 10);
  const sorted = sortByCreatedAtDesc(logs).map(normalizeLog);
  const failedLogs = sorted.filter((log) => ["failed", "error"].includes(log.status));
  const skippedLogs = sorted.filter((log) => log.status === "skipped");
  const successfulLogs = sorted.filter((log) => ["success", "published"].includes(log.status));
  const warnings = [];
  const errors = [];

  if (failedLogs.length > 0) warnings.push(`${failedLogs.length} failed publication log(s) found.`);

  return {
    recentLogs: sorted.slice(0, 20),
    failedLogs: failedLogs.slice(0, 20),
    skippedLogs: skippedLogs.slice(0, 20),
    lastSuccessfulPublication: successfulLogs[0] ?? null,
    lastFailedPublication: failedLogs[0] ?? null,
    failedToday: countLogsToday(sorted, today, ["failed", "error"]),
    publishedToday: countLogsToday(sorted, today, ["success", "published"]),
    skippedToday: countLogsToday(sorted, today, ["skipped"]),
    groupedErrorReasons: groupReasons([...failedLogs, ...skippedLogs]),
    warnings,
    errors,
  };
}

function buildSchedulerHealth(scheduler, nowIso) {
  const warnings = [];
  const errors = [];
  const run = scheduler ? normalizeSchedulerRun(scheduler) : null;
  const lastSchedulerStatus = run ? (run.errors > 0 ? "error" : "ok") : "warning";
  const nextExpectedRun = getNextExpectedWorkflowRun(nowIso);

  if (!run) warnings.push("No scheduler run state was found.");
  if (run?.errors > 0) errors.push("Last scheduler run contains errors.");

  return {
    recentRuns: run ? [run] : [],
    lastSchedulerRunTime: run?.finishedAt ?? run?.startedAt ?? null,
    lastSchedulerStatus,
    lastSchedulerError: run?.lastError ?? null,
    nextExpectedRun,
    schedulerHealth: errors.length ? "error" : warnings.length ? "warning" : "ok",
    warnings,
    errors,
  };
}

function buildContentQuality(posts) {
  const warnings = [];
  const errors = [];
  const weakTextCount = posts.filter((post) => isWeak(post.textQuality)).length;
  const weakImageCount = posts.filter((post) => isWeak(post.imageQuality) || isWeak(post.telegramImageStatus)).length;
  const postsWithoutImages = posts.filter((post) => !hasImage(post)).length;
  const reasonPosts = posts.filter((post) => getQualityReasons(post).length > 0);
  const genericPhraseCount = reasonPosts.filter((post) => getQualityReasons(post).some((reason) => reason.includes("generic_phrase"))).length;
  const serviceLabelCount = reasonPosts.filter((post) => getQualityReasons(post).some((reason) => reason.includes("service") || reason.includes("label"))).length;
  const blockReasonCount = reasonPosts.filter((post) => String(post.status ?? "").toLowerCase() === "blocked" || getQualityReasons(post).some((reason) => reason.includes("block"))).length;
  const problematicPosts = posts
    .flatMap((post) => {
      const issues = [];
      if (isWeak(post.textQuality)) issues.push("weak text");
      if (isWeak(post.imageQuality) || isWeak(post.telegramImageStatus)) issues.push("weak image");
      if (!hasImage(post)) issues.push("missing image");
      issues.push(...getQualityReasons(post).slice(0, 3));
      return issues.length
        ? [{
            id: stringOrNull(post.postId) ?? stringOrNull(post.id),
            channel: stringOrNull(post.channelId),
            title: stringOrNull(post.title) ?? stringOrNull(post.contentTopic),
            issue: issues.join("; "),
          }]
        : [];
    })
    .slice(0, 10);

  if (postsWithoutImages > 0) warnings.push(`${postsWithoutImages} content item(s) have no image.`);

  return {
    weakTextCount,
    weakImageCount,
    postsWithoutImages,
    genericPhraseCount,
    serviceLabelCount,
    blockReasonCount,
    problematicPosts,
    warnings,
    errors,
  };
}

function buildTelegramHealth() {
  const warnings = [];
  const botTokenConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  if (!botTokenConfigured) warnings.push("TELEGRAM_BOT_TOKEN is not configured.");

  return {
    botTokenConfigured,
    telegramRealPublishEnabled: process.env.TELEGRAM_REAL_PUBLISH_ENABLED ?? null,
    telegramDryRun: process.env.TELEGRAM_DRY_RUN ?? null,
    autopublishEnabled: process.env.AUTOPUBLISH_ENABLED ?? null,
    autopublishTimezone: process.env.AUTOPUBLISH_TIMEZONE ?? null,
    autopublishDailyLimitPerChannel: process.env.AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL ?? null,
    autopublishMaxPostsPerDay: process.env.AUTOPUBLISH_MAX_POSTS_PER_DAY ?? null,
    messageSendAttempted: false,
    postPublishAttempted: false,
    warnings,
    errors: [],
  };
}

async function buildStoreHealth() {
  const warnings = [];
  const errors = [];
  const compare = await safeCall(() => compareJsonSupabaseStore({ loadEnv: true }));
  const mirror = await safeCall(() => runMirrorSync({ loadEnv: true }));
  const missingInSupabaseCount = compare ? totalIds(compare.missingInSupabase) : 0;
  const extraInSupabaseCount = compare ? totalIds(compare.extraInSupabase) : 0;
  const synced = Boolean(compare && compare.status === "ok" && missingInSupabaseCount === 0 && extraInSupabaseCount === 0);

  if (!compare) errors.push("Store compare is unavailable.");
  if (compare) {
    warnings.push(...(compare.warnings ?? []));
    errors.push(...(compare.problems ?? []));
  }
  if (!mirror) warnings.push("Mirror dry-run status is unavailable.");
  if (mirror) {
    warnings.push(...(mirror.warnings ?? []));
    errors.push(...(mirror.problems ?? []));
  }

  return {
    sourceOfTruth: "json",
    productionStoreMode: "json",
    synced,
    counts: {
      json: compare?.localCounts ?? zeroCounts(),
      supabase: compare?.supabaseCounts ?? zeroCounts(),
    },
    missingInSupabaseCount,
    extraInSupabaseCount,
    storeCompareStatus: compare?.status ?? "error",
    dualReadStatus: compare?.status ?? "error",
    mirrorSyncStatus: mirror?.status ?? "warning",
    safeToSwitchToSupabase: false,
    warnings,
    errors,
  };
}

async function buildBackupHealth(nowIso) {
  const warnings = [];
  const errors = [];
  const status = await safeCall(() => getBackupCenterStatus());
  const latestBackupTime = status?.latestBackup?.createdAt ?? null;
  const latestBackupAgeHours = latestBackupTime ? Math.max(0, (new Date(nowIso).getTime() - new Date(latestBackupTime).getTime()) / 36e5) : null;
  const latestBackupOlderThan24h = latestBackupAgeHours !== null && latestBackupAgeHours > 24;
  const latestSupabaseExportExists = existsSync(path.join(root, "data", "backups", "latest-supabase-export"));

  if (!status?.latestBackup) warnings.push("No backup folder was found.");
  if (latestBackupOlderThan24h) warnings.push("Latest backup is older than 24 hours.");
  if (!latestSupabaseExportExists) warnings.push("Latest Supabase export is missing.");

  return {
    latestBackupTime,
    latestBackupAgeHours,
    latestBackupOlderThan24h,
    latestSupabaseExportExists,
    latestBackupManifestPresent: Boolean(status?.latestManifest),
    backupStatus: status?.status ?? "warning",
    warnings,
    errors,
  };
}

function buildWhyNotPublishing({ queue, scheduler, telegram, store }) {
  const reasons = [];
  const now = Date.now();
  const nextDueTime = queue.nextDueTime ? new Date(queue.nextDueTime).getTime() : null;

  if (telegram.telegramRealPublishEnabled !== "true") reasons.push("TELEGRAM_REAL_PUBLISH_ENABLED is not true in the local environment.");
  if (telegram.telegramDryRun === "true") reasons.push("TELEGRAM_DRY_RUN is true.");
  if (!telegram.botTokenConfigured) reasons.push("TELEGRAM_BOT_TOKEN is not configured.");
  if (queue.readyPosts === 0) reasons.push("There are no ready posts.");
  if (nextDueTime && nextDueTime > now) reasons.push("The next scheduled post is not due yet.");
  if (!queue.nextDuePost) reasons.push("No next due post was found.");
  if (scheduler.schedulerHealth === "error") reasons.push("The last scheduler run has errors.");
  if (!store.synced) reasons.push("JSON and Supabase mirror are not synced.");

  return reasons.length ? reasons : ["No blocking reason detected by read-only health checks."];
}

function normalizePost(post) {
  return {
    postId: stringOrNull(post.postId) ?? stringOrNull(post.id),
    channelId: stringOrNull(post.channelId),
    channelName: stringOrNull(post.channelName),
    status: String(post.status ?? "").toLowerCase(),
    scheduledAt: stringOrNull(post.scheduledAt) ?? stringOrNull(post.publishAt),
  };
}

function normalizeLog(log) {
  return {
    id: stringOrNull(log.id),
    runId: stringOrNull(log.runId),
    source: stringOrNull(log.source),
    channelId: stringOrNull(log.channelId),
    postId: stringOrNull(log.postId),
    status: String(log.status ?? "unknown").toLowerCase(),
    message: stringOrNull(log.message) ?? stringOrNull(log.errorMessage) ?? stringOrNull(log.reason),
    telegramMessageId: log.telegramMessageId ?? null,
    telegramMessageLink: stringOrNull(log.telegramMessageLink),
    dryRun: typeof log.dryRun === "boolean" ? log.dryRun : null,
    createdAt: stringOrNull(log.createdAt),
  };
}

function normalizeSchedulerRun(run) {
  const lastErrors = Array.isArray(run.lastErrors) ? run.lastErrors : [];
  return {
    runId: stringOrNull(run.runId),
    source: stringOrNull(run.source),
    storeMode: stringOrNull(run.storeMode) ?? "json",
    dryRun: Boolean(run.dryRun),
    realPublishEnabled: Boolean(run.realPublishEnabled),
    checked: Number(run.checked ?? 0),
    published: Number(run.published ?? 0),
    skipped: Number(run.skipped ?? 0),
    errors: Number(run.errors ?? lastErrors.length ?? 0),
    message: stringOrNull(run.message),
    startedAt: stringOrNull(run.startedAt),
    finishedAt: stringOrNull(run.finishedAt),
    updatedAt: stringOrNull(run.updatedAt),
    lastError: lastErrors[0] ? String(lastErrors[0]) : null,
  };
}

function getNextExpectedWorkflowRun(nowIso) {
  const content = existsSync(workflowPath) ? readFileSync(workflowPath, "utf8") : "";
  const match = content.match(/cron:\s*["']?(\d{1,2})\s+\*\s+\*\s+\*\s+\*["']?/);
  if (!match) return null;
  const minute = Number(match[1]);
  const now = new Date(nowIso);
  const next = new Date(now);
  next.setUTCSeconds(0, 0);
  next.setUTCMinutes(minute);
  if (next.getTime() <= now.getTime()) next.setUTCHours(next.getUTCHours() + 1);
  return next.toISOString();
}

function groupReasons(logs) {
  const counts = new Map();
  for (const log of logs) {
    const reason = log.message ?? log.status ?? "unknown";
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((left, right) => right.count - left.count || left.reason.localeCompare(right.reason));
}

function countLogsToday(logs, today, statuses) {
  return logs.filter((log) => String(log.createdAt ?? "").startsWith(today) && statuses.includes(String(log.status ?? "").toLowerCase())).length;
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime());
}

function readJson(filePath, fallback, errors) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    errors.push(`${path.relative(root, filePath)} could not be parsed.`);
    return fallback;
  }
}

async function safeCall(fn) {
  try {
    return await fn();
  } catch {
    return null;
  }
}

function hasImage(post) {
  return Boolean(post.imageUrl || post.imagePath || post.telegramImagePath || post.previewPath);
}

function isWeak(value) {
  return typeof value === "string" && ["weak", "bad", "missing", "broken", "failed"].some((flag) => value.toLowerCase().includes(flag));
}

function getQualityReasons(post) {
  const raw = Array.isArray(post.qualityIssues) ? post.qualityIssues : [];
  return raw.map((item) => String(item).toLowerCase());
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function totalIds(groups = {}) {
  return Object.values(groups).reduce((total, ids) => total + (Array.isArray(ids) ? ids.length : 0), 0);
}

function zeroCounts() {
  return Object.fromEntries(countKeys.map((key) => [key, 0]));
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
