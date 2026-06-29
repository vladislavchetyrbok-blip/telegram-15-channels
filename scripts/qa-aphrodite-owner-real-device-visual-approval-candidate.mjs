#!/usr/bin/env node

import { getAphroditeOwnerRealDeviceVisualApprovalCandidate } from "../lib/zodiac/aphrodite-owner-real-device-visual-approval-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeOwnerRealDeviceVisualApprovalCandidate(),
  packageNumber: 335,
  title: "Owner Real Device Visual Approval Candidate",
  route: "/dashboard/networks/zodiac/owner-real-device-visual-approval-candidate",
  statusField: "ownerVisualApprovalCandidateStatus",
  statusValue: "PENDING_OWNER_DECISION",
  modelPath: "../lib/zodiac/aphrodite-owner-real-device-visual-approval-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/owner-real-device-visual-approval-candidate/page.tsx",
  docsPath: "../docs/aphrodite-owner-real-device-visual-approval-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-335.md",
  dashboardRouteKey: "ownerRealDeviceVisualApprovalCandidate",
  requiredStrings: [
  "what owner must explicitly approve",
  "no admin shell",
  "no Aphrodite",
  "no payment/VIP unlock",
  "acceptable mobile layout",
  "bottom nav",
  "input controls",
  "VIP preview density"
],
  requiredFalseFields: [
  "ownerRealDeviceApproval"
],
  requiredExactFields: {},
});
