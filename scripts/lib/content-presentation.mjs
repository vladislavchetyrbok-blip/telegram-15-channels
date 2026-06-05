import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");

export const lengthBuckets = {
  short: { minWords: 50, maxWords: 120, label: "short insight / thought / news angle" },
  medium: { minWords: 120, maxWords: 300, label: "useful Telegram post" },
  long: { minWords: 300, maxWords: 700, label: "mini breakdown" },
  deep: { minWords: 700, maxWords: 1200, label: "expert deep dive, rare" },
};

export const contentTemplates = [
  "short_insight",
  "practical_checklist",
  "expert_breakdown",
  "quick_news_angle",
  "opinion_takeaway",
  "comparison",
  "mistakes_to_avoid",
  "trend_explainer",
  "mini_case",
  "tools_list",
];

export const visualModes = [
  "single_image",
  "double_image",
  "triple_image",
  "no_image_rare",
  "cover_card",
  "editorial_visual",
  "carousel_ready",
];

export const typographyModes = ["clean_html", "editorial_html", "compact_bullets", "analysis_html"];

export const richTextConfig = {
  flagName: "ENABLE_TELEGRAM_RICH_TEXT",
  enabledForRealSend: process.env.ENABLE_TELEGRAM_RICH_TEXT === "true",
  defaultValue: false,
  previewOnly: process.env.ENABLE_TELEGRAM_RICH_TEXT !== "true",
};

export const channelPresentationProfiles = {
  "ai-tech": {
    lengthMix: { short: 25, medium: 45, long: 25, deep: 5 },
    allowedTemplates: ["short_insight", "practical_checklist", "expert_breakdown", "quick_news_angle", "comparison", "trend_explainer", "tools_list"],
    visualStyles: ["premium clean tech", "editorial", "glassmorphism", "real devices", "interfaces", "futuristic but not cheap"],
    imageCountDistribution: { single_image: 35, double_image: 18, triple_image: 7, cover_card: 15, editorial_visual: 20, carousel_ready: 5 },
    tone: "calm expert, practical, no hype",
    formattingDensity: "medium",
    badPatterns: ["generic abstract networks", "empty blue backgrounds", "random neon shapes", "AI hype without a task"],
  },
  "money-opportunities": {
    lengthMix: { short: 20, medium: 50, long: 25, deep: 5 },
    allowedTemplates: ["practical_checklist", "comparison", "mistakes_to_avoid", "mini_case", "opinion_takeaway", "trend_explainer"],
    visualStyles: ["premium finance dashboard", "editorial money context", "documents and calculators", "restrained teal/gold accents"],
    imageCountDistribution: { single_image: 38, double_image: 20, triple_image: 5, cover_card: 18, editorial_visual: 16, carousel_ready: 3 },
    tone: "practical and risk-aware",
    formattingDensity: "medium",
    badPatterns: ["easy money promises", "cash pile cliches", "guaranteed income", "template finance advice"],
  },
  "dnipro-city": {
    lengthMix: { short: 30, medium: 45, long: 20, deep: 5 },
    allowedTemplates: ["quick_news_angle", "mini_case", "practical_checklist", "opinion_takeaway", "trend_explainer"],
    visualStyles: ["local editorial city photo", "street-level detail", "clean city guide", "human-scale urban context"],
    imageCountDistribution: { single_image: 35, double_image: 25, triple_image: 10, cover_card: 8, editorial_visual: 20, carousel_ready: 2 },
    tone: "local, useful, observant",
    formattingDensity: "light",
    badPatterns: ["generic skyline", "tourist brochure wording", "empty city gradients", "non-local examples"],
  },
  "auto-comfort": {
    lengthMix: { short: 25, medium: 45, long: 25, deep: 5 },
    allowedTemplates: ["practical_checklist", "comparison", "mistakes_to_avoid", "tools_list", "mini_case"],
    visualStyles: ["premium garage", "detail shots", "real interiors", "clean product comparison"],
    imageCountDistribution: { single_image: 36, double_image: 24, triple_image: 10, cover_card: 10, editorial_visual: 16, carousel_ready: 4 },
    tone: "practical, precise, buyer-aware",
    formattingDensity: "medium",
    badPatterns: ["generic sports car wallpaper", "random road at night", "over-shiny showroom cliches"],
  },
  "fishing-rest": {
    lengthMix: { short: 30, medium: 45, long: 20, deep: 5 },
    allowedTemplates: ["short_insight", "practical_checklist", "mistakes_to_avoid", "mini_case", "tools_list"],
    visualStyles: ["natural editorial", "real gear", "weather and water detail", "calm outdoor composition"],
    imageCountDistribution: { single_image: 40, double_image: 22, triple_image: 8, cover_card: 8, editorial_visual: 18, carousel_ready: 4 },
    tone: "calm, experienced, grounded",
    formattingDensity: "light",
    badPatterns: ["cartoon fish", "generic lake sunset only", "survivalist exaggeration", "empty gear collage"],
  },
  "mens-style": {
    lengthMix: { short: 25, medium: 45, long: 25, deep: 5 },
    allowedTemplates: ["comparison", "mistakes_to_avoid", "practical_checklist", "opinion_takeaway", "mini_case"],
    visualStyles: ["editorial menswear", "texture detail", "quiet premium", "real outfits and accessories"],
    imageCountDistribution: { single_image: 34, double_image: 24, triple_image: 8, cover_card: 12, editorial_visual: 18, carousel_ready: 4 },
    tone: "confident, restrained, specific",
    formattingDensity: "medium",
    badPatterns: ["luxury flex", "random watch macro", "black-gold cliches", "generic alpha advice"],
  },
};

