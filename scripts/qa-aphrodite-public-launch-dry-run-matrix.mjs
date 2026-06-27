#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { gitChangedNames } from "./lib/qa-git-scope.mjs";

import {
  APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_ROUTE,
  APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_TITLE,
  APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MESSAGES,
  APHRODITE_PUBLIC_LAUNCH_DRY_RUN_STATUSES,
  getAphroditePublicLaunchDryRunMatrix,
} from "../lib/zodiac/aphrodite-public-launch-dry-run-matrix.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("УСПЕХ: " + name);
  } else {
    failed += 1;
    console.log("ОШИБКА: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

console.log("Старт QA: Public Launch Dry-Run Matrix...\n");

const modelPath = "../lib/zodiac/aphrodite-public-launch-dry-run-matrix.ts";
const pagePath = "../app/dashboard/networks/zodiac/public-launch-dry-run-matrix/page.tsx";
const docsPath = "../docs/aphrodite-public-launch-dry-run-matrix.md";
const reportPath = "../docs/aphrodite-package-reports/package-218.md";
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
  check(`${label} существует`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const model = getAphroditePublicLaunchDryRunMatrix();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_TITLE);
check("route exported", model.route === APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_ROUTE);
check("package number is 218", model.packageNumber === 218);
check("dashboard route exists", pageSource.includes("getAphroditePublicLaunchDryRunMatrix") && pageSource.includes("model.title"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("publicLaunchDryRunMatrix"));
check("dashboard QA asserts title", dashboardQaSource.includes("Public Launch Dry-Run Matrix"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));

for (const message of APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MESSAGES) {
  check(`dry-run wording exists: ${message}`, model.dryRunOnlyMessages.includes(message));
  check(`dry-run wording rendered/documented: ${message}`, implementationBundle.includes(message));
}

for (const status of APHRODITE_PUBLIC_LAUNCH_DRY_RUN_STATUSES) {
  check(`status exists: ${status}`, model.statuses.includes(status));
  check(`status rendered/documented: ${status}`, implementationBundle.includes(status));
}

const requiredSteps = [
  "Production env readiness",
  "DATABASE_URL readiness",
  "TELEGRAM_BOT_TOKEN readiness",
  "Backup freshness readiness",
  "Real-device visual QA",
  "Telegram WebView/startapp QA",
  "Live version/cache marker",
  "Content/CTA inventory",
  "Public launch freeze",
  "Owner manual approval",
  "Rollback readiness",
];

check("all required dry-run steps exist", model.steps.length === requiredSteps.length);
for (const stepName of requiredSteps) {
  const step = model.steps.find((item) => item.stepName === stepName);
  check(`dry-run step exists: ${stepName}`, Boolean(step));
  check(`dry-run step rendered/documented: ${stepName}`, implementationBundle.includes(stepName));
  check(`dry-run step has real-launch description: ${stepName}`, Boolean(step?.whatWouldHappen));
  check(`dry-run step has blocked reason: ${stepName}`, Boolean(step?.whyBlockedNow));
  check(`dry-run step has owner action: ${stepName}`, Boolean(step?.requiredOwnerAction));
  check(`dry-run step has safety note: ${stepName}`, Boolean(step?.safetyNote));
}

for (const blocker of [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness",
  "manual real-device QA",
  "Telegram WebView/startapp QA",
  "owner approval",
]) {
  check(`remaining blocker exists: ${blocker}`, model.remainingBlockers.includes(blocker));
  check(`remaining blocker rendered/documented: ${blocker}`, implementationBundle.includes(blocker));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA change flag", model.safetyFlags.activeCtaChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no workflow change flag", model.safetyFlags.workflowChanged === false);
check("docs say Package 218", docsSource.includes("Package 218"));
check("report says Package 218", reportSource.includes("Package 218"));
check("report says launch not performed", reportSource.includes("Production launch done: No"));

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

const changedFiles = gitChangedNames(["app", "lib", "scripts", "docs", "package.json", ".github", "vercel.json", "prisma", "supabase", "migrations", "schema.prisma"]);
const allowedChanges = new Set([
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/public-launch-dry-run-matrix/page.tsx",
  "lib/zodiac/aphrodite-public-launch-dry-run-matrix.ts",
  "scripts/qa-aphrodite-public-launch-dry-run-matrix.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-public-launch-dry-run-matrix.md",
  "docs/aphrodite-package-reports/package-218.md",
]);
check("git scope helper returned real change data for Package 218 readiness layer", !changedFiles.includes("__git_diff_failed__"));

check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no prisma write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|prisma\.(create|update|delete|upsert)/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
