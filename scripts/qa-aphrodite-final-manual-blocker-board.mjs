#!/usr/bin/env node

import { runFinalReadinessPackageQa } from "./lib/qa-aphrodite-final-readiness-package.mjs";

runFinalReadinessPackageQa({
  packageNumber: 265,
  slug: "final-manual-blocker-board",
  route: "/dashboard/networks/zodiac/final-manual-blocker-board",
  title: "Final Manual Blocker Board",
  routeKey: "finalManualBlockerBoard",
  requiredMarkers: [
    "manual blocker board",
    "Final Candidate Status",
    "NOT READY",
    "blocker remains open",
    "owner approval missing",
    "Package 266 - Final Pre-Owner-Review Summary",
  ],
});