const fallbackProfile = {
  lengthMix: { short: 25, medium: 50, long: 20, deep: 5 },
  allowedTemplates: contentTemplates,
  visualStyles: ["editorial", "premium clean", "real object detail"],
  imageCountDistribution: { single_image: 40, double_image: 18, triple_image: 6, cover_card: 12, editorial_visual: 20, carousel_ready: 4 },
  tone: "useful, concrete, editorial",
  formattingDensity: "medium",
  badPatterns: ["generic stock visual", "repeated template", "empty abstract background"],
};

const genericTextFragments = [
  "что стоит проверить на этой неделе",
  "важно понять условия",
  "начните с простой проверки",
  "короткий чек-лист",
  "такой подход не делает решение идеальным",
  "it is important to understand",
  "short checklist",
  "what to check this week",
];

const weakHeadlineFragments = [
  "что стоит проверить",
  "на этой неделе",
  "полезно знать",
  "важно понять",
  "quick tips",
];

const genericVisualFragments = [
  "local_template",
  "template",
  "placeholder",
  "clean-draft",
  "generic",
  "abstract network",
  "empty blue",
  "random neon",
];

export async function getContentPresentationReport({ sampleLimit = 5 } = {}) {
  const analysis = await getContentPresentationAnalysis({ sampleLimit });
  const { errors, warnings, analyzed, summary, samples, recommendations, lastCheckedAt } = analysis;

  return {
    status: errors.length ? "error" : warnings.length || summary.weakPresentationPosts > 0 ? "warning" : "ok",
    checkedPosts: analyzed.length,
    productionStoreMode: "json",
    sourceOfTruth: "json",
    richText: richTextConfig,
    lengthBuckets,
    contentTemplates,
    visualModes,
    channelProfiles: Object.fromEntries(Object.entries(channelPresentationProfiles).map(([key, profile]) => [key, {
      lengthMix: profile.lengthMix,
      allowedTemplates: profile.allowedTemplates,
      visualStyles: profile.visualStyles,
      imageCountDistribution: profile.imageCountDistribution,
      tone: profile.tone,
      formattingDensity: profile.formattingDensity,
      badPatterns: profile.badPatterns,
    }])),
    summary,
    issues: buildIssueSummary(analyzed),
    recommendations,
    sampleImprovedPosts: samples,
    lastCheckedAt,
  };
}

export async function getContentPresentationPreview({ sampleLimit = 5 } = {}) {
  const analysis = await getContentPresentationAnalysis({ sampleLimit });
  const issues = buildIssueSummary(analysis.analyzed).slice(0, 20);

  return {
    status: analysis.errors.length ? "error" : analysis.warnings.length || issues.length ? "warning" : "ok",
    checkedPosts: analysis.analyzed.length,
    richText: richTextConfig,
    samples: analysis.samples,
    issues,
    recommendations: analysis.recommendations,
    lastCheckedAt: analysis.lastCheckedAt,
  };
}

