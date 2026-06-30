#!/usr/bin/env node

import { getAphroditeFinalNoMoreReadinessPackagesGate } from "../lib/zodiac/aphrodite-final-no-more-readiness-packages-gate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeFinalNoMoreReadinessPackagesGate(),
  packageNumber: 353,
  title: "Final No More Readiness Packages Gate",
  route: "/dashboard/networks/zodiac/final-no-more-readiness-packages-gate",
  statusField: "readinessPackageStopStatus",
  statusValue: "STOP_UNTIL_MANUAL_EVIDENCE",
  modelPath: "../lib/zodiac/aphrodite-final-no-more-readiness-packages-gate.ts",
  pagePath: "../app/dashboard/networks/zodiac/final-no-more-readiness-packages-gate/page.tsx",
  docsPath: "../docs/aphrodite-final-no-more-readiness-packages-gate.md",
  reportPath: "../docs/aphrodite-package-reports/package-353.md",
  dashboardRouteKey: "finalNoMoreReadinessPackagesGate",
  requiredStrings: [
  "no more readiness packages after this unless new manual evidence appears",
  "next work must be real owner actions",
  "Codex should not keep adding checklists",
  "Claude/Antigravity only review real evidence"
],
  requiredFalseFields: [],
  requiredExactFields: {},
});
