/**
 * Aphrodite Red Flags Scanner Foundation (Package 138)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC foundation for the Red Flags Scanner module.
 * There is NO real "AI" here — the word describes the product, not the implementation.
 *
 * This module gently surfaces "zones of attention" in a relationship. It is care-first
 * and uses soft, non-deterministic wording only.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - Deterministic. Local only. No external fetch.
 *  - No AI API call. No payment. No real VIP unlock.
 *  - No Telegram API call. No database read/write.
 *  - No active Telegram CTA changes. No production launch.
 *  - No abuse accusation about any real person.
 *  - No mental-health diagnosis.
 *  - No emergency / safety-critical / legal / medical advice.
 *  - No deterministic red-flag / fate claim; never claims someone is dangerous or safe.
 *  - No manipulation advice.
 */

export type AphroditeRedFlagsTone =
  | "gentle"
  | "direct"
  | "protective"
  | "reflective";

export type AphroditeRedFlagsFocus =
  | "distance"
  | "jealousy"
  | "silence"
  | "conflict"
  | "control"
  | "self-pattern";

export type AphroditeRedFlagsScannerInput = {
  firstName?: string;
  partnerName?: string;
  firstSign: string;
  partnerSign?: string;
  relationshipStatus?: string;
  focus?: AphroditeRedFlagsFocus;
  tone?: AphroditeRedFlagsTone;
};

export type AphroditeRedFlagsScannerSection = {
  id: string;
  title: string;
  freeText: string;
  futureVipDepth: string[];
  safetyNote?: string;
};

export type AphroditeRedFlagsScannerPreview = {
  headline: string;
  emotionalSummary: string;
  mainRedFlagZone: string;
  softWarning: string;
  distancePattern: string;
  conflictPattern: string;
  selfProtectionStep: string;
  nextStep: string;
  sections: AphroditeRedFlagsScannerSection[];
  futureVipTeaser: string[];
  safetyBoundary: string[];
};

export type AphroditeRedFlagsScannerBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export const APHRODITE_RED_FLAGS_PROMISE =
  "Мягко покажи зоны внимания в отношениях: где может быть дистанция, контроль, молчание, ревность или повторяющийся эмоциональный сценарий.";

export const APHRODITE_RED_FLAGS_SOFT_WORDING: string[] = [
  "may",
  "often",
  "possible pattern",
  "can indicate",
  "zone of attention",
  "worth noticing",
  "not a final judgment",
];

export const APHRODITE_RED_FLAGS_SAFETY_BOUNDARIES: string[] = [
  "No AI API call",
  "No payment",
  "No real VIP unlock",
  "No Telegram API call",
  "No database write",
  "No active Telegram CTA changes",
  "No production launch",
  "No abuse accusation",
  "No mental health diagnosis",
  "No emergency advice",
  "No deterministic red flag claim",
];

export const APHRODITE_RED_FLAGS_FUTURE_VIP_TEASER: string[] = [
  "emotional avoidance",
  "jealousy/control risk",
  "silence/conflict pattern",
  "attachment style hint",
  "what to do next",
  "30-day relationship risk timeline",
  "personal reflection prompts",
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
function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
}

// All text below is intentionally soft: a "zone of attention", never an accusation.
function mainZoneText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "A possible zone of attention: intensity may rise quickly, then need cooling space.";
    case "earth": return "A possible zone of attention: quiet withdrawal may read as distance when space is needed.";
    case "air": return "A possible zone of attention: feelings may get talked around rather than named.";
    case "water": return "A possible zone of attention: unspoken hurt may build quietly under the surface.";
    default: return "A possible zone of attention worth gentle, curious notice.";
  }
}
function softWarningText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "Worth noticing: do reactions cool down and repair afterward, or stay hot?";
    case "earth": return "Worth noticing: does space come back as warmth, or stretch into long silence?";
    case "air": return "Worth noticing: do conversations reach feelings, or stay on the surface?";
    case "water": return "Worth noticing: are feelings invited out gently, or left to guess?";
    default: return "Worth noticing how repair tends to happen after a hard moment.";
  }
}
function distanceText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "A distance pattern may show up as sudden heat followed by a pull-back.";
    case "earth": return "A silence pattern may show up as going quiet instead of saying what is needed.";
    case "air": return "A distance pattern may show up as drifting into ideas when closeness feels heavy.";
    case "water": return "A silence pattern may show up as withdrawing to protect tender feelings.";
    default: return "A possible distance or silence pattern worth noticing kindly.";
  }
}
function conflictText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "A conflict pattern may repeat as fast flare-ups that need a cool-down to resolve.";
    case "earth": return "A conflict pattern may repeat as shutting down rather than talking it through.";
    case "air": return "A conflict pattern may repeat as debating points instead of sharing the feeling underneath.";
    case "water": return "A conflict pattern may repeat as silence that holds hurt instead of voicing it.";
    default: return "A possible repeating conflict pattern worth a gentle look.";
  }
}
function selfProtectionText(): string {
  return "A kind self-protection step: notice how you feel after time together, and trust steady patterns over single moments.";
}
function nextStepText(sign: string): string {
  const e = elementOf(sign);
  if (e === "earth" || e === "water") return "A gentle next step: name one need out loud and watch, without pressure, how it is met.";
  return "A gentle next step: slow down by one beat and let consistency, not intensity, guide you.";
}