export async function getContentPresentationAnalysis({ sampleLimit = 5 } = {}) {
  const lastCheckedAt = new Date().toISOString();
  const errors = [];
  const warnings = [];
  const plan = readJson(path.join(runtimeDir, "weekly-content-plan.json"), { items: [] }, errors);
  const posts = Array.isArray(plan.items) ? plan.items : [];

  if (!Array.isArray(plan.items)) errors.push("weekly-content-plan.json does not contain an items array.");

  const templateCounts = countMap(posts.map((post) => structureSignature(getPostBody(post))).filter(Boolean));
  const recentStructureCounts = countRecentStructures(posts);
  const analyzed = posts.map((post) => analyzePresentationPost(post, { templateCounts, recentStructureCounts }));
  const samples = analyzed
    .filter((post) => !post.isPublished)
    .sort((left, right) => left.qualityScore - right.qualityScore || String(left.scheduledAt).localeCompare(String(right.scheduledAt)))
    .slice(0, Math.max(3, Math.min(sampleLimit, 5)));
  const summary = buildSummary(analyzed);
  const recommendations = buildRecommendations(analyzed, summary);

  if (!posts.length) warnings.push("No posts were found in data/runtime/weekly-content-plan.json.");
  if (summary.realRichTextSendEnabled) warnings.push("ENABLE_TELEGRAM_RICH_TEXT=true; real send behavior may use rich text outside this preview layer.");

  return { lastCheckedAt, errors, warnings, posts, analyzed, samples, summary, recommendations };
}

export function analyzePresentationPost(post, context = {}) {
  const postId = stringOrFallback(post.postId ?? post.id, "unknown");
  const channelId = stringOrFallback(post.channelId, "unknown");
  const profile = channelPresentationProfiles[channelId] ?? fallbackProfile;
  const title = stringOrFallback(post.title ?? post.contentTopic, "Untitled");
  const body = getPostBody(post);
  const fullText = [title, body].filter(Boolean).join("\n\n");
  const estimatedWordCount = countWords(fullText);
  const lengthBucket = selectLengthBucket(estimatedWordCount, post, profile);
  const contentTemplate = selectTemplate(post, lengthBucket, profile);
  const visualMode = selectVisualMode(post, lengthBucket, contentTemplate, profile);
  const typographyMode = selectTypographyMode(lengthBucket, profile, body);
  const presentation = { lengthBucket, contentTemplate, visualMode, typographyMode, estimatedWordCount };
  const formatted = buildTelegramPresentationPreview({ title, body, presentation });
  const flags = evaluateQualityFlags(post, formatted, presentation, {
    templateCount: context.templateCounts?.get(structureSignature(body)) ?? 0,
    recentStructureCount: context.recentStructureCounts?.get(recentStructureKey(post, presentation)) ?? 0,
  });
  const qualityScore = Math.max(0, Math.min(100, 100 - flags.reduce((total, flag) => total + flag.penalty, 0)));
  const issues = flags.map((flag) => flag.type);
  const recommendations = buildPostRecommendations(flags, profile);
  const isPublished = ["published", "sent"].includes(String(post.status ?? "").toLowerCase());

  return {
    postId,
    channelId,
    channelName: stringOrFallback(post.channelName, channelId),
    status: stringOrFallback(post.status, "unknown"),
    isPublished,
    scheduledAt: post.scheduledAt ?? null,
    title,
    originalTextSummary: summarizeText(body),
    lengthBucket,
    contentTemplate,
    visualMode,
    typographyMode,
    estimatedWordCount,
    reason: buildSelectionReason({ estimatedWordCount, lengthBucket, contentTemplate, visualMode, typographyMode, profile }),
    qualityScore,
    issues,
    qualityFlags: flags.map(({ type, severity, message }) => ({ type, severity, message })),
    recommendations,
    formattedPreview: formatted.telegramHtml,
    formattedText: formatted.plainText,
    telegramHtml: formatted.telegramHtml,
    visualGuidance: {
      mode: visualMode,
      preferredStyles: profile.visualStyles,
      avoid: profile.badPatterns,
      imageCount: visualModeToImageCount(visualMode),
    },
    presentationPreviewOnly: true,
    realSendChanged: false,
  };
}

