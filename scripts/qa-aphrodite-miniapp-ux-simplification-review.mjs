#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_CLASSIFICATION,
  APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_SAFETY_LABELS,
  APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_TITLE,
  getAphroditeMiniappUxSimplificationReview,
} from "../lib/zodiac/aphrodite-miniapp-ux-simplification-review.ts";

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

console.log("Старт QA: Mini App UX Simplification Review...\n");

const modelPath = "../lib/zodiac/aphrodite-miniapp-ux-simplification-review.ts";
const pagePath = "../app/dashboard/networks/zodiac/miniapp-ux-simplification-review/page.tsx";
const docsPath = "../docs/aphrodite-miniapp-ux-simplification-review.md";
const reportPath = "../docs/aphrodite-package-reports/package-192.md";
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
const uxReview = getAphroditeMiniappUxSimplificationReview();

check("model returns title", uxReview.title === APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_TITLE);
check("model returns classification", uxReview.classification === APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_CLASSIFICATION);
check("UX areas exist", uxReview.uxAreas.length >= 15);
check("all UX areas are review-only", uxReview.uxAreas.every((area) => area.source === "ux-review-only"));
check("recommendations exist", uxReview.recommendations.length >= 10);
check("all recommendations not started", uxReview.recommendations.every((item) => item.implementationState === "not-started"));
check("boundaries exist", uxReview.boundaries.length >= 7);
check("summary live flow false", uxReview.summary.liveFlowChangedNow === false);
check("live ui flag false", uxReview.liveUiChangedNow === false);
check("live flow flag false", uxReview.liveFlowChangedNow === false);
check("payment changed false", uxReview.paymentChangedNow === false);
check("vip unlock false", uxReview.vipUnlockNow === false);
check("telegram api false", uxReview.telegramApiNow === false);
check("database write false", uxReview.databaseWriteNow === false);
check("production launch false", uxReview.productionLaunchNow === false);

for (const area of [
  "Mini App home screen",
  "Love Reading entry",
  "Compatibility entry",
  "Birth Matrix entry",
  "Daily/weekly/monthly content entry",
  "too many cards/modules",
  "unclear VIP teasers",
  "CTA hierarchy",
  "button labels",
  "mobile readability",
  "loading states",
  "empty/error states",
  "back button behavior",
  "Telegram WebApp feel",
  "reduce cognitive load",
]) {
  check(`required UX area exists: ${area}`, uxReview.uxAreas.some((item) => item.label === area) && userFacingBundle.includes(area));
}

for (const recommendation of [
  "reduce top-level modules",
  "one primary CTA",
  "short labels",
  "group daily/weekly/monthly",
  "move VIP teasers below free actions",
  "explicit fallback",
  "consistent back behavior",
  "skeleton/loading copy",
  "friendly empty/error states",
  "Telegram safe area",
]) {
  check(`required recommendation exists: ${recommendation}`, uxReview.recommendations.some((item) => item.label === recommendation) && userFacingBundle.includes(recommendation));
}

for (const label of APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("miniappUxSimplificationReview"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/miniapp-ux-simplification-review"));
check("page renders title from model", pageSource.includes("uxReview.title") && userFacingBundle.includes(APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_TITLE));
check("page renders classification from model", pageSource.includes("uxReview.classification") && userFacingBundle.includes(APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_CLASSIFICATION));
check("docs say live UI unchanged", docsSource.includes("Live UI не изменён") && docsSource.includes("Нет Telegram API"));
check("report says Package 192", reportSource.includes("Package 192"));
check("report points to Package 193", reportSource.includes("Package 193"));

const liveMiniAppChanges = gitDiffNames([
  "app/miniapp",
  "app/compatibility",
  "app/birth-matrix",
  "components/zodiac-mini-app",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
]);
check("live Mini App UI/routes not changed", liveMiniAppChanges.length === 0);
check("no production launch implementation", !/startProductionLaunch\s*\(|runLaunch\s*\(|productionLaunchNow:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no payment or VIP changes", !/sendInvoice\s*\(|createInvoiceLink\s*\(|paymentChangedNow:\s*true|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
