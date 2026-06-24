/**
 * Aphrodite Soulmate Scanner Foundation (Package 137)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC foundation for the Soulmate Scanner module.
 * There is NO real "AI" here — the word describes the product, not the implementation.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - Deterministic. Local only. No external fetch.
 *  - No AI API call. No payment. No real VIP unlock.
 *  - No Telegram API call. No database read/write.
 *  - No route gating. No active Telegram CTA changes. No production launch.
 *  - Soft wording only; no deterministic soulmate / fate claims.
 *  - No guarantee of meeting a specific person.
 *  - No manipulation advice; no medical / legal / financial claims.
 */

export type AphroditeSoulmateTone =
  | "gentle"
  | "direct"
  | "romantic"
  | "reflective";

export type AphroditeSoulmateFocus =
  | "partner-type"
  | "meeting"
  | "blocks"
  | "future"
  | "self-pattern";

export type AphroditeSoulmateScannerInput = {
  firstName?: string;
  sign: string;
  relationshipStatus?: string;
  focus?: AphroditeSoulmateFocus;
  tone?: AphroditeSoulmateTone;
};

export type AphroditeSoulmateScannerSection = {
  id: string;
  title: string;
  freeText: string;
  futureVipDepth: string[];
  safetyNote?: string;
};

export type AphroditeSoulmateScannerPreview = {
  headline: string;
  emotionalSummary: string;
  partnerType: string;
  emotionalPattern: string;
  strongestSignEnergy: string;
  possibleMeetingContext: string;
  relationshipBlock: string;
  nextStep: string;
  sections: AphroditeSoulmateScannerSection[];
  futureVipTeaser: string[];
  safetyBoundary: string[];
};

export type AphroditeSoulmateScannerBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export const APHRODITE_SOULMATE_PROMISE =
  "Узнай, какой тип человека тебе подходит, какие отношения тебе нужны и какие сценарии могут мешать встрече.";

export const APHRODITE_SOULMATE_SOFT_WORDING: string[] = [
  "may",
  "often",
  "possible pattern",
  "can indicate",
  "zone of attention",
  "not a final judgment",
];

export const APHRODITE_SOULMATE_SAFETY_BOUNDARIES: string[] = [
  "No AI API call",
  "No payment",
  "No real VIP unlock",
  "No Telegram API call",
  "No database write",
  "No active Telegram CTA changes",
  "No production launch",
  "No deterministic soulmate claim",
];

export const APHRODITE_SOULMATE_FUTURE_VIP_TEASER: string[] = [
  "where the meeting may happen",
  "age / maturity pattern",
  "signs that may fit best",
  "blocks preventing relationships",
  "3-month relationship timeline",
  "personal relationship advice",
];

const ELEMENT_BY_SIGN: Record<string, "fire" | "earth" | "air" | "water"> = {
  aries: "fire", leo: "fire", sagittarius: "fire",
  taurus: "earth", virgo: "earth", capricorn: "earth",
  gemini: "air", libra: "air", aquarius: "air",
  cancer: "water", scorpio: "water", pisces: "water",
};

const COMPLEMENT: Record<"fire" | "earth" | "air" | "water", string> = {
  fire: "a grounded, steady partner who can hold your spark without dimming it",
  earth: "a warm, expressive partner who gently draws your feelings to the surface",
  air: "an emotionally present partner who turns your ideas into real closeness",
  water: "a stable, reassuring partner who makes your depth feel safe",
};

function normSign(sign: string): string {
  return (sign || "").trim().toLowerCase();
}
function elementOf(sign: string): "fire" | "earth" | "air" | "water" | "unknown" {
  return ELEMENT_BY_SIGN[normSign(sign)] ?? "unknown";
}
function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
}

function partnerTypeText(sign: string): string {
  const e = elementOf(sign);
  if (e === "unknown") return "A partner whose calm and warmth balance your own — described in soft terms only.";
  return `Often ${COMPLEMENT[e]}. This is a possible pattern, not a final judgment.`;
}
function emotionalPatternText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "You may move toward people quickly and need to feel chosen out loud.";
    case "earth": return "You may build trust slowly and value consistency over intensity.";
    case "air": return "You may connect through words first and need space to feel free.";
    case "water": return "You may bond deeply and feel things long before you say them.";
    default: return "Your pattern here is still forming and worth approaching gently.";
  }
}
function signEnergyText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "Your strongest energy can indicate courage and warmth that others are drawn to.";
    case "earth": return "Your strongest energy can indicate steadiness that makes people feel safe.";
    case "air": return "Your strongest energy can indicate curiosity that keeps connection alive.";
    case "water": return "Your strongest energy can indicate depth that helps others feel understood.";
    default: return "There is a real signature energy here worth leaning into.";
  }
}
function meetingContextText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "A possible meeting context: active, social, or spontaneous settings.";
    case "earth": return "A possible meeting context: through routine, work, or trusted circles.";
    case "air": return "A possible meeting context: conversations, communities, or shared interests.";
    case "water": return "A possible meeting context: quiet, emotionally safe, one-on-one settings.";
    default: return "A possible meeting context: wherever you feel most like yourself.";
  }
}
function relationshipBlockText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "A possible block: moving fast and losing patience before trust forms.";
    case "earth": return "A possible block: waiting so long for certainty that closeness stalls.";
    case "air": return "A possible block: staying in your head instead of letting feelings land.";
    case "water": return "A possible block: holding feelings in until they quietly overflow.";
    default: return "A possible block worth a gentle zone of attention.";
  }
}
function nextStepText(sign: string): string {
  const e = elementOf(sign);
  if (e === "earth" || e === "water") return "Noticing one small need and voicing it kindly often helps here.";
  return "Slowing down by one beat, and letting trust catch up, often helps here.";
}

