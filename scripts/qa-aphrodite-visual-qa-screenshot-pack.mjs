#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_VISUAL_QA_SCREENSHOT_PACK_ROUTE,
  APHRODITE_VISUAL_QA_SCREENSHOT_PACK_TITLE,
  getAphroditeVisualQaScreenshotPack,
} from "../lib/zodiac/aphrodite-visual-qa-screenshot-pack.ts";

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

console.log("Starting QA: Aphrodite Visual QA Screenshot Pack...\n");

const modelPath = "../lib/zodiac/aphrodite-visual-qa-screenshot-pack.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/visual-qa-screenshot-pack/page.tsx";
const docsPath = "../docs/aphrodite-visual-qa-screenshot-pack.md";
const reportPath = "../docs/aphrodite-package-reports/package-245.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model file exists", exists(modelPath));
check("dashboard page exists", exists(dashboardPagePath));
check("docs file exists", exists(docsPath));
check("package report exists", exists(reportPath));
check("dashboard overview exists", exists(dashboardPath));
check("dashboard qa exists", exists(dashboardQaPath));

const model = getAphroditeVisualQaScreenshotPack();

check("package number is 245", model.packageNumber === 245);
check("title exported matches", model.title === APHRODITE_VISUAL_QA_SCREENSHOT_PACK_TITLE);
check("route exported matches", model.route === APHRODITE_VISUAL_QA_SCREENSHOT_PACK_ROUTE);
check("publicLaunchApproved is false", model.publicLaunchApproved === false);
check("ownerManualReviewRequired is true", model.ownerManualReviewRequired === true);

const viewports = model.requiredViewports.map((v) => v.width);
check("includes 360px viewport", viewports.includes(360));
check("includes 390px viewport", viewports.includes(390));
check("includes 430px viewport", viewports.includes(430));
check("includes 1200px viewport", viewports.includes(1200));

const screenIds = model.requiredScreens.map((s) => s.id);
check("includes HOME screen", screenIds.includes("HOME"));
check("includes COMPATIBILITY screen", screenIds.includes("COMPATIBILITY"));
check("includes BIRTH_MATRIX screen", screenIds.includes("BIRTH_MATRIX"));
check("includes MYSTIC_CARDS screen", screenIds.includes("MYSTIC_CARDS"));
check("includes VIP_PREVIEW screen", screenIds.includes("VIP_PREVIEW"));
check("includes RESULT_SHARE screen", screenIds.includes("RESULT_SHARE"));

check("visualAcceptanceCriteria count >= 5", model.visualAcceptanceCriteria.length >= 5);
check("telegramWebViewCriteria count >= 5", model.telegramWebViewCriteria.length >= 5);
check("evidenceFields count >= 5", model.evidenceFields.length >= 5);

const severities = model.issueSeverityScale.map((s) => s.level);
check("severity includes BLOCKER", severities.includes("BLOCKER"));
check("severity includes HIGH", severities.includes("HIGH"));
check("severity includes MEDIUM", severities.includes("MEDIUM"));
check("severity includes LOW", severities.includes("LOW"));
check("severity includes POLISH", severities.includes("POLISH"));

check("next package recommendation is Package 246", model.nextPackageRecommendation.includes("Package 246"));

check("safety flag productionLaunchDone is false", model.safetyFlags.productionLaunchDone === false);
check("safety flag telegramApiUsed is false", model.safetyFlags.telegramApiUsed === false);
check("safety flag messagesSent is false", model.safetyFlags.messagesSent === false);
check("safety flag paymentImplemented is false", model.safetyFlags.paymentImplemented === false);
check("safety flag vipUnlocked is false", model.safetyFlags.vipUnlocked === false);
check("safety flag dbWriteDone is false", model.safetyFlags.dbWriteDone === false);

const dashboardContent = read(dashboardPath);
check("dashboard page links to visual qa screenshot pack", dashboardContent.includes("/dashboard/networks/zodiac/visual-qa-screenshot-pack"));

const dashboardQaContent = read(dashboardQaPath);
check("qa dashboard includes visual qa screenshot pack route", dashboardQaContent.includes("visualQaScreenshotPack: \"/dashboard/networks/zodiac/visual-qa-screenshot-pack\""));

const changedFiles = gitChangedNames();
if (changedFiles.length > 0) {
  check("git scope helper returned real change data", true);
  const forbiddenChanges = changedFiles.filter((f) =>
    f.includes(".github/workflows") ||
    f.includes("package.json") ||
    f.includes("prisma/") ||
    f.includes(".env")
  );
  check("no forbidden files changed (workflows, db, env, package.json)", forbiddenChanges.length === 0);
} else {
  check("git scope helper check (no files changed or unstaged)", true);
}

console.log(`\nVisual QA Screenshot Pack QA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
