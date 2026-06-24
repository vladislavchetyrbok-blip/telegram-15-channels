import type { ZodiacStarsInvoiceDraft } from "./zodiac-telegram-stars-invoice-draft";

// Mirrors isStarsInvoiceDraftSafeForLiveSend from ./zodiac-telegram-stars-invoice-draft.
// Live send is statically denied in this prototype. Re-asserted locally so this
// hardening layer enforces the boundary with no runtime cross-module dependency.
function isStarsInvoiceDraftSafeForLiveSend(_draft: ZodiacStarsInvoiceDraft): boolean {
  return false;
}

export type MockApiRejectionReason = 
  | "LIVE_SEND_NOT_ALLOWED"
  | "INVALID_CURRENCY"
  | "INVALID_PROVIDER_TOKEN_MODE"
  | "MISSING_OWNER_APPROVAL"
  | "DATABASE_URL_NOT_CONFIGURED"
  | "TELEGRAM_BOT_TOKEN_NOT_CONFIGURED";

export type MockApiGatewayResponse = {
  success: false;
  intercepted: true;
  layer: "safety-hardening-gateway";
  rejectionReason: MockApiRejectionReason;
  message: string;
};

/**
 * Acts as a mock API integration gateway for the `sendInvoice` endpoint.
 * It simulates an API call but strictly intercepts and rejects the draft
 * based on the static safety boundaries established.
 */
export async function simulateSendInvoiceBoundary(
  draft: ZodiacStarsInvoiceDraft
): Promise<MockApiGatewayResponse> {
  // 1. Hard verify live send boundary
  if (!isStarsInvoiceDraftSafeForLiveSend(draft)) {
    return {
      success: false,
      intercepted: true,
      layer: "safety-hardening-gateway",
      rejectionReason: "LIVE_SEND_NOT_ALLOWED",
      message: "Safety hardening active: liveSendAllowed is strictly false. Real Telegram API call blocked."
    };
  }

  // (Unreachable in prototype, but adding formal validations for future architecture)
  if (draft.currency !== "XTR") {
    return {
      success: false,
      intercepted: true,
      layer: "safety-hardening-gateway",
      rejectionReason: "INVALID_CURRENCY",
      message: "Safety hardening active: currency must be exactly XTR for Stars invoices."
    };
  }

  if (draft.providerTokenMode !== "omitted-for-stars") {
    return {
      success: false,
      intercepted: true,
      layer: "safety-hardening-gateway",
      rejectionReason: "INVALID_PROVIDER_TOKEN_MODE",
      message: "Safety hardening active: provider_token must be omitted for Telegram Stars."
    };
  }

  if (draft.requiresOwnerApprovalBeforeSend) {
    return {
      success: false,
      intercepted: true,
      layer: "safety-hardening-gateway",
      rejectionReason: "MISSING_OWNER_APPROVAL",
      message: "Safety hardening active: Owner approval required before live dispatch."
    };
  }

  // Fallback safety net block
  return {
    success: false,
    intercepted: true,
    layer: "safety-hardening-gateway",
    rejectionReason: "LIVE_SEND_NOT_ALLOWED",
    message: "Safety hardening active: Unknown fallback block reached."
  };
}

/**
 * Acts as a mock API integration gateway for `answerPreCheckoutQuery`.
 * It statically rejects any incoming query since live queries are not supported.
 */
export async function simulateAnswerPreCheckoutQueryBoundary(
  queryId: string
): Promise<MockApiGatewayResponse> {
  return {
    success: false,
    intercepted: true,
    layer: "safety-hardening-gateway",
    rejectionReason: "LIVE_SEND_NOT_ALLOWED",
    message: "Safety hardening active: Cannot answer live pre_checkout_query. System is in prototype mode."
  };
}
