/**
 * Aphrodite Social Traffic Layer Architecture (Package 141)
 *
 * STATIC, READ-ONLY ARCHITECTURE. Defines the social traffic strategy for Aphrodite
 * across Instagram, TikTok, Telegram, and YouTube Shorts. This is planning only.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - No auto-posting. No Instagram / TikTok / YouTube / Telegram API calls.
 *  - No scraping. No stored account credentials. No browser automation.
 *  - No copied competitor content (original Aphrodite voice only).
 *  - No deterministic prophecy. No "guaranteed love" / "spell" / "he will return" claims.
 *  - No medical / legal / financial advice. No manipulation advice.
 *  - No active payment CTA. No real VIP unlock. No database writes. No production launch.
 */

export type AphroditeSocialPlatform =
  | "instagram"
  | "tiktok"
  | "telegram"
  | "youtube-shorts";

export type AphroditeSocialContentPillar =
  | "ai-love-reading"
  | "soulmate-scanner"
  | "red-flags-scanner"
  | "future-timeline"
  | "daily-message"
  | "zodiac-compatibility"
  | "angel-numbers"
  | "birth-matrix";

export type AphroditeSocialFormat =
  | "reel"
  | "short-video"
  | "story-card"
  | "carousel"
  | "text-card"
  | "telegram-post"
  | "lead-magnet";

export type AphroditeSocialTrafficHook = {
  id: string;
  platform: AphroditeSocialPlatform;
  pillar: AphroditeSocialContentPillar;
  format: AphroditeSocialFormat;
  hook: string;
  emotionalTrigger: string;
  safeCta: string;
  blockedClaims: string[];
};

export type AphroditeSocialContentTemplate = {
  id: string;
  title: string;
  platform: AphroditeSocialPlatform;
  format: AphroditeSocialFormat;
  structure: string[];
  exampleSafeCopy: string[];
  miniAppCta: string;
  safetyBoundary: string[];
};

export type AphroditeSocialTrafficBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeSocialTrafficNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

/** Claims that are never allowed in any Aphrodite social content. */
export const APHRODITE_SOCIAL_BLOCKED_CLAIMS: string[] = [
  "guaranteed love",
  "loyalty magic / spell",
  "100% prediction",
  "he will definitely return",
  "deterministic prophecy",
  "medical / legal / financial advice",
  "manipulation tactics",
];

/** Safe, non-payment calls to action that point to the Telegram Mini App. */
export const APHRODITE_SOCIAL_SAFE_CTAS: string[] = [
  "Open Aphrodite in Telegram",
  "Get your free Love Reading preview",
  "Check your relationship pattern",
  "Open your personal preview",
];

export const APHRODITE_SOCIAL_SAFETY_BOUNDARIES: string[] = [
  "No auto-posting",
  "No Instagram API call",
  "No TikTok API call",
  "No YouTube API call",
  "No Telegram API call",
  "No scraping",
  "No account credentials",
  "No copied competitor content",
  "No deterministic prophecy",
  "No medical/legal/financial advice",
  "No manipulation advice",
  "No active payment CTA",
  "No real VIP unlock",
  "No production launch",
];

export const APHRODITE_SOCIAL_PLATFORM_MATRIX: {
  platform: AphroditeSocialPlatform;
  label: string;
  formats: AphroditeSocialFormat[];
  role: string;
}[] = [
  { platform: "instagram", label: "Instagram (Reels / Stories / carousel & text cards)", formats: ["reel", "story-card", "carousel", "text-card"], role: "Top-of-funnel reach + saveable cards." },
  { platform: "tiktok", label: "TikTok (short videos)", formats: ["short-video"], role: "Viral discovery and relatable hooks." },
  { platform: "telegram", label: "Telegram (posts + Mini App entry)", formats: ["telegram-post", "lead-magnet"], role: "Owned channel + direct Mini App entry." },
  { platform: "youtube-shorts", label: "YouTube Shorts (future short-video layer)", formats: ["short-video"], role: "Future evergreen short-video reach." },
];

