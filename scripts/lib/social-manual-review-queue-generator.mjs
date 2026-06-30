import fs from "fs";
import path from "path";
import process from "process";
import { PLATFORMS, buildSocialExportBundle } from "./social-manual-export-generator.mjs";
import { buildSocialCalendar } from "./social-manual-calendar-generator.mjs";

export const SOCIAL_REVIEW_ROOT = "data/social-review";
export const SUPPORTED_REVIEW_DAYS = [7, 14];

const REVIEW_STATUS = "needs_manual_review";
const MANUAL_POSTING_STATUS = "not_posted";
const MAX_VIP_PER_WEEK = 2;
const CONTENT_PRIORITY = {
  mystic_card: 1,
  birth_matrix_teaser: 2,
  compatibility_hook: 3,
  daily_zodiac_reel: 4,
  weekly_forecast_batch: 5,
  vip_preview_teaser: 6,
};
const PLATFORM_PREFERENCE = {
  mystic_card: "instagram",
  birth_matrix_teaser: "tiktok",
  compatibility_hook: "instagram",
  daily_zodiac_reel: "tiktok",
  weekly_forecast_batch: "instagram",
  vip_preview_teaser: "tiktok",
};
const DRAMATIC_PHRASES = [
  { pattern: /кризис|crisis|кризис/i, softer: "tense moment" },
  { pattern: /катастроф|catastrophe|doom|fatal/i, softer: "strong signal" },
  { pattern: /паник|panic/i, softer: "pause and breathe" },
];

function assertIsoDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) {
    throw new Error("Expected YYYY-MM-DD date.");
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("Expected a real calendar date in YYYY-MM-DD format.");
  }
}

function assertDays(days) {
  if (!SUPPORTED_REVIEW_DAYS.includes(days)) {
    throw new Error("Expected --days 7 or --days 14.");
  }
}

function addDays(date, amount) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + amount);
  return parsed.toISOString().slice(0, 10);
}

function dateRangeLabel(startDate, days) {
  return `${startDate}_to_${addDays(startDate, days - 1)}`;
}

function flattenText(value) {
  if (Array.isArray(value)) return value.map(flattenText).join("\n");
  if (value && typeof value === "object") return Object.values(value).map(flattenText).join("\n");
  return String(value ?? "");
}

function normalizeSourceItem(item) {
  return item.sourceItem ?? item;
}

function platformPlansFromExportDate(date) {
  const bundle = buildSocialExportBundle({ date });
  return bundle.platforms.map((pack) => ({
    platform: pack.platform,
    date,
    items: pack.items.map((item) => ({
      id: item.id,
      platform: item.platform,
      contentType: item.contentType,
      title: item.title,
      hook: item.hook,
      cta: item.cta,
      reviewStatus: item.reviewStatus,
      storyboardPrompt9x16: item.storyboardPrompt9x16,
      sourceItem: item,
    })),
    reviewStatus: REVIEW_STATUS,
  }));
}

function candidatesForDay(day) {
  return day.platformPlans.flatMap((plan) => plan.items.map((item) => ({
    ...item,
    sourceItem: normalizeSourceItem(item),
  })));
}

function chooseBestCandidate(candidates, contentType, usedIds) {
  const preferredPlatform = PLATFORM_PREFERENCE[contentType];
  const pool = candidates.filter((item) => item.contentType === contentType && !usedIds.has(item.id));
  if (pool.length === 0) return null;
  return pool.find((item) => item.platform === preferredPlatform) ?? pool[0];
}

