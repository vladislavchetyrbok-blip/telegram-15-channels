import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { getContentPresentationAnalysis, visualModes as presentationVisualModes } from "./content-presentation.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");

export const visualQualityFlags = [
  "genericAbstractRisk",
  "emptyComposition",
  "weakFocalPoint",
  "cheapDemoLook",
  "tooMuchEmptySpace",
  "badTextOverlayRisk",
  "serviceLabelRisk",
  "channelMismatch",
  "repeatedVisualStyle",
  "missingSubject",
  "weakEditorialValue",
  "lowPremiumScore",
];

export const premiumVisualProfiles = {
  "ai-tech": {
    visualIdentity: "premium clean tech editorial for a practical AI and software media channel",
    preferredComposition: "dark realistic workspace or product scene, one strong focal device/interface, layered depth, cinematic but restrained light",
    preferredSubjects: ["laptop with AI workflow dashboard", "phone interface", "developer workspace", "automation control room", "human using technology"],
    preferredColorMood: "deep charcoal, graphite, cyan accents, subtle violet only as secondary glow",
    forbiddenPatterns: ["generic blue/purple abstract network", "empty background", "random neon lines", "meaningless AI logo", "cheap stock-like background", "unreadable text overlays", "service labels"],
    promptKeywords: ["premium clean tech editorial", "realistic devices", "dashboard interface", "strong focal point", "high-end media style", "no text", "no logos"],
    negativePromptPatterns: ["abstract neural network", "random circuit lines", "AI logo", "floating text", "watermark", "service label", "template cover"],
    allowedVisualModes: ["single_image", "double_image", "triple_image", "cover_card", "editorial_visual", "carousel_ready"],
    goodDirectionExamples: ["Realistic dark workspace with laptop showing a clean AI workflow dashboard and subtle glass UI panels.", "Human hand using a phone/laptop automation interface in a premium editorial tech setup."],
    badDirectionExamples: ["Blue abstract network background with no object.", "Random neon neural lines and unreadable AI text."],
    targetAudience: "builders, operators, founders, and power users who want useful AI workflows",
  },
  "money-opportunities": {
    visualIdentity: "restrained finance and opportunity editorial with risk-aware premium signals",
    preferredComposition: "desk-level finance scene, dashboard/document/calculator as focal point, practical decision context",
    preferredSubjects: ["budget dashboard", "banking app", "documents", "calculator", "calendar", "comparison table"],
    preferredColorMood: "dark teal, graphite, muted gold, clean white highlights",
    forbiddenPatterns: ["cash pile cliche", "get rich quick", "guaranteed income", "casino mood", "crypto hype background", "RUB symbol", "service labels"],
    promptKeywords: ["premium finance editorial", "real dashboard", "documents and calculator", "risk-aware", "clean focal point", "no promises", "no text"],
    negativePromptPatterns: ["cash rain", "luxury flex", "ruble", "RUB", "guaranteed profit", "watermark", "template label"],
    allowedVisualModes: ["single_image", "double_image", "cover_card", "editorial_visual", "carousel_ready"],
    goodDirectionExamples: ["A tidy finance desk with calculator, banking app dashboard, and muted gold analytics accents.", "Editorial comparison scene with documents and a calm risk checklist mood."],
    badDirectionExamples: ["Stacks of cash and sports car.", "Generic investment chart with big profit arrows."],
    targetAudience: "adults comparing income, savings, and practical financial choices",
  },
  "dnipro-city": {
    visualIdentity: "local Dnipro city editorial with street-level detail and useful civic context",
    preferredComposition: "realistic city scene, recognizable urban texture, human-scale foreground detail, clear local context",
    preferredSubjects: ["street detail", "river embankment", "public transport", "local map", "city service detail", "neighborhood scene"],
    preferredColorMood: "natural city light, graphite overlays, restrained blue/amber accents",
    forbiddenPatterns: ["generic skyline", "tourist brochure", "empty gradient", "non-local city", "random map pins", "service labels"],
    promptKeywords: ["local editorial city photo", "street-level detail", "Dnipro urban context", "useful city guide", "realistic", "no text"],
    negativePromptPatterns: ["generic skyline", "fake city", "empty city gradient", "tourism poster", "watermark", "text overlay"],
    allowedVisualModes: ["single_image", "double_image", "triple_image", "editorial_visual", "carousel_ready"],
    goodDirectionExamples: ["Street-level Dnipro editorial image with transport stop, river/city context, and a clear foreground detail.", "Local map and urban infrastructure detail in a realistic guide style."],
    badDirectionExamples: ["Anonymous skyline from any city.", "Empty blue city-gradient wallpaper."],
    targetAudience: "local residents who want practical city updates",
  },
  "auto-comfort": {
    visualIdentity: "premium practical car comfort and ownership editorial",
    preferredComposition: "real vehicle interior/detail, clean focal part, useful comparison or maintenance context",
    preferredSubjects: ["car interior controls", "dashboard", "garage detail", "tire/service detail", "road trip comfort gear", "before-after product comparison"],
    preferredColorMood: "graphite, warm garage light, metallic highlights, muted blue technical accents",
    forbiddenPatterns: ["generic sports car wallpaper", "over-shiny showroom", "random road at night", "fake speed lines", "service labels"],
    promptKeywords: ["premium automotive editorial", "real car interior", "comfort controls", "detail shot", "practical buyer context", "no text"],
    negativePromptPatterns: ["supercar wallpaper", "flames", "racing poster", "text overlay", "watermark", "template label"],
    allowedVisualModes: ["single_image", "double_image", "triple_image", "cover_card", "editorial_visual", "carousel_ready"],
    goodDirectionExamples: ["Detailed car interior with climate controls and a clean comfort-focused focal point.", "Premium garage editorial scene comparing practical car accessories."],
    badDirectionExamples: ["Random glossy sports car in neon rain.", "Empty highway wallpaper."],
    targetAudience: "drivers choosing practical comfort, maintenance, and car gear decisions",
  },
  "fishing-rest": {
    visualIdentity: "calm outdoor fishing and rest editorial with real gear and weather context",
    preferredComposition: "natural foreground subject, real water/weather context, gear detail, calm practical mood",
    preferredSubjects: ["fishing tackle", "water surface", "weather detail", "camp setup", "route map", "hands preparing gear"],
    preferredColorMood: "natural greens, deep water blue, graphite, early morning warm light",
    forbiddenPatterns: ["cartoon fish", "generic sunset only", "survivalist exaggeration", "empty gear collage", "service labels"],
    promptKeywords: ["natural outdoor editorial", "real fishing gear", "weather and water detail", "calm composition", "practical", "no text"],
    negativePromptPatterns: ["cartoon", "clipart fish", "empty sunset", "AI fantasy lake", "watermark", "text overlay"],
    allowedVisualModes: ["single_image", "double_image", "triple_image", "editorial_visual", "carousel_ready"],
    goodDirectionExamples: ["Close realistic tackle setup near water with weather cues and a calm editorial mood.", "Hands preparing fishing gear with a route/weather context in the background."],
    badDirectionExamples: ["Cartoon fish jumping over generic lake.", "Only a pretty sunset with no subject."],
    targetAudience: "people planning fishing trips, rest, gear, and outdoor decisions",
  },
  "mens-style": {
    visualIdentity: "quiet premium menswear and grooming editorial with texture and practical taste",
    preferredComposition: "real outfit/accessory texture, one refined focal object, editorial lifestyle context",
    preferredSubjects: ["fabric texture", "shoes", "watch as detail not flex", "grooming tools", "layered outfit", "wardrobe comparison"],
    preferredColorMood: "graphite, off-white, leather brown accents, steel, muted olive",
    forbiddenPatterns: ["luxury flex", "random watch macro", "alpha advice", "black-gold cliche", "service labels"],
    promptKeywords: ["editorial menswear", "quiet premium", "real outfit texture", "accessory detail", "restrained", "no text"],
    negativePromptPatterns: ["luxury flex", "gold chains", "alpha male poster", "watermark", "text overlay", "template label"],
    allowedVisualModes: ["single_image", "double_image", "triple_image", "cover_card", "editorial_visual", "carousel_ready"],
    goodDirectionExamples: ["Quiet premium outfit detail with fabric texture, shoes, and clean editorial lighting.", "Practical grooming setup with refined materials and a clear focal point."],
    badDirectionExamples: ["Aggressive black-gold luxury poster.", "Random watch macro with no article context."],
    targetAudience: "men who want specific, restrained, practical style decisions",
  },
};

