/**
 * Package 185: Analytics Privacy Safety Suite.
 *
 * Static QA model only. It summarizes privacy checks for Packages 180-184 and
 * must not send events, read/write databases, call Telegram API, or enable
 * production tracking.
 */

export type AphroditeAnalyticsPrivacySafetyResult = "PASS" | "BLOCKED";

export type AphroditeAnalyticsPrivacySafetyCheck = {
  id: string;
  label: string;
  packageScope: string;
  requirement: string;
  evidence: string;
  result: AphroditeAnalyticsPrivacySafetyResult;
  source: "qa-only";
};

export type AphroditeAnalyticsPrivacySafetyBoundary = {
  id: string;
  label: string;
  enforcedBy: string[];
};

export type AphroditeAnalyticsPrivacySafetySuiteModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  auditedPackages: string[];
  checks: AphroditeAnalyticsPrivacySafetyCheck[];
  boundaries: AphroditeAnalyticsPrivacySafetyBoundary[];
  sendsEventsNow: false;
  externalAnalyticsNow: false;
  databaseReadNow: false;
  databaseWriteNow: false;
  telegramApiNow: false;
  paymentTrackingNow: false;
  productionTrackingNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_TITLE =
  "Privacy Safety Suite для аналитики";

export const APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_CLASSIFICATION =
  "Только QA безопасности / Нет внешней аналитики / Нет записи данных";

export const APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_RULE =
  "Privacy safety suite verifies Packages 180-184 as static/readiness/noop analytics work only. It must not send analytics events, read or write database records, call Telegram API, track payments, or enable production tracking.";

export const APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_SAFETY_LABELS = [
  "Нет внешней аналитики",
  "Нет отправки событий",
  "Нет записи в базу данных",
  "Нет чтения базы данных",
  "Нет Telegram API",
  "Нет payment tracking",
  "Нет production tracking",
  "Privacy safety suite ничего не отправляет",
] as const;

const auditedPackages = [
  "Package 180 — Analytics/Funnel Tracking Readiness",
  "Package 181 — Mini App Analytics Noop Event Bus",
  "Package 182 — Mini App Analytics Noop Integration Points",
  "Package 183 — Analytics Funnel Mock Dashboard",
  "Package 184 — Telegram CTA Attribution Readiness",
];

