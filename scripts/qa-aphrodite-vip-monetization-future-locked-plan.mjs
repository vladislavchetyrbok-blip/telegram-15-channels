#!/usr/bin/env node

import { getAphroditeVipMonetizationFutureLockedPlan } from "../lib/zodiac/aphrodite-vip-monetization-future-locked-plan.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeVipMonetizationFutureLockedPlan(),
  packageNumber: 350,
  title: "VIP Monetization Future Locked Plan",
  route: "/dashboard/networks/zodiac/vip-monetization-future-locked-plan",
  statusField: "vipMonetizationStatus",
  statusValue: "FUTURE_LOCKED_NOT_ACTIVE",
  modelPath: "../lib/zodiac/aphrodite-vip-monetization-future-locked-plan.ts",
  pagePath: "../app/dashboard/networks/zodiac/vip-monetization-future-locked-plan/page.tsx",
  docsPath: "../docs/aphrodite-vip-monetization-future-locked-plan.md",
  reportPath: "../docs/aphrodite-package-reports/package-350.md",
  dashboardRouteKey: "vipMonetizationFutureLockedPlan",
  requiredStrings: [
  "VIP monetization later",
  "no payment now",
  "no entitlement unlock now",
  "server-side entitlement required later",
  "refund/support later",
  "no App Store/Google Play payment now"
],
  requiredFalseFields: [],
  requiredExactFields: {},
});
