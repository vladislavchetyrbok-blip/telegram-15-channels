#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_CLASSIFICATION,
  APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_SAFETY_LABELS,
  APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_TITLE,
  emitAphroditeMiniAppAnalyticsNoopEvent,
  getAphroditeMiniAppAnalyticsNoopBoundaries,
  getAphroditeMiniAppAnalyticsNoopEvents,
  getAphroditeMiniAppAnalyticsNoopNextSteps,
  sanitizeAphroditeMiniAppAnalyticsPayload,
} from "../lib/zodiac/aphrodite-miniapp-analytics-noop-event-bus.ts";

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

console.log("Старт QA: Mini App Analytics Noop Event Bus...\n");

const modelPath = "../lib/zodiac/aphrodite-miniapp-analytics-noop-event-bus.ts";
const pagePath = "../app/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus/page.tsx";
const docsPath = "../docs/aphrodite-miniapp-analytics-noop-event-bus.md";
const reportPath = "../docs/aphrodite-package-reports/package-181.md";
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

const events = getAphroditeMiniAppAnalyticsNoopEvents();
const boundaries = getAphroditeMiniAppAnalyticsNoopBoundaries();
const nextSteps = getAphroditeMiniAppAnalyticsNoopNextSteps();

check("emit function exists", modelSource.includes("export function emitAphroditeMiniAppAnalyticsNoopEvent"));
check("sanitize function exists", modelSource.includes("export function sanitizeAphroditeMiniAppAnalyticsPayload"));
check("events getter exists", modelSource.includes("export function getAphroditeMiniAppAnalyticsNoopEvents"));
check("boundaries getter exists", modelSource.includes("export function getAphroditeMiniAppAnalyticsNoopBoundaries"));
check("next steps getter exists", modelSource.includes("export function getAphroditeMiniAppAnalyticsNoopNextSteps"));
check("all noop events exist", events.length >= 17);
check("boundaries exist", boundaries.length >= 6);
check("next Package 182 documented", nextSteps.some((step) => step.package === "Package 182"));

for (const id of [
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

const sanitized = sanitizeAphroditeMiniAppAnalyticsPayload({
  route: "/miniapp",
  source: "tg_daily_aries",
  surface: "mini-app",
  productCode: "ai-love-reading",
  hasBirthDate: true,
  hasPartnerBirthDate: true,
  rawName: "Анна",
  name: "Анна",
  partnerName: "Иван",
  rawBirthDate: "15.06.1998",
  birthDate: "15.06.1998",
  paymentPayload: "invoice",
  invoicePayload: "invoice",
  telegramPrivateMessageText: "private",
  fullReportText: "full report",
  reportText: "report",
});

check("safe route remains", sanitized.route === "/miniapp");
check("safe source remains", sanitized.source === "tg_daily_aries");
check("safe productCode remains", sanitized.productCode === "ai-love-reading");
check("safe hasBirthDate flag remains", sanitized.hasBirthDate === true);
check("safe hasPartnerBirthDate flag remains", sanitized.hasPartnerBirthDate === true);
check("raw names are stripped", !("rawName" in sanitized) && !("name" in sanitized) && !("partnerName" in sanitized));
check("raw birth dates are stripped", !("rawBirthDate" in sanitized) && !("birthDate" in sanitized));
check("payment payloads are stripped", !("paymentPayload" in sanitized) && !("invoicePayload" in sanitized));
check("private Telegram message content is stripped", !("telegramPrivateMessageText" in sanitized));
check("full report text is stripped", !("fullReportText" in sanitized) && !("reportText" in sanitized));

const result = emitAphroditeMiniAppAnalyticsNoopEvent({
  eventId: "love_reading_form_submitted",
  source: "qa",
  surface: "mini-app",
  payload: sanitized,
});

check("known event accepted", result.accepted === true);
check("noop result sentNow false", result.sentNow === false);
check("noop result externalAnalyticsCalledNow false", result.externalAnalyticsCalledNow === false);
check("noop result databaseWriteNow false", result.databaseWriteNow === false);
check("noop result telegramApiCalledNow false", result.telegramApiCalledNow === false);
check("noop result paymentTrackingNow false", result.paymentTrackingNow === false);
check("noop result productionTrackingNow false", result.productionTrackingNow === false);

const rejected = emitAphroditeMiniAppAnalyticsNoopEvent({ eventId: "unknown_event", payload: { rawName: "x" } });
check("unknown event rejected safely", rejected.accepted === false && rejected.sentNow === false);

check("page shows title", userFacingBundle.includes(APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_TITLE));
check("page shows classification", userFacingBundle.includes(APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_CLASSIFICATION));
check("dashboard route key exists", dashboardQaSource.includes("miniappAnalyticsNoopEventBus"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus"));

for (const label of APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_SAFETY_LABELS) {
  check(`visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const boundary of ["no-external-analytics", "no-event-sending", "no-database-write", "no-telegram-api", "no-payment-tracking", "noop-sends-nothing"]) {
  check(`boundary exists: ${boundary}`, boundaries.some((item) => item.id === boundary) && userFacingBundle.includes(boundary));
}

check("docs mention no external analytics APIs", docsSource.includes("external analytics API calls"));
check("docs mention no DB writes", docsSource.includes("database event writes"));
check("docs mention no Telegram API", docsSource.includes("Telegram API calls"));
check("docs mention next package", docsSource.includes("Package 182"));
check("report says Package 181", reportSource.includes("Package 181"));

check("overview nav link exists", read("../app/dashboard/networks/zodiac/page.tsx").includes("/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus"));
check("analytics readiness related link exists", read("../app/dashboard/networks/zodiac/analytics-funnel-readiness/page.tsx").includes("/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus"));

check("no external analytics API is used", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(/i.test(implementationBundle));
check("no event sending function is active", !/navigator\.sendBeacon\s*\(|fetch\(\s*["'][^"']*analytics|sendEvent\s*\(|trackEvent\s*\(|record[A-Za-z]*Event\s*\(/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/i.test(implementationBundle));
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no Telegram API call", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no payment tracking implementation", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|paymentIntentTracked/i.test(implementationBundle));
check("no real payment API", !/stripe\.|checkout\.sessions|paymentIntent|createPayment|payments\.create|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no entitlement creation", !/createsEntitlementNow\s*:\s*true|entitlementCreationAllowedNow\s*:\s*true|export\s+function\s+create\w*Entitlement|function\s+create\w*Entitlement|grantVip\s*\(|unlockVip\s*\(/i.test(implementationBundle));
check("no production tracking", !/productionTrackingNow:\s*true|approvedForLaunch\s*:\s*true|sendAllowedNow\s*:\s*true|canCallTelegramApiNow\s*:\s*true|productionPaymentAllowedNow\s*:\s*true/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

check("no workflows changed", gitDiffNames([".github/workflows"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs"]).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
