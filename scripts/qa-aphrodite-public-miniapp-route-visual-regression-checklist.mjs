#!/usr/bin/env node

import { getAphroditePublicMiniappRouteVisualRegressionChecklist } from "../lib/zodiac/aphrodite-public-miniapp-route-visual-regression-checklist.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditePublicMiniappRouteVisualRegressionChecklist(),
  packageNumber: 307,
  title: "Public Mini App Route Visual Regression Checklist",
  route: "/dashboard/networks/zodiac/public-miniapp-route-visual-regression-checklist",
  statusField: "visualRegressionChecklistStatus",
  statusValue: "READY_FOR_RECHECK",
  modelPath: "../lib/zodiac/aphrodite-public-miniapp-route-visual-regression-checklist.ts",
  pagePath: "../app/dashboard/networks/zodiac/public-miniapp-route-visual-regression-checklist/page.tsx",
  docsPath: "../docs/aphrodite-public-miniapp-route-visual-regression-checklist.md",
  reportPath: "../docs/aphrodite-package-reports/package-307.md",
  dashboardRouteKey: "publicMiniappRouteVisualRegressionChecklist",
  requiredStrings: [
  "/miniapp",
  "/compatibility",
  "/birth-matrix",
  "/vip-preview",
  "/vip-compatibility-report",
  "/miniapp?startapp=mystic",
  "/miniapp?startapp=compatibility",
  "/miniapp?startapp=birth_matrix",
  "/miniapp?startapp=vip",
  "no admin shell",
  "no Aphrodite visible",
  "no broken bottom nav",
  "no horizontal overflow",
  "no broken inputs",
  "no unlocked VIP",
  "no active payment"
],
  requiredFalseFields: [],
});
