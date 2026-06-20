#!/usr/bin/env node

import { spawn } from "node:child_process";
import http from "node:http";

const DEFAULT_TIMEOUT_MS = 120_000;
const URL_BASE = "http://localhost:3000";
const ROUTES = {
  login: "/dashboard/login",
  overview: "/dashboard/networks/zodiac",
  analytics: "/dashboard/networks/zodiac/analytics",
  channels: "/dashboard/networks/zodiac/channels",
  content: "/dashboard/networks/zodiac/content",
  publishing: "/dashboard/networks/zodiac/publishing",
  feedback: "/dashboard/networks/zodiac/feedback",
  launch: "/dashboard/networks/zodiac/launch",
  operations: "/dashboard/networks/zodiac/operations",
  security: "/dashboard/networks/zodiac/security",
  settings: "/dashboard/networks/zodiac/settings",
  docs: "/dashboard/networks/zodiac/docs",
  legacyPublishing: "/publishing-center",
  miniApp: "/compatibility",
  dashboardAuthStatus: "/api/dashboard/auth/status",
  unifiedStatus: "/api/system/unified-status",
  aphroditeOverview: "/dashboard/networks/aphrodite",
  aphroditeChannels: "/dashboard/networks/aphrodite/channels",
  aphroditeCalendar: "/dashboard/networks/aphrodite/calendar",
  aphroditeDataSources: "/dashboard/networks/aphrodite/data-sources",
  aphroditeCurrency: "/dashboard/networks/aphrodite/currency",
  aphroditeCrypto: "/dashboard/networks/aphrodite/crypto",
};

