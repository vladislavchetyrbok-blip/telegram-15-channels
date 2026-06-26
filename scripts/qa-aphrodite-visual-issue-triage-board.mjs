#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_CLASSIFICATION,
  APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_SAFETY_LABELS,
  APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_TITLE,
  getAphroditeVisualIssueTriageBoard,
} from "../lib/zodiac/aphrodite-visual-issue-triage-board.ts";

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

console.log("Старт QA: Visual Issue Triage Board...\n");

const modelPath = "../lib/zodiac/aphrodite-visual-issue-triage-board.ts";
const pagePath = "../app/dashboard/networks/zodiac/visual-issue-triage-board/page.tsx";
const docsPath = "../docs/aphrodite-visual-issue-triage-board.md";
const reportPath = "../docs/aphrodite-package-reports/package-211.md";
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
const model = getAphroditeVisualIssueTriageBoard();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_TITLE);
check("classification exported", model.classification === APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_CLASSIFICATION);
check("package number is 211", model.packageNumber === 211);
check("dashboard route linked from overview", dashboardSource.includes("/dashboard/networks/zodiac/visual-issue-triage-board"));
check("dashboard QA route exists", dashboardQaSource.includes("visualIssueTriageBoard"));
check("dashboard QA asserts title", dashboardQaSource.includes("Visual Issue Triage Board"));

for (const label of APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, implementationBundle.includes(label));
}

for (const category of [
  "layout issue",
  "text too long",
  "unclear CTA",
  "mobile overflow",
  "Telegram WebView issue",
  "date input issue",
  "compatibility repeated copy",
  "visual hierarchy issue",
  "loading state issue",
  "error state issue",
  "route/startapp issue",
  "cache/deploy issue",
]) {
  check(`issue category exists: ${category}`, model.categories.some((item) => item.title === category));
  check(`issue category rendered/documented: ${category}`, implementationBundle.includes(category));
}

for (const severity of ["blocker", "high", "medium", "low", "polish"]) {
  check(`severity exists: ${severity}`, model.severities.some((item) => item.title === severity));
  check(`severity rendered/documented: ${severity}`, implementationBundle.includes(severity));
}

for (const status of ["new", "confirmed", "needs screenshot", "ready for fix", "fixed", "verified"]) {
  check(`status exists: ${status}`, model.statuses.some((item) => item.title === status));
  check(`status rendered/documented: ${status}`, implementationBundle.includes(status));
}

check("screenshot-needed state exists", implementationBundle.includes("needs screenshot"));
check("manual board rules exist", model.manualBoardRules.length >= 5);
check("no external integrations flag", model.safetyFlags.externalIntegrationsUsed === false);
check("no GitHub API flag", model.safetyFlags.githubApiUsed === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP flag", model.safetyFlags.vipUnlockAdded === false);
check("next package is 212", model.nextRecommendedPackage.includes("Package 212"));
check("docs say Package 211", docsSource.includes("Package 211"));
check("report says Package 211", reportSource.includes("Package 211"));
check("report keeps Package 212 not started", reportSource.includes("Package 212 не начат"));

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
  "scripts/qa-aphrodite-visual-issue-triage-board.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
check("script changes limited to Package 211 QA/dashboard QA", scriptChanges.every((file) => allowedScriptChanges.has(file)));

check("no GitHub API implementation", !/@octokit|api\.github\.com|issues\.create|createIssue|graphql\.github|gh\s+issue/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no external integration implementation", !/fetch\s*\(|axios|posthog|amplitude|gtag|analytics\.track|navigator\.sendBeacon/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved=true/i.test(safetyBundle));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
