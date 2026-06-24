/**
 * Aphrodite Social Content Template Engine (Package 142)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC. Turns the Package 141 social traffic
 * architecture into reusable draft templates and a local draft generator.
 *
 * It produces DRAFTS ONLY. Hard boundaries (enforced by simply not doing anything else):
 *  - No auto-posting. No Instagram / TikTok / YouTube / Telegram API calls.
 *  - No scraping. No stored account credentials. No browser automation.
 *  - No external fetch. No AI API. No database.
 *  - No copied competitor content (original Aphrodite voice only).
 *  - No active payment CTA. No real VIP unlock. No production launch.
 *  - No hard deterministic claims; no medical / legal / financial / manipulation advice.
 */

export type AphroditeSocialDraftPlatform =
  | "instagram"
  | "tiktok"
  | "telegram"
  | "youtube-shorts";

export type AphroditeSocialDraftPillar =
  | "ai-love-reading"
  | "soulmate-scanner"
  | "red-flags-scanner"
  | "future-timeline"
  | "daily-message"
  | "zodiac-compatibility"
  | "angel-numbers"
  | "birth-matrix";

export type AphroditeSocialDraftFormat =
  | "reel"
  | "short-video"
  | "story-card"
  | "carousel"
  | "text-card"
  | "telegram-post"
  | "lead-magnet";

export type AphroditeSocialDraftTone =
  | "soft"
  | "mystic"
  | "direct"
  | "romantic"
  | "reflective";

export type AphroditeSocialDraftInput = {
  platform: AphroditeSocialDraftPlatform;
  pillar: AphroditeSocialDraftPillar;
  format: AphroditeSocialDraftFormat;
  tone?: AphroditeSocialDraftTone;
  sign?: string;
  theme?: string;
};

export type AphroditeSocialContentDraft = {
  id: string;
  platform: AphroditeSocialDraftPlatform;
  pillar: AphroditeSocialDraftPillar;
  format: AphroditeSocialDraftFormat;
  title: string;
  hook: string;
  bodyLines: string[];
  caption: string;
  hashtags: string[];
  safeCta: string;
  blockedClaims: string[];
  reviewChecklist: string[];
  safetyBoundary: string[];
};

export type AphroditeSocialContentTemplate = {
  id: string;
  pillar: AphroditeSocialDraftPillar;
  format: AphroditeSocialDraftFormat;
  title: string;
  hookPatterns: string[];
  bodyStructure: string[];
  safeCtas: string[];
  blockedClaims: string[];
};

export type AphroditeSocialContentEngineBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export const APHRODITE_CONTENT_SAFE_CTAS: string[] = [
  "Open Aphrodite in Telegram",
  "Get your free Love Reading preview",
  "Check your relationship pattern",
  "Open your personal preview",
];

export const APHRODITE_CONTENT_BLOCKED_CLAIMS: string[] = [
  "Buy VIP now",
  "Unlock full report now",
  "Subscribe now",
  "Pay now",
  "Guaranteed prediction",
  "He will return",
  "100% true",
  "Spell / loyalty magic",
];

export const APHRODITE_CONTENT_SAFETY_BOUNDARIES: string[] = [
  "No auto-posting",
  "No Instagram API call",
  "No TikTok API call",
  "No YouTube API call",
  "No Telegram API call",
  "No scraping",
  "No account credentials",
  "No copied competitor content",
  "No active payment CTA",
  "No real VIP unlock",
  "No production launch",
];

export const APHRODITE_CONTENT_BASE_HASHTAGS: string[] = [
  "#aphrodite",
  "#zodiac",
  "#love",
  "#selfreflection",
  "#telegramminiapp",
];

const PILLAR_HASHTAG: Record<AphroditeSocialDraftPillar, string> = {
  "ai-love-reading": "#lovereading",
  "soulmate-scanner": "#soulmate",
  "red-flags-scanner": "#redflags",
  "future-timeline": "#futureforecast",
  "daily-message": "#dailymessage",
  "zodiac-compatibility": "#compatibility",
  "angel-numbers": "#angelnumbers",
  "birth-matrix": "#birthmatrix",
};

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function pick<T>(items: T[], seed: number): T {
  const idx = ((Math.trunc(seed) % items.length) + items.length) % items.length;
  return items[idx];
}

