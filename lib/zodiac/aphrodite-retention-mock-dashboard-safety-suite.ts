/**
 * Package 190: Retention Mock Dashboard & Safety QA Suite.
 *
 * Consolidated mock/static retention dashboard model. It summarizes Packages
 * 186-189 plus analytics privacy safety without running reminders, tracking,
 * reading/writing databases, calling Telegram API, or changing payment/VIP flows.
 */

export type AphroditeRetentionMockDashboardFunnelStep = {
  id: string;
  label: string;
  description: string;
  source: "mock-only";
};

export type AphroditeRetentionMockDashboardLoop = {
  id: string;
  label: string;
  cadence: "daily" | "weekly" | "monthly" | "future";
  connectedPackage: string;
  safetyState: string;
  source: "mock-only";
};

export type AphroditeRetentionMockDashboardBlocker = {
  id: string;
  label: string;
  reason: string;
};

export type AphroditeRetentionMockDashboardBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeRetentionMockDashboardDependency = {
  packageId: string;
  title: string;
  route: string;
  status: "ready";
};

export type AphroditeRetentionMockDashboardSafetySuite = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  dependencies: AphroditeRetentionMockDashboardDependency[];
  mockRetentionFunnel: AphroditeRetentionMockDashboardFunnelStep[];
  returnLoops: AphroditeRetentionMockDashboardLoop[];
  retentionBlockers: AphroditeRetentionMockDashboardBlocker[];
  privacySafetyBoundaries: AphroditeRetentionMockDashboardBoundary[];
  dependencySnapshot: {
    retentionSurfaces: number;
    savedReportMocks: number;
    returnCtaPaths: number;
    futureReminderTypes: number;
    privacyChecks: number;
    streakNoopFlagsFalse: boolean;
    reminderNoopFlagsFalse: boolean;
  };
  mockDataOnlyNow: true;
  realRemindersNow: false;
  telegramApiNow: false;
  messageSendingNow: false;
  databaseReadNow: false;
  databaseWriteNow: false;
  externalAnalyticsNow: false;
  productionTrackingNow: false;
  paymentTrackingNow: false;
  vipUnlockNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_TITLE =
  "Retention Mock Dashboard & Safety Suite";

export const APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_CLASSIFICATION =
  "Только mock/QA / Нет реальных напоминаний / Нет записи данных";

export const APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_RULE =
  "Retention Mock Dashboard & Safety Suite consolidates retention readiness, saved report mock, return CTA readiness, streak/reminder noop and analytics privacy checks using mock/static data only.";

export const APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_SAFETY_LABELS = [
  "Нет реальных напоминаний",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет записи в базу данных",
  "Нет внешней аналитики",
  "Нет production tracking",
  "Нет payment tracking",
  "Нет реальной оплаты",
  "Нет VIP-разблокировки",
  "Retention mock dashboard ничего не отправляет",
] as const;

const mockRetentionFunnel: AphroditeRetentionMockDashboardFunnelStep[] = [
  {
    id: "channel-content-view",
    label: "Telegram content view",
    description: "Mock step: пользователь видит daily/weekly/monthly контент без tracking.",
    source: "mock-only",
  },
  {
    id: "return-cta-click-future",
    label: "Return CTA click future",
    description: "Mock step: будущий click остаётся readiness-only и не отправляется во внешнюю аналитику.",
    source: "mock-only",
  },
  {
    id: "miniapp-return-open",
    label: "Mini App return open",
    description: "Mock step: пользователь возвращается в безопасный free route.",
    source: "mock-only",
  },
  {
    id: "saved-report-revisit-future",
    label: "Saved report revisit future",
    description: "Mock step: будущая история отчётов открывает fallback preview без paid/VIP unlock.",
    source: "mock-only",
  },
  {
    id: "reminder-noop-evaluated",
    label: "Reminder noop evaluated",
    description: "Mock step: noop skeleton возвращает false для schedule/send/persistence flags.",
    source: "mock-only",
  },
];

