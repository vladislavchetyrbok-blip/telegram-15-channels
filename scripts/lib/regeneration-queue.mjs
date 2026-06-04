import { getContentQualityReport } from "./content-quality.mjs";

const textIssueTypes = new Set([
  "empty_text",
  "text_too_short",
  "text_too_long",
  "generic_template_text",
  "service_label",
  "markdown_or_service_artifact",
  "weak_cta",
  "title_body_mismatch",
  "duplicate_topic",
  "repeated_template",
  "too_similar_posts",
]);

const imageIssueTypes = new Set([
  "missing_image",
  "image_path_missing",
  "image_file_missing",
  "image_too_small",
  "placeholder_image",
  "repeated_visual",
  "generic_visual",
  "visual_channel_mismatch",
]);

const manualReviewIssueTypes = new Set([
  "forbidden_phrase",
  "channel_topic_mismatch",
  "language_mismatch",
]);

export async function getRegenerationQueueReport() {
  const qualityReport = await getContentQualityReport();
  const problemPosts = Array.isArray(qualityReport.problemPosts) ? qualityReport.problemPosts : [];
  const queue = problemPosts
    .filter((post) => post.needsRegeneration || post.blockedByQuality || ["bad", "blocked"].includes(post.status))
    .map(buildQueueItem)
    .sort(sortQueueItems);
  const channelBreakdown = buildChannelBreakdown(qualityReport.channelQuality ?? [], problemPosts, queue);
  const summary = buildSummary(qualityReport.summary?.totalPosts ?? 0, queue);
  const warnings = Array.from(new Set(qualityReport.warnings ?? []));
  const errors = Array.from(new Set(qualityReport.errors ?? []));

  return {
    status: errors.length ? "error" : warnings.length || queue.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    summary,
    queue,
    channelBreakdown,
    warnings,
    errors,
    lastCheckedAt: new Date().toISOString(),
  };
}

function buildQueueItem(post) {
  const issueTypes = Array.isArray(post.issues) ? post.issues : [];
  const issueDetails = Array.isArray(post.issueDetails) ? post.issueDetails : [];
  const regenerationType = inferRegenerationType(issueTypes);
  const priority = inferPriority(post, issueDetails, regenerationType);
  const primaryIssue = issueDetails.find((issue) => ["blocked", "bad"].includes(issue.severity)) ?? issueDetails[0];

  return {
    postId: post.postId,
    channelId: post.channelId,
    channel: post.channel,
    title: post.title,
    topic: post.topic,
    qualityScore: post.qualityScore,
    status: post.status,
    issues: issueTypes,
    regenerationType,
    priority,
    reason: primaryIssue?.message ?? `Content quality status is ${post.status}.`,
    recommendation: primaryIssue?.recommendation ?? post.recommendation ?? "Review the post before publishing.",
  };
}

function inferRegenerationType(issueTypes) {
  if (issueTypes.some((issue) => manualReviewIssueTypes.has(issue))) return "manual_review";

  const hasTextIssue = issueTypes.some((issue) => textIssueTypes.has(issue));
  const hasImageIssue = issueTypes.some((issue) => imageIssueTypes.has(issue));

  if (hasTextIssue && hasImageIssue) return "both";
  if (hasTextIssue) return "text";
  if (hasImageIssue) return "image";
  return "manual_review";
}

function inferPriority(post, issueDetails, regenerationType) {
  if (
    post.status === "blocked" ||
    post.blockedByQuality ||
    post.qualityScore < 45 ||
    regenerationType === "manual_review" ||
    issueDetails.some((issue) => issue.severity === "blocked")
  ) {
    return "high";
  }

  if (post.status === "bad" || post.qualityScore < 65 || issueDetails.some((issue) => issue.severity === "bad")) {
    return "medium";
  }

  return "low";
}

function buildSummary(totalPosts, queue) {
  return {
    totalPosts,
    needsRegeneration: queue.length,
    textOnly: queue.filter((post) => post.regenerationType === "text").length,
    imageOnly: queue.filter((post) => post.regenerationType === "image").length,
    both: queue.filter((post) => post.regenerationType === "both").length,
    manualReview: queue.filter((post) => post.regenerationType === "manual_review").length,
    highPriority: queue.filter((post) => post.priority === "high").length,
  };
}

function buildChannelBreakdown(channelQuality, problemPosts, queue) {
  const channels = new Map();

  for (const channel of channelQuality) {
    channels.set(channel.channelId, {
      channelId: channel.channelId,
      channelName: channel.channelName,
      totalPosts: channel.totalPosts,
      weakPosts: channel.weakPosts,
      textIssues: 0,
      imageIssues: 0,
      highPriorityCount: 0,
    });
  }

  for (const post of problemPosts) {
    const row = ensureChannelRow(channels, post);
    const issues = Array.isArray(post.issues) ? post.issues : [];
    if (issues.some((issue) => textIssueTypes.has(issue) || manualReviewIssueTypes.has(issue))) row.textIssues += 1;
    if (issues.some((issue) => imageIssueTypes.has(issue))) row.imageIssues += 1;
  }

  for (const post of queue) {
    const row = ensureChannelRow(channels, post);
    if (post.priority === "high") row.highPriorityCount += 1;
  }

  return Array.from(channels.values())
    .filter((channel) => channel.weakPosts > 0 || channel.textIssues > 0 || channel.imageIssues > 0 || channel.highPriorityCount > 0)
    .sort((left, right) => right.highPriorityCount - left.highPriorityCount || right.weakPosts - left.weakPosts || right.textIssues + right.imageIssues - (left.textIssues + left.imageIssues) || left.channelId.localeCompare(right.channelId));
}

function ensureChannelRow(channels, post) {
  const channelId = post.channelId ?? "unknown";
  if (!channels.has(channelId)) {
    channels.set(channelId, {
      channelId,
      channelName: post.channel ?? channelId,
      totalPosts: 0,
      weakPosts: 0,
      textIssues: 0,
      imageIssues: 0,
      highPriorityCount: 0,
    });
  }
  return channels.get(channelId);
}

function sortQueueItems(left, right) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return (
    priorityOrder[left.priority] - priorityOrder[right.priority] ||
    left.qualityScore - right.qualityScore ||
    left.channelId.localeCompare(right.channelId) ||
    left.postId.localeCompare(right.postId)
  );
}
