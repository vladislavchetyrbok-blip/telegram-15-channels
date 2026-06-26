#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_REAL_DEVICE_VISUAL_QA_CLASSIFICATION,
  APHRODITE_REAL_DEVICE_VISUAL_QA_SAFETY_LABELS,
  APHRODITE_REAL_DEVICE_VISUAL_QA_TITLE,
  getAphroditeRealDeviceVisualQaChecklist,
} from "../lib/zodiac/aphrodite-real-device-visual-qa-checklist.ts";

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

console.log("Старт QA: real-device visual QA checklist...\n");

const modelPath = "../lib/zodiac/aphrodite-real-device-visual-qa-checklist.ts";
const pagePath = "../app/dashboard/networks/zodiac/real-device-visual-qa-checklist/page.tsx";
const docsPath = "../docs/aphrodite-real-device-visual-qa-checklist.md";
const reportPath = "../docs/aphrodite-package-reports/package-208.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} существует`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const model = getAphroditeRealDeviceVisualQaChecklist();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_REAL_DEVICE_VISUAL_QA_TITLE);
check("classification exported", model.classification === APHRODITE_REAL_DEVICE_VISUAL_QA_CLASSIFICATION);
check("package number is 208", model.packageNumber === 208);
check("dashboard route linked from overview", dashboardSource.includes("/dashboard/networks/zodiac/real-device-visual-qa-checklist"));
check("dashboard QA route exists", dashboardQaSource.includes("realDeviceVisualQaChecklist"));
check("dashboard QA asserts title", dashboardQaSource.includes("Real Device Visual QA Checklist"));

for (const label of APHRODITE_REAL_DEVICE_VISUAL_QA_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, implementationBundle.includes(label));
}

for (const device of [
  "iPhone Telegram WebView",
  "Android Telegram WebView",
  "Telegram Desktop",
  "iPhone Safari",
  "Android Chrome",
  "desktop browser",
  "narrow screens",
  "slow network mode if possible",
  "Telegram safe area",
  "keyboard open state",
  "back button behavior",
]) {
  check(`device checklist exists: ${device}`, model.devices.some((item) => item.title === device));
  check(`device rendered/documented: ${device}`, implementationBundle.includes(device));
}

for (const screen of [
  "/miniapp",
  "AI Love Reading preview",
  "Birth Matrix",
  "Compatibility",
  "Mystic / Universe",
  "daily horoscope card",
  "weekly horoscope card",
  "monthly horoscope card",
  "fallback /miniapp/love-reading-preview",
  "guard denied/future VIP locked state",
]) {
  check(`screen covered: ${screen}`, model.screens.some((item) => item.title === screen));
  check(`screen rendered/documented: ${screen}`, implementationBundle.includes(screen));
}

check("compatibility result covered", implementationBundle.includes("compatibility result"));
check("Birth Matrix result covered", implementationBundle.includes("Birth Matrix result"));
check("30 days couple calendar covered", implementationBundle.includes("30 days couple calendar"));
check("no production launch", model.launchFlags.productionLaunchDone === false);
check("no Telegram API", model.launchFlags.telegramApiUsed === false);
check("no messages", model.launchFlags.messagesSent === false);
check("no BotFather change", model.launchFlags.botFatherChanged === false);
check("no active CTA change", model.launchFlags.activeCtaChanged === false);
check("no DB write", model.launchFlags.databaseWriteAdded === false);
check("no payment change", model.launchFlags.paymentAdded === false);
check("no VIP unlock", model.launchFlags.vipUnlockAdded === false);
check("next package is 209", model.nextRecommendedPackage.includes("Package 209"));
check("docs say Package 208", docsSource.includes("Package 208"));
check("report says Package 208", reportSource.includes("Package 208"));
check("report keeps Package 209 not started", reportSource.includes("Package 209 не начат"));

check("live Mini App source files not changed", gitDiffNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
  "components/zodiac-mini-app/ResultCards.tsx",
]).length === 0);
check("no workflow/cron changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set([
  "scripts/qa-aphrodite-real-device-visual-qa-checklist.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
check("script changes limited to Package 208 QA/dashboard QA", scriptChanges.every((file) => allowedScriptChanges.has(file)));

check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved=true/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
