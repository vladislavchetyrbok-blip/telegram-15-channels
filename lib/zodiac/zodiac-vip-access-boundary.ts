import type {
  ZodiacEntitlementDraft,
  ZodiacEntitlementAccessType,
  ZodiacEntitlementStatus
} from "./zodiac-entitlement-foundation";

export type ZodiacVipAccessDecision =
  | "allow-preview"
  | "allow-vip"
  | "deny-missing-entitlement"
  | "deny-pending-payment"
  | "deny-expired"
  | "deny-refunded"
  | "deny-revoked"
  | "deny-unsupported-product";

export type ZodiacVipAccessResult = {
  allowed: boolean;
  decision: ZodiacVipAccessDecision;
  reason: string;
  productCode?: string;
  accessType?: ZodiacEntitlementAccessType;
  entitlementStatus?: ZodiacEntitlementStatus;
};

export type ZodiacVipAccessBoundaryItem = {
  area: string;
  status: "local-boundary-only" | "future-only" | "blocked" | "ready-for-next-package";
  purpose: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export function evaluateVipAccess(args: {
  productCode: string;
  entitlement?: ZodiacEntitlementDraft;
  nowIso?: string;
}): ZodiacVipAccessResult {
  if (!args.entitlement) {
    return {
      allowed: false,
      decision: "deny-missing-entitlement",
      reason: "No entitlement found for user and product.",
      productCode: args.productCode
    };
  }

  if (args.entitlement.productCode !== args.productCode) {
    return {
      allowed: false,
      decision: "deny-unsupported-product",
      reason: "Entitlement product code does not match requested product.",
      productCode: args.productCode,
      entitlementStatus: args.entitlement.status,
      accessType: args.entitlement.accessType
    };
  }

  if (args.entitlement.accessType === "preview-only") {
    return {
      allowed: true,
      decision: "allow-preview",
      reason: "Local free preview access granted. Not real VIP.",
      productCode: args.productCode,
      entitlementStatus: args.entitlement.status,
      accessType: args.entitlement.accessType
    };
  }

  if (args.entitlement.status === "pending-payment") {
    return {
      allowed: false,
      decision: "deny-pending-payment",
      reason: "Payment is pending.",
      productCode: args.productCode,
      entitlementStatus: args.entitlement.status,
      accessType: args.entitlement.accessType
    };
  }

  if (args.entitlement.status === "refunded") {
    return {
      allowed: false,
      decision: "deny-refunded",
      reason: "Entitlement was refunded.",
      productCode: args.productCode,
      entitlementStatus: args.entitlement.status,
      accessType: args.entitlement.accessType
    };
  }

  if (args.entitlement.status === "revoked") {
    return {
      allowed: false,
      decision: "deny-revoked",
      reason: "Entitlement was revoked.",
      productCode: args.productCode,
      entitlementStatus: args.entitlement.status,
      accessType: args.entitlement.accessType
    };
  }

  if (args.entitlement.status === "expired") {
    return {
      allowed: false,
      decision: "deny-expired",
      reason: "Entitlement is expired.",
      productCode: args.productCode,
      entitlementStatus: args.entitlement.status,
      accessType: args.entitlement.accessType
    };
  }

  if (args.entitlement.status === "active") {
    if (args.entitlement.expiresAt) {
      const now = args.nowIso ? new Date(args.nowIso) : new Date();
      const expires = new Date(args.entitlement.expiresAt);
      if (now > expires) {
        return {
          allowed: false,
          decision: "deny-expired",
          reason: "Entitlement has passed its expiry date.",
          productCode: args.productCode,
          entitlementStatus: args.entitlement.status,
          accessType: args.entitlement.accessType
        };
      }
    }
    return {
      allowed: true,
      decision: "allow-vip",
      reason: "VIP access granted based on active entitlement.",
      productCode: args.productCode,
      entitlementStatus: args.entitlement.status,
      accessType: args.entitlement.accessType
    };
  }

  return {
    allowed: false,
    decision: "deny-missing-entitlement",
    reason: "Unknown entitlement state.",
    productCode: args.productCode,
    entitlementStatus: args.entitlement.status,
    accessType: args.entitlement.accessType
  };
}

export function createPreviewAccessResult(productCode: string): ZodiacVipAccessResult {
  return {
    allowed: true,
    decision: "allow-preview",
    reason: "Local free preview access granted.",
    productCode,
    accessType: "preview-only"
  };
}
