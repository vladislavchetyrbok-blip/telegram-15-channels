#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_BACKUP_FRESHNESS_VERIFICATION_PROTOCOL_ROUTE,
  APHRODITE_BACKUP_FRESHNESS_VERIFICATION_PROTOCOL_TITLE,
  getAphroditeBackupFreshnessVerificationProtocol,
} from "../lib/zodiac/aphrodite-backup-freshness-verification-protocol.ts";

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

console.log("Starting QA: Backup Freshness Verification Protocol...\n");

const modelPath = "../lib/zodiac/aphrodite-backup-freshness-verification-protocol.ts";
const pagePath = "../app/dashboard/networks/zodiac/backup-freshness-verification-protocol/page.tsx";
const docsPath = "../docs/aphrodite-backup-freshness-verification-protocol.md";
const reportPath = "../docs/aphrodite-package-reports/package-230.md";
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
const model = getAphroditeBackupFreshnessVerificationProtocol();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_BACKUP_FRESHNESS_VERIFICATION_PROTOCOL_TITLE);
check("route exported", model.route === APHRODITE_BACKUP_FRESHNESS_VERIFICATION_PROTOCOL_ROUTE);
check("package number is 230", model.packageNumber === 230);
check("dashboard route exists", pageSource.includes("getAphroditeBackupFreshnessVerificationProtocol") && pageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_BACKUP_FRESHNESS_VERIFICATION_PROTOCOL_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("backupFreshnessVerificationProtocol"));
check("docs/report exists", docsSource.includes("Package 230") && reportSource.includes("Package 230"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));

for (const message of [
  "backup must be <24h before launch",
  "backup older than 24h is a launch blocker",
  "restore rehearsal required",
  "rollback point / last verified commit required",
  "no automatic DB access",
  "no automatic restore",
  "owner sign-off required",
]) {
  check(`required protocol message exists: ${message}`, model.requiredMessages.includes(message) && implementationBundle.includes(message));
}

for (const required of [
  "backup <24h launch blocker",
  "where backup should be checked manually",
  "restore rehearsal required",
  "rollback point / last verified commit",
  "if backup is stale",
  "if restore rehearsal fails",
  "no automatic DB access",
  "owner sign-off required",
]) {
  check(`protocol step exists: ${required}`, model.steps.some((step) => step.area === required) && implementationBundle.includes(required));
}

check("backup <24h blocker documented", /backup.*<24h|<24h.*backup/i.test(implementationBundle));
check("restore rehearsal documented", /restore rehearsal required|safe non-production target/i.test(implementationBundle));
check("rollback point documented", /rollback point \/ last verified commit/i.test(implementationBundle));
check("stale backup action documented", /If backup is stale|if backup is stale/i.test(implementationBundle));
check("restore failure action documented", /If restore rehearsal fails|if restore rehearsal fails/i.test(implementationBundle));
check("owner sign-off documented", /owner sign-off required|owner explicit approval/i.test(implementationBundle));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no production DB connection flag", model.safetyFlags.productionDbConnectionMade === false);
check("no production DB write flag", model.safetyFlags.productionDbWriteAdded === false);
check("no automatic backup flag", model.safetyFlags.backupCreatedAutomatically === false);
check("no automatic restore flag", model.safetyFlags.restoreExecutedAutomatically === false);
check("no data deletion or overwrite flag", model.safetyFlags.dataDeletedOrOverwritten === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no workflow change flag", model.safetyFlags.workflowChanged === false);
check("no publish scripts change flag", model.safetyFlags.publishScriptsChanged === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);

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

check("no env or secret read implementation", !/process\.env|dotenv|readFileSync\([^)]*\.env|DATABASE_URL\s*=|TELEGRAM_BOT_TOKEN\s*=/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|prisma\.[a-zA-Z0-9_]+|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(|createClient\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no backup command implementation", !/pg_dump|pg_restore|mysqldump|mongodump|mongorestore|psql\s+-|mysql\s+-|rm\s+-rf|Remove-Item/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
