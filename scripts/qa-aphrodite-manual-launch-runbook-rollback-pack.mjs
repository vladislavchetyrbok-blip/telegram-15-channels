#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { gitChangedNames } from "./lib/qa-git-scope.mjs";

import {
  APHRODITE_MANUAL_LAUNCH_NOT_PERFORMED_WORDING,
  APHRODITE_MANUAL_LAUNCH_RUNBOOK_ROLLBACK_PACK_ROUTE,
  APHRODITE_MANUAL_LAUNCH_RUNBOOK_ROLLBACK_PACK_TITLE,
  APHRODITE_MANUAL_LAUNCH_RUNBOOK_STATUSES,
  APHRODITE_REQUIRED_PRE_LAUNCH_CHECKS,
  APHRODITE_ROLLBACK_PLAN,
  getAphroditeManualLaunchRunbookRollbackPack,
} from "../lib/zodiac/aphrodite-manual-launch-runbook-rollback-pack.ts";

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

console.log("Starting QA: Manual Launch Runbook & Rollback Pack...\n");

const modelPath = "../lib/zodiac/aphrodite-manual-launch-runbook-rollback-pack.ts";
const pagePath = "../app/dashboard/networks/zodiac/manual-launch-runbook-rollback-pack/page.tsx";
const docsPath = "../docs/aphrodite-manual-launch-runbook-rollback-pack.md";
const reportPath = "../docs/aphrodite-package-reports/package-222.md";
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
const model = getAphroditeManualLaunchRunbookRollbackPack();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_MANUAL_LAUNCH_RUNBOOK_ROLLBACK_PACK_TITLE);
check("route exported", model.route === APHRODITE_MANUAL_LAUNCH_RUNBOOK_ROLLBACK_PACK_ROUTE);
check("package number is 222", model.packageNumber === 222);
check("dashboard route exists", pageSource.includes("getAphroditeManualLaunchRunbookRollbackPack") && pageSource.includes("model.title"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_MANUAL_LAUNCH_RUNBOOK_ROLLBACK_PACK_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("manualLaunchRunbookRollbackPack"));
check("dashboard QA asserts title", dashboardQaSource.includes("Manual Launch Runbook &amp; Rollback Pack"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));
check("launch not performed wording exists", model.launchNotPerformedWording === APHRODITE_MANUAL_LAUNCH_NOT_PERFORMED_WORDING);
check("launch not performed wording rendered/documented", implementationBundle.includes(APHRODITE_MANUAL_LAUNCH_NOT_PERFORMED_WORDING));

for (const status of APHRODITE_MANUAL_LAUNCH_RUNBOOK_STATUSES) {
  check(`status exists: ${status}`, model.statusLegend.includes(status));
  check(`status rendered/documented: ${status}`, implementationBundle.includes(status));
}

const requiredSections = [
  "Launch freeze status",
  "Required pre-launch checks",
  "Owner approval checklist",
  "Manual launch sequence",
  "Abort conditions",
  "Rollback plan",
  "Post-launch monitoring checklist",
  "Incident response checklist",
  "Current blockers",
  "Safety confirmation",
];

check("all required runbook sections exist", model.sections.length === requiredSections.length);
for (const sectionName of requiredSections) {
  const section = model.sections.find((entry) => entry.title === sectionName);
  check(`runbook section exists: ${sectionName}`, Boolean(section));
  check(`runbook section rendered/documented: ${sectionName}`, implementationBundle.includes(sectionName));
  check(`runbook section has summary: ${sectionName}`, Boolean(section?.summary));
  check(`runbook section has items: ${sectionName}`, Boolean(section?.items.length));
}

for (const preLaunchCheck of APHRODITE_REQUIRED_PRE_LAUNCH_CHECKS) {
  check(`pre-launch check exists: ${preLaunchCheck}`, model.requiredPreLaunchChecks.includes(preLaunchCheck));
  check(`pre-launch check rendered/documented: ${preLaunchCheck}`, implementationBundle.includes(preLaunchCheck));
}

for (const rollbackStep of APHRODITE_ROLLBACK_PLAN) {
  check(`rollback step exists: ${rollbackStep}`, model.rollbackPlan.includes(rollbackStep));
  check(`rollback step rendered/documented: ${rollbackStep}`, implementationBundle.includes(rollbackStep));
}

for (const blocker of [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness",
  "restore rehearsal",
  "real-device QA",
  "Telegram WebView/startapp QA",
  "owner manual approval",
]) {
  check(`remaining blocker exists: ${blocker}`, model.remainingBlockers.includes(blocker));
  check(`remaining blocker rendered/documented: ${blocker}`, implementationBundle.includes(blocker));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no workflow change flag", model.safetyFlags.workflowChanged === false);
check("no publish scripts change flag", model.safetyFlags.publishScriptsChanged === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);
check("docs say Package 222", docsSource.includes("Package 222"));
check("report says Package 222", reportSource.includes("Package 222"));
check("report says launch not performed", reportSource.includes("No production launch was performed."));
check("report says safety confirmation", reportSource.includes("Production launch done: No"));

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
  "app/dashboard/networks/zodiac/manual-launch-runbook-rollback-pack/page.tsx",
  "lib/zodiac/aphrodite-manual-launch-runbook-rollback-pack.ts",
  "scripts/qa-aphrodite-manual-launch-runbook-rollback-pack.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-manual-launch-runbook-rollback-pack.md",
  "docs/aphrodite-package-reports/package-222.md",
]);
check("git scope helper returned real change data for Package 222 readiness layer", !changedFiles.includes("__git_diff_failed__"));

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
