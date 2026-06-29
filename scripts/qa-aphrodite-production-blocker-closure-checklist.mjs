#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_ROUTE,
  APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_TITLE,
  getAphroditeProductionBlockerClosureChecklist,
} from "../lib/zodiac/aphrodite-production-blocker-closure-checklist.ts";

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

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

console.log("Starting QA: Aphrodite Production Blocker Closure Checklist...\n");

const modelPath = "../lib/zodiac/aphrodite-production-blocker-closure-checklist.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/production-blocker-closure-checklist/page.tsx";
const docsPath = "../docs/aphrodite-production-blocker-closure-checklist.md";
const reportPath = "../docs/aphrodite-package-reports/package-291.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, itemPath] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(itemPath));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const model = getAphroditeProductionBlockerClosureChecklist();

check("title exported", model.title === APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_TITLE);
check("route exported", model.route === APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_ROUTE);
check("package number is 291", model.packageNumber === 291);
check("currentMainHead recorded", model.currentMainHead === "4147b476163424f826cedd39172055ac60d51d8b");
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard nav link exists", dashboardSource.includes(APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("productionBlockerClosureChecklist"));
check("docs/report exist", docsSource.includes("Package 291") && reportSource.includes("Package 291"));
check("productionBlockerClosureStatus blocked", model.productionBlockerClosureStatus === "BLOCKED_MANUAL_CLOSURE_REQUIRED");
check("allBlockers count is seven", model.allBlockers.length === 7);
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));
check("soft launch remains NO", model.softLaunchApproved === false && implementationBundle.includes("soft launch: NO"));

const expectedBlockers = new Map([
  ["ownerRealDeviceApproval", "PENDING"],
  ["databaseUrl", "MISSING"],
  ["telegramBotToken", "MISSING"],
  ["backupFreshness", "STALE"],
  ["restoreRehearsal", "REQUIRED_NOT_COMPLETED"],
  ["publicAppUrl", "MISSING"],
  ["botFatherMiniAppUrl", "NOT_DONE"],
]);

for (const [key, status] of expectedBlockers) {
  const blocker = model.allBlockers.find((item) => item.key === key);
  check(`blocker documented: ${key}`, Boolean(blocker) && implementationBundle.includes(key));
  check(`blocker remains open: ${key}=${status}`, blocker?.status === status && implementationBundle.includes(`${key} = ${status}`));
}

for (const field of [
  "allBlockers",
  "closureCriteria",
  "evidenceRequired",
  "safeVerificationCommands",
  "ownerManualActions",
  "blockedUntil",
  "launchGateSummary",
  "safetyBoundaries",
  "whatThisPackageDoesNotDo",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const phrase of [
  "BLOCKED_MANUAL_CLOSURE_REQUIRED",
  "Owner provides real Telegram WebView screenshots or explicit approval.",
  "DATABASE_URL configured only outside Git",
  "Redacted presence check says present",
  "TELEGRAM_BOT_TOKEN configured only outside Git",
  "No token validation through Telegram API in this package.",
  "verified evidence <24h",
  "documented rehearsal completed and evidence recorded",
  "HTTPS public URL exists",
  "routes pass public check",
  "no dashboard/admin shell",
  "owner manually configured in BotFather after approval",
  "node scripts/check-env-presence-redacted.mjs",
  "node scripts/check-backup-freshness-redacted.mjs",
  "node scripts/check-public-url-routes-redacted.mjs",
  "npm run production:safety:check",
  "Do not mark blockers closed without evidence.",
  "Package 292 - Owner Manual Closure Execution Pack",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.includes(phrase));
}

check("evidence requirements documented", model.evidenceRequired.length >= 6 && implementationBundle.includes("Evidence Required"));
check("safe verification commands documented", model.safeVerificationCommands.length >= 5 && implementationBundle.includes("Safe Verification Commands"));
check("owner manual actions documented", model.ownerManualActions.length >= 4 && implementationBundle.includes("Owner Manual Actions"));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather flag", model.safetyFlags.botFatherChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no production DB connection flag", model.safetyFlags.productionDbConnected === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets flag", model.safetyFlags.secretsAdded === false);
check("no .env.local committed flag", model.safetyFlags.envLocalCommitted === false);
check("no false blocker closure flag", model.safetyFlags.blockersClosedWithoutEvidence === false);

const riskyChangedFiles = gitChangedNames([
  ".github",
  "vercel.json",
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
  "package.json",
  "prisma",
  "supabase",
  "migrations",
  "schema.prisma",
  ".env",
  ".env.local",
  ".env.production",
]);
check("no cron/workflow/publish/package/db/env files changed", riskyChangedFiles.length === 0);
if (riskyChangedFiles.length) {
  console.log("Unexpected risky changed files:", riskyChangedFiles.join(", "));
}

check("no .env.local committed", git(["ls-files", ".env.local"]) === "");
check("no real DATABASE_URL value committed", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/)/i.test(implementationBundle));
check("no real TELEGRAM_BOT_TOKEN value committed", !/(https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b)/i.test(implementationBundle));
check("no real secrets committed", !/(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,}/i.test(implementationBundle));
check("no Telegram API/send code added", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no BotFather automation added", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook|answerWebAppQuery/i.test(implementationBundle));
check("no DB write added", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(implementationBundle));
check("no payment added", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no VIP unlock added", !/createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("launch and blockers not approved", !/publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false|softLaunchApproved:\s*true|blockersClosedWithoutEvidence:\s*true/i.test(implementationBundle));
check("no external analytics added", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(implementationBundle));

console.log(`\nAphrodite Production Blocker Closure Checklist QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
