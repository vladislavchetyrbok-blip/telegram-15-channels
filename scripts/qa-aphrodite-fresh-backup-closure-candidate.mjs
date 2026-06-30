#!/usr/bin/env node

import { getAphroditeFreshBackupClosureCandidate } from "../lib/zodiac/aphrodite-fresh-backup-closure-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeFreshBackupClosureCandidate(),
  packageNumber: 339,
  title: "Fresh Backup Closure Candidate",
  route: "/dashboard/networks/zodiac/fresh-backup-closure-candidate",
  statusField: "freshBackupClosureStatus",
  statusValue: "NOT_CLOSED_STALE_OR_UNVERIFIED",
  modelPath: "../lib/zodiac/aphrodite-fresh-backup-closure-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/fresh-backup-closure-candidate/page.tsx",
  docsPath: "../docs/aphrodite-fresh-backup-closure-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-339.md",
  dashboardRouteKey: "freshBackupClosureCandidate",
  requiredStrings: [
  "backup <24h required",
  "no fake backup evidence",
  "no production DB connection",
  "evidence path required",
  "backup timestamp required"
],
  requiredFalseFields: [
  "backupMarkedFresh"
],
  requiredExactFields: {
  "backupFreshness": "STALE_OR_UNVERIFIED"
},
});