function buildTelegramPresentationPreview({ title, body, presentation }) {
  const cleanTitle = normalizeWhitespace(title);
  const cleanBody = normalizeBody(body);
  const paragraphs = cleanBody.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const firstParagraph = paragraphs[0] ?? cleanBody;
  const sentences = splitSentences(cleanBody);
  const bulletSource = pickBulletSource(sentences, paragraphs, presentation.contentTemplate);
  const conclusion = pickConclusion(sentences, paragraphs);
  const titleLine = `<b>${escapeTelegramHtml(cleanTitle)}</b>`;
  const intro = escapeTelegramHtml(truncateAtWord(firstParagraph, presentation.lengthBucket === "short" ? 220 : 320));
  const bulletMarker = markerForTemplate(presentation.contentTemplate);
  const bulletLines = bulletSource.slice(0, presentation.lengthBucket === "short" ? 3 : 5).map((item, index) => `${index === 0 && bulletMarker === "✓" ? "✓" : bulletMarker} ${escapeTelegramHtml(truncateAtWord(cleanBullet(item), 190))}`);
  const conclusionText = conclusion ? `<b>Вывод:</b> ${escapeTelegramHtml(truncateAtWord(conclusion, 240))}` : "";
  const plainText = [cleanTitle, firstParagraph, ...bulletLines.map((line) => stripHtml(line)), conclusion ? `Вывод: ${conclusion}` : ""]
    .filter(Boolean)
    .join("\n\n");

  return {
    plainText,
    telegramHtml: [titleLine, intro, bulletLines.join("\n"), conclusionText].filter(Boolean).join("\n\n"),
  };
}

function evaluateQualityFlags(post, formatted, presentation, context) {
  const title = stringOrFallback(post.title ?? post.contentTopic, "");
  const body = getPostBody(post);
  const original = [title, body, post.telegramCaption].filter(Boolean).join("\n\n");
  const normalized = normalize(original);
  const flags = [];
  const dashBullets = countDashBullets(original);
  const paragraphs = body.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const boldRatio = getBoldCharacterRatio(post.telegramCaption ?? formatted.telegramHtml);
  const image = inspectImage(post);

  addFlag(flags, includesAny(normalized, genericTextFragments), "tooGenericText", "Text contains repeated generic editorial phrases.", "warning", 14);
  addFlag(flags, paragraphs.some((paragraph) => paragraph.length > 850) || body.length > 2400, "wallOfText", "Text has long dense paragraphs.", "warning", 10);
  addFlag(flags, dashBullets >= 2, "tooManyDashBullets", "Dash bullets should be replaced with Telegram-friendly markers.", "warning", 8);
  addFlag(flags, !/<b>[^<]+<\/b>/.test(String(post.telegramCaption ?? "")), "noBoldAccents", "Original caption has no bold hierarchy.", "warning", 8);
  addFlag(flags, boldRatio > 0.45, "tooMuchBold", "Bold formatting is too dense.", "warning", 8);
  addFlag(flags, isWeakHeadline(title), "weakHeadline", "Headline reads generic or underspecified.", "warning", 10);
  addFlag(flags, (context.templateCount ?? 0) > 2, "repetitiveTemplate", "Structure repeats across multiple posts.", "warning", 10);
  addFlag(flags, presentation.visualMode === "single_image" && image.placeholder, "weakVisualMode", "Visual mode is too basic for a placeholder-like image.", "warning", 8);
  addFlag(flags, image.genericRisk, "genericVisualRisk", "Visual metadata looks generic or template-driven.", "warning", 10);
  addFlag(flags, !hasContentHierarchy(body, post.telegramCaption), "missingContentHierarchy", "Text lacks clear hierarchy, bullets, or conclusion.", "warning", 10);
  addFlag(flags, (context.recentStructureCount ?? 0) > 2, "tooSimilarToRecentStructure", "Recent posts use a similar bucket/template structure.", "warning", 8);

  return flags;
}

function selectLengthBucket(estimatedWordCount, post, profile) {
  if (estimatedWordCount <= lengthBuckets.short.maxWords) return "short";
  if (estimatedWordCount <= lengthBuckets.medium.maxWords) return "medium";
  if (estimatedWordCount <= lengthBuckets.long.maxWords) return "long";
  if (estimatedWordCount <= lengthBuckets.deep.maxWords) return "deep";

  const selected = weightedPick(profile.lengthMix, stableHash(`${post.postId ?? post.id}:length`));
  return selected === "deep" ? "deep" : "long";
}

