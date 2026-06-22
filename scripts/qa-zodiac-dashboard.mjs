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
  realImplementationPath: "/dashboard/networks/zodiac/real-implementation-path",
  telegramInitDataValidation: "/dashboard/networks/zodiac/telegram-initdata-validation",
  userProfileFoundation: "/dashboard/networks/zodiac/user-profile-foundation",
  productCatalogFoundation: "/dashboard/networks/zodiac/product-catalog-foundation",
  entitlementFoundation: "/dashboard/networks/zodiac/entitlement-foundation",
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

    assertIncludes(pages.miniappHub, "Mini App Hub", "miniapp hub page title");
    assertIncludes(pages.miniappHub, "Static Hub (Package 106)", "miniapp hub mock notice");
    assertIncludes(pages.miniappHub, "Zodiac Universe", "miniapp hub subtitle");
    assertIncludes(pages.miniappHub, "No payment", "miniapp hub safety: no payment");
    assertIncludes(pages.miniappHub, "No database", "miniapp hub safety: no database");
    assertIncludes(pages.miniappHub, "No Telegram API", "miniapp hub safety: no telegram API");
    assertIncludes(pages.miniappHub, "birth-matrix", "miniapp hub contains birth matrix link");
    assertIncludes(pages.miniappHub, "mystic-numbers", "miniapp hub contains mystic numbers link");
    assertIncludes(pages.miniappHub, "affirmations", "miniapp hub contains affirmations link");
    assertIncludes(pages.miniappHub, "vip-preview", "miniapp hub contains vip preview link");

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

    assertIncludes(pages.ownerReviewGate, "Owner Review Gate Before Real Implementation", "owner review gate page title");
    assertIncludes(pages.ownerReviewGate, "Owner approval required", "owner review gate classification");
    assertIncludes(pages.ownerReviewGate, "No real implementation", "owner review gate implementation boundary");
    assertIncludes(pages.ownerReviewGate, "No production changes", "owner review gate production boundary");
    assertIncludes(pages.ownerReviewGate, "No payment", "owner review gate payment boundary");
    assertIncludes(pages.ownerReviewGate, "No Telegram API call", "owner review gate telegram boundary");

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
