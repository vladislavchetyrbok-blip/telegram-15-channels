import fs from "fs";
import path from "path";
import process from "process";
import { PLATFORMS, buildSocialExportBundle } from "./social-manual-export-generator.mjs";

export const SOCIAL_CALENDAR_ROOT = "data/social-calendar";
export const SUPPORTED_CALENDAR_DAYS = [7, 14];

const REVIEW_STATUS = "needs_manual_review";
const SIGN_ROTATION = [
  "leo",
  "gemini",
  "aries",
  "scorpio",
  "libra",
  "taurus",
  "pisces",
  "sagittarius",
  "virgo",
  "aquarius",
  "capricorn",
  "cancer",
];
const COMPATIBILITY_ROTATION = ["zodiac-general", "aries", "leo", "scorpio"];

function assertIsoDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) {
    throw new Error("Expected --start YYYY-MM-DD.");
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("Expected a real calendar date in YYYY-MM-DD format.");
  }
}

function assertDays(days) {
  if (!SUPPORTED_CALENDAR_DAYS.includes(days)) {
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

function getItem(pack, predicate, description) {
  const item = pack.items.find(predicate);
  if (!item) throw new Error(`Missing calendar source item: ${pack.platform} ${pack.date} ${description}`);
  return item;
}

function compactCalendarItem(item, role) {
  return {
    role,
    id: item.id,
    platform: item.platform,
    contentType: item.contentType,
    title: item.title,
    hook: item.hook,
    cta: item.cta,
    reviewStatus: item.reviewStatus,
    storyboardPrompt9x16: item.storyboardPrompt9x16,
    sourceItem: item,
  };
}

function buildPlatformPlan(pack, dayIndex) {
  const signSlug = SIGN_ROTATION[dayIndex % SIGN_ROTATION.length];
  const compatibilitySlug = COMPATIBILITY_ROTATION[dayIndex % COMPATIBILITY_ROTATION.length];
  const thirdContentType = dayIndex % 2 === 0 ? "compatibility_hook" : "birth_matrix_teaser";
  const items = [
    compactCalendarItem(
      getItem(pack, (item) => item.contentType === "mystic_card", "daily mystic card"),
      "daily_mystic_card"
    ),
    compactCalendarItem(
      getItem(pack, (item) => item.id.endsWith(`daily-${signSlug}`), `daily sign ${signSlug}`),
      "daily_sign_specific"
    ),
  ];

  if (thirdContentType === "compatibility_hook") {
    items.push(compactCalendarItem(
      getItem(pack, (item) => item.id.endsWith(`compatibility-${compatibilitySlug}`), `compatibility ${compatibilitySlug}`),
      "daily_compatibility_hook"
    ));
  } else {
    items.push(compactCalendarItem(
      getItem(pack, (item) => item.contentType === "birth_matrix_teaser", "birth matrix teaser"),
      "daily_birth_matrix_hook"
    ));
  }

  if (dayIndex % 7 === 0) {
    items.push(compactCalendarItem(
      getItem(pack, (item) => item.contentType === "weekly_forecast_batch", "weekly forecast batch"),
      "weekly_forecast_batch"
    ));
  }

  if (dayIndex % 7 === 5) {
    items.push(compactCalendarItem(
      getItem(pack, (item) => item.contentType === "vip_preview_teaser", "vip preview teaser"),
      "vip_preview_locked"
    ));
  }

  return {
    platform: pack.platform,
    date: pack.date,
    items,
    reviewStatus: REVIEW_STATUS,
  };
}

function buildWeakPostWarnings(day) {
  const warnings = [];
  for (const platformPlan of day.platformPlans) {
    const signItem = platformPlan.items.find((item) => item.role === "daily_sign_specific");
    if (signItem) {
      warnings.push(`${platformPlan.platform}: sign-specific daily hook uses the generated repeated template; rewrite the first 3 seconds before manual posting.`);
    }
    const weeklyItem = platformPlan.items.find((item) => item.role === "weekly_forecast_batch");
    if (weeklyItem) {
      warnings.push(`${platformPlan.platform}: weekly batch copy may include internal source wording; human should polish caption and voiceover.`);
    }
    const vipItem = platformPlan.items.find((item) => item.role === "vip_preview_locked");
    if (vipItem) {
      warnings.push(`${platformPlan.platform}: VIP preview is allowed only as locked preview; do not add payment or unlock wording.`);
    }
  }
  return warnings;
}

function buildHumanPolishNotes(day) {
  const notes = [
    "Review hook strength before posting.",
    "Keep astrology language entertainment-style and avoid certainty claims.",
    "Trim captions for the native platform UI before manual upload.",
  ];
  if (day.dayIndex === 0) {
    notes.unshift("Start with Instagram Mystic Card, matching the owner review recommendation.");
  }
  if (day.platformPlans.some((plan) => plan.items.some((item) => item.contentType === "weekly_forecast_batch"))) {
    notes.push("Remove any internal wording such as weekly batch or 13 channels from public copy.");
  }
  return notes;
}

function buildCtaNotes(day) {
  const urls = new Set();
  for (const platformPlan of day.platformPlans) {
    for (const item of platformPlan.items) urls.add(item.cta.url);
  }
  return [
    "All CTAs must remain Telegram bot / Mini App startapp links.",
    "Do not replace CTA with admin, dashboard, payment, or social API URLs.",
    ...Array.from(urls).map((url) => `CTA checked: ${url}`),
  ];
}

function chooseRecommendedFirstPost(day) {
  if (day.dayIndex === 0) {
    const instagram = day.platformPlans.find((plan) => plan.platform === "instagram");
    const mystic = instagram?.items.find((item) => item.contentType === "mystic_card");
    if (mystic) {
      return {
        platform: "instagram",
        itemId: mystic.id,
        contentType: mystic.contentType,
        hook: mystic.hook,
        reason: "Strongest first manual post from content review: visual, safe, clear CTA.",
      };
    }
  }

  const preferredPlatform = day.dayIndex % 2 === 0 ? "instagram" : "tiktok";
  const platformPlan = day.platformPlans.find((plan) => plan.platform === preferredPlatform) ?? day.platformPlans[0];
  const priority = ["mystic_card", "birth_matrix_teaser", "compatibility_hook", "daily_zodiac_reel", "weekly_forecast_batch", "vip_preview_teaser"];
  for (const contentType of priority) {
    const item = platformPlan.items.find((candidate) => candidate.contentType === contentType);
    if (item) {
      return {
        platform: platformPlan.platform,
        itemId: item.id,
        contentType: item.contentType,
        hook: item.hook,
        reason: "Balanced rotation pick for manual social posting.",
      };
    }
  }
  const fallback = platformPlan.items[0];
  return {
    platform: platformPlan.platform,
    itemId: fallback.id,
    contentType: fallback.contentType,
    hook: fallback.hook,
    reason: "Fallback first item from daily plan.",
  };
}

function buildCalendarDay({ date, dayIndex }) {
  const exportBundle = buildSocialExportBundle({ date });
  const platformPlans = exportBundle.platforms.map((pack) => buildPlatformPlan(pack, dayIndex));
  const day = {
    date,
    dayIndex,
    platformPlans,
    instagramReelsPlan: platformPlans.find((plan) => plan.platform === "instagram"),
    tiktokPlan: platformPlans.find((plan) => plan.platform === "tiktok"),
    contentTypeRotation: Array.from(new Set(platformPlans.flatMap((plan) => plan.items.map((item) => item.contentType)))),
    weakPostWarnings: [],
    humanPolishNotes: [],
    ctaNotes: [],
    reviewStatus: REVIEW_STATUS,
  };
  day.weakPostWarnings = buildWeakPostWarnings(day);
  day.humanPolishNotes = buildHumanPolishNotes(day);
  day.ctaNotes = buildCtaNotes(day);
  day.recommendedFirstPost = chooseRecommendedFirstPost(day);
  return day;
}

export function buildSocialCalendar({ startDate, days }) {
  assertIsoDate(startDate);
  assertDays(days);
  const endDate = addDays(startDate, days - 1);
  const rangeLabel = dateRangeLabel(startDate, days);
  const calendarDays = Array.from({ length: days }, (_, dayIndex) => buildCalendarDay({
    date: addDays(startDate, dayIndex),
    dayIndex,
  }));
  const allItems = calendarDays.flatMap((day) => day.platformPlans.flatMap((plan) => plan.items));
  const vipItems = allItems.filter((item) => item.contentType === "vip_preview_teaser");

  return {
    schemaVersion: 1,
    phase: "social_phase_1_package_b",
    mode: "manual_calendar_only",
    generatedAt: new Date().toISOString(),
    startDate,
    endDate,
    days,
    rangeLabel,
    outputRoot: path.join(SOCIAL_CALENDAR_ROOT, rangeLabel),
    platforms: PLATFORMS,
    rotationRules: {
      dailyMysticCardPerDay: 1,
      dailySignSpecificPerDay: 1,
      dailyCompatibilityOrBirthMatrixPerDay: 1,
      weeklyForecastBatch: "once per 7-day block",
      vipPreviewTeaser: "once per 7-day block, locked preview only",
    },
    safety: {
      instagramApiConnected: false,
      tiktokApiConnected: false,
      apiPosting: false,
      socialTokensRequired: false,
      telegramLivePublishTouched: false,
      paymentsAdded: false,
      vipUnlockAdded: false,
      cronOrWorkflowChanged: false,
    },
    reviewStatus: REVIEW_STATUS,
    summary: {
      instagramItems: allItems.filter((item) => item.platform === "instagram").length,
      tiktokItems: allItems.filter((item) => item.platform === "tiktok").length,
      vipPreviewItems: vipItems.length,
      uniqueContentTypes: Array.from(new Set(allItems.map((item) => item.contentType))).sort(),
    },
    daysPlan: calendarDays,
  };
}

export function createCalendarPlan({ startDate, days }) {
  const calendar = buildSocialCalendar({ startDate, days });
  return {
    startDate: calendar.startDate,
    endDate: calendar.endDate,
    days: calendar.days,
    outputRoot: calendar.outputRoot,
    jsonPath: path.join(calendar.outputRoot, "calendar.json"),
    markdownPath: path.join(calendar.outputRoot, "calendar.md"),
    instagramItems: calendar.summary.instagramItems,
    tiktokItems: calendar.summary.tiktokItems,
    contentTypes: calendar.summary.uniqueContentTypes,
  };
}

export function renderCalendarMarkdown(calendar) {
  const lines = [
    `# Social Manual Calendar - ${calendar.startDate} to ${calendar.endDate}`,
    "",
    `Review status: ${calendar.reviewStatus}`,
    `Mode: ${calendar.mode}`,
    "",
    "Safety: manual posting only; no Instagram API, no TikTok API, no social tokens, no payment, no VIP unlock, no Telegram live publish.",
    "",
    "## Rotation Rules",
    "",
    `- Daily mystic/card posts: ${calendar.rotationRules.dailyMysticCardPerDay}`,
    `- Daily sign-specific posts: ${calendar.rotationRules.dailySignSpecificPerDay}`,
    `- Daily compatibility or birth-matrix hooks: ${calendar.rotationRules.dailyCompatibilityOrBirthMatrixPerDay}`,
    `- Weekly forecast batch: ${calendar.rotationRules.weeklyForecastBatch}`,
    `- VIP preview teaser: ${calendar.rotationRules.vipPreviewTeaser}`,
    "",
  ];

  for (const day of calendar.daysPlan) {
    lines.push(`## ${day.date}`);
    lines.push("");
    lines.push(`Recommended first post: ${day.recommendedFirstPost.platform} / ${day.recommendedFirstPost.contentType} / ${day.recommendedFirstPost.hook}`);
    lines.push(`Reason: ${day.recommendedFirstPost.reason}`);
    lines.push("");
    for (const platformPlan of day.platformPlans) {
      lines.push(`### ${platformPlan.platform}`);
      for (const item of platformPlan.items) {
        lines.push(`- ${item.role}: ${item.contentType} | ${item.hook} | CTA: ${item.cta.url}`);
      }
      lines.push("");
    }
    lines.push("Weak-post warnings:");
    for (const warning of day.weakPostWarnings) lines.push(`- ${warning}`);
    lines.push("");
    lines.push("Human polish notes:");
    for (const note of day.humanPolishNotes) lines.push(`- ${note}`);
    lines.push("");
    lines.push("CTA notes:");
    for (const note of day.ctaNotes) lines.push(`- ${note}`);
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function writeSocialCalendar({ startDate, days, rootDir = process.cwd() }) {
  const calendar = buildSocialCalendar({ startDate, days });
  const outDir = path.join(rootDir, calendar.outputRoot);
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, "calendar.json");
  const markdownPath = path.join(outDir, "calendar.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(calendar, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownPath, renderCalendarMarkdown(calendar), "utf8");
  return {
    startDate: calendar.startDate,
    endDate: calendar.endDate,
    days: calendar.days,
    outputRoot: outDir,
    written: [jsonPath, markdownPath],
    instagramItems: calendar.summary.instagramItems,
    tiktokItems: calendar.summary.tiktokItems,
  };
}
