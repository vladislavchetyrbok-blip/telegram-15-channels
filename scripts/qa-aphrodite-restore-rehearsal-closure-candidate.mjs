#!/usr/bin/env node

import { getAphroditeRestoreRehearsalClosureCandidate } from "../lib/zodiac/aphrodite-restore-rehearsal-closure-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeRestoreRehearsalClosureCandidate(),
  packageNumber: 340,
  title: "Restore Rehearsal Closure Candidate",
  route: "/dashboard/networks/zodiac/restore-rehearsal-closure-candidate",
  statusField: "restoreRehearsalClosureStatus",
  statusValue: "NOT_CLOSED_NOT_COMPLETED",
  modelPath: "../lib/zodiac/aphrodite-restore-rehearsal-closure-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/restore-rehearsal-closure-candidate/page.tsx",
  docsPath: "../docs/aphrodite-restore-rehearsal-closure-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-340.md",
  dashboardRouteKey: "restoreRehearsalClosureCandidate",
  requiredStrings: [
  "restore rehearsal required",
  "no production DB mutation",
  "evidence required",
  "rollback confidence requirement"
],
  requiredFalseFields: [
  "restoreRehearsalCompleted"
],
  requiredExactFields: {},
});