export function getAphroditeSoulmateScannerSections(): AphroditeSoulmateScannerSection[] {
  return [
    {
      id: "partner-type",
      title: "Partner type",
      freeText: "The general kind of partner that may fit you, in soft terms.",
      futureVipDepth: ["detailed partner profile", "signs that may fit best"],
    },
    {
      id: "emotional-pattern",
      title: "Emotional pattern",
      freeText: "The emotional pattern you may bring into relationships.",
      futureVipDepth: ["self-pattern map", "how it may shape who you attract"],
      safetyNote: "A possible pattern, not a final judgment.",
    },
    {
      id: "strongest-sign-energy",
      title: "Strongest sign energy",
      freeText: "Your strongest signature energy in connection.",
      futureVipDepth: ["how to lead with it", "where it may clash"],
    },
    {
      id: "possible-meeting-context",
      title: "Possible meeting context",
      freeText: "Where you may tend to meet a fitting person — never a guarantee.",
      futureVipDepth: ["where the meeting may happen", "timing windows"],
      safetyNote: "No guarantee of meeting a specific person.",
    },
    {
      id: "relationship-block",
      title: "Relationship block",
      freeText: "A possible block on your relationship path.",
      futureVipDepth: ["blocks preventing relationships", "how to soften them"],
    },
    {
      id: "what-to-notice",
      title: "What to notice before choosing someone",
      freeText: "A gentle zone of attention before committing.",
      futureVipDepth: ["early signs to watch", "personal relationship advice"],
      safetyNote: "Soft guidance only; no manipulation advice.",
    },
    {
      id: "future-vip-teaser",
      title: "Future VIP teaser",
      freeText: "What a full scan would add — described, not unlocked.",
      futureVipDepth: APHRODITE_SOULMATE_FUTURE_VIP_TEASER.slice(),
    },
  ];
}

export function createAphroditeSoulmateScannerPreview(
  input: AphroditeSoulmateScannerInput
): AphroditeSoulmateScannerPreview {
  const you = (input.firstName || "You").trim();
  const sign = normSign(input.sign);

  const partnerType = partnerTypeText(sign);
  const emotionalPattern = emotionalPatternText(sign);
  const strongestSignEnergy = signEnergyText(sign);
  const possibleMeetingContext = meetingContextText(sign);
  const relationshipBlock = relationshipBlockText(sign);
  const nextStep = nextStepText(sign);

  const base = getAphroditeSoulmateScannerSections();
  const personal: Record<string, string> = {
    "partner-type": partnerType,
    "emotional-pattern": emotionalPattern,
    "strongest-sign-energy": strongestSignEnergy,
    "possible-meeting-context": possibleMeetingContext,
    "relationship-block": relationshipBlock,
    "what-to-notice": nextStep,
    "future-vip-teaser": "A full scan would go deeper on meeting context, fitting signs, blocks, and timeline.",
  };
  const sections = base.map((s) => ({ ...s, freeText: personal[s.id] ?? s.freeText }));

  return {
    headline: `Soulmate Scanner — ${cap(sign)}`,
    emotionalSummary: `${you}: ${partnerType} This is a first scan, not a final judgment.`,
    partnerType,
    emotionalPattern,
    strongestSignEnergy,
    possibleMeetingContext,
    relationshipBlock,
    nextStep,
    sections,
    futureVipTeaser: APHRODITE_SOULMATE_FUTURE_VIP_TEASER.slice(),
    safetyBoundary: APHRODITE_SOULMATE_SAFETY_BOUNDARIES.slice(),
  };
}

export function getAphroditeSoulmateScannerTrafficHooks(): string[] {
  return [
    "\"Your soulmate's element\" soft-reveal series",
    "Where you may meet them, by sign",
    "The partner type that fits you — per sign",
    "Green-flag partner traits vs zones of attention",
    "\"What blocks your love path?\" gentle teaser",
  ];
}

export function getAphroditeSoulmateScannerBoundaries(): AphroditeSoulmateScannerBoundary[] {
  return [
    {
      area: "Soulmate preview generation",
      allowedNow: ["deterministic local mock", "soft wording"],
      blockedUntil: ["real AI generation (not in scope)"],
      riskLevel: "low",
    },
    {
      area: "Free preview (partner type, pattern, energy, block, next step)",
      allowedNow: ["local copy only"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "VIP depth (meeting, fitting signs, timeline, advice)",
      allowedNow: ["teaser copy only"],
      blockedUntil: ["real payments", "owner approval", "real VIP access"],
      riskLevel: "medium",
    },
    {
      area: "AI API / external model calls",
      allowedNow: [],
      blockedUntil: ["future AI integration packages with explicit approval"],
      riskLevel: "high",
    },
    {
      area: "Payments / Telegram Stars / successful_payment / Telegram API / database",
      allowedNow: [],
      blockedUntil: ["explicit owner approval", "legal", "real-implementation packages"],
      riskLevel: "critical",
    },
  ];
}
