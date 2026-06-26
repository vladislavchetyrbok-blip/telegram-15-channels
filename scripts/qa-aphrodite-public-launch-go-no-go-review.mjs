#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_CLASSIFICATION,
  APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_SAFETY_LABELS,
  APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_TITLE,
  getAphroditePublicLaunchGoNoGoReview,
} from "../lib/zodiac/aphrodite-public-launch-go-no-go-review.ts";

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

console.log("Старт QA: Public Launch Go/No-Go Review...\n");

const modelPath = "../lib/zodiac/aphrodite-public-launch-go-no-go-review.ts";
const pagePath = "../app/dashboard/networks/zodiac/public-launch-go-no-go-review/page.tsx";
const docsPath = "../docs/aphrodite-public-launch-go-no-go-review.md";
const reportPath = "../docs/aphrodite-package-reports/package-212.md";
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
const model = getAphroditePublicLaunchGoNoGoReview();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_TITLE);
check("classification exported", model.classification === APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_CLASSIFICATION);
check("package number is 212", model.packageNumber === 212);
check("dashboard route linked from overview", dashboardSource.includes("/dashboard/networks/zodiac/public-launch-go-no-go-review"));
check("dashboard QA route exists", dashboardQaSource.includes("publicLaunchGoNoGoReview"));
check("dashboard QA asserts title", dashboardQaSource.includes("Public Launch Go/No-Go Review"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("owner manual review required", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));
check("unresolved blocker count exists", model.unresolvedBlockerCount >= 3 && implementationBundle.includes("unresolvedBlockerCount"));

for (const label of APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, implementationBundle.includes(label));
}

for (const dependency of [
  "visual readiness",
  "real device checklist",
  "WebView/startapp diagnostics",
  "live version/cache marker",
  "issue triage board",
  "launch checklist",
  "manual smoke matrix",
  "support/refund readiness",
  "analytics/privacy readiness",
  "production safety blockers",
  "env blockers",
  "backup blocker",
  "owner approval",
]) {
  check(`dependency exists: ${dependency}`, model.dependencies.some((item) => item.title === dependency));
  check(`dependency rendered/documented: ${dependency}`, implementationBundle.includes(dependency));
}

for (const blocker of [
  "DATABASE_URL is not configured",
  "TELEGRAM_BOT_TOKEN is not configured",
  "Latest backup is older than 24 hours",
]) {
  check(`production safety blocker exists: ${blocker}`, model.productionSafetyBlockers.includes(blocker));
  check(`production safety blocker rendered/documented: ${blocker}`, implementationBundle.includes(blocker));
}

check("real device checklist dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/real-device-visual-qa-checklist"));
check("startapp diagnostics dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics"));
check("cache marker dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/live-version-cache-marker-readiness"));
check("issue triage dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/visual-issue-triage-board"));
check("support/refund dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/support-refund-policy-readiness"));
check("analytics/privacy dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/analytics-privacy-safety-suite"));
check("production safety blockers exist", model.productionSafetyBlockers.length >= 3);
check("no production launch", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API", model.safetyFlags.telegramApiUsed === false);
check("no BotFather changes", model.safetyFlags.botFatherChanged === false);
check("no active CTA change", model.safetyFlags.activeCtaChanged === false);
check("no messages", model.safetyFlags.messagesSent === false);
check("no DB write", model.safetyFlags.databaseWriteAdded === false);
check("no payment", model.safetyFlags.paymentAdded === false);
check("no VIP", model.safetyFlags.vipUnlockAdded === false);
check("next package is 213", model.nextRecommendedPackage.includes("Package 213"));
check("docs say Package 212", docsSource.includes("Package 212"));
check("report says Package 212", reportSource.includes("Package 212"));
check("report keeps Package 213 not started", reportSource.includes("Package 213 не начат"));

check("live Mini App source files not changed", gitDiffNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
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
  "scripts/qa-aphrodite-public-launch-go-no-go-review.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
check("script changes limited to Package 212 QA/dashboard QA", scriptChanges.every((file) => allowedScriptChanges.has(file)));

check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no BotFather API modification", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved=true/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
