#!/usr/bin/env node

import { getAphroditeRealDeviceOwnerApprovalDecisionRecord } from "../lib/zodiac/aphrodite-real-device-owner-approval-decision-record.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditeRealDeviceOwnerApprovalDecisionRecord(),
  packageNumber: 309,
  title: "Real Device Owner Approval Decision Record",
  route: "/dashboard/networks/zodiac/real-device-owner-approval-decision-record",
  statusField: "ownerApprovalDecision",
  statusValue: "PENDING",
  modelPath: "../lib/zodiac/aphrodite-real-device-owner-approval-decision-record.ts",
  pagePath: "../app/dashboard/networks/zodiac/real-device-owner-approval-decision-record/page.tsx",
  docsPath: "../docs/aphrodite-real-device-owner-approval-decision-record.md",
  reportPath: "../docs/aphrodite-package-reports/package-309.md",
  dashboardRouteKey: "realDeviceOwnerApprovalDecisionRecord",
  requiredStrings: [
  "approval cannot be granted by Codex",
  "owner screenshots required",
  "owner explicit go/no-go required",
  "no automatic launch",
  "publicLaunchApproved=false",
  "ownerManualReviewRequired=true"
],
  requiredFalseFields: [
  "ownerRealDeviceApproval",
  "ownerApprovalGranted"
],
});
