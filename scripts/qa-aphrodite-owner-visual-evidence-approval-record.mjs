#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_OWNER_VISUAL_EVIDENCE_APPROVAL_RECORD_ROUTE,
  APHRODITE_OWNER_VISUAL_EVIDENCE_APPROVAL_RECORD_TITLE,
  getAphroditeOwnerVisualEvidenceApprovalRecord,
} from "../lib/zodiac/aphrodite-owner-visual-evidence-approval-record.ts";

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

function fileCount(rel, ext) {
  const url = new URL(rel, import.meta.url);
  return existsSync(url) ? readdirSync(url).filter((name) => name.endsWith(ext)).length : 0;
}

console.log("Starting QA: Aphrodite Owner Visual Evidence Approval Record...\n");

const modelPath = "../lib/zodiac/aphrodite-owner-visual-evidence-approval-record.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/owner-visual-evidence-approval-record/page.tsx";
const docsPath = "../docs/aphrodite-owner-visual-evidence-approval-record.md";
const reportPath = "../docs/aphrodite-package-reports/package-277.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const evidenceFolderPath = "../docs/aphrodite-screenshots/package-275";
const package275QaPath = "./qa-aphrodite-package-275-screenshot-evidence.mjs";
const duplicateHashReportPath = "../docs/aphrodite-screenshots/package-275/duplicate-hash-report.md";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
  ["evidence folder", evidenceFolderPath],
  ["package-275 screenshot QA script", package275QaPath],
  ["duplicate hash report", duplicateHashReportPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const duplicateReportSource = exists(duplicateHashReportPath) ? read(duplicateHashReportPath) : "";
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const model = getAphroditeOwnerVisualEvidenceApprovalRecord();

check("title exported", model.title === APHRODITE_OWNER_VISUAL_EVIDENCE_APPROVAL_RECORD_TITLE);
check("route exported", model.route === APHRODITE_OWNER_VISUAL_EVIDENCE_APPROVAL_RECORD_ROUTE);
check("package number is 277", model.packageNumber === 277);
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard nav link exists", dashboardSource.includes(APHRODITE_OWNER_VISUAL_EVIDENCE_APPROVAL_RECORD_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("ownerVisualEvidenceApprovalRecord"));
check("docs/report exist", docsSource.includes("Package 277") && reportSource.includes("Package 277"));
check("evidence folder is package 275", model.reviewedEvidenceFolder === "docs/aphrodite-screenshots/package-275");
check("screenshot count is 19", model.screenshotCount === 19 && fileCount(evidenceFolderPath, ".png") === 19);
check("duplicate hash validation status PASS", model.duplicateHashValidationStatus === "PASS" && duplicateReportSource.includes("Duplicate hash groups: 0"));
check("ownerVisualEvidenceStatus is READY_FOR_OWNER_REVIEW", model.ownerVisualEvidenceStatus === "READY_FOR_OWNER_REVIEW");
check("ownerApprovalGranted=false", model.ownerApprovalGranted === false && implementationBundle.includes("ownerApprovalGranted: false"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "currentMainHead",
  "reviewedEvidenceFolder",
  "screenshotCount",
  "duplicateHashValidationStatus",
  "coveredScreens",
  "productionBlockers",
  "safetyBoundaries",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const screen of [
  "/miniapp",
  "startapp compatibility",
  "startapp birth_matrix",
  "startapp mystic",
  "startapp vip",
  "/compatibility entry/result",
  "/birth-matrix entry/result",
  "mystic entry/result",
  "/vip-preview",
  "bottom nav",
  "date auto-format",
  "time input",
  "city autocomplete Dnepr/Dnipro",
  "RU guards for /affirmations",
  "RU guards for /mystic-numbers",
]) {
  check(`covered screen documented: ${screen}`, implementationBundle.includes(screen) && model.coveredScreens.some((row) => row.area === screen));
}

for (const blocker of ["DATABASE_URL missing", "TELEGRAM_BOT_TOKEN missing", "backup older than 24h"]) {
  check(`production blocker documented: ${blocker}`, implementationBundle.includes(blocker) && model.remainingBlockers.includes(blocker));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather flag", model.safetyFlags.botFatherChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets flag", model.safetyFlags.secretsAdded === false);

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

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(implementationBundle));
check("no Telegram API/send code added", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no BotFather implementation added", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(implementationBundle));
check("no DB write added", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(implementationBundle));
check("no payment added", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no VIP unlock added", !/createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("launch flags not approved", !/publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(implementationBundle));
check("no external analytics added", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(implementationBundle));

console.log(`\nAphrodite Owner Visual Evidence Approval Record QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
