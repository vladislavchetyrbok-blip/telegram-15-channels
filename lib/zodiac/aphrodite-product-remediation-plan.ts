/**
 * Aphrodite Product Remediation Plan (Package 134)
 *
 * STATIC, READ-ONLY PRODUCT MODEL. This file documents how Aphrodite should be
 * reframed from a generic horoscope / Mini App utility into an emotional
 * astrology / relationship product. It is a planning artifact only.
 *
 * Hard boundaries (this module enforces them by simply not doing anything else):
 *  - No payment logic.
 *  - No real VIP access / entitlement granting.
 *  - No Telegram API calls.
 *  - No database writes.
 *  - No changes to active Telegram CTA logic.
 *  - No cron / workflow / publish / bot-sending changes.
 *  - No AI generation. The "AI" modules are product descriptions, not implementations.
 */

export type AphroditeRemediationPriority = "P0" | "P1" | "P2" | "P3";

export type AphroditeRemediationItem = {
  area: string;
  problem: string;
  fix: string;
  priority: AphroditeRemediationPriority;
  expectedImpact: "conversion" | "retention" | "trust" | "traffic" | "revenue";
  blockedUntil: string[];
  safeNextAction: string;
};

export type AphroditeEmotionalProductModule = {
  id: string;
  title: string;
  emotionalQuestion: string;
  freePreviewValue: string[];
  futureVipValue: string[];
  trafficHooks: string[];
  safetyBoundary: string[];
};

export type AphroditeTrustBlock = {
  label: string;
  purpose: string;
  suggestedCopy: string;
  placement: "first-result" | "paywall" | "payment" | "post-payment";
};

export type AphroditeAbTestIdea = {
  test: string;
  variantA: string;
  variantB: string;
  metric: string;
  priority: AphroditeRemediationPriority;
};

/**
 * Shared, non-deterministic phrasing the product must use for any emotional /
 * relationship claim. Kept here so the boundary is a single source of truth.
 */
export const APHRODITE_NON_DETERMINISTIC_LANGUAGE: string[] = [
  "may",
  "tends to",
  "possible pattern",
  "zone of attention",
  "not a final judgment",
];

export const APHRODITE_GLOBAL_SAFETY_BOUNDARIES: string[] = [
  "No payment",
  "No real VIP unlock",
  "No Telegram API call",
  "No database write",
  "No active Telegram CTA changes",
  "No production launch",
];

export const APHRODITE_AUDIT_SUMMARY = {
  currentFraming:
    "Aphrodite currently reads as a generic horoscope / Mini App utility: compatibility percentage, birth matrix, mystic cards, generic daily horoscope.",
  currentProblem:
    "These are tools, not the emotional value. The product opens with feature-copy and a long input form before showing any value, so users do not feel understood and drop before the first result.",
  targetFraming:
    "Reframe around emotional user questions (does he love me, are we compatible, what does he feel, why does he pull away, what happens next, when will I meet someone). Tools become the engine, not the headline.",
  heroScenario: "AI Love Reading",
} as const;

/**
 * Emotional questions the product should be organised around. These are the
 * entry points, not the feature names.
 */
export const APHRODITE_EMOTIONAL_QUESTIONS: string[] = [
  "Does he love me?",
  "Are we compatible?",
  "What does he feel?",
  "Why does he pull away?",
  "Why do I repeat the same relationship pattern?",
  "What will happen in the next 30 days?",
  "When will I meet the right person?",
  "What blocks my love / money / future?",
];

