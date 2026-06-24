/**
 * Aphrodite Social Draft Review Queue (Package 143)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC. A human review workflow that sits between the
 * Package 142 content engine and any manual posting. Read-only data + a pure review
 * decision function. Nothing is posted, exported automatically, or stored.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - No auto-posting. No Instagram / TikTok / YouTube / Telegram API calls.
 *  - No scraping. No stored account credentials. No browser automation.
 *  - No database write. No external fetch. No AI API.
 *  - No copied competitor content. No active payment CTA. No real VIP unlock.
 *  - No deterministic prophecy; no medical / legal / financial / manipulation advice.
 *  - No production launch. Manual export only.
 */

export type AphroditeSocialDraftReviewStatus =
  | "draft"
  | "needs-review"
  | "approved-for-manual-export"
  | "rejected"
  | "blocked-by-safety";

export type AphroditeSocialDraftReviewDecision =
  | "approve-for-manual-export"
  | "request-edit"
  | "reject"
  | "block-by-safety";

export type AphroditeSocialDraftReviewItem = {
  id: string;
  sourceTemplateId: string;
  platform: "instagram" | "tiktok" | "telegram" | "youtube-shorts";
  pillar:
    | "ai-love-reading"
    | "soulmate-scanner"
    | "red-flags-scanner"
    | "future-timeline"
    | "daily-message"
    | "zodiac-compatibility"
    | "angel-numbers"
    | "birth-matrix";
  title: string;
  hook: string;
  caption: string;
  safeCta: string;
  status: AphroditeSocialDraftReviewStatus;
  reviewerNotes: string[];
  safetyFlags: string[];
  manualExportChecklist: string[];
};

export type AphroditeSocialDraftReviewRule = {
  id: string;
  label: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  blockedPhrases: string[];
  allowedReplacement: string;
};

export type AphroditeSocialDraftReviewBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeSocialDraftReviewNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_REVIEW_MANUAL_EXPORT_CHECKLIST: string[] = [
  "Human reviewer approved copy",
  "No platform API call",
  "No auto-posting",
  "No payment CTA",
  "No copied competitor content",
  "No deterministic claim",
  "No unsafe advice",
  "Manual export only",
];

export const APHRODITE_REVIEW_SAFETY_BOUNDARIES: string[] = [
  "No auto-posting",
  "No Instagram API call",
  "No TikTok API call",
  "No YouTube API call",
  "No Telegram API call",
  "No scraping",
  "No account credentials",
  "No copied competitor content",
  "No active payment CTA",
  "No database write",
  "No production launch",
];

export const APHRODITE_REVIEW_STATES: AphroditeSocialDraftReviewStatus[] = [
  "draft",
  "needs-review",
  "approved-for-manual-export",
  "rejected",
  "blocked-by-safety",
];

type QueueSeed = {
  pillar: AphroditeSocialDraftReviewItem["pillar"];
  platform: AphroditeSocialDraftReviewItem["platform"];
  templateId: string;
  title: string;
  hook: string;
  caption: string;
  status: AphroditeSocialDraftReviewStatus;
  notes: string[];
  flags: string[];
};

const QUEUE_SEEDS: QueueSeed[] = [
  { pillar: "ai-love-reading", platform: "instagram", templateId: "tpl-pull-away", title: "If he pulls away...", hook: "If he pulls away, it may not mean what you fear.", caption: "A soft, original Aphrodite read on distance.", status: "needs-review", notes: ["Tone reads gentle."], flags: [] },
  { pillar: "soulmate-scanner", platform: "tiktok", templateId: "tpl-soulmate-type", title: "Your soulmate type by sign...", hook: "Your soulmate type, by your sign — a soft read.", caption: "Partner energy that may fit your sign.", status: "needs-review", notes: [], flags: [] },
  { pillar: "red-flags-scanner", platform: "instagram", templateId: "tpl-red-flag", title: "One red flag your sign ignores...", hook: "One soft red flag your sign tends to overlook.", caption: "A caring zone of attention — not an accusation.", status: "needs-review", notes: ["Confirm non-accusatory framing."], flags: [] },
  { pillar: "future-timeline", platform: "tiktok", templateId: "tpl-next-30", title: "What the next 30 days may bring...", hook: "What the next 30 days may gently open for you.", caption: "A soft window — possible, never a fixed promise.", status: "draft", notes: [], flags: [] },
  { pillar: "daily-message", platform: "telegram", templateId: "tpl-daily-message", title: "Message from the Universe today...", hook: "A short message from the Universe for today.", caption: "Today's gentle reminder.", status: "approved-for-manual-export", notes: ["Reviewed and approved by a human."], flags: [] },
  { pillar: "zodiac-compatibility", platform: "instagram", templateId: "tpl-compatibility-tension", title: "Compatibility tension point...", hook: "The one tension point your pairing may share.", caption: "Soft guidance on where friction may sit.", status: "needs-review", notes: [], flags: [] },
  { pillar: "angel-numbers", platform: "instagram", templateId: "tpl-angel-number", title: "Angel number meaning...", hook: "Seeing the same number? A gentle meaning.", caption: "A soft, reassuring read.", status: "draft", notes: [], flags: [] },
  { pillar: "birth-matrix", platform: "youtube-shorts", templateId: "tpl-birth-matrix", title: "Birth matrix hidden pattern...", hook: "A hidden pattern your birth matrix may hint at.", caption: "A tendency to explore, not a fixed fate.", status: "blocked-by-safety", notes: ["Flagged for a phrasing review."], flags: ["Check for any deterministic wording before export."] },
];

