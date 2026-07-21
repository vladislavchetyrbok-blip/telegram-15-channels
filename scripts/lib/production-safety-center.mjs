import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadLocalEnv } from "./load-local-env.mjs";
import { compareJsonSupabaseStore } from "./store-compare.mjs";
import { runMirrorSync } from "./mirror-sync.mjs";
import { evaluateBackupGate } from "./backup-gate.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const workflowPath = ".github/workflows/publish-scheduler.yml";
const countKeys = ["channels", "posts", "publication_logs", "scheduler_runs"];

export async function getProductionSafetyReport(options = {}) {
  if (options.loadEnv) {
    loadLocalEnv({ cwd: root });
  }

  const lastCheckedAt = new Date().toISOString();
  const warnings = [];
  const errors = [];
  const git = getGitSafety();
  const production = getProductionMode();
  const telegram = getTelegramSafety();
  const scheduler = getSchedulerSafety(lastCheckedAt);
  const store = await getStoreSafety();
  const backup = await getBackupSafety(lastCheckedAt);

  const vipConfig = readJson(path.join(root, "data", "config", "zodiac-vip-config.json"), {});
  if (vipConfig.vipFreeAccessUntil) {
    const expiryTime = new Date(vipConfig.vipFreeAccessUntil).getTime();
    const daysUntilExpiry = (expiryTime - new Date(lastCheckedAt).getTime()) / 864e5;
    if (daysUntilExpiry < 0) {
      warnings.push(`VIP Free Access expired on ${vipConfig.vipFreeAccessUntil}.`);
    } else if (daysUntilExpiry < 30) {
      warnings.push(`VIP Free Access will expire in ${Math.ceil(daysUntilExpiry)} days (${vipConfig.vipFreeAccessUntil}).`);
    }
  }

  warnings.push(...git.warnings, ...production.warnings, ...telegram.warnings, ...scheduler.warnings, ...store.warnings, ...backup.warnings);
  errors.push(...git.errors, ...production.errors, ...telegram.errors, ...scheduler.errors, ...store.errors, ...backup.errors);

  const hasWorkflowChange = git.publishSchedulerChanged;
  const storeReady = store.synced &&
    store.storeCompareStatus === "ok" &&
    store.dualReadStatus === "ok" &&
    store.mirrorSyncStatus === "ok";
  const backupReady = backup.backupReady === true;
  const productionJson = production.productionStoreMode === "json" && production.sourceOfTruth === "json";
  const safeForScheduledPublishing = errors.length === 0 && productionJson && !hasWorkflowChange && storeReady;
  const safeForManualPublish = safeForScheduledPublishing && backupReady && git.workingTreeClean;

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    safeForManualPublish,
    safeForScheduledPublishing,
    backupReady,
    safeToSwitchToSupabase: false,
    productionStoreMode: "json",
    sourceOfTruth: "json",
    checks: {
      git,
      production,
      telegram,
      scheduler,
      store,
      backup,
    },
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt,
  };
}

function getGitSafety() {
  const statusShort = gitValue(["status", "--short"]) ?? "";
  const dirtyFiles = statusShort
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const workflowStatus = gitValue(["status", "--short", "--", workflowPath]) ?? "";
  const envTracked = gitExitCode(["ls-files", "--error-unmatch", ".env.local"]) === 0;
  const warnings = [];
  const errors = [];

  if (dirtyFiles.length > 0) warnings.push("Working tree is dirty.");
  if (workflowStatus.trim()) errors.push("publish-scheduler.yml has local changes.");
  if (envTracked) errors.push(".env.local is tracked by git.");

  return {
    branch: gitValue(["branch", "--show-current"]),
    commit: gitValue(["rev-parse", "HEAD"]),
    workingTreeClean: dirtyFiles.length === 0,
    dirtyFileCount: dirtyFiles.length,
    publishSchedulerChanged: Boolean(workflowStatus.trim()),
    envLocalTracked: envTracked,
    envLocalIgnoredOrUntracked: !envTracked,
    warnings,
    errors,
  };
}

function getProductionMode() {
  const rawStoreMode = process.env.PUBLISH_DUE_STORE || "json";
  const productionStoreMode = rawStoreMode === "postgres" ? "postgres" : "json";
  const sourceOfTruth = "json";
  const warnings = [];
  const errors = [];

  if (productionStoreMode !== "json") {
    errors.push("Production store mode is not json.");
  }

  return {
    productionStoreMode,
    sourceOfTruth,
    publishDueStore: rawStoreMode,
    productionSourceIsJson: productionStoreMode === "json" && sourceOfTruth === "json",
    safeToSwitchToSupabase: false,
    warnings,
    errors,
  };
}

