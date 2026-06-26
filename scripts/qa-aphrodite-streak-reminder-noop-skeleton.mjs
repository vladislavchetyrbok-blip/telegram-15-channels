#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_STREAK_REMINDER_NOOP_SKELETON_CLASSIFICATION,
  APHRODITE_STREAK_REMINDER_NOOP_SKELETON_SAFETY_LABELS,
  APHRODITE_STREAK_REMINDER_NOOP_SKELETON_TITLE,
  draftAphroditeReminderNoop,
  evaluateAphroditeStreakNoop,
  getAphroditeStreakReminderNoopSkeleton,
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

console.log("Старт QA: Streak & Reminder Noop Skeleton...\n");

const modelPath = "../lib/zodiac/aphrodite-streak-reminder-noop-skeleton.ts";
const pagePath = "../app/dashboard/networks/zodiac/streak-reminder-noop-skeleton/page.tsx";
const docsPath = "../docs/aphrodite-streak-reminder-noop-skeleton.md";
const reportPath = "../docs/aphrodite-package-reports/package-189.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model exists", exists(modelPath));
check("dashboard exists", exists(pagePath));
check("docs exist", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, pageSource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");
const skeleton = getAphroditeStreakReminderNoopSkeleton();

check("model returns title", skeleton.title === APHRODITE_STREAK_REMINDER_NOOP_SKELETON_TITLE);
check("model returns classification", skeleton.classification === APHRODITE_STREAK_REMINDER_NOOP_SKELETON_CLASSIFICATION);
check("future reminder types exist", skeleton.futureReminderTypes.length >= 7);
check("safety boundaries exist", skeleton.boundaries.length >= 10);
check("model streak flag false", skeleton.streakPersistedNow === false);
check("model reminder scheduled flag false", skeleton.reminderScheduledNow === false);
check("model telegram sent flag false", skeleton.telegramMessageSentNow === false);
check("model database read flag false", skeleton.databaseReadNow === false);
check("model database write flag false", skeleton.databaseWriteNow === false);
check("model external notification flag false", skeleton.externalNotificationNow === false);
check("model production reminder flag false", skeleton.productionReminderNow === false);
check("model payment tracking flag false", skeleton.paymentTrackingNow === false);
check("model vip unlock flag false", skeleton.vipUnlockNow === false);

const streakResult = evaluateAphroditeStreakNoop({
  userScope: "qa-user",
  surface: "miniapp",
  eventType: "daily-message-return",
  occurredAt: "2026-07-01T09:00:00.000Z",
});
const reminderResult = draftAphroditeReminderNoop({
  userScope: "qa-user",
  reminderType: "saved-report-revisit",
  requestedFor: "2026-07-02T09:00:00.000Z",
  fallbackRoute: "/miniapp/love-reading-preview",
});

for (const [name, result] of [
  ["streak noop", streakResult],
  ["reminder noop", reminderResult],
]) {
  check(`${name} accepted`, result.accepted === true && result.noopOnly === true);
  check(`${name} streakPersistedNow false`, result.streakPersistedNow === false);
  check(`${name} reminderScheduledNow false`, result.reminderScheduledNow === false);
  check(`${name} telegramMessageSentNow false`, result.telegramMessageSentNow === false);
  check(`${name} databaseWriteNow false`, result.databaseWriteNow === false);
  check(`${name} externalNotificationNow false`, result.externalNotificationNow === false);
  check(`${name} productionReminderNow false`, result.productionReminderNow === false);
}

for (const type of [
  "daily-message-return",
  "weekly-horoscope-return",
  "monthly-horoscope-return",
  "love-reading-revisit",
  "compatibility-check-in",
  "saved-report-revisit",
  "couple-calendar-day-return",
]) {
  check(`future reminder type exists: ${type}`, skeleton.futureReminderTypes.some((item) => item.type === type) && userFacingBundle.includes(type));
}

for (const label of APHRODITE_STREAK_REMINDER_NOOP_SKELETON_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("streakReminderNoopSkeleton"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/streak-reminder-noop-skeleton"));
check("page renders title from model", pageSource.includes("skeleton.title") && userFacingBundle.includes(APHRODITE_STREAK_REMINDER_NOOP_SKELETON_TITLE));
check("page renders classification from model", pageSource.includes("skeleton.classification") && userFacingBundle.includes(APHRODITE_STREAK_REMINDER_NOOP_SKELETON_CLASSIFICATION));
check("docs say no real reminders", docsSource.includes("Нет реальных напоминаний") || docsSource.includes("No real reminders"));
check("report says Package 189", reportSource.includes("Package 189"));
check("report says next package 190", reportSource.includes("Package 190"));

check("no Telegram message sending", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no DB read", !/process\.env\.DATABASE_URL|getDb\s*\(|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.select\s*\(|\.select\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no external notifications", !/new Notification\s*\(|Notification\.requestPermission|PushManager|serviceWorker\.ready|sendPush|sendEmail|resend\.emails|nodemailer/i.test(implementationBundle));
check("no reminder schedule runtime", !/setTimeout\s*\(|setInterval\s*\(|cron\.schedule|scheduleJob\s*\(|enqueueReminder\s*\(|createReminder\s*\(/i.test(implementationBundle));
check("no external analytics", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(|navigator\.sendBeacon\s*\(/i.test(implementationBundle));
check("no payment or VIP changes", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
