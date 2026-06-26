#!/usr/bin/env node

import { spawn } from "node:child_process";
import http from "node:http";

const DEFAULT_TIMEOUT_MS = 180_000;
const URL_BASE = "http://localhost:3000";
const ROUTES = {
  login: "/login",
  overview: "/dashboard/networks/zodiac",
  analytics: "/dashboard/networks/zodiac/analytics",
  channels: "/dashboard/networks/zodiac/channels",
  content: "/dashboard/networks/zodiac/content",
  publishing: "/dashboard/networks/zodiac/publishing",
  feedback: "/dashboard/networks/zodiac/feedback",
  launch: "/dashboard/networks/zodiac/launch",
  operations: "/dashboard/networks/zodiac/operations",
  priority: "/dashboard/networks/zodiac/priority",
  profiles: "/dashboard/networks/zodiac/profiles",
  security: "/dashboard/networks/zodiac/security",
  settings: "/dashboard/networks/zodiac/settings",
  docs: "/dashboard/networks/zodiac/docs",
  ledger: "/dashboard/networks/zodiac/ledger",
  contentQuality: "/dashboard/networks/zodiac/content-quality",
  templateRefinement: "/dashboard/networks/zodiac/template-refinement",
  qualityScoring: "/dashboard/networks/zodiac/quality-scoring",
  previewReview: "/dashboard/networks/zodiac/preview-review",
  manualReview: "/dashboard/networks/zodiac/manual-review",
  stability: "/dashboard/networks/zodiac/stability",
  legacyPublishing: "/publishing-center",
  miniApp: "/compatibility",
  miniappAudit: "/dashboard/networks/zodiac/miniapp-audit",
  miniappArchitecture: "/dashboard/networks/zodiac/miniapp-architecture",
  birthMatrix: "/birth-matrix",
  mysticNumbers: "/mystic-numbers",
  affirmations: "/affirmations",
  miniappHub: "/miniapp",
  miniappRouteSafety: "/dashboard/networks/zodiac/miniapp-route-safety",
  miniappReadiness: "/dashboard/networks/zodiac/miniapp-readiness",
  miniappLinkSmoke: "/dashboard/networks/zodiac/miniapp-link-smoke",
  compatibilityFlowSafety: "/dashboard/networks/zodiac/compatibility-flow-safety",
  miniappMonetizationArchitecture: "/dashboard/networks/zodiac/miniapp-monetization-architecture",
  miniappEntitlements: "/dashboard/networks/zodiac/miniapp-entitlements",
  miniappProductionWiring: "/dashboard/networks/zodiac/miniapp-production-wiring",
  miniappPaymentMatrix: "/dashboard/networks/zodiac/miniapp-payment-matrix",
  miniappRiskRegister: "/dashboard/networks/zodiac/miniapp-risk-register",
  miniappMasterIndex: "/dashboard/networks/zodiac/miniapp-master-index",
  ownerReviewGate: "/dashboard/networks/zodiac/owner-review-gate",
  telegramStarsPaymentArchitectureReview: "/dashboard/networks/zodiac/telegram-stars-payment-architecture-review",
  telegramStarsInvoiceBuilderSkeleton: "/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton",
  telegramStarsPreCheckoutSkeleton: "/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton",
  telegramStarsSuccessfulPaymentSkeleton: "/dashboard/networks/zodiac/telegram-stars-successful-payment-skeleton",
  paymentLedgerMockIntegration: "/dashboard/networks/zodiac/payment-ledger-mock-integration",
  entitlementCreationMock: "/dashboard/networks/zodiac/entitlement-creation-mock",
  productionPaymentSafetyGate: "/dashboard/networks/zodiac/production-payment-safety-gate",
  firstPaidMvpReadinessReview: "/dashboard/networks/zodiac/first-paid-mvp-readiness-review",
  supportRefundPolicyReadiness: "/dashboard/networks/zodiac/support-refund-policy-readiness",
  analyticsFunnelReadiness: "/dashboard/networks/zodiac/analytics-funnel-readiness",
  miniappAnalyticsNoopEventBus: "/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus",
  analyticsFunnelMockDashboard: "/dashboard/networks/zodiac/analytics-funnel-mock-dashboard",
  telegramCtaAttributionReadiness: "/dashboard/networks/zodiac/telegram-cta-attribution-readiness",
  analyticsPrivacySafetySuite: "/dashboard/networks/zodiac/analytics-privacy-safety-suite",
  retentionSystemReadiness: "/dashboard/networks/zodiac/retention-system-readiness",
  savedReportsHistoryMockReadiness: "/dashboard/networks/zodiac/saved-reports-history-mock-readiness",
  returnJourneyCtaReadiness: "/dashboard/networks/zodiac/return-journey-cta-readiness",
  streakReminderNoopSkeleton: "/dashboard/networks/zodiac/streak-reminder-noop-skeleton",
  retentionMockDashboardSafetySuite: "/dashboard/networks/zodiac/retention-mock-dashboard-safety-suite",
  publicLaunchChecklistRefresh: "/dashboard/networks/zodiac/public-launch-checklist-refresh",
  miniappUxSimplificationReview: "/dashboard/networks/zodiac/miniapp-ux-simplification-review",
  visualUiPolishPlan: "/dashboard/networks/zodiac/visual-ui-polish-plan",
  vipNatalNumerologyVisualReview: "/dashboard/networks/zodiac/vip-natal-numerology-visual-review",
  horoscopeVisualCards: "/dashboard/networks/zodiac/horoscope-visual-cards",
  miniappVisualQaConsolidation: "/dashboard/networks/zodiac/miniapp-visual-qa-consolidation",
  publicLaunchVisualReadinessReview: "/dashboard/networks/zodiac/public-launch-visual-readiness-review",
  realDeviceVisualQaChecklist: "/dashboard/networks/zodiac/real-device-visual-qa-checklist",
  telegramWebviewStartappDiagnostics: "/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics",
  liveVersionCacheMarkerReadiness: "/dashboard/networks/zodiac/live-version-cache-marker-readiness",
  visualIssueTriageBoard: "/dashboard/networks/zodiac/visual-issue-triage-board",
  publicLaunchGoNoGoReview: "/dashboard/networks/zodiac/public-launch-go-no-go-review",
  publicLaunchDryRunMatrix: "/dashboard/networks/zodiac/public-launch-dry-run-matrix",
  productCopyFinalPolish: "/dashboard/networks/zodiac/product-copy-final-polish",
  manualLaunchSmokeTestMatrix: "/dashboard/networks/zodiac/manual-launch-smoke-test-matrix",
  miniappSimplifiedRedesignImplementationPlan: "/dashboard/networks/zodiac/miniapp-simplified-redesign-implementation-plan",
  designTokensUiShell: "/dashboard/networks/zodiac/design-tokens-ui-shell",
  realImplementationPath: "/dashboard/networks/zodiac/real-implementation-path",
  telegramInitDataValidation: "/dashboard/networks/zodiac/telegram-initdata-validation",
  userProfileFoundation: "/dashboard/networks/zodiac/user-profile-foundation",
  productCatalogFoundation: "/dashboard/networks/zodiac/product-catalog-foundation",
  entitlementFoundation: "/dashboard/networks/zodiac/entitlement-foundation",
  vipAccessBoundary: "/dashboard/networks/zodiac/vip-access-boundary",
  vipCompatibilityReportFoundation: "/dashboard/networks/zodiac/vip-compatibility-report-foundation",
  vipCompatibilityReportPreview: "/dashboard/networks/zodiac/vip-compatibility-report-preview",
  telegramStarsPaymentPrototype: "/dashboard/networks/zodiac/telegram-stars-payment-prototype",
  starsPaymentSafetyReview: "/dashboard/networks/zodiac/stars-payment-safety-review",
  telegramStarsInvoiceDraft: "/dashboard/networks/zodiac/telegram-stars-invoice-draft",
  invoiceDraftSafetyHardening: "/dashboard/networks/zodiac/invoice-draft-safety-hardening",
  aphroditeProductRemediation: "/dashboard/networks/zodiac/aphrodite-product-remediation",
  firstResultExperience: "/dashboard/networks/zodiac/first-result-experience",
  aiLoveReadingFoundation: "/dashboard/networks/zodiac/ai-love-reading-foundation",
  soulmateScannerFoundation: "/dashboard/networks/zodiac/soulmate-scanner-foundation",
  redFlagsScannerFoundation: "/dashboard/networks/zodiac/red-flags-scanner-foundation",
  aiFutureTimelineFoundation: "/dashboard/networks/zodiac/ai-future-timeline-foundation",
  socialTrafficLayer: "/dashboard/networks/zodiac/social-traffic-layer",
  socialContentTemplateEngine: "/dashboard/networks/zodiac/social-content-template-engine",
  socialDraftReviewQueue: "/dashboard/networks/zodiac/social-draft-review-queue",
  socialExportDashboard: "/dashboard/networks/zodiac/social-export-dashboard",
  socialContentCalendar: "/dashboard/networks/zodiac/social-content-calendar",
  publicBotProfileLaunchPackaging: "/dashboard/networks/zodiac/public-bot-profile-launch-packaging",
  paywallReadiness: "/dashboard/networks/zodiac/paywall-readiness",
  entitlementEnforcementDesign: "/dashboard/networks/zodiac/entitlement-enforcement-design",
  vipAccessBoundaryImplementationPlan: "/dashboard/networks/zodiac/vip-access-boundary-implementation-plan",
  vipAccessGuardSkeleton: "/dashboard/networks/zodiac/vip-access-guard-skeleton",
  vipGuardIntegrationReview: "/dashboard/networks/zodiac/vip-guard-integration-review",
  vipFreePreviewFallbackMap: "/dashboard/networks/zodiac/vip-free-preview-fallback-map",
  productCatalogFinalization: "/dashboard/networks/zodiac/product-catalog-finalization",
  paymentLedgerDesign: "/dashboard/networks/zodiac/payment-ledger-design",
  entitlementStorageDesign: "/dashboard/networks/zodiac/entitlement-storage-design",
  entitlementSchemaSkeleton: "/dashboard/networks/zodiac/entitlement-schema-skeleton",
  serverEntitlementCheckSkeleton: "/dashboard/networks/zodiac/server-entitlement-check-skeleton",
  vipAccessSecuritySuite: "/dashboard/networks/zodiac/vip-access-security-suite",
  vipCompatibilityReport: "/vip-compatibility-report",
  vipPreview: "/vip-preview",
  dailySystem: "/dashboard/networks/zodiac/daily-system",
  softLaunch: "/dashboard/networks/zodiac/soft-launch",
  dashboardAuthStatus: "/api/dashboard/auth/status",
  unifiedStatus: "/api/system/unified-status",
  aphroditeOverview: "/dashboard/networks/aphrodite",
  aphroditeChannels: "/dashboard/networks/aphrodite/channels",
  aphroditeCalendar: "/dashboard/networks/aphrodite/calendar",
  aphroditeDataSources: "/dashboard/networks/aphrodite/data-sources",
  aphroditeCurrency: "/dashboard/networks/aphrodite/currency",
  aphroditeCrypto: "/dashboard/networks/aphrodite/crypto",
  aphroditeMetals: "/dashboard/networks/aphrodite/metals",
  aphroditeStudio: "/dashboard/networks/aphrodite/studio",
  aphroditeTemplates: "/dashboard/networks/aphrodite/studio/templates",
  aphroditeQueue: "/dashboard/networks/aphrodite/studio/queue",
  aphroditeBriefs: "/dashboard/networks/aphrodite/studio/briefs",
  aphroditeLegacy: "/dashboard/networks/aphrodite/legacy",
  aphroditeLegacyRestart: "/dashboard/networks/aphrodite/legacy/restart",
};

