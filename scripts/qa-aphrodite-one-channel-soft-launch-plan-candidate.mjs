#!/usr/bin/env node

import { getAphroditeOneChannelSoftLaunchPlanCandidate } from "../lib/zodiac/aphrodite-one-channel-soft-launch-plan-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeOneChannelSoftLaunchPlanCandidate(),
  packageNumber: 345,
  title: "One Channel Soft Launch Plan Candidate",
  route: "/dashboard/networks/zodiac/one-channel-soft-launch-plan-candidate",
  statusField: "oneChannelSoftLaunchPlanStatus",
  statusValue: "DRAFT_BLOCKED",
  modelPath: "../lib/zodiac/aphrodite-one-channel-soft-launch-plan-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/one-channel-soft-launch-plan-candidate/page.tsx",
  docsPath: "../docs/aphrodite-one-channel-soft-launch-plan-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-345.md",
  dashboardRouteKey: "oneChannelSoftLaunchPlanCandidate",
  requiredStrings: [
  "one channel/test link launch later",
  "not now",
  "monitoring plan",
  "rollback plan",
  "owner go/no-go first",
  "no Telegram posting now"
],
  requiredFalseFields: [],
  requiredExactFields: {
  "softLaunchStatus": "NO"
},
});
