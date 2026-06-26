#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  emitAphroditeMiniAppAnalyticsNoopEvent,
  getAphroditeMiniAppAnalyticsNoopEvents,
  sanitizeAphroditeMiniAppAnalyticsPayload,
} from "../lib/zodiac/aphrodite-miniapp-analytics-noop-event-bus.ts";
import {
  getAphroditeAnalyticsFunnelEvents,
  getAphroditeAnalyticsPrivacyRules,
} from "../lib/zodiac/aphrodite-analytics-funnel-readiness.ts";
import {
  getAphroditeAnalyticsFunnelMockDashboard,
} from "../lib/zodiac/aphrodite-analytics-funnel-mock-dashboard.ts";
import {
  getAphroditeTelegramCtaAttributionReadiness,
} from "../lib/zodiac/aphrodite-telegram-cta-attribution-readiness.ts";
import {
  APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_CLASSIFICATION,
  APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_SAFETY_LABELS,
  APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_TITLE,
  getAphroditeAnalyticsPrivacySafetySuite,
} from "../lib/zodiac/aphrodite-analytics-privacy-safety-suite.ts";

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

console.log("Старт QA: Analytics Privacy Safety Suite...\n");

const modelPath = "../lib/zodiac/aphrodite-analytics-privacy-safety-suite.ts";
const pagePath = "../app/dashboard/networks/zodiac/analytics-privacy-safety-suite/page.tsx";
const docsPath = "../docs/aphrodite-analytics-privacy-safety-suite.md";
const reportPath = "../docs/aphrodite-package-reports/package-185.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const packageSources = [
  "../lib/zodiac/aphrodite-analytics-funnel-readiness.ts",
  "../lib/zodiac/aphrodite-miniapp-analytics-noop-event-bus.ts",
  "../lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points.ts",
  "../lib/zodiac/aphrodite-analytics-funnel-mock-dashboard.ts",
  "../lib/zodiac/aphrodite-telegram-cta-attribution-readiness.ts",
  "../lib/zodiac/aphrodite-analytics-privacy-safety-suite.ts",
  "../app/dashboard/networks/zodiac/analytics-privacy-safety-suite/page.tsx",
];

