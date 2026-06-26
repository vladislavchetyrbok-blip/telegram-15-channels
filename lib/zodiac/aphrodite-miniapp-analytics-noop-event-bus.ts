/**
 * Package 181: Mini App Analytics Noop Event Bus Skeleton.
 *
 * This model accepts future Mini App analytics events, validates/sanitizes
 * payloads, and returns a noop result only. It must not send analytics events,
 * write database records, call Telegram API, call external analytics services,
 * or enable production tracking.
 */

export type AphroditeMiniAppAnalyticsNoopEventId =
  | "miniapp_opened"
  | "love_reading_opened"
  | "love_reading_form_started"
  | "love_reading_form_submitted"
  | "love_reading_preview_viewed"
  | "full_love_report_teaser_viewed"
  | "paywall_viewed"
  | "future_payment_intent_clicked"
  | "vip_guard_denied"
  | "free_preview_fallback_shown"
  | "birth_matrix_opened"
  | "compatibility_opened"
  | "couple_calendar_opened"
  | "daily_horoscope_viewed"
  | "weekly_horoscope_viewed"
  | "monthly_horoscope_viewed"
  | "return_visit";

export type AphroditeMiniAppAnalyticsSafePayloadValue = string | number | boolean | null;

export type AphroditeMiniAppAnalyticsSafePayload = Record<string, AphroditeMiniAppAnalyticsSafePayloadValue>;

export type AphroditeMiniAppAnalyticsNoopEventInput = {
  eventId: AphroditeMiniAppAnalyticsNoopEventId | string;
  payload?: Record<string, unknown>;
  source?: string;
  surface?: string;
};

export type AphroditeMiniAppAnalyticsNoopEventResult = {
  eventId: string;
  accepted: boolean;
  sanitizedPayload: AphroditeMiniAppAnalyticsSafePayload;
  warnings: string[];
  sentNow: false;
  externalAnalyticsCalledNow: false;
  databaseWriteNow: false;
  telegramApiCalledNow: false;
  paymentTrackingNow: false;
  productionTrackingNow: false;
};

export type AphroditeMiniAppAnalyticsNoopEventDefinition = {
  id: AphroditeMiniAppAnalyticsNoopEventId;
  label: string;
  stage: string;
  surface: string;
  allowedPayloadFields: string[];
  forbiddenPayloadFields: string[];
  noopOnly: true;
};

export type AphroditeMiniAppAnalyticsNoopBoundary = {
  id: string;
  visibleLabel: string;
  enforcedNow: true;
  allowedNow: string[];
  forbiddenNow: string[];
};

export type AphroditeMiniAppAnalyticsNoopNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_TITLE =
  "Noop Event Bus для Mini App аналитики";

export const APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_CLASSIFICATION =
  "Только noop / События не отправляются / Нет внешней аналитики";

export const APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_RULE =
  "Analytics noop event bus accepts future event objects, sanitizes/validates them, and returns noop result only. It must not call external analytics APIs, Telegram API, or database.";

export const APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_SAFETY_LABELS = [
  "Нет внешней аналитики",
  "Нет отправки событий",
  "Нет записи в базу данных",
  "Нет Telegram API",
  "Нет payment tracking",
  "Нет реальной оплаты",
  "Нет VIP-разблокировки",
  "Нет production tracking",
  "Noop event bus ничего не отправляет",
] as const;

const noopEventIds: AphroditeMiniAppAnalyticsNoopEventId[] = [
  "miniapp_opened",
  "love_reading_opened",
  "love_reading_form_started",
  "love_reading_form_submitted",
  "love_reading_preview_viewed",
  "full_love_report_teaser_viewed",
  "paywall_viewed",
  "future_payment_intent_clicked",
  "vip_guard_denied",
  "free_preview_fallback_shown",
  "birth_matrix_opened",
  "compatibility_opened",
  "couple_calendar_opened",
  "daily_horoscope_viewed",
  "weekly_horoscope_viewed",
  "monthly_horoscope_viewed",
  "return_visit",
];

const allowedPayloadKeys = [
  "anonymousSessionId",
  "campaignKey",
  "contentPeriod",
  "contentType",
  "dateKey",
  "daysSinceLastVisitBucket",
  "fallbackRoute",
  "guardReason",
  "guardState",
  "hasBirthDate",
  "hasPartnerBirthDate",
  "inputCompleteness",
  "inputMode",
  "isReturnVisit",
  "monthKey",
  "offerCode",
  "periodKey",
  "previewType",
  "productCode",
  "productId",
  "relationshipMode",
  "resultTier",
  "route",
  "sign",
  "signPairCategory",
  "source",
  "startappType",
  "surface",
  "teaserBlock",
  "timestampBucket",
  "weekEnd",
  "weekKey",
  "weekStart",
] as const;

