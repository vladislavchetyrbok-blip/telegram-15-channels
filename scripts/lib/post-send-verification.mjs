import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { compareJsonSupabaseStore } from "./store-compare.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const planPath = path.join(runtimeDir, "weekly-content-plan.json");
const logsPath = path.join(runtimeDir, "publication_logs.json");

const publishedStatuses = new Set(["success", "published", "sent", "testpublished", "test_published", "ok"]);
const maxAllowedForManualTest = 1;

export async function getPostSendVerificationReport(options = {}) {
  const lastCheckedAt = new Date().toISOString();
  const warnings = [];
  const errors = [];
  const plan = readJson(planPath, { version: 1, items: [] }, errors);
  const logs = readJson(logsPath, [], errors);
  const posts = Array.isArray(plan.items) ? plan.items : [];
  const publicationLogs = Array.isArray(logs) ? logs : [];
  const requestedPostId = stringOrNull(options.postId);

  if (!Array.isArray(plan.items)) errors.push("data/runtime/weekly-content-plan.json does not contain an items array.");
  if (!Array.isArray(logs)) errors.push("data/runtime/publication_logs.json does not contain an array.");

  const lastPublication = buildLastPublication(publicationLogs);
  const selectedPostVerification = requestedPostId
    ? buildSelectedPostVerification({ postId: requestedPostId, posts, publicationLogs, warnings, errors })
    : null;
  const bulkSafety = buildBulkSafety(publicationLogs, requestedPostId);
  const githubActions = buildGithubActionsSafety();
  const storeConsistency = await buildStoreConsistency(warnings);

  if (!lastPublication.latestPublicationLog) warnings.push("No publication logs were found.");
  if (bulkSafety.bulkDetected) {
    warnings.push(`Bulk publication detected: ${bulkSafety.publicationsInLast10Minutes} publication logs in the last 10 minutes.`);
  }
  if (storeConsistency.status !== "ok") {
    warnings.push(storeConsistency.message);
  }

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    lastPublication,
    selectedPostVerification,
    bulkSafety,
    storeConsistency,
    githubActions,
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt,
  };
}

function buildLastPublication(logs) {
  const latestPublicationLog = latestByCreatedAt(logs);
  const status = normalizeStatus(latestPublicationLog?.status);

  return {
    latestPublicationLog,
    latestPublishedPostId: stringOrNull(latestPublicationLog?.postId),
    latestPublishedChannelId: stringOrNull(latestPublicationLog?.channelId),
    latestPublishedAt: stringOrNull(latestPublicationLog?.createdAt),
    latestTelegramMessageId: latestPublicationLog?.telegramMessageId ?? null,
    latestStatus: status,
    latestError: stringOrNull(latestPublicationLog?.error) ?? stringOrNull(latestPublicationLog?.message),
    latestWasActualPublication: isActualPublicationLog(latestPublicationLog),
  };
}

function buildSelectedPostVerification({ postId, posts, publicationLogs, warnings, errors }) {
  const matchingPosts = posts.filter((post) => postIdFor(post) === postId);
  const post = matchingPosts[0] ?? null;
  const logsForPost = publicationLogs
    .filter((log) => stringOrNull(log?.postId) === postId)
    .sort((left, right) => (Date.parse(right?.createdAt ?? "") || 0) - (Date.parse(left?.createdAt ?? "") || 0));
  const latestLog = logsForPost[0] ?? null;
  const actualLogsForPost = logsForPost.filter(isActualPublicationLog);
  const postChannelId = stringOrNull(post?.channelId);
  const latestLogChannelId = stringOrNull(latestLog?.channelId);
  const actualLogChannelIds = Array.from(new Set(actualLogsForPost.map((log) => stringOrNull(log.channelId)).filter(Boolean)));
  const duplicatePostInJson = matchingPosts.length > 1;
  const duplicatePublicationLogs = actualLogsForPost.length > 1;
  const status = normalizeStatus(post?.status);
  const publishResult = normalizeStatus(post?.publishResult);
  const statusIsPublishedLike = publishedStatuses.has(status) || publishedStatuses.has(publishResult) || Boolean(post?.testPublished);
  const channelIdMatches = Boolean(post && latestLog && postChannelId && latestLogChannelId && postChannelId === latestLogChannelId);

  if (!post) errors.push(`Requested postId was not found: ${postId}`);
  if (post && !logsForPost.length) warnings.push(`No publication log exists for selected postId: ${postId}`);
  if (duplicatePostInJson) warnings.push(`Selected postId appears ${matchingPosts.length} times in JSON posts: ${postId}`);
  if (duplicatePublicationLogs) warnings.push(`Selected postId has ${actualLogsForPost.length} actual publication logs: ${postId}`);
  if (post && latestLog && !channelIdMatches) warnings.push(`Selected post channelId does not match latest publication log channelId for ${postId}.`);

  return {
    requestedPostId: postId,
    postExists: Boolean(post),
    postId,
    postChannelId,
    postStatus: status,
    publishResult,
    statusIsPublishedLike,
    testPublished: Boolean(post?.testPublished),
    publicationLogExists: logsForPost.length > 0,
    logCountForPost: logsForPost.length,
    actualPublicationLogCountForPost: actualLogsForPost.length,
    latestLog,
    latestLogStatus: normalizeStatus(latestLog?.status),
    latestLogChannelId,
    actualLogChannelIds,
    telegramMessageIdExists: Boolean(latestLog?.telegramMessageId ?? post?.telegramMessageId),
    telegramMessageId: latestLog?.telegramMessageId ?? post?.telegramMessageId ?? null,
    channelIdMatches,
    duplicatePostInJson,
    duplicatePostCountInJson: matchingPosts.length,
    duplicatePublicationLogs,
    otherPostsTouchedInLast10Minutes: buildOtherRecentPosts(publicationLogs, postId),
  };
}

