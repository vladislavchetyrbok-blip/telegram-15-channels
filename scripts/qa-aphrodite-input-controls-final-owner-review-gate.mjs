#!/usr/bin/env node

import { getAphroditeInputControlsFinalOwnerReviewGate } from "../lib/zodiac/aphrodite-input-controls-final-owner-review-gate.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditeInputControlsFinalOwnerReviewGate(),
  packageNumber: 308,
  title: "Input Controls Final Owner Review Gate",
  route: "/dashboard/networks/zodiac/input-controls-final-owner-review-gate",
  statusField: "inputControlsOwnerReviewStatus",
  statusValue: "PENDING_OWNER_CONFIRMATION",
  modelPath: "../lib/zodiac/aphrodite-input-controls-final-owner-review-gate.ts",
  pagePath: "../app/dashboard/networks/zodiac/input-controls-final-owner-review-gate/page.tsx",
  docsPath: "../docs/aphrodite-input-controls-final-owner-review-gate.md",
  reportPath: "../docs/aphrodite-package-reports/package-308.md",
  dashboardRouteKey: "inputControlsFinalOwnerReviewGate",
  requiredStrings: [
  "01012000 -> 01.01.2000",
  "time picker/input visible and readable",
  "unknown time state works",
  "city Днепр / Дніпро suggestions visible",
  "no city external API",
  "no raw personal data saved",
  "no DB writes"
],
  requiredFalseFields: [],
});
