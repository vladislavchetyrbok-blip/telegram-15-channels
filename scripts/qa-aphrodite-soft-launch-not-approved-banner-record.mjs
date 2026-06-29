#!/usr/bin/env node

import { getAphroditeSoftLaunchNotApprovedBannerRecord } from "../lib/zodiac/aphrodite-soft-launch-not-approved-banner-record.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeSoftLaunchNotApprovedBannerRecord(),
  packageNumber: 349,
  title: "Soft Launch Not Approved Banner Record",
  route: "/dashboard/networks/zodiac/soft-launch-not-approved-banner-record",
  statusField: "softLaunchBannerStatus",
  statusValue: "NOT_APPROVED",
  modelPath: "../lib/zodiac/aphrodite-soft-launch-not-approved-banner-record.ts",
  pagePath: "../app/dashboard/networks/zodiac/soft-launch-not-approved-banner-record/page.tsx",
  docsPath: "../docs/aphrodite-soft-launch-not-approved-banner-record.md",
  reportPath: "../docs/aphrodite-package-reports/package-349.md",
  dashboardRouteKey: "softLaunchNotApprovedBannerRecord",
  requiredStrings: [
  "visible internal dashboard status",
  "not public user-facing banner",
  "no production launch",
  "no Telegram posting",
  "all blockers listed"
],
  requiredFalseFields: [
  "softLaunchApproved"
],
  requiredExactFields: {},
});
