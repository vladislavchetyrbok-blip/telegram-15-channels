#!/usr/bin/env node

import { runFinalReadinessPackageQa } from "./lib/qa-aphrodite-final-readiness-package.mjs";

runFinalReadinessPackageQa({
  packageNumber: 264,
  slug: "manual-checklist-one-page-runbook",
  route: "/dashboard/networks/zodiac/manual-checklist-one-page-runbook",
  title: "Manual Checklist One-Page Runbook",
  routeKey: "manualChecklistOnePageRunbook",
  requiredMarkers: [
    "one-page runbook",
    "manual checklist",
    "stop if any blocker is open",
    "owner sign-off required",
    "Package 265 - Final Manual Blocker Board",
  ],
});
