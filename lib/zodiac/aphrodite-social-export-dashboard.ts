/**
 * Aphrodite Social Export Dashboard (Package 144)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC. A read-only manual export layer on top of the
 * Package 143 review queue. It only helps a human copy approved drafts out by hand.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - No auto-posting. No "Post now". No "Connect account". No scheduling.
 *  - No Instagram / TikTok / YouTube / Telegram API calls. No browser automation.
 *  - No scraping. No stored account credentials / tokens.
 *  - No database write. No external fetch. No AI API.
 *  - No copied competitor content. No active payment CTA. No real VIP unlock.
 *  - No deterministic prophecy; no medical / legal / financial / manipulation advice.
 *  - No production launch.
 */

export type AphroditeSocialExportPlatform =
  | "instagram"
  | "tiktok"
  | "telegram"
  | "youtube-shorts";

export type AphroditeSocialExportStatus =
  | "not-ready"
  | "ready-for-manual-export"
  | "blocked-by-safety"
  | "needs-copy-review";

export type AphroditeSocialExportItem = {
  id: string;
  sourceDraftId: string;
  platform: AphroditeSocialExportPlatform;
  title: string;
  hook: string;
  bodyLines: string[];
  caption: string;
  hashtags: string[];
  safeCta: string;
  exportStatus: AphroditeSocialExportStatus;
  manualExportInstructions: string[];
  safetyChecklist: string[];
  blockedActions: string[];
};

export type AphroditeSocialExportPlatformGuide = {
  platform: AphroditeSocialExportPlatform;
  recommendedFormats: string[];
  copyNotes: string[];
  manualExportSteps: string[];
  blockedAutomation: string[];
};

export type AphroditeSocialExportBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeSocialExportNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

const SAFE_CTA = "Open Aphrodite in Telegram";

export const APHRODITE_EXPORT_BLOCKED_ACTIONS: string[] = [
  "No auto-posting",
  "No platform API call",
  "No account connection",
  "No credentials",
  "No scraping",
  "No payment CTA",
  "No production scheduling",
];

