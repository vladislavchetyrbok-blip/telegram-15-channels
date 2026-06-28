#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_ROUTE,
  APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_TITLE,
  getAphroditeCriticalMobileTelegramWebviewVisualFixes,
} from "../lib/zodiac/aphrodite-critical-mobile-telegram-webview-visual-fixes.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("SUCCESS: " + name);
  } else {
    failed += 1;
    console.log("FAIL: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

function textFor(value) {
  return JSON.stringify(value).toLowerCase();
}

console.log("Starting QA: Aphrodite Critical Mobile Telegram WebView Visual Fixes...\n");

const modelPath = "../lib/zodiac/aphrodite-critical-mobile-telegram-webview-visual-fixes.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes/page.tsx";
const docsPath = "../docs/aphrodite-critical-mobile-telegram-webview-visual-fixes.md";
const reportPath = "../docs/aphrodite-package-reports/package-267.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const finalPreOwnerModelPath = "../lib/zodiac/aphrodite-final-pre-owner-review-summary.ts";
const finalPreOwnerQaPath = "./qa-aphrodite-final-pre-owner-review-summary.mjs";
const globalsPath = "../app/globals.css";

const livePaths = [
  "../app/miniapp/page.tsx",
  "../components/zodiac-mini-app/AphroditeHomeScreen.tsx",
  "../components/zodiac-mini-app/MainMenuSections.tsx",
  "../components/zodiac-mini-app/MiniAppHeader.tsx",
  "../components/zodiac-mini-app/ProfileRetentionPanel.tsx",
  "../components/zodiac-mini-app/ResultCards.tsx",
  "../components/zodiac-mini-app/SoftLaunchFeedbackPanel.tsx",
  "../components/zodiac-mini-app/WizardControls.tsx",
  "../components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx",
  "../components/zodiac-mini-app/aphrodite-design-system/AphroditeShareCard.tsx",
  "../components/ZodiacCompatibilityMiniApp.tsx",
  "../components/ZodiacMysticSections.tsx",
  "../components/ZodiacVipSections.tsx",
  "../app/birth-matrix/BirthMatrixClient.tsx",
  "../app/vip-preview/page.tsx",
  "../app/vip-compatibility-report/VipCompatibilityReportClient.tsx",
  "../lib/zodiac/zodiac-vip-preview.ts",
  "../lib/zodiac/zodiac-vip-compatibility-report-foundation.ts",
];

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
  ["final pre-owner model", finalPreOwnerModelPath],
  ["final pre-owner QA", finalPreOwnerQaPath],
  ["globals", globalsPath],
  ...livePaths.map((path) => [path, path]),
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const finalPreOwnerModelSource = exists(finalPreOwnerModelPath) ? read(finalPreOwnerModelPath) : "";
const finalPreOwnerQaSource = exists(finalPreOwnerQaPath) ? read(finalPreOwnerQaPath) : "";
const globalsSource = exists(globalsPath) ? read(globalsPath) : "";
const liveBundle = livePaths.map((path) => (exists(path) ? read(path) : "")).join("\n");
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
  finalPreOwnerModelSource,
  finalPreOwnerQaSource,
  globalsSource,
  liveBundle,
].join("\n");
const model = getAphroditeCriticalMobileTelegramWebviewVisualFixes();
const modelText = textFor(model);

check("title exported", model.title === APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_TITLE);
check("route exported", model.route === APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_ROUTE);
check("package number is 267", model.packageNumber === 267);
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("criticalMobileTelegramWebviewVisualFixes"));
check("docs/report exist", docsSource.includes("Package 267") && reportSource.includes("Package 267"));
check("final pre-owner next package updated", finalPreOwnerModelSource.includes("Critical Mobile Telegram WebView Visual Fixes") && finalPreOwnerQaSource.includes("Critical Mobile Telegram WebView Visual Fixes"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "screenshotFindings",
  "criticalIssues",
  "fixesApplied",
  "mobileGridRules",
  "vipPreviewRules",
  "userFacingCopyRules",
  "textWrappingRules",
  "telegramWebViewRules",
  "safetyBoundaries",
  "whatWasNotChanged",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const phrase of [
  "two-column narrow cards",
  "broken English text wrapping",
  "VIP preview narrow columns",
  "huge empty columns",
  "<=430px",
  "one-column",
  "AphroditeLockedPreviewCard",
  "No active payment",
  "no real VIP unlock",
  "Полный разбор пары",
  "Календарь пары",
  "Матрица Pro",
  "Карточка результата",
  "Без оплаты",
  "VIP закрыт",
  "Preview-режим",
  "360px",
  "390px",
  "430px",
  "Telegram Android WebView",
  "Package 268 - Owner Visual Recheck After Mobile Fixes",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.toLowerCase().includes(phrase.toLowerCase()) || modelText.includes(phrase.toLowerCase()));
}

for (const route of ["/miniapp", "/miniapp?startapp=mystic", "/birth-matrix", "/vip-preview", "/vip-compatibility-report", "/compatibility"]) {
  check(`live route documented: ${route}`, model.liveRoutes.includes(route) && implementationBundle.includes(route));
}

for (const util of [
  ".aphrodite-pkg-267-mobile-webview-fix",
  ".aphrodite-pkg-267-card-fix",
  ".aphrodite-pkg-267-text-fix",
  ".aphrodite-pkg-267-two-after-430",
  ".aphrodite-pkg-267-three-after-430",
  ".aphrodite-pkg-267-bottom-nav-fix",
]) {
  check(`Package 267 CSS utility exists: ${util}`, globalsSource.includes(util));
}

for (const marker of [
  'data-aphrodite-critical-mobile-webview-visual-fix="package-267"',
  'data-aphrodite-critical-mobile-webview-bottom-nav="package-267"',
  "aphrodite-pkg-267-two-after-430",
  "aphrodite-pkg-267-three-after-430",
  "aphrodite-pkg-267-text-fix",
]) {
  check(`Package 267 live marker/class exists: ${marker}`, liveBundle.includes(marker));
}

check("aphrodite-wrap-anywhere avoids aggressive anywhere wrapping", globalsSource.includes(".aphrodite-wrap-anywhere") && !/\.aphrodite-wrap-anywhere\s*\{[^}]*overflow-wrap:\s*anywhere/i.test(globalsSource));
check("user-facing English issue examples not present in live components", !/Full relationship report|Full compatibility report|VIP locked preview|No active payment\. No VIP unlock|Owner review is still required/i.test(liveBundle));
check("Russian replacement copy present in live components", /Полный разбор отношений|Полный разбор совместимости|VIP preview закрыт|Без оплаты|VIP закрыт|Карточка результата/.test(liveBundle));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no channel mapping flag", model.safetyFlags.channelMappingsChanged === false);
check("no calculations flag", model.safetyFlags.calculationsChanged === false);
check("no date parsing flag", model.safetyFlags.dateParsingValidationChanged === false);
check("no Mystic random/storage flag", model.safetyFlags.mysticSelectionRandomStorageChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no entitlement bypass flag", model.safetyFlags.entitlementBypassAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets flag", model.safetyFlags.secretsAdded === false);
check("no production DB flag", model.safetyFlags.productionDbConnected === false);
check("owner approval not granted flag", model.safetyFlags.ownerApprovalGranted === false);

const changedFiles = gitChangedNames([
  "app",
  "components",
  "lib",
  "scripts",
  "docs",
  "package.json",
  ".github",
  "vercel.json",
  "prisma",
  "supabase",
  "migrations",
  "schema.prisma",
  ".env",
  ".env.example",
]);
check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));