export function getAphroditeSocialContentTemplates(): AphroditeSocialContentTemplate[] {
  const ctas = APHRODITE_CONTENT_SAFE_CTAS.slice();
  const blocked = APHRODITE_CONTENT_BLOCKED_CLAIMS.slice();
  const tpl = (
    id: string, pillar: AphroditeSocialDraftPillar, format: AphroditeSocialDraftFormat,
    title: string, hookPatterns: string[], bodyStructure: string[]
  ): AphroditeSocialContentTemplate => ({ id, pillar, format, title, hookPatterns, bodyStructure, safeCtas: ctas, blockedClaims: blocked });

  return [
    tpl("tpl-pull-away", "ai-love-reading", "reel", "If he pulls away...",
      ["If he pulls away, it may not mean what you fear.", "When he goes quiet, here's a softer read."],
      ["Name the fear gently", "Reframe as a possible pattern, not a verdict", "Invite a free preview"]),
    tpl("tpl-soulmate-type", "soulmate-scanner", "short-video", "Your soulmate type by sign...",
      ["Your soulmate type, by your sign — a soft read.", "The partner energy that may fit your sign."],
      ["Open with the question everyone asks", "Soft read by element", "Invite a personal preview"]),
    tpl("tpl-red-flag", "red-flags-scanner", "carousel", "One red flag your sign ignores...",
      ["One soft red flag your sign tends to overlook.", "A gentle thing worth noticing before you fall."],
      ["A caring warning, not an accusation", "Frame as a zone of attention", "Invite a pattern check"]),
    tpl("tpl-next-30", "future-timeline", "short-video", "What the next 30 days may bring...",
      ["What the next 30 days may gently open for you.", "A soft window may be forming — here's the feel."],
      ["Spark curiosity about what's next", "Soft window: love / opportunity / attention", "Invite into Telegram"]),
    tpl("tpl-daily-message", "daily-message", "telegram-post", "Message from the Universe today...",
      ["A short message from the Universe for today.", "Today's gentle reminder for your sign."],
      ["One short, kind line", "A personal angle", "Invite a preview"]),
    tpl("tpl-angel-number", "angel-numbers", "story-card", "Angel number meaning...",
      ["Seeing the same number? A gentle meaning.", "What this repeating number may be nudging."],
      ["Name the coincidence", "Offer a soft, reassuring meaning", "Invite into Telegram"]),
    tpl("tpl-birth-matrix", "birth-matrix", "short-video", "Birth matrix hidden pattern...",
      ["A hidden pattern your birth matrix may hint at.", "The quiet code your birth date may carry."],
      ["Tease a hidden pattern", "Frame as a tendency, not a fate", "Invite a personal preview"]),
    tpl("tpl-compatibility-tension", "zodiac-compatibility", "reel", "Compatibility tension point...",
      ["The one tension point your pairing may share.", "Where your signs may quietly rub."],
      ["Name the tension everyone feels", "Soft read on where friction may sit", "Invite a pattern check"]),
  ];
}

export function getAphroditeSocialContentReviewChecklist(): string[] {
  return [
    "Uses original Aphrodite voice — no copied competitor text or design.",
    "Uses only soft wording (may / often / possible / zone of attention); no hard claims.",
    "Contains no blocked claim from the engine's blocked-claims list.",
    "CTA is a free Mini App preview — no payment / subscribe / unlock CTA.",
    "No medical, legal, financial, emergency, or manipulation advice.",
    "No real person is named, accused, or diagnosed.",
    "Approved by a human before any manual posting (Manual Review stays UI / read-only).",
  ];
}

export function createAphroditeSocialContentDraft(
  input: AphroditeSocialDraftInput
): AphroditeSocialContentDraft {
  const templates = getAphroditeSocialContentTemplates();
  const template =
    templates.find((t) => t.pillar === input.pillar) ?? templates[0];

  const sign = (input.sign || "").trim().toLowerCase();
  const theme = (input.theme || "").trim();
  const seed = hashString(`${input.platform}:${input.pillar}:${input.format}:${input.tone || "soft"}:${sign}:${theme}`);

  const signLabel = sign ? cap(sign) : "your sign";
  const hook = pick(template.hookPatterns, seed).replace(/your sign/gi, signLabel);
  const safeCta = pick(template.safeCtas, seed >>> 3);

  const bodyLines = template.bodyStructure.map((step, i) => {
    const base = `${step}.`;
    if (i === 0) return `${base} ${theme ? `Today's focus: ${theme}.` : "A soft, original take for " + signLabel + "."}`;
    if (i === template.bodyStructure.length - 1) return `${base} ${safeCta}.`;
    return `${base} A possible pattern — not a final judgment.`;
  });

  const caption =
    `${template.title} ${signLabel !== "your sign" ? "(" + signLabel + ") " : ""}— a soft, original Aphrodite read. ${safeCta}.`;

  const hashtags = [...APHRODITE_CONTENT_BASE_HASHTAGS, PILLAR_HASHTAG[input.pillar]].filter(Boolean);

  return {
    id: `draft-${input.platform}-${input.pillar}-${(seed % 100000).toString(36)}`,
    platform: input.platform,
    pillar: input.pillar,
    format: input.format,
    title: template.title,
    hook,
    bodyLines,
    caption,
    hashtags,
    safeCta,
    blockedClaims: APHRODITE_CONTENT_BLOCKED_CLAIMS.slice(),
    reviewChecklist: getAphroditeSocialContentReviewChecklist(),
    safetyBoundary: APHRODITE_CONTENT_SAFETY_BOUNDARIES.slice(),
  };
}

export function getAphroditeSocialContentEngineBoundaries(): AphroditeSocialContentEngineBoundary[] {
  return [
    {
      area: "Draft generation (templates, hooks, captions, hashtags)",
      allowedNow: ["deterministic local drafts", "original Aphrodite voice", "safe Mini App CTAs"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "Manual review (UI / read-only)",
      allowedNow: ["human review of drafts before manual posting"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "Auto-posting / platform API / scraping / credentials",
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
