/**
 * Aphrodite AI Love Reading Foundation (Package 136)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC foundation for the AI Love Reading module.
 * Turns the first-result strategy into a concrete local model. There is NO real
 * "AI" here — the word describes the product, not the implementation.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - Deterministic. Local only. No external fetch.
 *  - No AI API call. No payment. No real VIP unlock.
 *  - No Telegram API call. No database read/write.
 *  - No route gating. No active Telegram CTA changes. No production launch.
 *  - Soft wording only; no hard deterministic fate claims.
 *  - No manipulation advice; no medical / legal / financial claims.
 */

export type AphroditeLoveReadingTone =
  | "gentle"
  | "direct"
  | "romantic"
  | "reflective";

export type AphroditeLoveReadingInput = {
  firstName?: string;
  partnerName?: string;
  firstSign: string;
  partnerSign: string;
  relationshipStatus?: string;
  focus?: "feelings" | "compatibility" | "distance" | "future" | "red-flags";
  tone?: AphroditeLoveReadingTone;
};

export type AphroditeLoveReadingSection = {
  id: string;
  title: string;
  freeText: string;
  futureVipDepth: string[];
  safetyNote?: string;
};

export type AphroditeLoveReadingPreview = {
  headline: string;
  emotionalSummary: string;
  connectionEnergy: string;
  strength: string;
  riskZone: string;
  nextStep: string;
  sections: AphroditeLoveReadingSection[];
  futureVipTeaser: string[];
  safetyBoundary: string[];
};

export type AphroditeLoveReadingBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export const APHRODITE_LOVE_READING_PROMISE =
  "Узнай, что между вами происходит, что он может чувствовать и где ваша главная зона риска.";

export const APHRODITE_LOVE_READING_SOFT_WORDING: string[] = [
  "may",
  "often",
  "possible pattern",
  "zone of attention",
  "can indicate",
  "not a final judgment",
];

export const APHRODITE_LOVE_READING_SAFETY_BOUNDARIES: string[] = [
  "No AI API call",
  "No payment",
  "No real VIP unlock",
  "No Telegram API call",
  "No database write",
  "No active Telegram CTA changes",
  "No production launch",
  "No deterministic fate claim",
];

