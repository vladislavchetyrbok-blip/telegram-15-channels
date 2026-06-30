#!/usr/bin/env node

import { getAphroditePublicUrlClosureCandidate } from "../lib/zodiac/aphrodite-public-url-closure-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditePublicUrlClosureCandidate(),
  packageNumber: 341,
  title: "Public URL Closure Candidate",
  route: "/dashboard/networks/zodiac/public-url-closure-candidate",
  statusField: "publicUrlClosureStatus",
  statusValue: "NOT_CLOSED_MISSING_OR_UNVERIFIED",
  modelPath: "../lib/zodiac/aphrodite-public-url-closure-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/public-url-closure-candidate/page.tsx",
  docsPath: "../docs/aphrodite-public-url-closure-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-341.md",
  dashboardRouteKey: "publicUrlClosureCandidate",
  requiredStrings: [
  "HTTPS public URL required",
  "route checks required",
  "dashboard not public",
  "public Mini App routes shell-isolated",
  "no BotFather setup until URL verified"
],
  requiredFalseFields: [
  "publicAppUrlConfigured",
  "publicUrlApproved"
],
  requiredExactFields: {},
});
