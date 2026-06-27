#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { gitChangedNames } from "./lib/qa-git-scope.mjs";

import {
  APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_ROUTE,
  APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_TITLE,
  getAphroditeEnvExampleExpansionReadiness,
} from "../lib/zodiac/aphrodite-env-example-expansion-readiness.ts";

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

console.log("Starting QA: Env Example Expansion Readiness...\n");

const envPath = "../.env.example";
const modelPath = "../lib/zodiac/aphrodite-env-example-expansion-readiness.ts";
const pagePath = "../app/dashboard/networks/zodiac/env-example-expansion-readiness/page.tsx";
const docsPath = "../docs/aphrodite-env-example-expansion-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-227.md";
const componentPath = "../components/zodiac/AphroditeReadinessPage.tsx";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["env example", envPath],
  ["model", modelPath],
  ["dashboard page", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["shared readiness component", componentPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const envSource = exists(envPath) ? read(envPath) : "";
const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const componentSource = exists(componentPath) ? read(componentPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const model = getAphroditeEnvExampleExpansionReadiness();
const implementationBundle = [envSource, modelSource, pageSource, docsSource, reportSource, componentSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [envSource, modelSource, pageSource, docsSource, reportSource, componentSource].join("\n");

check("title exported", model.title === APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_TITLE);
check("route exported", model.route === APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_ROUTE);
check("package number is 227", model.packageNumber === 227);
check("dashboard route exists", pageSource.includes("getAphroditeEnvExampleExpansionReadiness") && pageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("envExampleExpansionReadiness"));
check("docs/report exists", docsSource.includes("Package 227") && reportSource.includes("Package 227"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));

for (const group of [
  "App / Public URLs",
  "Dashboard / Admin auth",
  "Telegram Bot / Mini App",
  "Database / Supabase",
  "Publishing / dry-run / live safety flags",
  "Analytics",
  "Backup / restore",
  "Launch gates / owner approval",
  "Development / QA",
  "Legacy env names",
]) {
  check(`env group documented: ${group}`, envSource.includes(group));
}

for (const name of [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "APHRODITE_SESSION_SECRET",
  "ZODIAC_DASHBOARD_SESSION_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ZODIAC_ANALYTICS_REDIS_URL",
  "BACKUP_FRESHNESS_MAX_HOURS",
  "PUBLIC_LAUNCH_APPROVED",
  "OWNER_MANUAL_REVIEW_REQUIRED",
  "TELEGRAM_DRY_RUN",
  "TELEGRAM_REAL_PUBLISH_ENABLED",
  "PUBLISH_DUE_STORE",
]) {
  check(`required env documented: ${name}`, envSource.includes(`${name}=`) && implementationBundle.includes(name));
}

check("DATABASE_URL production blocker documented", /DATABASE_URL.*required for production/i.test(implementationBundle));
check("TELEGRAM_BOT_TOKEN production blocker documented", /TELEGRAM_BOT_TOKEN.*required for production/i.test(implementationBundle));
check("APHRODITE_SESSION_SECRET dashboard auth documented", /APHRODITE_SESSION_SECRET.*required for dashboard auth/i.test(implementationBundle));
check("legacy session secret non-authoritative documented", /ZODIAC_DASHBOARD_SESSION_SECRET.*legacy\/non-authoritative/i.test(implementationBundle));
check("manual owner approval blocker documented", /manual owner approval|owner explicit approval/i.test(implementationBundle));
check("safe placeholders used", /<set-in-secret-store-only>|<long-random-dashboard-session-secret>|<public-app-url>/.test(envSource));
check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);

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

const changedFiles = gitChangedNames([
  ".env.example",
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
const allowedChanges = new Set([
  ".env.example",
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/env-example-expansion-readiness/page.tsx",
  "components/zodiac/AphroditeReadinessPage.tsx",
  "lib/zodiac/aphrodite-env-example-expansion-readiness.ts",
  "scripts/qa-aphrodite-env-example-expansion-readiness.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-env-example-expansion-readiness.md",
  "docs/aphrodite-package-reports/package-227.md",
]);
check("git scope helper returned real change data for Package 227 env readiness layer", !changedFiles.includes("__git_diff_failed__"));

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