function selectTopPosts(day, state) {
  const candidates = candidatesForDay(day);
  const usedIds = new Set();
  const selected = [];
  const orderedContentTypes = [
    "mystic_card",
    "birth_matrix_teaser",
    "compatibility_hook",
    "daily_zodiac_reel",
    "weekly_forecast_batch",
  ];

  for (const contentType of orderedContentTypes) {
    const candidate = chooseBestCandidate(candidates, contentType, usedIds);
    if (!candidate) continue;
    selected.push(candidate);
    usedIds.add(candidate.id);
    if (selected.length >= 4 && contentType !== "weekly_forecast_batch") break;
  }

  const vipCandidate = chooseBestCandidate(candidates, "vip_preview_teaser", usedIds);
  if (vipCandidate && state.vipPreviewCount < MAX_VIP_PER_WEEK && selected.length > 0) {
    selected.push(vipCandidate);
    usedIds.add(vipCandidate.id);
    state.vipPreviewCount += 1;
  }

  return selected.slice(0, 5);
}

function detectWeakHook(item) {
  const source = normalizeSourceItem(item);
  const text = flattenText([source.hook, source.title, source.caption, source.voiceover]);
  const warnings = [];
  const polishNotes = [];

  if (source.contentType === "daily_zodiac_reel") {
    warnings.push("Sign-specific daily hook uses a repeated generated template.");
    polishNotes.push("Rewrite the first 3 seconds with a fresher, less templated hook before manual posting.");
  }

  for (const phrase of DRAMATIC_PHRASES) {
    if (phrase.pattern.test(text)) {
      warnings.push(`Dramatic phrase detected; soften wording toward "${phrase.softer}".`);
      polishNotes.push(`Replace dramatic wording with "${phrase.softer}" before manual posting.`);
    }
  }

  if (source.contentType === "weekly_forecast_batch") {
    warnings.push("Weekly forecast copy can include internal batch wording.");
    polishNotes.push("Remove internal source terms such as weekly batch or channel count from public copy.");
  }

  if (source.contentType === "vip_preview_teaser") {
    polishNotes.push("Keep this as locked preview only; never make it first in the daily queue.");
  }

  return { warnings, polishNotes };
}

function ctaCheck(item) {
  const url = normalizeSourceItem(item).cta?.url ?? "";
  return {
    status: url.startsWith("https://t.me/") && !/dashboard|admin/i.test(url) ? "pass" : "fail",
    url,
    notes: "CTA must point to Telegram bot / Mini App, never admin or dashboard.",
  };
}

function vipPaymentSafetyCheck(item) {
  const source = normalizeSourceItem(item);
  if (source.contentType !== "vip_preview_teaser") {
    return {
      status: "pass",
      applies: false,
      notes: "Not a VIP preview item.",
    };
  }
  const locked = source.vipBoundary?.access === "locked_preview_only";
  const paymentInactive = source.vipBoundary?.payment === "not_active";
  const unlockInactive = source.vipBoundary?.entitlementUnlock === "not_active";
  return {
    status: locked && paymentInactive && unlockInactive ? "pass" : "fail",
    applies: true,
    access: source.vipBoundary?.access ?? "unknown",
    payment: source.vipBoundary?.payment ?? "unknown",
    entitlementUnlock: source.vipBoundary?.entitlementUnlock ?? "unknown",
    notes: "VIP item must stay locked preview only with no payment or entitlement unlock.",
  };
}

function buildQueueItem(item, priority) {
  const source = normalizeSourceItem(item);
  const weak = detectWeakHook(source);
  const cta = ctaCheck(source);
  const vip = vipPaymentSafetyCheck(source);
  const ready = weak.warnings.length === 0 && cta.status === "pass" && vip.status === "pass";

  return {
    id: `${source.date}-${source.platform}-review-${priority}`,
    sourceItemId: source.id,
    platform: source.platform,
    priority,
    contentType: source.contentType,
    hook: source.hook,
    voiceover: source.voiceover,
    onScreenText: source.onScreenText,
    caption: source.caption,
    hashtags: source.hashtags,
    cta: source.cta,
    storyboardPrompt9x16: source.storyboardPrompt9x16,
    weakPostWarnings: weak.warnings,
    humanPolishNotes: weak.polishNotes,
    ctaCheck: cta,
    vipPaymentSafetyCheck: vip,
    humanPolishNeeded: weak.warnings.length > 0 ? "Yes" : "No",
    readyToPostManually: ready ? "Yes" : "No",
    postedManually: "No",
    manualPostingStatus: MANUAL_POSTING_STATUS,
  };
}