export const APHRODITE_SOCIAL_CONTENT_PILLARS: { pillar: AphroditeSocialContentPillar; label: string; coreQuestion: string }[] = [
  { pillar: "ai-love-reading", label: "AI Love Reading", coreQuestion: "Does he love me? What does he feel?" },
  { pillar: "soulmate-scanner", label: "Soulmate Scanner", coreQuestion: "What kind of person is meant for me?" },
  { pillar: "red-flags-scanner", label: "Red Flags Scanner", coreQuestion: "What red flags should I notice?" },
  { pillar: "future-timeline", label: "AI Future Timeline", coreQuestion: "What is coming next?" },
  { pillar: "daily-message", label: "Daily Message From Universe", coreQuestion: "What should I hear today?" },
  { pillar: "zodiac-compatibility", label: "Zodiac compatibility", coreQuestion: "Are we compatible? Where is the tension?" },
  { pillar: "angel-numbers", label: "Angel numbers / mystic coincidences", coreQuestion: "What does this sign / number mean?" },
  { pillar: "birth-matrix", label: "Birth matrix hooks", coreQuestion: "What hidden pattern shapes me?" },
];

export function getAphroditeSocialTrafficHooks(): AphroditeSocialTrafficHook[] {
  const blocked = APHRODITE_SOCIAL_BLOCKED_CLAIMS.slice();
  return [
    { id: "hook-love-pullaway", platform: "instagram", pillar: "ai-love-reading", format: "reel", hook: "When he pulls away, it may not mean what you fear.", emotionalTrigger: "fear of distance", safeCta: "Get your free Love Reading preview", blockedClaims: blocked },
    { id: "hook-soulmate-type", platform: "tiktok", pillar: "soulmate-scanner", format: "short-video", hook: "Your soulmate type, by your sign — a soft read.", emotionalTrigger: "hope of meeting", safeCta: "Open your personal preview", blockedClaims: blocked },
    { id: "hook-red-flag", platform: "instagram", pillar: "red-flags-scanner", format: "carousel", hook: "One soft red flag your sign tends to ignore.", emotionalTrigger: "self-protection", safeCta: "Check your relationship pattern", blockedClaims: blocked },
    { id: "hook-future-30", platform: "tiktok", pillar: "future-timeline", format: "short-video", hook: "What the next 30 days may gently open for you.", emotionalTrigger: "curiosity about the future", safeCta: "Open Aphrodite in Telegram", blockedClaims: blocked },
    { id: "hook-daily-message", platform: "telegram", pillar: "daily-message", format: "telegram-post", hook: "A short message from the Universe for today.", emotionalTrigger: "daily reassurance", safeCta: "Open your personal preview", blockedClaims: blocked },
    { id: "hook-angel-number", platform: "instagram", pillar: "angel-numbers", format: "story-card", hook: "Seeing the same number? A gentle meaning.", emotionalTrigger: "meaning-seeking", safeCta: "Open Aphrodite in Telegram", blockedClaims: blocked },
    { id: "hook-birth-matrix", platform: "youtube-shorts", pillar: "birth-matrix", format: "short-video", hook: "A hidden pattern your birth matrix may hint at.", emotionalTrigger: "self-discovery", safeCta: "Open your personal preview", blockedClaims: blocked },
    { id: "hook-compatibility-tension", platform: "instagram", pillar: "zodiac-compatibility", format: "reel", hook: "The one tension point your pairing may share.", emotionalTrigger: "relationship clarity", safeCta: "Check your relationship pattern", blockedClaims: blocked },
  ];
}

