#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_CLASSIFICATION,
  APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_SAFETY_LABELS,
  APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_TITLE,
  getAphroditeSavedReportsHistoryMockReadiness,
} from "../lib/zodiac/aphrodite-saved-reports-history-mock-readiness.ts";

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

console.log("Старт QA: Saved Reports / History Mock Readiness...\n");

const modelPath = "../lib/zodiac/aphrodite-saved-reports-history-mock-readiness.ts";
const pagePath = "../app/dashboard/networks/zodiac/saved-reports-history-mock-readiness/page.tsx";
const docsPath = "../docs/aphrodite-saved-reports-history-mock-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-187.md";
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
const readiness = getAphroditeSavedReportsHistoryMockReadiness();

check("model returns title", readiness.title === APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_TITLE);
check("model returns classification", readiness.classification === APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_CLASSIFICATION);
check("mock reports exist", readiness.mockReports.length >= 8);
check("future storage requirements exist", readiness.futureRequirements.length >= 10);
check("safety boundaries exist", readiness.boundaries.length >= 8);
check("real persistence flag false", readiness.realPersistenceNow === false);
check("production localStorage flag false", readiness.productionLocalStorageNow === false);
check("database write flag false", readiness.databaseWriteNow === false);
check("telegram api flag false", readiness.telegramApiNow === false);
check("external analytics flag false", readiness.externalAnalyticsNow === false);
check("payment tracking flag false", readiness.paymentTrackingNow === false);
check("vip unlock flag false", readiness.vipUnlockNow === false);
check("all reports are mock-only", readiness.mockReports.every((report) => report.source === "mock-only"));

for (const type of [
  "love-reading-preview",
  "full-love-report-future",
  "compatibility-result",
  "birth-matrix-result",
  "vip-couple-calendar-future",
  "daily-horoscope-snapshot",
  "weekly-horoscope-snapshot",
  "monthly-horoscope-snapshot",
]) {
  check(`required saved report type exists: ${type}`, readiness.mockReports.some((report) => report.type === type) && userFacingBundle.includes(type));
}

check("daily snapshot exists", readiness.mockReports.some((report) => report.type === "daily-horoscope-snapshot" && report.periodKey && report.sign));
check("weekly snapshot exists", readiness.mockReports.some((report) => report.type === "weekly-horoscope-snapshot" && report.periodKey && report.sign));
check("monthly snapshot exists", readiness.mockReports.some((report) => report.type === "monthly-horoscope-snapshot" && report.periodKey && report.sign));

const fullLoveReport = readiness.mockReports.find((report) => report.type === "full-love-report-future");
check("full love report is future locked", Boolean(fullLoveReport && fullLoveReport.accessLevel === "future-paid" && fullLoveReport.ownerReviewRequired === true));

const vipCalendar = readiness.mockReports.find((report) => report.type === "vip-couple-calendar-future");
check("vip couple calendar is future locked", Boolean(vipCalendar && vipCalendar.accessLevel === "future-vip" && vipCalendar.ownerReviewRequired === true));

for (const field of [
  "reportId",
  "productId",
  "createdAt",
  "updatedAt",
  "periodKey if horoscope",
  "sign if zodiac",
  "title / previewSummary",
  "accessLevel",
  "fallbackRoute",
  "ownerReviewRequired",
  "privacy note",
]) {
  check(`future field requirement exists: ${field}`, userFacingBundle.includes(field));
}

for (const label of APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("savedReportsHistoryMockReadiness"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/saved-reports-history-mock-readiness"));
check("page renders title from model", pageSource.includes("readiness.title") && userFacingBundle.includes(APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_TITLE));
check("page renders classification from model", pageSource.includes("readiness.classification") && userFacingBundle.includes(APHRODITE_SAVED_REPORTS_HISTORY_MOCK_READINESS_CLASSIFICATION));
check("docs say no DB persistence", docsSource.includes("Нет записи в базу данных") || docsSource.includes("No database writes"));
check("docs say no production localStorage", docsSource.includes("Нет localStorage persistence для production") || docsSource.includes("no production localStorage"));
check("report says Package 187", reportSource.includes("Package 187"));
check("report says next package 188", reportSource.includes("Package 188"));

check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no production localStorage persistence", !/localStorage\s*\.\s*(setItem|getItem|removeItem|clear|key|length)/i.test(implementationBundle));
check("no server action", !/"use server"/i.test(implementationBundle));
check("no external analytics", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(|navigator\.sendBeacon\s*\(/i.test(implementationBundle));
check("no payment or VIP changes", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
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
check("no cron/workflow changes", gitDiffNames([".github/workflows"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