function buildReviewDay(day, state) {
  const selected = selectTopPosts(day, state).map((item, index) => buildQueueItem(item, index + 1));
  const weakPostWarnings = selected.flatMap((item) => item.weakPostWarnings.map((warning) => `${item.platform}/${item.contentType}: ${warning}`));
  const humanPolishNotes = selected.flatMap((item) => item.humanPolishNotes.map((note) => `${item.platform}/${item.contentType}: ${note}`));
  const ctaChecks = selected.map((item) => ({
    itemId: item.sourceItemId,
    platform: item.platform,
    status: item.ctaCheck.status,
    url: item.ctaCheck.url,
  }));
  const vipChecks = selected.filter((item) => item.contentType === "vip_preview_teaser").map((item) => ({
    itemId: item.sourceItemId,
    platform: item.platform,
    status: item.vipPaymentSafetyCheck.status,
    access: item.vipPaymentSafetyCheck.access,
    payment: item.vipPaymentSafetyCheck.payment,
    entitlementUnlock: item.vipPaymentSafetyCheck.entitlementUnlock,
  }));

  return {
    date: day.date,
    reviewStatus: REVIEW_STATUS,
    manualPostingStatus: MANUAL_POSTING_STATUS,
    topRecommendedPosts: selected,
    weakPostWarnings,
    humanPolishNotes,
    readyToPostChecklist: selected.map((item) => ({
      platform: item.platform,
      priority: item.priority,
      hook: item.hook,
      voiceover: item.voiceover,
      onScreenText: item.onScreenText,
      caption: item.caption,
      hashtags: item.hashtags,
      cta: item.cta,
      storyboardPrompt9x16: item.storyboardPrompt9x16,
      humanPolishNeeded: item.humanPolishNeeded,
      readyToPostManually: item.readyToPostManually,
      postedManually: item.postedManually,
    })),
    ctaCheck: {
      status: ctaChecks.every((check) => check.status === "pass") ? "pass" : "fail",
      checks: ctaChecks,
    },
    vipPaymentSafetyCheck: {
      status: vipChecks.every((check) => check.status === "pass") ? "pass" : "fail",
      checks: vipChecks,
    },
    platformCopySheets: PLATFORMS.map((platform) => ({
      platform,
      items: selected.filter((item) => item.platform === platform),
    })),
  };
}

function summarizeQueue(days) {
  const allItems = days.flatMap((day) => day.topRecommendedPosts);
  return {
    daysProcessed: days.length,
    topPostsSelected: allItems.length,
    weakPostsFlagged: allItems.filter((item) => item.weakPostWarnings.length > 0).length,
    polishNotes: allItems.reduce((sum, item) => sum + item.humanPolishNotes.length, 0),
    readyToPostItems: allItems.filter((item) => item.readyToPostManually === "Yes").length,
    vipPreviewItems: allItems.filter((item) => item.contentType === "vip_preview_teaser").length,
    platforms: PLATFORMS,
  };
}

