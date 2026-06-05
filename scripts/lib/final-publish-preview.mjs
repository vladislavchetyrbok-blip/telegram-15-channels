import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { getContentQualityAnalysis } from "./content-quality.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const regenerationDraftsFile = path.join(root, "data", "regeneration-drafts", "regeneration-drafts.json");

const candidateStatuses = new Set(["ready", "approved", "scheduled"]);
const publishedStatuses = new Set(["published", "sent", "success"]);
const blockedStatuses = new Set(["blocked", "unsafe", "disabled"]);
const failedStatuses = new Set(["failed", "error"]);
const skippedStatuses = new Set(["skipped"]);

export async function getFinalPublishPreviewReport() {
  const checkedAt = new Date().toISOString();
  const warnings = [];
  const errors = [];
  const quality = await getContentQualityAnalysis();
  const planPosts = quality.posts;
  const analyzedByPostId = new Map(quality.analyzed.map((post) => [post.postId, post]));
  const logs = readJson(path.join(runtimeDir, "publication_logs.json"), [], errors);
  const draftStore = readJson(regenerationDraftsFile, { drafts: [] }, errors);
  const drafts = normalizeDrafts(draftStore);
  const appliedDrafts = drafts.filter((draft) => draft.applied);
  const approvedOrAppliedDrafts = drafts.filter((draft) => draft.approved || draft.status === "approved" || draft.applied);
  const appliedDraftPostIds = new Set(appliedDrafts.map((draft) => draft.sourcePostId).filter(Boolean));
  const approvedOrAppliedDraftPostIds = new Set(approvedOrAppliedDrafts.map((draft) => draft.sourcePostId).filter(Boolean));
  const logCounts = countLogStatuses(Array.isArray(logs) ? logs : []);

  if (quality.errors.length) errors.push(...quality.errors);
  if (!Array.isArray(logs)) errors.push("data/runtime/publication_logs.json does not contain an array.");

  const previewRows = planPosts
    .map((post) => buildPreviewPost(post, analyzedByPostId.get(postIdFor(post)), { appliedDraftPostIds, approvedOrAppliedDraftPostIds }))
    .sort(candidateSort);

  const candidatePosts = previewRows.filter((row) => candidateStatuses.has(row.postStatus));
  const previewPosts = candidatePosts.slice(0, 20);
  const recommendedFirstTestPost = candidatePosts.find(isGoodManualTestPost) ?? null;
  const recommendedFirstTestChannel = recommendedFirstTestPost
    ? {
        channelId: recommendedFirstTestPost.channelId,
        channelName: recommendedFirstTestPost.channelName,
      }
    : null;
  const channelReadiness = buildChannelReadiness(previewRows);

  const summary = {
    totalPosts: planPosts.length,
    readyPosts: candidatePosts.filter((post) => !isBlockedPreviewPost(post)).length,
    scheduledPosts: previewRows.filter((post) => post.postStatus === "scheduled").length,
    alreadyPublishedPosts: previewRows.filter(isPublishedPost).length,
    failedPosts: previewRows.filter((post) => failedStatuses.has(post.postStatus)).length + logCounts.failed,
    skippedPosts: previewRows.filter((post) => skippedStatuses.has(post.postStatus)).length + logCounts.skipped,
    blockedPosts: previewRows.filter(isBlockedPreviewPost).length,
    missingImages: previewRows.filter((post) => !post.imageExists).length,
    weakTexts: previewRows.filter((post) => post.issues.some((issue) => ["weak_cta", "text_too_short", "empty_text", "generic_template_text", "service_label", "repeated_template"].includes(issue))).length,
    appliedDraftPosts: appliedDraftPostIds.size,
    postsChangedByDraftApply: previewRows.filter((post) => post.changedByDraftApply).length,
    approvedOrAppliedDraftPosts: approvedOrAppliedDraftPostIds.size,
    previewCandidatePosts: candidatePosts.length,
  };

  if (!recommendedFirstTestPost) warnings.push("No high-confidence ready/scheduled post was found for a future one-post manual test.");
  if (summary.missingImages > 0) warnings.push(`${summary.missingImages} post(s) have missing or unresolved image files.`);
  if (summary.blockedPosts > 0) warnings.push(`${summary.blockedPosts} post(s) are blocked by status or quality.`);
  if (quality.warnings.length) warnings.push(...quality.warnings);

  const safeForManualOnePostTest = Boolean(recommendedFirstTestPost);
  const requiredBeforePublishing = buildRequiredBeforePublishing(summary, recommendedFirstTestPost);
  const whyNotBulkPublishing = [
    "Bulk publishing is intentionally disabled for this project stage.",
    "Use this report for final read-only preview and select at most one future manual test candidate.",
    ...requiredBeforePublishing,
  ];

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    safeForManualOnePostTest,
    safeForBulkPublishing: false,
    summary,
    channelReadiness,
    previewPosts,
    recommendedFirstTestPost,
    recommendedFirstTestChannel,
    whyNotBulkPublishing: Array.from(new Set(whyNotBulkPublishing)),
    requiredBeforePublishing: Array.from(new Set(requiredBeforePublishing)),
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt: checkedAt,
  };
}

