/**
 * Aphrodite AI Future Timeline Foundation (Package 139)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC foundation for the AI Future Timeline module.
 * There is NO real "AI" here — the word describes the product, not the implementation.
 *
 * It gently surfaces possible emotional windows ahead. It never predicts exact events
 * or dates, and never gives financial, medical, legal, emergency, or safety-critical advice.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - Deterministic. Local only. No external fetch.
 *  - No AI API call. No payment. No real VIP unlock.
 *  - No Telegram API call. No database read/write.
 *  - No active Telegram CTA changes. No production launch.
 *  - No deterministic future / fate claim. No exact date prediction. No guaranteed events.
 *  - No financial, medical, legal, emergency, or safety-critical advice.
 *  - Soft wording only.
 */

export type AphroditeFutureTimelineTone =
  | "gentle"
  | "direct"
  | "hopeful"
  | "reflective";

export type AphroditeFutureTimelineFocus =
  | "love"
  | "money-energy"
  | "opportunities"
  | "warning-periods"
  | "self-growth";

export type AphroditeFutureTimelineHorizon =
  | "30-days"
  | "90-days"
  | "6-months";

export type AphroditeFutureTimelineInput = {
  firstName?: string;
  sign: string;
  focus?: AphroditeFutureTimelineFocus;
  horizon?: AphroditeFutureTimelineHorizon;
  tone?: AphroditeFutureTimelineTone;
};

export type AphroditeFutureTimelinePeriod = {
  id: string;
  label: string;
  theme: string;
  loveSignal: string;
  opportunitySignal: string;
  zoneOfAttention: string;
  bestActionWindow: string;
  futureVipDepth: string[];
  safetyNote?: string;
};

export type AphroditeFutureTimelinePreview = {
  headline: string;
  emotionalSummary: string;
  visibleHorizon: AphroditeFutureTimelineHorizon;
  mainTheme: string;
  loveSignal: string;
  opportunitySignal: string;
  warningPeriod: string;
  bestActionWindow: string;
  nextStep: string;
  periods: AphroditeFutureTimelinePeriod[];
  futureVipTeaser: string[];
  safetyBoundary: string[];
};

export type AphroditeFutureTimelineBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export const APHRODITE_FUTURE_TIMELINE_PROMISE =
  "Мягко покажи возможные эмоциональные периоды впереди: любовь, энергия, возможности, зоны внимания и лучшие окна для действий — без жёстких предсказаний судьбы.";

export const APHRODITE_FUTURE_TIMELINE_SOFT_WORDING: string[] = [
  "may",
  "often",
  "possible window",
  "can indicate",
  "zone of attention",
  "worth noticing",
  "not a final prediction",
];

export const APHRODITE_FUTURE_TIMELINE_SAFETY_BOUNDARIES: string[] = [
  "No AI API call",
  "No payment",
  "No real VIP unlock",
  "No Telegram API call",
  "No database write",
  "No active Telegram CTA changes",
  "No production launch",
  "No deterministic future claim",
  "No exact date prediction",
  "No financial advice",
  "No medical/legal advice",
  "No emergency advice",
];

export const APHRODITE_FUTURE_TIMELINE_VIP_TEASER: string[] = [
  "6-12 month timeline",
  "love windows",
  "money/energy windows",
  "opportunity periods",
  "warning periods",
  "best action windows",
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

// All windows below are SOFT and RELATIVE — never exact dates, never guaranteed.
function mainThemeText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "A possible theme of renewed energy and bold, warm moves ahead.";
    case "earth": return "A possible theme of steady building and patient grounding ahead.";
    case "air": return "A possible theme of fresh ideas and lighter connection ahead.";
    case "water": return "A possible theme of deeper feeling and quiet emotional clarity ahead.";
    default: return "A possible theme that is still gently taking shape ahead.";
  }
}
function loveSignalText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "Love signal: warmth may rise; a possible window to be more openly affectionate.";
    case "earth": return "Love signal: closeness may deepen slowly; a possible window to build trust.";
    case "air": return "Love signal: connection through talk may open; a possible window for honest words.";
    case "water": return "Love signal: feelings may surface gently; a possible window to be tender.";
    default: return "Love signal: a soft, possible opening worth noticing.";
  }
}
function opportunitySignalText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "Opportunity signal: a possible window where bold first steps may pay off.";
    case "earth": return "Opportunity signal: a possible window where steady effort may compound.";
    case "air": return "Opportunity signal: a possible window where new contacts may appear.";
    case "water": return "Opportunity signal: a possible window where intuition may guide a good choice.";
    default: return "Opportunity signal: a soft, possible opening worth noticing.";
  }
}
function warningPeriodText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "Zone of attention: a possible period where impatience may flare — worth slowing down.";
    case "earth": return "Zone of attention: a possible period where over-caution may stall things.";
    case "air": return "Zone of attention: a possible period where scattered focus may need grounding.";
    case "water": return "Zone of attention: a possible period where moods may run deep — worth gentle care.";
    default: return "Zone of attention: a soft period worth noticing, not a warning of any certain event.";
  }
}
function bestActionWindowText(sign: string): string {
  switch (elementOf(sign)) {
    case "fire": return "Best action window: a possible window may open in the coming weeks for a warm, direct move.";
    case "earth": return "Best action window: a possible window may open over the coming weeks for a steady commitment.";
    case "air": return "Best action window: a possible window may open soon for an honest conversation.";
    case "water": return "Best action window: a possible window may open in the coming weeks for a tender reach-out.";
    default: return "Best action window: a possible window may open soon — timing stays soft and relative.";
  }
}
function nextStepText(sign: string): string {
  const e = elementOf(sign);
  if (e === "earth" || e === "water") return "A gentle next step: notice one good window and take one small, kind action.";
  return "A gentle next step: pick one possible window and act on it lightly, without pressure.";
}

