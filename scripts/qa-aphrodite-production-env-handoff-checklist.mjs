#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_ROUTE,
  APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_TITLE,
  APHRODITE_PRODUCTION_ENV_READINESS_STATES,
  APHRODITE_PRODUCTION_ENV_REQUIRED_MESSAGES,
  getAphroditeProductionEnvHandoffChecklist,
} from "../lib/zodiac/aphrodite-production-env-handoff-checklist.ts";

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

function gitChangedNames(paths) {
  try {
    const diffOutput = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], { encoding: "utf8" });
    const otherOutput = execFileSync("git", ["ls-files", "--others", "--exclude-standard", "--", ...paths], { encoding: "utf8" });
    return [...diffOutput.split(/\r?\n/), ...otherOutput.split(/\r?\n/)].filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

console.log("Starting QA: Production Env Handoff Checklist...\n");

const modelPath = "../lib/zodiac/aphrodite-production-env-handoff-checklist.ts";
const pagePath = "../app/dashboard/networks/zodiac/production-env-handoff-checklist/page.tsx";
const docsPath = "../docs/aphrodite-production-env-handoff-checklist.md";
const reportPath = "../docs/aphrodite-package-reports/package-221.md";
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
const model = getAphroditeProductionEnvHandoffChecklist();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_TITLE);
check("route exported", model.route === APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_ROUTE);
check("package number is 221", model.packageNumber === 221);
check("dashboard route exists", pageSource.includes("getAphroditeProductionEnvHandoffChecklist") && pageSource.includes("model.title"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("productionEnvHandoffChecklist"));
check("dashboard QA asserts title", dashboardQaSource.includes("Production Env Handoff Checklist"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));

for (const message of APHRODITE_PRODUCTION_ENV_REQUIRED_MESSAGES) {
  check(`required wording exists: ${message}`, model.requiredMessages.includes(message));
  check(`required wording rendered/documented: ${message}`, implementationBundle.includes(message));
}

for (const state of APHRODITE_PRODUCTION_ENV_READINESS_STATES) {
  check(`readiness state exists: ${state}`, model.readinessStates.includes(state));
  check(`readiness state rendered/documented: ${state}`, implementationBundle.includes(state));
}

const requiredEnvItems = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "COMPATIBILITY_MINI_APP_URL / Telegram Mini App URL",
  "NEXT_PUBLIC_APP_URL / APP_URL",
  "Backup location/freshness marker",
  "Launch mode/freeze flag",
  "Owner approval flag/status",
];

check("all required env checklist items exist", model.envItems.length === requiredEnvItems.length);
for (const itemName of requiredEnvItems) {
  const item = model.envItems.find((entry) => entry.name === itemName);
  check(`env item exists: ${itemName}`, Boolean(item));
  check(`env item rendered/documented: ${itemName}`, implementationBundle.includes(itemName));
  check(`env item has configure location: ${itemName}`, Boolean(item?.configureWhere));
  check(`env item has verification step: ${itemName}`, Boolean(item?.verificationStep));
  check(`env item has safety rule: ${itemName}`, Boolean(item?.safetyRule));
  check(`env item never commit value: ${itemName}`, item?.neverCommitValue === true);
}

const secretHygieneRules = [
  "never commit .env production secrets.",
  "never paste secrets into chat reports.",
  "never print secrets in logs.",
  "use masked display only.",
  "rotate token if leaked.",
  "verify BotFather manually but do not change automatically.",
];

check("secret hygiene section exists", implementationBundle.includes("secret hygiene"));
for (const rule of secretHygieneRules) {
  check(`secret hygiene rule exists: ${rule}`, model.secretHygieneRules.includes(rule));
  check(`secret hygiene rule rendered/documented: ${rule}`, implementationBundle.includes(rule));
}

check("owner manual review exists", implementationBundle.includes("owner manual review and safety confirmation"));

for (const blocker of [
  "DATABASE_URL missing in production env",
  "TELEGRAM_BOT_TOKEN missing in production env",
  "Telegram Mini App URL/public URL marker manual verification",
  "public app base URL manual verification",
  "backup freshness marker manual verification",
  "owner approval",
]) {
  check(`remaining env blocker exists: ${blocker}`, model.remainingEnvBlockers.includes(blocker));
  check(`remaining env blocker rendered/documented: ${blocker}`, implementationBundle.includes(blocker));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);
check("no real env values stored flag", model.safetyFlags.realEnvValuesStored === false);
check("no real secrets read flag", model.safetyFlags.realSecretsRead === false);
check("no secrets printed flag", model.safetyFlags.secretsPrintedInLogs === false);
check("no production DB connection flag", model.safetyFlags.productionDbConnectionMade === false);
check("no production DB write flag", model.safetyFlags.productionDbWriteAdded === false);
check("no Telegram API call flag", model.safetyFlags.telegramApiCallMade === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no workflow change flag", model.safetyFlags.workflowChanged === false);
check("no publish scripts change flag", model.safetyFlags.publishScriptsChanged === false);
check("docs say Package 221", docsSource.includes("Package 221"));
check("report says Package 221", reportSource.includes("Package 221"));
check("report says no secrets were added", reportSource.includes("No secrets were added."));
check("report says no production DB connection", reportSource.includes("Production DB connection made: No"));

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

const changedFiles = gitChangedNames(["app", "lib", "scripts", "docs", "package.json", ".github", "vercel.json", "prisma", "supabase", "migrations", "schema.prisma", ".env", ".env.local", ".env.production"]);
const allowedChanges = new Set([
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/production-env-handoff-checklist/page.tsx",
  "lib/zodiac/aphrodite-production-env-handoff-checklist.ts",
  "scripts/qa-aphrodite-production-env-handoff-checklist.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-production-env-handoff-checklist.md",
  "docs/aphrodite-package-reports/package-221.md",
]);
check("changed files limited to Package 221 readiness layer", changedFiles.every((file) => allowedChanges.has(file)));

check("no DATABASE_URL value assignment", !/DATABASE_URL\s*=\s*\S+/i.test(safetyBundle));
check("no TELEGRAM_BOT_TOKEN value assignment", !/TELEGRAM_BOT_TOKEN\s*=\s*\S+/i.test(safetyBundle));
check("no process env read implementation", !/process\.env|dotenv|readFileSync\([^)]*\.env/i.test(safetyBundle));
check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,}\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|prisma\.[a-zA-Z0-9_]+|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(|createClient\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
