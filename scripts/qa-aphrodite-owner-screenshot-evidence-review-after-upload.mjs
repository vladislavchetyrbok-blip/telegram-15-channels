#!/usr/bin/env node

import { getAphroditeOwnerScreenshotEvidenceReviewAfterUpload } from "../lib/zodiac/aphrodite-owner-screenshot-evidence-review-after-upload.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditeOwnerScreenshotEvidenceReviewAfterUpload(),
  packageNumber: 324,
  title: "Owner Screenshot Evidence Review After Upload",
  route: "/dashboard/networks/zodiac/owner-screenshot-evidence-review-after-upload",
  statusField: "ownerScreenshotEvidenceReviewStatus",
  statusValue: "WAITING_FOR_OWNER_UPLOADS",
  modelPath: "../lib/zodiac/aphrodite-owner-screenshot-evidence-review-after-upload.ts",
  pagePath: "../app/dashboard/networks/zodiac/owner-screenshot-evidence-review-after-upload/page.tsx",
  docsPath: "../docs/aphrodite-owner-screenshot-evidence-review-after-upload.md",
  reportPath: "../docs/aphrodite-package-reports/package-324.md",
  dashboardRouteKey: "ownerScreenshotEvidenceReviewAfterUpload",
  requiredStrings: [
  "required real Telegram screenshots",
  "no fake screenshots",
  "no automatic approval",
  "VIP preview after Package 303",
  "input checks",
  "bottom nav checks",
  "no payment/VIP unlock"
],
  requiredFalseFields: [
  "ownerApprovalGranted"
],
  requiredExactFields: {
  "screenshotsReceived": 0
},
});
