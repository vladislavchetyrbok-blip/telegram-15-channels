#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { gitChangedNames } from "./lib/qa-git-scope.mjs";

import {
  APHRODITE_REAL_DEVICE_QA_BLOCKER_SEVERITIES,
  APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_ROUTE,
  APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_TITLE,
  APHRODITE_REAL_DEVICE_QA_EXECUTION_STATUSES,
  APHRODITE_REAL_DEVICE_QA_LAUNCH_NOT_APPROVED_WORDING,
  getAphroditeRealDeviceQaExecutionPack,
} from "../lib/zodiac/aphrodite-real-device-qa-execution-pack.ts";

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

console.log("Starting QA: Real Device QA Execution Pack...\n");

const modelPath = "../lib/zodiac/aphrodite-real-device-qa-execution-pack.ts";
const pagePath = "../app/dashboard/networks/zodiac/real-device-qa-execution-pack/page.tsx";
const docsPath = "../docs/aphrodite-real-device-qa-execution-pack.md";
const reportPath = "../docs/aphrodite-package-reports/package-223.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const model = getAphroditeRealDeviceQaExecutionPack();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_TITLE);
check("route exported", model.route === APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_ROUTE);
check("package number is 223", model.packageNumber === 223);
check("dashboard route exists", pageSource.includes("getAphroditeRealDeviceQaExecutionPack") && pageSource.includes("model.title"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("realDeviceQaExecutionPack"));
check("dashboard QA asserts title", dashboardQaSource.includes("Real Device QA Execution Pack"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));
check("launch not approved wording exists", model.launchGate.launchNotApprovedWording === APHRODITE_REAL_DEVICE_QA_LAUNCH_NOT_APPROVED_WORDING);
check("launch not approved wording rendered/documented", implementationBundle.includes(APHRODITE_REAL_DEVICE_QA_LAUNCH_NOT_APPROVED_WORDING));

for (const status of APHRODITE_REAL_DEVICE_QA_EXECUTION_STATUSES) {
  check(`status exists: ${status}`, model.statuses.includes(status));
  check(`status rendered/documented: ${status}`, implementationBundle.includes(status));
}

for (const severity of APHRODITE_REAL_DEVICE_QA_BLOCKER_SEVERITIES) {
  check(`blocker severity exists: ${severity}`, model.blockerSeverities.includes(severity));
  check(`blocker severity rendered/documented: ${severity}`, implementationBundle.includes(severity));
}

const requiredDeviceSections = [
  "iPhone Safari / mobile browser",
  "Android Chrome / mobile browser, if available",
  "Telegram iOS WebView",
  "Telegram Android WebView, if available",
  "Desktop browser sanity check",
];

check("required device sections count", model.deviceChecks.length === requiredDeviceSections.length);
for (const sectionName of requiredDeviceSections) {
  const section = model.deviceChecks.find((entry) => entry.deviceEnvironment === sectionName);
  check(`required device section exists: ${sectionName}`, Boolean(section));
  check(`required device section rendered/documented: ${sectionName}`, implementationBundle.includes(sectionName));
  check(`device section has expected result: ${sectionName}`, Boolean(section?.expectedResult));
  check(`device section has evidence needed: ${sectionName}`, Boolean(section?.evidenceNeeded));
  check(`device section has screenshot required: ${sectionName}`, section?.screenshotRequired === "Yes" || section?.screenshotRequired === "No");
  check(`device section has blocker severity: ${sectionName}`, Boolean(section?.blockerSeverity));
  check(`device section has notes: ${sectionName}`, Boolean(section?.notes));
}

const requiredMiniAppFlows = [
  "Mini App main screen opens",
  "Telegram WebApp ready/expand behavior",
  "Back button behavior",
  "Haptics behavior, if available",
  "startapp/deep link behavior",
  "fallback browser mode",
  "cache/live version marker",
  "compatibility flow",
  "Birth Matrix flow",
  "Mystic Cards flow",
  "VIP locked state",
  "CTA visibility",
  "no payment shown as active",
  "no VIP unlock without entitlement",
];

check("required Mini App flow sections count", model.miniAppFlowChecks.length === requiredMiniAppFlows.length);
for (const flowName of requiredMiniAppFlows) {
  const flow = model.miniAppFlowChecks.find((entry) => entry.flow === flowName);
  check(`required Mini App flow exists: ${flowName}`, Boolean(flow));
  check(`required Mini App flow rendered/documented: ${flowName}`, implementationBundle.includes(flowName));
  check(`Mini App flow has expected result: ${flowName}`, Boolean(flow?.expectedResult));
  check(`Mini App flow has evidence needed: ${flowName}`, Boolean(flow?.evidenceNeeded));
  check(`Mini App flow has screenshot required: ${flowName}`, flow?.screenshotRequired === "Yes" || flow?.screenshotRequired === "No");
  check(`Mini App flow has blocker severity: ${flowName}`, Boolean(flow?.blockerSeverity));
  check(`Mini App flow has notes: ${flowName}`, Boolean(flow?.notes));
}

const requiredOwnerEvidence = [
  "screenshots checklist",
  "date/time of manual check",
  "device used",
  "Telegram app version manual field",
  "public URL/manual launch URL checked",
  "owner sign-off still required",
];

for (const evidenceName of requiredOwnerEvidence) {
  const evidence = model.ownerEvidenceFields.find((entry) => entry.label === evidenceName);
  check(`owner evidence field exists: ${evidenceName}`, Boolean(evidence));
  check(`owner evidence field rendered/documented: ${evidenceName}`, implementationBundle.includes(evidenceName));
  check(`owner evidence field has expected entry: ${evidenceName}`, Boolean(evidence?.expectedEntry));
}

for (const screenshotItem of [
  "iPhone Safari / mobile browser first viewport",
  "Telegram iOS WebView main screen",
  "Mini App main screen opens",
  "startapp/deep link behavior",
  "cache/live version marker",
  "compatibility flow",
  "Birth Matrix flow",
  "Mystic Cards flow",
  "VIP locked state",
  "CTA visibility",
  "no payment shown as active",
  "no VIP unlock without entitlement",
]) {
  check(`screenshot checklist item exists: ${screenshotItem}`, model.screenshotsChecklist.includes(screenshotItem));
  check(`screenshot checklist item rendered/documented: ${screenshotItem}`, implementationBundle.includes(screenshotItem));
}

check("owner manual review exists", model.ownerEvidenceFields.some((field) => field.status === "OWNER REVIEW REQUIRED"));
check("launch gate publicLaunchApproved=false", model.launchGate.publicLaunchApproved === false);
check("launch gate ownerManualReviewRequired=true", model.launchGate.ownerManualReviewRequired === true);
check("launch gate requires manual QA before soft launch", model.launchGate.requiredBeforeSoftLaunch.some((item) => item.includes("Telegram WebView checks")));
check("evidence/screenshot wording exists", /Evidence needed|Screenshot required|screenshots checklist/i.test(implementationBundle));
check("soft launch gate wording exists", implementationBundle.toLowerCase().includes("real-device qa must be completed manually before soft launch"));

for (const blocker of [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness <24h",
  "restore rehearsal",
  "real-device QA manual execution",
  "Telegram WebView/startapp manual QA",
  "content/CTA owner review",
  "owner manual approval",
]) {
  check(`remaining blocker exists: ${blocker}`, model.remainingBlockers.includes(blocker));
  check(`remaining blocker rendered/documented: ${blocker}`, implementationBundle.includes(blocker));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);
check("next package is Package 224", model.nextRecommendedPackage === "Package 224 — Production Env Setup Protocol");
check("docs say Package 223", docsSource.includes("Package 223"));
check("report says Package 223", reportSource.includes("Package 223"));
check("report says launch not performed", reportSource.includes("No production launch was performed."));
check("report says next recommended package", reportSource.includes("Package 224 — Production Env Setup Protocol"));

check("live Mini App source files not changed", gitChangedNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
]).length === 0);
check("no workflow/cron changes", gitChangedNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitChangedNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitChangedNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitChangedNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no secret files changed", gitChangedNames([
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.development.local",
]).length === 0);

const changedFiles = gitChangedNames(["app", "lib", "scripts", "docs", "package.json", ".github", "vercel.json", "prisma", "supabase", "migrations", "schema.prisma", ".env", ".env.local", ".env.production"]);
const allowedChanges = new Set([
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/real-device-qa-execution-pack/page.tsx",
  "lib/zodiac/aphrodite-real-device-qa-execution-pack.ts",
  "scripts/qa-aphrodite-real-device-qa-execution-pack.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-real-device-qa-execution-pack.md",
  "docs/aphrodite-package-reports/package-223.md",
]);
check("git scope helper returned real change data for Package 223 readiness layer", !changedFiles.includes("__git_diff_failed__"));

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,}\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|prisma\.[a-zA-Z0-9_]+|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(|createClient\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
