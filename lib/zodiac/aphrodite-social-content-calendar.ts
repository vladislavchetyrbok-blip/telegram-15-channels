/**
 * Aphrodite Social Content Calendar (Package 145)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC. A read-only planning calendar over the existing
 * social content / template / review / export layers. Planning only.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - No auto-posting. No automatic scheduling. No cron changes.
 *  - No Instagram / TikTok / YouTube / Telegram API calls. No browser automation.
 *  - No scraping. No stored account credentials. No database write. No external fetch. No AI API.
 *  - No copied competitor content. No active payment CTA. No real VIP unlock.
 *  - No deterministic prophecy; no medical / legal / financial / manipulation advice.
 *  - No production launch.
 */

export type AphroditeSocialCalendarPlatform =
  | "instagram"
  | "tiktok"
  | "telegram"
  | "youtube-shorts";

export type AphroditeSocialCalendarPillar =
  | "ai-love-reading"
  | "soulmate-scanner"
  | "red-flags-scanner"
  | "future-timeline"
  | "daily-message"
  | "zodiac-compatibility"
  | "angel-numbers"
  | "birth-matrix";

export type AphroditeSocialCalendarStatus =
  | "planned"
  | "draft-needed"
  | "needs-review"
  | "ready-for-manual-export"
  | "blocked-by-safety";

export type AphroditeSocialCalendarItem = {
  id: string;
  day: string;
  platform: AphroditeSocialCalendarPlatform;
  pillar: AphroditeSocialCalendarPillar;
  format: string;
  title: string;
  hook: string;
  safeCta: string;
  status: AphroditeSocialCalendarStatus;
  reviewRequirement: string[];
  manualExportNotes: string[];
  blockedActions: string[];
};

export type AphroditeSocialCalendarWeek = {
  id: string;
  title: string;
  objective: string;
  items: AphroditeSocialCalendarItem[];
  coverageNotes: string[];
  safetyNotes: string[];
};

export type AphroditeSocialCalendarBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeSocialCalendarNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

const SAFE_CTA = "Open Aphrodite in Telegram";

export const APHRODITE_CALENDAR_BLOCKED_ACTIONS: string[] = [
  "No auto-posting",
  "No platform API call",
  "No account connection",
  "No credentials",
  "No scraping",
  "No payment CTA",
  "No production scheduling",
  "No cron change",
];

export const APHRODITE_CALENDAR_SAFETY_BOUNDARIES: string[] = [
  "No auto-posting",
  "No auto-scheduling",
  "No Instagram API call",
  "No TikTok API call",
  "No YouTube API call",
  "No Telegram API call",
  "No scraping",
  "No account credentials",
  "No database write",
  "No active payment CTA",
  "No production launch",
];

const REVIEW_REQUIREMENT: string[] = [
  "Human reviewer approval before manual export",
  "Blocked-claims check",
  "Original Aphrodite voice only",
];
const MANUAL_EXPORT_NOTES: string[] = [
  "Copy by hand into the platform app.",
  "Keep the free Mini App CTA; add no payment CTA.",
  "A human posts manually; nothing is scheduled.",
];

type CalendarSeed = {
  week: 1 | 2;
  day: string;
  platform: AphroditeSocialCalendarPlatform;
  pillar: AphroditeSocialCalendarPillar;
  format: string;
  title: string;
  hook: string;
  status: AphroditeSocialCalendarStatus;
};

const CALENDAR_SEEDS: CalendarSeed[] = [
  { week: 1, day: "Monday", platform: "instagram", pillar: "ai-love-reading", format: "reel", title: "If he pulls away...", hook: "If he pulls away, it may not mean what you fear.", status: "ready-for-manual-export" },
  { week: 1, day: "Tuesday", platform: "tiktok", pillar: "soulmate-scanner", format: "short-video", title: "Your soulmate type by sign...", hook: "Your soulmate type, by your sign — a soft read.", status: "needs-review" },
  { week: 1, day: "Wednesday", platform: "instagram", pillar: "red-flags-scanner", format: "carousel", title: "One red flag your sign ignores...", hook: "One soft red flag your sign tends to overlook.", status: "needs-review" },
  { week: 1, day: "Thursday", platform: "tiktok", pillar: "future-timeline", format: "short-video", title: "What the next 30 days may bring...", hook: "What the next 30 days may gently open for you.", status: "ready-for-manual-export" },
  { week: 1, day: "Friday", platform: "telegram", pillar: "daily-message", format: "telegram-post", title: "Message from the Universe today...", hook: "A short message from the Universe for today.", status: "planned" },
  { week: 1, day: "Saturday", platform: "instagram", pillar: "zodiac-compatibility", format: "reel", title: "Compatibility tension point...", hook: "The one tension point your pairing may share.", status: "draft-needed" },
  { week: 1, day: "Sunday", platform: "instagram", pillar: "angel-numbers", format: "story-card", title: "Angel number meaning...", hook: "Seeing the same number? A gentle meaning.", status: "planned" },
  { week: 2, day: "Monday", platform: "youtube-shorts", pillar: "birth-matrix", format: "short-video", title: "Birth matrix hidden pattern...", hook: "A hidden pattern your birth matrix may hint at.", status: "blocked-by-safety" },
  { week: 2, day: "Tuesday", platform: "instagram", pillar: "ai-love-reading", format: "story-card", title: "What he may feel...", hook: "A soft read on what he may be feeling.", status: "planned" },
  { week: 2, day: "Wednesday", platform: "tiktok", pillar: "red-flags-scanner", format: "short-video", title: "Notice this before you fall...", hook: "A gentle thing worth noticing before you fall.", status: "needs-review" },
  { week: 2, day: "Thursday", platform: "telegram", pillar: "daily-message", format: "telegram-post", title: "Today's gentle reminder...", hook: "Trust the steady, not the loud.", status: "ready-for-manual-export" },
  { week: 2, day: "Friday", platform: "instagram", pillar: "soulmate-scanner", format: "carousel", title: "Where you may meet them...", hook: "A soft read on where you may meet a fitting person.", status: "planned" },
  { week: 2, day: "Saturday", platform: "tiktok", pillar: "future-timeline", format: "short-video", title: "Your best window soon...", hook: "A possible best window may open in the coming weeks.", status: "draft-needed" },
  { week: 2, day: "Sunday", platform: "instagram", pillar: "zodiac-compatibility", format: "text-card", title: "Your pairing's strength...", hook: "The quiet strength your pairing may share.", status: "planned" },
];

