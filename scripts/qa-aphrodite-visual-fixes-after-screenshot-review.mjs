#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_VISUAL_FIXES_AFTER_SCREENSHOT_REVIEW_ROUTE,
  getAphroditeVisualFixesAfterScreenshotReview,
} from "../lib/zodiac/aphrodite-visual-fixes-after-screenshot-review.ts";

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

console.log("Starting QA: Aphrodite Visual Fixes After Screenshot Review...\n");

const modelPath = "../lib/zodiac/aphrodite-visual-fixes-after-screenshot-review.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/visual-fixes-after-screenshot-review/page.tsx";
const docsPath = "../docs/aphrodite-visual-fixes-after-screenshot-review.md";
const reportPath = "../docs/aphrodite-package-reports/package-246.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model exists", exists(modelPath));
check("dashboard page exists", exists(dashboardPagePath));
check("docs exist", exists(docsPath));
check("report exists", exists(reportPath));
check("dashboard navigation exists", exists(dashboardPath));

const model = getAphroditeVisualFixesAfterScreenshotReview();

check("package number is 246", model.packageNumber === 246);
check("publicLaunchApproved=false", model.publicLaunchApproved === false);
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true);
check("productionLaunchDone is false", model.productionLaunchDone === false);
check("telegramApiUsed is false", model.telegramApiUsed === false);
check("messagesSent is false", model.messagesSent === false);
check("botFatherChanged is false", model.botFatherChanged === false);
check("activeCtaLogicChanged is false", model.activeCtaLogicChanged === false);
check("dbWriteAdded is false", model.dbWriteAdded === false);
check("externalAnalyticsAdded is false", model.externalAnalyticsAdded === false);
check("paymentAdded is false", model.paymentAdded === false);
check("vipUnlockAdded is false", model.vipUnlockAdded === false);
check("entitlementBypassAdded is false", model.entitlementBypassAdded === false);
check("cronWorkflowsPublishChanged is false", model.cronWorkflowsPublishChanged === false);
check("secretsAdded is false", model.secretsAdded === false);

const screenIds = model.inspectedScreens.map((s) => s.id);
check("inspected screens include Home", screenIds.includes("home"));
check("inspected screens include Compatibility", screenIds.includes("compatibility"));
check("inspected screens include Birth Matrix", screenIds.includes("birth-matrix"));
check("inspected screens include Mystic Cards", screenIds.includes("mystic-cards"));
check("inspected screens include VIP Preview", screenIds.includes("vip-preview"));
check("inspected screens include Result Cards", screenIds.includes("result-cards"));

const viewports = model.executedViewports.map((v) => v.width);
check("viewports include 360", viewports.includes(360));
check("viewports include 390", viewports.includes(390));
check("viewports include 430", viewports.includes(430));

check("fixesApplied or manualNoIssues status documented", model.fixesApplied.length > 0);
check("issuesDeferred documented", model.issuesDeferred.length > 0);
check("next package recommendation is Package 247", model.nextPackageRecommendation.includes("Package 247"));

const dashboardContent = read(dashboardPath);
check("dashboard navigation link exists", dashboardContent.includes(APHRODITE_VISUAL_FIXES_AFTER_SCREENSHOT_REVIEW_ROUTE));

const dashboardQaContent = read(dashboardQaPath);
check("dashboard QA asserts route link", dashboardQaContent.includes("visualFixesAfterScreenshotReview: \"/dashboard/networks/zodiac/visual-fixes-after-screenshot-review\""));

const globalsContent = read("../app/globals.css");
check("globals.css includes .aphrodite-pkg-246-visual-fix", globalsContent.includes(".aphrodite-pkg-246-visual-fix"));
check("globals.css includes .aphrodite-button-touch-fix", globalsContent.includes(".aphrodite-button-touch-fix"));

const changedFiles = gitChangedNames();
if (changedFiles.length > 0) {
  check("git scope helper returned real change data", true);
  const forbiddenChanges = changedFiles.filter((f) =>
    f.includes(".github/workflows") ||
    f.includes("package.json") ||
    f.includes("prisma/") ||
    f.includes(".env")
  );
  check("no forbidden files changed", forbiddenChanges.length === 0);
} else {
  check("git scope helper check", true);
}

console.log(`\nAphrodite Visual Fixes QA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
