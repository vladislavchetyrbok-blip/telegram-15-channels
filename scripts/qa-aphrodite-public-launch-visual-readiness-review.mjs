#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CLASSIFICATION,
  APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CONCLUSION,
  APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_TITLE,
  APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT,
  APHRODITE_PUBLIC_LAUNCH_VISUAL_SAFETY_LABELS,
  getAphroditePublicLaunchVisualBlockers,
  getAphroditePublicLaunchVisualNextSteps,
  getAphroditePublicLaunchVisualReadinessChecklist,
  getAphroditePublicLaunchVisualReadinessSurfaces,
  getAphroditePublicLaunchVisualSafetyBoundaries,
} from "../lib/zodiac/aphrodite-public-launch-visual-readiness-review.ts";

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

console.log("Старт QA: Public Launch Visual Readiness Review...\n");

const modelPath = "../lib/zodiac/aphrodite-public-launch-visual-readiness-review.ts";
const pagePath = "../app/dashboard/networks/zodiac/public-launch-visual-readiness-review/page.tsx";
const docsPath = "../docs/aphrodite-public-launch-visual-readiness-review.md";
const reportPath = "../docs/aphrodite-package-reports/package-207.md";
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
  check(`${label} существует`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const surfaces = getAphroditePublicLaunchVisualReadinessSurfaces();
const checklist = getAphroditePublicLaunchVisualReadinessChecklist();
const blockers = getAphroditePublicLaunchVisualBlockers();
const boundaries = getAphroditePublicLaunchVisualSafetyBoundaries();
const nextSteps = getAphroditePublicLaunchVisualNextSteps();

const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_TITLE === "Public Launch Visual Readiness Review");
check("classification exported", APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CLASSIFICATION.includes("Только visual review"));
check("manual conclusion exists", APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CONCLUSION.includes("Публичный запуск не одобрен автоматически"));
check("dashboard imports model", pageSource.includes("getAphroditePublicLaunchVisualReadinessSurfaces"));
check("dashboard route linked from overview", dashboardSource.includes("/dashboard/networks/zodiac/public-launch-visual-readiness-review"));
check("dashboard QA route exists", dashboardQaSource.includes("publicLaunchVisualReadinessReview"));
check("dashboard QA asserts title", dashboardQaSource.includes("Public Launch Visual Readiness Review"));

const requiredSurfaceTitles = [
  "Mini App home",
  "AI Love Reading preview",
  "Birth Matrix",
  "Compatibility result",
  "Mystic / Universe",
  "Daily horoscope cards",
  "Weekly horoscope cards",
  "Monthly horoscope cards",
  "fallback route",
  "guard/fallback visual state",
  "mobile layout",
  "Telegram WebView visual behavior",
  "iPhone check",
  "Android check",
  "desktop Telegram check",
  "browser fallback check",
];

for (const title of requiredSurfaceTitles) {
  check(`surface exists: ${title}`, surfaces.some((surface) => surface.title === title));
  check(`surface rendered/documented: ${title}`, implementationBundle.includes(title));
}

for (const status of [
  "ready-for-manual-review",
  "good-enough-for-mvp",
  "needs-polish",
  "needs-device-test",
  "not-user-facing",
]) {
  check(`readiness status exists: ${status}`, surfaces.some((surface) => surface.status === status));
}

for (const surface of surfaces) {
  check(`${surface.id}: source files listed`, surface.sourceFiles.length > 0);
  check(`${surface.id}: evidence listed`, surface.evidence.length >= 3);
  check(`${surface.id}: manual checks listed`, surface.manualChecks.length >= 3);
}

check("iPhone checklist exists", checklist.some((item) => item.label === "iPhone checklist"));
check("Android checklist exists", checklist.some((item) => item.label === "Android checklist"));
check("desktop Telegram checklist exists", checklist.some((item) => item.label === "desktop Telegram check"));
check("browser fallback checklist exists", checklist.some((item) => item.label === "browser fallback checklist"));
check("Telegram WebView checklist exists", checklist.some((item) => item.label === "Telegram WebView checklist"));
check("owner manual review required", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.ownerManualReviewRequired === true);
check("publicLaunchApproved=false", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.publicLaunchApproved === false);

for (const label of APHRODITE_PUBLIC_LAUNCH_VISUAL_SAFETY_LABELS) {
  check(`Russian safety label exists: ${label}`, implementationBundle.includes(label));
}

check("no production launch", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.productionLaunchDone === false);
check("no Telegram API", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.telegramApiUsed === false);
check("no message sending", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.messagesSent === false);
check("no BotFather change", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.botFatherChanged === false);
check("no active CTA change", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.activeCtaLogicChanged === false);
check("no DB write", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.databaseWriteAdded === false);
check("no payment change", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.paymentAdded === false);
check("no VIP unlock", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.vipUnlockAdded === false);
check("no workflow/cron/publish change", APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.cronWorkflowPublishChanged === false);

check("blockers include owner review", blockers.some((blocker) => blocker.id === "owner-manual-review-required"));
check("blockers include device check", blockers.some((blocker) => blocker.id === "real-device-visual-check-required"));
check("blockers include functional smoke", blockers.some((blocker) => blocker.id === "functional-smoke-before-public-launch"));
check("safety boundaries include production", boundaries.some((boundary) => boundary.visibleLabel === "Нет production-запуска"));
check("safety boundaries include Telegram API", boundaries.some((boundary) => boundary.visibleLabel === "Нет Telegram API"));
check("next package is 208", nextSteps.some((step) => step.package === "Package 208" && step.title === "Real Device Visual QA Checklist"));

check("docs say Package 207", docsSource.includes("Package 207"));
check("docs say no production launch", docsSource.includes("не запускает production"));
check("docs say no Telegram API", docsSource.includes("не вызывает Telegram API"));
check("docs say no messages", docsSource.includes("не отправляет сообщения"));
check("docs say no BotFather", docsSource.includes("не меняет BotFather"));
check("docs say no active CTA", docsSource.includes("не меняет active Telegram CTA logic"));
check("docs say no payment", docsSource.includes("не реализует оплату"));
check("docs say no VIP unlock", docsSource.includes("не реализует VIP unlock"));
check("docs say no DB write", docsSource.includes("не пишет в базу данных"));
check("docs say no schema change", docsSource.includes("не меняет database schema"));
check("docs say no cron/workflow/publish", docsSource.includes("не меняет cron/workflow/publish scripts"));
check("report says Package 207", reportSource.includes("Package 207"));
check("report keeps Package 208 not started", reportSource.includes("Package 208 не начат"));

check("live Mini App source files not changed", gitDiffNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
  "components/zodiac-mini-app/ResultCards.tsx",
  "components/zodiac-mini-app/AphroditeHoroscopeCard.tsx",
  "components/zodiac-mini-app/AphroditeHoroscopePeriodBadge.tsx",
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
  "scripts/qa-aphrodite-public-launch-visual-readiness-review.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
check("script changes limited to Package 207 QA/dashboard QA", scriptChanges.every((file) => allowedScriptChanges.has(file)));

check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved=true/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
