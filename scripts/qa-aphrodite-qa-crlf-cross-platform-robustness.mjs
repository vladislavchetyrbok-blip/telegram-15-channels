#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames, gitChangedScope } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_QA_CRLF_CROSS_PLATFORM_ROBUSTNESS_ROUTE,
  APHRODITE_QA_CRLF_CROSS_PLATFORM_ROBUSTNESS_TITLE,
  getAphroditeQaCrlfCrossPlatformRobustness,
} from "../lib/zodiac/aphrodite-qa-crlf-cross-platform-robustness.ts";

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

console.log("Starting QA: QA CRLF Cross-Platform Robustness...\n");

const helperPath = "./lib/qa-git-scope.mjs";
const attributesPath = "../.gitattributes";
const modelPath = "../lib/zodiac/aphrodite-qa-crlf-cross-platform-robustness.ts";
const pagePath = "../app/dashboard/networks/zodiac/qa-crlf-cross-platform-robustness/page.tsx";
const docsPath = "../docs/aphrodite-qa-crlf-cross-platform-robustness.md";
const reportPath = "../docs/aphrodite-package-reports/package-228.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const qaScriptPaths = [
  "./qa-aphrodite-dashboard-auth-system-decision.mjs",
  "./qa-aphrodite-public-api-exposure-hardening.mjs",
  "./qa-aphrodite-env-example-expansion-readiness.mjs",
  "./qa-aphrodite-real-device-qa-execution-pack.mjs",
  "./qa-aphrodite-final-content-cta-inventory-audit.mjs",
  "./qa-aphrodite-public-launch-dry-run-matrix.mjs",
  "./qa-aphrodite-manual-launch-runbook-rollback-pack.mjs",
];

for (const [label, path] of [
  ["helper", helperPath],
  ["gitattributes", attributesPath],
  ["model", modelPath],
  ["dashboard page", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const helperSource = exists(helperPath) ? read(helperPath) : "";
const attributesSource = exists(attributesPath) ? read(attributesPath) : "";
const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const qaSources = qaScriptPaths.map((path) => (exists(path) ? read(path) : "")).join("\n");
const model = getAphroditeQaCrlfCrossPlatformRobustness();
const implementationBundle = [helperSource, attributesSource, modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource, qaSources].join("\n");
const safetyBundle = [helperSource, attributesSource, modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_QA_CRLF_CROSS_PLATFORM_ROBUSTNESS_TITLE);
check("route exported", model.route === APHRODITE_QA_CRLF_CROSS_PLATFORM_ROBUSTNESS_ROUTE);
check("package number is 228", model.packageNumber === 228);
check("dashboard route exists", pageSource.includes("getAphroditeQaCrlfCrossPlatformRobustness") && pageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_QA_CRLF_CROSS_PLATFORM_ROBUSTNESS_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("qaCrlfCrossPlatformRobustness"));
check("docs/report exists", docsSource.includes("Package 228") && reportSource.includes("Package 228"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));

check("helper uses ignore-space-at-eol", helperSource.includes("--ignore-space-at-eol"));
check("helper distinguishes eolOnly", helperSource.includes("eolOnly") && helperSource.includes("real") && helperSource.includes("untracked"));
check("helper keeps untracked files", helperSource.includes("ls-files") && helperSource.includes("--others"));
check("helper exposes gitChangedScope", typeof gitChangedScope === "function");
check("helper exposes gitChangedNames", typeof gitChangedNames === "function");
check("gitattributes has minimal normalization", attributesSource.trim() === "* text=auto");
check("aphrodite QA scripts import shared helper", qaSources.includes('from "./lib/qa-git-scope.mjs"'));
check("old local gitChangedNames functions removed", !/function gitChangedNames\(paths\)/.test(qaSources));
check("old direct git diff HEAD removed from aphrodite QA", !/git\", \[\"diff\", \"--name-only\", \"HEAD\"/.test(qaSources));
check("committed range wording documented", /committed range|working-tree|EOL-only|real file scope/i.test(implementationBundle));
check("runtime unchanged documented", implementationBundle.includes("No runtime behavior was changed"));

for (const status of ["HARDENED", "DOCUMENTED", "MANUAL REQUIRED", "BLOCKED"]) {
  check(`status documented: ${status}`, implementationBundle.includes(status));
}

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
check("no runtime behavior changed flag", model.safetyFlags.runtimeBehaviorChanged === false);

const changedFiles = gitChangedNames([
  ".gitattributes",
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