async function main() {
  console.log("Starting Dashboard QA...");

  const server = await ensureServer(URL_BASE, DEFAULT_TIMEOUT_MS);
  console.log(`Server is running at ${URL_BASE}`);

  try {
    const pages = {};
    
    // Check that an unprotected route (like /login) works
    pages.login = await fetchUrl(`${URL_BASE}${ROUTES.login}`);
    assertIncludes(pages.login, "Вход в Афродиту", "dashboard login page heading");

    // Check that a protected route redirects
    console.log(`Checking unauthorized access to /dashboard/networks/aphrodite`);
    await checkRedirect(`${URL_BASE}/dashboard/networks/aphrodite`);

    // Login and get cookie
    console.log(`Logging in via API...`);
    const sessionCookie = await loginAndGetCookie(`${URL_BASE}/api/auth/login`);
    console.log(`Successfully obtained session cookie`);

    for (const [name, route] of Object.entries(ROUTES)) {
      if (name === "login") continue; // Already fetched
      console.log(`Checking ${route}`);
      pages[name] = await fetchUrl(`${URL_BASE}${route}`, sessionCookie);
      assertNoRuntimeErrorText(pages[name], `${name} page`);
      assertNoSecretValues(pages[name], `${name} page`);
    }

    assertIncludes(pages.login, "Вход в Афродиту", "dashboard login page heading");
    assertIncludes(pages.overview, "Афродита", "Aphrodite visible on dashboard shell or overview");
    assertIncludes(pages.overview, "Каналы Зодиака", "overview page heading");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/channels"', "overview channels route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/publishing"', "overview publishing route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/analytics"', "overview analytics route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/feedback"', "overview feedback route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/security"', "overview security route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/content"', "overview content route link");
    assertIncludes(pages.overview, "Обзор", "sidebar/platform nav Overview label");
    assertIncludes(pages.overview, "Каналы", "sidebar/platform nav Channels label");
    assertIncludes(pages.overview, "Контент", "sidebar/platform nav Content label");
    assertIncludes(pages.overview, "Публикации", "sidebar/platform nav Publishing label");
    assertIncludes(pages.overview, "Аналитика", "sidebar/platform nav Analytics label");
    assertIncludes(pages.overview, "Отзывы", "sidebar/platform nav Feedback label");
    assertIncludes(pages.overview, "Безопасность", "sidebar/platform nav Security label");

    // Module cards visibility checks
    assertIncludes(pages.overview, "Zodiac Network — Каналы", "Zodiac Network module card visible");
    assertIncludes(pages.overview, "Zodiac Studio — Контент", "Zodiac Studio module card visible");
    assertIncludes(pages.overview, "Zodiac Publisher — Публикации", "Zodiac Publisher module card visible");
    assertIncludes(pages.overview, "Zodiac Pulse — Аналитика", "Zodiac Pulse module card visible");
    assertIncludes(pages.overview, "Zodiac Voice — Отзывы", "Zodiac Voice module card visible");
    assertIncludes(pages.overview, "Zodiac Shield — Безопасность", "Zodiac Shield module card visible");
    assertIncludes(pages.overview, "Zodiac Mini — Mini App", "Zodiac Mini module card visible");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/paywall-readiness"', "paywall readiness route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/entitlement-enforcement-design"', "entitlement design route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/owner-review-gate"', "owner review gate route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/telegram-stars-payment-architecture-review"', "telegram stars architecture route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton"', "telegram stars invoice builder skeleton route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton"', "telegram stars pre-checkout skeleton route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/telegram-stars-successful-payment-skeleton"', "telegram stars successful payment skeleton route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/payment-ledger-mock-integration"', "payment ledger mock integration route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/entitlement-creation-mock"', "entitlement creation mock route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/production-payment-safety-gate"', "production payment safety gate route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/first-paid-mvp-readiness-review"', "first paid mvp readiness route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/support-refund-policy-readiness"', "support refund policy readiness route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/analytics-funnel-readiness"', "analytics funnel readiness route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus"', "miniapp analytics noop event bus route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/analytics-funnel-mock-dashboard"', "analytics funnel mock dashboard route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/telegram-cta-attribution-readiness"', "telegram cta attribution readiness route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/analytics-privacy-safety-suite"', "analytics privacy safety suite route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/retention-system-readiness"', "retention system readiness route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/saved-reports-history-mock-readiness"', "saved reports history mock readiness route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/return-journey-cta-readiness"', "return journey cta readiness route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/streak-reminder-noop-skeleton"', "streak reminder noop skeleton route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/retention-mock-dashboard-safety-suite"', "retention mock dashboard safety suite route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/public-launch-checklist-refresh"', "public launch checklist refresh route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/miniapp-ux-simplification-review"', "miniapp ux simplification review route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/visual-ui-polish-plan"', "visual ui polish plan route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/vip-natal-numerology-visual-review"', "vip natal numerology visual review route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/horoscope-visual-cards"', "horoscope visual cards route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/miniapp-visual-qa-consolidation"', "miniapp visual qa consolidation route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/public-launch-visual-readiness-review"', "public launch visual readiness review route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/real-device-visual-qa-checklist"', "real device visual qa checklist route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics"', "telegram webview startapp diagnostics route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/live-version-cache-marker-readiness"', "live version cache marker readiness route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/visual-issue-triage-board"', "visual issue triage board route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/public-launch-go-no-go-review"', "public launch go no-go review route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/public-launch-dry-run-matrix"', "public launch dry-run matrix route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/product-copy-final-polish"', "product copy final polish route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/manual-launch-smoke-test-matrix"', "manual launch smoke test matrix route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/miniapp-simplified-redesign-implementation-plan"', "miniapp simplified redesign implementation plan route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/design-tokens-ui-shell"', "design tokens ui shell route link");

    assertIncludes(pages.analytics, "Аналитика Mini App", "analytics page heading");
    assertIncludes(pages.analytics, "First-users funnel", "first-users funnel block");
    assertIncludes(pages.analytics, "Open Mini App", "soft-launch funnel first step");
    assertIncludes(pages.analytics, "Open Feature", "soft-launch funnel feature step");
    assertIncludes(pages.analytics, "Get Result", "soft-launch funnel result step");
    assertIncludes(pages.analytics, "Save/Share", "soft-launch funnel save/share step");
    assertIncludes(pages.analytics, "Feedback", "soft-launch funnel feedback step");
    assertIncludes(pages.analytics, "Mini App opens", "overview card Mini App opens");
    assertIncludes(pages.analytics, "Feature opens", "overview card Feature opens");
    assertIncludes(pages.analytics, "Results calculated", "overview card Results calculated");
    assertIncludes(pages.analytics, "Top sections for first users", "top sections block");
    assertIncludes(pages.analytics, "docs/zodiac-first-users-analytics-baseline.md", "baseline doc path");
    assertIncludes(pages.analytics, "docs/zodiac-controlled-soft-launch-execution.md", "soft launch execution doc path");
    assertIncludes(pages.analytics, "docs/zodiac-soft-launch-batch-template.md", "batch template doc path");
    assertIncludes(pages.analytics, 'href="/dashboard/networks/zodiac/feedback"', "analytics feedback center route link");

    const hasRedisValues = Boolean(process.env.ZODIAC_ANALYTICS_REDIS_URL && process.env.ZODIAC_ANALYTICS_REDIS_TOKEN);
    if (hasRedisValues) assertIncludes(pages.analytics, "Аналитика: Redis активен в production", "Redis active state");
    else assertIncludes(pages.analytics, "Аналитика: локальный noop-режим", "noop state");

    assertIncludes(pages.channels, "Управление модулем Зодиак внутри Афродиты.", "channels page heading");
    assertIncludes(pages.channels, "Текущая сеть 13 каналов", "channel manager table section");
    assertIncludes(pages.channels, 'data-qa="zodiac-channel-table"', "channel manager table");
    assertIncludes(pages.channels, 'data-qa="new-channel-draft-builder"', "new channel draft builder");
    assertIncludes(pages.channels, 'id="generated-channel-config"', "generated config block");
    assertIncludes(pages.channels, 'id="generated-channel-checklist"', "generated checklist block");
    assertIncludes(pages.channels, "npm run zodiac:navigation:all:dry", "navigation dry-run command hint");
    assertIncludes(pages.channels, "npm run zodiac:descriptions:dry", "descriptions dry-run command hint");
    assertIncludes(pages.channels, 'href="/dashboard/networks/zodiac/publishing"', "channels publishing route link");
    assertIncludes(pages.channels, 'href="/dashboard/networks/zodiac/content"', "channels content route link");
    assertIncludes(pages.channels, 'href="/dashboard/networks/zodiac/security"', "channels security route link");
    assertIncludes(pages.channels, "compat_aries", "sign startapp link");
    assertIncludes(pages.channels, "https://t.me/aries_horoscope_daily", "Telegram channel URL");

    assertIncludes(pages.content, "Контент Зодиака", "content page heading");
    assertIncludes(pages.content, "Управление модулем Зодиак внутри Афродиты.", "content page subtitle");
    assertIncludes(pages.content, "Платформа / Афродита", "content breadcrumb");
    assertIncludes(pages.content, 'data-qa="content-engine-overview-cards"', "content overview cards");
    assertIncludes(pages.content, "Шаблоны", "content overview templates card");
    assertIncludes(pages.content, "Рубрики", "content overview rubrics card");
    assertIncludes(pages.content, "RU/UA качество", "content overview RU/UA card");
    assertIncludes(pages.content, "CTA/startapp", "content overview CTA card");
    assertIncludes(pages.content, "Черновики", "content overview drafts card");
    assertIncludes(pages.content, "Готовность к публикациям", "content publishing readiness card");
    assertIncludes(pages.content, "Шаблоны работают как локальные черновики и preview", "content honest local preview state");
    assertIncludes(pages.content, 'data-qa="template-catalog"', "template catalog");
    assertIncludes(pages.content, "Ежедневный гороскоп", "daily horoscope template card");
    assertIncludes(pages.content, "Прогноз недели", "weekly forecast template card");
    assertIncludes(pages.content, "Совместимость", "compatibility template card");
    assertIncludes(pages.content, "Mini App invite", "Mini App invite template card");
    assertIncludes(pages.content, "VIP teaser", "VIP teaser template card");
    assertIncludes(pages.content, "Матрица судьбы", "Birth Matrix template card");
    assertIncludes(pages.content, "Натальная карта", "Natal chart template card");
    assertIncludes(pages.content, "Таро/Руны", "Tarot/Rune template card");
    assertIncludes(pages.content, "Лунный ритуал", "Lunar ritual template card");
    assertIncludes(pages.content, "Ангельские числа", "Angel Numbers template card");
    assertIncludes(pages.content, "Навигационный пост", "navigation post template card");
    assertIncludes(pages.content, "Soft Launch invite", "soft launch invite template card");
    assertIncludes(pages.content, "Custom/manual", "custom manual template card");
    assertIncludes(pages.content, "symbolic only / exact_unavailable", "exact astro restriction label");
    assertIncludes(pages.content, 'data-qa="template-studio"', "Template Studio section");
    assertIncludes(pages.content, "Template Studio", "Template Studio heading");
    assertIncludes(pages.content, "Template type", "template type field");
    assertIncludes(pages.content, "Language", "language field");
    assertIncludes(pages.content, "Channel/topic", "channel topic field");
    assertIncludes(pages.content, "Tone", "tone field");
    assertIncludes(pages.content, "Emoji intensity", "emoji intensity field");
    assertIncludes(pages.content, "Mini App startapp parameter", "startapp field");
    assertIncludes(pages.content, 'data-qa="telegram-post-preview"', "Telegram preview");
    assertIncludes(pages.content, 'data-qa="compact-channel-card-preview"', "compact channel card preview");
    assertIncludes(pages.content, 'data-qa="generated-content-text"', "generated content text block");
    assertIncludes(pages.content, 'data-qa="generated-content-config"', "generated config block");
    assertIncludes(pages.content, 'data-qa="generated-content-checklist"', "generated checklist block");
    assertIncludes(pages.content, "review language", "generated checklist language item");
    assertIncludes(pages.content, "publish only through approved process", "generated checklist approved process item");
    assertIncludes(pages.content, 'data-qa="content-quality-checklist"', "RU/UA quality checklist");
    assertIncludes(pages.content, "Проверка качества текста", "quality checklist heading");
    assertIncludes(pages.content, "понятный заголовок", "quality clear title item");
    assertIncludes(pages.content, "нет смешения RU/UA", "quality no mixed RU/UA item");
    assertIncludes(pages.content, "нет ложных точных астрологических claims", "quality exact claims item");
    assertIncludes(pages.content, "есть переход в Mini App", "quality Mini App transition item");
    assertIncludes(pages.content, "live scheduling changes: NO", "no live scheduling changes label");
    assertIncludes(pages.content, 'data-qa="rubric-planner"', "rubric planner");
    assertIncludes(pages.content, "ежедневный прогноз", "rubric daily forecast");
    assertIncludes(pages.content, "soft launch feedback", "rubric soft launch feedback");
    assertIncludes(pages.content, 'href="/dashboard/networks/zodiac/publishing"', "content publishing link");
    assertIncludes(pages.content, 'href="/dashboard/networks/zodiac/security"', "content security link");
    assertIncludes(pages.content, 'href="/dashboard/networks/zodiac/channels"', "content channels link");
    assertNotIncludes(pages.content, "zodiac:publish-date:live", "live publish command on content page");
    assertNotIncludes(pages.content, "zodiac:weekly:publish", "weekly live command on content page");
    assertNotIncludes(pages.content, "/api/zodiac/content", "content server write API route");
    assertNotIncludes(pages.content, "/api/zodiac/templates", "template server write API route");

    assertIncludes(pages.publishing, "Публикации", "publishing page title");
    assertIncludes(pages.publishing, "Ежедневные публикации", "publishing daily status card");
    assertIncludes(pages.publishing, "Weekly live", "publishing weekly off card");
    assertIncludes(pages.publishing, "Telegram API calls in dry-run", "dry-run API calls card");
    assertIncludes(pages.publishing, 'data-qa="publishing-calendar-preview"', "calendar preview block");
    assertIncludes(pages.publishing, 'data-qa="publishing-channel-coverage"', "channel coverage block");
    assertIncludes(pages.publishing, 'data-qa="publishing-dry-run-helper"', "dry-run command helper");
    assertIncludes(pages.publishing, "npm run zodiac:workflow:check -- --date YYYY-MM-DD", "workflow command hint");
    assertIncludes(pages.publishing, "npm run zodiac:publish-date:dry -- --date YYYY-MM-DD", "daily dry-run command hint");
    assertIncludes(pages.publishing, "npm run zodiac:ledger:safety:check", "ledger safety command hint");
    assertIncludes(pages.publishing, 'data-qa="manual-post-draft-builder"', "manual post draft builder");
    assertIncludes(pages.publishing, 'id="generated-manual-post-text"', "generated manual post text block");
    assertIncludes(pages.publishing, 'id="generated-manual-post-checklist"', "generated manual post checklist block");
    assertIncludes(pages.publishing, 'data-qa="publishing-ledger-safety"', "ledger/safety section");
    assertIncludes(pages.publishing, 'href="/dashboard/networks/zodiac/feedback"', "publishing feedback route link");
    assertIncludes(pages.publishing, 'href="/dashboard/networks/zodiac/content"', "publishing content route link");
    assertIncludes(pages.publishing, 'href="/dashboard/networks/zodiac/security"', "publishing security route link");
    assertNotIncludes(pages.publishing, "zodiac:publish-date:live", "live publish command on publishing page");
    assertNotIncludes(pages.publishing, "zodiac:weekly:publish", "weekly live command on publishing page");

    assertIncludes(pages.feedback, "Отзывы", "feedback page heading");
    assertIncludes(pages.feedback, "Платформа / Афродита", "feedback breadcrumb");
    assertIncludes(pages.feedback, "Управление модулем Зодиак внутри Афродиты.", "feedback subtitle");
    assertIncludes(pages.feedback, "Отзывы", "feedback Russian nav label");
    assertIncludes(pages.feedback, 'data-qa="feedback-overview-cards"', "feedback overview cards");
    assertIncludes(pages.feedback, "Первые 5 пользователей", "first 5 overview card");
    assertIncludes(pages.feedback, "Средняя оценка", "average rating overview card");
    assertIncludes(pages.feedback, "P0 bugs", "P0 overview card");
    assertIncludes(pages.feedback, "P1 issues", "P1 overview card");
    assertIncludes(pages.feedback, "P2 backlog", "P2 overview card");
    assertIncludes(pages.feedback, "Готовность к 20 пользователям", "20 users readiness card");
    assertIncludes(pages.feedback, "Реальных отзывов ещё нет. Сначала пригласи 5 тестеров и внеси короткую sanitized-сводку.", "feedback empty state");
    assertIncludes(pages.feedback, 'data-qa="local-feedback-intake"', "local feedback intake form");
    assertIncludes(pages.feedback, "Локальный черновик, не серверная база", "local-only feedback label");
    assertIncludes(pages.feedback, "без server write API", "no server write API label");
    assertIncludes(pages.feedback, "Tester label", "tester label field");
    assertIncludes(pages.feedback, "Rating 1-10", "rating field");
    assertIncludes(pages.feedback, "Severity", "severity field");
    assertIncludes(pages.feedback, "Sanitized note", "sanitized note field");
    assertIncludes(pages.feedback, 'data-qa="real-phone-qa-checklist"', "real phone QA checklist");
    assertIncludes(pages.feedback, "Real Phone QA Evidence", "Real Phone QA Evidence section visible");
    assertIncludes(pages.feedback, "iPhone Telegram", "iPhone block visible");
    assertIncludes(pages.feedback, "Android Telegram", "Android block visible");
    assertIncludes(pages.feedback, 'data-qa="feedback-analytics-correlation"', "analytics correlation block");
    assertIncludes(pages.feedback, 'href="/dashboard/networks/zodiac/analytics"', "feedback analytics route link");
    assertIncludes(pages.feedback, 'href="/dashboard/networks/zodiac/security"', "feedback security route link");
    assertIncludes(pages.feedback, 'data-qa="feedback-decision-matrix"', "decision matrix block");
    assertIncludes(pages.feedback, "Readiness Decision Card", "readiness decision card visible");
    assertIncludes(pages.feedback, "First 5 users", "5 users decision");
    assertIncludes(pages.feedback, "20 users", "20 users decision");
    assertIncludes(pages.feedback, "Mass launch", "mass launch decision");
    assertIncludes(pages.feedback, 'data-qa="feedback-sanitized-export"', "sanitized export block");
    assertNotIncludes(pages.feedback, "/api/zodiac/feedback", "feedback server write API route");

    assertIncludes(pages.launch, "Запуск Зодиака", "launch page heading");
    assertIncludes(pages.launch, "Запуск", "sidebar has Запуск");
    assertIncludes(pages.launch, 'data-qa="launch-status-cards"', "launch status cards visible");
    assertIncludes(pages.launch, "First 5 users", "first 5 users card visible");
    assertIncludes(pages.launch, "20 users", "20 users card visible");
    assertIncludes(pages.launch, "Mass launch", "mass launch card visible");
    assertIncludes(pages.launch, "STOP", "mass launch STOP visible");
    assertIncludes(pages.launch, "Production auth", "production auth card visible");
    assertIncludes(pages.launch, "PENDING ENV", "production auth pending visible");
    assertIncludes(pages.launch, 'data-qa="launch-checklist"', "checklist visible");

    assertIncludes(pages.previewReview, "Preview Review Зодиака", "preview review page heading");
    assertIncludes(pages.previewReview, "Preview Review", "preview review sidebar visible");
    assertIncludes(pages.previewReview, "Каналов", "preview review channels count visible");
    assertIncludes(pages.previewReview, "Live", "preview review live status visible");
    assertIncludes(pages.previewReview, "Ручной просмотр dry-run примеров", "preview review origin text visible");
    assertIncludes(pages.previewReview, "Live-публикация отключена", "preview review safety flag");
    assertNotIncludes(pages.previewReview, "https://api.telegram.org", "no direct telegram api call in preview review");

    assertIncludes(pages.manualReview, "Ручная проверка Зодиака", "manual review page title");
    assertIncludes(pages.manualReview, "Очередь ручного review", "manual review subtitle");
    assertIncludes(pages.manualReview, "Owner Approval Gate", "manual review safety gate");
    assertIncludes(pages.manualReview, "Общий гороскоп", "manual review general channel");
    assertIncludes(pages.manualReview, "Овен", "manual review aries");
    assertNotIncludes(pages.manualReview, "https://api.telegram.org", "no direct telegram api call in manual review");

    assertIncludes(pages.stability, "Zodiac Stability Matrix", "stability page title");
    assertIncludes(pages.stability, "&quot;Do Not Touch&quot; Protection Area", "stability protection area");
    assertIncludes(pages.stability, "Diagnostic read-only control page", "stability subtitle");
    assertIncludes(pages.stability, "Daily Zodiac Automation", "stability daily automation tracking");
    assertNotIncludes(pages.stability, "https://api.telegram.org", "no direct telegram api call in stability matrix");

    assertIncludes(pages.miniappAudit, "Mini App Route &amp; Navigation Audit", "miniapp audit page title");
    assertIncludes(pages.miniappAudit, "Package 101", "miniapp audit package number");
    assertIncludes(pages.miniappAudit, "Проверить совместимость", "miniapp audit cta link");
    assertIncludes(pages.miniappAudit, "VIP Entry Points", "miniapp audit vip entry points");

    assertIncludes(pages.miniappArchitecture, "Mini App Architecture Spec", "miniapp architecture page title");
    assertIncludes(pages.miniappArchitecture, "Package 102", "miniapp architecture package number");
    assertIncludes(pages.miniappArchitecture, "VIP Entry Points", "miniapp architecture module name");
    assertIncludes(pages.miniappArchitecture, "Implementation Phases", "miniapp architecture phases section");

    assertIncludes(pages.birthMatrix, "Birth Matrix", "birth matrix page title");
    assertIncludes(pages.birthMatrix, "Static Mock (Package 103)", "birth matrix mock notice");
    assertIncludes(pages.birthMatrix, "Calculate Your Matrix", "birth matrix subtitle");

    assertIncludes(pages.mysticNumbers, "Mystic Numbers", "mystic numbers page title");
    assertIncludes(pages.mysticNumbers, "Static Mock (Package 104)", "mystic numbers mock notice");
    assertIncludes(pages.mysticNumbers, "Decode Repeating Numbers", "mystic numbers subtitle");

    assertIncludes(pages.affirmations, "Zodiac Affirmations", "affirmations page title");
    assertIncludes(pages.affirmations, "Static Mock (Package 105)", "affirmations mock notice");
    assertIncludes(pages.affirmations, "Your Daily Affirmation", "affirmations subtitle");

    assertIncludes(pages.miniappHub, "AI Love Reading", "miniapp simplified page title");
    assertIncludes(pages.miniappHub, "Открыть бесплатный Love Reading preview", "miniapp primary love reading CTA");
    assertIncludes(pages.miniappHub, "Совместимость", "miniapp compatibility secondary module");
    assertIncludes(pages.miniappHub, "Матрица судьбы", "miniapp birth matrix secondary module");
    assertIncludes(pages.miniappHub, "Гороскоп на день", "miniapp daily secondary module");
    assertIncludes(pages.miniappHub, "Гороскоп на неделю", "miniapp weekly secondary module");
    assertIncludes(pages.miniappHub, "Гороскоп на месяц", "miniapp monthly secondary module");
    assertIncludes(pages.miniappHub, "Узнай, что между вами происходит", "miniapp Russian love reading promise");
    assertIncludes(pages.miniappHub, "Без оплаты", "miniapp hub safety: no payment");
    assertIncludes(pages.miniappHub, "Без записи в базу данных", "miniapp hub safety: no database write");
    assertIncludes(pages.miniappHub, "Без Telegram API", "miniapp hub safety: no telegram API");
    assertIncludes(pages.miniappHub, "birth-matrix", "miniapp hub contains birth matrix link");
    assertIncludes(pages.miniappHub, "mystic-numbers", "miniapp hub contains mystic numbers link");
    assertIncludes(pages.miniappHub, "affirmations", "miniapp hub contains affirmations link");
    assertIncludes(pages.miniappHub, "vip-compatibility-report", "miniapp hub contains locked vip preview link");

    assertIncludes(pages.birthMatrix, "No payment", "birth matrix safety: no payment");
    assertIncludes(pages.birthMatrix, "No database", "birth matrix safety: no database");
    assertIncludes(pages.birthMatrix, "No Telegram API", "birth matrix safety: no telegram API");

    assertIncludes(pages.mysticNumbers, "No payment", "mystic numbers safety: no payment");
    assertIncludes(pages.mysticNumbers, "No database", "mystic numbers safety: no database");
    assertIncludes(pages.mysticNumbers, "No Telegram API", "mystic numbers safety: no telegram API");

    assertIncludes(pages.affirmations, "No payment", "affirmations safety: no payment");
    assertIncludes(pages.affirmations, "No database", "affirmations safety: no database");
    assertIncludes(pages.affirmations, "No Telegram API", "affirmations safety: no telegram API");

    assertIncludes(pages.vipPreview, "VIP Preview", "vip preview page title");
    assertIncludes(pages.vipPreview, "Preview Only (Package 107)", "vip preview mock notice");
    assertIncludes(pages.vipPreview, "Future VIP Access", "vip preview subtitle");
    assertIncludes(pages.vipPreview, "No payment", "vip preview safety: no payment");
    assertIncludes(pages.vipPreview, "No unlock", "vip preview safety: no unlock");
    assertIncludes(pages.vipPreview, "No database", "vip preview safety: no database");
    assertIncludes(pages.vipPreview, "No Telegram API", "vip preview safety: no telegram API");
    assertIncludes(pages.vipPreview, "No subscription logic", "vip preview safety: no subscription logic");

    assertIncludes(pages.miniappRouteSafety, "Mini App Route Safety Baseline", "miniapp route safety page title");
    assertIncludes(pages.miniappRouteSafety, "/miniapp", "miniapp route safety: miniapp route listed");
    assertIncludes(pages.miniappRouteSafety, "/compatibility", "miniapp route safety: compatibility route listed");
    assertIncludes(pages.miniappRouteSafety, "/birth-matrix", "miniapp route safety: birth-matrix route listed");
    assertIncludes(pages.miniappRouteSafety, "/mystic-numbers", "miniapp route safety: mystic-numbers route listed");
    assertIncludes(pages.miniappRouteSafety, "/affirmations", "miniapp route safety: affirmations route listed");
    assertIncludes(pages.miniappRouteSafety, "/vip-preview", "miniapp route safety: vip-preview route listed");

    assertIncludes(pages.miniappReadiness, "Mini App Readiness Summary", "miniapp readiness: page title");
    assertIncludes(pages.miniappReadiness, "Mock-ready / QA-protected / Not production-monetized", "miniapp readiness: system classification");
    assertIncludes(pages.miniappReadiness, "Package 111", "miniapp readiness: package 111 listed");
    assertIncludes(pages.miniappReadiness, "Package 103", "miniapp readiness: package 103 listed");

    assertIncludes(pages.miniappLinkSmoke, "Mini App Internal Link Smoke Matrix", "miniapp link smoke page title");
    assertIncludes(pages.miniappLinkSmoke, "Internal-link smoke only", "miniapp link smoke safety classification");
    assertIncludes(pages.miniappLinkSmoke, "/miniapp", "miniapp link smoke hub route listed");
    assertIncludes(pages.miniappLinkSmoke, "/birth-matrix", "miniapp link smoke birth matrix route listed");
    assertIncludes(pages.miniappLinkSmoke, "/mystic-numbers", "miniapp link smoke mystic numbers route listed");
    assertIncludes(pages.miniappLinkSmoke, "/affirmations", "miniapp link smoke affirmations route listed");
    assertIncludes(pages.miniappLinkSmoke, "/vip-preview", "miniapp link smoke vip preview route listed");
    assertIncludes(pages.miniappLinkSmoke, "No live CTA changes", "miniapp link smoke live cta protection");

    assertIncludes(pages.compatibilityFlowSafety, "Compatibility Flow Safety Audit", "compatibility flow safety page title");
    assertIncludes(pages.compatibilityFlowSafety, "Compatibility flow audit only", "compatibility flow audit classification");
    assertIncludes(pages.compatibilityFlowSafety, "/compatibility", "compatibility route listed");
    assertIncludes(pages.compatibilityFlowSafety, "No scoring engine changes", "compatibility scoring boundary");
    assertIncludes(pages.compatibilityFlowSafety, "No live CTA changes", "compatibility live cta protection");

    assertIncludes(pages.miniappMonetizationArchitecture, "Mini App Monetization Architecture", "monetization architecture page title");
    assertIncludes(pages.miniappMonetizationArchitecture, "Architecture only", "monetization architecture classification");
    assertIncludes(pages.miniappMonetizationArchitecture, "No payment implementation", "monetization payment boundary");
    assertIncludes(pages.miniappMonetizationArchitecture, "No VIP unlock", "monetization vip boundary");

    assertIncludes(pages.miniappEntitlements, "Entitlement Data Model", "entitlements page title");
    assertIncludes(pages.miniappEntitlements, "Data Model Spec Only", "entitlements boundary check");
    assertIncludes(pages.miniappEntitlements, "No database writes", "entitlements db boundary check");

    assertIncludes(pages.miniappProductionWiring, "Production Wiring Spec", "wiring page title");
    assertIncludes(pages.miniappProductionWiring, "Mock Mode Active", "wiring mock boundary");
    assertIncludes(pages.miniappProductionWiring, "No Telegram API connections", "wiring telegram boundary");

    assertIncludes(pages.miniappPaymentMatrix, "Payment Provider Decision Matrix", "payment matrix page title");
    assertIncludes(pages.miniappPaymentMatrix, "Decision Matrix Only", "payment matrix mock boundary");
    assertIncludes(pages.miniappPaymentMatrix, "No payment SDKs loaded", "payment matrix sdk boundary");

    assertIncludes(pages.miniappRiskRegister, "Production Risk Register", "risk register page title");
    assertIncludes(pages.miniappRiskRegister, "Documentation Only", "risk register mock boundary");
    assertIncludes(pages.miniappRiskRegister, "No live launch has occurred", "risk register live boundary");

    assertIncludes(pages.miniappMasterIndex, "Mini App Master Control Index", "master index page title");
    assertIncludes(pages.miniappMasterIndex, "Mock Mode Active", "master index mock boundary");
    assertIncludes(pages.miniappMasterIndex, "No live Telegram API calls are made", "master index telegram boundary");

    assertIncludes(pages.ownerReviewGate, "Owner Review Gate для VIP-запуска", "owner review gate title");
    assertIncludes(pages.ownerReviewGate, "Только safety gate", "owner review gate classification");
    assertIncludes(pages.ownerReviewGate, "Запуск не разрешён", "launch not approved boundary");
    assertIncludes(pages.ownerReviewGate, "Нет реальной оплаты", "payment boundary");
    assertIncludes(pages.ownerReviewGate, "Нет реальной VIP-разблокировки", "vip unlock boundary");
    assertIncludes(pages.ownerReviewGate, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.ownerReviewGate, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.ownerReviewGate, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.ownerReviewGate, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.ownerReviewGate, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.ownerReviewGate, "Owner review не включает оплату", "owner review no payment boundary");
    assertIncludes(pages.ownerReviewGate, "approvedForLaunch=false", "launch denied result");

    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Review архитектуры Telegram Stars", "telegram stars architecture title");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Только architecture review", "telegram stars architecture classification");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Invoice не создаётся", "invoice not created boundary");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Нет реальной оплаты", "payment boundary");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Нет sendInvoice", "sendInvoice boundary");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Нет createInvoiceLink", "createInvoiceLink boundary");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Нет pre_checkout_query handler", "pre-checkout boundary");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Нет entitlement creation", "entitlement boundary");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Нет вызова Telegram API", "telegram api boundary");
    assertIncludes(pages.telegramStarsPaymentArchitectureReview, "Architecture review не включает оплату", "architecture no payment boundary");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Skeleton invoice builder Telegram Stars", "telegram stars invoice builder skeleton title");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Только invoice draft", "telegram stars invoice builder skeleton classification");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Ничего не отправляется", "invoice draft sends nothing boundary");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Нет реальной оплаты", "invoice builder payment boundary");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Нет Telegram Stars invoice", "invoice builder stars invoice boundary");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Нет sendInvoice", "invoice builder sendInvoice boundary");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Нет createInvoiceLink", "invoice builder createInvoiceLink boundary");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Нет payment ledger write", "invoice builder ledger boundary");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Нет entitlement creation", "invoice builder entitlement boundary");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Нет вызова Telegram API", "invoice builder telegram api boundary");
    assertIncludes(pages.telegramStarsInvoiceBuilderSkeleton, "Invoice builder ничего не отправляет", "invoice builder sends nothing safety label");
    assertIncludes(pages.telegramStarsPreCheckoutSkeleton, "Skeleton pre-checkout Telegram Stars", "telegram stars pre-checkout skeleton title");
    assertIncludes(pages.telegramStarsPreCheckoutSkeleton, "Только pre-checkout skeleton", "telegram stars pre-checkout skeleton classification");
    assertIncludes(pages.telegramStarsPreCheckoutSkeleton, "Ответ не отправляется", "pre-checkout sends no answer boundary");
    assertIncludes(pages.telegramStarsPreCheckoutSkeleton, "Нет answerPreCheckoutQuery", "pre-checkout answer boundary");
    assertIncludes(pages.telegramStarsPreCheckoutSkeleton, "Нет pre_checkout_query handler", "pre-checkout handler boundary");
    assertIncludes(pages.telegramStarsPreCheckoutSkeleton, "Нет payment ledger write", "pre-checkout ledger boundary");
    assertIncludes(pages.telegramStarsPreCheckoutSkeleton, "Нет entitlement creation", "pre-checkout entitlement boundary");
    assertIncludes(pages.telegramStarsPreCheckoutSkeleton, "Нет вызова Telegram API", "pre-checkout telegram api boundary");
    assertIncludes(pages.telegramStarsPreCheckoutSkeleton, "PreCheckout skeleton ничего не подтверждает", "pre-checkout confirms nothing safety label");
    assertIncludes(pages.telegramStarsSuccessfulPaymentSkeleton, "Skeleton successful_payment Telegram Stars", "telegram stars successful payment skeleton title");
    assertIncludes(pages.telegramStarsSuccessfulPaymentSkeleton, "Только successful_payment skeleton", "telegram stars successful payment skeleton classification");
    assertIncludes(pages.telegramStarsSuccessfulPaymentSkeleton, "Ledger не записывается", "successful payment ledger blocked classification");
    assertIncludes(pages.telegramStarsSuccessfulPaymentSkeleton, "Нет active successful_payment handler", "successful payment handler boundary");
    assertIncludes(pages.telegramStarsSuccessfulPaymentSkeleton, "Нет payment ledger write", "successful payment ledger boundary");
    assertIncludes(pages.telegramStarsSuccessfulPaymentSkeleton, "Нет entitlement creation", "successful payment entitlement boundary");
    assertIncludes(pages.telegramStarsSuccessfulPaymentSkeleton, "Нет вызова Telegram API", "successful payment telegram api boundary");
    assertIncludes(pages.telegramStarsSuccessfulPaymentSkeleton, "successful_payment skeleton не выдаёт доступ", "successful payment grants no access");
    assertIncludes(pages.paymentLedgerMockIntegration, "Mock-интеграция payment ledger", "payment ledger mock integration title");
    assertIncludes(pages.paymentLedgerMockIntegration, "Только mock", "payment ledger mock integration classification");
    assertIncludes(pages.paymentLedgerMockIntegration, "Ledger не сохраняется", "payment ledger mock persistence boundary");
    assertIncludes(pages.paymentLedgerMockIntegration, "Нет payment ledger write", "payment ledger mock write boundary");
    assertIncludes(pages.paymentLedgerMockIntegration, "Нет entitlement creation", "payment ledger mock entitlement boundary");
    assertIncludes(pages.paymentLedgerMockIntegration, "Нет реальной VIP-разблокировки", "payment ledger mock vip boundary");
    assertIncludes(pages.paymentLedgerMockIntegration, "Нет вызова Telegram API", "payment ledger mock telegram api boundary");
    assertIncludes(pages.paymentLedgerMockIntegration, "Mock ledger ничего не сохраняет", "payment ledger mock saves nothing");
    assertIncludes(pages.entitlementCreationMock, "Mock создания entitlement", "entitlement creation mock title");
    assertIncludes(pages.entitlementCreationMock, "Только mock / Entitlement не создаётся", "entitlement creation mock classification");
    assertIncludes(pages.entitlementCreationMock, "Доступ не выдаётся", "entitlement creation mock access boundary");
    assertIncludes(pages.entitlementCreationMock, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.entitlementCreationMock, "Нет реальной VIP-разблокировки", "entitlement creation vip boundary");
    assertIncludes(pages.entitlementCreationMock, "Нет записи в базу данных", "entitlement creation db boundary");
    assertIncludes(pages.entitlementCreationMock, "Нет миграции схемы базы данных", "entitlement creation schema boundary");
    assertIncludes(pages.entitlementCreationMock, "Нет вызова Telegram API", "entitlement creation telegram api boundary");
    assertIncludes(pages.entitlementCreationMock, "Entitlement mock не выдаёт доступ", "entitlement mock grants no access");
    assertIncludes(pages.productionPaymentSafetyGate, "Production Safety Gate для оплаты", "production payment safety gate title");
    assertIncludes(pages.productionPaymentSafetyGate, "Fail-closed safety gate", "production payment safety gate classification");
    assertIncludes(pages.productionPaymentSafetyGate, "Оплата не разрешена", "payment not allowed boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "VIP не открывается", "vip not unlocked boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Нет реальной оплаты", "payment boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Нет sendInvoice", "sendInvoice boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Нет createInvoiceLink", "createInvoiceLink boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Нет pre_checkout_query handler", "pre-checkout boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Нет payment ledger write", "ledger write boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Нет entitlement creation", "entitlement boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Нет вызова Telegram API", "telegram api boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "Production payment safety gate всегда закрыт", "fail closed boundary");
    assertIncludes(pages.productionPaymentSafetyGate, "productionPaymentAllowedNow=false", "payment denied result");
    assertIncludes(pages.productionPaymentSafetyGate, "vipUnlockAllowedNow=false", "vip denied result");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Readiness Review первого платного MVP", "paid mvp readiness title");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Только review готовности", "paid mvp readiness classification");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Запуск не разрешён", "launch not approved boundary");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Нет реальной оплаты", "payment boundary");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Нет sendInvoice", "sendInvoice boundary");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Нет payment ledger write", "ledger write boundary");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Нет entitlement creation", "entitlement boundary");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Нет вызова Telegram API", "telegram api boundary");
    assertIncludes(pages.firstPaidMvpReadinessReview, "Paid MVP не разрешён к запуску", "paid mvp not approved");
    assertIncludes(pages.supportRefundPolicyReadiness, "Support &amp; Refund Readiness", "support refund readiness title");
    assertIncludes(pages.supportRefundPolicyReadiness, "Только policy readiness", "support refund readiness classification");
    assertIncludes(pages.supportRefundPolicyReadiness, "Возвраты не автоматизированы", "refunds not automated boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "/paysupport", "paysupport readiness visible");
    assertIncludes(pages.supportRefundPolicyReadiness, "manual owner review rules", "manual owner review section");
    assertIncludes(pages.supportRefundPolicyReadiness, "Telegram Stars support notes", "telegram stars support notes");
    assertIncludes(pages.supportRefundPolicyReadiness, "entitlement revocation dependency", "entitlement revocation dependency");
    assertIncludes(pages.supportRefundPolicyReadiness, "ledger dependency", "ledger dependency");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет реальной оплаты", "payment boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет sendInvoice", "sendInvoice boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет createInvoiceLink", "createInvoiceLink boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет pre_checkout_query handler", "pre-checkout boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет payment ledger write", "ledger write boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет entitlement creation", "entitlement boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет автоматического возврата", "no automatic refund boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет миграции схемы базы данных", "schema boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Нет вызова Telegram API", "telegram api boundary");
    assertIncludes(pages.supportRefundPolicyReadiness, "Support/refund readiness не включает оплату", "support refund no payment");
    assertIncludes(pages.analyticsFunnelReadiness, "Analytics/Funnel Tracking Readiness", "analytics funnel readiness title");
    assertIncludes(pages.analyticsFunnelReadiness, "Только readiness", "analytics readiness classification");
    assertIncludes(pages.analyticsFunnelReadiness, "События не отправляются", "analytics events not sent boundary");
    assertIncludes(pages.analyticsFunnelReadiness, "Нет внешней аналитики", "external analytics boundary");
    assertIncludes(pages.analyticsFunnelReadiness, "Нет отправки событий", "event sending boundary");
    assertIncludes(pages.analyticsFunnelReadiness, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.analyticsFunnelReadiness, "Нет Telegram API", "telegram api boundary");
    assertIncludes(pages.analyticsFunnelReadiness, "Нет payment tracking", "payment tracking boundary");
    assertIncludes(pages.analyticsFunnelReadiness, "Нет реальной оплаты", "payment boundary");
    assertIncludes(pages.analyticsFunnelReadiness, "Нет VIP-разблокировки", "vip boundary");
    assertIncludes(pages.analyticsFunnelReadiness, "Analytics readiness ничего не отправляет", "analytics sends nothing");
    assertIncludes(pages.miniappAnalyticsNoopEventBus, "Noop Event Bus для Mini App аналитики", "miniapp analytics noop event bus title");
    assertIncludes(pages.miniappAnalyticsNoopEventBus, "Только noop", "miniapp analytics noop classification");
    assertIncludes(pages.miniappAnalyticsNoopEventBus, "События не отправляются", "miniapp analytics noop events not sent");
    assertIncludes(pages.miniappAnalyticsNoopEventBus, "Нет внешней аналитики", "miniapp analytics noop external boundary");
    assertIncludes(pages.miniappAnalyticsNoopEventBus, "Нет отправки событий", "miniapp analytics noop event sending boundary");
    assertIncludes(pages.miniappAnalyticsNoopEventBus, "Нет записи в базу данных", "miniapp analytics noop database boundary");
    assertIncludes(pages.miniappAnalyticsNoopEventBus, "Нет Telegram API", "miniapp analytics noop telegram boundary");
    assertIncludes(pages.miniappAnalyticsNoopEventBus, "Нет payment tracking", "miniapp analytics noop payment tracking boundary");
    assertIncludes(pages.miniappAnalyticsNoopEventBus, "Noop event bus ничего не отправляет", "miniapp analytics noop sends nothing");
    assertIncludes(pages.analyticsFunnelMockDashboard, "Mock Dashboard воронки Aphrodite", "analytics funnel mock dashboard title");
    assertIncludes(pages.analyticsFunnelMockDashboard, "Только mock dashboard", "analytics funnel mock dashboard classification");
    assertIncludes(pages.analyticsFunnelMockDashboard, "Нет реальных analytics данных", "analytics funnel mock no real data");
    assertIncludes(pages.analyticsFunnelMockDashboard, "Нет чтения базы данных", "analytics funnel mock no db read");
    assertIncludes(pages.analyticsFunnelMockDashboard, "Нет записи в базу данных", "analytics funnel mock no db write");
    assertIncludes(pages.analyticsFunnelMockDashboard, "Нет внешней аналитики", "analytics funnel mock no external analytics");
    assertIncludes(pages.analyticsFunnelMockDashboard, "Mock dashboard ничего не отправляет", "analytics funnel mock sends nothing");
    assertIncludes(pages.analyticsFunnelMockDashboard, "Telegram CTA", "analytics funnel mock telegram cta");
    assertIncludes(pages.analyticsFunnelMockDashboard, "daily/weekly/monthly content CTA", "analytics funnel mock content CTA");
    assertIncludes(pages.telegramCtaAttributionReadiness, "Readiness Telegram CTA attribution", "telegram cta attribution readiness title");
    assertIncludes(pages.telegramCtaAttributionReadiness, "Только attribution readiness", "telegram cta attribution readiness classification");
    assertIncludes(pages.telegramCtaAttributionReadiness, "Нет изменения active CTA", "telegram cta attribution no active cta change");
    assertIncludes(pages.telegramCtaAttributionReadiness, "CTA attribution readiness ничего не отправляет", "telegram cta attribution sends nothing");
    assertIncludes(pages.telegramCtaAttributionReadiness, "tg_daily_aries", "telegram cta attribution daily source");
    assertIncludes(pages.telegramCtaAttributionReadiness, "tg_weekly_leo", "telegram cta attribution weekly source");
    assertIncludes(pages.telegramCtaAttributionReadiness, "tg_monthly_2026_07_general", "telegram cta attribution monthly source");
    assertIncludes(pages.telegramCtaAttributionReadiness, "source channel", "telegram cta attribution source channel dimension");
    assertIncludes(pages.telegramCtaAttributionReadiness, "startapp param draft", "telegram cta attribution startapp draft dimension");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Privacy Safety Suite для аналитики", "analytics privacy safety suite title");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Только QA безопасности", "analytics privacy safety suite classification");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Нет внешней аналитики", "analytics privacy safety no external analytics");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Нет чтения базы данных", "analytics privacy safety no db read");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Privacy safety suite ничего не отправляет", "analytics privacy safety sends nothing");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Raw names analytics: запрещены", "analytics privacy safety no raw names");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Raw birth dates analytics: запрещены", "analytics privacy safety no raw birth dates");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Payment payload analytics: запрещены", "analytics privacy safety no payment payloads");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Private Telegram messages analytics: запрещены", "analytics privacy safety no private messages");
    assertIncludes(pages.analyticsPrivacySafetySuite, "Full report text analytics: запрещён", "analytics privacy safety no report text");
    assertIncludes(pages.retentionSystemReadiness, "Retention System Readiness", "retention system readiness title");
    assertIncludes(pages.retentionSystemReadiness, "Только readiness", "retention system readiness classification");
    assertIncludes(pages.retentionSystemReadiness, "Нет реальных уведомлений", "retention system no real reminders");
    assertIncludes(pages.retentionSystemReadiness, "Retention readiness ничего не отправляет", "retention system sends nothing");
    assertIncludes(pages.retentionSystemReadiness, "Daily Message", "retention system daily message");
    assertIncludes(pages.retentionSystemReadiness, "Weekly Horoscope", "retention system weekly horoscope");
    assertIncludes(pages.retentionSystemReadiness, "Monthly Horoscope", "retention system monthly horoscope");
    assertIncludes(pages.retentionSystemReadiness, "Saved reports future", "retention system saved reports future");
    assertIncludes(pages.retentionSystemReadiness, "Streak future", "retention system streak future");
    assertIncludes(pages.retentionSystemReadiness, "Reminder future", "retention system reminder future");
    assertIncludes(pages.savedReportsHistoryMockReadiness, "Mock истории сохранённых отчётов", "saved reports mock readiness title");
    assertIncludes(pages.savedReportsHistoryMockReadiness, "Только mock", "saved reports mock readiness classification");
    assertIncludes(pages.savedReportsHistoryMockReadiness, "Нет реального сохранения отчётов", "saved reports mock no real persistence");
    assertIncludes(pages.savedReportsHistoryMockReadiness, "Saved reports mock ничего не сохраняет", "saved reports mock saves nothing");
    assertIncludes(pages.savedReportsHistoryMockReadiness, "love-reading-preview", "saved reports love reading preview");
    assertIncludes(pages.savedReportsHistoryMockReadiness, "full-love-report-future", "saved reports full love future");
    assertIncludes(pages.savedReportsHistoryMockReadiness, "daily-horoscope-snapshot", "saved reports daily snapshot");
    assertIncludes(pages.savedReportsHistoryMockReadiness, "weekly-horoscope-snapshot", "saved reports weekly snapshot");
    assertIncludes(pages.savedReportsHistoryMockReadiness, "monthly-horoscope-snapshot", "saved reports monthly snapshot");
    assertIncludes(pages.returnJourneyCtaReadiness, "Readiness возвратных CTA", "return journey cta readiness title");
    assertIncludes(pages.returnJourneyCtaReadiness, "Только CTA readiness", "return journey cta readiness classification");
    assertIncludes(pages.returnJourneyCtaReadiness, "Нет изменения active CTA", "return journey no active cta change");
    assertIncludes(pages.returnJourneyCtaReadiness, "Return CTA readiness ничего не отправляет", "return journey sends nothing");
    assertIncludes(pages.returnJourneyCtaReadiness, "daily horoscope → Mini App", "return journey daily path");
    assertIncludes(pages.returnJourneyCtaReadiness, "weekly horoscope → weekly module / Mini App", "return journey weekly path");
    assertIncludes(pages.returnJourneyCtaReadiness, "monthly horoscope → monthly module / Mini App", "return journey monthly path");
    assertIncludes(pages.returnJourneyCtaReadiness, "Telegram channel → Love Reading preview", "return journey telegram love path");
    assertIncludes(pages.returnJourneyCtaReadiness, "guard denied → free preview fallback", "return journey guard denied fallback");
    assertIncludes(pages.streakReminderNoopSkeleton, "Noop skeleton streak/reminder", "streak reminder noop title");
    assertIncludes(pages.streakReminderNoopSkeleton, "Только noop", "streak reminder noop classification");
    assertIncludes(pages.streakReminderNoopSkeleton, "Нет реальных напоминаний", "streak reminder no real reminders");
    assertIncludes(pages.streakReminderNoopSkeleton, "Reminder noop ничего не отправляет", "streak reminder sends nothing");
    assertIncludes(pages.streakReminderNoopSkeleton, "daily-message-return", "streak reminder daily type");
    assertIncludes(pages.streakReminderNoopSkeleton, "weekly-horoscope-return", "streak reminder weekly type");
    assertIncludes(pages.streakReminderNoopSkeleton, "monthly-horoscope-return", "streak reminder monthly type");
    assertIncludes(pages.streakReminderNoopSkeleton, "streakPersistedNow", "streak reminder streak flag visible");
    assertIncludes(pages.streakReminderNoopSkeleton, "reminderScheduledNow", "streak reminder schedule flag visible");
    assertIncludes(pages.streakReminderNoopSkeleton, "telegramMessageSentNow", "streak reminder telegram flag visible");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "Retention Mock Dashboard &amp; Safety Suite", "retention mock suite title");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "Только mock/QA", "retention mock suite classification");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "Нет реальных напоминаний", "retention mock suite no real reminders");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "Retention mock dashboard ничего не отправляет", "retention mock suite sends nothing");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "mock retention funnel", "retention mock funnel section");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "daily return loop", "retention mock daily loop");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "weekly return loop", "retention mock weekly loop");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "monthly return loop", "retention mock monthly loop");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "saved report future loop", "retention mock saved report loop");
    assertIncludes(pages.retentionMockDashboardSafetySuite, "streak/reminder future loop", "retention mock streak reminder loop");
    assertIncludes(pages.publicLaunchChecklistRefresh, "Обновлённый checklist публичного запуска", "public launch checklist title");
    assertIncludes(pages.publicLaunchChecklistRefresh, "Только checklist", "public launch checklist classification");
    assertIncludes(pages.publicLaunchChecklistRefresh, "Нет production-запуска", "public launch checklist no production launch");
    assertIncludes(pages.publicLaunchChecklistRefresh, "Launch checklist ничего не запускает", "public launch checklist sends nothing");
    assertIncludes(pages.publicLaunchChecklistRefresh, "BotFather profile", "public launch checklist botfather profile");
    assertIncludes(pages.publicLaunchChecklistRefresh, "Main Mini App button", "public launch checklist main mini app button");
    assertIncludes(pages.publicLaunchChecklistRefresh, "daily/weekly/monthly content", "public launch checklist content cadence");
    assertIncludes(pages.publicLaunchChecklistRefresh, "Love Reading preview", "public launch checklist love preview");
    assertIncludes(pages.publicLaunchChecklistRefresh, "owner review", "public launch checklist owner review");
    assertIncludes(pages.miniappUxSimplificationReview, "Review упрощения Mini App UX", "miniapp ux review title");
    assertIncludes(pages.miniappUxSimplificationReview, "Только UX review", "miniapp ux review classification");
    assertIncludes(pages.miniappUxSimplificationReview, "UX review не меняет live flow", "miniapp ux review live flow boundary");
    assertIncludes(pages.miniappUxSimplificationReview, "Mini App home screen", "miniapp ux home screen");
    assertIncludes(pages.miniappUxSimplificationReview, "Love Reading entry", "miniapp ux love reading");
    assertIncludes(pages.miniappUxSimplificationReview, "CTA hierarchy", "miniapp ux cta hierarchy");
    assertIncludes(pages.miniappUxSimplificationReview, "Telegram WebApp feel", "miniapp ux telegram feel");
    assertIncludes(pages.miniappUxSimplificationReview, "one primary CTA", "miniapp ux one primary cta");
    assertIncludes(pages.miniappUxSimplificationReview, "Telegram safe area", "miniapp ux safe area");
    assertIncludes(pages.visualUiPolishPlan, "План визуального улучшения Aphrodite", "visual polish title");
    assertIncludes(pages.visualUiPolishPlan, "Только UI polish plan", "visual polish classification");
    assertIncludes(pages.visualUiPolishPlan, "UI polish plan не меняет live дизайн", "visual polish live design boundary");
    assertIncludes(pages.visualUiPolishPlan, "simplified visual style", "visual polish simplified style");
    assertIncludes(pages.visualUiPolishPlan, "premium mystical but not overloaded", "visual polish premium mystical");
    assertIncludes(pages.visualUiPolishPlan, "readable cards", "visual polish readable cards");
    assertIncludes(pages.visualUiPolishPlan, "Love Reading result style", "visual polish love result");
    assertIncludes(pages.visualUiPolishPlan, "Telegram WebApp safe area", "visual polish safe area");
    assertIncludes(pages.visualUiPolishPlan, "dark theme consistency", "visual polish dark theme");
    assertIncludes(pages.vipNatalNumerologyVisualReview, "Review визуала VIP / Natal / Numerology", "vip natal numerology visual review title");
    assertIncludes(pages.vipNatalNumerologyVisualReview, "Только visual review", "vip natal numerology visual review classification");
    assertIncludes(pages.vipNatalNumerologyVisualReview, "Visual review не открывает VIP", "vip natal numerology visual review safety label");
    assertIncludes(pages.vipNatalNumerologyVisualReview, "VIP natal chart visual structure", "vip natal visual review area");
    assertIncludes(pages.vipNatalNumerologyVisualReview, "VIP numerology visual structure", "vip numerology visual review area");
    assertIncludes(pages.vipNatalNumerologyVisualReview, "VIP couple calendar visual structure", "vip couple calendar visual review area");
    assertIncludes(pages.vipNatalNumerologyVisualReview, "free preview fallback", "vip free preview fallback review area");
    assertIncludes(pages.horoscopeVisualCards, "Визуальные карточки гороскопов", "horoscope visual cards title");
    assertIncludes(pages.horoscopeVisualCards, "Только UI cards", "horoscope visual cards classification");
    assertIncludes(pages.horoscopeVisualCards, "Horoscope cards не публикуют посты", "horoscope visual cards safety label");
    assertIncludes(pages.horoscopeVisualCards, "Daily horoscope card", "daily horoscope visual card");
    assertIncludes(pages.horoscopeVisualCards, "Weekly horoscope card", "weekly horoscope visual card");
    assertIncludes(pages.horoscopeVisualCards, "Monthly horoscope card", "monthly horoscope visual card");
    assertIncludes(pages.horoscopeVisualCards, "CTA/fallback area", "horoscope cta fallback area");
    assertIncludes(pages.miniappVisualQaConsolidation, "Консолидация visual QA Mini App", "miniapp visual qa consolidation title");
    assertIncludes(pages.miniappVisualQaConsolidation, "Только visual QA", "miniapp visual qa consolidation classification");
    assertIncludes(pages.miniappVisualQaConsolidation, "Visual QA ничего не отправляет", "miniapp visual qa consolidation safety label");
    assertIncludes(pages.miniappVisualQaConsolidation, "/miniapp", "miniapp visual qa route");
    assertIncludes(pages.miniappVisualQaConsolidation, "/miniapp/love-reading-preview", "love reading visual qa route");
    assertIncludes(pages.miniappVisualQaConsolidation, "/birth-matrix", "birth matrix visual qa route");
    assertIncludes(pages.miniappVisualQaConsolidation, "/compatibility", "compatibility visual qa route");
    assertIncludes(pages.miniappVisualQaConsolidation, "compatibility result", "compatibility result coverage");
    assertIncludes(pages.miniappVisualQaConsolidation, "Birth Matrix result", "birth matrix result coverage");
    assertIncludes(pages.miniappVisualQaConsolidation, "Mystic sections", "mystic sections coverage");
    assertIncludes(pages.miniappVisualQaConsolidation, "horoscope visual cards", "horoscope visual cards coverage");
    assertIncludes(pages.miniappVisualQaConsolidation, "date input", "date input coverage");
    assertIncludes(pages.miniappVisualQaConsolidation, "mobile CTA hierarchy", "mobile cta hierarchy coverage");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Public Launch Visual Readiness Review", "visual launch readiness title");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Только visual review", "visual launch readiness classification");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Запуск не выполняется", "launch not performed boundary");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Нужна ручная проверка", "manual review required");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Нет production-запуска", "production launch boundary");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Нет Telegram API", "telegram api boundary");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Нет отправки сообщений", "messages boundary");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Нет изменения BotFather", "botfather boundary");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Нет изменения active CTA", "active cta boundary");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Нет оплаты", "payment boundary");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Нет VIP-разблокировки", "vip boundary");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "Visual readiness review ничего не запускает", "review launches nothing");
    assertIncludes(pages.publicLaunchVisualReadinessReview, "publicLaunchApproved=false", "public launch not approved");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Real Device Visual QA Checklist", "real device visual qa title");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Только manual QA", "real device visual qa classification");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Ничего не запускается", "real device launches nothing classification");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Нет Telegram API", "real device telegram api boundary");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Real device checklist ничего не запускает", "real device sends nothing safety label");
    assertIncludes(pages.realDeviceVisualQaChecklist, "iPhone Telegram WebView", "real device iphone webview");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Android Telegram WebView", "real device android webview");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Telegram Desktop", "real device telegram desktop");
    assertIncludes(pages.realDeviceVisualQaChecklist, "keyboard open state", "real device keyboard state");
    assertIncludes(pages.realDeviceVisualQaChecklist, "back button behavior", "real device back button");
    assertIncludes(pages.realDeviceVisualQaChecklist, "/miniapp/love-reading-preview", "real device love preview");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Evidence Pack 214", "real device evidence pack label");
    assertIncludes(pages.realDeviceVisualQaChecklist, "required real-device evidence pack", "real device evidence pack section");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Telegram WebView check", "real device telegram webview evidence");
    assertIncludes(pages.realDeviceVisualQaChecklist, "startapp/deep link check", "real device startapp evidence");
    assertIncludes(pages.realDeviceVisualQaChecklist, "OWNER REVIEW REQUIRED", "real device owner review required");
    assertIncludes(pages.realDeviceVisualQaChecklist, "Launch remains not approved", "real device launch remains not approved");
    assertIncludes(pages.realDeviceVisualQaChecklist, "daily horoscope card", "real device daily card");
    assertIncludes(pages.realDeviceVisualQaChecklist, "weekly horoscope card", "real device weekly card");
    assertIncludes(pages.realDeviceVisualQaChecklist, "monthly horoscope card", "real device monthly card");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "Диагностика Telegram WebView / startapp", "telegram webview diagnostics title");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "Только диагностика", "telegram webview diagnostics classification");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "BotFather не изменяется", "telegram webview botfather boundary");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "Нет Telegram API", "telegram webview api boundary");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "StartApp diagnostics ничего не меняет", "startapp diagnostics changes nothing");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "default Mini App open", "startapp default");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "love_reading", "startapp love reading");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "compatibility", "startapp compatibility");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "birth_matrix", "startapp birth matrix");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "daily", "startapp daily");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "weekly", "startapp weekly");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "monthly", "startapp monthly");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "Final Diagnostics 215", "telegram final diagnostics label");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "final launch diagnostics", "telegram final diagnostics section");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "Telegram WebView detected", "telegram webview detected diagnostic");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "startapp param missing", "startapp missing diagnostic");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "fallback browser mode", "fallback browser diagnostic");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "cache marker status", "cache marker diagnostic");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "ownerManualReviewRequired", "telegram owner manual review metric");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "Launch not approved", "telegram launch not approved");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "stale Telegram WebView cache", "telegram stale cache");
    assertIncludes(pages.telegramWebviewStartappDiagnostics, "cache-buster query check", "cache buster check");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "Live Version", "live version cache marker title");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "Только readiness", "live version readiness classification");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "Deploy не меняется", "deploy boundary");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "Нет production-запуска", "production launch boundary");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "Нет изменения deploy settings", "deploy settings boundary");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "Version marker readiness ничего не деплоит", "version marker deploy boundary");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, 'data-aphrodite-visual-version="v1-visual-polish"', "dashboard visual version marker");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "source commit marker", "source commit marker");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "live HTML marker", "live html marker");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "route-specific marker", "route specific marker");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "/miniapp marker/check documented", "miniapp marker check");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "/birth-matrix marker/check documented", "birth matrix marker check");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "/compatibility marker/check documented", "compatibility marker check");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "Telegram WebView cache diagnosis", "telegram cache diagnosis");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "browser cache-buster diagnosis", "browser cache buster diagnosis");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "Vercel deployment check notes", "vercel deployment notes");
    assertIncludes(pages.liveVersionCacheMarkerReadiness, "stale build symptoms", "stale build symptoms");
    assertIncludes(pages.visualIssueTriageBoard, "Visual Issue Triage Board", "visual issue triage title");
    assertIncludes(pages.visualIssueTriageBoard, "Только triage board", "visual issue triage classification");
    assertIncludes(pages.visualIssueTriageBoard, "Issues не отправляются", "issues not sent boundary");
    assertIncludes(pages.visualIssueTriageBoard, "Нет внешних интеграций", "no external integrations boundary");
    assertIncludes(pages.visualIssueTriageBoard, "Нет GitHub API", "no github api boundary");
    assertIncludes(pages.visualIssueTriageBoard, "Triage board ничего не отправляет", "triage sends nothing boundary");
    assertIncludes(pages.visualIssueTriageBoard, "Visual issues are separate from production blockers", "visual issues separated from blockers");
    assertIncludes(pages.visualIssueTriageBoard, "layout issue", "layout issue category");
    assertIncludes(pages.visualIssueTriageBoard, "text too long", "text too long category");
    assertIncludes(pages.visualIssueTriageBoard, "unclear CTA", "unclear cta category");
    assertIncludes(pages.visualIssueTriageBoard, "mobile overflow", "mobile overflow category");
    assertIncludes(pages.visualIssueTriageBoard, "Telegram WebView issue", "telegram webview issue category");
    assertIncludes(pages.visualIssueTriageBoard, "date input issue", "date input issue category");
    assertIncludes(pages.visualIssueTriageBoard, "compatibility repeated copy", "compatibility repeated copy category");
    assertIncludes(pages.visualIssueTriageBoard, "visual hierarchy issue", "visual hierarchy issue category");
    assertIncludes(pages.visualIssueTriageBoard, "loading state issue", "loading state issue category");
    assertIncludes(pages.visualIssueTriageBoard, "error state issue", "error state issue category");
    assertIncludes(pages.visualIssueTriageBoard, "route/startapp issue", "route startapp issue category");
    assertIncludes(pages.visualIssueTriageBoard, "cache/deploy issue", "cache deploy issue category");
    assertIncludes(pages.visualIssueTriageBoard, "blocker", "blocker severity");
    assertIncludes(pages.visualIssueTriageBoard, "needs screenshot", "needs screenshot status");
    assertIncludes(pages.visualIssueTriageBoard, "ready for fix", "ready for fix status");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Public Launch Go/No-Go Review", "public launch go no-go title");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Только Go/No-Go review", "go no-go classification");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Запуск не разрешён", "launch not approved boundary");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Нужна ручная проверка", "manual review required boundary");
    assertIncludes(pages.publicLaunchGoNoGoReview, "publicLaunchApproved", "public launch approved metric");
    assertIncludes(pages.publicLaunchGoNoGoReview, "false", "public launch approved false");
    assertIncludes(pages.publicLaunchGoNoGoReview, "ownerManualReviewRequired", "owner review metric");
    assertIncludes(pages.publicLaunchGoNoGoReview, "true", "owner review true");
    assertIncludes(pages.publicLaunchGoNoGoReview, "real device checklist", "real device dependency");
    assertIncludes(pages.publicLaunchGoNoGoReview, "WebView/startapp diagnostics", "startapp dependency");
    assertIncludes(pages.publicLaunchGoNoGoReview, "live version/cache marker", "cache marker dependency");
    assertIncludes(pages.publicLaunchGoNoGoReview, "issue triage board", "issue triage dependency");
    assertIncludes(pages.publicLaunchGoNoGoReview, "support/refund readiness", "support refund dependency");
    assertIncludes(pages.publicLaunchGoNoGoReview, "analytics/privacy readiness", "analytics privacy dependency");
    assertIncludes(pages.publicLaunchGoNoGoReview, "production safety blockers", "production safety blockers");
    assertIncludes(pages.publicLaunchGoNoGoReview, "DATABASE_URL is not configured", "database url blocker");
    assertIncludes(pages.publicLaunchGoNoGoReview, "TELEGRAM_BOT_TOKEN is not configured", "telegram bot token blocker");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Latest backup is older than 24 hours", "backup blocker");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Go/No-Go review ничего не запускает", "go no-go launches nothing");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Launch is not approved", "launch is not approved notice");
    assertIncludes(pages.publicLaunchGoNoGoReview, "manual production blockers", "manual production blockers notice");
    assertIncludes(pages.publicLaunchGoNoGoReview, "not code failure", "production blockers not code failure");
    assertIncludes(pages.publicLaunchGoNoGoReview, "preflightReadinessPackage", "production preflight package metric");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Package 216", "production preflight package number");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Manual production env blocker", "manual env blocker classification");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Manual backup freshness blocker", "manual backup blocker classification");
    assertIncludes(pages.publicLaunchGoNoGoReview, "configure production env manually", "configure env next action");
    assertIncludes(pages.publicLaunchGoNoGoReview, "verify backup freshness manually", "verify backup next action");
    assertIncludes(pages.publicLaunchGoNoGoReview, "run production safety script again", "rerun production safety action");
    assertIncludes(pages.publicLaunchGoNoGoReview, "owner manual review required", "owner review next action");
    assertIncludes(pages.publicLaunchGoNoGoReview, "No automatic secret creation", "no automatic secret creation");
    assertIncludes(pages.publicLaunchGoNoGoReview, "No production DB connection", "no production db connection");
    assertIncludes(pages.publicLaunchGoNoGoReview, "No Telegram API call", "no telegram api call");
    assertIncludes(pages.publicLaunchGoNoGoReview, "No DB write", "no db write");
    assertIncludes(pages.publicLaunchGoNoGoReview, "No automatic launch", "no automatic launch");
    assertIncludes(pages.publicLaunchGoNoGoReview, "public launch freeze / owner go-no-go pack", "public launch freeze owner pack");
    assertIncludes(pages.publicLaunchGoNoGoReview, "freezeOwnerPack", "freeze owner pack metric");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Package 217", "freeze owner pack package number");
    assertIncludes(pages.publicLaunchGoNoGoReview, "FROZEN", "launch frozen status");
    assertIncludes(pages.publicLaunchGoNoGoReview, "launch is frozen until owner approval", "launch frozen until owner approval");
    assertIncludes(pages.publicLaunchGoNoGoReview, "ownerLaunchDecisionState", "owner decision state metric");
    assertIncludes(pages.publicLaunchGoNoGoReview, "NOT READY", "not ready decision state");
    assertIncludes(pages.publicLaunchGoNoGoReview, "READY FOR OWNER REVIEW", "ready for owner review decision state");
    assertIncludes(pages.publicLaunchGoNoGoReview, "BLOCKED BY ENV", "blocked by env decision state");
    assertIncludes(pages.publicLaunchGoNoGoReview, "BLOCKED BY BACKUP", "blocked by backup decision state");
    assertIncludes(pages.publicLaunchGoNoGoReview, "BLOCKED BY VISUAL QA", "blocked by visual qa decision state");
    assertIncludes(pages.publicLaunchGoNoGoReview, "BLOCKED BY TELEGRAM WEBVIEW QA", "blocked by telegram webview decision state");
    assertIncludes(pages.publicLaunchGoNoGoReview, "APPROVAL NOT GRANTED", "approval not granted decision state");
    assertIncludes(pages.publicLaunchGoNoGoReview, "linked launch readiness sections", "linked launch readiness sections");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Real Device Visual QA", "real device visual qa linked section");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Telegram WebView/startapp Diagnostics", "telegram webview linked section");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Live Version/Cache Marker", "live version cache marker linked section");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Visual Issue Triage Board", "visual issue triage linked section");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Production Env/Backup blockers", "production env backup linked section");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Owner Manual Review", "owner manual review linked section");
    assertIncludes(pages.publicLaunchGoNoGoReview, "Safety confirmation", "safety confirmation linked section");
    assertIncludes(pages.publicLaunchGoNoGoReview, "no Telegram API usage", "freeze no telegram api usage");
    assertIncludes(pages.publicLaunchGoNoGoReview, "no messages sent", "freeze no messages sent");
    assertIncludes(pages.publicLaunchGoNoGoReview, "no BotFather changes", "freeze no botfather changes");
    assertIncludes(pages.publicLaunchGoNoGoReview, "no payments", "freeze no payments");
    assertIncludes(pages.publicLaunchGoNoGoReview, "no VIP unlock", "freeze no vip unlock");
    assertIncludes(pages.publicLaunchGoNoGoReview, "no DB writes", "freeze no db writes");
    assertIncludes(pages.publicLaunchGoNoGoReview, "no cron/publish workflow changes", "freeze no cron publish changes");
    assertIncludes(pages.publicLaunchGoNoGoReview, "manual real-device QA", "remaining manual real device qa blocker");
    assertIncludes(pages.publicLaunchGoNoGoReview, "owner approval", "remaining owner approval blocker");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Public Launch Dry-Run Matrix", "public launch dry-run matrix title");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Dry-run only. No production launch was performed.", "dry-run only notice");
    assertIncludes(pages.publicLaunchDryRunMatrix, "No Telegram messages were sent.", "no telegram messages notice");
    assertIncludes(pages.publicLaunchDryRunMatrix, "No Telegram API calls were made.", "no telegram api calls notice");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Owner approval is still required.", "owner approval still required notice");
    assertIncludes(pages.publicLaunchDryRunMatrix, "publicLaunchApproved", "dry-run public launch approved metric");
    assertIncludes(pages.publicLaunchDryRunMatrix, "ownerManualReviewRequired", "dry-run owner review metric");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Production env readiness", "dry-run production env section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "DATABASE_URL readiness", "dry-run database url section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "TELEGRAM_BOT_TOKEN readiness", "dry-run telegram bot token section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Backup freshness readiness", "dry-run backup freshness section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Real-device visual QA", "dry-run real device visual qa section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Telegram WebView/startapp QA", "dry-run telegram webview section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Live version/cache marker", "dry-run live version marker section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Content/CTA inventory", "dry-run content cta inventory section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Public launch freeze", "dry-run public launch freeze section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Owner manual approval", "dry-run owner approval section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "Rollback readiness", "dry-run rollback readiness section");
    assertIncludes(pages.publicLaunchDryRunMatrix, "PASS", "dry-run pass status");
    assertIncludes(pages.publicLaunchDryRunMatrix, "BLOCKED", "dry-run blocked status");
    assertIncludes(pages.publicLaunchDryRunMatrix, "MANUAL", "dry-run manual status");
    assertIncludes(pages.publicLaunchDryRunMatrix, "NOT RUN", "dry-run not run status");
    assertIncludes(pages.publicLaunchDryRunMatrix, "OWNER REQUIRED", "dry-run owner required status");
    assertIncludes(pages.publicLaunchDryRunMatrix, "productionLaunchDone", "dry-run production launch safety flag");
    assertIncludes(pages.publicLaunchDryRunMatrix, "telegramApiUsed", "dry-run telegram api safety flag");
    assertIncludes(pages.publicLaunchDryRunMatrix, "messagesSent", "dry-run messages safety flag");
    assertIncludes(pages.publicLaunchDryRunMatrix, "databaseWriteAdded", "dry-run db write safety flag");
    assertIncludes(pages.publicLaunchDryRunMatrix, "paymentAdded", "dry-run payment safety flag");
    assertIncludes(pages.publicLaunchDryRunMatrix, "vipUnlockAdded", "dry-run vip safety flag");
    assertIncludes(pages.publicLaunchDryRunMatrix, "workflowChanged", "dry-run workflow safety flag");
    assertIncludes(pages.productCopyFinalPolish, "Финальная полировка текстов Aphrodite", "product copy polish title");
    assertIncludes(pages.productCopyFinalPolish, "Только copy polish", "product copy polish classification");
    assertIncludes(pages.productCopyFinalPolish, "Copy polish не включает оплату", "product copy polish no payment");
    assertIncludes(pages.productCopyFinalPolish, "first screen promise", "product copy first screen promise");
    assertIncludes(pages.productCopyFinalPolish, "AI Love Reading", "product copy love reading");
    assertIncludes(pages.productCopyFinalPolish, "Full Love Report teaser", "product copy teaser");
    assertIncludes(pages.productCopyFinalPolish, "no manipulative fear copy", "product copy no fear");
    assertIncludes(pages.productCopyFinalPolish, "no medical/legal/financial advice", "product copy no advice");
    assertIncludes(pages.productCopyFinalPolish, "short mobile-readable text", "product copy mobile readable");
    assertIncludes(pages.manualLaunchSmokeTestMatrix, "Manual Smoke Test Matrix запуска", "manual smoke title");
    assertIncludes(pages.manualLaunchSmokeTestMatrix, "Только manual QA", "manual smoke classification");
    assertIncludes(pages.manualLaunchSmokeTestMatrix, "Manual smoke matrix ничего не запускает", "manual smoke launches nothing");
    assertIncludes(pages.manualLaunchSmokeTestMatrix, "iPhone Telegram Mini App", "manual smoke iphone");
    assertIncludes(pages.manualLaunchSmokeTestMatrix, "Android Telegram Mini App", "manual smoke android");
    assertIncludes(pages.manualLaunchSmokeTestMatrix, "/miniapp/love-reading-preview", "manual smoke love preview");
    assertIncludes(pages.manualLaunchSmokeTestMatrix, "analytics noop", "manual smoke analytics noop");
    assertIncludes(pages.manualLaunchSmokeTestMatrix, "guard denied flow", "manual smoke guard denied");
    assertIncludes(pages.manualLaunchSmokeTestMatrix, "production safety blocked state", "manual smoke production safety blocked");
    assertIncludes(pages.miniappSimplifiedRedesignImplementationPlan, "План внедрения упрощённого дизайна Mini App", "miniapp simplified redesign plan title");
    assertIncludes(pages.miniappSimplifiedRedesignImplementationPlan, "Только implementation plan", "miniapp simplified redesign plan classification");
    assertIncludes(pages.miniappSimplifiedRedesignImplementationPlan, "clear first CTA: AI Love Reading", "miniapp simplified redesign primary cta");
    assertIncludes(pages.miniappSimplifiedRedesignImplementationPlan, "Live UI не изменён", "miniapp simplified redesign live ui unchanged");
    assertIncludes(pages.designTokensUiShell, "Design Tokens &amp; UI Shell Skeleton", "design tokens ui shell title");
    assertIncludes(pages.designTokensUiShell, "UI shell ничего не отправляет", "design tokens ui shell safety label");
    assertIncludes(pages.designTokensUiShell, "spacing scale", "design tokens spacing scale");
    assertIncludes(pages.designTokensUiShell, "data-aphrodite-ui-shell=\"package-197\"", "design tokens shell marker");

    assertIncludes(pages.realImplementationPath, "Real Implementation Path", "real implementation path page title");
    assertIncludes(pages.realImplementationPath, "Selected path", "real implementation selected path classification");
    assertIncludes(pages.realImplementationPath, "Telegram identity first", "real implementation identity-first decision");
    assertIncludes(pages.realImplementationPath, "No payments yet", "real implementation payment boundary");
    assertIncludes(pages.realImplementationPath, "Package 123", "real implementation next package listed");

    assertIncludes(pages.telegramInitDataValidation, "Telegram initData Validation Foundation", "telegram initData validation page title");
    assertIncludes(pages.telegramInitDataValidation, "Validation foundation only", "telegram initData validation classification");
    assertIncludes(pages.telegramInitDataValidation, "No Telegram API call", "telegram initData validation api boundary");
    assertIncludes(pages.telegramInitDataValidation, "No database write", "telegram initData validation database boundary");
    assertIncludes(pages.telegramInitDataValidation, "initDataUnsafe", "telegram initData unsafe warning");

    assertIncludes(pages.userProfileFoundation, "User Profile Database Foundation", "user profile foundation page title");
    assertIncludes(pages.userProfileFoundation, "Profile foundation only", "user profile foundation classification");
    assertIncludes(pages.userProfileFoundation, "No payment", "user profile foundation payment boundary");
    assertIncludes(pages.userProfileFoundation, "No VIP access", "user profile foundation vip boundary");
    assertIncludes(pages.userProfileFoundation, "No Telegram API call", "user profile foundation telegram boundary");

    assertIncludes(pages.productCatalogFoundation, "Product Catalog Foundation", "product catalog foundation page title");
    assertIncludes(pages.productCatalogFoundation, "Product catalog foundation only", "product catalog foundation classification");
    assertIncludes(pages.productCatalogFoundation, "No payment", "product catalog foundation payment boundary");
    assertIncludes(pages.productCatalogFoundation, "No VIP access", "product catalog foundation vip boundary");

    assertIncludes(pages.entitlementFoundation, "Entitlement Model Foundation", "entitlement foundation page title");
    assertIncludes(pages.entitlementFoundation, "Entitlement foundation only", "entitlement foundation classification");
    assertIncludes(pages.entitlementFoundation, "No payment handler", "entitlement foundation payment boundary");
    assertIncludes(pages.entitlementFoundation, "No VIP unlock", "entitlement foundation vip boundary");
    assertIncludes(pages.entitlementFoundation, "No Telegram API call", "entitlement foundation telegram boundary");

    assertIncludes(pages.vipAccessBoundary, "VIP Access Boundary", "vip access boundary page title");
    assertIncludes(pages.vipAccessBoundary, "Access boundary only", "vip access boundary classification");
    assertIncludes(pages.vipAccessBoundary, "No real VIP unlock", "vip access boundary vip boundary");
    assertIncludes(pages.vipAccessBoundary, "No payment handler", "vip access boundary payment boundary");
    assertIncludes(pages.vipAccessBoundary, "No Telegram API call", "vip access boundary telegram boundary");

    assertIncludes(pages.vipCompatibilityReportFoundation, "VIP Compatibility Deep Report Foundation", "vip compatibility report foundation page title");
    assertIncludes(pages.vipCompatibilityReportFoundation, "Content foundation only", "vip compatibility report foundation classification");
    assertIncludes(pages.vipCompatibilityReportFoundation, "No payment", "vip compatibility report payment boundary");
    assertIncludes(pages.vipCompatibilityReportFoundation, "No real VIP unlock", "vip compatibility report vip boundary");
    assertIncludes(pages.vipCompatibilityReportFoundation, "No Telegram API call", "vip compatibility report telegram boundary");

    assertIncludes(pages.vipCompatibilityReport, "VIP Compatibility Deep Report", "vip compatibility report page title");
    assertIncludes(pages.vipCompatibilityReport, "UI preview only", "vip compatibility report preview classification");
    assertIncludes(pages.vipCompatibilityReport, "No payment", "vip compatibility report payment boundary");
    assertIncludes(pages.vipCompatibilityReport, "No real VIP unlock", "vip compatibility report vip boundary");
    assertIncludes(pages.vipCompatibilityReport, "No Telegram API call", "vip compatibility report telegram boundary");

    assertIncludes(pages.vipCompatibilityReportPreview, "VIP Compatibility Report UI Preview", "vip compatibility report preview dashboard title");
    assertIncludes(pages.vipCompatibilityReportPreview, "Preview UI only", "vip compatibility report preview dashboard classification");
    assertIncludes(pages.vipCompatibilityReportPreview, "No route gating", "vip compatibility report route gating boundary");
    assertIncludes(pages.vipCompatibilityReportPreview, "No payment", "vip compatibility report preview payment boundary");

    assertIncludes(pages.telegramStarsPaymentPrototype, "Telegram Stars Payment Prototype Gate", "telegram stars payment prototype page title");
    assertIncludes(pages.telegramStarsPaymentPrototype, "Prototype gate only", "telegram stars payment prototype classification");
    assertIncludes(pages.telegramStarsPaymentPrototype, "No live invoice", "telegram stars live invoice boundary");
    assertIncludes(pages.telegramStarsPaymentPrototype, "No payment handler", "telegram stars payment handler boundary");
    assertIncludes(pages.telegramStarsPaymentPrototype, "No Telegram API call", "telegram stars api boundary");

    assertIncludes(pages.starsPaymentSafetyReview, "Telegram Stars Payment Safety Review", "stars payment safety review page title");
    assertIncludes(pages.starsPaymentSafetyReview, "Safety review only", "stars payment safety review classification");
    assertIncludes(pages.starsPaymentSafetyReview, "No live invoice", "stars payment safety live invoice boundary");
    assertIncludes(pages.starsPaymentSafetyReview, "No Telegram API call", "stars payment safety telegram boundary");
    assertIncludes(pages.starsPaymentSafetyReview, "No successful payment handler", "stars payment safety handler boundary");

    assertIncludes(pages.telegramStarsInvoiceDraft, "Telegram Stars Invoice Draft Builder", "telegram stars invoice draft page title");
    assertIncludes(pages.telegramStarsInvoiceDraft, "Invoice draft only", "telegram stars invoice draft classification");
    assertIncludes(pages.telegramStarsInvoiceDraft, "No live send", "telegram stars invoice draft live send boundary");
    assertIncludes(pages.telegramStarsInvoiceDraft, "No Telegram API call", "telegram stars invoice draft api boundary");
    assertIncludes(pages.telegramStarsInvoiceDraft, "No successful payment handler", "telegram stars invoice draft handler boundary");

    assertIncludes(pages.invoiceDraftSafetyHardening, "Invoice Draft Safety Hardening", "invoice draft safety hardening page title");
    assertIncludes(pages.invoiceDraftSafetyHardening, "sendInvoice Mock API Gateway", "invoice draft safety hardening sendInvoice gateway");
    assertIncludes(pages.invoiceDraftSafetyHardening, "answerPreCheckoutQuery Mock API Gateway", "invoice draft safety hardening answerPreCheckoutQuery gateway");
    assertIncludes(pages.invoiceDraftSafetyHardening, "No live invoice", "invoice draft safety hardening live invoice boundary");
    assertIncludes(pages.invoiceDraftSafetyHardening, "No Telegram API call", "invoice draft safety hardening telegram boundary");

    assertIncludes(pages.aphroditeProductRemediation, "Aphrodite Product Remediation Plan", "aphrodite remediation page title");
    assertIncludes(pages.aphroditeProductRemediation, "Product remediation only", "aphrodite remediation classification");
    assertIncludes(pages.aphroditeProductRemediation, "AI Love Reading", "AI Love Reading listed");
    assertIncludes(pages.aphroditeProductRemediation, "Soulmate Scanner", "Soulmate Scanner listed");
    assertIncludes(pages.aphroditeProductRemediation, "Red Flags Scanner", "Red Flags Scanner listed");
    assertIncludes(pages.aphroditeProductRemediation, "Daily Message From Universe", "Daily Message listed");
    assertIncludes(pages.aphroditeProductRemediation, "AI Future Timeline", "Future Timeline listed");
    assertIncludes(pages.aphroditeProductRemediation, "No payment", "payment boundary");
    assertIncludes(pages.aphroditeProductRemediation, "No real VIP unlock", "vip boundary");

    assertIncludes(pages.firstResultExperience, "First Result Experience Rewrite", "first result experience page title");
    assertIncludes(pages.firstResultExperience, "Experience rewrite only", "first result experience classification");
    assertIncludes(pages.firstResultExperience, "AI Love Reading", "AI Love Reading listed");
    assertIncludes(pages.firstResultExperience, "No payment", "first result payment boundary");
    assertIncludes(pages.firstResultExperience, "No real VIP unlock", "first result vip boundary");
    assertIncludes(pages.firstResultExperience, "No Telegram API call", "first result telegram boundary");

    assertIncludes(pages.aiLoveReadingFoundation, "AI Love Reading Foundation", "AI love reading page title");
    assertIncludes(pages.aiLoveReadingFoundation, "Local foundation only", "AI love reading classification");
    assertIncludes(pages.aiLoveReadingFoundation, "No AI API call", "AI boundary");
    assertIncludes(pages.aiLoveReadingFoundation, "No payment", "payment boundary");
    assertIncludes(pages.aiLoveReadingFoundation, "No real VIP unlock", "vip boundary");
    assertIncludes(pages.aiLoveReadingFoundation, "No Telegram API call", "telegram boundary");

    assertIncludes(pages.soulmateScannerFoundation, "Soulmate Scanner Foundation", "Soulmate scanner page title");
    assertIncludes(pages.soulmateScannerFoundation, "Local foundation only", "Soulmate scanner classification");
    assertIncludes(pages.soulmateScannerFoundation, "No AI API call", "AI boundary");
    assertIncludes(pages.soulmateScannerFoundation, "No payment", "payment boundary");
    assertIncludes(pages.soulmateScannerFoundation, "No real VIP unlock", "vip boundary");
    assertIncludes(pages.soulmateScannerFoundation, "No Telegram API call", "telegram boundary");
    assertIncludes(pages.soulmateScannerFoundation, "No deterministic soulmate claim", "deterministic soulmate boundary");

    assertIncludes(pages.redFlagsScannerFoundation, "Red Flags Scanner Foundation", "Red flags scanner page title");
    assertIncludes(pages.redFlagsScannerFoundation, "Local foundation only", "Red flags scanner classification");
    assertIncludes(pages.redFlagsScannerFoundation, "No AI API call", "AI boundary");
    assertIncludes(pages.redFlagsScannerFoundation, "No payment", "payment boundary");
    assertIncludes(pages.redFlagsScannerFoundation, "No real VIP unlock", "vip boundary");
    assertIncludes(pages.redFlagsScannerFoundation, "No Telegram API call", "telegram boundary");
    assertIncludes(pages.redFlagsScannerFoundation, "No abuse accusation", "abuse accusation boundary");
    assertIncludes(pages.redFlagsScannerFoundation, "No mental health diagnosis", "mental health boundary");
    assertIncludes(pages.redFlagsScannerFoundation, "No deterministic red flag claim", "deterministic red flag boundary");

    assertIncludes(pages.aiFutureTimelineFoundation, "AI Future Timeline Foundation", "AI future timeline page title");
    assertIncludes(pages.aiFutureTimelineFoundation, "Local foundation only", "AI future timeline classification");
    assertIncludes(pages.aiFutureTimelineFoundation, "No AI API call", "AI boundary");
    assertIncludes(pages.aiFutureTimelineFoundation, "No payment", "payment boundary");
    assertIncludes(pages.aiFutureTimelineFoundation, "No real VIP unlock", "vip boundary");
    assertIncludes(pages.aiFutureTimelineFoundation, "No Telegram API call", "telegram boundary");
    assertIncludes(pages.aiFutureTimelineFoundation, "No deterministic future claim", "deterministic future boundary");
    assertIncludes(pages.aiFutureTimelineFoundation, "No exact date prediction", "exact date boundary");
    assertIncludes(pages.aiFutureTimelineFoundation, "No financial advice", "financial advice boundary");
    assertIncludes(pages.aiFutureTimelineFoundation, "No medical/legal advice", "medical/legal boundary");

    assertIncludes(pages.socialTrafficLayer, "Social Traffic Layer Architecture", "social traffic layer page title");
    assertIncludes(pages.socialTrafficLayer, "Architecture only", "social traffic layer classification");
    assertIncludes(pages.socialTrafficLayer, "No auto-posting", "social auto-posting boundary");
    assertIncludes(pages.socialTrafficLayer, "No Instagram API call", "instagram boundary");
    assertIncludes(pages.socialTrafficLayer, "No TikTok API call", "tiktok boundary");
    assertIncludes(pages.socialTrafficLayer, "No YouTube API call", "youtube boundary");
    assertIncludes(pages.socialTrafficLayer, "No Telegram API call", "telegram boundary");
    assertIncludes(pages.socialTrafficLayer, "No scraping", "scraping boundary");
    assertIncludes(pages.socialTrafficLayer, "No account credentials", "credentials boundary");
    assertIncludes(pages.socialTrafficLayer, "No copied competitor content", "copying boundary");
    assertIncludes(pages.socialTrafficLayer, "No active payment CTA", "payment CTA boundary");

    assertIncludes(pages.socialContentTemplateEngine, "Social Content Template Engine", "social content template engine page title");
    assertIncludes(pages.socialContentTemplateEngine, "Template engine only", "social content template engine classification");
    assertIncludes(pages.socialContentTemplateEngine, "No auto-posting", "social content auto-posting boundary");
    assertIncludes(pages.socialContentTemplateEngine, "No Instagram API call", "instagram boundary");
    assertIncludes(pages.socialContentTemplateEngine, "No TikTok API call", "tiktok boundary");
    assertIncludes(pages.socialContentTemplateEngine, "No YouTube API call", "youtube boundary");
    assertIncludes(pages.socialContentTemplateEngine, "No Telegram API call", "telegram boundary");
    assertIncludes(pages.socialContentTemplateEngine, "No scraping", "scraping boundary");
    assertIncludes(pages.socialContentTemplateEngine, "No account credentials", "credentials boundary");
    assertIncludes(pages.socialContentTemplateEngine, "No copied competitor content", "copying boundary");
    assertIncludes(pages.socialContentTemplateEngine, "No active payment CTA", "payment CTA boundary");

    assertIncludes(pages.socialDraftReviewQueue, "Social Draft Review Queue", "social draft review queue page title");
    assertIncludes(pages.socialDraftReviewQueue, "Review queue only", "social draft review queue classification");
    assertIncludes(pages.socialDraftReviewQueue, "Manual export", "manual export classification");
    assertIncludes(pages.socialDraftReviewQueue, "No auto-posting", "social draft auto-posting boundary");
    assertIncludes(pages.socialDraftReviewQueue, "No Instagram API call", "instagram boundary");
    assertIncludes(pages.socialDraftReviewQueue, "No TikTok API call", "tiktok boundary");
    assertIncludes(pages.socialDraftReviewQueue, "No YouTube API call", "youtube boundary");
    assertIncludes(pages.socialDraftReviewQueue, "No Telegram API call", "telegram boundary");
    assertIncludes(pages.socialDraftReviewQueue, "No scraping", "scraping boundary");
    assertIncludes(pages.socialDraftReviewQueue, "No account credentials", "credentials boundary");
    assertIncludes(pages.socialDraftReviewQueue, "No copied competitor content", "copying boundary");
    assertIncludes(pages.socialDraftReviewQueue, "No active payment CTA", "payment CTA boundary");
    assertIncludes(pages.socialDraftReviewQueue, "No database write", "database boundary");

    assertIncludes(pages.socialExportDashboard, "Social Export Dashboard", "social export dashboard page title");
    assertIncludes(pages.socialExportDashboard, "Manual export only", "social export dashboard classification");
    assertIncludes(pages.socialExportDashboard, "No auto-posting", "social export auto-posting boundary");
    assertIncludes(pages.socialExportDashboard, "No Instagram API call", "instagram boundary");
    assertIncludes(pages.socialExportDashboard, "No TikTok API call", "tiktok boundary");
    assertIncludes(pages.socialExportDashboard, "No YouTube API call", "youtube boundary");
    assertIncludes(pages.socialExportDashboard, "No Telegram API call", "telegram boundary");
    assertIncludes(pages.socialExportDashboard, "No scraping", "scraping boundary");
    assertIncludes(pages.socialExportDashboard, "No account credentials", "credentials boundary");
    assertIncludes(pages.socialExportDashboard, "No database write", "database boundary");
    assertIncludes(pages.socialExportDashboard, "No active payment CTA", "payment CTA boundary");

    assertIncludes(pages.socialContentCalendar, "Social Content Calendar", "social content calendar page title");
    assertIncludes(pages.socialContentCalendar, "Planning only", "social content calendar classification");
    assertIncludes(pages.socialContentCalendar, "Manual review", "manual review classification");
    assertIncludes(pages.socialContentCalendar, "No auto-posting", "auto-posting boundary");
    assertIncludes(pages.socialContentCalendar, "No auto-scheduling", "auto-scheduling boundary");
    assertIncludes(pages.socialContentCalendar, "No Instagram API call", "instagram boundary");
    assertIncludes(pages.socialContentCalendar, "No TikTok API call", "tiktok boundary");
    assertIncludes(pages.socialContentCalendar, "No YouTube API call", "youtube boundary");
    assertIncludes(pages.socialContentCalendar, "No Telegram API call", "telegram boundary");
    assertIncludes(pages.socialContentCalendar, "No scraping", "scraping boundary");
    assertIncludes(pages.socialContentCalendar, "No account credentials", "credentials boundary");
    assertIncludes(pages.socialContentCalendar, "No database write", "database boundary");
    assertIncludes(pages.socialContentCalendar, "No active payment CTA", "payment CTA boundary");

    assertIncludes(pages.publicBotProfileLaunchPackaging, "Public Bot Profile / Main Mini App Launch Packaging", "public bot launch page title");
    assertIncludes(pages.publicBotProfileLaunchPackaging, "Launch packaging only", "public bot launch classification");
    assertIncludes(pages.publicBotProfileLaunchPackaging, "Manual setup", "manual setup classification");
    assertIncludes(pages.publicBotProfileLaunchPackaging, "No Telegram API call", "telegram boundary");
    assertIncludes(pages.publicBotProfileLaunchPackaging, "No BotFather mutation", "botfather boundary");
    assertIncludes(pages.publicBotProfileLaunchPackaging, "No production launch", "production launch boundary");
    assertIncludes(pages.publicBotProfileLaunchPackaging, "No database write", "database boundary");
    assertIncludes(pages.publicBotProfileLaunchPackaging, "No account credentials", "credentials boundary");
    assertIncludes(pages.publicBotProfileLaunchPackaging, "No active payment CTA", "payment CTA boundary");
    assertIncludes(pages.publicBotProfileLaunchPackaging, "No real VIP unlock", "vip boundary");

    assertIncludes(pages.paywallReadiness, "Подготовка paywall и VIP-оффера", "paywall readiness page title");
    assertIncludes(pages.paywallReadiness, "Только подготовка оффера", "paywall readiness classification");
    assertIncludes(pages.paywallReadiness, "Нет оплаты", "payment boundary");
    assertIncludes(pages.paywallReadiness, "Нет реальной VIP-разблокировки", "vip boundary");
    assertIncludes(pages.paywallReadiness, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.paywallReadiness, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.paywallReadiness, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.paywallReadiness, "Нет активной платёжной CTA", "payment CTA boundary");
    assertIncludes(pages.paywallReadiness, 'data-boundary="no-payment"', "no-payment data boundary");
    assertIncludes(pages.paywallReadiness, 'href="/miniapp/love-reading-preview"', "love reading preview link");
    assertIncludes(pages.entitlementEnforcementDesign, "Дизайн проверки VIP-доступа", "entitlement design page title");
    assertIncludes(pages.entitlementEnforcementDesign, "Только дизайн доступа", "entitlement design classification");
    assertIncludes(pages.entitlementEnforcementDesign, "Нет реальной VIP-разблокировки", "vip unlock boundary");
    assertIncludes(pages.entitlementEnforcementDesign, "Нет оплаты", "payment boundary");
    assertIncludes(pages.entitlementEnforcementDesign, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.entitlementEnforcementDesign, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.entitlementEnforcementDesign, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.entitlementEnforcementDesign, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.entitlementEnforcementDesign, "Нет клиентской VIP-разблокировки", "client unlock boundary");
    assertIncludes(pages.entitlementEnforcementDesign, 'data-boundary="no-client-vip-unlock"', "client unlock data boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "План внедрения границы VIP-доступа", "vip boundary implementation plan title");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "Только план внедрения", "vip boundary implementation plan classification");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "Нет реальной VIP-разблокировки", "vip unlock boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "Нет оплаты", "payment boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "Нет миграции схемы базы данных", "db schema boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, 'data-boundary="implementation-plan-only"', "implementation plan data boundary");
    assertIncludes(pages.vipAccessBoundaryImplementationPlan, "VIP Couple Calendar", "vip couple calendar target");
    assertIncludes(pages.vipAccessGuardSkeleton, "Skeleton проверки VIP-доступа", "заголовок skeleton проверки VIP-доступа");
    assertIncludes(pages.vipAccessGuardSkeleton, "Доступ всегда закрыт", "классификация deny-by-default");
    assertIncludes(pages.vipAccessGuardSkeleton, "Нет реальной VIP-разблокировки", "граница VIP-разблокировки");
    assertIncludes(pages.vipAccessGuardSkeleton, "Нет оплаты", "граница оплаты");
    assertIncludes(pages.vipAccessGuardSkeleton, "Нет Telegram Stars invoice", "граница Telegram Stars invoice");
    assertIncludes(pages.vipAccessGuardSkeleton, "Нет successful_payment handler", "граница successful_payment");
    assertIncludes(pages.vipAccessGuardSkeleton, "Нет entitlement creation", "граница entitlement creation");
    assertIncludes(pages.vipAccessGuardSkeleton, "Нет записи в базу данных", "граница базы данных");
    assertIncludes(pages.vipAccessGuardSkeleton, "Нет миграции схемы базы данных", "граница схемы базы данных");
    assertIncludes(pages.vipAccessGuardSkeleton, "Нет вызова Telegram API", "граница Telegram API");
    assertIncludes(pages.vipAccessGuardSkeleton, "allowed=false", "результат deny-by-default guard");
    assertIncludes(pages.vipAccessGuardSkeleton, 'data-boundary="guard-always-denies"', "data-boundary deny-by-default");
    assertIncludes(pages.vipAccessGuardSkeleton, "/miniapp/love-reading-preview", "fallback route бесплатного preview");
    assertIncludes(pages.vipGuardIntegrationReview, "Review интеграции VIP-guard", "заголовок review интеграции VIP-guard");
    assertIncludes(pages.vipGuardIntegrationReview, "Только review интеграции", "классификация review интеграции");
    assertIncludes(pages.vipGuardIntegrationReview, "Guard не подключён к production", "граница guard не подключён к production");
    assertIncludes(pages.vipGuardIntegrationReview, "Нет реальной VIP-разблокировки", "граница VIP-разблокировки");
    assertIncludes(pages.vipGuardIntegrationReview, "Нет оплаты", "граница оплаты");
    assertIncludes(pages.vipGuardIntegrationReview, "Нет Telegram Stars invoice", "граница Telegram Stars invoice");
    assertIncludes(pages.vipGuardIntegrationReview, "Нет successful_payment handler", "граница successful_payment");
    assertIncludes(pages.vipGuardIntegrationReview, "Нет entitlement creation", "граница entitlement creation");
    assertIncludes(pages.vipGuardIntegrationReview, "Нет записи в базу данных", "граница базы данных");
    assertIncludes(pages.vipGuardIntegrationReview, "Нет вызова Telegram API", "граница Telegram API");
    assertIncludes(pages.vipGuardIntegrationReview, "allowed=false", "результат deny-by-default guard review");
    assertIncludes(pages.vipGuardIntegrationReview, "/miniapp/love-reading-preview", "fallback route review");
    assertIncludes(pages.vipFreePreviewFallbackMap, "Карта fallback для VIP-разделов", "vip fallback map title");
    assertIncludes(pages.vipFreePreviewFallbackMap, "Только карта fallback", "vip fallback map classification");
    assertIncludes(pages.vipFreePreviewFallbackMap, "VIP не открывается", "vip not unlocked boundary");
    assertIncludes(pages.vipFreePreviewFallbackMap, "Нет реальной VIP-разблокировки", "vip unlock boundary");
    assertIncludes(pages.vipFreePreviewFallbackMap, "Нет оплаты", "payment boundary");
    assertIncludes(pages.vipFreePreviewFallbackMap, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.vipFreePreviewFallbackMap, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.vipFreePreviewFallbackMap, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.vipFreePreviewFallbackMap, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.vipFreePreviewFallbackMap, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.productCatalogFinalization, "Финальный каталог продуктов Aphrodite", "product catalog title");
    assertIncludes(pages.productCatalogFinalization, "Только каталог продуктов", "product catalog classification");
    assertIncludes(pages.productCatalogFinalization, "VIP не открывается", "vip not unlocked boundary");
    assertIncludes(pages.productCatalogFinalization, "Каталог не открывает VIP", "catalog no unlock boundary");
    assertIncludes(pages.productCatalogFinalization, "Нет реальной VIP-разблокировки", "vip unlock boundary");
    assertIncludes(pages.productCatalogFinalization, "Нет оплаты", "payment boundary");
    assertIncludes(pages.productCatalogFinalization, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.productCatalogFinalization, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.productCatalogFinalization, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.productCatalogFinalization, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.productCatalogFinalization, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.paymentLedgerDesign, "Дизайн payment ledger", "payment ledger design title");
    assertIncludes(pages.paymentLedgerDesign, "Только дизайн ledger", "payment ledger design classification");
    assertIncludes(pages.paymentLedgerDesign, "Payment ledger требуется перед entitlement", "ledger before entitlement rule");
    assertIncludes(pages.paymentLedgerDesign, "Нет реальной оплаты", "real payment boundary");
    assertIncludes(pages.paymentLedgerDesign, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.paymentLedgerDesign, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.paymentLedgerDesign, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.paymentLedgerDesign, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.paymentLedgerDesign, "Нет миграции схемы базы данных", "database schema boundary");
    assertIncludes(pages.paymentLedgerDesign, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.paymentLedgerDesign, "Ledger ничего не записывает", "ledger writes nothing boundary");
    assertIncludes(pages.paymentLedgerDesign, 'data-boundary="ledger-writes-nothing"', "ledger writes nothing data boundary");
    assertIncludes(pages.entitlementStorageDesign, "Дизайн хранения VIP-доступа", "entitlement storage title");
    assertIncludes(pages.entitlementStorageDesign, "Только дизайн хранения", "entitlement storage classification");
    assertIncludes(pages.entitlementStorageDesign, "Entitlement не создаётся", "entitlement not created boundary");
    assertIncludes(pages.entitlementStorageDesign, "Нет реальной VIP-разблокировки", "vip unlock boundary");
    assertIncludes(pages.entitlementStorageDesign, "Нет оплаты", "payment boundary");
    assertIncludes(pages.entitlementStorageDesign, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.entitlementStorageDesign, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.entitlementStorageDesign, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.entitlementStorageDesign, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.entitlementStorageDesign, "Нет миграции схемы базы данных", "database schema boundary");
    assertIncludes(pages.entitlementStorageDesign, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.entitlementStorageDesign, 'data-boundary="entitlement-not-created"', "entitlement not created data boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, "Skeleton схемы entitlement", "entitlement schema skeleton title");
    assertIncludes(pages.entitlementSchemaSkeleton, "Только TypeScript skeleton", "entitlement schema skeleton classification");
    assertIncludes(pages.entitlementSchemaSkeleton, "grantsAccessNow=false", "schema skeleton grants no access result");
    assertIncludes(pages.entitlementSchemaSkeleton, "Schema skeleton не выдаёт доступ", "schema skeleton no access boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, "Нет реальной VIP-разблокировки", "vip unlock boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, "Нет оплаты", "payment boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, "Нет миграции схемы базы данных", "database schema boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.entitlementSchemaSkeleton, 'data-boundary="schema-skeleton-grants-no-access"', "schema skeleton no access data boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Skeleton server-side проверки entitlement", "server entitlement skeleton title");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Server-side skeleton", "server entitlement skeleton classification");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "allowed=false", "server entitlement skeleton always denies");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "/miniapp/love-reading-preview", "server entitlement fallback route");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Server check skeleton всегда возвращает allowed=false", "server entitlement no access boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Нет реальной VIP-разблокировки", "vip unlock boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Нет оплаты", "payment boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Нет миграции схемы базы данных", "database schema boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.serverEntitlementCheckSkeleton, 'data-boundary="server-check-always-denies"', "server entitlement deny data boundary");
    assertIncludes(pages.vipAccessSecuritySuite, "Security QA для VIP-доступа", "vip access security suite title");
    assertIncludes(pages.vipAccessSecuritySuite, "Только QA безопасности", "vip access security suite classification");
    assertIncludes(pages.vipAccessSecuritySuite, "QA suite ничего не открывает", "vip access security suite opens nothing boundary");
    assertIncludes(pages.vipAccessSecuritySuite, "No VIP from localStorage", "localStorage security gate");
    assertIncludes(pages.vipAccessSecuritySuite, "No VIP from query param", "query security gate");
    assertIncludes(pages.vipAccessSecuritySuite, "No VIP from mock payment success", "payment mock security gate");
    assertIncludes(pages.vipAccessSecuritySuite, "No VIP from fake entitlement record", "fake entitlement security gate");
    assertIncludes(pages.vipAccessSecuritySuite, "Guard skeleton allowed=false", "guard skeleton deny gate");
    assertIncludes(pages.vipAccessSecuritySuite, "Server entitlement skeleton allowed=false", "server skeleton deny gate");
    assertIncludes(pages.vipAccessSecuritySuite, "Нет реальной VIP-разблокировки", "vip unlock boundary");
    assertIncludes(pages.vipAccessSecuritySuite, "Нет оплаты", "payment boundary");
    assertIncludes(pages.vipAccessSecuritySuite, "Нет Telegram Stars invoice", "stars invoice boundary");
    assertIncludes(pages.vipAccessSecuritySuite, "Нет successful_payment handler", "successful payment boundary");
    assertIncludes(pages.vipAccessSecuritySuite, "Нет entitlement creation", "entitlement creation boundary");
    assertIncludes(pages.vipAccessSecuritySuite, "Нет записи в базу данных", "database boundary");
    assertIncludes(pages.vipAccessSecuritySuite, "Нет миграции схемы базы данных", "database schema boundary");
    assertIncludes(pages.vipAccessSecuritySuite, "Нет вызова Telegram API", "telegram boundary");
    assertIncludes(pages.vipAccessSecuritySuite, 'data-boundary="qa-suite-opens-nothing"', "suite opens nothing data boundary");

    assertIncludes(pages.launch, 'data-qa="launch-decision-matrix"', "decision matrix visible");
    assertIncludes(pages.launch, 'data-qa="launch-cross-links"', "launch cross links visible");
    assertIncludes(pages.launch, 'href="/dashboard/networks/zodiac/analytics"', "analytics link visible on launch");
    assertIncludes(pages.launch, 'href="/dashboard/networks/zodiac/feedback"', "feedback link visible on launch");
    assertIncludes(pages.launch, 'href="/dashboard/networks/zodiac/security"', "security link visible on launch");
    assertIncludes(pages.launch, 'href="/dashboard/networks/zodiac/publishing"', "publishing link visible on launch");
    assertNotIncludes(pages.launch, "zodiac:publish-date:live", "no live publish button on launch");

    assertIncludes(pages.softLaunch, "Soft Launch Зодиака", "soft launch heading");
    assertIncludes(pages.softLaunch, "13", "soft launch 13 channels");
    assertIncludes(pages.softLaunch, "День 7", "soft launch day 7 preview");
    assertIncludes(pages.softLaunch, "npm run zodiac:publish:date:dry", "soft launch dry-run command");
    assertIncludes(pages.softLaunch, "Live-публикация отключена", "soft launch safety 1");
    assertIncludes(pages.softLaunch, "Telegram API не вызывается из этой страницы", "soft launch safety 2");
    assertIncludes(pages.softLaunch, "Общий гороскоп", "soft launch channel check 1");
    assertIncludes(pages.softLaunch, "Овен", "soft launch channel check 2");
    assertNotIncludes(pages.softLaunch, "/api/zodiac/publish", "no live publish api");

    assertIncludes(pages.operations, "Операции и безопасность Zodiac", "operations page heading");
    assertIncludes(pages.operations, "Daily autopublish", "daily autopublish status");
    assertIncludes(pages.operations, "Weekly live", "weekly live status");
    assertIncludes(pages.operations, "first 5 users GO", "first users GO status");
    assertIncludes(pages.operations, "Mass launch", "mass launch status");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/feedback"', "operations feedback route link");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/publishing"', "operations publishing route link");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/content"', "operations content route link");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/security"', "operations security route link");

    assertIncludes(pages.priority, "Зодиак — приоритет запуска", "priority page heading");
    assertIncludes(pages.priority, "13", "priority page channels target");
    assertIncludes(pages.priority, "Package 91", "priority page next step");
    assertIncludes(pages.priority, "Ежедневная система уже настроена", "priority page next step caption");
    assertIncludes(pages.priority, "Live-публикация отключена", "priority page safety live publishing");
    assertIncludes(pages.priority, "Telegram API не вызывается", "priority page safety api");
    assertIncludes(pages.priority, "Конфиг 13 каналов", "priority page profiles link");
    assertIncludes(pages.priority, "Ежедневная система", "priority page daily system link");
    assertNotIncludes(pages.priority, "/api/zodiac/priority", "priority page no server write API route");

    assertIncludes(pages.dailySystem, "Ежедневная система Зодиака", "daily system page heading");
    assertIncludes(pages.dailySystem, "Ежедневная логика", "daily system logic KPI");
    assertIncludes(pages.dailySystem, "Dry-run", "daily system dry-run KPI");
    assertIncludes(pages.dailySystem, "Не пересоздавать посты с нуля", "daily system safety rule");
    assertIncludes(pages.dailySystem, "Карта существующей системы", "daily system map section");

    // Profile checks
    assertIncludes(pages.profiles, "Контентные профили Зодиака", "profiles page heading");
    assertIncludes(pages.profiles, "Каналов", "profiles channels KPI label");
    assertIncludes(pages.profiles, "13", "profiles channels KPI value");
    assertIncludes(pages.profiles, "Общий гороскоп", "general sign profile");
    assertIncludes(pages.profiles, "Овен", "aries profile");
    assertIncludes(pages.profiles, "Рыбы", "pisces profile");
    assertIncludes(pages.profiles, "Live-публикация отключена", "safety: live publish");
    assertIncludes(pages.profiles, "Telegram API не вызывается", "safety: API");
    assertIncludes(pages.profiles, "Контент готовится только для dry-run", "safety: dry-run");
    assertNotIncludes(pages.profiles, "/api/zodiac/profiles", "no server write on profiles");

    assertIncludes(pages.security, "Безопасность платформы", "security page heading");
    assertIncludes(pages.security, "Управление модулем Зодиак внутри Афродиты.", "security subtitle");
    assertIncludes(pages.security, "Платформа / Афродита", "security breadcrumb");
    assertIncludes(pages.security, 'data-qa="admin-safety-status-cards"', "security status cards");
    assertIncludes(pages.security, "Live publish", "live publish status label");
    assertIncludes(pages.security, "запрещён", "live publish blocked value");
    assertIncludes(pages.security, "Weekly live", "weekly live off card");
    assertIncludes(pages.security, "Payments/Stars", "payments off card");
    assertIncludes(pages.security, "Profile sync", "profile sync off card");
    assertIncludes(pages.security, "symbolic only / exact_unavailable", "exact astro unavailable card");
    assertIncludes(pages.security, "Ledger", "ledger protected card");
    assertIncludes(pages.security, "Dry-run API calls", "dry-run API calls card");
    assertIncludes(pages.security, "0 expected", "dry-run API calls expected value");
    assertIncludes(pages.security, "Redis analytics", "Redis analytics card");
    assertIncludes(pages.security, "active in production", "Redis analytics active value");
    assertIncludes(pages.security, "Mass launch", "mass launch card");
    assertIncludes(pages.security, "STOP", "mass launch stop value");
    assertIncludes(pages.security, 'data-qa="dashboard-auth-status-cards"', "dashboard auth status cards");
    assertIncludes(pages.security, "Dashboard Auth", "dashboard auth section heading");
    assertIncludes(pages.security, "Dashboard auth", "dashboard auth status card");
    assertIncludes(pages.security, "Auth configured", "dashboard auth configured card");
    assertIncludes(pages.security, "Session cookie", "dashboard auth session cookie card");
    assertIncludes(pages.security, "local browser only", "dashboard auth local browser cookie label");
    assertIncludes(pages.security, "Server write API", "dashboard auth server write API card");
    assertIncludes(pages.security, "Roles", "dashboard auth roles card");
    assertIncludes(pages.security, "Auth disabled: acceptable for local development, not recommended before wider production access.", "dashboard auth disabled warning");
    assertIncludes(pages.security, 'data-qa="approval-matrix"', "approval matrix");
    assertIncludes(pages.security, "Daily dry-run", "approval daily dry-run row");
    assertIncludes(pages.security, "Daily live publish", "approval daily live row");
    assertIncludes(pages.security, "explicit owner approval", "owner approval requirement");
    assertIncludes(pages.security, "product + legal + technical approval", "payments approval requirement");
    assertIncludes(pages.security, "privacy approval", "profile sync approval requirement");
    assertIncludes(pages.security, "provider + accuracy approval", "exact astro approval requirement");
    assertIncludes(pages.security, "local draft only", "draft-only UI policy");
    assertIncludes(pages.security, "no UI button", "no live UI button policy");
    assertIncludes(pages.security, 'data-qa="local-admin-audit-log"', "local admin audit log");
    assertIncludes(pages.security, "Локальный журнал, не серверная база", "local audit log label");
    assertIncludes(pages.security, "Export/copy sanitized audit log", "audit log export/copy button");
    assertIncludes(pages.security, "Clear local audit log", "audit log clear button");
    assertIncludes(pages.security, 'data-qa="audit-empty-state"', "audit log empty state");
    assertIncludes(pages.security, 'data-qa="admin-safety-checklist"', "admin safety checklist");
    assertIncludes(pages.security, "Перед 20 пользователями", "before 20 checklist heading");
    assertIncludes(pages.security, "first 5 users tested", "first 5 checklist item");
    assertIncludes(pages.security, "dry-run API calls 0", "dry-run API calls checklist item");
    assertIncludes(pages.security, "ledger writes 0 in dry-run", "dry-run ledger checklist item");
    assertIncludes(pages.security, "weekly live OFF", "weekly live checklist item");
    assertIncludes(pages.security, "payments OFF", "payments checklist item");
    assertIncludes(pages.security, "profile sync OFF", "profile sync checklist item");
    assertIncludes(pages.security, 'data-qa="roles-auth-readiness"', "roles/auth readiness section");
    assertIncludes(pages.security, "Будущие роли", "future roles heading");
    assertIncludes(pages.security, "Owner", "owner role");
    assertIncludes(pages.security, "Admin", "admin role");
    assertIncludes(pages.security, "Editor", "editor role");
    assertIncludes(pages.security, "Viewer", "viewer role");
    assertIncludes(pages.security, "Сейчас server write API intentionally disabled. Перед включением write-действий нужен authenticated admin backend, audit log and role checks.", "server write API disabled warning");
    assertIncludes(pages.security, 'data-qa="admin-safety-no-server-write-api"', "no server write API readiness block");
    assertIncludes(pages.security, 'href="/dashboard/networks/zodiac/content"', "security content route link");
    assertNotIncludes(pages.security, "zodiac:publish-date:live", "live publish command on security page");
    assertNotIncludes(pages.security, "zodiac:weekly:publish", "weekly live command on security page");
    assertNotIncludes(pages.security, "/api/zodiac/admin-safety", "admin safety server write API route");
    assertNotIncludes(pages.security, "/api/zodiac/security", "security server write API route");

    assertIncludes(pages.settings, "Настройки Зодиака", "settings page heading");
    assertIncludes(pages.settings, "Настройки", "sidebar has Настройки");
    assertIncludes(pages.settings, 'data-qa="settings-env-cards"', "env status cards visible");
    assertIncludes(pages.settings, 'data-qa="settings-entry-points"', "production entry points visible");
    assertIncludes(pages.settings, 'data-qa="settings-vercel-env"', "vercel env checklist visible");
    assertIncludes(pages.settings, 'data-qa="settings-mode-matrix"', "mode matrix visible");
    assertIncludes(pages.settings, 'data-qa="settings-manual-actions"', "manual actions panel visible");
    assertNotIncludes(pages.settings, "zodiac:publish-date:live", "no live publish button on settings");
    assertNotIncludes(pages.settings, "/api/zodiac/settings", "no server write API required on settings");

    assertIncludes(pages.docs, "Документы Зодиака", "docs page heading");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-admin-safety.md", "admin safety doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-dashboard-auth.md", "dashboard auth doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-content-engine.md", "content engine doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-management-console.md", "management console doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-publishing-center.md", "publishing center doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-feedback-center.md", "feedback center doc path");

    assertIncludes(pages.aphroditeChannels, "Реестр Каналов Афродиты", "aphrodite registry heading");
    assertIncludes(pages.aphroditeChannels, "Всего каналов в реестре", "aphrodite registry total channels");
    assertIncludes(pages.aphroditeChannels, "Старая сеть 15 каналов", "aphrodite registry paused legacy");
    assertIncludes(pages.aphroditeChannels, "Каналов в черновиках", "aphrodite registry draft new");
    assertIncludes(pages.aphroditeChannels, "Валюты", "aphrodite module Валюты");
    assertIncludes(pages.aphroditeChannels, "Крипта", "aphrodite module Крипта");
    assertIncludes(pages.aphroditeChannels, "Металлы", "aphrodite module Металлы");
    assertNotIncludes(pages.aphroditeChannels, "/api/aphrodite/settings", "no server write API required on aphrodite registry");

    assertIncludes(pages.aphroditeChannels, "Ідеї для бізнесу", "real channel name 1");
    assertIncludes(pages.aphroditeChannels, "Мужской стиль и вещи", "real channel name 2");
    assertIncludes(pages.aphroditeChannels, "Техника для дома", "real channel name 3");
    assertIncludes(pages.aphroditeChannels, "Україна: можливості та ринок", "real channel name 4");
    assertIncludes(pages.aphroditeChannels, "Деньги и возможности", "real channel name 5");
    assertIncludes(pages.aphroditeChannels, "AI и технологии", "real channel name 6");
    assertIncludes(pages.aphroditeChannels, "Личный прогресс", "real channel name 7");
    assertIncludes(pages.aphroditeChannels, "Авто и комфорт", "real channel name 8");
    assertIncludes(pages.aphroditeChannels, "Дніпро / Город Днепр", "real channel name 9");
    assertIncludes(pages.aphroditeChannels, "Рыбалка и отдых", "real channel name 10");
    assertIncludes(pages.aphroditeChannels, "Инвестиции в недвижимость", "real channel name 11");
    assertIncludes(pages.aphroditeChannels, "Земля и дома / Земля та будинки", "real channel name 12");
    assertIncludes(pages.aphroditeChannels, "Коммерческая недвижимость", "real channel name 13");
    assertIncludes(pages.aphroditeChannels, "Нерухомість Дніпра", "real channel name 14");
    assertIncludes(pages.aphroditeChannels, "Недвижимость Днепра", "real channel name 15");
    assertNotIncludes(pages.aphroditeChannels, "Общая тема 01", "no generic placeholders 1");
    assertNotIncludes(pages.aphroditeChannels, "Недвижимость Днепр 01", "no generic placeholders 2");
    assertNotIncludes(pages.aphroditeChannels, "требует уточнения", "no generic placeholders 3");
    assertIncludes(pages.aphroditeChannels, "Общие темы — 10", "category general 10");
    assertIncludes(pages.aphroditeChannels, "Недвижимость — 5", "category realestate 5");
    assertIncludes(pages.aphroditeChannels, "Каналы Зодиака - 13", "zodiac module channels 13");


    assertIncludes(pages.aphroditeOverview, "Афродита", "aphrodite overview heading");
    assertIncludes(pages.aphroditeOverview, "/dashboard/networks/aphrodite/channels", "aphrodite overview registry link");
    assertIncludes(pages.aphroditeOverview, "Валюты", "aphrodite overview Currency card");
    assertIncludes(pages.aphroditeOverview, "Крипта", "aphrodite overview Crypto card");
    assertIncludes(pages.aphroditeOverview, "Металлы", "aphrodite overview Metals card");
    assertIncludes(pages.aphroditeOverview, "заблокирована", "aphrodite overview live publish locked");
    assertIncludes(pages.aphroditeOverview, "Приоритет запуска", "overview priority status");
    assertIncludes(pages.aphroditeOverview, "Валюты RU / Валюти UA", "currency RU/UA check");
    assertIncludes(pages.aphroditeOverview, "Крипта RU / Крипта UA", "crypto RU/UA check");
    assertIncludes(pages.aphroditeOverview, "Металлы RU / Метали UA", "metals RU/UA check");
    assertNotIncludes(pages.aphroditeOverview, "/api/aphrodite", "no server write API required on aphrodite overview");

    assertIncludes(pages.aphroditeCalendar, "Aphrodite Publishing Calendar", "aphrodite calendar heading");
    assertIncludes(pages.aphroditeCalendar, "Zodiac Daily", "aphrodite calendar zodiac daily");
    assertIncludes(pages.aphroditeCalendar, "Currency Daily Rates", "aphrodite calendar currency daily");
    assertIncludes(pages.aphroditeCalendar, "Crypto Top 10 Snapshot", "aphrodite calendar crypto daily");
    assertIncludes(pages.aphroditeCalendar, "Metals Daily Watch", "aphrodite calendar metals daily");
    assertIncludes(pages.aphroditeCalendar, "Live publishing locked", "aphrodite calendar safety locked");
    assertNotIncludes(pages.aphroditeCalendar, "/api/aphrodite", "no server write API required on aphrodite calendar");

    assertIncludes(pages.aphroditeDataSources, "Источники данных Афродиты", "aphrodite data sources heading");
    assertIncludes(pages.aphroditeDataSources, "Ленты RSS", "aphrodite data sources rss");
    assertIncludes(pages.aphroditeDataSources, "API обмена валют", "aphrodite data sources currency");
    assertIncludes(pages.aphroditeDataSources, "Нет активных ключей API на клиенте", "aphrodite data sources safety");
    assertNotIncludes(pages.aphroditeDataSources, "/api/aphrodite", "no server write API required on aphrodite data sources");

    assertIncludes(pages.aphroditeCurrency, "Currency Exchange Module", "aphrodite currency heading");
    assertIncludes(pages.aphroditeCurrency, "EUR/USD", "aphrodite currency mock data");
    assertIncludes(pages.aphroditeCurrency, "API connections mocked", "aphrodite currency safety");
    assertNotIncludes(pages.aphroditeCurrency, "/api/aphrodite", "no server write API required on aphrodite currency");

    assertIncludes(pages.aphroditeCrypto, "Cryptocurrency Markets", "aphrodite crypto heading");
    assertIncludes(pages.aphroditeCrypto, "BTC/USD", "aphrodite crypto mock data");
    assertIncludes(pages.aphroditeCrypto, "Тестовый режим", "aphrodite crypto safety");
    assertNotIncludes(pages.aphroditeCrypto, "/api/aphrodite", "no server write API required on aphrodite crypto");

    assertIncludes(pages.aphroditeMetals, "Precious Metals", "aphrodite metals heading");
    assertIncludes(pages.aphroditeMetals, "XAU/USD", "aphrodite metals mock data");
    assertIncludes(pages.aphroditeMetals, "Тестовый режим", "aphrodite metals safety");
    assertNotIncludes(pages.aphroditeMetals, "/api/aphrodite", "no server write API required on aphrodite metals");

    assertIncludes(pages.aphroditeStudio, "Афродита Студия", "aphrodite studio heading");
    assertIncludes(pages.aphroditeStudio, "Reels / Shorts", "aphrodite studio reels");
    assertIncludes(pages.aphroditeStudio, "Content Pipeline", "aphrodite studio pipeline");
    assertIncludes(pages.aphroditeStudio, "Каналы Зодиака", "aphrodite studio zodiac preset");
    assertIncludes(pages.aphroditeStudio, "Валюты", "aphrodite studio currency preset");
    assertIncludes(pages.aphroditeStudio, "Крипта", "aphrodite studio crypto preset");
    assertIncludes(pages.aphroditeStudio, "Металлы", "aphrodite studio metals preset");
    assertIncludes(pages.aphroditeStudio, "Mock Generation Queue", "aphrodite studio mock queue");
    assertIncludes(pages.aphroditeStudio, "API отключены", "aphrodite studio safety");
    assertNotIncludes(pages.aphroditeStudio, "/api/aphrodite", "no server write API required on aphrodite studio");

    assertIncludes(pages.aphroditeTemplates, "Шаблоны Студии Афродиты", "aphrodite templates heading");
    assertIncludes(pages.aphroditeTemplates, "Reels / Shorts", "aphrodite templates library");
    assertIncludes(pages.aphroditeTemplates, "Каналы Зодиака", "aphrodite templates zodiac");
    assertIncludes(pages.aphroditeTemplates, "Валюты", "aphrodite templates currency");
    assertIncludes(pages.aphroditeTemplates, "Крипта", "aphrodite templates crypto");
    assertIncludes(pages.aphroditeTemplates, "Металлы", "aphrodite templates metals");
    assertIncludes(pages.aphroditeTemplates, "Telegram Caption Templates", "aphrodite templates caption");
    assertIncludes(pages.aphroditeTemplates, "Prompt Pack", "aphrodite templates prompt pack");
    assertNotIncludes(pages.aphroditeTemplates, "/api/aphrodite", "no server write API required on aphrodite templates");

    assertIncludes(pages.aphroditeQueue, "Очередь Студии Афродиты", "aphrodite queue heading");
    assertIncludes(pages.aphroditeQueue, "Pipeline", "aphrodite queue pipeline");
    assertIncludes(pages.aphroditeQueue, "Зодиак", "aphrodite queue zodiac filter");
    assertIncludes(pages.aphroditeQueue, "Валюты", "aphrodite queue currency filter");
    assertIncludes(pages.aphroditeQueue, "Крипта", "aphrodite queue crypto filter");
    assertIncludes(pages.aphroditeQueue, "Металлы", "aphrodite queue metals filter");
    assertIncludes(pages.aphroditeQueue, "Недвижимость", "aphrodite queue real estate filter");
    assertIncludes(pages.aphroditeQueue, "Чеклист перед публикацией", "aphrodite queue checklist");
    assertIncludes(pages.aphroditeQueue, "Публикация в Telegram отключена", "aphrodite queue safety message");
    assertNotIncludes(pages.aphroditeQueue, "/api/aphrodite", "no server write API required on aphrodite queue");

    assertIncludes(pages.aphroditeBriefs, "Брифы Студии Афродиты", "aphrodite briefs heading");
    assertIncludes(pages.aphroditeBriefs, "Reels Brief Template", "aphrodite briefs reels template");
    assertIncludes(pages.aphroditeBriefs, "Зодиак", "aphrodite briefs zodiac module");
    assertIncludes(pages.aphroditeBriefs, "Валюты", "aphrodite briefs currency module");
    assertIncludes(pages.aphroditeBriefs, "Крипта", "aphrodite briefs crypto module");
    assertIncludes(pages.aphroditeBriefs, "Металлы", "aphrodite briefs metals module");
    assertIncludes(pages.aphroditeBriefs, "Недвижимость", "aphrodite briefs real estate module");
    assertIncludes(pages.aphroditeBriefs, "Бриф", "aphrodite briefs flow step 1");
    assertIncludes(pages.aphroditeBriefs, "Сценарий", "aphrodite briefs flow step 2");
    assertIncludes(pages.aphroditeBriefs, "Публикация в Telegram отключена", "aphrodite briefs safety message");
    assertNotIncludes(pages.aphroditeBriefs, "/api/aphrodite", "no server write API required on aphrodite briefs");

    assertIncludes(pages.aphroditeLegacy, "15 каналов", "aphrodite legacy heading");
    assertIncludes(pages.aphroditeLegacy, "Старая сеть Афродиты", "aphrodite legacy old network text");
    assertIncludes(pages.aphroditeLegacy, "Общие темы", "aphrodite legacy general topics");
    assertIncludes(pages.aphroditeLegacy, "Недвижимость", "aphrodite legacy real estate");
    assertIncludes(pages.aphroditeLegacy, "Ідеї для бізнесу", "aphrodite legacy channel name");
    assertIncludes(pages.aphroditeLegacy, "Инвестиции в недвижимость", "aphrodite legacy channel name");
    assertIncludes(pages.aphroditeLegacy, 'href="/dashboard/networks/aphrodite/legacy/restart"', "aphrodite legacy link to restart planner");
    assertNotIncludes(pages.aphroditeLegacy, "/api/aphrodite", "no server write API required on aphrodite legacy");

    assertIncludes(pages.aphroditeLegacyRestart, "Перезапуск 15 каналов", "aphrodite legacy restart heading");
    assertIncludes(pages.aphroditeLegacyRestart, "Фаза 1 — Аудит каналов", "aphrodite legacy restart phase 1");
    assertIncludes(pages.aphroditeLegacyRestart, "Подготовить 7 постов на канал", "aphrodite legacy restart phase 3");
    assertIncludes(pages.aphroditeLegacyRestart, "Связь со Студией", "aphrodite legacy restart studio section");
    assertIncludes(pages.aphroditeLegacyRestart, "Live-публикация отключена", "aphrodite legacy restart live publish locked");
    assertIncludes(pages.aphroditeLegacyRestart, "Telegram API не вызывается", "aphrodite legacy restart telegram api locked");
    assertIncludes(pages.aphroditeLegacyRestart, "Ідеї для бізнесу", "aphrodite legacy restart channel 1");
    assertIncludes(pages.aphroditeLegacyRestart, "Недвижимость Днепра", "aphrodite legacy restart channel 15");
    assertNotIncludes(pages.aphroditeLegacyRestart, "/api/aphrodite", "no server write API required on aphrodite legacy restart");

    const combined = Object.values(pages).join("\n");

    assertNoForbiddenLinks(combined);

    
  console.log("Checking for old English terminology globally...");
  const oldEnglishTerms = [
    "TELEGRAM NETWORK DASHBOARD",
    "TELEGRAM TOKEN",
    "GETME",
    "BOT ACCESS",
    "READY POSTS",
    "WORKER",
    "SCHEDULER",
    "Dashboard Home",
    "Safety Locked",
    "Live publish locked",
    "Read-only view",
    "ACTIVE",
    "DRAFT",
    "PLANNING",
    "Legacy",
    "No live publish from registry",
    "Aphrodite Platform",
    "Operator Platform",
    "Total Channels",
    "Legacy Paused",
    "Draft Modules",
    "Live Publish",
    "Platform Modules",
    "Channel Registry",
    "Safety Level",
    "Next Step",
    "Next Safe Actions",
    "Platform Architecture",
    "Aphrodite OS",
    "Create Post",
    "Generate AI"
  ];
  
  Object.entries(pages).forEach(([pageName, html]) => {
    if (html) {
      oldEnglishTerms.forEach(term => {
        // we skip "Live Publish" check in docs/rules if we accidentally load it, but these are HTML pages
        // let's do a strict check
        assertNotIncludes(html, term, `Old English term "${term}" found in ${pageName}`);
      });
    }
  });


  console.log("Dashboard QA: PASS");
  } finally {
    if (server.started) {
      server.process.kill();
    }
  }
}

