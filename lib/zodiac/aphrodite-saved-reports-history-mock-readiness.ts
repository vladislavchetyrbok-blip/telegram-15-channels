/**
 * Package 187: Saved Reports / History Mock Readiness.
 *
 * Static mock/readiness model only. This file does not persist saved reports,
 * write databases, use production localStorage, call Telegram API, or unlock VIP.
 */

export type AphroditeSavedReportAccessLevel = "free-preview" | "future-paid" | "future-vip";

export type AphroditeSavedReportMockCard = {
  reportId: string;
  productId: string;
  type:
    | "love-reading-preview"
    | "full-love-report-future"
    | "compatibility-result"
    | "birth-matrix-result"
    | "vip-couple-calendar-future"
    | "daily-horoscope-snapshot"
    | "weekly-horoscope-snapshot"
    | "monthly-horoscope-snapshot";
  createdAt: string;
  updatedAt: string;
  periodKey?: string;
  sign?: string;
  title: string;
  previewSummary: string;
  accessLevel: AphroditeSavedReportAccessLevel;
  fallbackRoute: string;
  ownerReviewRequired: boolean;
  privacyNote: string;
  source: "mock-only";
};

export type AphroditeSavedReportHistoryRequirement = {
  id: string;
  label: string;
  requirement: string;
  blockedUntil: string[];
};

export type AphroditeSavedReportsHistorySafetyBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeSavedReportsHistoryMockReadinessModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  mockReports: AphroditeSavedReportMockCard[];
  futureRequirements: AphroditeSavedReportHistoryRequirement[];
  boundaries: AphroditeSavedReportsHistorySafetyBoundary[];
  realPersistenceNow: false;
  productionLocalStorageNow: false;
  databaseWriteNow: false;
  telegramApiNow: false;
  externalAnalyticsNow: false;
  paymentTrackingNow: false;
  vipUnlockNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_TITLE =
  "Mock истории сохранённых отчётов";

export const APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_CLASSIFICATION =
  "Только mock / История не сохраняется / Нет записи в базу данных";

export const APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_RULE =
  "Saved reports history readiness uses static mock cards only. It must not persist reports to database, create production localStorage state, call Telegram API, track payments, or unlock VIP.";

export const APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_SAFETY_LABELS = [
  "Нет реального сохранения отчётов",
  "Нет записи в базу данных",
  "Нет localStorage persistence для production",
  "Нет Telegram API",
  "Нет внешней аналитики",
  "Нет payment tracking",
  "Нет реальной оплаты",
  "Нет VIP-разблокировки",
  "Saved reports mock ничего не сохраняет",
] as const;

const mockReports: AphroditeSavedReportMockCard[] = [
  {
    reportId: "mock-love-preview-001",
    productId: "ai-love-reading",
    type: "love-reading-preview",
    createdAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-07-01T09:00:00.000Z",
    title: "AI Love Reading preview",
    previewSummary: "Бесплатный фрагмент будущего любовного разбора без полного текста отчёта.",
    accessLevel: "free-preview",
    fallbackRoute: "/miniapp/love-reading-preview",
    ownerReviewRequired: false,
    privacyNote: "Не хранить raw names, dates или full report text.",
    source: "mock-only",
  },
  {
    reportId: "mock-full-love-future-001",
    productId: "full-love-report",
    type: "full-love-report-future",
    createdAt: "2026-07-01T09:05:00.000Z",
    updatedAt: "2026-07-01T09:05:00.000Z",
    title: "Full Love Report future",
    previewSummary: "Будущий платный отчёт остаётся locked и требует owner review.",
    accessLevel: "future-paid",
    fallbackRoute: "/miniapp/love-reading-preview",
    ownerReviewRequired: true,
    privacyNote: "До оплаты и entitlement не сохранять полный отчёт.",
    source: "mock-only",
  },
  {
    reportId: "mock-compatibility-001",
    productId: "compatibility",
    type: "compatibility-result",
    createdAt: "2026-07-02T10:00:00.000Z",
    updatedAt: "2026-07-02T10:10:00.000Z",
    title: "Compatibility result",
    previewSummary: "Mock-карточка результата совместимости без персональных дат рождения.",
    accessLevel: "free-preview",
    fallbackRoute: "/compatibility",
    ownerReviewRequired: false,
    privacyNote: "Не хранить raw partner names и birth dates.",
    source: "mock-only",
  },
  {
    reportId: "mock-birth-matrix-001",
    productId: "birth-matrix",
    type: "birth-matrix-result",
    createdAt: "2026-07-03T11:00:00.000Z",
    updatedAt: "2026-07-03T11:00:00.000Z",
    title: "Birth Matrix result",
    previewSummary: "Mock-карточка матрицы судьбы без сохранения даты рождения.",
    accessLevel: "free-preview",
    fallbackRoute: "/birth-matrix",
    ownerReviewRequired: false,
    privacyNote: "Сохранять можно только будущий safe summary после privacy review.",
    source: "mock-only",
  },
  {
    reportId: "mock-couple-calendar-future-001",
    productId: "vip-couple-calendar",
    type: "vip-couple-calendar-future",
    createdAt: "2026-07-04T12:00:00.000Z",
    updatedAt: "2026-07-04T12:00:00.000Z",
    title: "VIP Couple Calendar future",
    previewSummary: "Будущий VIP календарь пары остаётся locked и не открывает доступ.",
    accessLevel: "future-vip",
    fallbackRoute: "/miniapp/love-reading-preview",
    ownerReviewRequired: true,
    privacyNote: "Не хранить персональный календарь пары до VIP/privacy review.",
    source: "mock-only",
  },
  {
    reportId: "mock-daily-snapshot-001",
    productId: "daily-horoscope",
    type: "daily-horoscope-snapshot",
    createdAt: "2026-07-05T08:00:00.000Z",
    updatedAt: "2026-07-05T08:00:00.000Z",
    periodKey: "2026-07-05",
    sign: "aries",
    title: "Daily horoscope snapshot",
    previewSummary: "Mock snapshot дневного прогноза для возврата к контенту.",
    accessLevel: "free-preview",
    fallbackRoute: "/miniapp",
    ownerReviewRequired: false,
    privacyNote: "Хранить только sign и periodKey, без user identity.",
    source: "mock-only",
  },
  {
    reportId: "mock-weekly-snapshot-001",
    productId: "weekly-horoscope",
    type: "weekly-horoscope-snapshot",
    createdAt: "2026-07-06T08:00:00.000Z",
    updatedAt: "2026-07-06T08:00:00.000Z",
    periodKey: "2026-W28",
    sign: "leo",
    title: "Weekly horoscope snapshot",
    previewSummary: "Mock snapshot недельного прогноза для планирования.",
    accessLevel: "free-preview",
    fallbackRoute: "/miniapp",
    ownerReviewRequired: false,
    privacyNote: "Хранить только future-safe period metadata.",
    source: "mock-only",
  },
  {
    reportId: "mock-monthly-snapshot-001",
    productId: "monthly-horoscope",
    type: "monthly-horoscope-snapshot",
    createdAt: "2026-07-20T08:00:00.000Z",
    updatedAt: "2026-07-20T08:00:00.000Z",
    periodKey: "2026-08",
    sign: "general",
    title: "Monthly horoscope snapshot",
    previewSummary: "Mock snapshot месячного прогноза для следующего месяца.",
    accessLevel: "free-preview",
    fallbackRoute: "/miniapp",
    ownerReviewRequired: false,
    privacyNote: "Monthly snapshot не должен описывать private user data.",
    source: "mock-only",
  },
];