export const APHRODITE_LOVE_READING_FUTURE_VIP_TEASER: string[] = [
  "what he/she feels",
  "why he/she pulls away",
  "30-day forecast",
  "red flags",
  "personal advice",
  "relationship pattern",
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

function connectionEnergyText(a: string, b: string): string {
  const ea = elementOf(a);
  const eb = elementOf(b);
  if (ea === "unknown" || eb === "unknown") {
    return "There may be a quietly building energy here that is still finding its shape.";
  }
  if (ea === eb) {
    return `Two ${ea} signs often share a familiar rhythm, which can indicate easy comfort and a tendency to mirror each other.`;
  }
  const warm = (ea === "fire" && eb === "air") || (ea === "air" && eb === "fire");
  const grounded = (ea === "earth" && eb === "water") || (ea === "water" && eb === "earth");
  if (warm) return "Fire and air often spark quickly — a possible pattern of momentum, with a zone of attention around moving too fast.";
  if (grounded) return "Earth and water often build slowly and deeply — a possible pattern of safety, with a zone of attention around saying needs out loud.";
  return "Your elements pull in different directions, which can indicate strong attraction and a zone of attention around pacing.";
}
function strengthText(a: string): string {
  switch (elementOf(a)) {
    case "fire": return "Your warmth and directness often make the other person feel wanted.";
    case "earth": return "Your steadiness often gives the connection a sense of safety.";
    case "air": return "Your curiosity often keeps the conversation alive and light.";
    case "water": return "Your emotional depth often helps the other person feel truly seen.";
    default: return "There is a genuine strength here worth building on.";
  }
}
function riskZoneText(b: string): string {
  switch (elementOf(b)) {
    case "fire": return "A possible zone of attention: things may heat up or cool down faster than expected.";
    case "earth": return "A possible zone of attention: they may go quiet when they need space, which can read as distance.";
    case "air": return "A possible zone of attention: they may intellectualise feelings instead of naming them.";
    case "water": return "A possible zone of attention: unspoken feelings may build up if they are not gently invited out.";
    default: return "A possible zone of attention: pacing and unspoken expectations.";
  }
}
function feelText(b: string): string {
  switch (elementOf(b)) {
    case "fire": return "They may feel drawn to your energy and want to be chosen out loud.";
    case "earth": return "They may feel safest showing care through consistency rather than big words.";
    case "air": return "They may feel connected through conversation and shared curiosity.";
    case "water": return "They may feel deeply, even when little is said on the surface.";
    default: return "Their feelings here are still forming and worth approaching gently.";
  }
}
function pullAwayText(b: string): string {
  switch (elementOf(b)) {
    case "fire": return "They may pull away when they feel boxed in or unappreciated.";
    case "earth": return "They may pull away to recharge, not to reject — a possible pattern, not a verdict.";
    case "air": return "They may pull away when feelings get heavy and they need room to think.";
    case "water": return "They may pull away to protect tender feelings when they feel unsure.";
    default: return "Distance here can indicate a need for safety rather than a lack of interest.";
  }
}
function nextStepText(a: string, b: string): string {
  const eb = elementOf(b);
  if (eb === "earth" || eb === "water") return "A gentle, low-pressure check-in often works better here than a big conversation.";
  return "Naming one real feeling clearly, without pressure, often opens the door here.";
}

export function getAphroditeLoveReadingSections(): AphroditeLoveReadingSection[] {
  return [
    {
      id: "main-energy",
      title: "Main energy of the connection",
      freeText: "The overall energy you two may share, in soft terms.",
      futureVipDepth: ["full energy map", "how it may shift over 30 days"],
    },
    {
      id: "what-they-feel",
      title: "What he/she may feel",
      freeText: "A gentle read on what the other person may be feeling.",
      futureVipDepth: ["deeper feeling map", "what they may want but not say"],
      safetyNote: "A possible pattern, not a final judgment about a real person.",
    },
    {
      id: "why-pull-away",
      title: "Why he/she may pull away",
      freeText: "Possible reasons for distance, framed softly.",
      futureVipDepth: ["attachment-style hint", "triggers to watch", "how to respond"],
      safetyNote: "Distance can indicate a need for safety, not a verdict.",
    },
    {
      id: "strongest-attraction",
      title: "Strongest attraction point",
      freeText: "Where the pull between you may be strongest.",
      futureVipDepth: ["how to lean into it", "timing windows"],
    },
    {
      id: "main-risk-zone",
      title: "Main risk zone",
      freeText: "The zone of attention most worth gentle care.",
      futureVipDepth: ["early warning signs", "red flags", "what to do next"],
      safetyNote: "Soft guidance only; no manipulation advice.",
    },
    {
      id: "what-to-do-next",
      title: "What to do next",
      freeText: "One small, kind next step.",
      futureVipDepth: ["personal advice", "30-day plan"],
    },
    {
      id: "future-vip-teaser",
      title: "Future VIP teaser",
      freeText: "What a full reading would add — described, not unlocked.",
      futureVipDepth: APHRODITE_LOVE_READING_FUTURE_VIP_TEASER.slice(),
    },
  ];
}

export function createAphroditeLoveReadingFoundationPreview(
  input: AphroditeLoveReadingInput
): AphroditeLoveReadingPreview {
  const you = (input.firstName || "You").trim();
  const them = (input.partnerName || "They").trim();
  const a = normSign(input.firstSign);
  const b = normSign(input.partnerSign);

  const connectionEnergy = connectionEnergyText(a, b);
  const strength = strengthText(a);
  const riskZone = riskZoneText(b);
  const nextStep = nextStepText(a, b);

  const baseSections = getAphroditeLoveReadingSections();
  const personalText: Record<string, string> = {
    "main-energy": connectionEnergy,
    "what-they-feel": feelText(b),
    "why-pull-away": pullAwayText(b),
    "strongest-attraction": `The strongest pull may sit where ${cap(a)} warmth meets ${cap(b)} depth.`,
    "main-risk-zone": riskZone,
    "what-to-do-next": nextStep,
    "future-vip-teaser": "A full reading would go deeper on feelings, distance, forecast, and advice.",
  };
  const sections = baseSections.map((s) => ({
    ...s,
    freeText: personalText[s.id] ?? s.freeText,
  }));

  return {
    headline: `AI Love Reading — ${cap(a)} & ${cap(b)}`,
    emotionalSummary: `${you} and ${them}: ${connectionEnergy} This is a first read, not a final judgment.`,
    connectionEnergy,
    strength,
    riskZone,
    nextStep,
    sections,
    futureVipTeaser: APHRODITE_LOVE_READING_FUTURE_VIP_TEASER.slice(),
    safetyBoundary: APHRODITE_LOVE_READING_SAFETY_BOUNDARIES.slice(),
  };
}

export function getAphroditeLoveReadingTrafficHooks(): string[] {
  return [
    "\"What he feels but won't say\" — sign-by-sign series",
    "POV: you finally understand why he pulls away",
    "Your strongest attraction point, by sign",
    "Green flags vs zones of attention, per sign pairing",
    "\"Does he love you?\" soft-read teaser",
  ];
}

export function getAphroditeLoveReadingBoundaries(): AphroditeLoveReadingBoundary[] {
  return [
    {
      area: "Love Reading preview generation",
      allowedNow: ["deterministic local mock", "soft wording"],
      blockedUntil: ["real AI generation (not in scope)"],
      riskLevel: "low",
    },
    {
      area: "Free preview (energy, strength, risk, next step)",
      allowedNow: ["local copy only"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "VIP depth (feelings, forecast, red flags, advice)",
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
