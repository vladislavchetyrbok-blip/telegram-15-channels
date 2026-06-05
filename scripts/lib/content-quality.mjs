import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");

const genericPhrases = [
  "what to check this week",
  "it is important to understand",
  "start with a simple check",
  "keep calculations",
  "short checklist",
  "conclusion:",
  "РЅР°С‡РЅРёС‚Рµ СЃ РїСЂРѕСЃС‚РѕР№ РїСЂРѕРІРµСЂРєРё",
  "РІР°Р¶РЅРѕ РїРѕРЅСЏС‚СЊ",
  "С‡С‚Рѕ СЃС‚РѕРёС‚ РїСЂРѕРІРµСЂРёС‚СЊ",
  "РєРѕСЂРѕС‚РєРёР№ С‡РµРє-Р»РёСЃС‚",
];

const serviceLabels = [
  "service_visual_label",
  "qualitystatus",
  "textstatus",
  "provider:",
  "fallbackprovider",
  "local_template",
  "premium_v2",
  "placeholder",
  "draft",
  "test post",
];

const markdownArtifacts = [
  "```",
  "# ",
  "## ",
  "[image]",
  "![",
  "<!--",
  "instruction:",
  "system:",
  "assistant:",
];

const forbiddenPhrases = [
  "guaranteed income",
  "easy money",
  "100% profit",
  "Р»РµРіРєРёС… РґРµРЅРµРі",
  "РіР°СЂР°РЅС‚РёСЂРѕРІР°РЅРЅС‹Р№ РґРѕС…РѕРґ",
];