function getTelegramSafety() {
  const realPublishEnabled = process.env.TELEGRAM_REAL_PUBLISH_ENABLED ?? null;
  const dryRun = process.env.TELEGRAM_DRY_RUN ?? null;
  const botTokenConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const warnings = [];

  if (!botTokenConfigured) warnings.push("TELEGRAM_BOT_TOKEN is not configured.");

  return {
    botTokenConfigured,
    realPublishEnabled,
    dryRun,
    botAccessCheck: "not_run",
    messageSendAttempted: false,
    warnings,
    errors: [],
  };
}

function getSchedulerSafety(nowIso) {
  const plan = readJson(path.join(runtimeDir, "weekly-content-plan.json"), { items: [] });
  const scheduledPosts = readJson(path.join(runtimeDir, "scheduled-posts.json"), []);
  const logs = readJson(path.join(runtimeDir, "publication_logs.json"), []);
  const items = Array.isArray(plan.items) ? plan.items : [];
  const queue = Array.isArray(scheduledPosts) ? scheduledPosts : [];
  const publicationLogs = Array.isArray(logs) ? logs : [];
  const now = new Date(nowIso);
  const today = nowIso.slice(0, 10);
  const dueCandidates = [...items, ...queue]
    .map((post) => ({
      postId: stringOrNull(post.postId) ?? stringOrNull(post.id),
      channelId: stringOrNull(post.channelId),
      channelName: stringOrNull(post.channelName),
      status: stringOrNull(post.status),
      scheduledAt: stringOrNull(post.scheduledAt) ?? stringOrNull(post.publishAt),
    }))
    .filter((post) => post.scheduledAt && !["published", "blocked", "failed", "skipped", "cancelled", "canceled"].includes(post.status ?? ""))
    .sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime());
  const nextDue = dueCandidates.find((post) => new Date(post.scheduledAt).getTime() >= now.getTime()) ?? dueCandidates[0] ?? null;

  return {
    readyPostsCount: items.filter((post) => ["ready", "approved"].includes(String(post.status ?? ""))).length,
    scheduledPostsCount: items.filter((post) => String(post.status ?? "") === "scheduled").length + queue.length,
    publishedTodayCount: countLogsToday(publicationLogs, today, ["published", "success"]),
    failedTodayCount: countLogsToday(publicationLogs, today, ["failed", "error"]),
    skippedTodayCount: countLogsToday(publicationLogs, today, ["skipped"]),
    nextDuePost: nextDue
      ? {
          postId: nextDue.postId,
          scheduledAt: nextDue.scheduledAt,
        }
      : null,
    nextChannel: nextDue
      ? {
          channelId: nextDue.channelId,
          channelName: nextDue.channelName,
        }
      : null,
    warnings: [],
    errors: [],
  };
}

async function getStoreSafety() {
  const warnings = [];
  const errors = [];
  const compare = await safeCall(() => compareJsonSupabaseStore({ loadEnv: true }));
  const mirror = await safeCall(() => runMirrorSync({ loadEnv: true }));
  const missingInSupabaseCount = compare ? totalIds(compare.missingInSupabase) : 0;
  const extraInSupabaseCount = compare ? totalIds(compare.extraInSupabase) : 0;
  const hasCompareMismatch = missingInSupabaseCount > 0 || extraInSupabaseCount > 0;
  const synced = Boolean(compare && compare.status === "ok" && !hasCompareMismatch);

  if (!compare) {
    errors.push("Store compare is unavailable.");
  } else {
    warnings.push(...(compare.warnings ?? []));
    errors.push(...(compare.problems ?? []));
  }

  if (!mirror) {
    warnings.push("Mirror sync dry-run status is unavailable.");
  } else {
    warnings.push(...(mirror.warnings ?? []));
    errors.push(...(mirror.problems ?? []));
  }

  return {
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
    safeToRunMirrorSync: Boolean(compare?.supabaseConfigured && mirror && mirror.status !== "error"),
    safeToSwitchToSupabase: false,
    warnings,
    errors,
  };
}

async function getBackupSafety(nowIso) {
  return evaluateBackupGate({ root, now: nowIso });
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function countLogsToday(logs, today, statuses) {
  return logs.filter((log) => {
    const createdAt = typeof log.createdAt === "string" ? log.createdAt : "";
    const status = String(log.status ?? "").toLowerCase();
    return createdAt.startsWith(today) && statuses.includes(status);
  }).length;
}

async function safeCall(fn) {
  try {
    return await fn();
  } catch {
    return null;
  }
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

function gitValue(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function gitExitCode(args) {
  try {
    execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "ignore", "ignore"] });
    return 0;
  } catch (error) {
    return typeof error?.status === "number" ? error.status : 1;
  }
}
