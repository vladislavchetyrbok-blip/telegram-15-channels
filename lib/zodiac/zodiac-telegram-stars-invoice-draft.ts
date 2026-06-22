export type ZodiacStarsInvoiceDraftProductCode =
  | "vip_compatibility_deep_report";

export type ZodiacStarsInvoiceDraft = {
  productCode: ZodiacStarsInvoiceDraftProductCode;
  title: string;
  description: string;
  currency: "XTR";
  prices: Array<{
    label: string;
    amount: number;
  }>;
  payload: string;
  providerTokenMode: "omitted-for-stars";
  liveSendAllowed: false;
  requiresOwnerApprovalBeforeSend: true;
  metadata: {
    userRef: string;
    draftVersion: string;
    createdFor: "local-draft-only";
  };
};

export type ZodiacStarsInvoiceDraftBoundary = {
  area: string;
  status:
    | "draft-only"
    | "blocked-before-live-send"
    | "future-pre-checkout"
    | "future-successful-payment"
    | "future-refund"
    | "blocked";
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

/**
 * Creates a safe, deterministic, local-only invoice draft payload.
 * It forces `liveSendAllowed` to false and securely constructs a mock payload string.
 */
export function createStarsInvoiceDraft(args: {
  productCode: ZodiacStarsInvoiceDraftProductCode;
  userRef: string;
}): ZodiacStarsInvoiceDraft {
  const amount = 300; // Static placeholder price
  
  // The payload format we expect to send to Telegram.
  // It must be deterministic to trace exactly what product and user are involved.
  const deterministicPayload = `${args.productCode}::${args.userRef}::v1_draft`;

  return {
    productCode: args.productCode,
    title: "VIP Compatibility Deep Report",
    description: "Unlock the deepest layers of your astrological connection.",
    currency: "XTR",
    prices: [
      {
        label: "VIP Unlock",
        amount,
      }
    ],
    payload: deterministicPayload,
    providerTokenMode: "omitted-for-stars",
    liveSendAllowed: false,
    requiresOwnerApprovalBeforeSend: true,
    metadata: {
      userRef: args.userRef,
      draftVersion: "v1_draft",
      createdFor: "local-draft-only",
    }
  };
}

/**
 * Defines the strict boundaries surrounding the invoice draft.
 */
export function getStarsInvoiceDraftBoundaries(): ZodiacStarsInvoiceDraftBoundary[] {
  return [
    {
      area: "Invoice Draft Construction",
      status: "draft-only",
      allowedNow: ["Deterministic static generation", "UI Payload display"],
      blockedUntil: [],
      riskLevel: "low"
    },
    {
      area: "Live Send Execution",
      status: "blocked-before-live-send",
      allowedNow: [],
      blockedUntil: ["Owner approval to unblock", "Webhook listener deployed"],
      riskLevel: "critical"
    },
    {
      area: "Pre-Checkout Query",
      status: "future-pre-checkout",
      allowedNow: [],
      blockedUntil: ["Webhook listener deployed", "Live send unblocked"],
      riskLevel: "high"
    },
    {
      area: "Successful Payment Hook",
      status: "future-successful-payment",
      allowedNow: [],
      blockedUntil: ["Webhook listener deployed", "Database persistence layer active"],
      riskLevel: "critical"
    },
    {
      area: "VIP Entitlement Creation",
      status: "blocked",
      allowedNow: [],
      blockedUntil: ["Successful payment hook securely implemented"],
      riskLevel: "critical"
    }
  ];
}

/**
 * Verifies that the draft adheres to all static rules for local UI display.
 */
export function isStarsInvoiceDraftSafeForLocalUse(draft: ZodiacStarsInvoiceDraft): boolean {
  if (draft.currency !== "XTR") return false;
  if (draft.providerTokenMode !== "omitted-for-stars") return false;
  if (draft.liveSendAllowed !== false) return false;
  if (draft.requiresOwnerApprovalBeforeSend !== true) return false;
  if (!Array.isArray(draft.prices) || draft.prices.length !== 1) return false;
  if (draft.prices[0].amount <= 0) return false;
  if (!draft.payload || draft.payload.indexOf("::") === -1) return false;
  
  return true;
}

/**
 * Always strictly denies the live send capability for this prototype layer.
 */
export function isStarsInvoiceDraftSafeForLiveSend(draft: ZodiacStarsInvoiceDraft): boolean {
  // Static denial. The environment lacks safety guarantees for real transactions.
  return false;
}
