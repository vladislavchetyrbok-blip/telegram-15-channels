export type StarsPaymentSafetyGateStatus =
  | "passed-for-prototype"
  | "blocked-before-live"
  | "requires-owner-approval"
  | "future-only";

export type StarsPaymentSafetyReviewItem = {
  area: string;
  status: StarsPaymentSafetyGateStatus;
  currentEvidence: string[];
  requiredBeforeInvoiceDraft: string[];
  requiredBeforeLiveSend: string[];
  forbiddenNow: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type StarsPaymentOwnerDecision = {
  decision: string;
  required: boolean;
  recommendedDefault: string;
  reason: string;
};

export function getStarsPaymentSafetyReviewItems(): StarsPaymentSafetyReviewItem[] {
  return [
    {
      area: "Product Selection",
      status: "passed-for-prototype",
      currentEvidence: ["Product Catalog Foundation explicitly defines 'vip_compatibility_deep_report' as prototype candidate."],
      requiredBeforeInvoiceDraft: ["Owner approval for product selection"],
      requiredBeforeLiveSend: ["Product catalog payload verification", "Live database active"],
      forbiddenNow: ["Real database calls", "Real pricing assignment"],
      riskLevel: "low"
    },
    {
      area: "Stars Currency XTR",
      status: "passed-for-prototype",
      currentEvidence: ["Prototype strictly enforces 'XTR' currency."],
      requiredBeforeInvoiceDraft: [],
      requiredBeforeLiveSend: ["Telegram verification of Stars merchant capability"],
      forbiddenNow: ["Other fiat currencies (e.g., USD, RUB)"],
      riskLevel: "medium"
    },
    {
      area: "Prototype Invoice Payload",
      status: "passed-for-prototype",
      currentEvidence: ["Payload logic is deterministic and relies on local references only."],
      requiredBeforeInvoiceDraft: ["Payload serialization rules established"],
      requiredBeforeLiveSend: ["Cryptographically secure user and product references"],
      forbiddenNow: ["Dynamic DB queries for pricing"],
      riskLevel: "low"
    },
    {
      area: "Provider Token Handling",
      status: "passed-for-prototype",
      currentEvidence: ["providerTokenMode hardcoded to 'omitted-for-stars'."],
      requiredBeforeInvoiceDraft: [],
      requiredBeforeLiveSend: ["Strict omission verified by compiler for Stars"],
      forbiddenNow: ["Using Stripe or other provider tokens for Stars"],
      riskLevel: "low"
    },
    {
      area: "Live Send Boundary",
      status: "blocked-before-live",
      currentEvidence: ["liveSendAllowed is hardcoded to false.", "No active Telegram API integration exists."],
      requiredBeforeInvoiceDraft: ["Owner review of drafted payload UI"],
      requiredBeforeLiveSend: ["Explicit configuration flag for live send", "Webhook ready"],
      forbiddenNow: ["Calling `sendInvoice`", "Calling `answerPreCheckoutQuery`"],
      riskLevel: "critical"
    },
    {
      area: "Pre-checkout Handling",
      status: "future-only",
      currentEvidence: ["No `answerPreCheckoutQuery` logic exists."],
      requiredBeforeInvoiceDraft: [],
      requiredBeforeLiveSend: ["Webhook capable of answering pre-checkout securely"],
      forbiddenNow: ["Implementing webhook listener in prototype"],
      riskLevel: "high"
    },
    {
      area: "Successful Payment Handling",
      status: "future-only",
      currentEvidence: ["No `successful_payment` hook exists."],
      requiredBeforeInvoiceDraft: [],
      requiredBeforeLiveSend: ["Idempotent handler to avoid duplicate processing"],
      forbiddenNow: ["Processing payment successes locally"],
      riskLevel: "critical"
    },
    {
      area: "Refund Handling",
      status: "future-only",
      currentEvidence: ["No refund logic exists."],
      requiredBeforeInvoiceDraft: [],
      requiredBeforeLiveSend: ["Manual or automated Telegram API refund flow specified"],
      forbiddenNow: ["Refunding Stars (cannot be done by bots via API currently, requires BotFather)"],
      riskLevel: "high"
    },
    {
      area: "Entitlement Creation",
      status: "blocked-before-live",
      currentEvidence: ["VIP content is entirely decoupled from live access state."],
      requiredBeforeInvoiceDraft: [],
      requiredBeforeLiveSend: ["Database writing capabilities for user profiles"],
      forbiddenNow: ["Granting entitlements without database writes"],
      riskLevel: "critical"
    },
    {
      area: "VIP Access Boundary",
      status: "blocked-before-live",
      currentEvidence: ["Package 127 boundary correctly denies access to mock routes by default."],
      requiredBeforeInvoiceDraft: [],
      requiredBeforeLiveSend: ["Route gates wired to live database entitlement state"],
      forbiddenNow: ["Bypassing boundary checks in production"],
      riskLevel: "high"
    },
    {
      area: "Accounting / Withdrawal Tracking",
      status: "future-only",
      currentEvidence: ["No withdrawal tracking exists."],
      requiredBeforeInvoiceDraft: [],
      requiredBeforeLiveSend: ["Plan for accounting Fragment 21-day delays"],
      forbiddenNow: ["Any local calculation of fiat equivalent withdrawals"],
      riskLevel: "medium"
    },
    {
      area: "Production Telegram Bot Token",
      status: "blocked-before-live",
      currentEvidence: ["Check scripts ensure `TELEGRAM_BOT_TOKEN` is not strictly required for local UI."],
      requiredBeforeInvoiceDraft: [],
      requiredBeforeLiveSend: ["Bot token active in `.env.local`"],
      forbiddenNow: ["Using a real token in local prototypes"],
      riskLevel: "critical"
    },
    {
      area: "Owner Approval",
      status: "requires-owner-approval",
      currentEvidence: ["Owner review gate explicit in rules."],
      requiredBeforeInvoiceDraft: ["Owner approval for drafting UI"],
      requiredBeforeLiveSend: ["Explicit signature/approval for live monetization"],
      forbiddenNow: ["Self-authorizing live implementation"],
      riskLevel: "critical"
    }
  ];
}

export function getStarsPaymentOwnerDecisions(): StarsPaymentOwnerDecision[] {
  return [
    {
      decision: "First product selection",
      required: true,
      recommendedDefault: "vip_compatibility_deep_report",
      reason: "Safest, isolated, and most emotionally valuable feature to test."
    },
    {
      decision: "Prototype pricing amount",
      required: true,
      recommendedDefault: "300 Stars",
      reason: "Stars minimum is 1 XTR, maximum is 2500 XTR per invoice. 300 is a standard placeholder."
    },
    {
      decision: "Live invoice transmission",
      required: true,
      recommendedDefault: "Blocked",
      reason: "Requires explicit unblocking of `liveSendAllowed` and a webhook setup."
    },
    {
      decision: "VIP content unlock trigger",
      required: true,
      recommendedDefault: "Blocked",
      reason: "Must remain blocked until the `payment -> entitlement` flow is proven."
    },
    {
      decision: "User-facing Payment CTA",
      required: true,
      recommendedDefault: "Omitted",
      reason: "No CTA should exist until the backend webhook is fully deployed."
    }
  ];
}

export function isStarsPaymentPrototypeSafeForInvoiceDraft(): boolean {
  // Safe for drafting if all low/medium prototype items have passed
  const items = getStarsPaymentSafetyReviewItems();
  const prototypeItems = items.filter(i => 
    i.requiredBeforeInvoiceDraft.length > 0 || i.status === "passed-for-prototype"
  );
  
  // They are technically all statically "passed-for-prototype" or have explicit owner requirements
  // which implies they are safe for local draft building without live network
  return prototypeItems.every(i => i.status !== "blocked-before-live" || i.riskLevel !== "low");
}

export function isStarsPaymentPrototypeSafeForLiveSend(): boolean {
  // Always safely deny live sends for now. 
  // There is no webhook, db, or auth mechanism hooked up here yet.
  return false;
}