const forbiddenPayloadKeys = [
  "birthDate",
  "birthDateText",
  "displayName",
  "email",
  "firstName",
  "fullName",
  "fullReportText",
  "invoicePayload",
  "lastName",
  "messageText",
  "name",
  "partnerBirthDate",
  "partnerName",
  "paymentPayload",
  "phone",
  "previewText",
  "privateMessageText",
  "rawBirthDate",
  "rawInitData",
  "rawName",
  "rawPartnerBirthDate",
  "rawPartnerName",
  "reportText",
  "successfulPaymentPayload",
  "telegramInitDataRaw",
  "telegramPrivateMessageText",
  "transactionId",
] as const;

const allowedPayloadKeySet = new Set<string>(allowedPayloadKeys);
const forbiddenPayloadKeySet = new Set<string>(forbiddenPayloadKeys.map((key) => key.toLowerCase()));
const noopEventIdSet = new Set<string>(noopEventIds);

const eventMetadata: Record<AphroditeMiniAppAnalyticsNoopEventId, { label: string; stage: string; surface: string }> = {
  miniapp_opened: { label: "Mini App opened", stage: "mini-app-open", surface: "mini-app" },
  love_reading_opened: { label: "AI Love Reading opened", stage: "product-entry", surface: "mini-app" },
  love_reading_form_started: { label: "Love Reading form started", stage: "form-start", surface: "mini-app" },
  love_reading_form_submitted: { label: "Love Reading form submitted", stage: "form-submit", surface: "mini-app" },
  love_reading_preview_viewed: { label: "Free preview viewed", stage: "free-preview-view", surface: "mini-app" },
  full_love_report_teaser_viewed: { label: "Full Love Report teaser viewed", stage: "locked-teaser-view", surface: "future-paywall" },
  paywall_viewed: { label: "Paywall viewed", stage: "paywall-view", surface: "future-paywall" },
  future_payment_intent_clicked: { label: "Future payment intent clicked", stage: "future-payment-intent", surface: "future-paywall" },
  vip_guard_denied: { label: "VIP guard denied", stage: "guard-denied", surface: "mini-app" },
  free_preview_fallback_shown: { label: "Free preview fallback shown", stage: "fallback-view", surface: "mini-app" },
  birth_matrix_opened: { label: "Birth Matrix opened", stage: "product-entry", surface: "mini-app" },
  compatibility_opened: { label: "Compatibility opened", stage: "product-entry", surface: "mini-app" },
  couple_calendar_opened: { label: "VIP Couple Calendar opened", stage: "product-entry", surface: "mini-app" },
  daily_horoscope_viewed: { label: "Daily horoscope viewed", stage: "content-retention", surface: "content" },
  weekly_horoscope_viewed: { label: "Weekly horoscope viewed", stage: "content-retention", surface: "content" },
  monthly_horoscope_viewed: { label: "Monthly horoscope viewed", stage: "content-retention", surface: "content" },
  return_visit: { label: "Return visit", stage: "return-user", surface: "mini-app" },
};

function isSafeScalar(value: unknown): value is AphroditeMiniAppAnalyticsSafePayloadValue {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function normalizeSafeScalar(value: AphroditeMiniAppAnalyticsSafePayloadValue): AphroditeMiniAppAnalyticsSafePayloadValue {
  if (typeof value !== "string") return value;
  return value.slice(0, 96);
}

function isForbiddenPayloadKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  if (forbiddenPayloadKeySet.has(normalized)) return true;
  if (normalized.includes("paymentpayload") || normalized.includes("invoicepayload")) return true;
  if (normalized.includes("successfulpayment")) return true;
  if (normalized.includes("privatemessage")) return true;
  if (normalized.includes("reporttext") || normalized.includes("previewtext")) return true;
  if (normalized.includes("raw") && (normalized.includes("name") || normalized.includes("birth") || normalized.includes("telegram"))) return true;
  return false;
}

