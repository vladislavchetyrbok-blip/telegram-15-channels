#!/usr/bin/env node

import { runFinalReadinessPackageQa } from "./lib/qa-aphrodite-final-readiness-package.mjs";

runFinalReadinessPackageQa({
  packageNumber: 263,
  slug: "pre-soft-launch-owner-brief",
  route: "/dashboard/networks/zodiac/pre-soft-launch-owner-brief",
  title: "Pre-Soft-Launch Owner Brief",
  routeKey: "preSoftLaunchOwnerBrief",
  requiredMarkers: [
    "owner brief",
    "pre-soft-launch brief",
    "not ready for launch",
    "manual owner decision",
    "Package 264 - Manual Checklist One-Page Runbook",
  ],
});