function buildPreviewPost(post, qualityPost, draftContext) {
  const postId = postIdFor(post);
  const postStatus = normalizeStatus(post.status);
  const telegramText = buildTelegramText(post);
  const image = inspectImage(post);
  const qualityIssues = Array.isArray(qualityPost?.issues) ? qualityPost.issues : [];
  const issues = new Set(qualityIssues);

  if (!telegramText.trim()) issues.add("missing_text");
  if (telegramText.trim().length < 280) issues.add("too_short_text");
  if (telegramText.length > 1024) issues.add("too_long_text");
  if (!image.imagePath) issues.add("missing_image");
  if (image.imagePath && !image.imageExists) issues.add("image_missing");
  if (blockedStatuses.has(postStatus) || failedStatuses.has(postStatus)) issues.add("unsafe_or_blocked_status");
  if (isPublishedPost({ postStatus, telegramMessageId: post.telegramMessageId, publishResult: post.publishResult })) issues.add("already_published");

  const issueList = Array.from(issues);
  const blocked = issueList.some((issue) => ["empty_text", "missing_text", "missing_image", "image_missing", "forbidden_phrase", "unsafe_or_blocked_status"].includes(issue));
  const warning = issueList.length > 0 || (qualityPost?.status && !["excellent", "good"].includes(qualityPost.status));
  const renderStatus = blocked ? "blocked" : warning ? "warning" : "ok";
  const score = calculateReadinessScore(qualityPost?.qualityScore, issueList, renderStatus);

  return {
    postId,
    channelId: stringOrNull(post.channelId) ?? "unknown",
    channelName: stringOrNull(post.channelName) ?? stringOrNull(post.channelTitle) ?? stringOrNull(qualityPost?.channel) ?? stringOrNull(post.channelId) ?? "unknown",
    topic: stringOrNull(post.contentTopic) ?? stringOrNull(post.topic) ?? stringOrNull(post.title) ?? "Untitled",
    title: stringOrNull(post.title) ?? stringOrNull(post.contentTopic) ?? "Untitled",
    scheduledAt: stringOrNull(post.scheduledAt),
    postStatus,
    textPreview: compactText(telegramText, 260),
    telegramText,
    fullTextLength: telegramText.length,
    imagePath: image.imagePath,
    imageExists: image.imageExists,
    imagePrompt: image.imagePrompt,
    renderStatus,
    issues: issueList,
    publishReadinessScore: score,
    qualityStatus: qualityPost?.status ?? "unknown",
    changedByDraftApply: Boolean(draftContext.appliedDraftPostIds.has(postId) || post.lastDraftApply || post.draftTextAppliedAt || post.draftImageAppliedAt),
    hasApprovedOrAppliedDraftRelation: draftContext.approvedOrAppliedDraftPostIds.has(postId),
    appliedDraftId: getAppliedDraftId(post),
  };
}

function buildChannelReadiness(previewRows) {
  const channels = new Map();
  for (const row of previewRows) {
    const channel = channels.get(row.channelId) ?? {
      channelId: row.channelId,
      channelName: row.channelName,
      active: true,
      rows: [],
    };
    channel.rows.push(row);
    channels.set(row.channelId, channel);
  }

  return Array.from(channels.values())
    .map((channel) => {
      const candidateRows = channel.rows.filter((row) => candidateStatuses.has(row.postStatus));
      const readyRows = candidateRows.filter((row) => !isBlockedPreviewPost(row));
      const blockedRows = channel.rows.filter(isBlockedPreviewPost);
      const missingImages = channel.rows.filter((row) => !row.imageExists).length;
      const averageReadinessScore = channel.rows.length
        ? Math.round(channel.rows.reduce((total, row) => total + row.publishReadinessScore, 0) / channel.rows.length)
        : 0;
      const nextCandidatePost = readyRows.sort(candidateSort)[0] ?? null;
      const status = !readyRows.length || averageReadinessScore < 55 ? "blocked" : blockedRows.length || missingImages || averageReadinessScore < 82 ? "warning" : "ready";

      return {
        channelId: channel.channelId,
        channelName: channel.channelName,
        active: channel.active,
        readyPostsCount: readyRows.length,
        blockedPostsCount: blockedRows.length,
        missingImagesCount: missingImages,
        averageReadinessScore,
        nextCandidatePost: nextCandidatePost
          ? {
              postId: nextCandidatePost.postId,
              topic: nextCandidatePost.topic,
              publishReadinessScore: nextCandidatePost.publishReadinessScore,
              renderStatus: nextCandidatePost.renderStatus,
            }
          : null,
        status,
      };
    })
    .sort((left, right) => {
      const order = { blocked: 0, warning: 1, ready: 2 };
      return order[left.status] - order[right.status] || right.readyPostsCount - left.readyPostsCount || left.channelId.localeCompare(right.channelId);
    });
}

