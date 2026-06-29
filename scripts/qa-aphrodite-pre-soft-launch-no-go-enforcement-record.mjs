#!/usr/bin/env node

import { getAphroditePreSoftLaunchNoGoEnforcementRecord } from "../lib/zodiac/aphrodite-pre-soft-launch-no-go-enforcement-record.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditePreSoftLaunchNoGoEnforcementRecord(),
  packageNumber: 311,
  title: "Pre-Soft-Launch No-Go Enforcement Record",
  route: "/dashboard/networks/zodiac/pre-soft-launch-no-go-enforcement-record",
  statusField: "softLaunchStatus",
  statusValue: "NO_GO_BLOCKERS_OPEN",
  modelPath: "../lib/zodiac/aphrodite-pre-soft-launch-no-go-enforcement-record.ts",
  pagePath: "../app/dashboard/networks/zodiac/pre-soft-launch-no-go-enforcement-record/page.tsx",
  docsPath: "../docs/aphrodite-pre-soft-launch-no-go-enforcement-record.md",
  reportPath: "../docs/aphrodite-package-reports/package-311.md",
  dashboardRouteKey: "preSoftLaunchNoGoEnforcementRecord",
  requiredStrings: [
  "why no-go",
  "what must become true",
  "no production launch",
  "no Telegram posting",
  "no BotFather setup",
  "no payment/VIP unlock",
  "NO_GO_BLOCKERS_OPEN"
],
  requiredFalseFields: [
  "readyForSoftLaunch"
],
});
