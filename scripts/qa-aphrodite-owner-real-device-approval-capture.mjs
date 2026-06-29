#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_ROUTE,
  APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_TITLE,
  getAphroditeOwnerRealDeviceApprovalCapture,
} from "../lib/zodiac/aphrodite-owner-real-device-approval-capture.ts";

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

console.log("Starting QA: Aphrodite Owner Real Device Approval Capture...\n");

const modelPath = "../lib/zodiac/aphrodite-owner-real-device-approval-capture.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/owner-real-device-approval-capture/page.tsx";
const docsPath = "../docs/aphrodite-owner-real-device-approval-capture.md";
const reportPath = "../docs/aphrodite-package-reports/package-287.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
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
const model = getAphroditeOwnerRealDeviceApprovalCapture();

check("title exported", model.title === APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_TITLE);
check("route exported", model.route === APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_ROUTE);
check("package number is 287", model.packageNumber === 287);
check("currentMainHead recorded", model.currentMainHead === "86e77cf54a4bcb965a3a9614821c3061f7b17818");
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard nav link exists", dashboardSource.includes(APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("ownerRealDeviceApprovalCapture"));
check("docs/report exist", docsSource.includes("Package 287") && reportSource.includes("Package 287"));
check("approval status is PENDING_OWNER_REVIEW", model.ownerApprovalStatus === "PENDING_OWNER_REVIEW" && implementationBundle.includes("PENDING_OWNER_REVIEW"));
check("ownerRealDeviceApproval=false", model.ownerRealDeviceApproval === false && implementationBundle.includes("ownerRealDeviceApproval = false"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));
check("screenshots required recorded", model.screenshotsRequired === model.requiredScreens.length && model.screenshotsRequired >= 10);
check("screenshots received remains zero", model.screenshotsReceived === 0 && implementationBundle.includes("screenshots received: 0"));

for (const field of [
  "requiredScreens",
  "requiredDeviceChecks",
  "evidenceSources",
  "unresolvedProductionBlockers",
  "safetyBoundaries",
  "whatThisPackageDoesNotDo",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const screen of [
  "/miniapp",
  "/compatibility",
  "/birth-matrix",
  "/vip-preview",
  "/vip-compatibility-report",
  "/miniapp?startapp=mystic",
  "bottom nav",
  "date input 01012000 -> 01.01.2000",
  "time input",
  "city input Днепр / Дніпро",
]) {
  check(`required screen documented: ${screen}`, implementationBundle.includes(screen));
}

for (const device of ["Android Telegram WebView", "iPhone Telegram WebView if available", "desktop browser sanity optional"]) {
  check(`device check documented: ${device}`, implementationBundle.includes(device));
}

for (const blocker of ["DATABASE_URL missing", "TELEGRAM_BOT_TOKEN missing", "backup older than 24h"]) {
  check(`production blocker documented: ${blocker}`, implementationBundle.includes(blocker));
}

check("evidence folder documented", implementationBundle.includes("docs/aphrodite-screenshots/package-275"));
check("Package 275 screenshot count documented", implementationBundle.includes("Package 275 screenshot count: 19") || implementationBundle.includes("contains 19 screenshots"));
check("duplicate validation PASS documented", implementationBundle.includes("duplicate validation: PASS") || implementationBundle.includes("duplicate validation PASS"));
check("public routes isolated PASS documented", implementationBundle.includes("public routes isolated: PASS") || implementationBundle.includes("Public Mini App routes remain isolated"));
check("next package is Package 288", model.nextPackageRecommendation === "Package 288 - Manual Env Setup Execution");

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
check("no workflow/cron/publish/package/db/env files changed", riskyChangedFiles.length === 0);
if (riskyChangedFiles.length) {
  console.log("Unexpected risky changed files:", riskyChangedFiles.join(", "));
}

check("no .env.local committed", git(["ls-files", ".env.local"]) === "");
check("no real secrets committed", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(implementationBundle));
check("no Telegram API/send code added", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no BotFather implementation added", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(implementationBundle));
check("no DB write added", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(implementationBundle));
check("no payment added", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no VIP unlock added", !/createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("launch flags not approved", !/publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false|ownerRealDeviceApproval:\s*true/i.test(implementationBundle));
check("no external analytics added", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(implementationBundle));

console.log(`\nAphrodite Owner Real Device Approval Capture QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
