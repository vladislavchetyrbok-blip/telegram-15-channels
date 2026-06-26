/**
 * Package 183: Analytics Funnel Mock Dashboard.
 *
 * Static/mock dashboard data only. This file must not read database records,
 * send analytics events, call Telegram API, or call external services.
 */

export type AphroditeAnalyticsMockFunnelStep = {
  id: string;
  label: string;
  mockCount: number;
  mockRateLabel: string;
  description: string;
  source: "mock-only";
};

export type AphroditeAnalyticsMockKpi = {
  id: string;
  label: string;
  mockValue: string;
  formula: string;
  interpretation: string;
  source: "mock-only";
};

export type AphroditeAnalyticsMockContentRow = {
  id: string;
  label: string;
  mockCtaViews: number;
  mockMiniAppOpens: number;
  mockConversion: string;
  source: "mock-only";
};

export type AphroditeAnalyticsMockSafetyBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeAnalyticsMockDashboardModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  funnelSteps: AphroditeAnalyticsMockFunnelStep[];
  kpis: AphroditeAnalyticsMockKpi[];
  contentRows: AphroditeAnalyticsMockContentRow[];
  boundaries: AphroditeAnalyticsMockSafetyBoundary[];
  nextRecommendedPackage: string;
};

export const APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_TITLE =
  "Mock Dashboard воронки Aphrodite";

export const APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_CLASSIFICATION =
  "Только mock dashboard / Нет реальных данных / Нет внешней аналитики";

export const APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_RULE =
  "Mock dashboard uses static sample numbers only. It must not read database, send analytics events, call external analytics APIs, call Telegram API, or enable payment tracking.";

export const APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_SAFETY_LABELS = [
  "Нет реальных analytics данных",
  "Нет внешней аналитики",
  "Нет отправки событий",
  "Нет чтения базы данных",
  "Нет записи в базу данных",
  "Нет Telegram API",
  "Нет payment tracking",
  "Нет production tracking",
  "Mock dashboard ничего не отправляет",
] as const;

const funnelSteps: AphroditeAnalyticsMockFunnelStep[] = [
  {
    id: "telegram-cta-to-miniapp",
    label: "Telegram CTA → Mini App opens",
    mockCount: 1000,
    mockRateLabel: "31%",
    description: "Mock view of future channel CTA to Mini App open conversion.",
    source: "mock-only",
  },
  {
    id: "miniapp-to-love-reading",
    label: "Mini App open → Love Reading open",
    mockCount: 310,
    mockRateLabel: "64%",
    description: "Mock view of future Mini App entry into AI Love Reading.",
    source: "mock-only",
  },
  {
    id: "love-form-start-to-submit",
    label: "Love Reading form start → submit",
    mockCount: 198,
    mockRateLabel: "72%",
    description: "Mock completion rate for a future Love Reading form.",
    source: "mock-only",
  },
  {
    id: "preview-viewed",
    label: "preview viewed",
    mockCount: 143,
    mockRateLabel: "91%",
    description: "Mock share of submitted forms that reach a free preview.",
    source: "mock-only",
  },
  {
    id: "paywall-teaser-viewed",
    label: "paywall teaser viewed",
    mockCount: 112,
    mockRateLabel: "78%",
    description: "Mock view of future full report teaser exposure.",
    source: "mock-only",
  },
  {
    id: "future-payment-intent",
    label: "future payment intent",
    mockCount: 37,
    mockRateLabel: "33%",
    description: "Mock intent only. No payment API, invoice, ledger, or VIP unlock exists.",
    source: "mock-only",
  },
  {
    id: "guard-denied",
    label: "guard denied",
    mockCount: 21,
    mockRateLabel: "19%",
    description: "Mock denied VIP access attempts for future guard analytics.",
    source: "mock-only",
  },
  {
    id: "fallback-recovery",
    label: "fallback recovery",
    mockCount: 18,
    mockRateLabel: "86%",
    description: "Mock recovery after guard denied users see safe free preview fallback.",
    source: "mock-only",
  },
  {
    id: "return-visits",
    label: "return visits",
    mockCount: 74,
    mockRateLabel: "24%",
    description: "Mock retained sessions returning to Mini App.",
    source: "mock-only",
  },
  {
    id: "channel-to-miniapp-conversion",
    label: "channel-to-Mini-App conversion",
    mockCount: 310,
    mockRateLabel: "31%",
    description: "Mock aggregate conversion from Telegram channel CTA to Mini App open.",
    source: "mock-only",
  },
];