export function getAphroditeSocialContentTemplates(): AphroditeSocialContentTemplate[] {
  const sb = APHRODITE_SOCIAL_SAFETY_BOUNDARIES.slice();
  const t = (
    id: string, title: string, platform: AphroditeSocialPlatform, format: AphroditeSocialFormat,
    structure: string[], copy: string[], cta: string
  ): AphroditeSocialContentTemplate => ({ id, title, platform, format, structure, exampleSafeCopy: copy, miniAppCta: cta, safetyBoundary: sb });

  return [
    t("tpl-pull-away", "\"If he pulls away…\" relationship hook", "instagram", "reel",
      ["Hook: name the fear softly", "Reframe: a possible pattern, not a verdict", "Invite: open your free preview"],
      ["If he pulls away, it may be a need for space — a possible pattern, not a final judgment.", "Notice the repair, not just the distance."],
      "Get your free Love Reading preview"),
    t("tpl-soulmate-type", "\"Your soulmate type by sign…\" hook", "tiktok", "short-video",
      ["Hook: the question everyone asks", "Soft read: partner type by element", "Invite: open your personal preview"],
      ["Your soulmate type may lean toward someone who balances your element.", "This is a possible pattern, never a guarantee."],
      "Open your personal preview"),
    t("tpl-red-flag", "\"One red flag your sign ignores…\" hook", "instagram", "carousel",
      ["Hook: a gentle warning", "Zone of attention: framed softly", "Invite: check your pattern"],
      ["A soft zone of attention worth noticing — not an accusation about anyone."],
      "Check your relationship pattern"),
    t("tpl-next-30", "\"What the next 30 days may bring…\" hook", "tiktok", "short-video",
      ["Hook: curiosity about what's next", "Soft window: love / opportunity / attention", "Invite: open in Telegram"],
      ["The next 30 days may open a soft window for connection — possible, not guaranteed."],
      "Open Aphrodite in Telegram"),
    t("tpl-daily-message", "\"Message from the Universe today…\" hook", "telegram", "telegram-post",
      ["Hook: a short daily line", "Personal angle: gentle interpretation", "Invite: open your preview"],
      ["Today's message: trust the steady, not the loud."],
      "Open your personal preview"),
    t("tpl-angel-number", "\"Angel number meaning…\" hook", "instagram", "story-card",
      ["Hook: seeing repeating numbers", "Soft meaning: reassurance", "Invite: open in Telegram"],
      ["Seeing the same number can be a gentle nudge to notice your own feelings."],
      "Open Aphrodite in Telegram"),
    t("tpl-birth-matrix", "\"Birth matrix hidden pattern…\" hook", "youtube-shorts", "short-video",
      ["Hook: a hidden pattern", "Soft reveal: a tendency, not a fate", "Invite: open your preview"],
      ["Your birth matrix may hint at a pattern — a tendency to explore, not a fixed fate."],
      "Open your personal preview"),
    t("tpl-compatibility-tension", "\"Compatibility tension point…\" hook", "instagram", "reel",
      ["Hook: the tension everyone feels", "Soft read: where friction may sit", "Invite: check your pattern"],
      ["Your pairing may share one tension point around pacing — soft guidance, not a rule."],
      "Check your relationship pattern"),
  ];
}

export function getAphroditeSocialTrafficBoundaries(): AphroditeSocialTrafficBoundary[] {
  return [
    {
      area: "Content architecture (hooks, templates, pillars)",
      allowedNow: ["static planning", "original Aphrodite voice", "safe Mini App CTAs"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "Manual review (UI / read-only)",
      allowedNow: ["human review of drafts before anything is published"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "Auto-posting / platform API (Instagram, TikTok, YouTube, Telegram)",
      allowedNow: [],
      blockedUntil: ["explicit owner approval", "platform ToS review", "future automation packages"],
      riskLevel: "critical",
    },
    {
      area: "Scraping / account credentials / browser automation",
      allowedNow: [],
      blockedUntil: ["never — out of scope by design"],
      riskLevel: "critical",
    },
    {
      area: "Payments / real VIP unlock / production launch",
      allowedNow: [],
      blockedUntil: ["explicit owner approval", "legal", "real-implementation packages"],
      riskLevel: "high",
    },
  ];
}

export function getAphroditeSocialTrafficNextSteps(): AphroditeSocialTrafficNextStep[] {
  return [
    {
      package: "Package 142",
      title: "Social Content Template Engine",
      purpose: "Turn these static templates into a local, deterministic copy generator (no posting).",
      blockedUntil: ["this architecture approved"],
    },
    {
      package: "Package 143 (future)",
      title: "Manual Review Queue UI",
      purpose: "A read-only review surface for drafts before any human-led posting.",
      blockedUntil: ["template engine ready"],
    },
    {
      package: "Future",
      title: "Assisted (human-in-the-loop) scheduling",
      purpose: "Export-only scheduling aids; never auto-posting.",
      blockedUntil: ["explicit owner approval", "platform ToS review"],
    },
  ];
}
