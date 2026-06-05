import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { getContentQualityAnalysis } from "./content-quality.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");

const defaultChannelId = "ai-tech";
const candidateStatuses = new Set(["ready", "approved", "scheduled"]);
const publishedStatuses = new Set(["published", "sent", "success"]);
const failedStatuses = new Set(["failed", "error"]);
const skippedStatuses = new Set(["skipped"]);
const blockedStatuses = new Set(["blocked", "unsafe", "disabled"]);

const genericPhrases = [
  "если брать",
  "не с модного названия",
  "задачу, которую можно измерить за один день",
  "выберите один повторяемый процесс",
  "сохраните идею и протестируйте",
  "what to check this week",
  "start with a simple check",
  "short checklist",
];

const serviceLabels = [
  "service_visual_label",
  "qualitystatus",
  "textstatus",
  "fallbackprovider",
  "local_template",
  "premium_v2",
  "placeholder",
  "draft:",
  "provider:",
];

const topicHints = [
  "ai",
  "ии",
  "нейросет",
  "модел",
  "автоматизац",
  "данн",
  "безопасност",
  "технолог",
  "инструмент",
  "prompt",
  "промпт",
];

export async function getOneChannelTestQueueReport(options = {}) {
  const channelId = stringOrNull(options.channelId) ?? defaultChannelId;
  const lastCheckedAt = new Date().toISOString();
  const warnings = [];
  const errors = [];

  const quality = await getContentQualityAnalysis();
  const posts = Array.isArray(quality.posts) ? quality.posts : [];
  const analyzedByPostId = new Map(quality.analyzed.map((post) => [post.postId, post]));
  const logs = readJson(path.join(runtimeDir, "publication_logs.json"), [], errors);
  const latestLogsByPostId = buildLatestLogs(Array.isArray(logs) ? logs : []);

  if (quality.errors.length) errors.push(...quality.errors);
  if (!Array.isArray(logs)) errors.push("data/runtime/publication_logs.json does not contain an array.");

  const channelPosts = posts.filter((post) => stringOrNull(post.channelId) === channelId);
  if (!channelPosts.length) {
    warnings.push(`No posts found for channel ${channelId}.`);
  }

  const evaluated = channelPosts.map((post) => evaluatePost(post, analyzedByPostId.get(postIdFor(post)), latestLogsByPostId.get(postIdFor(post))));
  const alreadyPublished = evaluated.filter((post) => post.alreadyPublished);
  const blocked = evaluated.filter((post) => post.blocked);
  const candidates = evaluated
    .filter((post) => post.candidate)
    .sort((left, right) => right.readinessScore - left.readinessScore || compareDate(left.scheduledAt, right.scheduledAt) || left.postId.localeCompare(right.postId));
  const queue = candidates.slice(0, 3);
  const readyCount = queue.filter((post) => post.ready).length;
  const safeForControlledChannelTest = readyCount >= 2 && readyCount <= 3 && queue.every((post) => post.ready && !post.alreadyPublished);

  if (readyCount < 2) warnings.push(`Only ${readyCount} ready candidate(s) found for ${channelId}.`);
  if (queue.length > 3) warnings.push("Queue was trimmed to the first three safest candidates.");

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    channelId,
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    safeForControlledChannelTest,
    safeForBulkPublishing: false,
    summary: {
      candidateCount: candidates.length,
      readyCount,
      blockedCount: blocked.length,
      alreadyPublishedCount: alreadyPublished.length,
    },
    queue: queue.map(toQueueItem),
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt,
  };
}