export const APHRODITE_EXPORT_SAFETY_BOUNDARIES: string[] = [
  "No auto-posting",
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

export const APHRODITE_EXPORT_MANUAL_INSTRUCTIONS: string[] = [
  "Copy the hook, body lines, caption, and hashtags by hand.",
  "Paste them into the platform app yourself — no connection is made from here.",
  "Keep the safe Mini App CTA; do not add any payment or unlock CTA.",
  "A human posts manually; nothing is scheduled or auto-posted.",
];

export const APHRODITE_EXPORT_SAFETY_CHECKLIST: string[] = [
  "Reviewed and approved by a human",
  "No platform API call",
  "No auto-posting",
  "No account credentials",
  "No payment CTA",
  "No copied competitor content",
  "No deterministic claim",
  "Manual export only",
];

type ExportSeed = {
  pillar: string;
  platform: AphroditeSocialExportPlatform;
  draftId: string;
  title: string;
  hook: string;
  body: string[];
  caption: string;
  hashtags: string[];
  status: AphroditeSocialExportStatus;
};

const EXPORT_SEEDS: ExportSeed[] = [
  { pillar: "ai-love-reading", platform: "instagram", draftId: "review-01-ai-love-reading", title: "If he pulls away...", hook: "If he pulls away, it may not mean what you fear.", body: ["Name the fear gently.", "Reframe as a possible pattern, not a verdict.", "Invite a free preview."], caption: "A soft, original Aphrodite read on distance.", hashtags: ["#aphrodite", "#zodiac", "#love", "#lovereading"], status: "ready-for-manual-export" },
  { pillar: "soulmate-scanner", platform: "tiktok", draftId: "review-02-soulmate-scanner", title: "Your soulmate type by sign...", hook: "Your soulmate type, by your sign — a soft read.", body: ["Open with the question everyone asks.", "Soft read by element.", "Invite a personal preview."], caption: "Partner energy that may fit your sign.", hashtags: ["#aphrodite", "#zodiac", "#soulmate"], status: "ready-for-manual-export" },
  { pillar: "red-flags-scanner", platform: "instagram", draftId: "review-03-red-flags-scanner", title: "One red flag your sign ignores...", hook: "One soft red flag your sign tends to overlook.", body: ["A caring warning, not an accusation.", "Frame as a zone of attention.", "Invite a pattern check."], caption: "A gentle zone of attention.", hashtags: ["#aphrodite", "#zodiac", "#redflags"], status: "needs-copy-review" },
  { pillar: "future-timeline", platform: "tiktok", draftId: "review-04-future-timeline", title: "What the next 30 days may bring...", hook: "What the next 30 days may gently open for you.", body: ["Spark curiosity about what's next.", "A soft window: love / opportunity / attention.", "Invite into Telegram."], caption: "A soft window — never a fixed promise.", hashtags: ["#aphrodite", "#zodiac", "#futureforecast"], status: "ready-for-manual-export" },
  { pillar: "daily-message", platform: "telegram", draftId: "review-05-daily-message", title: "Message from the Universe today...", hook: "A short message from the Universe for today.", body: ["One short, kind line.", "A personal angle.", "Invite a preview."], caption: "Today's gentle reminder.", hashtags: ["#aphrodite", "#zodiac", "#dailymessage"], status: "ready-for-manual-export" },
  { pillar: "zodiac-compatibility", platform: "instagram", draftId: "review-06-zodiac-compatibility", title: "Compatibility tension point...", hook: "The one tension point your pairing may share.", body: ["Name the tension everyone feels.", "Soft read on where friction may sit.", "Invite a pattern check."], caption: "Soft guidance on where friction may sit.", hashtags: ["#aphrodite", "#zodiac", "#compatibility"], status: "not-ready" },
  { pillar: "angel-numbers", platform: "instagram", draftId: "review-07-angel-numbers", title: "Angel number meaning...", hook: "Seeing the same number? A gentle meaning.", body: ["Name the coincidence.", "Offer a soft, reassuring meaning.", "Invite into Telegram."], caption: "A soft, reassuring read.", hashtags: ["#aphrodite", "#zodiac", "#angelnumbers"], status: "ready-for-manual-export" },
  { pillar: "birth-matrix", platform: "youtube-shorts", draftId: "review-08-birth-matrix", title: "Birth matrix hidden pattern...", hook: "A hidden pattern your birth matrix may hint at.", body: ["Tease a hidden pattern.", "Frame as a tendency, not a fate.", "Invite a personal preview."], caption: "A tendency to explore, not a fixed fate.", hashtags: ["#aphrodite", "#zodiac", "#birthmatrix"], status: "blocked-by-safety" },
];

export function getAphroditeSocialExportItems(): AphroditeSocialExportItem[] {
  return EXPORT_SEEDS.map((seed, i) => ({
    id: `export-${String(i + 1).padStart(2, "0")}-${seed.pillar}`,
    sourceDraftId: seed.draftId,
    platform: seed.platform,
    title: seed.title,
    hook: seed.hook,
    bodyLines: seed.body.slice(),
    caption: seed.caption,
    hashtags: seed.hashtags.slice(),
    safeCta: SAFE_CTA,
    exportStatus: seed.status,
    manualExportInstructions: APHRODITE_EXPORT_MANUAL_INSTRUCTIONS.slice(),
    safetyChecklist: APHRODITE_EXPORT_SAFETY_CHECKLIST.slice(),
    blockedActions: APHRODITE_EXPORT_BLOCKED_ACTIONS.slice(),
  }));
}

export function getAphroditeSocialExportPlatformGuides(): AphroditeSocialExportPlatformGuide[] {
  const blocked = ["No auto-posting", "No platform API call", "No account connection", "No scheduling"];
  return [
    { platform: "instagram", recommendedFormats: ["Reel", "Story card", "Carousel", "Text card"], copyNotes: ["Keep the hook in the first line.", "Caption carries the CTA; hashtags at the end."], manualExportSteps: ["Copy hook + body + caption.", "Paste into Instagram by hand.", "Add hashtags, then post manually."], blockedAutomation: blocked.slice() },
    { platform: "tiktok", recommendedFormats: ["Short video"], copyNotes: ["Hook is the on-screen first line.", "Caption is short; CTA points to Telegram."], manualExportSteps: ["Copy hook + body for the script.", "Record manually.", "Paste caption + hashtags, then post manually."], blockedAutomation: blocked.slice() },
    { platform: "telegram", recommendedFormats: ["Telegram post", "Lead magnet"], copyNotes: ["Plain text post; CTA links to the Mini App.", "No live Telegram API is used here."], manualExportSteps: ["Copy the full post.", "Paste into your channel by hand.", "Post manually."], blockedAutomation: blocked.slice() },
    { platform: "youtube-shorts", recommendedFormats: ["Short video"], copyNotes: ["Hook as the title line.", "Description carries hashtags + CTA."], manualExportSteps: ["Copy hook + body for the script.", "Record manually.", "Paste description, then upload manually."], blockedAutomation: blocked.slice() },
  ];
}

export function getAphroditeSocialExportBoundaries(): AphroditeSocialExportBoundary[] {
  return [
    { area: "Manual export view (read-only copy blocks)", allowedNow: ["copy hook / body / caption / hashtags by hand"], blockedUntil: [], riskLevel: "low" },
    { area: '"Post now" / "Connect account" / scheduling', allowedNow: [], blockedUntil: ["never — out of scope by design"], riskLevel: "critical" },
    { area: "Platform API / scraping / credentials / browser automation", allowedNow: [], blockedUntil: ["never — out of scope by design"], riskLevel: "critical" },
    { area: "Database write / payments / real VIP unlock / production launch", allowedNow: [], blockedUntil: ["explicit owner approval", "legal", "real-implementation packages"], riskLevel: "high" },
  ];
}

export function getAphroditeSocialExportNextSteps(): AphroditeSocialExportNextStep[] {
  return [
    { package: "Package 145", title: "Social Content Calendar", purpose: "A read-only manual calendar view for planning (no scheduling / no auto-posting).", blockedUntil: ["this export dashboard approved"] },
    { package: "Future", title: "Assisted manual planning", purpose: "Export-only planning aids; never auto-posting.", blockedUntil: ["explicit owner approval", "platform ToS review"] },
  ];
}

/** A draft is exportable only when a human has marked it ready for manual export. */
export function isAphroditeSocialExportReady(item: AphroditeSocialExportItem): boolean {
  return item.exportStatus === "ready-for-manual-export";
}
