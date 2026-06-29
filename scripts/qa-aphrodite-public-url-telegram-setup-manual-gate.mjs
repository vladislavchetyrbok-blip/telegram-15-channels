#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_ROUTE,
  APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_TITLE,
  getAphroditePublicUrlTelegramSetupManualGate,
} from "../lib/zodiac/aphrodite-public-url-telegram-setup-manual-gate.ts";

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

console.log("Starting QA: Aphrodite Public URL Telegram Setup Manual Gate...\n");

const modelPath = "../lib/zodiac/aphrodite-public-url-telegram-setup-manual-gate.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/public-url-telegram-setup-manual-gate/page.tsx";
const docsPath = "../docs/aphrodite-public-url-telegram-setup-manual-gate.md";
const reportPath = "../docs/aphrodite-package-reports/package-290.md";
const safeScriptPath = "./check-public-url-routes-redacted.mjs";
const qaPath = "./qa-aphrodite-public-url-telegram-setup-manual-gate.mjs";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, itemPath] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["redacted public URL script", safeScriptPath],
  ["QA script", qaPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(itemPath));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const safeScriptSource = exists(safeScriptPath) ? read(safeScriptPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  safeScriptSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const model = getAphroditePublicUrlTelegramSetupManualGate();

check("title exported", model.title === APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_TITLE);
check("route exported", model.route === APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_ROUTE);
check("package number is 290", model.packageNumber === 290);
check("currentMainHead recorded", model.currentMainHead === "8eb80920f62afa7471b6a5f982217f40aef6387d");
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard nav link exists", dashboardSource.includes(APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("publicUrlTelegramSetupManualGate"));
check("docs/report exist", docsSource.includes("Package 290") && reportSource.includes("Package 290"));
check("publicUrlStatus required not configured", model.publicUrlStatus === "REQUIRED_NOT_CONFIGURED");
check("telegramMiniAppUrlStatus manual BotFather not done", model.telegramMiniAppUrlStatus === "MANUAL_BOTFATHER_SETUP_NOT_DONE");
check("publicUrlApproved=false", model.publicUrlApproved === false && implementationBundle.includes("publicUrlApproved=false"));
check("botFatherSetupDone=false", model.botFatherSetupDone === false && implementationBundle.includes("botFatherSetupDone=false"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "requiredPublicRoutes",
  "httpsRequirement",
  "manualBotFatherSteps",
  "publicRouteVerificationChecklist",
  "unresolvedProductionBlockers",
  "safetyBoundaries",
  "whatThisPackageDoesNotDo",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const route of [
  "/miniapp",
  "/compatibility",
  "/birth-matrix",
  "/vip-preview",
  "/vip-compatibility-report",
  "/miniapp?startapp=mystic",
  "/miniapp?startapp=compatibility",
  "/miniapp?startapp=birth_matrix",
  "/miniapp?startapp=vip",
]) {
  check(`required public route documented: ${route}`, implementationBundle.includes(route));
}

for (const phrase of [
  "REQUIRED_NOT_CONFIGURED",
  "MANUAL_BOTFATHER_SETUP_NOT_DONE",
  "HTTPS requirement",
  "PUBLIC_APP_URL must start with https://",
  "manual BotFather steps",
  "BotFather setup is manual only",
  "public URL not configured/approved",
  "BotFather Mini App URL not configured",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup older than 24h",
  "restore rehearsal required",
  "owner real-device approval pending",
  "No Telegram API calls.",
  "No messages.",
  "No BotFather mutation.",
  "Package 291 - Production Blocker Closure Checklist",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.includes(phrase));
}

check("safe script reads PUBLIC_APP_URL", safeScriptSource.includes("process.env.PUBLIC_APP_URL"));
check("safe script reports missing PUBLIC_APP_URL", safeScriptSource.includes("PUBLIC_APP_URL:") && safeScriptSource.includes("missing"));
check("safe script reports manual setup required", safeScriptSource.includes("manual setup required"));
check("safe script checks HTTPS format only", safeScriptSource.includes("startsWith(\"https://\")"));
check("safe script does not print PUBLIC_APP_URL value", !/console\.log\([^)]*publicAppUrl|console\.log\([^)]*trimmedUrl|\$\{publicAppUrl\}|\$\{trimmedUrl\}/.test(safeScriptSource));
check("safe script does not fetch routes", !/fetch\(|http\.|https\.|net\.|tls\./i.test(safeScriptSource));
check("safe script does not call Telegram", !/api\.telegram\.org|sendMessage|setWebhook|getMe/i.test(safeScriptSource));
check("safe script does not mutate files", !/writeFile|appendFile|mkdir|rmSync|unlink|copyFile|rename|utimes|chmod|chown/i.test(safeScriptSource));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather flag", model.safetyFlags.botFatherChanged === false);
check("no Telegram Mini App URL auto-set flag", model.safetyFlags.telegramMiniAppUrlSetAutomatically === false);
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
check("launch and public URL flags not approved", !/publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false|publicUrlApproved:\s*true|botFatherSetupDone:\s*true/i.test(implementationBundle));
check("no external analytics added", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(implementationBundle));

console.log(`\nAphrodite Public URL Telegram Setup Manual Gate QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