function buildBulkSafety(logs, selectedPostId) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recentActualLogs = logs.filter((log) => {
    const createdAt = Date.parse(log?.createdAt ?? "");
    return isActualPublicationLog(log) && Number.isFinite(createdAt) && now - createdAt <= windowMs && now >= createdAt;
  });
  const uniquePosts = uniqueStrings(recentActualLogs.map((log) => stringOrNull(log.postId)));
  const uniqueChannels = uniqueStrings(recentActualLogs.map((log) => stringOrNull(log.channelId)));
  const selectedOnly =
    selectedPostId && uniquePosts.length <= 1 && (uniquePosts.length === 0 || uniquePosts[0] === selectedPostId);
  const bulkDetected =
    recentActualLogs.length > maxAllowedForManualTest ||
    uniquePosts.length > maxAllowedForManualTest ||
    uniqueChannels.length > maxAllowedForManualTest;
  const warnings = [];

  if (bulkDetected) warnings.push("More than one actual publication, post, or channel was touched in the last 10 minutes.");
  if (selectedPostId && !selectedOnly) warnings.push("Recent actual publications are not limited to the selected postId.");

  return {
    windowMinutes: 10,
    maxAllowedForManualTest,
    publicationsInLast10Minutes: recentActualLogs.length,
    uniquePostsPublishedInLast10Minutes: uniquePosts.length,
    uniqueChannelsTouchedInLast10Minutes: uniqueChannels.length,
    recentPublishedPostIds: uniquePosts,
    recentTouchedChannelIds: uniqueChannels,
    bulkDetected,
    warnings,
  };
}

function buildGithubActionsSafety() {
  return {
    workflowNotTriggeredByThisCheck: true,
    workflowDispatchUsed: false,
    githubActionsTriggered: false,
    githubApiAvailable: Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN),
    tokenValueExposed: false,
  };
}

async function buildStoreConsistency(warnings) {
  try {
    const compare = await compareJsonSupabaseStore({ loadEnv: true });
    const missingCounts = countGroups(compare.missingInSupabase);
    const extraCounts = countGroups(compare.extraInSupabase);
    const duplicateCounts = {
      local: countGroups(compare.duplicates?.local),
      supabase: countGroups(compare.duplicates?.supabase),
    };
    const synced = compare.status === "ok";

    return {
      status: compare.status,
      synced,
      supabaseConfigured: Boolean(compare.supabaseConfigured),
      message: compare.message ?? (synced ? "JSON and Supabase stores are synced." : "JSON and Supabase store comparison returned warnings."),
      localCounts: compare.localCounts,
      supabaseCounts: compare.supabaseCounts,
      missingCounts,
      extraCounts,
      duplicateCounts,
      compareCheckedAt: compare.checkedAt,
      productionStoreMode: "json",
      sourceOfTruth: "json",
      safeToSwitchToSupabase: false,
    };
  } catch (error) {
    const message = sanitizeError(error);
    warnings.push(`Store consistency check failed: ${message}`);
    return {
      status: "warning",
      synced: false,
      supabaseConfigured: Boolean(process.env.DATABASE_URL),
      message: `Store consistency check failed: ${message}`,
      localCounts: null,
      supabaseCounts: null,
      missingCounts: null,
      extraCounts: null,
      duplicateCounts: null,
      compareCheckedAt: null,
      productionStoreMode: "json",
      sourceOfTruth: "json",
      safeToSwitchToSupabase: false,
    };
  }
}

function buildOtherRecentPosts(logs, postId) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  return uniqueStrings(
    logs
      .filter((log) => {
        const createdAt = Date.parse(log?.createdAt ?? "");
        return isActualPublicationLog(log) && Number.isFinite(createdAt) && now - createdAt <= windowMs && now >= createdAt;
      })
      .map((log) => stringOrNull(log.postId))
      .filter((id) => id && id !== postId),
  );
}

function latestByCreatedAt(items) {
  return [...items].sort((left, right) => (Date.parse(right?.createdAt ?? "") || 0) - (Date.parse(left?.createdAt ?? "") || 0))[0] ?? null;
}

function isActualPublicationLog(log) {
  if (!log) return false;
  const status = normalizeStatus(log.status);
  return publishedStatuses.has(status) && log.dryRun !== true;
}

function readJson(filePath, fallback, errors) {
  if (!existsSync(filePath)) {
    errors.push(`${path.relative(root, filePath)} is missing.`);
    return fallback;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, filePath)} could not be parsed: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

function countGroups(groups) {
  if (!groups || typeof groups !== "object") return null;
  return Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));
}

function uniqueStrings(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

function postIdFor(post) {
  return stringOrNull(post?.postId) ?? stringOrNull(post?.id) ?? "unknown";
}

function normalizeStatus(value) {
  return String(value ?? "").trim().toLowerCase() || "unknown";
}

function stringOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function sanitizeError(error) {
  let message = error instanceof Error ? error.message : String(error);
  for (const secret of [process.env.DATABASE_URL, process.env.TELEGRAM_BOT_TOKEN, process.env.GITHUB_TOKEN, process.env.GH_TOKEN]) {
    if (secret) message = message.split(secret).join("[redacted]");
  }
  return message;
}