const fallbackProfile = {
  visualIdentity: "premium editorial Telegram media visual with channel-specific subject",
  preferredComposition: "realistic subject, strong focal point, layered editorial depth, no empty background",
  preferredSubjects: ["real object", "workspace", "documents", "dashboard", "local context"],
  preferredColorMood: "graphite, neutral editorial palette, restrained accent color",
  forbiddenPatterns: ["generic stock visual", "empty abstract background", "service labels", "watermark", "random logo"],
  promptKeywords: ["premium editorial", "realistic subject", "strong focal point", "high-end media style", "no text", "no logos"],
  negativePromptPatterns: ["generic abstract", "empty background", "watermark", "text overlay", "template label"],
  allowedVisualModes: ["single_image", "double_image", "triple_image", "cover_card", "editorial_visual", "carousel_ready"],
  goodDirectionExamples: ["Realistic editorial scene with one clear subject tied to the post topic."],
  badDirectionExamples: ["Empty abstract wallpaper with no channel identity."],
  targetAudience: "Telegram readers who need useful, concrete editorial context",
};

const genericAbstractFragments = [
  "abstract",
  "neural grid",
  "network",
  "random neon",
  "glow lines",
  "gradient",
  "placeholder",
  "template",
  "local_template",
  "clean-draft",
  "generic",
  "stock",
];

