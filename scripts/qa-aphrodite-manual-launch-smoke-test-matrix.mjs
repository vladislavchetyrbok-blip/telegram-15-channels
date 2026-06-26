#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_CLASSIFICATION,
  APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_SAFETY_LABELS,
  APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_TITLE,
  getAphroditeManualLaunchSmokeTestMatrix,
} from "../lib/zodiac/aphrodite-manual-launch-smoke-test-matrix.ts";

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

console.log("Старт QA: Manual Launch Smoke Test Matrix...\n");

const modelPath = "../lib/zodiac/aphrodite-manual-launch-smoke-test-matrix.ts";
const pagePath = "../app/dashboard/networks/zodiac/manual-launch-smoke-test-matrix/page.tsx";
const docsPath = "../docs/aphrodite-manual-launch-smoke-test-matrix.md";
const reportPath = "../docs/aphrodite-package-reports/package-195.md";
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
const smokeMatrix = getAphroditeManualLaunchSmokeTestMatrix();

check("model returns title", smokeMatrix.title === APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_TITLE);
check("model returns classification", smokeMatrix.classification === APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_CLASSIFICATION);
check("smoke tests exist", smokeMatrix.smokeTests.length >= 18);
check("all smoke tests are manual QA only", smokeMatrix.smokeTests.every((test) => test.source === "manual-qa-only"));
check("all smoke tests blocked now", smokeMatrix.smokeTests.every((test) => test.blockedNow === true));
check("all smoke tests require owner review", smokeMatrix.smokeTests.every((test) => test.ownerReviewRequired === true));
check("boundaries exist", smokeMatrix.boundaries.length >= 8);
check("summary manual QA only true", smokeMatrix.summary.manualQaOnlyNow === true);
check("launch approved false", smokeMatrix.launchApprovedNow === false);
check("production launch false", smokeMatrix.productionLaunchNow === false);
check("telegram api false", smokeMatrix.telegramApiNow === false);
check("message sending false", smokeMatrix.messageSendingNow === false);
check("active cta changed false", smokeMatrix.activeCtaChangedNow === false);
check("payment enabled false", smokeMatrix.paymentEnabledNow === false);
check("vip unlock false", smokeMatrix.vipUnlockNow === false);
check("database write false", smokeMatrix.databaseWriteNow === false);

for (const smokeTest of [
  "iPhone Telegram Mini App",
  "Android Telegram Mini App",
  "desktop Telegram",
  "browser fallback",
  "/miniapp",
  "/miniapp/love-reading-preview",
  "compatibility",
  "birth matrix",
  "30 days couple",
  "daily horoscope CTA",
  "weekly horoscope CTA",
  "monthly horoscope CTA",
  "support/refund page/readiness",
  "analytics noop",
  "fallback routes",
  "guard denied flow",
  "owner review blocked flow",
  "production safety blocked state",
]) {
  check(`required smoke test exists: ${smokeTest}`, smokeMatrix.smokeTests.some((item) => item.label === smokeTest) && userFacingBundle.includes(smokeTest));
}

for (const label of APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("manualLaunchSmokeTestMatrix"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/manual-launch-smoke-test-matrix"));
check("page renders title from model", pageSource.includes("smokeMatrix.title") && userFacingBundle.includes(APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_TITLE));
check("page renders classification from model", pageSource.includes("smokeMatrix.classification") && userFacingBundle.includes(APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_CLASSIFICATION));
check("docs say smoke matrix launches nothing", docsSource.includes("Manual smoke matrix ничего не запускает") && docsSource.includes("Нет Telegram API"));
check("report says Package 195", reportSource.includes("Package 195"));
check("report says Package 196 not started", reportSource.includes("Package 196 was not started"));

check("no production launch implementation", !/startProductionLaunch\s*\(|runLaunch\s*\(|launchApprovedNow:\s*true|productionLaunchNow:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no active CTA mutation", !/setChatMenuButton\s*\(|activeCtaChangedNow:\s*true|updateActiveCta\s*\(|activeTelegramCta\s*=/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no payment or VIP changes", !/sendInvoice\s*\(|createInvoiceLink\s*\(|paymentEnabledNow:\s*true|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
