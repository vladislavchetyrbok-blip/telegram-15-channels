#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  emitAphroditeMiniAppAnalyticsNoopEvent,
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

console.log("Старт QA: Mini App Analytics Noop Integration Points...\n");

const helperPath = "../lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points.ts";
const busPath = "../lib/zodiac/aphrodite-miniapp-analytics-noop-event-bus.ts";
const docsPath = "../docs/aphrodite-miniapp-analytics-noop-integration-points.md";
const reportPath = "../docs/aphrodite-package-reports/package-182.md";
const routeFiles = [
  "../app/miniapp/page.tsx",
  "../app/miniapp/love-reading-preview/page.tsx",
  "../app/birth-matrix/page.tsx",
  "../app/compatibility/page.tsx",
  "../app/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus/page.tsx",
];

check("integration helper exists", exists(helperPath));
check("event bus exists", exists(busPath));
check("docs exist", exists(docsPath));
check("package report exists", exists(reportPath));
for (const file of routeFiles) check(`route/dashboard file exists: ${file}`, exists(file));

const helperSource = exists(helperPath) ? read(helperPath) : "";
const busSource = exists(busPath) ? read(busPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const routeSources = routeFiles.map((file) => (exists(file) ? read(file) : "")).join("\n");
const implementationBundle = [helperSource, routeSources].join("\n");
const allPackageText = [helperSource, busSource, docsSource, reportSource, routeSources].join("\n");

check("helper imports noop event bus", helperSource.includes("emitAphroditeMiniAppAnalyticsNoopEvent"));
check("helper exports integration points getter", helperSource.includes("getAphroditeMiniAppAnalyticsNoopIntegrationPoints"));
check("helper exports record function", helperSource.includes("recordAphroditeMiniAppNoopIntegrationPoint"));
check("helper records only integrated points", helperSource.includes('point.status !== "integrated"'));
check("Mini App page calls noop integration", read("../app/miniapp/page.tsx").includes('recordAphroditeMiniAppNoopIntegrationPoint("route-miniapp-opened")'));
check("Love Reading page calls noop integration", read("../app/miniapp/love-reading-preview/page.tsx").includes('recordAphroditeMiniAppNoopIntegrationPoint("route-love-reading-opened")'));
check("Birth Matrix page calls noop integration", read("../app/birth-matrix/page.tsx").includes('recordAphroditeMiniAppNoopIntegrationPoint("route-birth-matrix-opened")'));
check("Compatibility page calls noop integration", read("../app/compatibility/page.tsx").includes('recordAphroditeMiniAppNoopIntegrationPoint("route-compatibility-opened")'));
check("dashboard page shows integration points", read("../app/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus/page.tsx").includes("noop integration points"));

for (const eventId of [
  "miniapp_opened",
  "love_reading_opened",
  "love_reading_preview_viewed",
  "full_love_report_teaser_viewed",
  "free_preview_fallback_shown",
  "birth_matrix_opened",
  "compatibility_opened",
]) {
  check(`integrated event exists: ${eventId}`, helperSource.includes(`eventId: "${eventId}"`) && helperSource.includes('status: "integrated"'));
}

for (const eventId of ["love_reading_form_started", "love_reading_form_submitted", "couple_calendar_opened"]) {
  check(`pending event documented: ${eventId}`, helperSource.includes(`eventId: "${eventId}"`) && helperSource.includes("pendingReason") && docsSource.includes(eventId));
}

check("docs say no user-facing behavior changes", docsSource.includes("User-facing behavior changed: Нет"));
check("docs say no external event sending", docsSource.includes("No external event sending"));
check("docs say no DB write", docsSource.includes("DB write"));
check("docs say no Telegram API", docsSource.includes("Telegram API"));
check("report says Package 182", reportSource.includes("Package 182"));
check("report says next package 183", reportSource.includes("Package 183"));

const unsafePayloadKeys = [
  "rawName:",
  "rawPartnerName:",
  "name:",
  "partnerName:",
  "rawBirthDate:",
  "birthDate:",
  "partnerBirthDate:",
  "paymentPayload:",
  "invoicePayload:",
  "telegramPrivateMessageText:",
  "privateMessageText:",
  "fullReportText:",
  "reportText:",
  "telegramInitDataRaw:",
];
for (const key of unsafePayloadKeys) {
  check(`unsafe analytics payload key absent: ${key}`, !helperSource.includes(key));
}

const noopResult = emitAphroditeMiniAppAnalyticsNoopEvent({
  eventId: "miniapp_opened",
  payload: { route: "/miniapp", source: "qa", surface: "mini-app", productCode: "miniapp-hub" },
});
check("event bus remains noop sentNow false", noopResult.sentNow === false);
check("event bus remains noop databaseWriteNow false", noopResult.databaseWriteNow === false);
check("event bus remains noop telegramApiCalledNow false", noopResult.telegramApiCalledNow === false);
check("event bus remains noop externalAnalyticsCalledNow false", noopResult.externalAnalyticsCalledNow === false);
check("event bus remains noop paymentTrackingNow false", noopResult.paymentTrackingNow === false);
check("event bus remains noop productionTrackingNow false", noopResult.productionTrackingNow === false);

check("no external analytics API is used", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(/i.test(implementationBundle));
check("no event sending function is active", !/navigator\.sendBeacon\s*\(|fetch\(\s*["'][^"']*analytics|sendEvent\s*\(|trackEvent\s*\(|record[A-Za-z]*Event\s*\(/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/i.test(implementationBundle));
check("no Telegram API call", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no payment tracking implementation", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|paymentIntentTracked/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(allPackageText));
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no workflows changed", gitDiffNames([".github/workflows"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs"]).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
