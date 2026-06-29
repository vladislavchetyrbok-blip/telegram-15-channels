#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_BACKUP_FRESHNESS_VERIFICATION_ROUTE,
  APHRODITE_BACKUP_FRESHNESS_VERIFICATION_TITLE,
  getAphroditeBackupFreshnessVerification,
} from "../lib/zodiac/aphrodite-backup-freshness-verification.ts";

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

console.log("Starting QA: Aphrodite Backup Freshness Verification...\n");

const modelPath = "../lib/zodiac/aphrodite-backup-freshness-verification.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/backup-freshness-verification/page.tsx";
const docsPath = "../docs/aphrodite-backup-freshness-verification.md";
const reportPath = "../docs/aphrodite-package-reports/package-289.md";
const redactedScriptPath = "./check-backup-freshness-redacted.mjs";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, itemPath] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["redacted backup freshness script", redactedScriptPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(itemPath));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const redactedScriptSource = exists(redactedScriptPath) ? read(redactedScriptPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  redactedScriptSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const model = getAphroditeBackupFreshnessVerification();

check("title exported", model.title === APHRODITE_BACKUP_FRESHNESS_VERIFICATION_TITLE);
check("route exported", model.route === APHRODITE_BACKUP_FRESHNESS_VERIFICATION_ROUTE);
check("package number is 289", model.packageNumber === 289);
check("currentMainHead recorded", model.currentMainHead === "dbea676ec2f1e3a623429a4a3dea40f43b68487b");
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard nav link exists", dashboardSource.includes(APHRODITE_BACKUP_FRESHNESS_VERIFICATION_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("backupFreshnessVerification"));
check("docs/report exist", docsSource.includes("Package 289") && reportSource.includes("Package 289"));
check("backupFreshnessStatus blocked", model.backupFreshnessStatus === "BLOCKED_STALE_OR_UNVERIFIED_BACKUP");
check("restoreRehearsalStatus required", model.restoreRehearsalStatus === "REQUIRED_NOT_COMPLETED");
check("24h requirement documented", model.backupFreshnessRequiredHours === 24 && implementationBundle.includes("newer than 24h before launch"));
check("latest backup path documented", model.latestBackupEvidencePath === "data/backups/2026-06-20-01-09-37" && implementationBundle.includes("data/backups/2026-06-20-01-09-37"));
check("latest backup age documented stale", typeof model.latestBackupAgeHours === "number" && model.latestBackupAgeHours >= 24);
check("backup not marked fresh", model.backupMarkedFresh === false && implementationBundle.includes("backup marked fresh=false"));
check("owner action still required", model.ownerActionStillRequired === true && implementationBundle.includes("owner action still required=true"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "backupVerificationRules",
  "restoreRehearsalRules",
  "manualOwnerActions",
  "unresolvedProductionBlockers",
  "safetyBoundaries",
  "whatThisPackageDoesNotDo",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const phrase of [
  "BLOCKED_STALE_OR_UNVERIFIED_BACKUP",
  "REQUIRED_NOT_COMPLETED",
  "backup must be newer than 24h before launch",
  "Do not fabricate backup freshness",
  "no fake fresh backup claim",
  "manual owner actions",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup freshness blocked",
  "owner real-device approval pending",
  "No production DB connect",
  "No DB writes",
  "No cron/workflow changes",
  "Package 290 - Public URL Telegram Setup Manual Gate",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.includes(phrase));
}

check("redacted script only inspects local backup metadata", redactedScriptSource.includes("data") && redactedScriptSource.includes("backups") && redactedScriptSource.includes("statSync"));
check("redacted script reports missing evidence safely", redactedScriptSource.includes("backupEvidenceStatus: not_found") && redactedScriptSource.includes("manualBackupRequired: true"));
check("redacted script does not create or modify backup files", !/writeFile|appendFile|mkdir|rmSync|unlink|copyFile|rename|utimes|chmod|chown/i.test(redactedScriptSource));
check("redacted script does not connect anywhere", !/fetch\(|http\.|https\.|net\.|tls\.|prisma|supabase|pg\.|mysql|mongodb|redis/i.test(redactedScriptSource));
check("redacted script does not print env values", !/process\.env\.DATABASE_URL|process\.env\.TELEGRAM_BOT_TOKEN/.test(redactedScriptSource));
check("redacted script does not call Telegram", !/api\.telegram\.org|sendMessage|setWebhook|getMe/i.test(redactedScriptSource));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather flag", model.safetyFlags.botFatherChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no production DB connection flag", model.safetyFlags.productionDbConnected === false);
check("no automatic backup flag", model.safetyFlags.backupCreatedAutomatically === false);
check("no restore execution flag", model.safetyFlags.restoreExecutedAutomatically === false);
check("no fake freshness flag", model.safetyFlags.fakeBackupFreshnessClaimed === false);
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
check("no cron/workflow/publish/package/db/env files changed", riskyChangedFiles.length === 0);
if (riskyChangedFiles.length) {
  console.log("Unexpected risky changed files:", riskyChangedFiles.join(", "));
}

check("no .env.local committed", git(["ls-files", ".env.local"]) === "");
check("no real DATABASE_URL value committed", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/)/i.test(implementationBundle));
check("no real TELEGRAM_BOT_TOKEN value committed", !/(https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b)/i.test(implementationBundle));
check("no real secrets committed", !/(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,}/i.test(implementationBundle));
check("no Telegram API/send code added", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no BotFather implementation added", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(implementationBundle));
check("no DB write added", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(implementationBundle));
check("no payment added", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no VIP unlock added", !/createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("launch flags not approved", !/publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false|backupMarkedFresh:\s*true/i.test(implementationBundle));
check("no fake fresh backup claim", !/backupFreshnessStatus:\s*["']FRESH|backupMarkedFresh:\s*true|freshnessStatus:\s*["']fresh["']/i.test(implementationBundle));
check("no external analytics added", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(implementationBundle));

console.log(`\nAphrodite Backup Freshness Verification QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
