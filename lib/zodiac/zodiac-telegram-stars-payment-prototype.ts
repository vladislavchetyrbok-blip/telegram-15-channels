export type ZodiacStarsPrototypeProductCode =
  | "vip_compatibility_deep_report";

export type ZodiacStarsPrototypeInvoice = {
  productCode: ZodiacStarsPrototypeProductCode;
  title: string;
  description: string;
  currency: "XTR";
  amountStars: number;
  payload: string;
  providerTokenMode: "omitted-for-stars";
  liveSendAllowed: false;
};

export type ZodiacStarsPaymentPrototypeBoundary = {
  area: string;
  status:
    | "prototype-only"
    | "future-live-invoice"
    | "future-pre-checkout"
    | "future-successful-payment"
    | "blocked";
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export function createStarsPrototypeInvoice(args: {
  productCode: ZodiacStarsPrototypeProductCode;
  userRef: string;
}): ZodiacStarsPrototypeInvoice {
  if (args.productCode === "vip_compatibility_deep_report") {
    return {
      productCode: args.productCode,
      title: "VIP Compatibility Deep Report",
      description: "Unlock the deepest layers of your astrological connection. Prototype only.",
      currency: "XTR",
      amountStars: 300,
      payload: `zodiac_vip_compat_${args.userRef}_${Date.now()}`,
      providerTokenMode: "omitted-for-stars",
      liveSendAllowed: false,
    };
  }

  throw new Error("Unknown product code for prototype invoice");
}

export function getStarsPaymentPrototypeBoundaries(): ZodiacStarsPaymentPrototypeBoundary[] {
  return [
    {
      area: "Telegram Stars Invoice Payload",
      status: "prototype-only",
      allowedNow: ["Defining static types", "Creating local payload builders"],
      blockedUntil: ["Owner approval for live sendInvoice", "Real bot token configuration"],
      riskLevel: "low",
    },
    {
      area: "Live `sendInvoice` API Call",
      status: "blocked",
      allowedNow: ["None"],
      blockedUntil: ["Owner approval for Telegram API live payment"],
      riskLevel: "critical",
    },
    {
      area: "Pre-checkout Query Handler",
      status: "future-pre-checkout",
      allowedNow: ["None"],
      blockedUntil: ["Webhook deployment", "Live invoice capability"],
      riskLevel: "high",
    },
    {
      area: "Successful Payment Handler",
      status: "future-successful-payment",
      allowedNow: ["None"],
      blockedUntil: ["Webhook deployment", "Database entitlement capability"],
      riskLevel: "high",
    },
    {
      area: "Entitlement Creation from Payment",
      status: "blocked",
      allowedNow: ["None"],
      blockedUntil: ["Live successful payment flow", "Database live connection"],
      riskLevel: "critical",
    },
  ];
}

export function isStarsPrototypeInvoiceSafe(
  invoice: ZodiacStarsPrototypeInvoice
): boolean {
  if (invoice.currency !== "XTR") return false;
  if (invoice.providerTokenMode !== "omitted-for-stars") return false;
  if (invoice.liveSendAllowed !== false) return false;
  return true;
}