export const APHRODITE_REMEDIATION_ITEMS: AphroditeRemediationItem[] = [
  // ---- P0: first-experience and conversion fundamentals ----
  {
    area: "First screen framing",
    problem:
      "Opens with feature-copy (compatibility %, birth matrix, cards) instead of an emotional outcome.",
    fix: "Reframe the first screen from feature-copy to emotional outcome-copy built around a single question.",
    priority: "P0",
    expectedImpact: "conversion",
    blockedUntil: [],
    safeNextAction: "Package 135 — First Result Experience Rewrite (copy + layout only).",
  },
  {
    area: "Hero scenario",
    problem: "No single clear entry point; users face a menu of tools.",
    fix: "Lead with one hero scenario: AI Love Reading.",
    priority: "P0",
    expectedImpact: "conversion",
    blockedUntil: [],
    safeNextAction: "Define AI Love Reading as the default first flow in Package 135.",
  },
  {
    area: "Free teaser",
    problem: "A long input form is shown before any value is delivered.",
    fix: "Show a free teaser result before the long input form.",
    priority: "P0",
    expectedImpact: "conversion",
    blockedUntil: [],
    safeNextAction: "Specify a minimal free-teaser payload (energy + 1 strength + 1 risk).",
  },
  {
    area: "Loading experience",
    problem: "Instant or generic loading breaks the feeling of a personal reading.",
    fix: "Add staged / ritual loading that frames the wait as the reading being prepared.",
    priority: "P0",
    expectedImpact: "trust",
    blockedUntil: [],
    safeNextAction: "Design a staged loading sequence (no real async work) in Package 135.",
  },
  {
    area: "First result personalisation",
    problem: "First result feels generic and templated.",
    fix: "Make the first result more personal (reference the user's sign energy and the question they asked).",
    priority: "P0",
    expectedImpact: "retention",
    blockedUntil: [],
    safeNextAction: "Map free-teaser fields to the chosen emotional question.",
  },
  {
    area: "Paywall clarity",
    problem: "Free vs VIP boundary is unclear, so users do not understand what they get.",
    fix: "Clarify the Free vs VIP paywall: show exactly what is free now and what VIP would add.",
    priority: "P0",
    expectedImpact: "revenue",
    blockedUntil: ["Package 133 invoice-draft safety hardening", "owner approval", "real payments"],
    safeNextAction: "Document Free vs VIP value split per module (this file). No live paywall.",
  },
  {
    area: "Trust before payment",
    problem: "No trust, support, privacy, or refund cues before the paywall.",
    fix: "Add trust / support / privacy / refund cues before any payment step.",
    priority: "P0",
    expectedImpact: "trust",
    blockedUntil: ["real payments"],
    safeNextAction: "Define trust blocks (this file) for first-result, paywall, payment, post-payment.",
  },

  // ---- P1: emotional product module foundations ----
  {
    area: "AI Love Reading Foundation",
    problem: "The hero scenario has no defined free/VIP value model.",
    fix: "Define AI Love Reading foundation: emotional question, free preview, future VIP value.",
    priority: "P1",
    expectedImpact: "conversion",
    blockedUntil: ["AI generation (not in scope)"],
    safeNextAction: "Use the static module definition below as the spec.",
  },
  {
    area: "Soulmate Scanner Foundation",
    problem: "No 'who is meant for me' flow exists.",
    fix: "Define Soulmate Scanner foundation as a future module.",
    priority: "P1",
    expectedImpact: "retention",
    blockedUntil: ["AI generation (not in scope)"],
    safeNextAction: "Use the static module definition below as the spec.",
  },
  {
    area: "Red Flags Scanner Foundation",
    problem: "No safety / awareness flow exists.",
    fix: "Define Red Flags Scanner foundation with strictly non-deterministic language.",
    priority: "P1",
    expectedImpact: "trust",
    blockedUntil: ["AI generation (not in scope)"],
    safeNextAction: "Use the static module definition and the non-deterministic language list.",
  },
  {
    area: "Daily Message From Universe",
    problem: "Daily content is generic horoscope, not a personal daily ritual.",
    fix: "Define Daily Message From Universe as a retention loop.",
    priority: "P1",
    expectedImpact: "retention",
    blockedUntil: ["AI generation (not in scope)"],
    safeNextAction: "Use the static module definition below as the spec.",
  },
  {
    area: "AI Future Timeline",
    problem: "No forward-looking 'what is coming next' product.",
    fix: "Define AI Future Timeline as a future module.",
    priority: "P1",
    expectedImpact: "revenue",
    blockedUntil: ["AI generation (not in scope)"],
    safeNextAction: "Use the static module definition below as the spec.",
  },

  // ---- P2: traffic / social layer (documented only) ----
  {
    area: "Instagram traffic layer",
    problem: "No structured top-of-funnel from Instagram Stories / Reels.",
    fix: "Document an Instagram Stories / Reels traffic layer.",
    priority: "P2",
    expectedImpact: "traffic",
    blockedUntil: ["Instagram/TikTok automation (not started)"],
    safeNextAction: "Keep as spec only; no automation in this package.",
  },
  {
    area: "TikTok viral layer",
    problem: "No TikTok viral content strategy.",
    fix: "Document a TikTok viral content layer.",
    priority: "P2",
    expectedImpact: "traffic",
    blockedUntil: ["Instagram/TikTok automation (not started)"],
    safeNextAction: "Keep as spec only; no automation in this package.",
  },
  {
    area: "Viral copy templates",
    problem: "No reusable viral zodiac copy templates.",
    fix: "Document viral zodiac copy templates (hooks per sign / per question).",
    priority: "P2",
    expectedImpact: "traffic",
    blockedUntil: [],
    safeNextAction: "Draft template structure in a later package.",
  },
  {
    area: "Social export dashboard",
    problem: "No way to turn results into shareable social assets.",
    fix: "Document a social export dashboard concept (read-only).",
    priority: "P2",
    expectedImpact: "traffic",
    blockedUntil: ["Instagram/TikTok automation (not started)"],
    safeNextAction: "Spec only.",
  },
  {
    area: "Manual review queue",
    problem: "No human-in-the-loop review for generated/social content.",
    fix: "Document a manual review queue (UI / read-only) before anything is published.",
    priority: "P2",
    expectedImpact: "trust",
    blockedUntil: [],
    safeNextAction: "Keep Manual Review UI / read-only; no publishing changes.",
  },
];