function buildRequiredBeforePublishing(summary, recommendedFirstTestPost) {
  const required = [];
  if (summary.blockedPosts > 0) required.push("Resolve blocked posts before any broader publishing step.");
  if (summary.missingImages > 0) required.push("Fix missing image paths/files before selecting those posts for publishing.");
  if (summary.weakTexts > 0) required.push("Review weak or generic texts before publishing them.");
  if (!recommendedFirstTestPost) required.push("Create at least one ready/scheduled post with good score and an existing image.");
  return required;
}

function isGoodManualTestPost(post) {
  return (
    candidateStatuses.has(post.postStatus) &&
    post.renderStatus === "ok" &&
    post.imageExists &&
    post.publishReadinessScore >= 82 &&
    !isPublishedPost(post)
  );
}

function isBlockedPreviewPost(post) {
  return post.renderStatus === "blocked" || blockedStatuses.has(post.postStatus);
}

function isPublishedPost(post) {
  const postStatus = normalizeStatus(post.postStatus ?? post.status);
  const publishResult = normalizeStatus(post.publishResult);
  return publishedStatuses.has(postStatus) || publishedStatuses.has(publishResult) || Boolean(post.telegramMessageId);
}

function calculateReadinessScore(qualityScore, issues, renderStatus) {
  let score = Number.isFinite(Number(qualityScore)) ? Number(qualityScore) : 80;
  if (renderStatus === "blocked") score -= 25;
  if (renderStatus === "warning") score -= 8;
  if (issues.includes("missing_image") || issues.includes("image_missing")) score -= 20;
  if (issues.includes("too_short_text")) score -= 12;
  if (issues.includes("too_long_text")) score -= 8;
  if (issues.includes("unsafe_or_blocked_status")) score -= 25;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function candidateSort(left, right) {
  const leftTime = Date.parse(left.scheduledAt ?? "") || Number.MAX_SAFE_INTEGER;
  const rightTime = Date.parse(right.scheduledAt ?? "") || Number.MAX_SAFE_INTEGER;
  return leftTime - rightTime || left.channelId.localeCompare(right.channelId) || left.postId.localeCompare(right.postId);
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

function buildTelegramText(post) {
  const caption = stringOrNull(post.telegramCaption);
  if (caption) return caption;

  const title = stringOrNull(post.title) ?? stringOrNull(post.contentTopic) ?? "";
  const body = stringOrNull(post.body) ?? stringOrNull(post.text) ?? stringOrNull(post.excerpt) ?? "";
  if (title && body && !body.startsWith(title)) return `<b>${escapeHtml(title)}</b>\n\n${body}`;
  return body || title;
}

function countLogStatuses(logs) {
  const latestByPost = new Map();
  for (const log of logs) {
    const postId = stringOrNull(log.postId);
    if (!postId) continue;
    const current = latestByPost.get(postId);
    const currentTime = Date.parse(current?.createdAt ?? "") || 0;
    const nextTime = Date.parse(log.createdAt ?? "") || 0;
    if (!current || nextTime >= currentTime) latestByPost.set(postId, log);
  }

  let failed = 0;
  let skipped = 0;
  for (const log of latestByPost.values()) {
    const status = normalizeStatus(log.status);
    if (failedStatuses.has(status)) failed += 1;
    if (skippedStatuses.has(status)) skipped += 1;
  }
  return { failed, skipped };
}

function normalizeDrafts(store) {
  const rawDrafts = Array.isArray(store) ? store : Array.isArray(store?.drafts) ? store.drafts : [];
  return rawDrafts.map((draft) => ({
    id: String(draft?.id ?? ""),
    sourcePostId: String(draft?.sourcePostId ?? ""),
    channelId: String(draft?.channelId ?? ""),
    status: normalizeStatus(draft?.status),
    approved: Boolean(draft?.approved),
    applied: Boolean(draft?.applied),
    appliedAt: stringOrNull(draft?.appliedAt),
    applySummary: draft?.applySummary ?? null,
  }));
}

function getAppliedDraftId(post) {
  return (
    stringOrNull(post.lastDraftApply?.draftId) ??
    stringOrNull(post.applySummary?.draftId) ??
    stringOrNull(post.draftApplySummary?.draftId) ??
    null
  );
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

function compactText(value, limit) {
  const compact = String(value ?? "").replace(/\s+/g, " ").trim();
  return compact.length > limit ? `${compact.slice(0, limit - 1)}...` : compact;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function normalizeStatus(value) {
  return String(value ?? "").trim().toLowerCase() || "unknown";
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
