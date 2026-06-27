#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_CONTENT_CTA_OWNER_REVIEW_EXECUTION_ROUTE,
  getAphroditeContentCtaOwnerReviewExecution,
} from "../lib/zodiac/aphrodite-content-cta-owner-review-execution.ts";

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

console.log("Starting QA: Aphrodite Content CTA Owner Review Execution...\n");

const modelPath = "../lib/zodiac/aphrodite-content-cta-owner-review-execution.ts";
const pagePath = "../app/dashboard/networks/zodiac/content-cta-owner-review-execution/page.tsx";
const docsPath = "../docs/aphrodite-content-cta-owner-review-execution.md";
const reportPath = "../docs/aphrodite-package-reports/package-255.md";
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
const model = getAphroditeContentCtaOwnerReviewExecution();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === "Content CTA Owner Review Execution");
check("route exported", model.route === APHRODITE_CONTENT_CTA_OWNER_REVIEW_EXECUTION_ROUTE);
check("package number is 255", model.packageNumber === 255);
check("dashboard page uses readiness page", pageSource.includes("AphroditeReadinessPage"));
check("navigation link exists in dashboard overview", dashboardSource.includes(APHRODITE_CONTENT_CTA_OWNER_REVIEW_EXECUTION_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("contentCtaOwnerReviewExecution"));
check("docs/report exist", docsSource.includes("Package 255") && reportSource.includes("Package 255"));

check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));
check("owner review required documented", model.ownerReviewStatus === "OWNER REVIEW REQUIRED" && implementationBundle.includes("OWNER REVIEW REQUIRED"));
check("next package recommendation documented", model.nextPackageRecommendation === "Package 256 - Production Env Manual Setup Execution Plan");

for (const area of [
  "Home CTA",
  "Compatibility CTA",
  "Birth Matrix / Natal CTA",
  "Mystic Cards CTA",
  "VIP Preview CTA",
  "Result / Share Cards",
  "Telegram startapp links",
  "dashboard/readiness links",
]) {
  check(`reviewed surface exists: ${area}`, model.reviewedSurfaces.some((item) => item.area === area));
  check(`reviewed surface rendered/documented: ${area}`, implementationBundle.includes(area));
}

check("browser simulation documented", model.browserSimulationUsed === true && implementationBundle.includes("BROWSER VERIFIED"));
check("dev server documented", model.devServerUsed === true && implementationBundle.includes("dev server"));
check("checked URLs documented", hasAll(implementationBundle, [
  "http://localhost:3000/miniapp",
  "http://localhost:3000/miniapp?startapp=compatibility",
  "http://localhost:3000/miniapp?startapp=birth_matrix",
  "http://localhost:3000/miniapp?startapp=mystic",
  "http://localhost:3000/miniapp?startapp=vip",
  "http://localhost:3000/miniapp?startapp=unknown_test_value",
  "http://localhost:3000/birth-matrix",
  "http://localhost:3000/vip-preview",
  "http://localhost:3000/vip-compatibility-report",
  "http://localhost:3000/compatibility",
]));
check("viewport coverage documented", hasAll(implementationBundle, ["360px", "390px", "430px", "desktop sanity"]));

check("CTA inventory documented", model.ctaInventory.length >= 6 && implementationBundle.includes("CTA inventory execution"));
check("content inventory documented", model.contentInventory.length >= 5 && implementationBundle.includes("content inventory owner review"));
check("startapp CTA documented", model.startappCtaResults.length >= 5 && implementationBundle.includes("startapp CTA status"));
check("VIP preview CTA documented", model.vipPreviewCtaResults.length >= 2 && implementationBundle.includes("VIP preview CTA status"));
check("result/share CTA documented", model.resultShareCtaResults.length >= 4 && implementationBundle.includes("result/share CTA status"));
check("owner review items documented", model.ownerReviewRequiredItems.length >= 6 && implementationBundle.includes("owner review required items"));
check("manual required items documented", model.manualRequiredItems.length >= 5 && implementationBundle.includes("manual required items"));
check("findings split by severity", Array.isArray(model.blockerFindings) && Array.isArray(model.highFindings) && Array.isArray(model.mediumFindings) && Array.isArray(model.lowFindings) && Array.isArray(model.polishFindings));
check("no blocker/high/medium CTA findings", model.blockerFindings.length === 0 && model.highFindings.length === 0 && model.mediumFindings.length === 0);
check("low and polish findings documented", model.lowFindings.length >= 1 && model.polishFindings.length >= 1);

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no active CTA destination change flag", model.safetyFlags.activeCtaDestinationsChanged === false);
check("no channel mapping change flag", model.safetyFlags.channelMappingsChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no entitlement bypass flag", model.safetyFlags.entitlementBypassAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no publish scripts flag", model.safetyFlags.publishScriptsChanged === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);
check("owner approval not granted flag", model.safetyFlags.ownerApprovalGranted === false);
check("content CTA review not completed automatically", model.safetyFlags.contentCtaReviewCompletedAutomatically === false);
check("Telegram WebView QA not faked", model.safetyFlags.telegramWebViewQaFaked === false);

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
  ".env",
  ".env.example",
]);
const allowedChangedFiles = new Set([
  "lib/zodiac/aphrodite-content-cta-owner-review-execution.ts",
  "app/dashboard/networks/zodiac/content-cta-owner-review-execution/page.tsx",
  "scripts/qa-aphrodite-content-cta-owner-review-execution.mjs",
  "docs/aphrodite-content-cta-owner-review-execution.md",
  "docs/aphrodite-package-reports/package-255.md",
  "app/dashboard/networks/zodiac/page.tsx",
  "scripts/qa-zodiac-dashboard.mjs",
]);

check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
check("only Package 255-scoped files changed", changedFiles.every((file) => allowedChangedFiles.has(file)));
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
check("no BotFather action mutation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|activeCtaDestinationsChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no entitlement bypass implementation", !/entitlementBypassAdded:\s*true|bypassEntitlement|skipEntitlement|vipUnlockAdded:\s*true/i.test(safetyBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