export function getAphroditeRedFlagsScannerSections(): AphroditeRedFlagsScannerSection[] {
  return [
    {
      id: "main-red-flag-zone",
      title: "Main red flag zone",
      freeText: "The single zone of attention most worth gentle notice.",
      futureVipDepth: ["full zone map", "how it may shift over time"],
      safetyNote: "A zone of attention, not a final judgment about a real person.",
    },
    {
      id: "soft-warning",
      title: "Soft warning",
      freeText: "A gentle, non-alarming thing worth noticing.",
      futureVipDepth: ["early signs to watch", "personal reflection prompts"],
    },
    {
      id: "distance-silence-pattern",
      title: "Distance / silence pattern",
      freeText: "A possible distance or silence pattern, framed softly.",
      futureVipDepth: ["emotional avoidance", "attachment style hint"],
    },
    {
      id: "jealousy-control-zone",
      title: "Jealousy or control risk zone",
      freeText: "A possible zone of attention around jealousy or control — never an accusation.",
      futureVipDepth: ["jealousy/control risk", "how to talk about it safely"],
      safetyNote: "This is not a claim that anyone is controlling; only a zone to notice.",
    },
    {
      id: "conflict-pattern",
      title: "Conflict pattern",
      freeText: "A conflict pattern that may repeat.",
      futureVipDepth: ["silence/conflict pattern", "repair styles"],
    },
    {
      id: "self-protection-step",
      title: "Self-protection next step",
      freeText: "A kind, low-pressure way to protect your own peace.",
      futureVipDepth: ["what to do next", "30-day relationship risk timeline"],
      safetyNote: "General reflection only; not emergency, legal, or medical advice.",
    },
    {
      id: "future-vip-teaser",
      title: "Future VIP teaser",
      freeText: "What a full scan would add — described, not unlocked.",
      futureVipDepth: APHRODITE_RED_FLAGS_FUTURE_VIP_TEASER.slice(),
    },
  ];
}

export function createAphroditeRedFlagsScannerPreview(
  input: AphroditeRedFlagsScannerInput
): AphroditeRedFlagsScannerPreview {
  const you = (input.firstName || "You").trim();
  const sign = normSign(input.firstSign);
  const partnerSign = input.partnerSign ? normSign(input.partnerSign) : "";

  const mainRedFlagZone = mainZoneText(partnerSign || sign);
  const softWarning = softWarningText(partnerSign || sign);
  const distancePattern = distanceText(partnerSign || sign);
  const conflictPattern = conflictText(partnerSign || sign);
  const selfProtectionStep = selfProtectionText();
  const nextStep = nextStepText(sign);

  const base = getAphroditeRedFlagsScannerSections();
  const personal: Record<string, string> = {
    "main-red-flag-zone": mainRedFlagZone,
    "soft-warning": softWarning,
    "distance-silence-pattern": distancePattern,
    "jealousy-control-zone": "A soft zone of attention only: notice whether space and trust feel mutual.",
    "conflict-pattern": conflictPattern,
    "self-protection-step": selfProtectionStep,
    "future-vip-teaser": "A full scan would go deeper on avoidance, patterns, and reflection prompts.",
  };
  const sections = base.map((s) => ({ ...s, freeText: personal[s.id] ?? s.freeText }));

  const who = partnerSign ? `${cap(sign)} & ${cap(partnerSign)}` : cap(sign);
  return {
    headline: `Red Flags Scanner — ${who}`,
    emotionalSummary: `${you}: ${mainRedFlagZone} These are zones of attention, not a final judgment.`,
    mainRedFlagZone,
    softWarning,
    distancePattern,
    conflictPattern,
    selfProtectionStep,
    nextStep,
    sections,
    futureVipTeaser: APHRODITE_RED_FLAGS_FUTURE_VIP_TEASER.slice(),
    safetyBoundary: APHRODITE_RED_FLAGS_SAFETY_BOUNDARIES.slice(),
  };
}

export function getAphroditeRedFlagsScannerTrafficHooks(): string[] {
  return [
    "\"Soft zones of attention\" gentle series",
    "Notice-this-kindly checklist, by sign",
    "Distance vs space — how to tell, softly",
    "Repair styles after conflict, per sign",
    "\"What to notice before you fall\" caring teaser",
  ];
}

export function getAphroditeRedFlagsScannerBoundaries(): AphroditeRedFlagsScannerBoundary[] {
  return [
    {
      area: "Red Flags preview generation",
      allowedNow: ["deterministic local mock", "soft, care-first wording"],
      blockedUntil: ["real AI generation (not in scope)"],
      riskLevel: "low",
    },
    {
      area: "Free preview (zone, warning, pattern, self-protection, next step)",
      allowedNow: ["local copy only"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "Accusation / diagnosis / emergency advice",
      allowedNow: [],
      blockedUntil: ["never — out of scope by design"],
      riskLevel: "critical",
    },
    {
      area: "VIP depth (avoidance, risk, timeline, prompts)",
      allowedNow: ["teaser copy only"],
      blockedUntil: ["real payments", "owner approval", "real VIP access"],
      riskLevel: "medium",
    },
    {
      area: "AI API / Payments / Telegram API / database",
      allowedNow: [],
      blockedUntil: ["explicit owner approval", "legal", "real-implementation packages"],
      riskLevel: "high",
    },
  ];
}
