#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_ROUTE,
  APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_TITLE,
  getAphroditeManualRealDeviceQaEvidenceCapture,
} from "../lib/zodiac/aphrodite-manual-real-device-qa-evidence-capture.ts";

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

console.log("Starting QA: Manual Real-Device QA Evidence Capture...\n");

const modelPath = "../lib/zodiac/aphrodite-manual-real-device-qa-evidence-capture.ts";
const pagePath = "../app/dashboard/networks/zodiac/manual-real-device-qa-evidence-capture/page.tsx";
const docsPath = "../docs/aphrodite-manual-real-device-qa-evidence-capture.md";
const reportPath = "../docs/aphrodite-package-reports/package-231.md";
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
const model = getAphroditeManualRealDeviceQaEvidenceCapture();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_TITLE);
check("route exported", model.route === APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_ROUTE);
check("package number is 231", model.packageNumber === 231);
check("dashboard route exists", pageSource.includes("getAphroditeManualRealDeviceQaEvidenceCapture") && pageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("manualRealDeviceQaEvidenceCapture"));
check("docs/report exists", docsSource.includes("Package 231") && reportSource.includes("Package 231"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));

for (const device of ["iPhone Safari", "Android Chrome", "Telegram iOS WebView", "Telegram Android WebView", "Desktop browser"]) {
  check(`device evidence exists: ${device}`, model.deviceEvidenceTargets.some((target) => target.area === device));
  check(`device evidence rendered/documented: ${device}`, implementationBundle.includes(device));
}

for (const field of [
  "device name",
  "OS version",
  "Telegram version manual field",
  "public URL checked",
  "startapp/deep link checked",
  "screenshots required",
  "owner notes",
  "status",
  "severity",
  "timestamp manual field",
]) {
  check(`manual evidence field exists: ${field}`, model.manualEvidenceFields.some((entry) => entry.label === field));
  check(`manual evidence field rendered/documented: ${field}`, implementationBundle.includes(field));
}

for (const flow of [
  "main screen",
  "compatibility",
  "Birth Matrix",
  "Mystic Cards",
  "VIP locked state",
  "CTA visibility",
  "no active payment",
  "no VIP unlock without entitlement",
  "back button",
  "haptics",
  "cache marker",
]) {
  check(`Mini App flow exists: ${flow}`, model.miniAppFlowEvidenceTargets.some((target) => target.area === flow));
  check(`Mini App flow rendered/documented: ${flow}`, implementationBundle.includes(flow));
}

for (const status of ["NOT CHECKED", "PASS", "FAIL", "BLOCKED", "OWNER REVIEW REQUIRED"]) {
  check(`status listed: ${status}`, model.statuses.includes(status) && implementationBundle.includes(status));
}

for (const severity of ["blocker", "high", "medium", "low"]) {
  check(`severity listed: ${severity}`, model.severities.includes(severity) && implementationBundle.includes(severity));
}

const automaticTargets = [...model.deviceEvidenceTargets, ...model.miniAppFlowEvidenceTargets];
check("no automatic PASS claims in evidence targets", automaticTargets.every((target) => target.status !== "PASS"));
check("manual fields are not automatically PASS", model.manualEvidenceFields.every((field) => field.status !== "PASS"));
check("real-device QA not completed automatically flag", model.safetyFlags.realDeviceQaCompletedAutomatically === false);
check("automatic PASS claims flag", model.safetyFlags.automaticPassClaimsAdded === false);
check("manual evidence wording exists", /Owner fills this field manually|No real-device QA was completed automatically|No automatic PASS claims/i.test(implementationBundle));

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