const SAFE_CTA = "Open Aphrodite in Telegram";

export function getAphroditeSocialDraftReviewQueue(): AphroditeSocialDraftReviewItem[] {
  return QUEUE_SEEDS.map((seed, i) => ({
    id: `review-${String(i + 1).padStart(2, "0")}-${seed.pillar}`,
    sourceTemplateId: seed.templateId,
    platform: seed.platform,
    pillar: seed.pillar,
    title: seed.title,
    hook: seed.hook,
    caption: seed.caption,
    safeCta: SAFE_CTA,
    status: seed.status,
    reviewerNotes: seed.notes.slice(),
    safetyFlags: seed.flags.slice(),
    manualExportChecklist: APHRODITE_REVIEW_MANUAL_EXPORT_CHECKLIST.slice(),
  }));
}

export function getAphroditeSocialDraftReviewRules(): AphroditeSocialDraftReviewRule[] {
  return [
    { id: "rule-no-payment-cta", label: "No payment CTA", description: "Drafts may only use free Mini App CTAs.", severity: "high", blockedPhrases: ["buy vip now", "subscribe now", "unlock full report now", "pay now"], allowedReplacement: "Open Aphrodite in Telegram" },
    { id: "rule-no-deterministic", label: "No deterministic claim", description: "No guaranteed outcomes or fate claims.", severity: "high", blockedPhrases: ["guaranteed", "100% true", "he will return", "definitely will"], allowedReplacement: "a possible pattern — not a final judgment" },
    { id: "rule-no-magic", label: "No spell / loyalty magic", description: "No magic, spell, or loyalty-magic claims.", severity: "critical", blockedPhrases: ["spell", "loyalty magic", "love spell"], allowedReplacement: "a gentle, soft read" },
    { id: "rule-no-advice", label: "No unsafe advice", description: "No medical, legal, financial, emergency, or manipulation advice.", severity: "critical", blockedPhrases: ["invest in", "take this medication", "sue them", "make him obsessed"], allowedReplacement: "a soft, reflective prompt" },
    { id: "rule-no-copied", label: "No copied competitor content", description: "Original Aphrodite voice only; no competitor names or copied text.", severity: "high", blockedPhrases: ["co-star", "the pattern app", "copied from"], allowedReplacement: "original Aphrodite phrasing" },
    { id: "rule-no-api", label: "No platform API / auto-posting", description: "Review and export are manual; no platform API or auto-posting.", severity: "critical", blockedPhrases: ["auto-post", "api.instagram", "open.tiktokapis", "publishpost("], allowedReplacement: "manual export only" },
  ];
}

export function getAphroditeSocialDraftReviewBoundaries(): AphroditeSocialDraftReviewBoundary[] {
  return [
    { area: "Review queue + decisions (read-only data, pure function)", allowedNow: ["local review states", "manual export checklist"], blockedUntil: [], riskLevel: "low" },
    { area: "Manual export (human-led)", allowedNow: ["export approved drafts for a human to post"], blockedUntil: [], riskLevel: "low" },
    { area: "Auto-posting / platform API / scraping / credentials", allowedNow: [], blockedUntil: ["never — out of scope by design"], riskLevel: "critical" },
    { area: "Database write / payments / real VIP unlock / production launch", allowedNow: [], blockedUntil: ["explicit owner approval", "legal", "real-implementation packages"], riskLevel: "high" },
  ];
}

export function getAphroditeSocialDraftReviewNextSteps(): AphroditeSocialDraftReviewNextStep[] {
  return [
    { package: "Package 144", title: "Social Export Dashboard", purpose: "A read-only export view for approved drafts (manual copy-out only).", blockedUntil: ["this review queue approved"] },
    { package: "Future", title: "Assisted manual scheduling", purpose: "Export-only scheduling aids; never auto-posting.", blockedUntil: ["explicit owner approval", "platform ToS review"] },
  ];
}

const DECISION_STATUS: Record<AphroditeSocialDraftReviewDecision, AphroditeSocialDraftReviewStatus> = {
  "approve-for-manual-export": "approved-for-manual-export",
  "request-edit": "needs-review",
  "reject": "rejected",
  "block-by-safety": "blocked-by-safety",
};

/**
 * Pure, deterministic review decision. Returns a NEW item with the updated status
 * and an appended reviewer note. Does not mutate the input. No I/O.
 */
export function reviewAphroditeSocialDraft(
  item: AphroditeSocialDraftReviewItem,
  decision: AphroditeSocialDraftReviewDecision,
  reviewerNote?: string
): AphroditeSocialDraftReviewItem {
  const status = DECISION_STATUS[decision];
  const note = (reviewerNote || "").trim();
  const stamped = `[${decision}] ${note || "no note"}`;
  const safetyFlags =
    decision === "block-by-safety"
      ? [...item.safetyFlags, note || "Blocked by safety review."]
      : item.safetyFlags.slice();
  return {
    ...item,
    status,
    reviewerNotes: [...item.reviewerNotes, stamped],
    safetyFlags,
  };
}
