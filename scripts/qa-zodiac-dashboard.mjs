#!/usr/bin/env node

import { spawn } from "node:child_process";
import http from "node:http";

const DEFAULT_TIMEOUT_MS = 120_000;
const URL_BASE = "http://localhost:3000";
const ROUTES = {
  overview: "/dashboard/networks/zodiac",
  analytics: "/dashboard/networks/zodiac/analytics",
  channels: "/dashboard/networks/zodiac/channels",
  publishing: "/dashboard/networks/zodiac/publishing",
  feedback: "/dashboard/networks/zodiac/feedback",
  operations: "/dashboard/networks/zodiac/operations",
  security: "/dashboard/networks/zodiac/security",
  docs: "/dashboard/networks/zodiac/docs",
  legacyPublishing: "/publishing-center",
  miniApp: "/compatibility",
  unifiedStatus: "/api/system/unified-status",
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

    assertIncludes(pages.overview, "Обзор управления Zodiac", "overview page heading");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/channels"', "overview channels route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/publishing"', "overview publishing route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/analytics"', "overview analytics route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/feedback"', "overview feedback route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/operations"', "overview operations route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/security"', "overview security route link");
    assertIncludes(pages.overview, "Каналы", "sidebar/platform nav Channels label");
    assertIncludes(pages.overview, "Аналитика", "sidebar/platform nav Analytics label");
    assertIncludes(pages.overview, "Отзывы", "sidebar/platform nav Feedback label");
    assertIncludes(pages.overview, "Безопасность", "sidebar/platform nav Security label");

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
    assertIncludes(pages.channels, 'href="/dashboard/networks/zodiac/security"', "channels security route link");
    assertIncludes(pages.channels, "compat_aries", "sign startapp link");
    assertIncludes(pages.channels, "https://t.me/aries_horoscope_daily", "Telegram channel URL");

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
    assertIncludes(pages.feedback, "Real Phone QA", "real phone QA heading");
    assertIncludes(pages.feedback, "iPhone Telegram opens Mini App", "iPhone real phone check");
    assertIncludes(pages.feedback, "Android Telegram opens Mini App", "Android real phone check");
    assertIncludes(pages.feedback, "no white screen", "no white screen check");
    assertIncludes(pages.feedback, 'data-qa="feedback-analytics-correlation"', "analytics correlation block");
    assertIncludes(pages.feedback, 'href="/dashboard/networks/zodiac/analytics"', "feedback analytics route link");
    assertIncludes(pages.feedback, 'href="/dashboard/networks/zodiac/security"', "feedback security route link");
    assertIncludes(pages.feedback, 'data-qa="feedback-decision-matrix"', "decision matrix block");
    assertIncludes(pages.feedback, "5 users", "5 users decision");
    assertIncludes(pages.feedback, "20 users", "20 users decision");
    assertIncludes(pages.feedback, "Mass launch", "mass launch decision");
    assertIncludes(pages.feedback, 'data-qa="feedback-sanitized-export"', "sanitized export block");
    assertNotIncludes(pages.feedback, "/api/zodiac/feedback", "feedback server write API route");

    assertIncludes(pages.operations, "Операции и безопасность Zodiac", "operations page heading");
    assertIncludes(pages.operations, "Daily autopublish", "daily autopublish status");
    assertIncludes(pages.operations, "Weekly live", "weekly live status");
    assertIncludes(pages.operations, "first 5 users GO", "first users GO status");
    assertIncludes(pages.operations, "Mass launch", "mass launch status");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/feedback"', "operations feedback route link");
    assertIncludes(pages.operations, 'href="/dashboard/networks/zodiac/publishing"', "operations publishing route link");
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
    assertNotIncludes(pages.security, "zodiac:publish-date:live", "live publish command on security page");
    assertNotIncludes(pages.security, "zodiac:weekly:publish", "weekly live command on security page");
    assertNotIncludes(pages.security, "/api/zodiac/admin-safety", "admin safety server write API route");
    assertNotIncludes(pages.security, "/api/zodiac/security", "security server write API route");

    assertIncludes(pages.docs, "Документы Telegram Platform", "docs page heading");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-admin-safety.md", "admin safety doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-management-console.md", "management console doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-publishing-center.md", "publishing center doc path");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-feedback-center.md", "feedback center doc path");

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
  const devProcess = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3000"], { stdio: "ignore", windowsHide: true });

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
