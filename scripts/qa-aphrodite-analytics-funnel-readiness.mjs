#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_ANALYTICS_FUNNEL_READINESS_CLASSIFICATION,
  APHRODITE_ANALYTICS_FUNNEL_READINESS_TITLE,
  APHRODITE_ANALYTICS_FUNNEL_SAFETY_LABELS,
  getAphroditeAnalyticsFunnelEvents,
  getAphroditeAnalyticsFunnelKpis,
  getAphroditeAnalyticsPrivacyRules,
  getAphroditeAnalyticsReadinessBoundaries,
  getAphroditeAnalyticsReadinessNextSteps,
} from "../lib/zodiac/aphrodite-analytics-funnel-readiness.ts";

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

console.log("Старт QA: Analytics/Funnel Tracking Readiness Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-analytics-funnel-readiness.ts";
const pagePath = "../app/dashboard/networks/zodiac/analytics-funnel-readiness/page.tsx";
const docsPath = "../docs/aphrodite-analytics-funnel-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-180.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model file exists", exists(modelPath));
check("dashboard page exists", exists(pagePath));
check("docs exist", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, pageSource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

const events = getAphroditeAnalyticsFunnelEvents();
const kpis = getAphroditeAnalyticsFunnelKpis();
const privacyRules = getAphroditeAnalyticsPrivacyRules();
const boundaries = getAphroditeAnalyticsReadinessBoundaries();
const nextSteps = getAphroditeAnalyticsReadinessNextSteps();

check("funnel events exist", events.length >= 19);
check("KPIs exist", kpis.length >= 11);
check("privacy rules exist", privacyRules.length >= 6);
check("readiness boundaries exist", boundaries.length >= 9);
check("next steps exist", nextSteps.length >= 1);

for (const id of [
  "telegram_channel_cta_view",
  "telegram_channel_cta_click",
  "miniapp_opened",
  "love_reading_opened",
  "love_reading_form_started",
  "love_reading_form_submitted",
  "love_reading_preview_viewed",
  "full_love_report_teaser_viewed",
  "paywall_viewed",
  "future_payment_intent_clicked",
  "vip_guard_denied",
  "free_preview_fallback_shown",
  "birth_matrix_opened",
  "compatibility_opened",
  "couple_calendar_opened",
  "daily_horoscope_viewed",
  "weekly_horoscope_viewed",
  "monthly_horoscope_viewed",
  "return_visit",
]) {
  check(`event exists: ${id}`, events.some((event) => event.id === id));
}

check("Telegram CTA events exist", events.some((event) => event.id === "telegram_channel_cta_view") && events.some((event) => event.id === "telegram_channel_cta_click"));
check("Mini App opened event exists", events.some((event) => event.id === "miniapp_opened"));
check("Love Reading events exist", events.some((event) => event.id === "love_reading_opened") && events.some((event) => event.id === "love_reading_form_started") && events.some((event) => event.id === "love_reading_form_submitted"));
check("Free preview event exists", events.some((event) => event.id === "love_reading_preview_viewed"));
check("Paywall event exists", events.some((event) => event.id === "paywall_viewed"));
check("Future payment intent event exists", events.some((event) => event.id === "future_payment_intent_clicked"));
check("VIP guard denied event exists", events.some((event) => event.id === "vip_guard_denied"));
check("Fallback shown event exists", events.some((event) => event.id === "free_preview_fallback_shown"));
check("Daily/weekly/monthly content events exist", ["daily_horoscope_viewed", "weekly_horoscope_viewed", "monthly_horoscope_viewed"].every((id) => events.some((event) => event.id === id)));

for (const id of [
  "mini-app-open-rate",
  "love-reading-start-rate",
  "form-completion-rate",
  "preview-view-rate",
  "paywall-view-rate",
  "future-payment-intent-rate",
  "guard-denial-rate",
  "fallback-recovery-rate",
  "return-visit-rate",
  "content-cta-performance",
  "channel-to-mini-app-conversion",
]) {
  check(`KPI exists: ${id}`, kpis.some((kpi) => kpi.id === id));
}

check("raw names are forbidden in analytics", privacyRules.some((rule) => rule.id === "no-raw-names" && rule.forbiddenData.join(" ").includes("raw name")));
check("raw birth dates are forbidden in analytics", privacyRules.some((rule) => rule.id === "no-raw-birth-dates" && rule.forbiddenData.join(" ").includes("raw birth date")));
check("payment payloads are forbidden in analytics", privacyRules.some((rule) => rule.id === "no-payment-payloads" && rule.forbiddenData.join(" ").includes("payment payload")));
check("private Telegram message contents are forbidden in analytics", privacyRules.some((rule) => rule.id === "no-telegram-private-message-contents" && rule.forbiddenData.join(" ").includes("private message text")));
check("anonymous/session/user-safe identifiers only documented", privacyRules.some((rule) => rule.id === "anonymous-identifiers-only"));

check("dashboard route key exists", dashboardQaSource.includes("analyticsFunnelReadiness"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_ANALYTICS_FUNNEL_READINESS_TITLE));
check("dashboard QA checks classification", dashboardQaSource.includes("Только readiness"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/analytics-funnel-readiness"));
check("page shows title", userFacingBundle.includes(APHRODITE_ANALYTICS_FUNNEL_READINESS_TITLE));
check("page shows classification", userFacingBundle.includes(APHRODITE_ANALYTICS_FUNNEL_READINESS_CLASSIFICATION));
check("page shows future funnel stages", pageSource.includes("future funnel stages"));
check("page shows future event taxonomy", pageSource.includes("future event taxonomy"));
check("page shows future KPIs", pageSource.includes("future KPIs"));
check("page shows traffic attribution", pageSource.includes("traffic attribution"));
check("page shows Mini App funnel", pageSource.includes("Mini App funnel"));
check("page shows paywall/future payment funnel", pageSource.includes("paywall/future payment funnel"));
check("page shows content funnel daily weekly monthly", pageSource.includes("content funnel: daily/weekly/monthly"));
check("page shows privacy rules", pageSource.includes("privacy rules"));
check("page shows blocked data fields", pageSource.includes("blocked data fields"));
check("page shows safety boundaries", pageSource.includes("safety boundaries"));

for (const label of APHRODITE_ANALYTICS_FUNNEL_SAFETY_LABELS) {
  check(`Russian visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const boundary of [
  "no-external-analytics",
  "no-event-sending",
  "no-database-write",
  "no-telegram-api",
  "no-payment-tracking",
  "no-real-payment",
  "no-vip-unlock",
  "no-production-tracking",
  "analytics-readiness-sends-nothing",
]) {
  check(
    `safety boundary exists: ${boundary}`,
    boundaries.some((item) => item.dataBoundary === boundary) && userFacingBundle.includes(boundary) && pageSource.includes("data-boundary={boundary.dataBoundary}"),
  );
}

for (const file of [
  "../app/dashboard/networks/zodiac/page.tsx",
  "../app/dashboard/networks/zodiac/first-paid-mvp-readiness-review/page.tsx",
  "../app/dashboard/networks/zodiac/support-refund-policy-readiness/page.tsx",
  "../app/dashboard/networks/zodiac/product-catalog-finalization/page.tsx",
  "../app/dashboard/networks/zodiac/vip-access-security-suite/page.tsx",
  "../app/dashboard/networks/zodiac/production-payment-safety-gate/page.tsx",
  "../app/dashboard/networks/zodiac/owner-review-gate/page.tsx",
]) {
  check(`Analytics/Funnel link exists in ${file}`, read(file).includes("/dashboard/networks/zodiac/analytics-funnel-readiness"));
}

check("docs say Package 180 readiness only", docsSource.includes("Package 180 creates Analytics/Funnel Tracking readiness only"));
check("docs define event taxonomy", docsSource.includes("event taxonomy"));
check("docs define funnel stages", docsSource.includes("funnel stages"));
check("docs define KPIs", docsSource.includes("KPIs"));
check("docs define attribution", docsSource.includes("attribution"));
check("docs define privacy boundaries", docsSource.includes("privacy boundaries"));
check("docs say no analytics events", docsSource.includes("It does not send analytics events"));
check("docs say no external analytics APIs", docsSource.includes("It does not call external analytics APIs"));
check("docs say no DB write", docsSource.includes("It does not write to database"));
check("docs say no database schema change", docsSource.includes("It does not modify database schema"));
check("docs say no Telegram API", docsSource.includes("It does not call Telegram API"));
check("docs say no payment tracking", docsSource.includes("It does not implement payment tracking"));
check("docs say no real payment", docsSource.includes("It does not implement real payment"));
check("docs say no VIP unlock", docsSource.includes("It does not implement VIP unlock"));
check("docs say no active Telegram CTA change", docsSource.includes("It does not change active Telegram CTA logic"));
check("docs say no workflow changes", docsSource.includes("It does not modify cron/workflow/publish scripts"));
check("docs say content pipeline remains unblocked", docsSource.includes("Daily/weekly/monthly content pipeline remains unblocked"));
check("docs say next package Package 181", docsSource.includes("Package 181 — Mini App Analytics Noop Event Bus Skeleton"));

check("report says Package 180", reportSource.includes("Package 180"));
check("report says readiness only", reportSource.includes("readiness only"));
check("report says next package Package 181", reportSource.includes("Package 181 — Mini App Analytics Noop Event Bus Skeleton"));

check("no external analytics API is used", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|plausible|mixpanel|segment\.track/i.test(implementationBundle));
check("no event sending function is active", !/navigator\.sendBeacon|fetch\([^)]*analytics|sendEvent\s*\(|trackEvent\s*\(|record[A-Za-z]*Event\s*\(/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/i.test(implementationBundle));
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no Telegram API call", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no payment tracking implementation", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|paymentIntentTracked/i.test(implementationBundle));
check("no real payment API", !/stripe\.|checkout\.sessions|paymentIntent|createPayment|payments\.create|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no entitlement creation", !/createsEntitlementNow\s*:\s*true|entitlementCreationAllowedNow\s*:\s*true|export\s+function\s+create\w*Entitlement|function\s+create\w*Entitlement|grantVip\s*\(|unlockVip\s*\(/i.test(implementationBundle));
check("no production launch switch", !/approvedForLaunch\s*:\s*true|sendAllowedNow\s*:\s*true|canCallTelegramApiNow\s*:\s*true|productionPaymentAllowedNow\s*:\s*true|productionLaunchAllowedNow\s*:\s*true/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

check("no workflows changed", gitDiffNames([".github/workflows"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs"]).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
