/**
 * Package 126: Entitlement Model Foundation
 * 
 * This file provides the "Typed foundation only" for product entitlements.
 * 
 * BOUNDARY RULES:
 * - No live database modifications.
 * - No actual payment processing.
 * - No actual live VIP access checking (future packages).
 * - No session persistence.
 */

export type ZodiacEntitlementStatus =
  | "draft"
  | "pending-payment"
  | "active"
  | "expired"
  | "refunded"
  | "revoked"
  | "future-only";

export type ZodiacEntitlementAccessType =
  | "one-time-report"
  | "time-limited"
  | "subscription"
  | "preview-only";

export type ZodiacEntitlementDraft = {
  userRef: string;
  productCode: string;
  accessType: ZodiacEntitlementAccessType;
  status: ZodiacEntitlementStatus;
  startsAt?: string;
  expiresAt?: string;
  sourcePaymentId?: string;
  notes?: string;
};

export type ZodiacEntitlementFoundationItem = {
  area: string;
  status: "typed-foundation-only" | "future-only" | "blocked" | "ready-for-next-package";
  purpose: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export function createPreviewEntitlementDraft(args: {
  userRef: string;
  productCode: string;
}): ZodiacEntitlementDraft {
  return {
    userRef: args.userRef,
    productCode: args.productCode,
    accessType: "preview-only",
    status: "active",
    notes: "Preview access generated locally.",
  };
}

export function createPendingPaymentEntitlementDraft(args: {
  userRef: string;
  productCode: string;
  accessType: ZodiacEntitlementAccessType;
}): ZodiacEntitlementDraft {
  return {
    userRef: args.userRef,
    productCode: args.productCode,
    accessType: args.accessType,
    status: "pending-payment",
    notes: "Pending payment confirmation.",
  };
}

export function isEntitlementActive(
  entitlement: ZodiacEntitlementDraft,
  nowIso?: string
): boolean {
  if (entitlement.status !== "active") return false;
  if (entitlement.accessType === "preview-only") return false; // Previews are not paid VIP access

  if (entitlement.expiresAt) {
    const now = nowIso ? new Date(nowIso) : new Date();
    const expiry = new Date(entitlement.expiresAt);
    if (now > expiry) {
      return false;
    }
  }

  return true;
}