const futureRequirements: AphroditeSavedReportHistoryRequirement[] = [
  { id: "safe-report-id", label: "reportId", requirement: "Stable safe identifier, not raw Telegram user id.", blockedUntil: ["storage design", "privacy review"] },
  { id: "product-id", label: "productId", requirement: "Must map to approved product catalog item.", blockedUntil: ["owner review"] },
  { id: "timestamps", label: "createdAt / updatedAt", requirement: "Future timestamps must be server-owned and auditable.", blockedUntil: ["DB schema package"] },
  { id: "period-key", label: "periodKey if horoscope", requirement: "Required for daily/weekly/monthly snapshots.", blockedUntil: ["content retention review"] },
  { id: "zodiac-sign", label: "sign if zodiac", requirement: "Optional safe sign metadata only.", blockedUntil: ["privacy review"] },
  { id: "title-summary", label: "title / previewSummary", requirement: "No full report text or private message text.", blockedUntil: ["content minimization"] },
  { id: "access-level", label: "accessLevel", requirement: "Paid/VIP saved reports stay locked until entitlement is real.", blockedUntil: ["payment safety gate"] },
  { id: "fallback-route", label: "fallbackRoute", requirement: "Every saved report needs safe free fallback.", blockedUntil: ["route QA"] },
  { id: "owner-review", label: "ownerReviewRequired", requirement: "Required for paid/VIP saved reports.", blockedUntil: ["owner review"] },
  { id: "privacy-note", label: "privacy note", requirement: "Every report type must document forbidden raw data.", blockedUntil: ["privacy review"] },
];

const boundaries: AphroditeSavedReportsHistorySafetyBoundary[] = [
  { id: "no-real-save", label: "Нет реального сохранения отчётов", currentState: "static mock cards only" },
  { id: "no-database-write", label: "Нет записи в базу данных", currentState: "no DB client or persistence" },
  { id: "no-production-localstorage", label: "Нет localStorage persistence для production", currentState: "no browser storage calls" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "no Bot API calls" },
  { id: "no-external-analytics", label: "Нет внешней аналитики", currentState: "no external tracking" },
  { id: "no-payment-tracking", label: "Нет payment tracking", currentState: "paid reports are future locked" },
  { id: "no-real-payment", label: "Нет реальной оплаты", currentState: "no invoice or Stars flow" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "VIP reports remain future only" },
];

export function getAphroditeSavedReportsHistoryMockReadiness(): AphroditeSavedReportsHistoryMockReadinessModel {
  return {
    title: APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_TITLE,
    classification: APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_CLASSIFICATION,
    safetyLabels: APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_SAFETY_LABELS,
    mockReports: mockReports.map((report) => ({ ...report })),
    futureRequirements: futureRequirements.map((requirement) => ({
      ...requirement,
      blockedUntil: requirement.blockedUntil.slice(),
    })),
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    realPersistenceNow: false,
    productionLocalStorageNow: false,
    databaseWriteNow: false,
    telegramApiNow: false,
    externalAnalyticsNow: false,
    paymentTrackingNow: false,
    vipUnlockNow: false,
    nextRecommendedPackage: "Package 188 — Return Journey CTA Readiness",
  };
}
