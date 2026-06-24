/**
 * Aphrodite First Result Experience Rewrite (Package 135)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC product model for the first user experience.
 * The hero scenario is AI Love Reading. This file delivers a strong emotional
 * first result WITHOUT any live behaviour.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - Local only. No external fetch.
 *  - Deterministic. No AI / no API calls.
 *  - No database read/write.
 *  - No Telegram API calls.
 *  - No payment, no real VIP unlock, no route gating.
 *  - No hard deterministic fate claims; soft wording only.
 */

export type AphroditeFirstResultStep = {
  step: string;
  purpose: string;
  userSees: string;
  allowedNow: string[];
  blockedUntil: string[];
};

export type AphroditeFirstResultMock = {
  headline: string;
  emotionalSummary: string;
  freeInsight: string[];
  futureVipTeaser: string[];
  safetyNote: string;
};

export type AphroditeLoadingStage = {
  label: string;
  description: string;
  durationHintMs: number;
};

export type AphroditeFirstResultBoundary = {
  area: string;
  status:
    | "experience-rewrite-only"
    | "local-preview-only"
    | "future-vip"
    | "blocked";
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

/** Primary emotional promise shown on the first screen (hero copy). */
export const APHRODITE_PRIMARY_EMOTIONAL_PROMISE =
  "Узнай, что между вами происходит, что он может чувствовать и где ваша главная зона риска.";

/** Soft, non-deterministic wording the first result must use. */
export const APHRODITE_SOFT_WORDING: string[] = [
  "may",
  "often",
  "possible pattern",
  "zone of attention",
];

export const APHRODITE_FIRST_RESULT_SAFETY_BOUNDARIES: string[] = [
  "No payment",
  "No real VIP unlock",
  "No Telegram API call",
  "No database write",
  "No active Telegram CTA changes",
  "No production launch",
];

const ELEMENT_BY_SIGN: Record<string, "fire" | "earth" | "air" | "water"> = {
  aries: "fire", leo: "fire", sagittarius: "fire",
  taurus: "earth", virgo: "earth", capricorn: "earth",
  gemini: "air", libra: "air", aquarius: "air",
  cancer: "water", scorpio: "water", pisces: "water",
};

function normSign(sign: string): string {
  return (sign || "").trim().toLowerCase();
}

function elementOf(sign: string): "fire" | "earth" | "air" | "water" | "unknown" {
  return ELEMENT_BY_SIGN[normSign(sign)] ?? "unknown";
}

function mainEnergy(a: string, b: string): string {
  const ea = elementOf(a);
  const eb = elementOf(b);
  if (ea === "unknown" || eb === "unknown") {
    return "There may be a quietly building energy here that is still finding its shape.";
  }
  if (ea === eb) {
    return `Two ${ea} signs often share a familiar rhythm — comfort comes easily, and you may mirror each other.`;
  }
  const warm = (ea === "fire" && eb === "air") || (ea === "air" && eb === "fire");
  const grounded = (ea === "earth" && eb === "water") || (ea === "water" && eb === "earth");
  if (warm) {
    return "Fire and air tend to spark quickly — there is often momentum and attraction, with a possible pattern of moving fast.";
  }
  if (grounded) {
    return "Earth and water often build slowly and deeply — a possible pattern of safety, with a zone of attention around expressing needs out loud.";
  }
  return "Your elements pull in different directions, which often creates strong attraction and a zone of attention around pacing.";
}

function oneStrength(a: string, b: string): string {
  const ea = elementOf(a);
  if (ea === "fire") return "Your warmth and directness often make the other person feel wanted.";
  if (ea === "earth") return "Your steadiness often gives the connection a sense of safety.";
  if (ea === "air") return "Your curiosity often keeps the conversation alive.";
  if (ea === "water") return "Your emotional depth often helps the other person feel truly seen.";
  return "There is a genuine strength here worth building on.";
}

function oneRiskZone(a: string, b: string): string {
  const eb = elementOf(b);
  if (eb === "fire") return "A possible zone of attention: things may heat up or cool down faster than you expect.";
  if (eb === "earth") return "A possible zone of attention: they may go quiet when they need space, which can read as distance.";
  if (eb === "air") return "A possible zone of attention: they may intellectualise feelings instead of naming them.";
  if (eb === "water") return "A possible zone of attention: unspoken feelings may build up if they are not gently invited out.";
  return "A possible zone of attention: pacing and unspoken expectations.";
}

export function getAphroditeFirstResultSteps(): AphroditeFirstResultStep[] {
  return [
    {
      step: "Ask the emotional question",
      purpose: "Open with the feeling, not the feature.",
      userSees: "What does he feel? What is really happening between us?",
      allowedNow: ["emotional question framing", "single hero entry (AI Love Reading)"],
      blockedUntil: [],
    },
    {
      step: "Minimal input",
      purpose: "Ask for as little as possible before giving value.",
      userSees: "Just your sign and theirs to begin.",
      allowedNow: ["two signs", "optional first names", "optional relationship status"],
      blockedUntil: ["long birth-data form (deferred to later)"],
    },
    {
      step: "Staged loading",
      purpose: "Make the wait feel like a reading is being prepared.",
      userSees: "Reading your connection energy… preparing your guidance.",
      allowedNow: ["local staged loading copy", "no real async work"],
      blockedUntil: [],
    },
    {
      step: "Free first result",
      purpose: "Deliver real, personal value before any ask.",
      userSees: "Main energy, one strength, one risk zone.",
      allowedNow: ["deterministic local preview"],
      blockedUntil: ["AI generation (not in scope)"],
    },
    {
      step: "Value-led VIP teaser",
      purpose: "Show what a full reading would add — without unlocking it.",
      userSees: "What he feels, why he pulls away, 30-day forecast, red flags, advice.",
      allowedNow: ["teaser copy only"],
      blockedUntil: ["real payments", "owner approval", "real VIP access"],
    },
  ];
}

export function getAphroditeLoadingStages(): AphroditeLoadingStage[] {
  return [
    {
      label: "Reading your connection energy",
      description: "Sensing the overall energy between the two of you.",
      durationHintMs: 900,
    },
    {
      label: "Comparing emotional patterns",
      description: "Looking at how your emotional rhythms may meet.",
      durationHintMs: 900,
    },
    {
      label: "Finding your strongest attraction point",
      description: "Locating where the pull between you is strongest.",
      durationHintMs: 900,
    },
    {
      label: "Preparing your personal guidance",
      description: "Putting your first reading together.",
      durationHintMs: 900,
    },
  ];
}

export function createAphroditeLoveReadingPreview(args: {
  firstName?: string;
  partnerName?: string;
  firstSign: string;
  partnerSign: string;
  relationshipStatus?: string;
}): AphroditeFirstResultMock {
  const you = (args.firstName || "You").trim();
  const them = (args.partnerName || "They").trim();
  const a = normSign(args.firstSign);
  const b = normSign(args.partnerSign);
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

  return {
    headline: `AI Love Reading — ${cap(a)} & ${cap(b)}`,
    emotionalSummary:
      `${you} and ${them}: ${mainEnergy(a, b)} This is a first read, not a final judgment.`,
    freeInsight: [
      `Main energy: ${mainEnergy(a, b)}`,
      `One strength: ${oneStrength(a, b)}`,
      `One risk zone: ${oneRiskZone(a, b)}`,
    ],
    futureVipTeaser: [
      "what he feels",
      "why he pulls away",
      "30-day forecast",
      "red flags",
      "personal advice",
    ],
    safetyNote:
      "This reading uses soft wording (may, often, possible pattern, zone of attention) and is not a final judgment about any real person.",
  };
}

export function getAphroditeFirstResultBoundaries(): AphroditeFirstResultBoundary[] {
  return [
    {
      area: "First result copy & layout",
      status: "experience-rewrite-only",
      allowedNow: ["emotional framing", "staged loading", "free teaser"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "Love Reading preview generation",
      status: "local-preview-only",
      allowedNow: ["deterministic local mock"],
      blockedUntil: ["AI generation (not in scope)"],
      riskLevel: "low",
    },
    {
      area: "VIP value (what he feels, forecast, red flags)",
      status: "future-vip",
      allowedNow: ["teaser copy only"],
      blockedUntil: ["real payments", "owner approval", "real VIP access"],
      riskLevel: "medium",
    },
    {
      area: "Payments / Telegram Stars / successful_payment",
      status: "blocked",
      allowedNow: [],
      blockedUntil: ["explicit owner approval", "legal", "Package 133 safety hardening confirmed"],
      riskLevel: "critical",
    },
    {
      area: "Telegram API / database persistence",
      status: "blocked",
      allowedNow: [],
      blockedUntil: ["future real-implementation packages"],
      riskLevel: "high",
    },
  ];
}
