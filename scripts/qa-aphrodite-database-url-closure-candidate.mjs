#!/usr/bin/env node

import { getAphroditeDatabaseUrlClosureCandidate } from "../lib/zodiac/aphrodite-database-url-closure-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeDatabaseUrlClosureCandidate(),
  packageNumber: 337,
  title: "DATABASE_URL Closure Candidate",
  route: "/dashboard/networks/zodiac/database-url-closure-candidate",
  statusField: "databaseUrlClosureStatus",
  statusValue: "NOT_CLOSED_MISSING_OR_UNVERIFIED",
  modelPath: "../lib/zodiac/aphrodite-database-url-closure-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/database-url-closure-candidate/page.tsx",
  docsPath: "../docs/aphrodite-database-url-closure-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-337.md",
  dashboardRouteKey: "databaseUrlClosureCandidate",
  requiredStrings: [
  "closure only after redacted presence check says present",
  "no value printed",
  "no connection test in this package",
  "no production DB writes"
],
  requiredFalseFields: [
  "databaseUrlConfigured"
],
  requiredExactFields: {},
});
