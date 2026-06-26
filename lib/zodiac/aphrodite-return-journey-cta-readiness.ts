/**
 * Package 188: Return Journey CTA Readiness.
 *
 * Static readiness model only. This file maps future CTA return journeys without
 * changing active Telegram CTA generation, tracking clicks, calling Telegram API,
 * writing databases, or unlocking paid/VIP access.
 */

export type AphroditeReturnJourneyCtaPath = {
  id: string;
  source: string;
  targetRoute: string;
  productTarget: string;
  fallbackRoute: string;
  safeCopy: string;
  futureStartAppParam: string;
  attributionKey: string;
  mustRemainFree: boolean;
  activeNow: false;
  activeNowClassification: "readiness-only";
  ownerReviewRequired: boolean;
  sourceState: "mock-only" | "readiness-only";
};

export type AphroditeReturnJourneyCtaBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeReturnJourneyCtaReadinessModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  returnPaths: AphroditeReturnJourneyCtaPath[];
  boundaries: AphroditeReturnJourneyCtaBoundary[];
  activeCtaLogicChangedNow: false;
  trackingEnabledNow: false;
  telegramApiNow: false;
  messageSendingNow: false;
  databaseWriteNow: false;
  externalAnalyticsNow: false;
  paymentTrackingNow: false;
  vipUnlockNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_RETURN_JOURNEY_CTA_READINESS_TITLE = "Readiness возвратных CTA";

export const APHRODITE_RETURN_JOURNEY_CTA_READINESS_CLASSIFICATION =
  "Только CTA readiness / Active CTA не изменены / Нет tracking";

export const APHRODITE_RETURN_JOURNEY_CTA_READINESS_RULE =
  "Return Journey CTA readiness is a static map for future return paths. It must not change active CTA generation, send Telegram messages, track attribution, write database events, or unlock paid/VIP products.";

export const APHRODITE_RETURN_JOURNEY_CTA_READINESS_SAFETY_LABELS = [
  "Нет изменения active CTA",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет внешней аналитики",
  "Нет записи в базу данных",
  "Нет payment tracking",
  "Нет реальной оплаты",
  "Нет VIP-разблокировки",
  "Return CTA readiness ничего не отправляет",
] as const;