function toItem(seed: CalendarSeed, index: number): AphroditeSocialCalendarItem {
  return {
    id: `cal-w${seed.week}-${String(index + 1).padStart(2, "0")}-${seed.pillar}`,
    day: seed.day,
    platform: seed.platform,
    pillar: seed.pillar,
    format: seed.format,
    title: seed.title,
    hook: seed.hook,
    safeCta: SAFE_CTA,
    status: seed.status,
    reviewRequirement: REVIEW_REQUIREMENT.slice(),
    manualExportNotes: MANUAL_EXPORT_NOTES.slice(),
    blockedActions: APHRODITE_CALENDAR_BLOCKED_ACTIONS.slice(),
  };
}

export function getAphroditeSocialContentCalendarItems(): AphroditeSocialCalendarItem[] {
  return CALENDAR_SEEDS.map((seed, i) => toItem(seed, i));
}

export function getAphroditeSocialContentCalendarWeeks(): AphroditeSocialCalendarWeek[] {
  const all = getAphroditeSocialContentCalendarItems();
  const mk = (week: 1 | 2, title: string, objective: string): AphroditeSocialCalendarWeek => {
    const items = CALENDAR_SEEDS.map((s, i) => ({ s, i })).filter(({ s }) => s.week === week).map(({ i }) => all[i]);
    return {
      id: `week-${week}`,
      title,
      objective,
      items,
      coverageNotes: [
        `Platforms this week: ${Array.from(new Set(items.map((it) => it.platform))).join(", ")}.`,
        `Pillars this week: ${Array.from(new Set(items.map((it) => it.pillar))).join(", ")}.`,
      ],
      safetyNotes: ["Planning only — nothing is scheduled or posted.", "Every item exports manually after human review."],
    };
  };
  return [
    mk(1, "Week 1 — Emotional hooks", "Open with relationship feelings; rotate pillars and platforms."),
    mk(2, "Week 2 — Depth & discovery", "Go deeper on patterns and timing; keep manual review gating."),
  ];
}

export function getAphroditeSocialContentCalendarCoverageSummary(): {
  platforms: AphroditeSocialCalendarPlatform[];
  pillars: AphroditeSocialCalendarPillar[];
  totalItems: number;
  readyForManualExport: number;
  needsReview: number;
  blockedBySafety: number;
} {
  const items = getAphroditeSocialContentCalendarItems();
  const platforms = Array.from(new Set(items.map((i) => i.platform))) as AphroditeSocialCalendarPlatform[];
  const pillars = Array.from(new Set(items.map((i) => i.pillar))) as AphroditeSocialCalendarPillar[];
  return {
    platforms,
    pillars,
    totalItems: items.length,
    readyForManualExport: items.filter((i) => i.status === "ready-for-manual-export").length,
    needsReview: items.filter((i) => i.status === "needs-review").length,
    blockedBySafety: items.filter((i) => i.status === "blocked-by-safety").length,
  };
}

export function getAphroditeSocialContentCalendarBoundaries(): AphroditeSocialCalendarBoundary[] {
  return [
    { area: "Calendar planning (read-only weeks + items)", allowedNow: ["plan day / platform / pillar mix", "track manual review + export status"], blockedUntil: [], riskLevel: "low" },
    { area: "Auto-scheduling / auto-posting / cron", allowedNow: [], blockedUntil: ["never — out of scope by design"], riskLevel: "critical" },
    { area: "Platform API / scraping / credentials / browser automation", allowedNow: [], blockedUntil: ["never — out of scope by design"], riskLevel: "critical" },
    { area: "Database write / payments / real VIP unlock / production launch", allowedNow: [], blockedUntil: ["explicit owner approval", "legal", "real-implementation packages"], riskLevel: "high" },
  ];
}

export function getAphroditeSocialContentCalendarNextSteps(): AphroditeSocialCalendarNextStep[] {
  return [
    { package: "Package 146", title: "Public Bot Profile / Main Mini App Launch Packaging", purpose: "Package the public-facing profile and Mini App launch materials (no live launch).", blockedUntil: ["this calendar approved", "owner approval"] },
    { package: "Future", title: "Assisted manual planning aids", purpose: "Export-only planning aids; never auto-scheduling.", blockedUntil: ["explicit owner approval", "platform ToS review"] },
  ];
}
