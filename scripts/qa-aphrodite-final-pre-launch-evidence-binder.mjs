#!/usr/bin/env node

import { getAphroditeFinalPreLaunchEvidenceBinder } from "../lib/zodiac/aphrodite-final-pre-launch-evidence-binder.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeFinalPreLaunchEvidenceBinder(),
  packageNumber: 348,
  title: "Final Pre-Launch Evidence Binder",
  route: "/dashboard/networks/zodiac/final-pre-launch-evidence-binder",
  statusField: "preLaunchEvidenceBinderStatus",
  statusValue: "INCOMPLETE_WAITING_FOR_MANUAL_EVIDENCE",
  modelPath: "../lib/zodiac/aphrodite-final-pre-launch-evidence-binder.ts",
  pagePath: "../app/dashboard/networks/zodiac/final-pre-launch-evidence-binder/page.tsx",
  docsPath: "../docs/aphrodite-final-pre-launch-evidence-binder.md",
  reportPath: "../docs/aphrodite-package-reports/package-348.md",
  dashboardRouteKey: "finalPreLaunchEvidenceBinder",
  requiredStrings: [
  "screenshots",
  "env redacted check",
  "backup",
  "restore",
  "public URL",
  "BotFather",
  "safety green",
  "owner go/no-go"
],
  requiredFalseFields: [],
  requiredExactFields: {},
});
