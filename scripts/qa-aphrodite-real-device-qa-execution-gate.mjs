#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_ROUTE,
  APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_TITLE,
  getAphroditeRealDeviceQaExecutionGate,
} from "../lib/zodiac/aphrodite-real-device-qa-execution-gate.ts";

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

function hasAll(source, needles) {
  return needles.every((needle) => source.includes(needle));
}

console.log("Starting QA: Aphrodite Real Device QA Execution Gate...\n");

const modelPath = "../lib/zodiac/aphrodite-real-device-qa-execution-gate.ts";
const pagePath = "../app/dashboard/networks/zodiac/real-device-qa-execution-gate/page.tsx";
const docsPath = "../docs/aphrodite-real-device-qa-execution-gate.md";
const reportPath = "../docs/aphrodite-package-reports/package-251.md";
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
const model = getAphroditeRealDeviceQaExecutionGate();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_TITLE);
check("route exported", model.route === APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_ROUTE);
check("package number is 251", model.packageNumber === 251);
check("dashboard page uses readiness page", pageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("realDeviceQaExecutionGate"));
check("docs/report exist", docsSource.includes("Package 251") && reportSource.includes("Package 251"));
check("current state manual required", model.currentState === "NOT CHECKED / OWNER REVIEW REQUIRED" && implementationBundle.includes("NOT CHECKED / OWNER REVIEW REQUIRED"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));
check("next package recommendation documented", model.nextPackageRecommendation === "Package 252 - Soft Launch Candidate Report" && implementationBundle.includes("Package 252 - Soft Launch Candidate Report"));

check("required devices present", hasAll(implementationBundle, [
  "iPhone Safari",
  "Android Chrome",
  "Telegram iOS WebView",
  "Telegram Android WebView",
  "Desktop sanity",
]));

check("required viewports present", hasAll(implementationBundle, [
  "360px",
  "390px",
  "430px",
  "desktop sanity",
]));

check("required flows present", hasAll(implementationBundle, [
  "Home",
  "Compatibility input/result",
  "Birth Matrix input/result",
  "Mystic Cards closed/selected/revealed",
  "VIP preview locked",
  "Result/share cards",
  "startapp/deep link",
  "browser fallback",
]));

check("evidence fields present", hasAll(implementationBundle, [
  "device",
  "OS version",
  "Telegram app version",
  "browser version",
  "public URL",
  "screenshot/evidence",
  "tester notes",
  "status",
  "severity",
  "timestamp",
  "owner sign-off",
]));

for (const status of [
  "NOT CHECKED",
  "PASS",
  "FAIL",
  "BLOCKED",
  "OWNER REVIEW REQUIRED",
]) {
  check(`status value present: ${status}`, model.statusValues.includes(status) && implementationBundle.includes(status));
}

check("manual required status present", implementationBundle.includes("manual required status"));
check("no automatic PASS claims", model.requiredDevices.every((item) => item.status !== "PASS") && model.requiredFlows.every((item) => item.status !== "PASS"));
check("no real-device QA completed automatically", model.safetyFlags.realDeviceQaCompletedAutomatically === false && implementationBundle.includes("No real-device QA completed automatically"));
check("no fake screenshots", model.safetyFlags.screenshotsFaked === false && implementationBundle.includes("No fake screenshots"));
check("browser-only Telegram WebView remains manual", implementationBundle.includes("If only browser tools are used, Telegram WebView remains MANUAL REQUIRED"));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no channel mapping change flag", model.safetyFlags.channelMappingsChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no entitlement bypass flag", model.safetyFlags.entitlementBypassAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);
check("manual checks not marked complete", model.safetyFlags.manualChecksMarkedComplete === false);
check("publicLaunchApproved flag stays false", model.safetyFlags.publicLaunchApproved === false);
check("ownerManualReviewRequired flag stays true", model.safetyFlags.ownerManualReviewRequired === true);

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
const allowedChangedFiles = new Set([
  "lib/zodiac/aphrodite-real-device-qa-execution-gate.ts",
  "app/dashboard/networks/zodiac/real-device-qa-execution-gate/page.tsx",
  "scripts/qa-aphrodite-real-device-qa-execution-gate.mjs",
  "docs/aphrodite-real-device-qa-execution-gate.md",
  "docs/aphrodite-package-reports/package-251.md",
  "app/dashboard/networks/zodiac/page.tsx",
  "scripts/qa-zodiac-dashboard.mjs",
]);

check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
check("only Package 251-scoped files changed", changedFiles.every((file) => allowedChangedFiles.has(file)));
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
check("no env or secret files changed", gitChangedNames([".env", ".env.local", ".env.example"]).length === 0);

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no entitlement bypass implementation", !/entitlementBypassAdded:\s*true|bypassEntitlement|skipEntitlement|vipUnlockAdded:\s*true/i.test(safetyBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
