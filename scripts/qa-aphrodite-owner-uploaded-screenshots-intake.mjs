#!/usr/bin/env node

import { getAphroditeOwnerUploadedScreenshotsIntake } from "../lib/zodiac/aphrodite-owner-uploaded-screenshots-intake.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeOwnerUploadedScreenshotsIntake(),
  packageNumber: 334,
  title: "Owner Uploaded Screenshots Intake",
  route: "/dashboard/networks/zodiac/owner-uploaded-screenshots-intake",
  statusField: "ownerUploadedScreenshotsStatus",
  statusValue: "WAITING_FOR_UPLOADS",
  modelPath: "../lib/zodiac/aphrodite-owner-uploaded-screenshots-intake.ts",
  pagePath: "../app/dashboard/networks/zodiac/owner-uploaded-screenshots-intake/page.tsx",
  docsPath: "../docs/aphrodite-owner-uploaded-screenshots-intake.md",
  reportPath: "../docs/aphrodite-package-reports/package-334.md",
  dashboardRouteKey: "ownerUploadedScreenshotsIntake",
  requiredStrings: [
  "expected screenshot list",
  "no fake screenshots",
  "no auto-approval",
  "evidence naming rules",
  "Telegram WebView requirement",
  "Package 303 VIP density check"
],
  requiredFalseFields: [
  "screenshotsAccepted",
  "ownerApprovalGranted"
],
  requiredExactFields: {},
});