function selectTemplate(post, lengthBucket, profile) {
  const text = normalize([post.title, post.contentTopic, getPostBody(post)].filter(Boolean).join(" "));
  const allowed = profile.allowedTemplates?.length ? profile.allowedTemplates : contentTemplates;

  if (includesAny(text, ["сравн", "vs", "отличить", "compare"]) && allowed.includes("comparison")) return "comparison";
  if (includesAny(text, ["ошиб", "не стоит", "avoid", "risk"]) && allowed.includes("mistakes_to_avoid")) return "mistakes_to_avoid";
  if (includesAny(text, ["инструмент", "tool", "сервис", "снасти"]) && allowed.includes("tools_list")) return "tools_list";
  if (lengthBucket === "short" && allowed.includes("short_insight")) return "short_insight";
  if (lengthBucket === "deep" && allowed.includes("expert_breakdown")) return "expert_breakdown";

  return allowed[stableHash(`${post.postId ?? post.id}:template`) % allowed.length] ?? "practical_checklist";
}

function selectVisualMode(post, lengthBucket, contentTemplate, profile) {
  if (lengthBucket === "deep") return "carousel_ready";
  if (contentTemplate === "comparison") return stableHash(`${post.postId}:visual-comparison`) % 2 === 0 ? "double_image" : "cover_card";
  if (contentTemplate === "tools_list") return "triple_image";
  if (contentTemplate === "quick_news_angle") return "editorial_visual";
  if (stableHash(`${post.postId}:no-image`) % 97 === 0) return "no_image_rare";

  return weightedPick(profile.imageCountDistribution, stableHash(`${post.postId ?? post.id}:visual`));
}

function selectTypographyMode(lengthBucket, profile, body) {
  if (lengthBucket === "deep" || body.length > 2200) return "analysis_html";
  if (profile.formattingDensity === "light") return "clean_html";
  if (countWords(body) < 140) return "compact_bullets";
  return "editorial_html";
}

function buildSelectionReason({ estimatedWordCount, lengthBucket, contentTemplate, visualMode, typographyMode, profile }) {
  return `Selected ${lengthBucket} from ${estimatedWordCount} estimated words; template ${contentTemplate} matches profile tone "${profile.tone}"; visual mode ${visualMode} follows channel image distribution; typography ${typographyMode} keeps hierarchy without changing real send.`;
}

function buildSummary(posts) {
  const flagCounts = countBy(posts.flatMap((post) => post.issues));
  const weakPresentationPosts = posts.filter((post) => post.qualityScore < 82 || post.issues.length > 0).length;

  return {
    totalPosts: posts.length,
    unpublishedPosts: posts.filter((post) => !post.isPublished).length,
    weakPresentationPosts,
    demoAutogenRiskPosts: posts.filter((post) => post.issues.some((issue) => ["tooGenericText", "genericVisualRisk", "repetitiveTemplate", "tooSimilarToRecentStructure"].includes(issue))).length,
    withoutHierarchyOrBold: posts.filter((post) => post.issues.includes("missingContentHierarchy") || post.issues.includes("noBoldAccents")).length,
    dashBulletPosts: posts.filter((post) => post.issues.includes("tooManyDashBullets")).length,
    averageQualityScore: posts.length ? Math.round(posts.reduce((total, post) => total + post.qualityScore, 0) / posts.length) : 0,
    byLengthBucket: countBy(posts.map((post) => post.lengthBucket)),
    byTemplate: countBy(posts.map((post) => post.contentTemplate)),
    byVisualMode: countBy(posts.map((post) => post.visualMode)),
    byTypographyMode: countBy(posts.map((post) => post.typographyMode)),
    qualityFlags: flagCounts,
    realRichTextSendEnabled: richTextConfig.enabledForRealSend,
    previewOnly: richTextConfig.previewOnly,
  };
}

function buildIssueSummary(posts) {
  const grouped = new Map();
  for (const post of posts) {
    for (const flag of post.qualityFlags) {
      const current = grouped.get(flag.type) ?? { type: flag.type, severity: flag.severity, count: 0, examples: [], message: flag.message };
      current.count += 1;
      if (current.examples.length < 5) current.examples.push(`${post.channelId}/${post.postId}`);
      grouped.set(flag.type, current);
    }
  }

  return Array.from(grouped.values()).sort((left, right) => right.count - left.count || left.type.localeCompare(right.type));
}