const allowedChanges = new Set([
  "app/globals.css",
  "app/miniapp/page.tsx",
  "app/birth-matrix/BirthMatrixClient.tsx",
  "app/vip-preview/page.tsx",
  "app/vip-compatibility-report/VipCompatibilityReportClient.tsx",
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes/page.tsx",
  "app/dashboard/networks/zodiac/public-miniapp-route-shell-isolation/page.tsx",
  "components/AppShell.tsx",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "components/zodiac-mini-app/AphroditeHomeScreen.tsx",
  "components/zodiac-mini-app/MainMenuSections.tsx",
  "components/zodiac-mini-app/MiniAppHeader.tsx",
  "components/zodiac-mini-app/ProfileRetentionPanel.tsx",
  "components/zodiac-mini-app/ResultCards.tsx",
  "components/zodiac-mini-app/SoftLaunchFeedbackPanel.tsx",
  "components/zodiac-mini-app/WizardControls.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeShareCard.tsx",
  "docs/aphrodite-critical-mobile-telegram-webview-visual-fixes.md",
  "docs/aphrodite-public-miniapp-route-shell-isolation.md",
  "docs/aphrodite-package-reports/package-267.md",
  "docs/aphrodite-package-reports/package-271.md",
  "lib/zodiac/aphrodite-critical-mobile-telegram-webview-visual-fixes.ts",
  "lib/zodiac/aphrodite-public-miniapp-route-shell-isolation.ts",
  "lib/zodiac/aphrodite-final-pre-owner-review-summary.ts",
  "lib/zodiac/zodiac-vip-compatibility-report-foundation.ts",
  "lib/zodiac/zodiac-vip-preview.ts",
  "scripts/qa-aphrodite-critical-mobile-telegram-webview-visual-fixes.mjs",
  "scripts/qa-aphrodite-public-miniapp-route-shell-isolation.mjs",
  "scripts/qa-aphrodite-final-pre-owner-review-summary.mjs",
  "scripts/qa-aphrodite-result-share-cards.mjs",
  "scripts/qa-aphrodite-telegram-webview-mobile-polish.mjs",
  "scripts/qa-aphrodite-vip-locked-preview-redesign.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
const unexpectedChanges = changedFiles.filter((file) => !allowedChanges.has(file));
check("only Package 267-scoped files changed", unexpectedChanges.length === 0);
if (unexpectedChanges.length) {
  console.log("Unexpected changed files:", unexpectedChanges.join(", "));
}

check("no workflow/cron changes", gitChangedNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitChangedNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitChangedNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitChangedNames(["prisma", "supabase", "migrations", "schema.prisma"]).length === 0);
check("no env or secret files changed", gitChangedNames([".env", ".env.local", ".env.production", ".env.example"]).length === 0);

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(implementationBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(implementationBundle));
check("no DB/storage write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(implementationBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(implementationBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(implementationBundle));

console.log(`\nAphrodite Critical Mobile Telegram WebView Visual Fixes QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
