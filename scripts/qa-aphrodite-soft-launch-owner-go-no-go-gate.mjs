#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_ROUTE,
  APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_TITLE,
  getAphroditeSoftLaunchOwnerGoNoGoGate,
} from "../lib/zodiac/aphrodite-soft-launch-owner-go-no-go-gate.ts";

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

console.log("Starting QA: Soft Launch Owner Go/No-Go Gate...\n");

const modelPath = "../lib/zodiac/aphrodite-soft-launch-owner-go-no-go-gate.ts";
const pagePath = "../app/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate/page.tsx";
const docsPath = "../docs/aphrodite-soft-launch-owner-go-no-go-gate.md";
const reportPath = "../docs/aphrodite-package-reports/package-235.md";
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
const model = getAphroditeSoftLaunchOwnerGoNoGoGate();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_TITLE);
check("route exported", model.route === APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_ROUTE);
check("package number is 235", model.packageNumber === 235);
check("dashboard route exists", pageSource.includes("getAphroditeSoftLaunchOwnerGoNoGoGate") && pageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("softLaunchOwnerGoNoGoGate"));
check("docs/report exists", docsSource.includes("Package 235") && reportSource.includes("Package 235"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));
check("soft launch not approved", model.softLaunchApproved === false && /soft launch not approved/i.test(implementationBundle));
check("production launch not done", model.productionLaunchDone === false && /production launch not done/i.test(implementationBundle));

for (const area of [
  "publicLaunchApproved=false",
  "ownerManualReviewRequired=true",
  "soft launch not approved",
  "production launch not done",
  "Telegram API not used",
  "messages not sent",
  "payments not added",
  "VIP unlock not added",
  "DB writes not added",
  "cron/workflows/publish scripts not changed",
]) {
  check(`go/no-go status exists: ${area}`, model.gateStatuses.some((item) => item.area === area) && implementationBundle.includes(area));
}

for (const item of [
  "DATABASE_URL configured manually",
  "TELEGRAM_BOT_TOKEN configured manually",
  "backup <24h confirmed manually",
  "restore rehearsal manually checked",
  "real-device QA completed manually",
  "Telegram WebView/startapp QA completed manually",
  "content/CTA owner review completed manually",
  "launch simulation report reviewed",
  "rollback plan understood",
  "owner explicit approval",
]) {
  check(`future approval requirement exists: ${item}`, model.requiredBeforeFutureApproval.some((entry) => entry.area === item) && implementationBundle.includes(item));
}

check("owner approval required wording", /owner explicit approval|Owner must give explicit approval/i.test(implementationBundle));
check("no auto approval wording", /No auto approval|does not approve launch automatically/i.test(implementationBundle));
check("no production launch wording", /No production launch|production launch not done/i.test(implementationBundle));
check("no Telegram API wording", /Telegram API not used|No Telegram API call/i.test(implementationBundle));
check("no messages wording", /messages not sent|No messages sent/i.test(implementationBundle));
check("no payment/VIP wording", /Payment added: No|VIP unlock added: No|payments not added/i.test(implementationBundle));
check("no DB write wording", /DB write added: No|DB writes not added/i.test(implementationBundle));
check("no cron workflow publish wording", /cron\/workflows\/publish scripts not changed|Cron\/workflows\/publish scripts changed: No/i.test(implementationBundle));

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
check("no auto approval flag", model.safetyFlags.autoApprovalAdded === false);

const changedFiles = gitChangedNames([
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
check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
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