const kpis: AphroditeAnalyticsMockKpi[] = [
  {
    id: "mini-app-open-rate",
    label: "Mini App open rate",
    mockValue: "31%",
    formula: "miniapp_opened / telegram_channel_cta_click",
    interpretation: "Mock KPI for channel traffic quality.",
    source: "mock-only",
  },
  {
    id: "love-reading-start-rate",
    label: "Love Reading start rate",
    mockValue: "64%",
    formula: "love_reading_opened / miniapp_opened",
    interpretation: "Mock KPI for AI Love Reading entry.",
    source: "mock-only",
  },
  {
    id: "form-completion-rate",
    label: "Form completion rate",
    mockValue: "72%",
    formula: "love_reading_form_submitted / love_reading_form_started",
    interpretation: "Mock KPI for future form completion.",
    source: "mock-only",
  },
  {
    id: "preview-view-rate",
    label: "Preview view rate",
    mockValue: "91%",
    formula: "love_reading_preview_viewed / love_reading_form_submitted",
    interpretation: "Mock KPI for preview delivery.",
    source: "mock-only",
  },
  {
    id: "paywall-view-rate",
    label: "Paywall teaser view rate",
    mockValue: "78%",
    formula: "full_love_report_teaser_viewed / love_reading_preview_viewed",
    interpretation: "Mock KPI for future paywall teaser visibility.",
    source: "mock-only",
  },
  {
    id: "future-payment-intent-rate",
    label: "Future payment intent rate",
    mockValue: "33%",
    formula: "future_payment_intent_clicked / paywall_viewed",
    interpretation: "Mock KPI only; no payment tracking is active.",
    source: "mock-only",
  },
  {
    id: "guard-denial-rate",
    label: "Guard denied rate",
    mockValue: "19%",
    formula: "vip_guard_denied / locked_vip_entry",
    interpretation: "Mock KPI for future VIP guard friction.",
    source: "mock-only",
  },
  {
    id: "return-visit-rate",
    label: "Return visit rate",
    mockValue: "24%",
    formula: "return_visit / miniapp_opened",
    interpretation: "Mock KPI for retention.",
    source: "mock-only",
  },
];

const contentRows: AphroditeAnalyticsMockContentRow[] = [
  {
    id: "daily-content-cta",
    label: "daily content CTA",
    mockCtaViews: 420,
    mockMiniAppOpens: 121,
    mockConversion: "29%",
    source: "mock-only",
  },
  {
    id: "weekly-content-cta",
    label: "weekly content CTA",
    mockCtaViews: 260,
    mockMiniAppOpens: 88,
    mockConversion: "34%",
    source: "mock-only",
  },
  {
    id: "monthly-content-cta",
    label: "monthly content CTA",
    mockCtaViews: 180,
    mockMiniAppOpens: 61,
    mockConversion: "34%",
    source: "mock-only",
  },
];

const boundaries: AphroditeAnalyticsMockSafetyBoundary[] = [
  { id: "mock-data-only", label: "Нет реальных analytics данных", currentState: "static arrays only" },
  { id: "no-database-read", label: "Нет чтения базы данных", currentState: "no DB client, no env dependency" },
  { id: "no-database-write", label: "Нет записи в базу данных", currentState: "no insert/update/upsert/delete" },
  { id: "no-external-analytics", label: "Нет внешней аналитики", currentState: "no external SDK/API" },
  { id: "no-event-sending", label: "Нет отправки событий", currentState: "no sendBeacon/fetch/track call" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "no Telegram token or API call" },
  { id: "no-payment-tracking", label: "Нет payment tracking", currentState: "payment intent is mock-only" },
  { id: "no-production-tracking", label: "Нет production tracking", currentState: "dashboard is readiness-only" },
];

export function getAphroditeAnalyticsFunnelMockDashboard(): AphroditeAnalyticsMockDashboardModel {
  return {
    title: APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_TITLE,
    classification: APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_CLASSIFICATION,
    safetyLabels: APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_SAFETY_LABELS,
    funnelSteps: funnelSteps.map((step) => ({ ...step })),
    kpis: kpis.map((kpi) => ({ ...kpi })),
    contentRows: contentRows.map((row) => ({ ...row })),
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    nextRecommendedPackage: "Package 184 — Telegram CTA Attribution Readiness",
  };
}
