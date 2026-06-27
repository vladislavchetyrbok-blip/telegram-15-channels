#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { gitChangedNames } from "./lib/qa-git-scope.mjs";

import {
  APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_ROUTE,
  APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_TITLE,
  APHRODITE_BACKUP_RESTORE_REQUIRED_MESSAGES,
  APHRODITE_BACKUP_RESTORE_STATUSES,
  getAphroditeBackupRestoreRehearsalReadiness,
} from "../lib/zodiac/aphrodite-backup-restore-rehearsal-readiness.ts";

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

console.log("Starting QA: Backup & Restore Rehearsal Readiness...\n");

const modelPath = "../lib/zodiac/aphrodite-backup-restore-rehearsal-readiness.ts";
const pagePath = "../app/dashboard/networks/zodiac/backup-restore-rehearsal-readiness/page.tsx";
const docsPath = "../docs/aphrodite-backup-restore-rehearsal-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-220.md";
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
const model = getAphroditeBackupRestoreRehearsalReadiness();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_TITLE);
check("route exported", model.route === APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_ROUTE);
check("package number is 220", model.packageNumber === 220);
check("dashboard route exists", pageSource.includes("getAphroditeBackupRestoreRehearsalReadiness") && pageSource.includes("model.title"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("backupRestoreRehearsalReadiness"));
check("dashboard QA asserts title", dashboardQaSource.includes("Backup &amp; Restore Rehearsal Readiness"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));

for (const message of APHRODITE_BACKUP_RESTORE_REQUIRED_MESSAGES) {
  check(`required wording exists: ${message}`, model.requiredMessages.includes(message));
  check(`required wording rendered/documented: ${message}`, implementationBundle.includes(message));
}

for (const status of APHRODITE_BACKUP_RESTORE_STATUSES) {
  check(`status exists: ${status}`, model.statuses.includes(status));
  check(`status rendered/documented: ${status}`, implementationBundle.includes(status));
}

const requiredSections = [
  "Backup freshness status",
  "Last backup age classification",
  "Manual backup verification checklist",
  "Restore rehearsal checklist",
  "Rollback dependency list",
  "Production launch blocker status",
  "Owner manual review",
  "No automatic DB access guarantee",
];

check("all required backup/restore sections exist", model.sections.length === requiredSections.length);
for (const sectionName of requiredSections) {
  const section = model.sections.find((entry) => entry.title === sectionName);
  check(`section exists: ${sectionName}`, Boolean(section));
  check(`section rendered/documented: ${sectionName}`, implementationBundle.includes(sectionName));
  check(`section has summary: ${sectionName}`, Boolean(section?.summary));
  check(`section has checklist: ${sectionName}`, Boolean(section?.checklist.length));
}

check("backup freshness section exists", Boolean(model.sections.find((entry) => entry.title === "Backup freshness status")));
check("restore rehearsal checklist exists", Boolean(model.sections.find((entry) => entry.title === "Restore rehearsal checklist")));
check("rollback dependency section exists", Boolean(model.sections.find((entry) => entry.title === "Rollback dependency list")));
check("owner manual review exists", Boolean(model.sections.find((entry) => entry.title === "Owner manual review")));
check("no automatic DB access wording exists", implementationBundle.includes("No automatic DB access guarantee"));

for (const blocker of [
  "backup freshness older than 24h or not verified",
  "manual backup timestamp evidence",
  "manual restore rehearsal evidence",
  "rollback owner and access confirmation",
  "owner approval",
]) {
  check(`remaining backup blocker exists: ${blocker}`, model.remainingBackupBlockers.includes(blocker));
  check(`remaining backup blocker rendered/documented: ${blocker}`, implementationBundle.includes(blocker));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no production DB connection flag", model.safetyFlags.productionDbConnectionMade === false);
check("no production DB write flag", model.safetyFlags.productionDbWriteAdded === false);
check("no real secrets read flag", model.safetyFlags.realSecretsRead === false);
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
check("docs say Package 220", docsSource.includes("Package 220"));
check("report says Package 220", reportSource.includes("Package 220"));
check("report says production DB connection not made", reportSource.includes("Production DB connection made: No"));
check("report says restore not executed", reportSource.includes("Restore executed automatically: No"));

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
  "app/dashboard/networks/zodiac/backup-restore-rehearsal-readiness/page.tsx",
  "lib/zodiac/aphrodite-backup-restore-rehearsal-readiness.ts",
  "scripts/qa-aphrodite-backup-restore-rehearsal-readiness.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-backup-restore-rehearsal-readiness.md",
  "docs/aphrodite-package-reports/package-220.md",
]);
check("git scope helper returned real change data for Package 220 readiness layer", !changedFiles.includes("__git_diff_failed__"));

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