function assertIncludes(html, needle, label) {
  if (!html.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

function assertNotIncludes(html, needle, label) {
  if (html.includes(needle)) throw new Error(`Unexpected ${label}: ${needle}`);
}

function assertNoForbiddenLinks(html) {
  for (const route of ["/reports", "/settings", "/readiness"]) {
    assertNotIncludes(html, `href="${route}"`, `dead route link ${route}`);
    assertNotIncludes(html, `href='${route}'`, `dead route link ${route}`);
  }
}

function assertNoRuntimeErrorText(html, label) {
  const forbidden = ["Application error", "Internal Server Error", "NEXT_RUNTIME", "__NEXT_ERROR__", "404 This page could not be found", "500 Internal Server Error"];
  for (const needle of forbidden) {
    if (html.includes(needle)) throw new Error(`${label} contains runtime error text: ${needle}`);
  }
}

function assertNoSecretValues(html, label) {
  const secretKeys = [
    "TELEGRAM_BOT_TOKEN",
    "BOT_TOKEN",
    "COMPATIBILITY_BOT_TOKEN",
    "ZODIAC_ANALYTICS_REDIS_URL",
    "ZODIAC_ANALYTICS_REDIS_TOKEN",
    "ZODIAC_PROFILE_SYNC_REDIS_URL",
    "ZODIAC_PROFILE_SYNC_REDIS_TOKEN",
    "ZODIAC_PROFILE_SYNC_SUPABASE_SERVICE_ROLE_KEY",
    "ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256",
    "ZODIAC_DASHBOARD_SESSION_SECRET",
  ];

  const candidates = secretKeys.map((key) => process.env[key]).filter((value) => typeof value === "string" && value.length >= 8);

  for (const value of candidates) {
    if (html.includes(value)) throw new Error(`${label} leaks a configured secret value.`);
  }
}

async function fetchUrl(url, cookie = null) {
  const headers = cookie ? { "Cookie": cookie } : {};
  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Failed to load ${url}, status code: ${res.status}`);
  }
  return await res.text();
}

async function loginAndGetCookie(url) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      login: "qa-admin",
      password: "qa-password-not-production",
    }),
    redirect: "manual",
  });
  if (!res.ok) {
    throw new Error(`Login failed with status: ${res.status}`);
  }
  const setCookieHeader = res.headers.get("set-cookie");
  if (!setCookieHeader) {
    throw new Error("No set-cookie header returned from login");
  }
  // Extract just the aphrodite_session=... part
  const match = setCookieHeader.match(/(aphrodite_session=[^;]+)/);
  if (!match) {
    throw new Error("aphrodite_session cookie not found in set-cookie header");
  }
  return match[1];
}

async function checkRedirect(url) {
  const res = await fetch(url, { redirect: "manual" });
  if (res.status !== 307 && res.status !== 302 && res.status !== 308) {
    throw new Error(`Expected redirect for ${url}, but got ${res.status}`);
  }
  const location = res.headers.get("location");
  if (!location || !location.includes("/login")) {
    throw new Error(`Expected redirect to /login for ${url}, but got ${location}`);
  }
  return true;
}

async function ensureServer(url, timeoutMs) {
  const isUp = await probe(url);
  if (isUp) return { started: false };

  console.log("Starting local production server...");
  const devProcess = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3000"], {
    env: {
      ...process.env,
      APHRODITE_ADMIN_LOGIN: "qa-admin",
      APHRODITE_ADMIN_PASSWORD: "qa-password-not-production",
      APHRODITE_SESSION_SECRET: "qa-secret-not-production-1234567890",
      ZODIAC_DASHBOARD_AUTH_ENABLED: "false",
      ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256: "",
      ZODIAC_DASHBOARD_SESSION_SECRET: "",
    },
    stdio: "ignore",
    windowsHide: true,
  });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await probe(url)) {
      return { started: true, process: devProcess };
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  devProcess.kill();
  throw new Error("Timeout waiting for dashboard server.");
}

async function probe(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(Boolean(res.statusCode && res.statusCode >= 200 && res.statusCode < 400));
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

main().catch((error) => {
  console.error("Dashboard QA: FAIL");
  console.error(error);
  process.exit(1);
});