const checks: AphroditeAnalyticsPrivacySafetyCheck[] = [
  {
    id: "no-raw-names",
    label: "Raw names analytics: запрещены",
    packageScope: "181, 182, 185",
    requirement: "No raw names or partner names may enter analytics payloads.",
    evidence: "Noop sanitizer drops name, rawName, partnerName, rawPartnerName, firstName, lastName and fullName.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-raw-birth-dates",
    label: "Raw birth dates analytics: запрещены",
    packageScope: "181, 182, 185",
    requirement: "No raw birth dates, partner birth dates, or birth date text may enter analytics payloads.",
    evidence: "Noop sanitizer drops birthDate, rawBirthDate, partnerBirthDate, rawPartnerBirthDate and birthDateText.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-payment-payloads",
    label: "Payment payload analytics: запрещены",
    packageScope: "180, 181, 183, 185",
    requirement: "No payment payload, invoice payload, successful payment payload, transaction id, or payment charge id may be tracked.",
    evidence: "Noop sanitizer drops paymentPayload, invoicePayload, successfulPaymentPayload and transactionId; mock dashboard payment intent is mock-only.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-private-telegram-messages",
    label: "Private Telegram messages analytics: запрещены",
    packageScope: "180, 181, 185",
    requirement: "No private Telegram message contents or raw Telegram initData may be tracked.",
    evidence: "Noop sanitizer drops privateMessageText, telegramPrivateMessageText, rawInitData and telegramInitDataRaw.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-full-report-text",
    label: "Full report text analytics: запрещён",
    packageScope: "180, 181, 182, 185",
    requirement: "No full report text, preview text, message text, or personalized report body may enter analytics payloads.",
    evidence: "Noop sanitizer drops fullReportText, reportText, previewText and messageText.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-external-analytics-api",
    label: "External analytics API: не подключена",
    packageScope: "180-185",
    requirement: "No PostHog, Amplitude, Google Analytics, Mixpanel, Segment, gtag, or analytics.track integration may be active.",
    evidence: "QA scans implementation files for external analytics calls.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-event-sending",
    label: "Events sending: не добавлен",
    packageScope: "181-185",
    requirement: "No navigator.sendBeacon, analytics fetch, sendEvent, trackEvent, or production event delivery may be active.",
    evidence: "Noop event result always returns sentNow: false and productionTrackingNow: false.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-db-read-write",
    label: "DB analytics read/write: не добавлены",
    packageScope: "180-185",
    requirement: "Analytics packages may not read or write database analytics records.",
    evidence: "QA scans implementation files for DB clients, select/insert/update/delete/upsert, and database environment usage.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "noop-bus-stays-noop",
    label: "Noop bus stays noop",
    packageScope: "181",
    requirement: "Event bus may accept and sanitize event objects but must never send or persist them.",
    evidence: "emitAphroditeMiniAppAnalyticsNoopEvent returns sentNow/databaseWriteNow/telegramApiCalledNow/paymentTrackingNow/productionTrackingNow as false.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "integration-points-use-only-noop",
    label: "Integration points use only noop",
    packageScope: "182",
    requirement: "Route integration points may call only the local noop event bus and must not change user behavior.",
    evidence: "Integration helper imports only the noop bus and contains no external send, DB, Telegram, or payment call.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "mock-dashboard-uses-mock-data",
    label: "Mock dashboard uses mock data",
    packageScope: "183",
    requirement: "Mock dashboard must use static sample numbers only and must not read real analytics data.",
    evidence: "All mock funnel, KPI, and content rows are marked source: mock-only.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "cta-attribution-readiness-only",
    label: "CTA attribution readiness-only",
    packageScope: "184",
    requirement: "CTA attribution work may define source keys and dimensions only; active CTA logic must remain unchanged.",
    evidence: "Model returns activeCtaLogicChanged: false and trackingEnabledNow: false.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-active-payment-tracking",
    label: "Active payment tracking: не добавлен",
    packageScope: "180-185",
    requirement: "No real payment tracking, invoice tracking, payment ledger write, or VIP unlock may be added.",
    evidence: "QA scans for active payment tracking functions and validates noop false flags.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-telegram-api",
    label: "Telegram API: не используется",
    packageScope: "180-185",
    requirement: "No Telegram Bot API call may be added by analytics packages.",
    evidence: "QA scans for api.telegram.org, sendMessage, sendPhoto, sendDocument, sendInvoice and pre-checkout calls in implementation files.",
    result: "PASS",
    source: "qa-only",
  },
  {
    id: "no-production-tracking",
    label: "Production tracking: не включён",
    packageScope: "180-185",
    requirement: "Analytics readiness packages may not enable production tracking.",
    evidence: "All package models are readiness-only, noop-only, or mock-only; emitted events stay local noop results.",
    result: "PASS",
    source: "qa-only",
  },
];

const boundaries: AphroditeAnalyticsPrivacySafetyBoundary[] = [
  {
    id: "payload-minimization",
    label: "Payload minimization",
    enforcedBy: ["forbidden payload keys", "allowlisted payload fields", "sanitizer QA"],
  },
  {
    id: "noop-delivery",
    label: "Noop delivery only",
    enforcedBy: ["sentNow false", "databaseWriteNow false", "productionTrackingNow false"],
  },
  {
    id: "readiness-only-surfaces",
    label: "Readiness/mock/dashboard only",
    enforcedBy: ["Package 180 taxonomy", "Package 183 mock dashboard", "Package 184 attribution readiness"],
  },
  {
    id: "no-production-side-effects",
    label: "No production side effects",
    enforcedBy: ["no Telegram API", "no DB read/write", "no payment tracking", "no active CTA changes"],
  },
];

export function getAphroditeAnalyticsPrivacySafetySuite(): AphroditeAnalyticsPrivacySafetySuiteModel {
  return {
    title: APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_TITLE,
    classification: APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_CLASSIFICATION,
    safetyLabels: APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_SAFETY_LABELS,
    auditedPackages: auditedPackages.slice(),
    checks: checks.map((check) => ({ ...check })),
    boundaries: boundaries.map((boundary) => ({ ...boundary, enforcedBy: boundary.enforcedBy.slice() })),
    sendsEventsNow: false,
    externalAnalyticsNow: false,
    databaseReadNow: false,
    databaseWriteNow: false,
    telegramApiNow: false,
    paymentTrackingNow: false,
    productionTrackingNow: false,
    nextRecommendedPackage: "Package 186 — Retention System Readiness",
  };
}