const emptyCompositionFragments = ["background", "wallpaper", "empty", "gradient", "pattern", "grid"];
const weakFocalFragments = ["background", "abstract", "pattern", "grid", "wallpaper", "texture"];
const serviceLabelFragments = ["local-model", "test post", "telegram ready", "premium_v2", "service label", "template label"];
const textOverlayFragments = ["text overlay", "headline", "caption", "label", "logo", "watermark", "unreadable text"];
const subjectFragments = ["dashboard", "laptop", "phone", "workspace", "document", "calculator", "city", "street", "car", "interior", "gear", "water", "fabric", "shoes", "watch", "human", "hands", "interface"];
const premiumFragments = ["premium", "editorial", "realistic", "cinematic", "high-end", "focal", "media", "workspace", "device", "document", "detail"];

export async function getPremiumVisualQualityReport({ sampleLimit = 8 } = {}) {
  const analysis = await getPremiumVisualQualityAnalysis({ sampleLimit });

  return {
    status: analysis.errors.length ? "error" : analysis.summary.regenerationRecommended > 0 || analysis.summary.weakDemoVisuals > 0 || analysis.warnings.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    profiles: premiumVisualProfiles,
    visualModes: presentationVisualModes.filter((mode) => mode !== "no_image_rare"),
    qualityFlags: visualQualityFlags,
    summary: analysis.summary,
    samples: analysis.samples,
    weakVisuals: analysis.weakVisuals,
    regenerationQueuePreview: analysis.regenerationQueuePreview,
    issues: buildIssueSummary(analysis.analyzed),
    recommendations: buildRecommendations(analysis.summary, analysis.analyzed),
    warnings: analysis.warnings,
    errors: analysis.errors,
    lastCheckedAt: analysis.lastCheckedAt,
  };
}

export async function getPremiumVisualRegenerationPreview({ sampleLimit = 12 } = {}) {
  const report = await getPremiumVisualQualityReport({ sampleLimit });
  return {
    status: report.status,
    summary: report.summary,
    regenerationQueuePreview: report.regenerationQueuePreview,
    weakVisuals: report.weakVisuals.slice(0, sampleLimit),
    recommendations: report.recommendations,
    lastCheckedAt: report.lastCheckedAt,
  };
}