export function sanitizeAphroditeMiniAppAnalyticsPayload(input: Record<string, unknown>): AphroditeMiniAppAnalyticsSafePayload {
  const safePayload: AphroditeMiniAppAnalyticsSafePayload = {};

  for (const [key, value] of Object.entries(input)) {
    if (isForbiddenPayloadKey(key)) continue;
    if (!allowedPayloadKeySet.has(key)) continue;
    if (!isSafeScalar(value)) continue;
    safePayload[key] = normalizeSafeScalar(value);
  }

  return safePayload;
}

export function emitAphroditeMiniAppAnalyticsNoopEvent(
  input: AphroditeMiniAppAnalyticsNoopEventInput,
): AphroditeMiniAppAnalyticsNoopEventResult {
  const accepted = noopEventIdSet.has(input.eventId);
  const sanitizedPayload = sanitizeAphroditeMiniAppAnalyticsPayload({
    ...(input.payload ?? {}),
    source: input.source ?? input.payload?.source,
    surface: input.surface ?? input.payload?.surface,
  });

  return {
    eventId: input.eventId,
    accepted,
    sanitizedPayload,
    warnings: accepted ? ["noop-only: событие принято локально и никуда не отправлено"] : ["unknown-event: событие отклонено noop-шиной"],
    sentNow: false,
    externalAnalyticsCalledNow: false,
    databaseWriteNow: false,
    telegramApiCalledNow: false,
    paymentTrackingNow: false,
    productionTrackingNow: false,
  };
}

export function getAphroditeMiniAppAnalyticsNoopEvents(): AphroditeMiniAppAnalyticsNoopEventDefinition[] {
  return noopEventIds.map((id) => {
    const event = eventMetadata[id];
    return {
      id,
      label: event.label,
      stage: event.stage,
      surface: event.surface,
      allowedPayloadFields: allowedPayloadKeys.slice(),
      forbiddenPayloadFields: forbiddenPayloadKeys.slice(),
      noopOnly: true,
    };
  });
}

export function getAphroditeMiniAppAnalyticsNoopBoundaries(): AphroditeMiniAppAnalyticsNoopBoundary[] {
  return [
    {
      id: "no-external-analytics",
      visibleLabel: "Нет внешней аналитики",
      enforcedNow: true,
      allowedNow: ["локальная валидация события", "локальная sanitization payload", "noop result"],
      forbiddenNow: ["PostHog", "Amplitude", "Google Analytics", "gtag", "analytics.track"],
    },
    {
      id: "no-event-sending",
      visibleLabel: "Нет отправки событий",
      enforcedNow: true,
      allowedNow: ["возврат sentNow: false", "локальные warnings"],
      forbiddenNow: ["navigator.sendBeacon", "fetch analytics endpoint", "trackEvent", "sendEvent"],
    },
    {
      id: "no-database-write",
      visibleLabel: "Нет записи в базу данных",
      enforcedNow: true,
      allowedNow: ["статический TypeScript модуль"],
      forbiddenNow: ["insert event", "upsert event", "DATABASE_URL", "analytics ledger write"],
    },
    {
      id: "no-telegram-api",
      visibleLabel: "Нет Telegram API",
      enforcedNow: true,
      allowedNow: ["source/startapp taxonomy as sanitized text"],
      forbiddenNow: ["api.telegram.org", "sendMessage", "sendInvoice"],
    },
    {
      id: "no-payment-tracking",
      visibleLabel: "Нет payment tracking",
      enforcedNow: true,
      allowedNow: ["future_payment_intent_clicked как noop event id"],
      forbiddenNow: ["payment payload", "invoice payload", "successful_payment payload", "payment ledger write"],
    },
    {
      id: "noop-sends-nothing",
      visibleLabel: "Noop event bus ничего не отправляет",
      enforcedNow: true,
      allowedNow: ["accepted: true/false", "sentNow: false", "productionTrackingNow: false"],
      forbiddenNow: ["production tracking", "external event delivery", "real VIP unlock"],
    },
  ];
}

export function getAphroditeMiniAppAnalyticsNoopNextSteps(): AphroditeMiniAppAnalyticsNoopNextStep[] {
  return [
    {
      package: "Package 182",
      title: "Mini App Analytics Noop Integration Points",
      purpose:
        "Добавить безопасные вызовы только в noop event bus из Mini App journeys без внешней аналитики, DB write, Telegram API или изменения поведения пользователя.",
      blockedUntil: ["Package 181 committed", "event bus remains noop", "payload sanitization remains strict"],
    },
  ];
}