function evaluatePost(post, qualityPost, latestLog) {
  const postId = postIdFor(post);
  const status = normalizeStatus(post.status);
  const logStatus = normalizeStatus(latestLog?.status);
  const title = stringOrNull(post.title) ?? stringOrNull(post.contentTopic) ?? "Untitled";
  const topic = stringOrNull(post.contentTopic) ?? stringOrNull(post.topic) ?? title;
  const body = stringOrNull(post.body) ?? stringOrNull(post.text) ?? stringOrNull(post.excerpt) ?? "";
  const caption = stringOrNull(post.telegramCaption) ?? "";
  const text = [title, body, caption].filter(Boolean).join("\n\n");
  const normalizedText = normalize(text);
  const image = inspectImage(post);
  const issues = new Set(Array.isArray(qualityPost?.issues) ? qualityPost.issues : []);

  if (!candidateStatuses.has(status)) issues.add("not_ready_or_scheduled");
  if (publishedStatuses.has(status) || publishedStatuses.has(logStatus) || Boolean(post.telegramMessageId)) issues.add("already_published");
  if (failedStatuses.has(status) || failedStatuses.has(logStatus)) issues.add("failed_status");
  if (skippedStatuses.has(status) || skippedStatuses.has(logStatus)) issues.add("skipped_status");
  if (blockedStatuses.has(status)) issues.add("blocked_status");
  if (body.length < 700) issues.add("text_under_700_chars");
  if (body.length > 1200) issues.add("text_over_1200_chars");
  if (includesAny(normalizedText, genericPhrases)) issues.add("generic_text");
  if (includesAny(normalizedText, serviceLabels)) issues.add("service_label_in_text");
  if (!hasUsefulHook(body)) issues.add("weak_hook");
  if (countBullets(body) < 3 || countBullets(body) > 5) issues.add("bullet_count_not_3_to_5");
  if (!hasConclusion(body)) issues.add("missing_conclusion");
  if (fitsAiTech(text, topic)) {
    issues.delete("channel_topic_mismatch");
  } else {
    issues.add("channel_topic_mismatch");
  }
  if (!image.imagePath && !image.imagePrompt) issues.add("missing_image_or_prompt");
  if (image.imagePath && !image.imageExists) issues.add("image_file_missing");
  if (!image.imagePath && image.imagePrompt && image.imagePrompt.length < 80) issues.add("weak_image_prompt");
  if (hasUsefulHook(body) && hasConclusion(body) && countBullets(body) >= 3) issues.delete("weak_cta");
  if (image.imageExists && post.visualMetadata?.serviceLabels === false && fitsAiTech(text, topic)) issues.delete("generic_visual");

  const readinessScore = calculateReadinessScore(post, qualityPost, Array.from(issues));
  if (readinessScore < 82) issues.add("readiness_score_below_82");

  const blockingIssues = [
    "not_ready_or_scheduled",
    "already_published",
    "failed_status",
    "skipped_status",
    "blocked_status",
    "empty_text",
    "missing_image_or_prompt",
    "image_file_missing",
    "forbidden_phrase",
  ];
  const warningIssues = [
    "text_under_700_chars",
    "text_over_1200_chars",
    "generic_text",
    "service_label_in_text",
    "weak_hook",
    "bullet_count_not_3_to_5",
    "missing_conclusion",
    "channel_topic_mismatch",
    "readiness_score_below_82",
  ];
  const issueList = Array.from(issues);
  const hardBlocked = issueList.some((issue) => blockingIssues.includes(issue));
  const hasWarnings = issueList.some((issue) => warningIssues.includes(issue));
  const ready = !hardBlocked && !hasWarnings && readinessScore >= 82;
  const candidate = ready && !publishedStatuses.has(status) && !publishedStatuses.has(logStatus);

  return {
    postId,
    channelId: stringOrNull(post.channelId) ?? "unknown",
    channelName: stringOrNull(post.channelName) ?? stringOrNull(post.channelTitle) ?? stringOrNull(post.channelId) ?? "unknown",
    title,
    topic,
    status,
    scheduledAt: stringOrNull(post.scheduledAt),
    textLength: body.length,
    readinessScore,
    imageStatus: image.imageExists ? "file_exists" : image.imagePrompt ? "prompt_available" : "missing",
    imagePath: image.imagePath,
    imagePrompt: image.imagePrompt,
    issues: issueList,
    ready,
    candidate,
    blocked: hardBlocked || (!ready && issueList.length > 0),
    alreadyPublished: issueList.includes("already_published"),
    recommendation: buildRecommendation(issueList, ready),
  };
}

function toQueueItem(post) {
  return {
    postId: post.postId,
    channelId: post.channelId,
    channelName: post.channelName,
    title: post.title,
    topic: post.topic,
    status: post.status,
    scheduledAt: post.scheduledAt,
    textLength: post.textLength,
    readinessScore: post.readinessScore,
    imageStatus: post.imageStatus,
    imagePath: post.imagePath,
    imagePrompt: post.imagePrompt,
    issues: post.issues,
    recommendation: post.recommendation,
  };
}

