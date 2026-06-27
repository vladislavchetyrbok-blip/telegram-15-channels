#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_ROUTE,
  APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_TITLE,
  getAphroditeSoftLaunchScopeSelector,
} from "../lib/zodiac/aphrodite-soft-launch-scope-selector.ts";

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

function hasAll(source, needles) {
  return needles.every((needle) => source.includes(needle));
}

console.log("Starting QA: Aphrodite Soft Launch Scope Selector...\n");

const modelPath = "../lib/zodiac/aphrodite-soft-launch-scope-selector.ts";
const pagePath = "../app/dashboard/networks/zodiac/soft-launch-scope-selector/page.tsx";
const docsPath = "../docs/aphrodite-soft-launch-scope-selector.md";
const reportPath = "../docs/aphrodite-package-reports/package-248.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["static model", modelPath],
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
const model = getAphroditeSoftLaunchScopeSelector();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_TITLE);
check("route exported", model.route === APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_ROUTE);
check("package number is 248", model.packageNumber === 248);
check("dashboard page uses readiness page", pageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("softLaunchScopeSelector"));
check("docs/report exist", docsSource.includes("Package 248") && reportSource.includes("Package 248"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));
check("current state remains approval not granted", model.currentOwnerDecisionState === "APPROVAL NOT GRANTED" && implementationBundle.includes("APPROVAL NOT GRANTED"));
check("next package recommendation documented", model.nextPackageRecommendation === "Package 249 - Soft Launch Preflight Checklist" && implementationBundle.includes("Package 249 - Soft Launch Preflight Checklist"));

check("required model fields exist", [
  "recommendedScope",
  "excludedScope",
  "candidateChannels",
  "candidateMiniAppFlows",
  "manualPrerequisites",
  "safetyBoundaries",
  "launchModes",
  "rollbackConditions",
  "stopConditions",
  "monitoringChecklist",
  "ownerDecisionStates",
  "nextPackageRecommendation",
].every((field) => Object.hasOwn(model, field) && implementationBundle.includes(field)));

check("recommended smallest scope documented", hasAll(implementationBundle, [
  "recommended smallest scope",
  "Internal owner review only",
  "Private link smoke review",
  "One safe test channel",
  "One sign channel",
  "General channel only",
]));

check("excluded full launch scope documented", hasAll(implementationBundle, [
  "full 13-channel rollout",
  "real Telegram Stars payment",
  "VIP unlock",
  "paid MVP",
  "external ads",
  "influencer traffic",
  "automated production campaign",
  "BotFather changes without manual checklist",
]));

for (const flow of [
  "Home",
  "Compatibility",
  "Birth Matrix",
  "Mystic Cards",
  "VIP preview locked-only",
  "Result/share cards preview-only",
]) {
  check(`candidate Mini App flow documented: ${flow}`, model.candidateMiniAppFlows.some((item) => item.area === flow) && implementationBundle.includes(flow));
}

for (const blocker of [
  "DATABASE_URL configured manually",
  "TELEGRAM_BOT_TOKEN configured manually",
  "backup freshness <24h confirmed",
  "restore rehearsal completed",
  "real-device QA completed manually",
  "Telegram WebView/startapp QA completed manually",
  "content/CTA owner review completed",
  "owner explicit approval",
  "rollback plan understood",
]) {
  check(`manual prerequisite documented: ${blocker}`, model.manualPrerequisites.some((item) => item.area === blocker) && implementationBundle.includes(blocker));
}

for (const state of [
  "NOT READY",
  "READY FOR OWNER REVIEW",
  "BLOCKED BY ENV",
  "BLOCKED BY BACKUP",
  "BLOCKED BY REAL DEVICE QA",
  "BLOCKED BY TELEGRAM WEBVIEW QA",
  "BLOCKED BY CONTENT CTA REVIEW",
  "APPROVAL NOT GRANTED",
  "READY FOR LIMITED SOFT LAUNCH, as future state only",
]) {
  check(`owner decision state documented: ${state}`, model.ownerDecisionStates.some((item) => item.area === state) && implementationBundle.includes(state));
}

for (const stopCondition of [
  "Telegram WebView broken",
  "content/CTA confusion",
  "payment or VIP appears active",
  "runtime errors or high-risk visual issues",
]) {
  check(`stop condition documented: ${stopCondition}`, model.stopConditions.some((item) => item.area === stopCondition) && implementationBundle.includes(stopCondition));
}

for (const rollbackCondition of [
  "fresh backup verified",
  "last known good commit recorded",
  "stop owner identified",
]) {
  check(`rollback condition documented: ${rollbackCondition}`, model.rollbackConditions.some((item) => item.area === rollbackCondition) && implementationBundle.includes(rollbackCondition));
}

for (const item of [
  "Mini App smoke status",
  "Telegram WebView/startapp behavior",
  "content/CTA owner review",
  "no payment, no VIP unlock, no entitlement bypass",
]) {
  check(`monitoring checklist item documented: ${item}`, model.monitoringChecklist.some((entry) => entry.area === item) && implementationBundle.includes(item));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no channel mapping change flag", model.safetyFlags.channelMappingsChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no entitlement bypass flag", model.safetyFlags.entitlementBypassAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);
check("manual checks not marked complete", model.safetyFlags.manualChecksMarkedComplete === false);
check("publicLaunchApproved flag stays false", model.safetyFlags.publicLaunchApproved === false);
check("ownerManualReviewRequired flag stays true", model.safetyFlags.ownerManualReviewRequired === true);

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
]);
const allowedChangedFiles = new Set([
  "lib/zodiac/aphrodite-soft-launch-scope-selector.ts",
  "app/dashboard/networks/zodiac/soft-launch-scope-selector/page.tsx",
  "scripts/qa-aphrodite-soft-launch-scope-selector.mjs",
  "docs/aphrodite-soft-launch-scope-selector.md",
  "docs/aphrodite-package-reports/package-248.md",
  "app/dashboard/networks/zodiac/page.tsx",
  "scripts/qa-zodiac-dashboard.mjs",
]);

check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
check("only Package 248-scoped files changed", changedFiles.every((file) => allowedChangedFiles.has(file)));
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
check("no env or secret files changed", gitChangedNames([".env", ".env.local", ".env.example"]).length === 0);

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no entitlement bypass implementation", !/entitlementBypassAdded:\s*true|bypassEntitlement|skipEntitlement|vipUnlockAdded:\s*true/i.test(safetyBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