export async function getPremiumVisualQualityAnalysis({ sampleLimit = 8 } = {}) {
  const lastCheckedAt = new Date().toISOString();
  const errors = [];
  const warnings = [];
  const plan = readJson(path.join(runtimeDir, "weekly-content-plan.json"), { items: [] }, errors);
  const posts = Array.isArray(plan.items) ? plan.items : [];
  const presentation = await getContentPresentationAnalysis({ sampleLimit: Math.max(5, sampleLimit) });
  const presentationByPostId = new Map(presentation.analyzed.map((post) => [post.postId, post]));
  const visualHistory = buildVisualHistory(posts);
  const analyzed = posts.map((post) => analyzePremiumVisualPost(post, {
    presentation: presentationByPostId.get(String(post.postId ?? post.id)),
    visualHistory,
  }));
  const weakVisuals = analyzed
    .filter((post) => post.regenerationRecommended || post.visualQualityScore < 78 || post.premiumScore < 78 || post.channelFitScore < 75)
    .sort(sortAnalyzedPosts);
  const regenerationQueuePreview = weakVisuals
    .filter((post) => !post.isPublished)
    .slice(0, Math.max(5, sampleLimit))
    .map(buildRegenerationQueueItem);
  const samples = analyzed
    .filter((post) => !post.isPublished)
    .sort(sortAnalyzedPosts)
    .slice(0, Math.max(5, sampleLimit));
  const summary = buildSummary(analyzed, weakVisuals, regenerationQueuePreview);

  if (!posts.length) warnings.push("No posts were found in data/runtime/weekly-content-plan.json.");
  if (weakVisuals.some((post) => post.isPublished)) warnings.push("Published posts with weak visual signals are reported only; this engine does not rewrite published posts.");

  return { lastCheckedAt, errors, warnings, posts, analyzed, samples, weakVisuals, regenerationQueuePreview, summary };
}

export function analyzePremiumVisualPost(post, context = {}) {
  const postId = stringOrFallback(post.postId ?? post.id, "unknown");
  const channelId = stringOrFallback(post.channelId, "unknown");
  const profile = getPremiumQualityProfile(channelId);
  const presentation = context.presentation ?? {};
  const title = stringOrFallback(post.title ?? post.contentTopic, "Untitled");
  const topic = stringOrFallback(post.contentTopic ?? title, title);
  const contentTemplate = stringOrFallback(presentation.contentTemplate, inferTemplate(post));
  const lengthBucket = stringOrFallback(presentation.lengthBucket, inferLengthBucket(post));
  const visualMode = selectVisualModeForQuality(post, presentation, profile);
  const recentHistory = getRecentVisualHistory(context.visualHistory, post);
  const promptPackage = buildVisualPromptV2({
    post,
    profile,
    visualMode,
    contentTemplate,
    lengthBucket,
    recentHistory,
  });
  const inspection = inspectVisual(post, promptPackage, profile, recentHistory);
  const visualQualityScore = scoreFromFlags(inspection.flags, 100);
  const premiumScore = scorePremium(post, promptPackage, inspection.flags);
  const channelFitScore = scoreChannelFit(promptPackage, profile, inspection.flags);
  const allFlags = [...inspection.flags];

  if (premiumScore < 72 && !allFlags.some((flag) => flag.type === "lowPremiumScore")) {
    allFlags.push(flag("lowPremiumScore", "warning", "Visual lacks enough premium editorial signals.", 14));
  }

  const finalVisualQualityScore = Math.min(visualQualityScore, scoreFromFlags(allFlags, 100));
  const regenerationRecommended = finalVisualQualityScore < 78 || premiumScore < 75 || channelFitScore < 72 || allFlags.some((item) => ["cheapDemoLook", "missingSubject", "channelMismatch", "serviceLabelRisk"].includes(item.type));
  const blockPublication = finalVisualQualityScore < 55 || premiumScore < 50 || channelFitScore < 50 || allFlags.some((item) => item.severity === "blocked");
  const regenerationReason = buildRegenerationReason(allFlags, finalVisualQualityScore, premiumScore, channelFitScore);
  const isPublished = ["published", "sent"].includes(String(post.status ?? "").toLowerCase());

  return {
    postId,
    channelId,
    channelName: stringOrFallback(post.channelName, channelId),
    status: stringOrFallback(post.status, "unknown"),
    isPublished,
    title,
    topic,
    contentTemplate,
    lengthBucket,
    targetAudience: profile.targetAudience,
    visualMode,
    imageCount: visualModeToImageCount(visualMode),
    originalImage: stringOrNull(post.imageUrl) ?? stringOrNull(post.previewPath) ?? stringOrNull(post.telegramImagePath) ?? stringOrNull(post.imagePath),
    originalImagePrompt: getOriginalImagePrompt(post),
    improvedPrompt: promptPackage.prompt,
    negativePrompt: promptPackage.negativePrompt,
    promptParts: promptPackage.promptParts,
    visualModeReason: promptPackage.visualModeReason,
    recentVisualHistory: recentHistory,
    visualQualityScore: finalVisualQualityScore,
    premiumScore,
    channelFitScore,
    regenerationRecommended,
    blockPublication,
    flags: allFlags.map(({ type }) => type),
    qualityFlags: allFlags,
    reason: regenerationReason,
    recommendedAction: blockPublication
      ? "Block publication until a new premium visual is generated in preview/regeneration flow."
      : regenerationRecommended
        ? "Add to visual regeneration preview with the improved prompt; keep old image untouched."
        : "Keep visual; monitor for style repetition.",
  };
}

