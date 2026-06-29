#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_MANUAL_ENV_SETUP_EXECUTION_ROUTE,
  APHRODITE_MANUAL_ENV_SETUP_EXECUTION_TITLE,
  getAphroditeManualEnvSetupExecution,
} from "../lib/zodiac/aphrodite-manual-env-setup-execution.ts";

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

console.log("Starting QA: Aphrodite Manual Env Setup Execution...\n");

const modelPath = "../lib/zodiac/aphrodite-manual-env-setup-execution.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/manual-env-setup-execution/page.tsx";
const docsPath = "../docs/aphrodite-manual-env-setup-execution.md";
const reportPath = "../docs/aphrodite-package-reports/package-288.md";
const redactedScriptPath = "./check-env-presence-redacted.mjs";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["redacted env presence script", redactedScriptPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
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
const model = getAphroditeManualEnvSetupExecution();

check("title exported", model.title === APHRODITE_MANUAL_ENV_SETUP_EXECUTION_TITLE);
check("route exported", model.route === APHRODITE_MANUAL_ENV_SETUP_EXECUTION_ROUTE);
check("package number is 288", model.packageNumber === 288);
check("currentMainHead recorded", model.currentMainHead === "a496c1a4508fce23ec28e5b74d07fd2070c6fa2c");
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard nav link exists", dashboardSource.includes(APHRODITE_MANUAL_ENV_SETUP_EXECUTION_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("manualEnvSetupExecution"));
check("docs/report exist", docsSource.includes("Package 288") && reportSource.includes("Package 288"));
check("manualEnvSetupStatus pending", model.manualEnvSetupStatus === "PENDING_OWNER_SECRET_CONFIGURATION");
check("databaseUrlConfigured=false", model.databaseUrlConfigured === false && implementationBundle.includes("databaseUrlConfigured = false"));
check("telegramBotTokenConfigured=false", model.telegramBotTokenConfigured === false && implementationBundle.includes("telegramBotTokenConfigured = false"));
check("secretsCommitted=false", model.secretsCommitted === false && implementationBundle.includes("secretsCommitted = false"));
check("envLocalCommitted=false", model.envLocalCommitted === false && implementationBundle.includes("envLocalCommitted = false"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "redactionRules",
  "manualSetupSteps",
  "safeVerificationSteps",
  "unresolvedBlockers",
  "safetyBoundaries",
  "whatThisPackageDoesNotDo",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const phrase of [
  "PENDING_OWNER_SECRET_CONFIGURATION",
  "configure only in hosting provider env panel",
  "local .env.local only on owner machine if needed",
  "never commit secrets",
  "never paste secrets in ChatGPT/Codex/Claude/Antigravity reports",
  "verification must be redacted",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup older than 24h",
  "owner real-device approval pending",
  "Package 289 - Backup Freshness Verification",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.includes(phrase));
}

check("redacted script only prints presence labels", redactedScriptSource.includes("DATABASE_URL:") && redactedScriptSource.includes("TELEGRAM_BOT_TOKEN:") && redactedScriptSource.includes("present") && redactedScriptSource.includes("missing"));
check("redacted script does not print env values directly", !/process\.env\.DATABASE_URL|process\.env\.TELEGRAM_BOT_TOKEN/.test(redactedScriptSource));
check("redacted script does not connect anywhere", !/fetch\(|http\.|https\.|net\.|tls\.|prisma|supabase|pg\.|mysql|mongodb|redis/i.test(redactedScriptSource));
check("redacted script does not call Telegram", !/api\.telegram\.org|sendMessage|setWebhook|getMe/i.test(redactedScriptSource));

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
check("no real DATABASE_URL value committed", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/)/i.test(implementationBundle));
check("no real TELEGRAM_BOT_TOKEN value committed", !/(https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b)/i.test(implementationBundle));
check("no real secrets committed", !/(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,}/i.test(implementationBundle));
check("no Telegram API/send code added", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no BotFather implementation added", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(implementationBundle));
check("no DB write added", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(implementationBundle));
check("no payment added", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no VIP unlock added", !/createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("launch flags not approved", !/publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false|databaseUrlConfigured:\s*true|telegramBotTokenConfigured:\s*true/i.test(implementationBundle));
check("no external analytics added", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(implementationBundle));

console.log(`\nAphrodite Manual Env Setup Execution QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