function calculateReadinessScore(post, qualityPost, issues) {
  let score = Number.isFinite(Number(post.readinessScore)) ? Number(post.readinessScore) : Number(qualityPost?.qualityScore ?? 88);
  if (issues.includes("generic_text")) score -= 14;
  if (issues.includes("service_label_in_text")) score -= 18;
  if (issues.includes("text_under_700_chars") || issues.includes("text_over_1200_chars")) score -= 8;
  if (issues.includes("weak_hook")) score -= 8;
  if (issues.includes("bullet_count_not_3_to_5")) score -= 8;
  if (issues.includes("missing_conclusion")) score -= 8;
  if (issues.includes("channel_topic_mismatch")) score -= 12;
  if (issues.includes("missing_image_or_prompt") || issues.includes("image_file_missing")) score -= 24;
  if (issues.some((issue) => ["already_published", "failed_status", "skipped_status", "blocked_status"].includes(issue))) score -= 40;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function inspectImage(post) {
  const directPath = stringOrNull(post.telegramImagePath) ?? stringOrNull(post.imagePath) ?? stringOrNull(post.draftImagePath);
  const publicUrl = stringOrNull(post.imageUrl) ?? stringOrNull(post.previewPath);
  const resolvedPublicPath = publicUrl?.startsWith("/") ? path.join(root, "public", publicUrl.replace(/^\/+/, "")) : null;
  const filePath = directPath ?? resolvedPublicPath;
  const imageExists = Boolean(filePath && existsSync(filePath) && statSync(filePath).isFile());
  const imagePrompt =
    stringOrNull(post.imagePrompt) ??
    stringOrNull(post.draftImagePrompt) ??
    stringOrNull(post.visualMetadata?.imagePrompt) ??
    stringOrNull(post.visualMetadata?.prompt) ??
    null;

  return {
    imagePath: directPath ?? publicUrl ?? "",
    imageExists,
    imagePrompt,
  };
}

function buildLatestLogs(logs) {
  const latest = new Map();
  for (const log of logs) {
    const postId = stringOrNull(log.postId);
    if (!postId) continue;
    const current = latest.get(postId);
    if (!current || compareDate(log.createdAt, current.createdAt) >= 0) latest.set(postId, log);
  }
  return latest;
}

function buildRecommendation(issues, ready) {
  if (ready) return "ready_for_controlled_one_channel_test";
  if (issues.includes("already_published")) return "exclude_already_published";
  if (issues.includes("failed_status") || issues.includes("skipped_status") || issues.includes("blocked_status")) return "exclude_by_status";
  if (issues.includes("generic_text") || issues.includes("text_under_700_chars") || issues.includes("weak_hook")) return "rewrite_text_before_test";
  if (issues.some((issue) => issue.includes("image"))) return "fix_image_before_test";
  return "review_before_test";
}

function fitsAiTech(text, topic) {
  const normalized = normalize(`${topic}\n${text}`);
  return topicHints.some((hint) => normalized.includes(hint));
}

function hasUsefulHook(body) {
  const firstParagraph = String(body ?? "").split(/\n\s*\n/)[0] ?? "";
  return firstParagraph.length >= 90 && /[?.!]/.test(firstParagraph);
}

function countBullets(body) {
  return String(body ?? "")
    .split(/\r?\n/)
    .filter((line) => /^\s*-\s+\S/.test(line)).length;
}

function hasConclusion(body) {
  const paragraphs = String(body ?? "").split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const tail = normalize(paragraphs.slice(-2).join(" "));
  return tail.includes("итог") || tail.includes("вывод") || tail.includes("главное") || tail.includes("перед тестом");
}

function includesAny(value, phrases) {
  return phrases.some((phrase) => value.includes(normalize(phrase)));
}

function compareDate(left, right) {
  const leftTime = Date.parse(left ?? "") || Number.MAX_SAFE_INTEGER;
  const rightTime = Date.parse(right ?? "") || Number.MAX_SAFE_INTEGER;
  return leftTime - rightTime;
}

function postIdFor(post) {
  return stringOrNull(post?.postId) ?? stringOrNull(post?.id) ?? "unknown";
}

function readJson(filePath, fallback, errors) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, filePath)} could not be parsed: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

function normalizeStatus(value) {
  return String(value ?? "").trim().toLowerCase() || "unknown";
}

function normalize(value) {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