export function buildVisualPromptV2({ post, profile, visualMode, contentTemplate, lengthBucket, recentHistory = [] }) {
  const title = stringOrFallback(post.title ?? post.contentTopic, "Untitled");
  const topic = stringOrFallback(post.contentTopic ?? title, title);
  const freshness = buildFreshnessGuidance(recentHistory);
  const imageCount = visualModeToImageCount(visualMode);
  const promptParts = [
    `Premium editorial cover for a Telegram channel: ${profile.visualIdentity}.`,
    `Topic: ${topic}. Title context: ${title}.`,
    `Audience: ${profile.targetAudience}.`,
    `Composition: ${profile.preferredComposition}.`,
    `Subjects to show: ${profile.preferredSubjects.slice(0, 5).join(", ")}.`,
    `Color mood: ${profile.preferredColorMood}.`,
    `Content template: ${contentTemplate}; length bucket: ${lengthBucket}; visual mode: ${visualMode} (${imageCount} image${imageCount === 1 ? "" : "s"}).`,
    freshness,
    `Style keywords: ${profile.promptKeywords.join(", ")}.`,
    "Strong focal point, real-world object or scene, useful editorial value, no text, no logos, no watermark.",
  ];
  const negativePrompt = [
    ...profile.negativePromptPatterns,
    ...profile.forbiddenPatterns,
    "unreadable typography",
    "empty composition",
    "generic abstract background",
    "cheap demo cover",
  ].join(", ");

  return {
    prompt: promptParts.join(" "),
    negativePrompt,
    promptParts,
    visualModeReason: buildVisualModeReason(visualMode, contentTemplate, lengthBucket, profile),
  };
}

function getPremiumQualityProfile(channelId) {
  return premiumVisualProfiles[channelId] ?? fallbackProfile;
}

function inspectVisual(post, promptPackage, profile, recentHistory) {
  const original = getOriginalImagePrompt(post);
  const metadataText = [
    original,
    post.visualStyle,
    post.visualPreset,
    post.visualVersion,
    post.provider,
    post.source,
    post.visualMetadata?.visualStyle,
    post.visualMetadata?.visualPreset,
    post.visualMetadata?.provider,
    post.visualMetadata?.source,
    post.telegramImageStatus,
    post.imageQuality,
  ].filter(Boolean).join(" ");
  const lower = normalize(metadataText);
  const promptLower = normalize(promptPackage.prompt);
  const image = inspectImage(post);
  const flags = [];

  if (includesAny(lower, genericAbstractFragments) && !includesAny(lower, ["realistic", "device", "document", "city", "interior", "gear", "fabric"])) {
    flags.push(flag("genericAbstractRisk", "warning", "Visual metadata points to generic abstract/template styling.", 12));
  }
  if (!image.exists || image.size < 18_000 || includesAny(lower, emptyCompositionFragments) && !includesAny(lower, subjectFragments)) {
    flags.push(flag("emptyComposition", image.exists ? "warning" : "blocked", image.exists ? "Composition may be empty or background-led." : "Image file is missing for visual inspection.", image.exists ? 12 : 24));
  }
  if (includesAny(lower, weakFocalFragments) && !includesAny(promptLower, ["strong focal point", "real-world object", "realistic"])) {
    flags.push(flag("weakFocalPoint", "warning", "Focal point is weak or not explicitly protected.", 12));
  }
  if (includesAny(lower, ["local_template", "template", "placeholder", "clean-draft"]) || post.provider === "local_template" || post.source === "template") {
    flags.push(flag("cheapDemoLook", "warning", "Visual is template/local generated and can read as demo/autogen.", 16));
  }
  if (includesAny(lower, ["empty", "background", "wallpaper", "gradient"]) && !includesAny(lower, ["dashboard", "document", "car", "city", "gear", "fabric", "workspace"])) {
    flags.push(flag("tooMuchEmptySpace", "warning", "Visual appears background-heavy instead of subject-led.", 10));
  }
  if (includesAny(lower, textOverlayFragments) || includesAny(original, textOverlayFragments)) {
    flags.push(flag("badTextOverlayRisk", "warning", "Prompt/metadata risks unreadable text, labels, logo, or watermark.", 10));
  }
  if (includesAny(lower, serviceLabelFragments) || hasServiceQualityIssue(post)) {
    flags.push(flag("serviceLabelRisk", "warning", "Service/template label risk is present in metadata or quality issues.", 14));
  }
  if (profile.forbiddenPatterns.some((pattern) => normalize(metadataText).includes(normalize(pattern)))) {
    flags.push(flag("channelMismatch", "warning", "Visual includes a pattern forbidden for this channel profile.", 16));
  }
  if (recentHistory.filter((item) => item.signature === buildVisualSignature(post)).length >= 2) {
    flags.push(flag("repeatedVisualStyle", "warning", "Recent posts repeat the same visual style signature.", 10));
  }
  if (!includesAny(promptLower, profile.preferredSubjects) && !includesAny(lower, profile.preferredSubjects) && !includesAny(promptLower, subjectFragments)) {
    flags.push(flag("missingSubject", "warning", "Prompt does not contain a concrete profile subject.", 16));
  }
  if (!includesAny(promptLower, ["editorial", "useful", "realistic", "dashboard", "detail", "workspace", "context"])) {
    flags.push(flag("weakEditorialValue", "warning", "Prompt lacks practical editorial value signals.", 10));
  }

  return { flags };
}

