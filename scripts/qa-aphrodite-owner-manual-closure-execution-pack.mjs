#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_OWNER_MANUAL_CLOSURE_EXECUTION_PACK_ROUTE,
  APHRODITE_OWNER_MANUAL_CLOSURE_EXECUTION_PACK_TITLE,
  getAphroditeOwnerManualClosureExecutionPack,
} from "../lib/zodiac/aphrodite-owner-manual-closure-execution-pack.ts";

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

console.log("Starting QA: Aphrodite Owner Manual Closure Execution Pack...\n");

const modelPath = "../lib/zodiac/aphrodite-owner-manual-closure-execution-pack.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/owner-manual-closure-execution-pack/page.tsx";
const docsPath = "../docs/aphrodite-owner-manual-closure-execution-pack.md";
const reportPath = "../docs/aphrodite-package-reports/package-292.md";
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
const model = getAphroditeOwnerManualClosureExecutionPack();

check("title exported", model.title === APHRODITE_OWNER_MANUAL_CLOSURE_EXECUTION_PACK_TITLE);
check("route exported", model.route === APHRODITE_OWNER_MANUAL_CLOSURE_EXECUTION_PACK_ROUTE);
check("package number is 292", model.packageNumber === 292);
check("currentMainHead recorded", model.currentMainHead === "cf2b9a700bd06712d153cfea619fc7e82a1f6c00");
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard nav link exists", dashboardSource.includes(APHRODITE_OWNER_MANUAL_CLOSURE_EXECUTION_PACK_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("ownerManualClosureExecutionPack"));
check("docs/report exist", docsSource.includes("Package 292") && reportSource.includes("Package 292"));
check("manualClosureStatus ready", model.manualClosureStatus === "READY_FOR_OWNER_MANUAL_EXECUTION");
check("blockersRemainOpen=true", model.blockersRemainOpen === true && implementationBundle.includes("blockersRemainOpen=true"));
check("allBlockers count is seven", model.allBlockers.length === 7);
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));
check("soft launch remains NO", model.softLaunchApproved === false && implementationBundle.includes("soft launch: NO"));
check("owner action still required", model.ownerActionStillRequired === true && implementationBundle.includes("owner action still required"));

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
  "manualClosureStatus",
  "blockersRemainOpen",
  "executionOrder",
  "ownerActions",
  "evidenceTemplates",
  "redactedVerificationRules",
  "forbiddenActions",
  "launchGateState",
  "safetyBoundaries",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

const expectedOrder = [
  "Owner real-device visual approval",
  "Configure DATABASE_URL outside Git",
  "Configure TELEGRAM_BOT_TOKEN outside Git",
  "Run redacted env presence check",
  "Create/refresh backup under 24h",
  "Run restore rehearsal",
  "Configure PUBLIC_APP_URL",
  "Verify public routes",
  "Manually configure BotFather Mini App URL",
  "Run final production safety check",
  "Only then prepare final owner go/no-go",
];

check("execution order has eleven steps", model.executionOrder.length === 11);
expectedOrder.forEach((phrase, index) => {
  check(`execution order step ${index + 1}: ${phrase}`, model.executionOrder[index]?.area === phrase && implementationBundle.includes(phrase));
});

for (const phrase of [
  "READY_FOR_OWNER_MANUAL_EXECUTION",
  "blockersRemainOpen=true",
  "All seven blockers remain open",
  "Owner real-device visual approval",
  "Configure DATABASE_URL outside Git",
  "Configure TELEGRAM_BOT_TOKEN outside Git",
  "Run redacted env presence check",
  "Create/refresh backup under 24h",
  "Run restore rehearsal",
  "Configure PUBLIC_APP_URL",
  "Verify public routes",
  "Manually configure BotFather Mini App URL",
  "Run final production safety check",
  "Only then prepare final owner go/no-go",
  "Evidence Templates",
  "Redacted Verification Rules",
  "Forbidden Actions",
  "node scripts/check-env-presence-redacted.mjs",
  "node scripts/check-backup-freshness-redacted.mjs",
  "node scripts/check-public-url-routes-redacted.mjs",
  "npm run production:safety:check",
  "publicLaunchApproved=false",
  "ownerManualReviewRequired=true",
  "soft launch: NO",
  "Do not mark blockers closed without evidence.",
  "Package 293 - Owner Real Device Evidence Intake",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.includes(phrase));
}

check("owner actions documented", model.ownerActions.length >= 5 && implementationBundle.includes("Owner Actions"));
check("evidence templates documented", model.evidenceTemplates.length >= 7 && implementationBundle.includes("Evidence Templates"));
check("redacted verification rules documented", model.redactedVerificationRules.length >= 6 && implementationBundle.includes("Redacted Verification Rules"));
check("forbidden actions documented", model.forbiddenActions.length >= 7 && implementationBundle.includes("Forbidden Actions"));
check("launch gate state documented", model.launchGateState.length >= 5 && implementationBundle.includes("Launch Gate State"));

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

console.log(`\nAphrodite Owner Manual Closure Execution Pack QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