check("model exists", exists(modelPath));
check("dashboard exists", exists(pagePath));
check("docs exist", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const sourceBundle = packageSources.filter(exists).map(read).join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");
const suite = getAphroditeAnalyticsPrivacySafetySuite();

check("suite model returns title", suite.title === APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_TITLE);
check("suite classification returns", suite.classification === APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_CLASSIFICATION);
check("audited packages listed", suite.auditedPackages.length >= 5);
check("privacy checks listed", suite.checks.length >= 15);
check("boundaries listed", suite.boundaries.length >= 4);
check("suite sendsEventsNow false", suite.sendsEventsNow === false);
check("suite externalAnalyticsNow false", suite.externalAnalyticsNow === false);
check("suite databaseReadNow false", suite.databaseReadNow === false);
check("suite databaseWriteNow false", suite.databaseWriteNow === false);
check("suite telegramApiNow false", suite.telegramApiNow === false);
check("suite paymentTrackingNow false", suite.paymentTrackingNow === false);
check("suite productionTrackingNow false", suite.productionTrackingNow === false);
check("all suite checks pass", suite.checks.every((item) => item.result === "PASS" && item.source === "qa-only"));

for (const label of APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const text of [
  "raw names",
  "raw birth dates",
  "payment payloads",
  "private Telegram messages",
  "full report text",
  "external analytics API",
  "event sending",
  "database read/write analytics",
  "noop bus stays noop",
  "integration points use only noop",
  "mock dashboard uses mock data",
  "CTA attribution remains readiness-only",
  "active payment tracking",
  "Telegram API",
  "production tracking",
]) {
  check(`required suite text exists: ${text}`, userFacingBundle.includes(text));
}

const maliciousPayload = {
  name: "Alice",
  rawName: "Alice",
  partnerName: "Bob",
  rawPartnerName: "Bob",
  birthDate: "1998-06-15",
  rawBirthDate: "1998-06-15",
  partnerBirthDate: "1990-01-01",
  rawPartnerBirthDate: "1990-01-01",
  birthDateText: "15.06.1998",
  paymentPayload: "invoice-secret",
  invoicePayload: "invoice-secret",
  successfulPaymentPayload: "stars-secret",
  transactionId: "tx-secret",
  privateMessageText: "private message",
  telegramPrivateMessageText: "telegram private message",
  rawInitData: "raw-init-data",
  telegramInitDataRaw: "raw-telegram-init-data",
  fullReportText: "full love report text",
  reportText: "report text",
  previewText: "preview text",
  messageText: "message text",
  productCode: "ai-love-reading",
  hasBirthDate: true,
  source: "qa-suite",
  surface: "mini-app",
};
const sanitizedPayload = sanitizeAphroditeMiniAppAnalyticsPayload(maliciousPayload);
const emitted = emitAphroditeMiniAppAnalyticsNoopEvent({
  eventId: "love_reading_form_submitted",
  payload: maliciousPayload,
  source: "qa-suite",
  surface: "mini-app",
});

for (const forbiddenKey of [
  "name",
  "rawName",
  "partnerName",
  "rawPartnerName",
  "birthDate",
  "rawBirthDate",
  "partnerBirthDate",
  "rawPartnerBirthDate",
  "birthDateText",
  "paymentPayload",
  "invoicePayload",
  "successfulPaymentPayload",
  "transactionId",
  "privateMessageText",
  "telegramPrivateMessageText",
  "rawInitData",
  "telegramInitDataRaw",
  "fullReportText",
  "reportText",
  "previewText",
  "messageText",
]) {
  check(`sanitizer removes forbidden key: ${forbiddenKey}`, !(forbiddenKey in sanitizedPayload) && !(forbiddenKey in emitted.sanitizedPayload));
}

check("sanitizer keeps safe allowlisted productCode", sanitizedPayload.productCode === "ai-love-reading");
check("sanitizer keeps safe allowlisted flags", sanitizedPayload.hasBirthDate === true);
check("noop event accepted known event", emitted.accepted === true);
check("noop event sentNow false", emitted.sentNow === false);
check("noop event externalAnalyticsCalledNow false", emitted.externalAnalyticsCalledNow === false);
check("noop event databaseWriteNow false", emitted.databaseWriteNow === false);
check("noop event telegramApiCalledNow false", emitted.telegramApiCalledNow === false);
check("noop event paymentTrackingNow false", emitted.paymentTrackingNow === false);
check("noop event productionTrackingNow false", emitted.productionTrackingNow === false);

const noopEvents = getAphroditeMiniAppAnalyticsNoopEvents();
check("noop bus has events", noopEvents.length >= 17);
check("noop bus stays noop", noopEvents.every((event) => event.noopOnly === true));
check("noop bus forbidden payload fields cover names", noopEvents.every((event) => event.forbiddenPayloadFields.includes("rawName") && event.forbiddenPayloadFields.includes("rawPartnerName")));
check("noop bus forbidden payload fields cover birth dates", noopEvents.every((event) => event.forbiddenPayloadFields.includes("rawBirthDate") && event.forbiddenPayloadFields.includes("rawPartnerBirthDate")));
check("noop bus forbidden payload fields cover payment payloads", noopEvents.every((event) => event.forbiddenPayloadFields.includes("paymentPayload") && event.forbiddenPayloadFields.includes("invoicePayload")));
check("noop bus forbidden payload fields cover private messages", noopEvents.every((event) => event.forbiddenPayloadFields.includes("telegramPrivateMessageText")));
check("noop bus forbidden payload fields cover report text", noopEvents.every((event) => event.forbiddenPayloadFields.includes("reportText") && event.forbiddenPayloadFields.includes("fullReportText")));

const funnelEvents = getAphroditeAnalyticsFunnelEvents();
const privacyRules = getAphroditeAnalyticsPrivacyRules();
check("Package 180 events remain taxonomy/noop/future only", funnelEvents.every((event) => ["taxonomy-only", "noop-only", "future-tracking", "blocked-until-privacy-review"].includes(event.currentState)));
check("Package 180 privacy rules cover raw names", privacyRules.some((rule) => rule.id === "no-raw-names"));
check("Package 180 privacy rules cover raw birth dates", privacyRules.some((rule) => rule.id === "no-raw-birth-dates"));
check("Package 180 privacy rules cover payment payloads", privacyRules.some((rule) => rule.id === "no-payment-payloads"));
check("Package 180 privacy rules cover Telegram private messages", privacyRules.some((rule) => rule.id === "no-telegram-private-message-contents"));
check("Package 180 privacy rules cover full report text", privacyRules.some((rule) => rule.id === "no-full-report-text"));

const mockDashboard = getAphroditeAnalyticsFunnelMockDashboard();
check("Package 183 mock funnel uses mock-only data", mockDashboard.funnelSteps.every((step) => step.source === "mock-only"));
check("Package 183 mock KPI uses mock-only data", mockDashboard.kpis.every((kpi) => kpi.source === "mock-only"));
check("Package 183 mock content rows use mock-only data", mockDashboard.contentRows.every((row) => row.source === "mock-only"));

const ctaReadiness = getAphroditeTelegramCtaAttributionReadiness();
check("Package 184 active CTA flag false", ctaReadiness.activeCtaLogicChanged === false);
check("Package 184 tracking flag false", ctaReadiness.trackingEnabledNow === false);
check("Package 184 dimensions readiness-only", ctaReadiness.dimensions.every((dimension) => dimension.source === "readiness-only"));
check("Package 184 source examples readiness-only", ctaReadiness.sourceExamples.every((example) => example.source === "readiness-only"));

const integrationSource = exists("../lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points.ts")
  ? read("../lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points.ts")
  : "";
check("Package 182 imports noop bus", integrationSource.includes("aphrodite-miniapp-analytics-noop-event-bus"));
check("Package 182 records only noop event", integrationSource.includes("emitAphroditeMiniAppAnalyticsNoopEvent"));

check("no external analytics API in implementation", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(/i.test(sourceBundle));
check("no event sending in implementation", !/navigator\.sendBeacon\s*\(|fetch\(\s*["'][^"']*analytics|sendEvent\s*\(|trackEvent\s*\(/i.test(sourceBundle));
check("no DB client/read in implementation", !/process\.env\.DATABASE_URL|getDb\s*\(|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.select\s*\(|\.select\s*\(/i.test(sourceBundle));
check("no DB write in implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert/i.test(sourceBundle));
check("no Telegram API in implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|answerPreCheckoutQuery\s*\(/i.test(sourceBundle));
check("no active payment tracking in implementation", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|paymentIntentTracked/i.test(sourceBundle));
check("dashboard QA route key exists", dashboardQaSource.includes("analyticsPrivacySafetySuite"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/analytics-privacy-safety-suite"));
check("page renders title from model", pageSource.includes("suite.title") && userFacingBundle.includes(APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_TITLE));
check("page renders classification from model", pageSource.includes("suite.classification") && userFacingBundle.includes(APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_CLASSIFICATION));
check("docs say no external analytics", docsSource.includes("No external analytics provider") || docsSource.includes("Нет внешней аналитики"));
check("docs say no database writes", docsSource.includes("No database event writes") || docsSource.includes("Нет записи в базу данных"));
check("report says Package 185", reportSource.includes("Package 185"));
check("report says Package 186 not started", reportSource.includes("Not started"));
check("no active CTA generation files changed", gitDiffNames([
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/publish-zodiac-navigation.mjs",
  "scripts/publish-zodiac-navigation-all.mjs",
  "scripts/publish-zodiac-compatibility.mjs",
  "app/miniapp",
  "app/compatibility",
  "app/birth-matrix",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "components/zodiac-mini-app",
]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no workflows changed", gitDiffNames([".github/workflows"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs"]).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
