#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_CLASSIFICATION,
  APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_SAFETY_LABELS,
  APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_TITLE,
  getAphroditeAnalyticsFunnelMockDashboard,
} from "../lib/zodiac/aphrodite-analytics-funnel-mock-dashboard.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("УСПЕХ: " + name);
  } else {
    failed += 1;
    console.log("ОШИБКА: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

function gitDiffNames(paths) {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], { encoding: "utf8" });
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

console.log("Старт QA: Analytics Funnel Mock Dashboard...\n");

const modelPath = "../lib/zodiac/aphrodite-analytics-funnel-mock-dashboard.ts";
const pagePath = "../app/dashboard/networks/zodiac/analytics-funnel-mock-dashboard/page.tsx";
const docsPath = "../docs/aphrodite-analytics-funnel-mock-dashboard.md";
const reportPath = "../docs/aphrodite-package-reports/package-183.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model exists", exists(modelPath));
check("dashboard exists", exists(pagePath));
check("docs exist", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, pageSource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");
const dashboard = getAphroditeAnalyticsFunnelMockDashboard();

check("mock dashboard model returns title", dashboard.title === APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_TITLE);
check("mock dashboard classification returns", dashboard.classification === APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_CLASSIFICATION);
check("mock funnel steps exist", dashboard.funnelSteps.length >= 10);
check("mock KPIs exist", dashboard.kpis.length >= 8);
check("mock content rows exist", dashboard.contentRows.length >= 3);
check("safety boundaries exist", dashboard.boundaries.length >= 8);
check("all funnel data is mock-only", dashboard.funnelSteps.every((step) => step.source === "mock-only") && dashboard.kpis.every((kpi) => kpi.source === "mock-only") && dashboard.contentRows.every((row) => row.source === "mock-only"));

for (const text of [
  "Telegram CTA → Mini App opens",
  "Mini App open → Love Reading open",
  "Love Reading form start → submit",
  "preview viewed",
  "paywall teaser viewed",
  "future payment intent",
  "guard denied",
  "fallback recovery",
  "return visits",
  "daily content CTA",
  "weekly content CTA",
  "monthly content CTA",
  "channel-to-Mini-App conversion",
]) {
  check(`required mock dashboard text exists: ${text}`, userFacingBundle.includes(text));
}

for (const label of APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("analyticsFunnelMockDashboard"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/analytics-funnel-mock-dashboard"));
check("page renders title from model", pageSource.includes("dashboard.title") && userFacingBundle.includes(APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_TITLE));
check("page renders classification from model", pageSource.includes("dashboard.classification") && userFacingBundle.includes(APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_CLASSIFICATION));
check("docs say no DB read", docsSource.includes("DB read/write") || docsSource.includes("Нет чтения базы данных"));
check("docs say no external analytics", docsSource.includes("external analytics API"));
check("report says Package 183", reportSource.includes("Package 183"));
check("report says next package 184", reportSource.includes("Package 184"));

check("no DB read", !/process\.env\.DATABASE_URL|getDb\s*\(|createClient\(|new Pool\(|drizzle\(|redis|upstash|from\([^)]*\)\.select\s*\(|\.select\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert/i.test(implementationBundle));
check("no external analytics API", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(/i.test(implementationBundle));
check("no event sending", !/navigator\.sendBeacon\s*\(|fetch\(\s*["'][^"']*analytics|sendEvent\s*\(|trackEvent\s*\(|record[A-Za-z]*Event\s*\(/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no payment tracking", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|paymentIntentTracked/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no workflows changed", gitDiffNames([".github/workflows"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs"]).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