export const APHRODITE_EMOTIONAL_PRODUCT_MODULES: AphroditeEmotionalProductModule[] = [
  {
    id: "ai-love-reading",
    title: "AI Love Reading",
    emotionalQuestion: "What does he feel and what is really happening between us?",
    freePreviewValue: [
      "main energy of the connection",
      "one strength",
      "one risk zone",
    ],
    futureVipValue: [
      "what he feels",
      "why he pulls away",
      "what he is afraid of",
      "how to get closer",
      "30-day forecast",
      "red flags",
      "personal advice",
    ],
    trafficHooks: [
      "\"What he feels but won't say\" Reels hook",
      "POV: you finally read his energy",
      "sign-by-sign 'does he love you' series",
    ],
    safetyBoundary: [
      "No payment",
      "No real VIP unlock",
      "No Telegram API call",
      "No database write",
      "Non-deterministic language only",
    ],
  },
  {
    id: "soulmate-scanner",
    title: "Soulmate Scanner",
    emotionalQuestion: "What kind of person is meant for me?",
    freePreviewValue: [
      "general partner type",
      "likely emotional pattern",
      "strongest sign energy",
    ],
    futureVipValue: [
      "where the meeting may happen",
      "age / maturity pattern",
      "signs that fit best",
      "blocks preventing relationships",
      "3-month timeline",
    ],
    trafficHooks: [
      "\"Your soulmate's sign\" reveal format",
      "where you'll meet them story poll",
      "green-flag partner type per sign",
    ],
    safetyBoundary: [
      "No payment",
      "No real VIP unlock",
      "No Telegram API call",
      "No database write",
      "Non-deterministic language only",
    ],
  },
  {
    id: "red-flags-scanner",
    title: "Red Flags Scanner",
    emotionalQuestion: "What should I notice before I get hurt?",
    freePreviewValue: [
      "one possible red flag",
      "one soft warning",
    ],
    futureVipValue: [
      "emotional avoidance",
      "jealousy / control risk",
      "silence / conflict pattern",
      "attachment style hint",
      "what to do next",
    ],
    trafficHooks: [
      "\"Notice this before you fall\" series",
      "soft red flags per sign",
      "attachment-style awareness content",
    ],
    safetyBoundary: [
      "No payment",
      "No real VIP unlock",
      "No Telegram API call",
      "No database write",
      "Strictly non-deterministic: may / tends to / possible pattern / zone of attention / not a final judgment",
    ],
  },
  {
    id: "daily-message-from-universe",
    title: "Daily Message From Universe",
    emotionalQuestion: "What do I need to hear today?",
    freePreviewValue: [
      "short daily message",
    ],
    futureVipValue: [
      "personal interpretation",
      "relationship angle",
      "money / future angle",
      "action of the day",
    ],
    trafficHooks: [
      "daily message screenshot-to-share format",
      "\"your sign's message today\" series",
      "save-and-revisit daily ritual",
    ],
    safetyBoundary: [
      "No payment",
      "No real VIP unlock",
      "No Telegram API call",
      "No database write",
      "Non-deterministic language only",
    ],
  },
  {
    id: "ai-future-timeline",
    title: "AI Future Timeline",
    emotionalQuestion: "What is coming next?",
    freePreviewValue: [
      "1-2 visible months",
    ],
    futureVipValue: [
      "6-12 month timeline",
      "love",
      "money",
      "opportunities",
      "warning periods",
      "best action windows",
    ],
    trafficHooks: [
      "\"Your next 12 months\" teaser",
      "month-by-month love forecast series",
      "best windows countdown content",
    ],
    safetyBoundary: [
      "No payment",
      "No real VIP unlock",
      "No Telegram API call",
      "No database write",
      "Non-deterministic language only",
    ],
  },
];

