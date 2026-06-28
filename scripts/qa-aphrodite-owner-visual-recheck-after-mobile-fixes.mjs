#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_OWNER_VISUAL_RECHECK_AFTER_MOBILE_FIXES_ROUTE,
  APHRODITE_OWNER_VISUAL_RECHECK_AFTER_MOBILE_FIXES_TITLE,
  getAphroditeOwnerVisualRecheckAfterMobileFixes,
} from "../lib/zodiac/aphrodite-owner-visual-recheck-after-mobile-fixes.ts";

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

console.log("Starting QA: Aphrodite Owner Visual Recheck After Mobile Fixes...\n");

const modelPath = "../lib/zodiac/aphrodite-owner-visual-recheck-after-mobile-fixes.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/owner-visual-recheck-after-mobile-fixes/page.tsx";
const docsPath = "../docs/aphrodite-owner-visual-recheck-after-mobile-fixes.md";
const reportPath = "../docs/aphrodite-package-reports/package-268.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const pkg267ModelPath = "../lib/zodiac/aphrodite-critical-mobile-telegram-webview-visual-fixes.ts";
const pkg267QaPath = "./qa-aphrodite-critical-mobile-telegram-webview-visual-fixes.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
  ["pkg 267 model", pkg267ModelPath],
  ["pkg 267 QA", pkg267QaPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const pkg267ModelSource = exists(pkg267ModelPath) ? read(pkg267ModelPath) : "";
const pkg267QaSource = exists(pkg267QaPath) ? read(pkg267QaPath) : "";
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
  pkg267ModelSource,
  pkg267QaSource,
].join("\n");
const model = getAphroditeOwnerVisualRecheckAfterMobileFixes();
const modelText = textFor(model);

check("title exported", model.title === APHRODITE_OWNER_VISUAL_RECHECK_AFTER_MOBILE_FIXES_TITLE);
check("route exported", model.route === APHRODITE_OWNER_VISUAL_RECHECK_AFTER_MOBILE_FIXES_ROUTE);
check("package number is 268", model.packageNumber === 268);
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_OWNER_VISUAL_RECHECK_AFTER_MOBILE_FIXES_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("ownerVisualRecheckAfterMobileFixes"));
check("docs/report exist", docsSource.includes("Package 268") && reportSource.includes("Package 268"));
check("pkg 267 next package recommendation points to Package 268", pkg267ModelSource.includes("Package 268 - Owner Visual Recheck After Mobile Fixes"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

check("all checked screens present", model.checkedScreens.length >= 6);
check("all checked viewports present", model.checkedViewports.length >= 4);
check("all fixed screenshot issues verified", model.fixedScreenshotIssues.length >= 5);
check("recheck results documented", model.recheckResults.length >= 3);
check("remaining visual issues identified", model.remainingVisualIssues.length >= 2);
check("owner manual requirements outlined", model.ownerManualRequirements.length >= 2);
check("telegram webview requirements outlined", model.telegramWebViewManualRequirements.length >= 2);

check("what was not changed covers non-visual areas", model.whatWasNotChanged.length >= 4);
check("safety boundaries cover forbidden actions", model.safetyBoundaries.length >= 8);

check("no launch flag", model.safetyFlags.publicLaunchApproved === false);
check("no manual review waiver flag", model.safetyFlags.ownerManualReviewRequired === true);
check("no production launch done flag", model.safetyFlags.productionLaunchDone === false);
check("no telegram API used flag", model.safetyFlags.telegramApiUsed === false);
check("no botfather flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no channel mappings flag", model.safetyFlags.channelMappingsChanged === false);
check("no calculations flag", model.safetyFlags.calculationsChanged === false);
check("no date parsing flag", model.safetyFlags.dateParsingValidationChanged === false);
check("no mystic selection random/storage flag", model.safetyFlags.mysticSelectionRandomStorageChanged === false);
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
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/owner-visual-recheck-after-mobile-fixes/page.tsx",
  "docs/aphrodite-owner-visual-recheck-after-mobile-fixes.md",
  "docs/aphrodite-package-reports/package-268.md",
  "lib/zodiac/aphrodite-owner-visual-recheck-after-mobile-fixes.ts",
  "scripts/qa-aphrodite-owner-visual-recheck-after-mobile-fixes.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "package.json",
]);
const unexpectedChanges = changedFiles.filter((file) => !allowedChanges.has(file));
check("only Package 268-scoped files changed", unexpectedChanges.length === 0);
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
check("no DB schema/migration change", gitChangedNames(["prisma", "supabase", "migrations", "schema.prisma"]).length === 0);
check("no env or secret files changed", gitChangedNames([".env", ".env.local", ".env.production", ".env.example"]).length === 0);

const safetyBundle = [modelSource, dashboardPageSource, docsSource, reportSource].join("\n");
check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no DB/storage write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nAphrodite Owner Visual Recheck After Mobile Fixes QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