function buildQueue({ scope, date, startDate, days }) {
  const queueDays = [];
  const state = { vipPreviewCount: 0 };

  if (scope === "date") {
    assertIsoDate(date);
    queueDays.push(buildReviewDay({
      date,
      platformPlans: platformPlansFromExportDate(date),
    }, state));
  } else {
    assertIsoDate(startDate);
    assertDays(days);
    const calendar = buildSocialCalendar({ startDate, days });
    for (const day of calendar.daysPlan) queueDays.push(buildReviewDay(day, state));
  }

  const rangeLabel = scope === "date" ? date : dateRangeLabel(startDate, days);
  const outputRoot = path.join(SOCIAL_REVIEW_ROOT, rangeLabel);
  const summary = summarizeQueue(queueDays);

  return {
    schemaVersion: 1,
    phase: "social_phase_1_package_c",
    mode: "manual_review_queue_only",
    scope,
    generatedAt: new Date().toISOString(),
    date: scope === "date" ? date : undefined,
    startDate: scope === "calendar" ? startDate : undefined,
    endDate: scope === "calendar" ? addDays(startDate, days - 1) : undefined,
    days: scope === "calendar" ? days : 1,
    outputRoot,
    platforms: PLATFORMS,
    selectionRules: {
      topPostsPerDay: "3-5",
      priorityOrder: ["mystic_card", "birth_matrix_teaser", "compatibility_hook", "daily_zodiac_reel", "weekly_forecast_batch"],
      vipPreviewLimit: "max 1-2 per week, never first post",
      weakHookPolicy: "flag repeated sign-specific hooks and dramatic phrasing for human rewrite",
    },
    safety: {
      instagramApiConnected: false,
      tiktokApiConnected: false,
      apiPosting: false,
      networkUpload: false,
      socialTokensRequired: false,
      telegramLivePublishTouched: false,
      paymentsAdded: false,
      vipUnlockAdded: false,
      cronOrWorkflowChanged: false,
    },
    reviewStatus: REVIEW_STATUS,
    manualPostingStatus: MANUAL_POSTING_STATUS,
    summary,
    daysPlan: queueDays,
  };
}

export function buildSocialReviewQueueForDate({ date }) {
  return buildQueue({ scope: "date", date });
}

export function buildSocialReviewQueueForCalendar({ startDate, days }) {
  return buildQueue({ scope: "calendar", startDate, days });
}

export function createReviewQueuePlan({ scope, date, startDate, days }) {
  const queue = scope === "date"
    ? buildSocialReviewQueueForDate({ date })
    : buildSocialReviewQueueForCalendar({ startDate, days });
  return {
    scope: queue.scope,
    date: queue.date,
    startDate: queue.startDate,
    endDate: queue.endDate,
    days: queue.days,
    outputRoot: queue.outputRoot,
    jsonPath: path.join(queue.outputRoot, "review-queue.json"),
    markdownPath: path.join(queue.outputRoot, "review-queue.md"),
    platformCopySheets: PLATFORMS.map((platform) => path.join(queue.outputRoot, `${platform}-copy-sheet.md`)),
    topPostsSelected: queue.summary.topPostsSelected,
    weakPostsFlagged: queue.summary.weakPostsFlagged,
    readyToPostItems: queue.summary.readyToPostItems,
  };
}

export function renderReviewQueueMarkdown(queue) {
  const lines = [
    `# Social Manual Review Queue - ${queue.scope === "date" ? queue.date : `${queue.startDate} to ${queue.endDate}`}`,
    "",
    `Review status: ${queue.reviewStatus}`,
    `Manual posting status: ${queue.manualPostingStatus}`,
    `Mode: ${queue.mode}`,
    "",
    "Safety: manual review only; no Instagram API, no TikTok API, no social tokens, no posting, no network upload, no payment, no VIP unlock.",
    "",
    "## Summary",
    "",
    `- Days processed: ${queue.summary.daysProcessed}`,
    `- Top posts selected: ${queue.summary.topPostsSelected}`,
    `- Weak posts flagged: ${queue.summary.weakPostsFlagged}`,
    `- Ready-to-post items: ${queue.summary.readyToPostItems}`,
    `- VIP preview items: ${queue.summary.vipPreviewItems}`,
    "",
  ];

  for (const day of queue.daysPlan) {
    lines.push(`## ${day.date}`);
    lines.push("");
    for (const item of day.topRecommendedPosts) {
      lines.push(`### ${item.priority}. ${item.platform} / ${item.contentType}`);
      lines.push("");
      lines.push(`Hook: ${item.hook}`);
      lines.push(`Ready to post manually: ${item.readyToPostManually}`);
      lines.push(`Posted manually: ${item.postedManually}`);
      lines.push(`CTA: ${item.cta.label} - ${item.cta.url}`);
      lines.push("");
      lines.push("Voiceover:");
      for (const line of item.voiceover ?? []) lines.push(`- ${line}`);
      lines.push("");
      lines.push("On-screen text:");
      for (const line of item.onScreenText ?? []) lines.push(`- ${line}`);
      lines.push("");
      lines.push("Caption:");
      lines.push(item.caption ?? "");
      lines.push("");
      lines.push(`Hashtags: ${(item.hashtags ?? []).join(" ")}`);
      lines.push("");
      lines.push("Storyboard prompt:");
      lines.push(item.storyboardPrompt9x16 ?? "");
      lines.push("");
      if (item.weakPostWarnings.length > 0) {
        lines.push("Weak-post warnings:");
        for (const warning of item.weakPostWarnings) lines.push(`- ${warning}`);
        lines.push("");
      }
      if (item.humanPolishNotes.length > 0) {
        lines.push("Human polish notes:");
        for (const note of item.humanPolishNotes) lines.push(`- ${note}`);
        lines.push("");
      }
    }
  }

  return `${lines.join("\n")}\n`;
}