const returnPaths: AphroditeReturnJourneyCtaPath[] = [
  {
    id: "daily-horoscope-to-miniapp",
    source: "daily horoscope → Mini App",
    targetRoute: "/miniapp",
    productTarget: "daily-horoscope-return",
    fallbackRoute: "/miniapp",
    safeCopy: "Открыть Mini App и продолжить прогноз дня.",
    futureStartAppParam: "return_daily_horoscope",
    attributionKey: "return.daily_horoscope.miniapp",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: false,
    sourceState: "readiness-only",
  },
  {
    id: "weekly-horoscope-to-weekly-module",
    source: "weekly horoscope → weekly module / Mini App",
    targetRoute: "/miniapp",
    productTarget: "weekly-horoscope-return",
    fallbackRoute: "/miniapp",
    safeCopy: "Вернуться к прогнозу на новую неделю.",
    futureStartAppParam: "return_weekly_horoscope",
    attributionKey: "return.weekly_horoscope.weekly_module",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: false,
    sourceState: "readiness-only",
  },
  {
    id: "monthly-horoscope-to-monthly-module",
    source: "monthly horoscope → monthly module / Mini App",
    targetRoute: "/miniapp",
    productTarget: "monthly-horoscope-return",
    fallbackRoute: "/miniapp",
    safeCopy: "Открыть прогноз на месяц и сохранить ориентир.",
    futureStartAppParam: "return_monthly_horoscope",
    attributionKey: "return.monthly_horoscope.monthly_module",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: false,
    sourceState: "readiness-only",
  },
  {
    id: "telegram-channel-to-love-reading-preview",
    source: "Telegram channel → Love Reading preview",
    targetRoute: "/miniapp/love-reading-preview",
    productTarget: "ai-love-reading-preview",
    fallbackRoute: "/miniapp",
    safeCopy: "Посмотреть бесплатный фрагмент Love Reading.",
    futureStartAppParam: "return_love_preview",
    attributionKey: "return.telegram_channel.love_reading_preview",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: true,
    sourceState: "readiness-only",
  },
  {
    id: "telegram-channel-to-compatibility",
    source: "Telegram channel → Compatibility",
    targetRoute: "/compatibility",
    productTarget: "compatibility",
    fallbackRoute: "/miniapp",
    safeCopy: "Проверить совместимость без платного доступа.",
    futureStartAppParam: "return_compatibility",
    attributionKey: "return.telegram_channel.compatibility",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: true,
    sourceState: "readiness-only",
  },
  {
    id: "telegram-channel-to-birth-matrix",
    source: "Telegram channel → Birth Matrix",
    targetRoute: "/birth-matrix",
    productTarget: "birth-matrix",
    fallbackRoute: "/miniapp",
    safeCopy: "Открыть матрицу судьбы через безопасный бесплатный экран.",
    futureStartAppParam: "return_birth_matrix",
    attributionKey: "return.telegram_channel.birth_matrix",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: true,
    sourceState: "readiness-only",
  },
  {
    id: "miniapp-home-to-love-reading",
    source: "Mini App home → Love Reading",
    targetRoute: "/miniapp/love-reading-preview",
    productTarget: "ai-love-reading",
    fallbackRoute: "/miniapp",
    safeCopy: "Начать Love Reading с бесплатного preview.",
    futureStartAppParam: "home_love_reading",
    attributionKey: "return.miniapp_home.love_reading",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: false,
    sourceState: "mock-only",
  },
  {
    id: "miniapp-home-to-compatibility",
    source: "Mini App home → Compatibility",
    targetRoute: "/compatibility",
    productTarget: "compatibility",
    fallbackRoute: "/miniapp",
    safeCopy: "Открыть совместимость без оплаты.",
    futureStartAppParam: "home_compatibility",
    attributionKey: "return.miniapp_home.compatibility",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: false,
    sourceState: "mock-only",
  },
  {
    id: "locked-teaser-to-free-preview",
    source: "locked teaser → free preview fallback",
    targetRoute: "/miniapp/love-reading-preview",
    productTarget: "full-love-report-future",
    fallbackRoute: "/miniapp/love-reading-preview",
    safeCopy: "Показать бесплатный фрагмент вместо платного экрана.",
    futureStartAppParam: "fallback_locked_teaser",
    attributionKey: "return.locked_teaser.free_preview",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: true,
    sourceState: "readiness-only",
  },
  {
    id: "guard-denied-to-free-preview",
    source: "guard denied → free preview fallback",
    targetRoute: "/miniapp/love-reading-preview",
    productTarget: "vip-guard-denied",
    fallbackRoute: "/miniapp/love-reading-preview",
    safeCopy: "Если guard отказал, пользователь остаётся в бесплатном preview.",
    futureStartAppParam: "fallback_guard_denied",
    attributionKey: "return.guard_denied.free_preview",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: true,
    sourceState: "readiness-only",
  },
  {
    id: "saved-report-to-report-detail-future",
    source: "saved report future → report detail future",
    targetRoute: "/miniapp/love-reading-preview",
    productTarget: "saved-report-detail-future",
    fallbackRoute: "/miniapp/love-reading-preview",
    safeCopy: "Будущая карточка истории должна открывать безопасную preview-страницу до реального доступа.",
    futureStartAppParam: "saved_report_future",
    attributionKey: "return.saved_report.report_detail_future",
    mustRemainFree: true,
    activeNow: false,
    activeNowClassification: "readiness-only",
    ownerReviewRequired: true,
    sourceState: "mock-only",
  },
];

const boundaries: AphroditeReturnJourneyCtaBoundary[] = [
  { id: "no-active-cta-change", label: "Нет изменения active CTA", currentState: "static readiness map only" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "no Bot API, no sendMessage, no sendPhoto" },
  { id: "no-message-send", label: "Нет отправки сообщений", currentState: "no channel or bot delivery" },
  { id: "no-external-analytics", label: "Нет внешней аналитики", currentState: "no click tracking provider" },
  { id: "no-database-write", label: "Нет записи в базу данных", currentState: "no event persistence" },
  { id: "no-payment-tracking", label: "Нет payment tracking", currentState: "paid targets remain future locked" },
  { id: "no-real-payment", label: "Нет реальной оплаты", currentState: "no invoice, no Stars, no checkout" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "fallback stays free preview" },
  { id: "must-remain-free", label: "Все fallback остаются бесплатными", currentState: "mustRemainFree=true for every path" },
];

export function getAphroditeReturnJourneyCtaReadiness(): AphroditeReturnJourneyCtaReadinessModel {
  return {
    title: APHRODITE_RETURN_JOURNEY_CTA_READINESS_TITLE,
    classification: APHRODITE_RETURN_JOURNEY_CTA_READINESS_CLASSIFICATION,
    safetyLabels: APHRODITE_RETURN_JOURNEY_CTA_READINESS_SAFETY_LABELS,
    returnPaths: returnPaths.map((path) => ({ ...path })),
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    activeCtaLogicChangedNow: false,
    trackingEnabledNow: false,
    telegramApiNow: false,
    messageSendingNow: false,
    databaseWriteNow: false,
    externalAnalyticsNow: false,
    paymentTrackingNow: false,
    vipUnlockNow: false,
    nextRecommendedPackage: "Package 189 — Streak & Reminder Noop Skeleton",
  };
}
