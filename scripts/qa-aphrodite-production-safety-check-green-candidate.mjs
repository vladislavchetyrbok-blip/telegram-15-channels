#!/usr/bin/env node

import { getAphroditeProductionSafetyCheckGreenCandidate } from "../lib/zodiac/aphrodite-production-safety-check-green-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeProductionSafetyCheckGreenCandidate(),
  packageNumber: 343,
  title: "Production Safety Check Green Candidate",
  route: "/dashboard/networks/zodiac/production-safety-check-green-candidate",
  statusField: "productionSafetyCheckGreenCandidateStatus",
  statusValue: "NOT_GREEN_BLOCKERS_OPEN",
  modelPath: "../lib/zodiac/aphrodite-production-safety-check-green-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/production-safety-check-green-candidate/page.tsx",
  docsPath: "../docs/aphrodite-production-safety-check-green-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-343.md",
  dashboardRouteKey: "productionSafetyCheckGreenCandidate",
  requiredStrings: [
  "safety check must be green before launch",
  "current red blockers",
  "no launch while red",
  "exact future green criteria"
],
  requiredFalseFields: [
  "productionSafetyGreen",
  "readyForProductionLaunch"
],
  requiredExactFields: {},
});