function buildRecommendations(posts, summary) {
  const recommendations = [];
  if (summary.demoAutogenRiskPosts > 0) recommendations.push(`Review ${summary.demoAutogenRiskPosts} post(s) with demo/autogen presentation risk before any real publishing.`);
  if (summary.dashBulletPosts > 0) recommendations.push(`Replace dash bullets in ${summary.dashBulletPosts} post(s) with Telegram typography markers in the next rewrite pass.`);
  if (summary.withoutHierarchyOrBold > 0) recommendations.push(`Add headline/conclusion hierarchy for ${summary.withoutHierarchyOrBold} post(s) in preview or regeneration.`);
  if (posts.some((post) => post.visualMode === "double_image" || post.visualMode === "triple_image")) recommendations.push("Prepare album-capable metadata next; this v1 only marks 1/2/3-image intent and does not send albums.");
  recommendations.push("Keep real Telegram sending unchanged until rich text and multi-image behavior pass a separate controlled test.");
  return recommendations;
}

function buildPostRecommendations(flags, profile) {
  const recommendations = flags.map((flag) => recommendationForFlag(flag.type));
  if (flags.some((flag) => flag.type === "genericVisualRisk" || flag.type === "weakVisualMode")) {
    recommendations.push(`Use profile visual cues: ${profile.visualStyles.slice(0, 3).join(", ")}; avoid ${profile.badPatterns.slice(0, 2).join(", ")}.`);
  }
  return Array.from(new Set(recommendations)).slice(0, 5);
}

function recommendationForFlag(type) {
  const map = {
    tooGenericText: "Replace generic framing with a channel-specific hook, concrete example, and sharper takeaway.",
    wallOfText: "Split the post into short paragraphs with one compact bullet block.",
    tooManyDashBullets: "Use bullet markers such as •, ◦, ✓, or → in the preview typography layer.",
    noBoldAccents: "Add bold only to the headline and final takeaway.",
    tooMuchBold: "Reduce bold spans to headline and one or two accents.",
    weakHeadline: "Rewrite the headline around a specific decision, mistake, comparison, or result.",
    repetitiveTemplate: "Rotate template structure and vary the opening paragraph.",
    weakVisualMode: "Use cover_card or editorial_visual metadata before publishing.",
    genericVisualRisk: "Replace generic visual style with a channel-specific editorial prompt.",
    missingContentHierarchy: "Add a clear intro, bullets, and concise conclusion.",
    tooSimilarToRecentStructure: "Choose a different content template from recent posts in this channel.",
  };
  return map[type] ?? "Review presentation before publishing.";
}

function countRecentStructures(posts) {
  const sorted = [...posts].sort((left, right) => String(left.scheduledAt ?? "").localeCompare(String(right.scheduledAt ?? "")));
  const counts = new Map();
  const recentByChannel = new Map();

  for (const post of sorted) {
    const channelId = stringOrFallback(post.channelId, "unknown");
    const recent = recentByChannel.get(channelId) ?? [];
    const pseudo = {
      lengthBucket: selectLengthBucket(countWords([post.title, getPostBody(post)].filter(Boolean).join(" ")), post, channelPresentationProfiles[channelId] ?? fallbackProfile),
      contentTemplate: selectTemplate(post, "medium", channelPresentationProfiles[channelId] ?? fallbackProfile),
    };
    const key = recentStructureKey(post, pseudo);
    counts.set(key, recent.filter((item) => item === key).length + 1);
    recent.push(key);
    recentByChannel.set(channelId, recent.slice(-5));
  }

  return counts;
}

function recentStructureKey(post, presentation) {
  return [post.channelId ?? "unknown", presentation.lengthBucket, presentation.contentTemplate].join("::");
}

function inspectImage(post) {
  const rawPath = stringOrNull(post.telegramImagePath) ?? stringOrNull(post.imagePath) ?? publicToFilePath(stringOrNull(post.imageUrl)) ?? publicToFilePath(stringOrNull(post.previewPath));
  const displayPath = stringOrNull(post.imageUrl) ?? stringOrNull(post.previewPath) ?? rawPath ?? "";
  const lower = normalize([rawPath, displayPath, post.visualStyle, post.visualPreset, post.visualVersion, post.provider, post.source, post.visualMetadata?.provider, post.visualMetadata?.source].filter(Boolean).join(" "));
  const fileExists = rawPath ? existsSync(rawPath) : false;
  const size = fileExists ? statSync(rawPath).size : 0;

  return {
    displayPath,
    placeholder: lower.includes("placeholder") || lower.includes("clean-draft") || lower.endsWith(".svg") || (fileExists && size < 18000),
    genericRisk: !displayPath || includesAny(lower, genericVisualFragments),
  };
}