export function renderPlatformCopySheet(queue, platform) {
  const lines = [
    `# ${platform} Manual Copy Sheet - ${queue.scope === "date" ? queue.date : `${queue.startDate} to ${queue.endDate}`}`,
    "",
    "Manual posting only. Review and polish before uploading in the native platform UI.",
    "",
  ];
  for (const day of queue.daysPlan) {
    const items = day.topRecommendedPosts.filter((item) => item.platform === platform);
    if (items.length === 0) continue;
    lines.push(`## ${day.date}`);
    lines.push("");
    for (const item of items) {
      lines.push(`### Priority ${item.priority}: ${item.contentType}`);
      lines.push(`Hook: ${item.hook}`);
      lines.push(`Ready to post manually: ${item.readyToPostManually}`);
      lines.push(`Human polish needed: ${item.humanPolishNeeded}`);
      lines.push(`Posted manually: ${item.postedManually}`);
      lines.push("");
      lines.push("Voiceover:");
      for (const line of item.voiceover ?? []) lines.push(`- ${line}`);
      lines.push("");
      lines.push("On-screen text:");
      for (const line of item.onScreenText ?? []) lines.push(`- ${line}`);
      lines.push("");
      lines.push("Caption:");
      lines.push(item.caption ?? "");
      lines.push("");
      lines.push(`Hashtags: ${(item.hashtags ?? []).join(" ")}`);
      lines.push(`CTA: ${item.cta.label} - ${item.cta.url}`);
      lines.push("");
      lines.push("Storyboard prompt:");
      lines.push(item.storyboardPrompt9x16 ?? "");
      lines.push("");
    }
  }
  return `${lines.join("\n")}\n`;
}

export function writeSocialReviewQueue({ scope, date, startDate, days, rootDir = process.cwd() }) {
  const queue = scope === "date"
    ? buildSocialReviewQueueForDate({ date })
    : buildSocialReviewQueueForCalendar({ startDate, days });
  const outDir = path.join(rootDir, queue.outputRoot);
  fs.mkdirSync(outDir, { recursive: true });

  const written = [];
  const jsonPath = path.join(outDir, "review-queue.json");
  const markdownPath = path.join(outDir, "review-queue.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownPath, renderReviewQueueMarkdown(queue), "utf8");
  written.push(jsonPath, markdownPath);

  for (const platform of PLATFORMS) {
    const copySheetPath = path.join(outDir, `${platform}-copy-sheet.md`);
    fs.writeFileSync(copySheetPath, renderPlatformCopySheet(queue, platform), "utf8");
    written.push(copySheetPath);
  }

  return {
    scope: queue.scope,
    date: queue.date,
    startDate: queue.startDate,
    endDate: queue.endDate,
    days: queue.days,
    outputRoot: outDir,
    written,
    topPostsSelected: queue.summary.topPostsSelected,
    weakPostsFlagged: queue.summary.weakPostsFlagged,
    readyToPostItems: queue.summary.readyToPostItems,
  };
}