export const APHRODITE_TRUST_BLOCKS: AphroditeTrustBlock[] = [
  {
    label: "Privacy reassurance",
    purpose: "Reduce anxiety about sharing personal / birth details.",
    suggestedCopy: "Your details are used only to prepare your reading. Nothing is shared.",
    placement: "first-result",
  },
  {
    label: "What you get",
    purpose: "Make the Free vs VIP boundary explicit before any ask.",
    suggestedCopy: "Your free reading is ready. A full reading would add what he feels, why he pulls away, and your 30-day forecast.",
    placement: "paywall",
  },
  {
    label: "Support & refund",
    purpose: "Lower perceived risk at the moment of payment.",
    suggestedCopy: "Friendly support and a clear refund policy. You're never stuck.",
    placement: "payment",
  },
  {
    label: "Delivery confidence",
    purpose: "Confirm value was delivered and invite the next step.",
    suggestedCopy: "Your full reading is saved here. Come back any time to re-read it.",
    placement: "post-payment",
  },
];

export const APHRODITE_AB_TEST_IDEAS: AphroditeAbTestIdea[] = [
  {
    test: "First screen framing",
    variantA: "Feature menu (compatibility %, matrix, cards)",
    variantB: "Single emotional question: 'Does he love me?'",
    metric: "Start-reading rate",
    priority: "P0",
  },
  {
    test: "Teaser before form",
    variantA: "Long input form first",
    variantB: "Free teaser result first, then form",
    metric: "Form-completion rate",
    priority: "P0",
  },
  {
    test: "Loading style",
    variantA: "Instant result",
    variantB: "Staged ritual loading",
    metric: "Result-view to paywall-view rate",
    priority: "P1",
  },
  {
    test: "Paywall value framing",
    variantA: "Price-led paywall",
    variantB: "Value-led paywall (what VIP reveals)",
    metric: "Paywall continue rate (no live payment)",
    priority: "P1",
  },
];

export const APHRODITE_RECOMMENDED_NEXT_PACKAGES: string[] = [
  "Package 135 — First Result Experience Rewrite (copy + layout, no payments)",
  "Package 136 — AI Love Reading static result template",
  "Package 137 — Free vs VIP value presentation (still no live payments)",
];

export function getAphroditeRemediationItemsByPriority(
  priority: AphroditeRemediationPriority
): AphroditeRemediationItem[] {
  return APHRODITE_REMEDIATION_ITEMS.filter((item) => item.priority === priority);
}

export function getAphroditeModuleById(
  id: string
): AphroditeEmotionalProductModule | undefined {
  return APHRODITE_EMOTIONAL_PRODUCT_MODULES.find((m) => m.id === id);
}