export async function getContentQualityReport() {
  const analysis = await getContentQualityAnalysis();
  const { lastCheckedAt, warnings, errors, analyzed, channelQuality, repeatedProblems, summary } = analysis;
  const recommendations = buildRecommendations(summary, channelQuality, repeatedProblems);
  const reportWarnings = [
    ...warnings,
    ...(summary.missingImages > 0 ? [`${summary.missingImages} post(s) are missing image files or image paths.`] : []),
    ...(summary.needsRegeneration > 0 ? [`${summary.needsRegeneration} post(s) need regeneration or manual repair.`] : []),
  ];

  return {
    status: errors.length ? "error" : reportWarnings.length || summary.warning || summary.bad || summary.blocked ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    summary,
    channelQuality,
    problemPosts: analyzed
      .filter((post) => post.issues.length > 0 || ["warning", "bad", "blocked"].includes(post.status))
      .sort((left, right) => left.qualityScore - right.qualityScore || left.channel.localeCompare(right.channel))
      .slice(0, 80),
    repeatedProblems,
    recommendations,
    warnings: Array.from(new Set(reportWarnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt,
  };
}

export async function getContentQualityAnalysis() {
  const lastCheckedAt = new Date().toISOString();
  const warnings = [];
  const errors = [];
  const plan = readJson(path.join(runtimeDir, "weekly-content-plan.json"), { items: [] }, errors);
  const posts = Array.isArray(plan.items) ? plan.items : [];

  if (!Array.isArray(plan.items)) errors.push("weekly-content-plan.json does not contain an items array.");

  const channels = buildChannelMap(posts);
  const duplicateTopics = buildDuplicateTopicMap(posts);
  const repeatedImages = buildRepeatedImageMap(posts);
  const repeatedTemplates = buildRepeatedTemplateMap(posts);
  const analyzed = posts.map((post) => analyzePost(post, { channels, duplicateTopics, repeatedImages, repeatedTemplates }));
  const channelQuality = buildChannelQuality(channels, analyzed, duplicateTopics);
  const repeatedProblems = buildRepeatedProblems(analyzed);
  const summary = buildSummary(analyzed);

  return {
    lastCheckedAt,
    warnings,
    errors,
    posts,
    analyzed,
    summary,
    channelQuality,
    repeatedProblems,
  };
}

function analyzePost(post, context) {
  const title = stringOrNull(post.title) ?? stringOrNull(post.contentTopic) ?? "Untitled";
  const body = stringOrNull(post.body) ?? stringOrNull(post.text) ?? stringOrNull(post.excerpt) ?? stringOrNull(post.telegramCaption) ?? "";
  const fullText = [title, body].filter(Boolean).join("\n\n");
  const normalizedText = normalize(fullText);
  const channelId = stringOrNull(post.channelId) ?? "unknown";
  const channel = context.channels.get(channelId) ?? { id: channelId, name: channelId, language: null, category: null };
  const image = inspectImage(post);
  const issueDetails = [];
  let score = 100;

  score -= addIssue(issueDetails, !body.trim(), "empty_text", "Empty text.", 45, "blocked", "Regenerate the post text before publishing.");
  score -= addIssue(issueDetails, body.trim().length > 0 && body.trim().length < 450, "text_too_short", "Text is too short.", 22, "bad", "Expand the body with concrete details and a useful closing.");
  score -= addIssue(issueDetails, body.length > 1800, "text_too_long", "Text is too long.", 12, "warning", "Tighten the body for Telegram readability.");
  score -= addIssue(issueDetails, includesAny(normalizedText, genericPhrases), "generic_template_text", "Generic or template-like phrase detected.", 14, "warning", "Rewrite the repeated phrasing into a channel-specific angle.");
  score -= addIssue(issueDetails, includesAny(normalizedText, serviceLabels), "service_label", "Service label or internal marker detected.", 20, "bad", "Remove service labels and internal generation metadata.");
  score -= addIssue(issueDetails, includesAny(normalizedText, markdownArtifacts), "markdown_or_service_artifact", "Markdown or prompt artifact detected.", 14, "warning", "Clean formatting artifacts from the published caption.");
  score -= addIssue(issueDetails, includesAny(normalizedText, forbiddenPhrases) || getQualityReasons(post).some((reason) => reason.includes("forbidden")), "forbidden_phrase", "Forbidden or risky phrase detected.", 25, "blocked", "Remove risky claims and rerun the quality review.");
  score -= addIssue(issueDetails, hasWeakCta(body), "weak_cta", "Weak CTA.", 8, "warning", "Add a concrete reader action or decision criterion.");
  score -= addIssue(issueDetails, titleBodyMismatch(title, body), "title_body_mismatch", "Title and body have little overlap.", 10, "warning", "Align the body with the post title/topic.");
  score -= addIssue(issueDetails, context.duplicateTopics.get(topicKey(post)) > 1, "duplicate_topic", "Topic repeats in the same channel.", 10, "warning", "Vary the topic or combine similar drafts.");
  score -= addIssue(issueDetails, context.repeatedTemplates.get(templateKey(body)) > 2, "repeated_template", "Body template repeats across many posts.", 10, "warning", "Break the repeated structure with a fresh hook and examples.");
  score -= addIssue(issueDetails, tooSimilarToPrevious(post, context.repeatedTemplates), "too_similar_posts", "Post is too similar to other texts.", 8, "warning", "Refresh the framing so the post is distinct.");
  score -= addIssue(issueDetails, channelTopicMismatch(post, channel), "channel_topic_mismatch", "Topic may not fit the channel.", 12, "warning", "Check channel positioning or move the topic.");
  score -= addIssue(issueDetails, languageMismatch(post, channel), "language_mismatch", "Post language may not match the channel.", 12, "warning", "Regenerate in the channel language.");

  score -= addIssue(issueDetails, image.missingImage, "missing_image", "Image is missing.", 25, "bad", "Attach a valid image before publishing.");
  score -= addIssue(issueDetails, image.pathMissing, "image_path_missing", "Image path is missing.", 18, "bad", "Write a valid public or filesystem image path.");
  score -= addIssue(issueDetails, image.fileMissing, "image_file_missing", "Image file does not exist.", 22, "bad", "Regenerate or restore the image file.");
  score -= addIssue(issueDetails, image.tooSmall, "image_too_small", "Image file or metadata is too small.", 14, "warning", "Use a full-size Telegram-ready image.");
  score -= addIssue(issueDetails, image.placeholder, "placeholder_image", "Placeholder or simple image marker detected.", 16, "warning", "Replace placeholder visuals with a final asset.");
  score -= addIssue(issueDetails, context.repeatedImages.get(image.identity) > 2, "repeated_visual", "Image repeats across many posts.", 12, "warning", "Use a distinct visual for this post.");
  score -= addIssue(issueDetails, genericVisual(post), "generic_visual", "Visual metadata looks generic.", 8, "warning", "Make the visual more specific to the post.");
  score -= addIssue(issueDetails, visualChannelMismatch(post, channel), "visual_channel_mismatch", "Visual metadata may not fit the channel.", 8, "warning", "Check the image prompt/style against the channel topic.");

  const status = statusFromScore(Math.max(0, Math.min(100, score)), issueDetails);
  const readiness = readinessFromStatus(status, post);

  return {
    postId: stringOrNull(post.postId) ?? stringOrNull(post.id) ?? "unknown",
    channelId,
    channel: channel.name,
    title,
    topic: stringOrNull(post.contentTopic) ?? title,
    textLength: body.length,
    imagePath: image.displayPath,
    qualityScore: Math.max(0, Math.min(100, Math.round(score))),
    status,
    readyToPublish: readiness.readyToPublish,
    blockedByQuality: readiness.blockedByQuality,
    needsRegeneration: readiness.needsRegeneration,
    safeToPublish: readiness.safeToPublish,
    riskyToPublish: readiness.riskyToPublish,
    issues: issueDetails.map((issue) => issue.type),
    issueDetails,
    recommendation: buildPostRecommendation(issueDetails, status),
  };
}

function buildChannelMap(posts) {
  const channels = new Map();
  for (const post of posts) {
    const id = stringOrNull(post.channelId);
    if (!id || channels.has(id)) continue;
    channels.set(id, {
      id,
      name: stringOrNull(post.channelName) ?? id,
      language: stringOrNull(post.language),
      category: stringOrNull(post.channelCategory) ?? inferCategory(id),
    });
  }
  return channels;
}

function buildChannelQuality(channels, posts, duplicateTopics) {
  return Array.from(channels.values())
    .map((channel) => {
      const channelPosts = posts.filter((post) => post.channelId === channel.id);
      const weakPosts = channelPosts.filter((post) => ["warning", "bad", "blocked"].includes(post.status)).length;
      const missingImages = channelPosts.filter((post) => post.issues.some((issue) => issue.includes("image"))).length;
      const readyPosts = channelPosts.filter((post) => post.readyToPublish).length;
      const averageQualityScore = channelPosts.length ? Math.round(channelPosts.reduce((total, post) => total + post.qualityScore, 0) / channelPosts.length) : 0;
      const duplicateTopicsCount = Array.from(duplicateTopics.entries()).filter(([key, count]) => key.startsWith(`${channel.id}::`) && count > 1).length;

      return {
        channelId: channel.id,
        channelName: channel.name,
        totalPosts: channelPosts.length,
        readyPosts,
        weakPosts,
        missingImages,
        duplicateTopics: duplicateTopicsCount,
        averageQualityScore,
        status: statusFromAverage(averageQualityScore, weakPosts, channelPosts.length),
      };
    })
    .sort((left, right) => left.averageQualityScore - right.averageQualityScore || right.weakPosts - left.weakPosts || left.channelId.localeCompare(right.channelId));
}

function buildSummary(posts) {
  const counts = countBy(posts.map((post) => post.status));

  return {
    totalPosts: posts.length,
    excellent: counts.excellent ?? 0,
    good: counts.good ?? 0,
    warning: counts.warning ?? 0,
    bad: counts.bad ?? 0,
    blocked: counts.blocked ?? 0,
    goodPosts: (counts.excellent ?? 0) + (counts.good ?? 0),
    warningPosts: counts.warning ?? 0,
    badPosts: counts.bad ?? 0,
    blockedPosts: counts.blocked ?? 0,
    missingImages: posts.filter((post) => post.issues.some((issue) => issue.includes("image"))).length,
    needsRegeneration: posts.filter((post) => post.needsRegeneration).length,
    readyToPublish: posts.filter((post) => post.readyToPublish).length,
    blockedByQuality: posts.filter((post) => post.blockedByQuality).length,
    safeToPublish: posts.filter((post) => post.safeToPublish).length,
    riskyToPublish: posts.filter((post) => post.riskyToPublish).length,
  };
}

function buildRepeatedProblems(posts) {
  const grouped = new Map();
  for (const post of posts) {
    for (const issue of post.issueDetails) {
      if (!["generic_template_text", "repeated_template", "duplicate_topic", "repeated_visual", "service_label", "channel_topic_mismatch"].includes(issue.type)) continue;
      const current = grouped.get(issue.type) ?? { issueType: issue.type, count: 0, examples: [] };
      current.count += 1;
      if (current.examples.length < 5) current.examples.push(`${post.channelId}/${post.postId}`);
      grouped.set(issue.type, current);
    }
  }
  return Array.from(grouped.values()).sort((left, right) => right.count - left.count || left.issueType.localeCompare(right.issueType));
}

function buildRecommendations(summary, channelQuality, repeatedProblems) {
  const recommendations = [];
  const weakestChannel = channelQuality[0];

  if (summary.missingImages > 0) recommendations.push(`Fix missing or broken images first: ${summary.missingImages} post(s) are affected.`);
  if (summary.blockedByQuality > 0) recommendations.push(`Keep ${summary.blockedByQuality} blocked post(s) out of publishing until text/image issues are repaired.`);
  if (summary.needsRegeneration > 0) recommendations.push(`Regenerate or manually rewrite ${summary.needsRegeneration} post(s) with bad/blocked quality status.`);
  if (weakestChannel && weakestChannel.weakPosts > 0) recommendations.push(`Start channel cleanup with ${weakestChannel.channelName}: average score ${weakestChannel.averageQualityScore}.`);
  if (repeatedProblems.some((problem) => problem.issueType === "generic_template_text")) recommendations.push("Reduce repeated generic phrasing by varying hooks, examples, and closing actions.");
  if (!recommendations.length) recommendations.push("No urgent content quality action detected. Keep the current JSON publishing flow.");

  return recommendations;
}

function inspectImage(post) {
  const rawPath = stringOrNull(post.telegramImagePath) ?? stringOrNull(post.imagePath) ?? publicToFilePath(stringOrNull(post.imageUrl)) ?? publicToFilePath(stringOrNull(post.previewPath));
  const displayPath = stringOrNull(post.imageUrl) ?? stringOrNull(post.previewPath) ?? rawPath ?? "";
  const metadata = post.imageDimensions ?? post.visualMetadata ?? {};
  const width = Number(metadata.width ?? 0);
  const height = Number(metadata.height ?? 0);
  const fileExists = rawPath ? existsSync(rawPath) : false;
  const size = fileExists ? statSync(rawPath).size : 0;
  const identity = rawPath ?? displayPath ?? "missing";
  const lower = normalize([rawPath, displayPath, post.visualPreset, post.visualStyle, post.provider, post.source].filter(Boolean).join(" "));

  return {
    identity,
    displayPath,
    missingImage: !displayPath && !rawPath,
    pathMissing: !rawPath,
    fileMissing: Boolean(rawPath && !fileExists),
    tooSmall: Boolean((fileExists && size < 18000) || (width > 0 && height > 0 && (width < 800 || height < 800))),
    placeholder: lower.includes("placeholder") || lower.includes("clean-draft") || lower.endsWith(".svg"),
  };
}

function readinessFromStatus(status, post) {
  const postStatus = String(post.status ?? "").toLowerCase();
  const blockedByQuality = status === "blocked";
  const needsRegeneration = ["bad", "blocked"].includes(status);
  const safeToPublish = ["excellent", "good"].includes(status) && ["ready", "approved", "scheduled"].includes(postStatus);
  const readyToPublish = safeToPublish || (["excellent", "good", "warning"].includes(status) && ["ready", "approved"].includes(postStatus));

  return {
    readyToPublish,
    blockedByQuality,
    needsRegeneration,
    safeToPublish,
    riskyToPublish: ["warning", "bad", "blocked"].includes(status),
  };
}

function buildDuplicateTopicMap(posts) {
  const values = posts.map((post) => topicKey(post)).filter(Boolean);
  return countMap(values);
}

function buildRepeatedImageMap(posts) {
  return countMap(posts.map((post) => inspectImage(post).identity).filter((value) => value && value !== "missing"));
}

function buildRepeatedTemplateMap(posts) {
  return countMap(posts.map((post) => templateKey(stringOrNull(post.body) ?? stringOrNull(post.telegramCaption) ?? "")).filter(Boolean));
}

function addIssue(issues, condition, type, message, penalty, severity, recommendation) {
  if (!condition) return 0;
  issues.push({ type, message, severity, recommendation });
  return penalty;
}

function buildPostRecommendation(issues, status) {
  if (!issues.length) return "Ready for normal review.";
  const severe = issues.find((issue) => issue.severity === "blocked" || issue.severity === "bad") ?? issues[0];
  if (status === "blocked") return severe.recommendation;
  if (status === "bad") return severe.recommendation;
  return severe.recommendation;
}

function statusFromScore(score, issues) {
  if (issues.some((issue) => issue.severity === "blocked") || score < 45) return "blocked";
  if (issues.some((issue) => issue.severity === "bad") || score < 65) return "bad";
  if (score < 82 || issues.some((issue) => issue.severity === "warning")) return "warning";
  if (score < 94) return "good";
  return "excellent";
}

function statusFromAverage(score, weakPosts, totalPosts) {
  if (!totalPosts) return "warning";
  if (score < 55) return "blocked";
  if (score < 70) return "bad";
  if (weakPosts > totalPosts / 2 || score < 84) return "warning";
  if (score < 94) return "good";
  return "excellent";
}

function titleBodyMismatch(title, body) {
  const titleTokens = significantTokens(title);
  if (titleTokens.length < 2 || body.length < 120) return false;
  const bodyTokens = new Set(significantTokens(body));
  const overlap = titleTokens.filter((token) => bodyTokens.has(token)).length;
  return overlap / titleTokens.length < 0.25;
}

function channelTopicMismatch(post, channel) {
  const text = normalize([post.title, post.contentTopic, post.body].filter(Boolean).join(" "));
  const id = channel.id;
  const groups = {
    "ai-tech": ["ai", "technology", "neural", "РЅРµР№СЂРѕ", "С‚РµС…"],
    "money-opportunities": ["finance", "money", "uah", "usd", "eur", "РґРµРЅ", "С„РёРЅР°РЅСЃ"],
    "dnipro-city": ["dnipro", "РґРЅРµРї", "РґРЅС–РїСЂ", "city"],
    "auto-comfort": ["auto", "car", "Р°РІС‚Рѕ"],
  };
  const required = groups[id];
  return Boolean(required && !required.some((token) => text.includes(token)));
}

function visualChannelMismatch(post, channel) {
  const visual = normalize([post.visualStyle, post.visualPreset, post.visualMetadata?.visualStyle].filter(Boolean).join(" "));
  if (!visual) return false;
  if (channel.id.includes("real-estate") || channel.id === "land-houses") return !visual.includes("real") && !visual.includes("estate") && !visual.includes("РЅРµРґ");
  if (channel.id === "ai-tech") return !visual.includes("tech") && !visual.includes("ai");
  return false;
}

function languageMismatch(post, channel) {
  const expected = normalize(channel.language ?? "");
  const actual = normalize(post.language ?? "");
  if (!expected || !actual) return false;
  if (expected === "ru-ua") return !["ru", "ua", "ru-ua"].includes(actual);
  return expected !== actual;
}

function genericVisual(post) {
  const visual = normalize([post.visualStyle, post.visualPreset, post.provider, post.source].filter(Boolean).join(" "));
  return visual.includes("local_template") || visual.includes("clean-draft") || visual.includes("generic");
}

function tooSimilarToPrevious(post, repeatedTemplates) {
  const body = stringOrNull(post.body) ?? stringOrNull(post.telegramCaption) ?? "";
  const key = templateKey(body);
  return Boolean(key && repeatedTemplates.get(key) > 3);
}

function hasWeakCta(body) {
  if (!body.trim()) return false;
  const lower = normalize(body);
  const ctaMarkers = ["check", "compare", "save", "write", "open", "РїСЂРѕРІРµСЂ", "СЃСЂР°РІРЅ", "Р·Р°РїРёС€", "Р·Р±РµСЂРµР¶", "РїРѕСЂС–РІРЅ"];
  return !ctaMarkers.some((marker) => lower.includes(marker));
}

function topicKey(post) {
  return [stringOrNull(post.channelId), normalize(stringOrNull(post.contentTopic) ?? stringOrNull(post.title) ?? "")].filter(Boolean).join("::");
}

function templateKey(text) {
  const tokens = significantTokens(text).slice(0, 24);
  return tokens.length >= 8 ? tokens.join(" ") : "";
}

function significantTokens(value) {
  return normalize(value)
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3)
    .slice(0, 80);
}

function getQualityReasons(post) {
  return Array.isArray(post.qualityIssues) ? post.qualityIssues.map((item) => normalize(String(item))) : [];
}

function inferCategory(channelId) {
  if (channelId.includes("real-estate") || channelId === "land-houses") return "real estate";
  if (channelId.includes("money")) return "finance";
  if (channelId.includes("ai")) return "technology";
  return null;
}

function publicToFilePath(value) {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  return path.join(root, "public", value.replace(/^\/+/, ""));
}

function includesAny(value, needles) {
  return needles.some((needle) => value.includes(normalize(needle)));
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function countMap(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
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

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value : null;
}
