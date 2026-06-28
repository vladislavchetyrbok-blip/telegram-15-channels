#!/usr/bin/env node

import { runFinalReadinessPackageQa } from "./lib/qa-aphrodite-final-readiness-package.mjs";

runFinalReadinessPackageQa({
  packageNumber: 260,
  slug: "final-soft-launch-go-no-go-review",
  route: "/dashboard/networks/zodiac/final-soft-launch-go-no-go-review",
  title: "Final Soft Launch Go/No-Go Review",
  routeKey: "finalSoftLaunchGoNoGoReview",
  requiredMarkers: [
    "go/no-go review",
    "NO-GO",
    "Final Candidate Status",
    "Can execute soft launch now: No",
    "approval not granted",
    "Package 261 - Soft Launch Monitoring Readiness Plan",
  ],
});