export function getAphroditeFutureTimelinePeriods(
  input?: AphroditeFutureTimelineInput
): AphroditeFutureTimelinePeriod[] {
  const sign = normSign(input?.sign || "");
  const mk = (
    id: string,
    label: string,
    theme: string,
    extra?: Partial<AphroditeFutureTimelinePeriod>
  ): AphroditeFutureTimelinePeriod => ({
    id,
    label,
    theme,
    loveSignal: loveSignalText(sign),
    opportunitySignal: opportunitySignalText(sign),
    zoneOfAttention: warningPeriodText(sign),
    bestActionWindow: bestActionWindowText(sign),
    futureVipDepth: ["deeper window map", "soft relative timing"],
    ...extra,
  });

  return [
    mk("current-emotional-phase", "Current emotional phase", mainThemeText(sign), {
      safetyNote: "A possible read, not a final prediction.",
    }),
    mk("next-30-day-love-signal", "Next 30-day love signal", "A possible love window in the near term."),
    mk("opportunity-window", "Opportunity window", "A possible opening worth gentle attention."),
    mk("zone-of-attention", "Zone of attention", "A soft period to move with extra care.", {
      safetyNote: "Not a warning of any certain event; no financial, medical, or legal advice.",
    }),
    mk("best-action-window", "Best action window", "A possible soft window for a kind action."),
    mk("reflection-prompt", "Reflection prompt", "A gentle question to sit with, in your own time.", {
      futureVipDepth: ["personal reflection prompts"],
    }),
    mk("future-vip-teaser", "Future VIP teaser", "What a full timeline would add — described, not unlocked.", {
      futureVipDepth: APHRODITE_FUTURE_TIMELINE_VIP_TEASER.slice(),
    }),
  ];
}

export function createAphroditeFutureTimelinePreview(
  input: AphroditeFutureTimelineInput
): AphroditeFutureTimelinePreview {
  const you = (input.firstName || "You").trim();
  const sign = normSign(input.sign);
  const visibleHorizon: AphroditeFutureTimelineHorizon = input.horizon ?? "30-days";

  const mainTheme = mainThemeText(sign);
  const loveSignal = loveSignalText(sign);
  const opportunitySignal = opportunitySignalText(sign);
  const warningPeriod = warningPeriodText(sign);
  const bestActionWindow = bestActionWindowText(sign);
  const nextStep = nextStepText(sign);

  return {
    headline: `AI Future Timeline — ${cap(sign)}`,
    emotionalSummary: `${you}: ${mainTheme} These are possible windows, not a final prediction.`,
    visibleHorizon,
    mainTheme,
    loveSignal,
    opportunitySignal,
    warningPeriod,
    bestActionWindow,
    nextStep,
    periods: getAphroditeFutureTimelinePeriods(input),
    futureVipTeaser: APHRODITE_FUTURE_TIMELINE_VIP_TEASER.slice(),
    safetyBoundary: APHRODITE_FUTURE_TIMELINE_SAFETY_BOUNDARIES.slice(),
  };
}

export function getAphroditeFutureTimelineTrafficHooks(): string[] {
  return [
    "\"Your next possible love window\" gentle series",
    "Soft windows ahead, by sign",
    "Opportunity vs zone of attention — how to tell",
    "Best action windows, framed kindly",
    "\"What may be opening next?\" caring teaser",
  ];
}

export function getAphroditeFutureTimelineBoundaries(): AphroditeFutureTimelineBoundary[] {
  return [
    {
      area: "Timeline preview generation",
      allowedNow: ["deterministic local mock", "soft relative windows"],
      blockedUntil: ["real AI generation (not in scope)"],
      riskLevel: "low",
    },
    {
      area: "Free preview (theme, signals, window, next step)",
      allowedNow: ["local copy only"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "Exact dates / guaranteed events / prophecy",
      allowedNow: [],
      blockedUntil: ["never — out of scope by design"],
      riskLevel: "critical",
    },
    {
      area: "Financial / medical / legal / emergency advice",
      allowedNow: [],
      blockedUntil: ["never — out of scope by design"],
      riskLevel: "critical",
    },
    {
      area: "VIP depth (6-12 month windows, periods, prompts)",
      allowedNow: ["teaser copy only"],
      blockedUntil: ["real payments", "owner approval", "real VIP access"],
      riskLevel: "medium",
    },
  ];
}
