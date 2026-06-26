/**
 * Package 180: Analytics/Funnel Tracking readiness.
 *
 * Readiness/design model only. It defines future event taxonomy, funnel stages,
 * KPI formulas, attribution and privacy boundaries without sending analytics
 * events, writing database records, calling external services, or enabling
 * production tracking.
 */

export type AphroditeAnalyticsFunnelStage =
  | "traffic-source"
  | "mini-app-open"
  | "product-entry"
  | "form-start"
  | "form-submit"
  | "free-preview-view"
  | "locked-teaser-view"
  | "paywall-view"
  | "future-payment-intent"
  | "guard-denied"
  | "fallback-view"
  | "return-user"
  | "content-retention";

export type AphroditeAnalyticsEventId =
  | "telegram_channel_cta_view"
  | "telegram_channel_cta_click"
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

export type AphroditeAnalyticsReadinessEvent = {
  id: AphroditeAnalyticsEventId;
  label: string;
  stage: AphroditeAnalyticsFunnelStage;
  surface: "telegram-channel" | "mini-app" | "dashboard" | "future-paywall" | "content";
  currentState: "taxonomy-only" | "noop-only" | "future-tracking" | "blocked-until-privacy-review";
  futurePayloadFields: string[];
  forbiddenPayloadFields: string[];
  privacyNotes: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeAnalyticsKpi = {
  id: string;
  label: string;
  description: string;
  futureFormula: string;
  requiredEvents: AphroditeAnalyticsEventId[];
  currentState: "readiness-only" | "not-tracked-yet";
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeAnalyticsPrivacyRule = {
  id: string;
  label: string;
  visibleRule: string;
  forbiddenData: string[];
  allowedFutureData: string[];
  blockedUntil: string[];
};

export type AphroditeAnalyticsReadinessBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeAnalyticsReadinessNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_ANALYTICS_FUNNEL_READINESS_TITLE = "Analytics/Funnel Tracking Readiness";

export const APHRODITE_ANALYTICS_FUNNEL_READINESS_CLASSIFICATION =
  "Только readiness / События не отправляются / Нет внешней аналитики";

export const APHRODITE_ANALYTICS_FUNNEL_READINESS_RULE =
  "Analytics readiness defines future event taxonomy and funnel measurement only. It must not send analytics events, write database records, call external services, or enable production tracking.";

export const APHRODITE_ANALYTICS_FUNNEL_SAFETY_LABELS = [
  "Нет внешней аналитики",
  "Нет отправки событий",
  "Нет записи в базу данных",
  "Нет Telegram API",
  "Нет payment tracking",
  "Нет реальной оплаты",
  "Нет VIP-разблокировки",
  "Нет production tracking",
  "Analytics readiness ничего не отправляет",
] as const;

const commonForbiddenPayloadFields = [
  "rawName",
  "rawPartnerName",
  "rawBirthDate",
  "rawPartnerBirthDate",
  "birthDateText",
  "reportText",
  "paymentPayload",
  "invoicePayload",
  "telegramPrivateMessageText",
  "telegramInitDataRaw",
  "phone",
  "email",
];

const events: AphroditeAnalyticsReadinessEvent[] = [
  {
    id: "telegram_channel_cta_view",
    label: "Telegram CTA view",
    stage: "traffic-source",
    surface: "telegram-channel",
    currentState: "taxonomy-only",
    futurePayloadFields: ["channelId", "postType", "ctaType", "campaignKey", "startappType", "dateKey"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["считать только агрегированный показ CTA", "не сохранять текст личных сообщений Telegram"],
    blockedUntil: ["privacy/owner review", "future event bus", "safe attribution rules"],
    riskLevel: "high",
  },
  {
    id: "telegram_channel_cta_click",
    label: "Telegram CTA click",
    stage: "traffic-source",
    surface: "telegram-channel",
    currentState: "taxonomy-only",
    futurePayloadFields: ["channelId", "postType", "ctaType", "campaignKey", "startappType", "anonymousSessionId"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["использовать только safe attribution source", "не хранить user name или raw Telegram payload"],
    blockedUntil: ["privacy/owner review", "future event bus", "active CTA review"],
    riskLevel: "high",
  },
  {
    id: "miniapp_opened",
    label: "Mini App opened",
    stage: "mini-app-open",
    surface: "mini-app",
    currentState: "noop-only",
    futurePayloadFields: ["anonymousSessionId", "startappType", "source", "isReturnVisit", "dateKey"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["session id должен быть anonymous/session-safe", "не сохранять raw initData"],
    blockedUntil: ["privacy review", "future event bus hardening"],
    riskLevel: "medium",
  },
  {
    id: "love_reading_opened",
    label: "AI Love Reading opened",
    stage: "product-entry",
    surface: "mini-app",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "productCode", "source", "startappType"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["не хранить имена из формы", "достаточно productCode и source"],
    blockedUntil: ["privacy review", "product analytics mapping"],
    riskLevel: "medium",
  },
  {
    id: "love_reading_form_started",
    label: "Love Reading form started",
    stage: "form-start",
    surface: "mini-app",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "productCode", "inputMode", "hasBirthDate", "hasPartnerBirthDate"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["разрешены только boolean flags", "сырые даты рождения запрещены"],
    blockedUntil: ["privacy review", "form field minimization"],
    riskLevel: "high",
  },
  {
    id: "love_reading_form_submitted",
    label: "Love Reading form submitted",
    stage: "form-submit",
    surface: "mini-app",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "productCode", "inputCompleteness", "hasBirthDate", "hasPartnerBirthDate"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["не сохранять raw names", "не сохранять raw birth dates", "не сохранять полный текст отчёта"],
    blockedUntil: ["privacy review", "owner-approved minimization"],
    riskLevel: "critical",
  },
  {
    id: "love_reading_preview_viewed",
    label: "Free preview viewed",
    stage: "free-preview-view",
    surface: "mini-app",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "productCode", "previewType", "source"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["считать просмотр preview без текста preview", "не сохранять personalized copy"],
    blockedUntil: ["privacy review", "preview taxonomy approval"],
    riskLevel: "medium",
  },
  {
    id: "full_love_report_teaser_viewed",
    label: "Full Love Report teaser viewed",
    stage: "locked-teaser-view",
    surface: "future-paywall",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "productCode", "teaserBlock", "source"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["не хранить content body", "считать только teaserBlock id"],
    blockedUntil: ["paywall privacy review", "owner review"],
    riskLevel: "high",
  },
  {
    id: "paywall_viewed",
    label: "Paywall viewed",
    stage: "paywall-view",
    surface: "future-paywall",
    currentState: "future-tracking",
    futurePayloadFields: ["anonymousSessionId", "productCode", "offerCode", "source"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["оплата не запускается", "payment payload analytics forbidden"],
    blockedUntil: ["paywall implementation package", "privacy review", "payment safety gate"],
    riskLevel: "critical",
  },
  {
    id: "future_payment_intent_clicked",
    label: "Future payment intent clicked",
    stage: "future-payment-intent",
    surface: "future-paywall",
    currentState: "future-tracking",
    futurePayloadFields: ["anonymousSessionId", "productCode", "offerCode", "intentType"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["это только будущий intent", "не сохранять invoice payload", "не считать платёж успешным"],
    blockedUntil: ["payment architecture approval", "privacy review", "owner review"],
    riskLevel: "critical",
  },
  {
    id: "vip_guard_denied",
    label: "VIP guard denied",
    stage: "guard-denied",
    surface: "mini-app",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "productCode", "guardReason", "fallbackRoute"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["не хранить raw entitlement record", "guardReason должен быть безопасным enum"],
    blockedUntil: ["VIP security review", "privacy review"],
    riskLevel: "high",
  },
  {
    id: "free_preview_fallback_shown",
    label: "Free preview fallback shown",
    stage: "fallback-view",
    surface: "mini-app",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "productCode", "fallbackRoute", "source"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["fallback должен помогать восстановить UX без открытия VIP", "никаких entitlement payloads"],
    blockedUntil: ["fallback taxonomy approval", "privacy review"],
    riskLevel: "medium",
  },
  {
    id: "birth_matrix_opened",
    label: "Birth Matrix opened",
    stage: "product-entry",
    surface: "mini-app",
    currentState: "noop-only",
    futurePayloadFields: ["anonymousSessionId", "productCode", "source", "hasBirthDate"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["разрешён только hasBirthDate flag", "raw birth date forbidden"],
    blockedUntil: ["privacy review", "birth-date minimization review"],
    riskLevel: "high",
  },
  {
    id: "compatibility_opened",
    label: "Compatibility opened",
    stage: "product-entry",
    surface: "mini-app",
    currentState: "noop-only",
    futurePayloadFields: ["anonymousSessionId", "mode", "source", "hasBirthDate", "hasPartnerBirthDate"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["не сохранять имена пары", "не сохранять даты рождения пары"],
    blockedUntil: ["privacy review", "compatibility minimization review"],
    riskLevel: "high",
  },
  {
    id: "couple_calendar_opened",
    label: "VIP Couple Calendar opened",
    stage: "product-entry",
    surface: "mini-app",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "productCode", "source", "guardState"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["не хранить personalized calendar text", "guardState только enum"],
    blockedUntil: ["VIP analytics review", "privacy review"],
    riskLevel: "high",
  },
  {
    id: "daily_horoscope_viewed",
    label: "Daily horoscope viewed",
    stage: "content-retention",
    surface: "content",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "sign", "contentPeriod", "channelId", "source"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["считать только contentPeriod и sign", "не хранить user identity"],
    blockedUntil: ["content analytics review", "privacy review"],
    riskLevel: "medium",
  },
  {
    id: "weekly_horoscope_viewed",
    label: "Weekly horoscope viewed",
    stage: "content-retention",
    surface: "content",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "sign", "weekKey", "weekStart", "weekEnd", "source"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["weekKey относится к target period", "не хранить raw user data"],
    blockedUntil: ["content analytics review", "privacy review"],
    riskLevel: "medium",
  },
  {
    id: "monthly_horoscope_viewed",
    label: "Monthly horoscope viewed",
    stage: "content-retention",
    surface: "content",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "sign", "monthKey", "source"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["monthKey относится к target month", "не хранить raw user data"],
    blockedUntil: ["content analytics review", "privacy review"],
    riskLevel: "medium",
  },
  {
    id: "return_visit",
    label: "Return visit",
    stage: "return-user",
    surface: "mini-app",
    currentState: "taxonomy-only",
    futurePayloadFields: ["anonymousSessionId", "daysSinceLastVisitBucket", "source", "startappType"],
    forbiddenPayloadFields: commonForbiddenPayloadFields,
    privacyNotes: ["использовать bucket, а не raw history", "не хранить Telegram private message contents"],
    blockedUntil: ["retention privacy review", "anonymous session policy"],
    riskLevel: "high",
  },
];

const kpis: AphroditeAnalyticsKpi[] = [
  {
    id: "mini-app-open-rate",
    label: "Mini App open rate",
    description: "Доля кликов по Telegram CTA, которые дошли до открытия Mini App.",
    futureFormula: "miniapp_opened / telegram_channel_cta_click",
    requiredEvents: ["telegram_channel_cta_click", "miniapp_opened"],
    currentState: "readiness-only",
    riskLevel: "medium",
  },
  {
    id: "love-reading-start-rate",
    label: "Love Reading start rate",
    description: "Доля пользователей, открывших Love Reading и начавших форму.",
    futureFormula: "love_reading_form_started / love_reading_opened",
    requiredEvents: ["love_reading_opened", "love_reading_form_started"],
    currentState: "readiness-only",
    riskLevel: "medium",
  },
  {
    id: "form-completion-rate",
    label: "Form completion rate",
    description: "Доля начатых форм Love Reading, которые были отправлены.",
    futureFormula: "love_reading_form_submitted / love_reading_form_started",
    requiredEvents: ["love_reading_form_started", "love_reading_form_submitted"],
    currentState: "readiness-only",
    riskLevel: "high",
  },
  {
    id: "preview-view-rate",
    label: "Preview view rate",
    description: "Доля отправленных форм, где пользователь увидел free preview.",
    futureFormula: "love_reading_preview_viewed / love_reading_form_submitted",
    requiredEvents: ["love_reading_form_submitted", "love_reading_preview_viewed"],
    currentState: "readiness-only",
    riskLevel: "medium",
  },
  {
    id: "paywall-view-rate",
    label: "Paywall view rate",
    description: "Доля free preview просмотров, после которых пользователь увидел paywall.",
    futureFormula: "paywall_viewed / love_reading_preview_viewed",
    requiredEvents: ["love_reading_preview_viewed", "paywall_viewed"],
    currentState: "readiness-only",
    riskLevel: "high",
  },
  {
    id: "future-payment-intent-rate",
    label: "Future payment intent rate",
    description: "Будущая доля paywall views, где пользователь нажал future payment intent.",
    futureFormula: "future_payment_intent_clicked / paywall_viewed",
    requiredEvents: ["paywall_viewed", "future_payment_intent_clicked"],
    currentState: "readiness-only",
    riskLevel: "critical",
  },
  {
    id: "guard-denial-rate",
    label: "Guard denial rate",
    description: "Доля попыток открыть VIP, которые были закрыты guard-слоем.",
    futureFormula: "vip_guard_denied / locked_or_vip_entry_events",
    requiredEvents: ["vip_guard_denied", "full_love_report_teaser_viewed"],
    currentState: "readiness-only",
    riskLevel: "high",
  },
  {
    id: "fallback-recovery-rate",
    label: "Fallback recovery rate",
    description: "Доля guard denied users, которым показан safe free preview fallback.",
    futureFormula: "free_preview_fallback_shown / vip_guard_denied",
    requiredEvents: ["vip_guard_denied", "free_preview_fallback_shown"],
    currentState: "readiness-only",
    riskLevel: "medium",
  },
  {
    id: "return-visit-rate",
    label: "Return visit rate",
    description: "Доля return visits среди Mini App opens.",
    futureFormula: "return_visit / miniapp_opened",
    requiredEvents: ["miniapp_opened", "return_visit"],
    currentState: "readiness-only",
    riskLevel: "high",
  },
  {
    id: "content-cta-performance",
    label: "Daily/weekly/monthly content CTA performance",
    description: "Сравнение daily, weekly и monthly content views с последующими CTA clicks и Mini App opens.",
    futureFormula: "(daily_horoscope_viewed + weekly_horoscope_viewed + monthly_horoscope_viewed) -> telegram_channel_cta_click -> miniapp_opened",
    requiredEvents: ["daily_horoscope_viewed", "weekly_horoscope_viewed", "monthly_horoscope_viewed", "telegram_channel_cta_click", "miniapp_opened"],
    currentState: "readiness-only",
    riskLevel: "medium",
  },
  {
    id: "channel-to-mini-app-conversion",
    label: "Channel-to-Mini-App conversion",
    description: "Переход из Telegram channel CTA в Mini App с safe attribution.",
    futureFormula: "miniapp_opened with source=telegram_channel / telegram_channel_cta_view",
    requiredEvents: ["telegram_channel_cta_view", "telegram_channel_cta_click", "miniapp_opened"],
    currentState: "readiness-only",
    riskLevel: "high",
  },
];

const privacyRules: AphroditeAnalyticsPrivacyRule[] = [
  {
    id: "no-raw-names",
    label: "Raw names forbidden",
    visibleRule: "Не собирать raw names в аналитике. Разрешены только boolean flags вроде hasName.",
    forbiddenData: ["raw name", "raw partner name", "display name", "full name"],
    allowedFutureData: ["hasName", "hasSecondName", "anonymousSessionId"],
    blockedUntil: ["privacy/owner review", "payload minimization"],
  },
  {
    id: "no-raw-birth-dates",
    label: "Raw birth dates forbidden",
    visibleRule: "Не собирать raw birth dates в аналитике. Разрешены только safe flags или coarse buckets после review.",
    forbiddenData: ["raw birth date", "partner birth date", "birth date text", "birth time with date"],
    allowedFutureData: ["hasBirthDate", "hasPartnerBirthDate", "dateBucket"],
    blockedUntil: ["privacy/owner review", "birth-date minimization approval"],
  },
  {
    id: "no-full-report-text",
    label: "Full report text forbidden",
    visibleRule: "Не собирать полный текст отчёта, preview, messages или personalized content в analytics payload.",
    forbiddenData: ["full report text", "preview text", "message text", "dream text", "custom intention text"],
    allowedFutureData: ["productCode", "previewType", "resultTier", "contentPeriod"],
    blockedUntil: ["privacy/owner review"],
  },
  {
    id: "no-payment-payloads",
    label: "Payment payload analytics forbidden",
    visibleRule: "Не собирать payment payloads, invoice payloads, Telegram Stars transaction details или successful_payment payloads в analytics.",
    forbiddenData: ["payment payload", "invoice payload", "successful_payment payload", "transaction id", "provider payment charge id"],
    allowedFutureData: ["productCode", "offerCode", "intentType"],
    blockedUntil: ["payment safety gate", "privacy/owner review"],
  },
  {
    id: "no-telegram-private-message-contents",
    label: "Private Telegram message contents forbidden",
    visibleRule: "Не собирать Telegram private message contents или raw Telegram initData в analytics.",
    forbiddenData: ["private message text", "raw initData", "raw initDataUnsafe", "Telegram profile fields"],
    allowedFutureData: ["startappType", "source", "anonymousSessionId"],
    blockedUntil: ["Telegram privacy review", "owner review"],
  },
  {
    id: "anonymous-identifiers-only",
    label: "Anonymous/session-safe identifiers only",
    visibleRule: "Будущая реализация должна использовать только anonymous/session/user-safe identifiers.",
    forbiddenData: ["plain telegram user id in client analytics", "phone", "email", "raw username"],
    allowedFutureData: ["anonymousSessionId", "safeUserKey", "source", "campaignKey"],
    blockedUntil: ["identifier policy approved", "privacy/owner review"],
  },
];

const boundaries: AphroditeAnalyticsReadinessBoundary[] = [
  {
    area: "external-analytics",
    visibleLabel: "Нет внешней аналитики",
    dataBoundary: "no-external-analytics",
    allowedNow: ["event taxonomy", "KPI definitions", "privacy boundary docs"],
    blockedUntil: ["future analytics implementation package", "privacy/owner review"],
    riskLevel: "critical",
  },
  {
    area: "event-delivery",
    visibleLabel: "Нет отправки событий",
    dataBoundary: "no-event-sending",
    allowedNow: ["readiness model", "dashboard visualization"],
    blockedUntil: ["Package 181 or later", "explicit owner approval"],
    riskLevel: "critical",
  },
  {
    area: "database",
    visibleLabel: "Нет записи в базу данных",
    dataBoundary: "no-database-write",
    allowedNow: ["static TypeScript model", "docs"],
    blockedUntil: ["DATABASE_URL review", "schema package", "fresh backup"],
    riskLevel: "critical",
  },
  {
    area: "telegram-api",
    visibleLabel: "Нет Telegram API",
    dataBoundary: "no-telegram-api",
    allowedNow: ["attribution requirements only"],
    blockedUntil: ["TELEGRAM_BOT_TOKEN review", "Telegram API package"],
    riskLevel: "critical",
  },
  {
    area: "payment-tracking",
    visibleLabel: "Нет payment tracking",
    dataBoundary: "no-payment-tracking",
    allowedNow: ["future payment intent taxonomy"],
    blockedUntil: ["payment safety gate", "privacy/owner review"],
    riskLevel: "critical",
  },
  {
    area: "payment",
    visibleLabel: "Нет реальной оплаты",
    dataBoundary: "no-real-payment",
    allowedNow: ["paywall funnel design"],
    blockedUntil: ["future payment package", "owner approval"],
    riskLevel: "critical",
  },
  {
    area: "vip",
    visibleLabel: "Нет VIP-разблокировки",
    dataBoundary: "no-vip-unlock",
    allowedNow: ["guard denied and fallback taxonomy"],
    blockedUntil: ["verified entitlement and VIP guard package"],
    riskLevel: "critical",
  },
  {
    area: "production-tracking",
    visibleLabel: "Нет production tracking",
    dataBoundary: "no-production-tracking",
    allowedNow: ["readiness report"],
    blockedUntil: ["privacy review", "owner approval", "future event bus"],
    riskLevel: "critical",
  },
  {
    area: "readiness-only",
    visibleLabel: "Analytics readiness ничего не отправляет",
    dataBoundary: "analytics-readiness-sends-nothing",
    allowedNow: ["dashboard review", "QA assertions", "documentation"],
    blockedUntil: ["Package 181 or later"],
    riskLevel: "critical",
  },
];

const nextSteps: AphroditeAnalyticsReadinessNextStep[] = [
  {
    package: "Package 181",
    title: "Mini App Analytics Noop Event Bus Skeleton",
    purpose:
      "Добавить безопасный noop event bus skeleton для будущих Mini App events без внешней аналитики, DB write, payment tracking или production tracking.",
    blockedUntil: [
      "Package 180 committed",
      "privacy boundaries remain explicit",
      "no external analytics",
      "no database write",
      "no payment tracking",
    ],
  },
];

export function getAphroditeAnalyticsFunnelEvents(): AphroditeAnalyticsReadinessEvent[] {
  return events.map((event) => ({
    ...event,
    futurePayloadFields: event.futurePayloadFields.slice(),
    forbiddenPayloadFields: event.forbiddenPayloadFields.slice(),
    privacyNotes: event.privacyNotes.slice(),
    blockedUntil: event.blockedUntil.slice(),
  }));
}

export function getAphroditeAnalyticsFunnelKpis(): AphroditeAnalyticsKpi[] {
  return kpis.map((kpi) => ({
    ...kpi,
    requiredEvents: kpi.requiredEvents.slice(),
  }));
}

export function getAphroditeAnalyticsPrivacyRules(): AphroditeAnalyticsPrivacyRule[] {
  return privacyRules.map((rule) => ({
    ...rule,
    forbiddenData: rule.forbiddenData.slice(),
    allowedFutureData: rule.allowedFutureData.slice(),
    blockedUntil: rule.blockedUntil.slice(),
  }));
}

export function getAphroditeAnalyticsReadinessBoundaries(): AphroditeAnalyticsReadinessBoundary[] {
  return boundaries.map((boundary) => ({
    ...boundary,
    allowedNow: boundary.allowedNow.slice(),
    blockedUntil: boundary.blockedUntil.slice(),
  }));
}

export function getAphroditeAnalyticsReadinessNextSteps(): AphroditeAnalyticsReadinessNextStep[] {
  return nextSteps.map((step) => ({
    ...step,
    blockedUntil: step.blockedUntil.slice(),
  }));
}
