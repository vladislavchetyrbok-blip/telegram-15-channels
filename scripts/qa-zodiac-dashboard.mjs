#!/usr/bin/env node

import { spawn } from "node:child_process";
import http from "node:http";

const DEFAULT_TIMEOUT_MS = 120_000;
const URL_BASE = "http://localhost:3000";
const ROUTES = {
  overview: "/dashboard/networks/zodiac",
  analytics: "/dashboard/networks/zodiac/analytics",
  channels: "/dashboard/networks/zodiac/channels",
  operations: "/dashboard/networks/zodiac/operations",
  docs: "/dashboard/networks/zodiac/docs",
  publishing: "/publishing-center",
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
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/analytics"', "overview analytics route link");
    assertIncludes(pages.overview, 'href="/dashboard/networks/zodiac/operations"', "overview operations route link");
    assertIncludes(pages.overview, "Каналы", "sidebar/platform nav Channels label");
    assertIncludes(pages.overview, "Аналитика", "sidebar/platform nav Analytics label");

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
    assertIncludes(pages.channels, "compat_aries", "sign startapp link");
    assertIncludes(pages.channels, "https://t.me/aries_horoscope_daily", "Telegram channel URL");

    assertIncludes(pages.operations, "Операции и безопасность Zodiac", "operations page heading");
    assertIncludes(pages.operations, "Daily autopublish", "daily autopublish status");
    assertIncludes(pages.operations, "Weekly live", "weekly live status");
    assertIncludes(pages.operations, "first 5 users GO", "first users GO status");
    assertIncludes(pages.operations, "Mass launch", "mass launch status");

    assertIncludes(pages.docs, "Документы Telegram Platform", "docs page heading");
    assertIncludes(pages.docs, "docs/zodiac-telegram-platform-management-console.md", "management console doc path");

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
