#!/usr/bin/env node

import { getAphroditeOwnerFinalGoNoGoCandidate } from "../lib/zodiac/aphrodite-owner-final-go-no-go-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeOwnerFinalGoNoGoCandidate(),
  packageNumber: 344,
  title: "Owner Final Go No-Go Candidate",
  route: "/dashboard/networks/zodiac/owner-final-go-no-go-candidate",
  statusField: "ownerFinalGoNoGoStatus",
  statusValue: "NO_GO_UNTIL_BLOCKERS_CLOSED",
  modelPath: "../lib/zodiac/aphrodite-owner-final-go-no-go-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/owner-final-go-no-go-candidate/page.tsx",
  docsPath: "../docs/aphrodite-owner-final-go-no-go-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-344.md",
  dashboardRouteKey: "ownerFinalGoNoGoCandidate",
  requiredStrings: [
  "owner explicit approval required",
  "all blockers must close first",
  "no automatic go",
  "soft launch not approved"
],
  requiredFalseFields: [],
  requiredExactFields: {
  "ownerGoNoGo": "NO_GO"
},
});
