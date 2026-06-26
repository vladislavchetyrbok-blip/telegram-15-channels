#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_CLASSIFICATION,
  APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_SAFETY_LABELS,
  APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_TITLE,
  getAphroditeTelegramWebViewStartAppDiagnostics,
} from "../lib/zodiac/aphrodite-telegram-webview-startapp-diagnostics.ts";

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

console.log("Старт QA: Telegram WebView / startapp diagnostics...\n");

const modelPath = "../lib/zodiac/aphrodite-telegram-webview-startapp-diagnostics.ts";
const pagePath = "../app/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics/page.tsx";
const docsPath = "../docs/aphrodite-telegram-webview-startapp-diagnostics.md";
const finalDiagnosticsDocsPath = "../docs/aphrodite-telegram-webview-startapp-final-diagnostics.md";
const reportPath = "../docs/aphrodite-package-reports/package-209.md";
const finalDiagnosticsReportPath = "../docs/aphrodite-package-reports/package-215.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard", pagePath],
  ["docs", docsPath],
  ["final diagnostics docs", finalDiagnosticsDocsPath],
  ["package report", reportPath],
  ["Package 215 report", finalDiagnosticsReportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} существует`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const finalDiagnosticsDocsSource = exists(finalDiagnosticsDocsPath) ? read(finalDiagnosticsDocsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const finalDiagnosticsReportSource = exists(finalDiagnosticsReportPath) ? read(finalDiagnosticsReportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const model = getAphroditeTelegramWebViewStartAppDiagnostics();
const implementationBundle = [modelSource, pageSource, docsSource, finalDiagnosticsDocsSource, reportSource, finalDiagnosticsReportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, finalDiagnosticsDocsSource, reportSource, finalDiagnosticsReportSource].join("\n");

check("title exported", model.title === APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_TITLE);
check("classification exported", model.classification === APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_CLASSIFICATION);
check("package number is 209", model.packageNumber === 209);
check("final diagnostics package number is 215", model.finalDiagnosticsPackageNumber === 215);
check("dashboard route linked from overview", dashboardSource.includes("/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics"));
check("dashboard QA route exists", dashboardQaSource.includes("telegramWebviewStartappDiagnostics"));
check("dashboard QA asserts title", dashboardQaSource.includes("Диагностика Telegram WebView / startapp"));

for (const label of APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, implementationBundle.includes(label));
}

for (const requiredFinalDiagnostic of [
  "Telegram WebView detected",
  "Telegram WebView not detected",
  "startapp param expected",
  "startapp param missing",
  "startapp/deep link manual check required",
  "fallback browser mode",
  "cache marker status",
  "owner manual review",
  "launch not approved",
]) {
  check(`final diagnostic exists: ${requiredFinalDiagnostic}`, model.finalDiagnostics.some((item) => item.title === requiredFinalDiagnostic));
  check(`final diagnostic rendered/documented: ${requiredFinalDiagnostic}`, implementationBundle.includes(requiredFinalDiagnostic));
}

check("WebView diagnostics exist", implementationBundle.includes("Telegram WebView detected") && implementationBundle.includes("Telegram WebView not detected"));
check("startapp/deep link diagnostics exist", implementationBundle.includes("startapp param expected") && implementationBundle.includes("startapp param missing") && implementationBundle.includes("startapp/deep link manual check required"));
check("fallback browser mode exists", implementationBundle.includes("fallback browser mode"));
check("cache marker status exists", implementationBundle.includes("cache marker status"));
check("owner manual review exists", model.ownerManualReview.status === "OWNER REVIEW REQUIRED" && implementationBundle.includes("ownerManualReviewRequired=true"));
check("launch not approved exists", model.ownerManualReview.publicLaunchApproved === false && implementationBundle.includes("Launch not approved") && implementationBundle.includes("publicLaunchApproved=false"));
check("normal browser missing startapp not code failure", implementationBundle.includes("Absence of startapp in a normal browser is not a code failure") || implementationBundle.includes("missing startapp parameter on default browser/manual open is not a code failure"));
check("real device manual WebView check exists", implementationBundle.includes("Telegram WebView must be checked manually on real device") || implementationBundle.includes("checked manually on a real device"));
check("BotFather not changed text exists", implementationBundle.includes("BotFather was not changed"));
check("Telegram API not used text exists", implementationBundle.includes("Telegram API was not used"));
check("no messages sent text exists", implementationBundle.includes("no messages were sent"));
check("all final diagnostics include manual action", model.finalDiagnostics.every((item) => item.manualAction.length > 20) && implementationBundle.includes("manual action"));
check("all final diagnostics include not code failure guidance", model.finalDiagnostics.every((item) => item.notCodeFailureWhen.length > 20) && implementationBundle.includes("not code failure when"));

for (const startapp of [
  "default Mini App open",
  "love_reading",
  "compatibility",
  "birth_matrix",
  "daily",
  "weekly",
  "monthly",
  "fallback route",
]) {
  check(`startapp route documented: ${startapp}`, model.routes.some((route) => route.startapp === startapp));
  check(`startapp rendered/documented: ${startapp}`, implementationBundle.includes(startapp));
}

for (const required of [
  "stale Telegram WebView cache",
  "wrong route symptoms",
  "version marker check",
  "cache-buster query check",
  "iOS Telegram WebView behavior",
  "Android Telegram WebView behavior",
  "Telegram Desktop behavior",
  "browser fallback behavior",
]) {
  check(`diagnostic exists: ${required}`, implementationBundle.includes(required));
}

check("love_reading expected route", model.routes.some((route) => route.startapp === "love_reading" && route.expectedRoute === "/miniapp/love-reading-preview"));
check("compatibility expected route", model.routes.some((route) => route.startapp === "compatibility" && route.expectedRoute === "/compatibility"));
check("birth_matrix expected route", model.routes.some((route) => route.startapp === "birth_matrix" && route.expectedRoute === "/birth-matrix"));
check("daily/weekly/monthly documented", ["daily", "weekly", "monthly"].every((key) => model.routes.some((route) => route.startapp === key)));
check("cache diagnosis documented", model.cacheDiagnostics.length >= 4);
check("no production launch", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API", model.safetyFlags.telegramApiUsed === false);
check("no BotFather modification", model.safetyFlags.botFatherChanged === false);
check("no active CTA change", model.safetyFlags.activeCtaChanged === false);
check("no messages", model.safetyFlags.messagesSent === false);
check("no DB write", model.safetyFlags.databaseWriteAdded === false);
check("no payment", model.safetyFlags.paymentAdded === false);
check("no VIP", model.safetyFlags.vipUnlockAdded === false);
check("next package is 210", model.nextRecommendedPackage.includes("Package 210"));
check("docs say Package 209", docsSource.includes("Package 209"));
check("report says Package 209", reportSource.includes("Package 209"));
check("report keeps Package 210 not started", reportSource.includes("Package 210 не начат"));
check("final diagnostics docs say Package 215", finalDiagnosticsDocsSource.includes("Package 215"));
check("final diagnostics report says Package 215", finalDiagnosticsReportSource.includes("Package 215"));

check("live Mini App source files not changed", gitDiffNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
]).length === 0);
check("no workflow/cron changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set([
  "scripts/qa-aphrodite-telegram-webview-startapp-diagnostics.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
check("script changes limited to Package 209 QA/dashboard QA", scriptChanges.every((file) => allowedScriptChanges.has(file)));

check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no BotFather API modification", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved=true/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