function scorePremium(post, promptPackage, flags) {
  const text = normalize([getOriginalImagePrompt(post), promptPackage.prompt, post.visualStyle, post.visualPreset, post.visualMetadata?.visualStyle].filter(Boolean).join(" "));
  let score = 48;
  for (const fragment of premiumFragments) {
    if (text.includes(fragment)) score += 6;
  }
  if (text.includes("realistic")) score += 6;
  if (text.includes("strong focal point")) score += 6;
  if (text.includes("no text") && text.includes("no logos")) score += 4;
  score -= flags.filter((item) => ["cheapDemoLook", "genericAbstractRisk", "emptyComposition", "weakEditorialValue"].includes(item.type)).reduce((sum, item) => sum + Math.round(item.penalty / 2), 0);
  return clampScore(score);
}

function scoreChannelFit(promptPackage, profile, flags) {
  const text = normalize([promptPackage.prompt, promptPackage.negativePrompt].join(" "));
  let score = 52;
  for (const keyword of profile.promptKeywords) {
    if (text.includes(normalize(keyword))) score += 4;
  }
  for (const subject of profile.preferredSubjects) {
    if (text.includes(normalize(subject))) score += 5;
  }
  for (const forbidden of profile.forbiddenPatterns) {
    if (text.includes(normalize(forbidden))) score -= 2;
  }
  score -= flags.filter((item) => ["channelMismatch", "missingSubject", "repeatedVisualStyle"].includes(item.type)).reduce((sum, item) => sum + Math.round(item.penalty / 2), 0);
  return clampScore(score);
}

function scoreFromFlags(flags, base) {
  return clampScore(base - flags.reduce((total, item) => total + item.penalty, 0));
}

function buildRegenerationQueueItem(post) {
  return {
    postId: post.postId,
    channelId: post.channelId,
    title: post.title,
    visualQualityScore: post.visualQualityScore,
    premiumScore: post.premiumScore,
    channelFitScore: post.channelFitScore,
    visualMode: post.visualMode,
    imageCount: post.imageCount,
    originalImage: post.originalImage,
    originalImagePrompt: post.originalImagePrompt,
    recommendedPrompt: post.improvedPrompt,
    negativePrompt: post.negativePrompt,
    regenerationReason: post.reason,
    issues: post.flags,
    recommendedAction: post.recommendedAction,
  };
}

