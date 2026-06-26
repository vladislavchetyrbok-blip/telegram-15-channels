#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_RETENTION_SYSTEM_READINESS_CLASSIFICATION,
  APHRODITE_RETENTION_SYSTEM_READINESS_SAFETY_LABELS,
  APHRODITE_RETENTION_SYSTEM_READINESS_TITLE,
  getAphroditeRetentionSystemReadiness,
} from "../lib/zodiac/aphrodite-retention-system-readiness.ts";

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

console.log("Старт QA: Retention System Readiness...\n");

const modelPath = "../lib/zodiac/aphrodite-retention-system-readiness.ts";
const pagePath = "../app/dashboard/networks/zodiac/retention-system-readiness/page.tsx";
const docsPath = "../docs/aphrodite-retention-system-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-186.md";
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
const readiness = getAphroditeRetentionSystemReadiness();

check("model returns title", readiness.title === APHRODITE_RETENTION_SYSTEM_READINESS_TITLE);
check("model returns classification", readiness.classification === APHRODITE_RETENTION_SYSTEM_READINESS_CLASSIFICATION);
check("retention surfaces exist", readiness.surfaces.length >= 14);
check("future ideas exist", readiness.ideas.length >= 10);
check("safety boundaries exist", readiness.boundaries.length >= 9);
check("real reminders flag false", readiness.realRemindersNow === false);
check("telegram api flag false", readiness.telegramApiNow === false);
check("database write flag false", readiness.databaseWriteNow === false);
check("external analytics flag false", readiness.externalAnalyticsNow === false);
check("production tracking flag false", readiness.productionTrackingNow === false);
check("payment tracking flag false", readiness.paymentTrackingNow === false);
check("vip unlock flag false", readiness.vipUnlockNow === false);
check("all surfaces readiness-only", readiness.surfaces.every((surface) => surface.source === "readiness-only"));

for (const label of [
  "Daily Message",
  "Daily Horoscope",
  "Weekly Horoscope",
  "Monthly Horoscope",
  "AI Love Reading return",
  "Full Love Report teaser return",
  "Compatibility return",
  "Birth Matrix return",
  "VIP Couple Calendar return",
  "Saved reports future",
  "Streak future",
  "Reminder future",
  "Telegram channel CTA return",
  "Mini App return visit",
]) {
  check(`required retention surface exists: ${label}`, userFacingBundle.includes(label));
}

check("daily retention surfaces exist", readiness.surfaces.some((surface) => surface.cadence === "daily"));
check("weekly retention surfaces exist", readiness.surfaces.some((surface) => surface.cadence === "weekly"));
check("monthly retention surfaces exist", readiness.surfaces.some((surface) => surface.cadence === "monthly"));
check("saved reports future exists", userFacingBundle.includes("saved report history") && userFacingBundle.includes("Saved reports future"));
check("streak future exists", userFacingBundle.includes("soft streak") && userFacingBundle.includes("Streak future"));
check("reminder future exists", userFacingBundle.includes("manual reminder preference") && userFacingBundle.includes("Reminder future"));

for (const idea of [
  "daily return habit",
  "weekly planning habit",
  "monthly forecast habit",
  "relationship check-in",
  "saved report history",
  "new insight unlocked later",
  "soft streak",
  "manual reminder preference",
  "return from Telegram CTA",
  "return from Mini App module",
]) {
  check(`required future retention idea exists: ${idea}`, userFacingBundle.includes(idea));
}

for (const label of APHRODITE_RETENTION_SYSTEM_READINESS_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("retentionSystemReadiness"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/retention-system-readiness"));
check("page renders title from model", pageSource.includes("readiness.title") && userFacingBundle.includes(APHRODITE_RETENTION_SYSTEM_READINESS_TITLE));
check("page renders classification from model", pageSource.includes("readiness.classification") && userFacingBundle.includes(APHRODITE_RETENTION_SYSTEM_READINESS_CLASSIFICATION));
check("docs say no real reminders", docsSource.includes("No real reminders") || docsSource.includes("Нет реальных уведомлений"));
check("docs say no Telegram API", docsSource.includes("No Telegram API") || docsSource.includes("Нет Telegram API"));
check("docs say no DB writes", docsSource.includes("No database writes") || docsSource.includes("Нет записи в базу данных"));
check("report says Package 186", reportSource.includes("Package 186"));
check("report says next package 187", reportSource.includes("Package 187"));

check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no external analytics", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(|navigator\.sendBeacon\s*\(/i.test(implementationBundle));
check("no production tracking", !/productionTrackingNow:\s*true|productionTrackingEnabled\s*:\s*true|approvedForLaunch=true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(implementationBundle));
check("no payment or VIP changes", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
