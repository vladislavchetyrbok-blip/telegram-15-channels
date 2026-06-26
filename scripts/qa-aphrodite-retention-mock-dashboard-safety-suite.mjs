#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_CLASSIFICATION,
  APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_SAFETY_LABELS,
  APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_TITLE,
  getAphroditeRetentionMockDashboardSafetySuite,
} from "../lib/zodiac/aphrodite-retention-mock-dashboard-safety-suite.ts";
import {
  draftAphroditeReminderNoop,
  evaluateAphroditeStreakNoop,
} from "../lib/zodiac/aphrodite-streak-reminder-noop-skeleton.ts";

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

function gitDiffNames(paths) {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], { encoding: "utf8" });
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

console.log("Старт QA: Retention Mock Dashboard & Safety Suite...\n");

const modelPath = "../lib/zodiac/aphrodite-retention-mock-dashboard-safety-suite.ts";
const pagePath = "../app/dashboard/networks/zodiac/retention-mock-dashboard-safety-suite/page.tsx";
const docsPath = "../docs/aphrodite-retention-mock-dashboard-safety-suite.md";
const reportPath = "../docs/aphrodite-package-reports/package-190.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const dependencyPaths = [
  "../lib/zodiac/aphrodite-retention-system-readiness.ts",
  "../lib/zodiac/aphrodite-saved-reports-history-mock-readiness.ts",
  "../lib/zodiac/aphrodite-return-journey-cta-readiness.ts",
  "../lib/zodiac/aphrodite-streak-reminder-noop-skeleton.ts",
  "../lib/zodiac/aphrodite-analytics-privacy-safety-suite.ts",
];

check("model exists", exists(modelPath));
check("dashboard exists", exists(pagePath));
check("docs exist", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const dependencySource = dependencyPaths.filter(exists).map(read).join("\n");
const implementationBundle = [modelSource, pageSource, dependencySource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");
const suite = getAphroditeRetentionMockDashboardSafetySuite();

check("model returns title", suite.title === APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_TITLE);
check("model returns classification", suite.classification === APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_CLASSIFICATION);
check("dependencies include Packages 185-189", ["Package 185", "Package 186", "Package 187", "Package 188", "Package 189"].every((pkg) => suite.dependencies.some((item) => item.packageId === pkg)));
check("mock retention funnel exists", suite.mockRetentionFunnel.length >= 5);
check("mock data only in funnel", suite.mockRetentionFunnel.every((step) => step.source === "mock-only"));
check("return loops exist", suite.returnLoops.length >= 6);
check("mock data only in loops", suite.returnLoops.every((loop) => loop.source === "mock-only"));
check("retention blockers exist", suite.retentionBlockers.length >= 5);
check("privacy safety boundaries exist", suite.privacySafetyBoundaries.length >= 9);
check("mockDataOnlyNow true", suite.mockDataOnlyNow === true);
check("real reminders flag false", suite.realRemindersNow === false);
check("telegram api flag false", suite.telegramApiNow === false);
check("message sending flag false", suite.messageSendingNow === false);
check("database read flag false", suite.databaseReadNow === false);
check("database write flag false", suite.databaseWriteNow === false);
check("external analytics flag false", suite.externalAnalyticsNow === false);
check("production tracking flag false", suite.productionTrackingNow === false);
check("payment tracking flag false", suite.paymentTrackingNow === false);
check("vip unlock flag false", suite.vipUnlockNow === false);
check("dependency snapshot retention surfaces", suite.dependencySnapshot.retentionSurfaces >= 14);
check("dependency snapshot saved reports", suite.dependencySnapshot.savedReportMocks >= 8);
check("dependency snapshot CTA paths", suite.dependencySnapshot.returnCtaPaths >= 11);
check("dependency snapshot reminder types", suite.dependencySnapshot.futureReminderTypes >= 7);
check("dependency snapshot privacy checks", suite.dependencySnapshot.privacyChecks >= 15);
check("streak noop dependency flags false", suite.dependencySnapshot.streakNoopFlagsFalse === true);
check("reminder noop dependency flags false", suite.dependencySnapshot.reminderNoopFlagsFalse === true);

for (const loop of [
  "daily return loop",
  "weekly return loop",
  "monthly return loop",
  "saved report future loop",
  "streak/reminder future loop",
  "CTA return paths",
]) {
  check(`required loop exists: ${loop}`, suite.returnLoops.some((item) => item.label === loop) && userFacingBundle.includes(loop));
}

for (const label of APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

const streakNoop = evaluateAphroditeStreakNoop({
  userScope: "qa-suite-user",
  surface: "miniapp",
  eventType: "daily-message-return",
  occurredAt: "2026-07-01T09:00:00.000Z",
});
const reminderNoop = draftAphroditeReminderNoop({
  userScope: "qa-suite-user",
  reminderType: "saved-report-revisit",
  requestedFor: "2026-07-02T09:00:00.000Z",
  fallbackRoute: "/miniapp/love-reading-preview",
});
check("streak/reminder noop dependency exists", streakNoop.noopOnly === true && reminderNoop.noopOnly === true);
check("streak noop returns no persistence", streakNoop.streakPersistedNow === false && streakNoop.databaseWriteNow === false);
check("reminder noop returns no schedule", reminderNoop.reminderScheduledNow === false && reminderNoop.productionReminderNow === false);

check("dashboard QA route key exists", dashboardQaSource.includes("retentionMockDashboardSafetySuite"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/retention-mock-dashboard-safety-suite"));
check("page renders title from model", pageSource.includes("suite.title") && userFacingBundle.includes(APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_TITLE));
check("page renders classification from model", pageSource.includes("suite.classification") && userFacingBundle.includes(APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_CLASSIFICATION));
check("docs say no real reminders", docsSource.includes("Нет реальных напоминаний") || docsSource.includes("No real reminders"));
check("docs say no DB read/write", docsSource.includes("No database read/write") || docsSource.includes("Нет записи в базу данных"));
check("report says Package 190", reportSource.includes("Package 190"));
check("report says Package 191 not started", reportSource.includes("Package 191 was not started"));

check("no real reminders runtime", !/setTimeout\s*\(|setInterval\s*\(|cron\.schedule|scheduleJob\s*\(|enqueueReminder\s*\(|createReminder\s*\(|productionReminderNow:\s*true/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no DB read", !/process\.env\.DATABASE_URL|getDb\s*\(|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.select\s*\(|\.select\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no external analytics", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(|navigator\.sendBeacon\s*\(/i.test(implementationBundle));
check("no production tracking", !/productionTrackingNow:\s*true|productionTrackingEnabled\s*:\s*true|approvedForLaunch=true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(implementationBundle));
check("no payment or VIP changes", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
