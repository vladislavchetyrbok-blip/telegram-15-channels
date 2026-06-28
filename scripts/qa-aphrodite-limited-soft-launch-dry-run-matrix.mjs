#!/usr/bin/env node

import { runFinalReadinessPackageQa } from "./lib/qa-aphrodite-final-readiness-package.mjs";

runFinalReadinessPackageQa({
  packageNumber: 259,
  slug: "limited-soft-launch-dry-run-matrix",
  route: "/dashboard/networks/zodiac/limited-soft-launch-dry-run-matrix",
  title: "Limited Soft Launch Dry Run Matrix",
  routeKey: "limitedSoftLaunchDryRunMatrix",
  requiredMarkers: [
    "dry-run only",
    "No production launch was performed",
    "limited soft launch dry run",
    "blocked steps",
    "owner approval required",
    "Package 260 - Final Soft Launch Go/No-Go Review",
  ],
});