function hasContentHierarchy(body, caption) {
  const combined = String(caption ?? body ?? "");
  return /<b>[^<]+<\/b>/.test(combined) || countDashBullets(combined) > 0 || /(^|\n)[•◦✓→]/.test(combined) || /вывод|итог|важно|checklist|чек-лист/i.test(combined);
}

function isWeakHeadline(title) {
  const normalized = normalize(title);
  return countWords(title) < 3 || includesAny(normalized, weakHeadlineFragments);
}

function getBoldCharacterRatio(value) {
  const text = String(value ?? "");
  const boldMatches = [...text.matchAll(/<b>(.*?)<\/b>/gs)].map((match) => match[1] ?? "");
  const boldLength = boldMatches.join("").length;
  const plainLength = stripHtml(text).length;
  return plainLength ? boldLength / plainLength : 0;
}

function countDashBullets(value) {
  return String(value ?? "").split(/\n/).filter((line) => /^\s*-\s+\S+/.test(line)).length;
}

function addFlag(flags, condition, type, message, severity, penalty) {
  if (!condition) return;
  flags.push({ type, message, severity, penalty });
}

function getPostBody(post) {
  return stringOrFallback(post.body ?? post.text ?? post.excerpt ?? post.telegramCaption, "");
}

function summarizeText(value) {
  return truncateAtWord(stripHtml(normalizeBody(value)).replace(/\n+/g, " "), 260);
}

function normalizeBody(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function splitSentences(value) {
  return normalizeBody(value)
    .split(/(?<=[.!?…。！？])\s+|\n+/u)
    .map((item) => item.trim())
    .filter((item) => item.length > 24)
    .slice(0, 10);
}

function pickBulletSource(sentences, paragraphs, template) {
  const preferred = sentences.slice(1, 6).map(cleanBullet);
  if (template === "comparison") return preferred.map((item, index) => index % 2 === 0 ? `Вариант: ${item}` : `Проверка: ${item}`);
  if (template === "mistakes_to_avoid") return preferred.map((item) => `Не терять из вида: ${item}`);
  if (template === "tools_list") return preferred.map((item) => `Инструмент: ${item}`);
  return preferred.length ? preferred : paragraphs.slice(1, 5);
}

function pickConclusion(sentences, paragraphs) {
  const candidates = [...sentences.slice(-2), ...paragraphs.slice(-1)];
  return candidates.find((item) => item.length > 40) ?? "";
}

function markerForTemplate(template) {
  if (template === "mistakes_to_avoid") return "✓";
  if (template === "comparison") return "→";
  if (template === "expert_breakdown") return "◦";
  return "•";
}

function cleanBullet(value) {
  return String(value ?? "").replace(/^\s*[-•◦✓→]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();
}

function truncateAtWord(value, maxLength) {
  const clean = normalizeWhitespace(value);
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, Math.max(0, maxLength - 3));
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 60 ? lastSpace : sliced.length).trim()}...`;
}

function structureSignature(value) {
  const text = normalize(stripHtml(value));
  const tokens = text.replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/).filter((token) => token.length > 3).slice(0, 28);
  return tokens.length >= 8 ? tokens.join(" ") : "";
}

function countWords(value) {
  return String(value ?? "").match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
}

function weightedPick(weights, seed) {
  const entries = Object.entries(weights ?? {}).filter(([, weight]) => Number(weight) > 0);
  const total = entries.reduce((sum, [, weight]) => sum + Number(weight), 0);
  if (!entries.length || total <= 0) return entries[0]?.[0] ?? "medium";
  let cursor = seed % total;
  for (const [key, weight] of entries) {
    cursor -= Number(weight);
    if (cursor < 0) return key;
  }
  return entries[entries.length - 1][0];
}

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value ?? "")) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function visualModeToImageCount(mode) {
  if (mode === "double_image") return 2;
  if (mode === "triple_image" || mode === "carousel_ready") return 3;
  if (mode === "no_image_rare") return 0;
  return 1;
}

function publicToFilePath(value) {
  if (!value || !value.startsWith("/")) return null;
  return path.join(root, "public", value.replace(/^\/+/, ""));
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

function includesAny(value, needles) {
  return needles.some((needle) => value.includes(normalize(needle)));
}

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function stringOrFallback(value, fallback) {
  return stringOrNull(value) ?? fallback;
}

function escapeTelegramHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, "");
}