function buildSummary(analyzed, weakVisuals, regenerationQueuePreview) {
  const scoreAverage = (selector) => analyzed.length ? Math.round(analyzed.reduce((sum, item) => sum + selector(item), 0) / analyzed.length) : 0;
  return {
    totalPosts: analyzed.length,
    unpublishedPosts: analyzed.filter((post) => !post.isPublished).length,
    weakDemoVisuals: weakVisuals.length,
    regenerationRecommended: analyzed.filter((post) => post.regenerationRecommended).length,
    blockPublication: analyzed.filter((post) => post.blockPublication && !post.isPublished).length,
    queuePreviewItems: regenerationQueuePreview.length,
    averageVisualQualityScore: scoreAverage((post) => post.visualQualityScore),
    averagePremiumScore: scoreAverage((post) => post.premiumScore),
    averageChannelFitScore: scoreAverage((post) => post.channelFitScore),
    byVisualMode: countBy(analyzed.map((post) => post.visualMode)),
    byChannel: countBy(analyzed.map((post) => post.channelId)),
    flags: countBy(analyzed.flatMap((post) => post.flags)),
    productionStoreMode: "json",
    sourceOfTruth: "json",
    previewOnly: true,
    realTelegramSendChanged: false,
  };
}

function buildIssueSummary(posts) {
  const grouped = new Map();
  for (const post of posts) {
    for (const flagItem of post.qualityFlags) {
      const current = grouped.get(flagItem.type) ?? { type: flagItem.type, severity: flagItem.severity, count: 0, examples: [], message: flagItem.message };
      current.count += 1;
      if (current.examples.length < 6) current.examples.push(`${post.channelId}/${post.postId}`);
      grouped.set(flagItem.type, current);
    }
  }
  return Array.from(grouped.values()).sort((left, right) => right.count - left.count || left.type.localeCompare(right.type));
}

function buildRecommendations(summary, posts) {
  const recommendations = [];
  if (summary.weakDemoVisuals > 0) recommendations.push(`Review ${summary.weakDemoVisuals} weak/demo visual(s) in preview before any new publishing.`);
  if (summary.regenerationRecommended > 0) recommendations.push(`Queue ${summary.regenerationRecommended} visual(s) for regeneration with the recommended prompts; old visuals remain untouched.`);
  if (summary.flags?.cheapDemoLook > 0) recommendations.push("Replace local/template-looking visuals with realistic editorial subjects and stronger focal points.");
  if (summary.flags?.channelMismatch > 0 || summary.flags?.missingSubject > 0) recommendations.push("Use channel visual profiles as hard constraints for prompt subjects and negative patterns.");
  if (posts.some((post) => post.visualMode === "double_image" || post.visualMode === "triple_image" || post.visualMode === "carousel_ready")) recommendations.push("Prepare image-count metadata for multi-image preview; Telegram album sending remains unchanged.");
  recommendations.push("Keep productionStoreMode=json and sourceOfTruth=json; this report is read-only.");
  return recommendations;
}

function selectVisualModeForQuality(post, presentation, profile) {
  const preferred = stringOrNull(presentation?.visualMode) ?? stringOrNull(post.visualMode) ?? stringOrNull(post.visualMetadata?.mode) ?? stringOrNull(post.visualPreset);
  if (preferred && profile.allowedVisualModes.includes(preferred)) return preferred;
  if (preferred === "realistic_cover" || preferred === "premium_card") return "cover_card";
  return profile.allowedVisualModes.includes("editorial_visual") ? "editorial_visual" : "single_image";
}

function buildVisualModeReason(visualMode, contentTemplate, lengthBucket, profile) {
  const imageCount = visualModeToImageCount(visualMode);
  if (visualMode === "carousel_ready") return `Selected carousel_ready because ${lengthBucket} content benefits from up to ${imageCount} editorial frames; profile allows ${profile.allowedVisualModes.join(", ")}.`;
  if (visualMode === "double_image" || visualMode === "triple_image") return `Selected ${visualMode} because ${contentTemplate} can use ${imageCount} complementary visual angles in preview.`;
  if (visualMode === "cover_card") return "Selected cover_card to provide a strong single editorial cover while avoiding plain template artwork.";
  if (visualMode === "editorial_visual") return "Selected editorial_visual for a realistic subject-led media visual with channel-specific identity.";
  return "Selected single_image for a focused post cover with one strong subject.";
}

function visualModeToImageCount(mode) {
  if (mode === "double_image") return 2;
  if (mode === "triple_image" || mode === "carousel_ready") return 3;
  return 1;
}