async function main() {
  console.log("Starting Dashboard QA...");

  const server = await ensureServer(URL_BASE, DEFAULT_TIMEOUT_MS);
  console.log(`Server is running at ${URL_BASE}`);

  try {
    const pages = {};
    for (const [name, route] of Object.entries(ROUTES)) {
      console.log(`Checking ${route}`);
      pages[name] = await fetchUrl(`${URL_BASE}${route}`);
      assertNoRuntimeErrorText(pages[name], `${name} page`);
      assertNoSecretValues(pages[name], `${name} page`);
    }

    assertIncludes(pages.login, "Вход в панель Афродиты", "dashboard login page heading");
    assertIncludes(pages.login, "Auth отключён для local/dev режима", "dashboard login disabled local mode");
    assertIncludes(pages.dashboardAuthStatus, '"authEnabled":false', "dashboard auth disabled status");
    assertIncludes(pages.dashboardAuthStatus, '"sessionCookie":"local browser only"', "dashboard auth session cookie status");

    assertIncludes(pages.overview, "АФРОДИТА", "Aphrodite visible on dashboard shell or overview");
    assertIncludes(pages.overview, "Zodiac Control", "overview page heading");
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

    assertIncludes(pages.channels, "Управление каналами Zodiac", "channels page heading");
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

    assertIncludes(pages.content, "Контент-движок", "content page heading");
    assertIncludes(pages.content, "Шаблоны, рубрики, CTA, превью и контроль качества постов для Telegram-сети.", "content page subtitle");
    assertIncludes(pages.content, "Dashboard / Zodiac / Контент", "content breadcrumb");
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
    assertIncludes(pages.content, 'data-qa="rubric-planner"', "rubric planner");
    assertIncludes(pages.content, "ежедневный прогноз", "rubric daily forecast");
    assertIncludes(pages.content, "soft launch feedback", "rubric soft launch feedback");
    assertIncludes(pages.content, "live scheduling changes: NO", "no live scheduling changes label");
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

    assertIncludes(pages.feedback, "Feedback Center", "feedback page heading");
    assertIncludes(pages.feedback, "Dashboard / Zodiac / Feedback", "feedback breadcrumb");
    assertIncludes(pages.feedback, "Центр отзывов, багов и evidence по первым пользователям.", "feedback subtitle");
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

    assertIncludes(pages.launch, "Launch Control", "launch page heading");
    assertIncludes(pages.launch, "Запуск", "sidebar has Запуск");
    assertIncludes(pages.launch, 'data-qa="launch-status-cards"', "launch status cards visible");
    assertIncludes(pages.launch, "First 5 users", "first 5 users card visible");
    assertIncludes(pages.launch, "20 users", "20 users card visible");
    assertIncludes(pages.launch, "Mass launch", "mass launch card visible");
    assertIncludes(pages.launch, "STOP", "mass launch STOP visible");
    assertIncludes(pages.launch, "Production auth", "production auth card visible");
    assertIncludes(pages.launch, "PENDING ENV", "production auth pending visible");
    assertIncludes(pages.launch, 'data-qa="launch-checklist"', "checklist visible");
    assertIncludes(pages.launch, 'data-qa="launch-decision-matrix"', "decision matrix visible");
    assertIncludes(pages.launch, 'data-qa="launch-cross-links"', "launch cross links visible");
    assertIncludes(pages.launch, 'href="/dashboard/networks/zodiac/analytics"', "analytics link visible on launch");
    assertIncludes(pages.launch, 'href="/dashboard/networks/zodiac/feedback"', "feedback link visible on launch");
    assertIncludes(pages.launch, 'href="/dashboard/networks/zodiac/security"', "security link visible on launch");
    assertIncludes(pages.launch, 'href="/dashboard/networks/zodiac/publishing"', "publishing link visible on launch");
    assertNotIncludes(pages.launch, "zodiac:publish-date:live", "no live publish button on launch");

    assertIncludes(pages.operations, "Операции и безопасность Zodiac", "operations page heading");
    assertIncludes(pages.operations, "Daily autopublish", "daily autopublish status");
    assertIncludes(pages.operations, "Weekly live", "weekly live status");
    assertIncludes(pages.operations, "first 5 users GO", "first users GO status");
    assertIncludes(pages.operations, "Mass launch", "mass launch status");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/feedback"', "operations feedback route link");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/publishing"', "operations publishing route link");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/content"', "operations content route link");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/security"', "operations security route link");

    assertIncludes(pages.security, "Безопасность платформы", "security page heading");
    assertIncludes(pages.security, "Контроль live-действий, approvals, журнал действий и защита от случайных публикаций.", "security subtitle");
    assertIncludes(pages.security, "Dashboard / Zodiac / Безопасность", "security breadcrumb");
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

    assertIncludes(pages.settings, "Настройки Zodiac OS", "settings page heading");
    assertIncludes(pages.settings, "Настройки", "sidebar has Настройки");
    assertIncludes(pages.settings, 'data-qa="settings-env-cards"', "env status cards visible");
    assertIncludes(pages.settings, 'data-qa="settings-entry-points"', "production entry points visible");
    assertIncludes(pages.settings, 'data-qa="settings-vercel-env"', "vercel env checklist visible");
    assertIncludes(pages.settings, 'data-qa="settings-mode-matrix"', "mode matrix visible");
    assertIncludes(pages.settings, 'data-qa="settings-manual-actions"', "manual actions panel visible");
    assertNotIncludes(pages.settings, "zodiac:publish-date:live", "no live publish button on settings");
    assertNotIncludes(pages.settings, "/api/zodiac/settings", "no server write API required on settings");

    assertIncludes(pages.docs, "Документы Zodiac OS", "docs page heading");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-admin-safety.md", "admin safety doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-dashboard-auth.md", "dashboard auth doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-content-engine.md", "content engine doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-management-console.md", "management console doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-publishing-center.md", "publishing center doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-feedback-center.md", "feedback center doc path");

    assertIncludes(pages.aphroditeChannels, "Aphrodite Channel Registry", "aphrodite registry heading");
    assertIncludes(pages.aphroditeChannels, "Всего каналов", "aphrodite registry total channels");
    assertIncludes(pages.aphroditeChannels, "Пауза / Старая сеть Афродиты", "aphrodite registry paused legacy");
    assertIncludes(pages.aphroditeChannels, "Новые черновики", "aphrodite registry draft new");
    assertIncludes(pages.aphroditeChannels, "Currency", "aphrodite module Currency");
    assertIncludes(pages.aphroditeChannels, "Crypto", "aphrodite module Crypto");
    assertIncludes(pages.aphroditeChannels, "Metals", "aphrodite module Metals");
    assertNotIncludes(pages.aphroditeChannels, "/api/aphrodite/settings", "no server write API required on aphrodite registry");

    assertIncludes(pages.aphroditeOverview, "Афродита (Aphrodite Platform)", "aphrodite overview heading");
    assertIncludes(pages.aphroditeOverview, "/dashboard/networks/aphrodite/channels", "aphrodite overview registry link");
    assertIncludes(pages.aphroditeOverview, "Currency", "aphrodite overview Currency card");
    assertIncludes(pages.aphroditeOverview, "Crypto", "aphrodite overview Crypto card");
    assertIncludes(pages.aphroditeOverview, "Metals", "aphrodite overview Metals card");
    assertIncludes(pages.aphroditeOverview, "Locked", "aphrodite overview live publish locked");
    assertNotIncludes(pages.aphroditeOverview, "/api/aphrodite", "no server write API required on aphrodite overview");

    assertIncludes(pages.aphroditeCalendar, "Aphrodite Publishing Calendar", "aphrodite calendar heading");
    assertIncludes(pages.aphroditeCalendar, "Zodiac Daily", "aphrodite calendar zodiac daily");
    assertIncludes(pages.aphroditeCalendar, "Currency Daily Rates", "aphrodite calendar currency daily");
    assertIncludes(pages.aphroditeCalendar, "Crypto Top 10 Snapshot", "aphrodite calendar crypto daily");
    assertIncludes(pages.aphroditeCalendar, "Metals Daily Watch", "aphrodite calendar metals daily");
    assertIncludes(pages.aphroditeCalendar, "Live publishing locked", "aphrodite calendar safety locked");
    assertNotIncludes(pages.aphroditeCalendar, "/api/aphrodite", "no server write API required on aphrodite calendar");

    assertIncludes(pages.aphroditeDataSources, "Aphrodite Data Sources", "aphrodite data sources heading");
    assertIncludes(pages.aphroditeDataSources, "RSS Feeds", "aphrodite data sources rss");
    assertIncludes(pages.aphroditeDataSources, "Currency Exchange API", "aphrodite data sources currency");
    assertIncludes(pages.aphroditeDataSources, "No live API keys in frontend", "aphrodite data sources safety");
    assertNotIncludes(pages.aphroditeDataSources, "/api/aphrodite", "no server write API required on aphrodite data sources");

    assertIncludes(pages.aphroditeCurrency, "Currency Exchange Module", "aphrodite currency heading");
    assertIncludes(pages.aphroditeCurrency, "EUR/USD", "aphrodite currency mock data");
    assertIncludes(pages.aphroditeCurrency, "API connections mocked", "aphrodite currency safety");
    assertNotIncludes(pages.aphroditeCurrency, "/api/aphrodite", "no server write API required on aphrodite currency");

    assertIncludes(pages.aphroditeCrypto, "Cryptocurrency Markets", "aphrodite crypto heading");
    assertIncludes(pages.aphroditeCrypto, "BTC/USD", "aphrodite crypto mock data");
    assertIncludes(pages.aphroditeCrypto, "API calls mocked", "aphrodite crypto safety");
    assertNotIncludes(pages.aphroditeCrypto, "/api/aphrodite", "no server write API required on aphrodite crypto");

    const combined = Object.values(pages).join("\n");
    assertNoForbiddenLinks(combined);

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

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Failed to load ${url}, status code: ${res.statusCode}`));
        } else {
          resolve(data);
        }
      });
    }).on("error", reject);
  });
}

async function ensureServer(url, timeoutMs) {
  const isUp = await probe(url);
  if (isUp) return { started: false };

  console.log("Starting local production server...");
  const devProcess = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3000"], {
    env: {
      ...process.env,
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
