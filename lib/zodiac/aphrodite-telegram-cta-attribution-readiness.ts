/**
 * Package 184: Telegram CTA Attribution Readiness.
 *
 * Readiness model only. This file does not generate active Telegram CTAs,
 * send analytics events, call Telegram API, or write attribution data.
 */

export type AphroditeTelegramCtaAttributionDimension = {
  id: string;
  label: string;
  valueExample: string;
  purpose: string;
  source: "readiness-only";
};

export type AphroditeTelegramCtaAttributionSourceExample = {
  sourceKey: string;
  channel: string;
  contentType: "daily" | "weekly" | "monthly" | "product";
  productTarget: string;
  startappParamDraft: string;
  fallbackRoute: string;
  source: "readiness-only";
};

export type AphroditeTelegramCtaAttributionSafetyBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeTelegramCtaAttributionReadinessModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  dimensions: AphroditeTelegramCtaAttributionDimension[];
  sourceExamples: AphroditeTelegramCtaAttributionSourceExample[];
  boundaries: AphroditeTelegramCtaAttributionSafetyBoundary[];
  activeCtaLogicChanged: false;
  trackingEnabledNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_TITLE =
  "Readiness Telegram CTA attribution";

export const APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_CLASSIFICATION =
  "Только attribution readiness / Активные CTA не изменены / Нет tracking";

export const APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_RULE =
  "CTA attribution readiness documents future source keys and dimensions only. It must not change active CTA generation, send events, call Telegram API, write data, or enable production tracking.";

export const APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_SAFETY_LABELS = [
  "Нет внешней аналитики",
  "Нет отправки событий",
  "Нет записи в базу данных",
  "Нет Telegram API",
  "Нет изменения active CTA",
  "Нет payment tracking",
  "Нет production tracking",
  "CTA attribution readiness ничего не отправляет",
] as const;

const dimensions: AphroditeTelegramCtaAttributionDimension[] = [
  {
    id: "source-channel",
    label: "source channel",
    valueExample: "aries_horoscope_daily",
    purpose: "Future channel grouping without reading live channel traffic.",
    source: "readiness-only",
  },
  {
    id: "sign",
    label: "sign",
    valueExample: "aries",
    purpose: "Future sign-level attribution for Zodiac channels.",
    source: "readiness-only",
  },
  {
    id: "language",
    label: "language",
    valueExample: "ru",
    purpose: "Future RU/UA split without collecting user content.",
    source: "readiness-only",
  },
  {
    id: "content-type",
    label: "content type daily/weekly/monthly",
    valueExample: "weekly",
    purpose: "Future content cadence grouping for daily, weekly, and monthly posts.",
    source: "readiness-only",
  },
  {
    id: "cta-type",
    label: "CTA type",
    valueExample: "miniapp_open",
    purpose: "Future CTA intent grouping without changing CTA copy.",
    source: "readiness-only",
  },
  {
    id: "product-target",
    label: "product target",
    valueExample: "love_reading",
    purpose: "Future destination grouping for Love Reading, compatibility, and Birth Matrix.",
    source: "readiness-only",
  },
  {
    id: "startapp-param-draft",
    label: "startapp param draft",
    valueExample: "src=tg_daily_aries&target=love_reading",
    purpose: "Draft-only future startapp shape; active startapp generation is unchanged.",
    source: "readiness-only",
  },
  {
    id: "campaign-key",
    label: "campaign key",
    valueExample: "tg_weekly_leo",
    purpose: "Future campaign grouping with stable ledger-friendly names.",
    source: "readiness-only",
  },
  {
    id: "period-key",
    label: "period key",
    valueExample: "2026-W27",
    purpose: "Future attribution period key based on target period, not generation date.",
    source: "readiness-only",
  },
  {
    id: "fallback-route",
    label: "fallback route",
    valueExample: "/miniapp",
    purpose: "Future fallback destination if a deep link cannot open the expected flow.",
    source: "readiness-only",
  },
];

const sourceExamples: AphroditeTelegramCtaAttributionSourceExample[] = [
  {
    sourceKey: "tg_daily_aries",
    channel: "aries_horoscope_daily",
    contentType: "daily",
    productTarget: "daily_to_miniapp",
    startappParamDraft: "src=tg_daily_aries&target=miniapp",
    fallbackRoute: "/miniapp",
    source: "readiness-only",
  },
  {
    sourceKey: "tg_weekly_leo",
    channel: "leo_horoscope_daily",
    contentType: "weekly",
    productTarget: "weekly_to_love_reading",
    startappParamDraft: "src=tg_weekly_leo&target=love_reading",
    fallbackRoute: "/miniapp/love-reading-preview",
    source: "readiness-only",
  },
  {
    sourceKey: "tg_monthly_2026_07_general",
    channel: "zodiac_general",
    contentType: "monthly",
    productTarget: "monthly_to_miniapp",
    startappParamDraft: "src=tg_monthly_2026_07_general&target=miniapp&period=2026-07",
    fallbackRoute: "/miniapp",
    source: "readiness-only",
  },
  {
    sourceKey: "tg_love_reading",
    channel: "zodiac_general",
    contentType: "product",
    productTarget: "love_reading",
    startappParamDraft: "src=tg_love_reading&target=love_reading",
    fallbackRoute: "/miniapp/love-reading-preview",
    source: "readiness-only",
  },
  {
    sourceKey: "tg_compatibility",
    channel: "zodiac_general",
    contentType: "product",
    productTarget: "compatibility",
    startappParamDraft: "src=tg_compatibility&target=compatibility",
    fallbackRoute: "/compatibility",
    source: "readiness-only",
  },
  {
    sourceKey: "tg_birth_matrix",
    channel: "zodiac_general",
    contentType: "product",
    productTarget: "birth_matrix",
    startappParamDraft: "src=tg_birth_matrix&target=birth_matrix",
    fallbackRoute: "/birth-matrix",
    source: "readiness-only",
  },
];

const boundaries: AphroditeTelegramCtaAttributionSafetyBoundary[] = [
  { id: "no-active-cta-change", label: "Нет изменения active CTA", currentState: "active CTA generation files remain untouched" },
  { id: "no-external-analytics", label: "Нет внешней аналитики", currentState: "no analytics SDK, no external API" },
  { id: "no-event-sending", label: "Нет отправки событий", currentState: "no sendBeacon, fetch, or track call" },
  { id: "no-database-write", label: "Нет записи в базу данных", currentState: "no insert/update/upsert/delete" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "no Bot API call and no startapp publishing change" },
  { id: "no-payment-tracking", label: "Нет payment tracking", currentState: "no invoice, payment intent, or VIP unlock tracking" },
  { id: "no-production-tracking", label: "Нет production tracking", currentState: "readiness-only model with static examples" },
];

export function getAphroditeTelegramCtaAttributionReadiness(): AphroditeTelegramCtaAttributionReadinessModel {
  return {
    title: APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_TITLE,
    classification: APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_CLASSIFICATION,
    safetyLabels: APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_SAFETY_LABELS,
    dimensions: dimensions.map((dimension) => ({ ...dimension })),
    sourceExamples: sourceExamples.map((example) => ({ ...example })),
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    activeCtaLogicChanged: false,
    trackingEnabledNow: false,
    nextRecommendedPackage: "Package 185 — Analytics Privacy Safety Suite",
  };
}
