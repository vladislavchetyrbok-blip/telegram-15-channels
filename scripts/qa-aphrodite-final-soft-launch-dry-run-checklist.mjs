#!/usr/bin/env node

import { getAphroditeFinalSoftLaunchDryRunChecklist } from "../lib/zodiac/aphrodite-final-soft-launch-dry-run-checklist.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditeFinalSoftLaunchDryRunChecklist(),
  packageNumber: 331,
  title: "Final Soft Launch Dry Run Checklist",
  route: "/dashboard/networks/zodiac/final-soft-launch-dry-run-checklist",
  statusField: "softLaunchDryRunStatus",
  statusValue: "NOT_STARTED_BLOCKERS_OPEN",
  modelPath: "../lib/zodiac/aphrodite-final-soft-launch-dry-run-checklist.ts",
  pagePath: "../app/dashboard/networks/zodiac/final-soft-launch-dry-run-checklist/page.tsx",
  docsPath: "../docs/aphrodite-final-soft-launch-dry-run-checklist.md",
  reportPath: "../docs/aphrodite-package-reports/package-331.md",
  dashboardRouteKey: "finalSoftLaunchDryRunChecklist",
  requiredStrings: [
  "dry run only after all blockers close",
  "one-channel/test-link approach",
  "rollback plan",
  "monitoring checklist",
  "no Telegram posting now",
  "no production launch now"
],
  requiredFalseFields: [
  "readyForSoftLaunch"
],
  requiredExactFields: {},
});