function getOriginalImagePrompt(post) {
  return stringOrNull(post.imagePrompt)
    ?? stringOrNull(post.visualPrompt)
    ?? stringOrNull(post.visualMetadata?.prompt)
    ?? stringOrNull(post.visualMetadata?.imagePrompt)
    ?? [post.visualStyle, post.visualPreset, post.visualMetadata?.visualStyle].filter(Boolean).join(", ");
}

function inspectImage(post) {
  const rawPath = stringOrNull(post.telegramImagePath) ?? stringOrNull(post.imagePath) ?? publicToFilePath(stringOrNull(post.imageUrl)) ?? publicToFilePath(stringOrNull(post.previewPath));
  const exists = rawPath ? existsSync(rawPath) : false;
  const size = exists ? statSync(rawPath).size : 0;
  return { rawPath, exists, size };
}

function hasServiceQualityIssue(post) {
  return Array.isArray(post.qualityIssues) && post.qualityIssues.some((issue) => normalize(issue).includes("service_visual_label"));
}

function buildVisualHistory(posts) {
  const sorted = [...posts].sort((left, right) => String(left.scheduledAt ?? "").localeCompare(String(right.scheduledAt ?? "")));
  const byChannel = new Map();
  for (const post of sorted) {
    const channelId = stringOrFallback(post.channelId, "unknown");
    const history = byChannel.get(channelId) ?? [];
    history.push({
      postId: stringOrFallback(post.postId ?? post.id, "unknown"),
      scheduledAt: post.scheduledAt ?? null,
      signature: buildVisualSignature(post),
      style: [post.visualStyle, post.visualPreset, post.visualMetadata?.mode].filter(Boolean).join(", "),
    });
    byChannel.set(channelId, history.slice(-8));
  }
  return byChannel;
}

function getRecentVisualHistory(visualHistory, post) {
  const channelId = stringOrFallback(post.channelId, "unknown");
  const postId = stringOrFallback(post.postId ?? post.id, "unknown");
  return (visualHistory?.get(channelId) ?? []).filter((item) => item.postId !== postId).slice(-5);
}

function buildVisualSignature(post) {
  return normalize([post.visualPreset, post.visualStyle, post.visualMetadata?.mode, post.provider, post.source].filter(Boolean).join("::")) || "unknown";
}

function buildFreshnessGuidance(recentHistory) {
  if (!recentHistory.length) return "Visual freshness: no recent history found; establish a strong channel-specific direction.";
  const signatures = Array.from(new Set(recentHistory.map((item) => item.signature).filter(Boolean))).slice(-4);
  return `Visual freshness: avoid repeating recent signatures (${signatures.join("; ")}); change subject, camera angle, and focal object.`;
}

function buildRegenerationReason(flags, visualQualityScore, premiumScore, channelFitScore) {
  if (!flags.length) return `Visual scores are acceptable: visual ${visualQualityScore}, premium ${premiumScore}, channel fit ${channelFitScore}.`;
  const top = flags.slice(0, 4).map((item) => item.type).join(", ");
  return `Regeneration recommended because of ${top}; scores: visual ${visualQualityScore}, premium ${premiumScore}, channel fit ${channelFitScore}.`;
}

function inferTemplate(post) {
  const text = normalize([post.title, post.contentTopic, post.body, post.telegramCaption].filter(Boolean).join(" "));
  if (text.includes("compare") || text.includes("vs")) return "comparison";
  if (text.includes("checklist") || text.includes("чек")) return "practical_checklist";
  if (text.includes("tool") || text.includes("service")) return "tools_list";
  return "short_insight";
}

function inferLengthBucket(post) {
  const words = countWords([post.title, post.body, post.telegramCaption].filter(Boolean).join(" "));
  if (words <= 120) return "short";
  if (words <= 300) return "medium";
  if (words <= 700) return "long";
  return "deep";
}

function sortAnalyzedPosts(left, right) {
  return left.visualQualityScore - right.visualQualityScore
    || left.premiumScore - right.premiumScore
    || left.channelFitScore - right.channelFitScore
    || left.channelId.localeCompare(right.channelId)
    || left.postId.localeCompare(right.postId);
}

function flag(type, severity, message, penalty) {
  return { type, severity, message, penalty };
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
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

function countWords(value) {
  return String(value ?? "").match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu)?.length ?? 0;
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function includesAny(value, needles) {
  const haystack = normalize(value);
  return needles.some((needle) => haystack.includes(normalize(needle)));
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