const returnLoops: AphroditeRetentionMockDashboardLoop[] = [
  {
    id: "daily-return-loop",
    label: "daily return loop",
    cadence: "daily",
    connectedPackage: "Package 186 / Package 189",
    safetyState: "daily habit описан, reminder не создаётся",
    source: "mock-only",
  },
  {
    id: "weekly-return-loop",
    label: "weekly return loop",
    cadence: "weekly",
    connectedPackage: "Package 186 / Package 188",
    safetyState: "weekly CTA готовится как readiness, active CTA не меняется",
    source: "mock-only",
  },
  {
    id: "monthly-return-loop",
    label: "monthly return loop",
    cadence: "monthly",
    connectedPackage: "Package 186 / Package 188",
    safetyState: "monthly loop описан mock-only, tracking не включён",
    source: "mock-only",
  },
  {
    id: "saved-report-future-loop",
    label: "saved report future loop",
    cadence: "future",
    connectedPackage: "Package 187",
    safetyState: "history cards are mock-only, DB persistence отсутствует",
    source: "mock-only",
  },
  {
    id: "streak-reminder-future-loop",
    label: "streak/reminder future loop",
    cadence: "future",
    connectedPackage: "Package 189",
    safetyState: "noop functions return no schedule and no message send",
    source: "mock-only",
  },
  {
    id: "cta-return-path-loop",
    label: "CTA return paths",
    cadence: "future",
    connectedPackage: "Package 188",
    safetyState: "fallback routes remain free and owner-reviewed",
    source: "mock-only",
  },
];

const retentionBlockers: AphroditeRetentionMockDashboardBlocker[] = [
  { id: "no-user-opt-in", label: "Нет user opt-in", reason: "Без ручного согласия reminders нельзя включать." },
  { id: "no-storage-design", label: "Нет storage design", reason: "Saved reports и streak требуют отдельной схемы и privacy review." },
  { id: "no-owner-review", label: "Нет owner review", reason: "Paid/VIP return paths остаются locked до подтверждения владельцем." },
  { id: "no-telegram-delivery-review", label: "Нет Telegram delivery review", reason: "Любая отправка сообщений требует отдельного безопасного пакета." },
  { id: "no-analytics-review", label: "Нет analytics review", reason: "Retention tracking запрещён без privacy payload suite." },
];

const privacySafetyBoundaries: AphroditeRetentionMockDashboardBoundary[] = [
  { id: "no-real-reminders", label: "Нет реальных напоминаний", currentState: "noop-only" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "no Bot API calls" },
  { id: "no-message-send", label: "Нет отправки сообщений", currentState: "no outbound delivery" },
  { id: "no-database-write", label: "Нет записи в базу данных", currentState: "no retention event persistence" },
  { id: "no-database-read", label: "Нет чтения базы данных", currentState: "no user lookup or saved report lookup" },
  { id: "no-external-analytics", label: "Нет внешней аналитики", currentState: "no external tracking provider" },
  { id: "no-production-tracking", label: "Нет production tracking", currentState: "no live telemetry" },
  { id: "no-payment-tracking", label: "Нет payment tracking", currentState: "no payment event" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "no access grant" },
];

export function getAphroditeRetentionMockDashboardSafetySuite(): AphroditeRetentionMockDashboardSafetySuite {
  return {
    title: APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_TITLE,
    classification: APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_CLASSIFICATION,
    safetyLabels: APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_SAFETY_LABELS,
    dependencies: [
      {
        packageId: "Package 185",
        title: "Privacy Safety Suite для аналитики",
        route: "/dashboard/networks/zodiac/analytics-privacy-safety-suite",
        status: "ready",
      },
      {
        packageId: "Package 186",
        title: "Retention System Readiness",
        route: "/dashboard/networks/zodiac/retention-system-readiness",
        status: "ready",
      },
      {
        packageId: "Package 187",
        title: "Mock истории сохранённых отчётов",
        route: "/dashboard/networks/zodiac/saved-reports-history-mock-readiness",
        status: "ready",
      },
      {
        packageId: "Package 188",
        title: "Readiness возвратных CTA",
        route: "/dashboard/networks/zodiac/return-journey-cta-readiness",
        status: "ready",
      },
      {
        packageId: "Package 189",
        title: "Noop skeleton streak/reminder",
        route: "/dashboard/networks/zodiac/streak-reminder-noop-skeleton",
        status: "ready",
      },
    ],
    mockRetentionFunnel: mockRetentionFunnel.map((step) => ({ ...step })),
    returnLoops: returnLoops.map((loop) => ({ ...loop })),
    retentionBlockers: retentionBlockers.map((blocker) => ({ ...blocker })),
    privacySafetyBoundaries: privacySafetyBoundaries.map((boundary) => ({ ...boundary })),
    dependencySnapshot: {
      retentionSurfaces: 14,
      savedReportMocks: 8,
      returnCtaPaths: 11,
      futureReminderTypes: 7,
      privacyChecks: 15,
      streakNoopFlagsFalse: true,
      reminderNoopFlagsFalse: true,
    },
    mockDataOnlyNow: true,
    realRemindersNow: false,
    telegramApiNow: false,
    messageSendingNow: false,
    databaseReadNow: false,
    databaseWriteNow: false,
    externalAnalyticsNow: false,
    productionTrackingNow: false,
    paymentTrackingNow: false,
    vipUnlockNow: false,
    nextRecommendedPackage: "Package 191 — Public Launch Checklist Refresh",
  };
}
