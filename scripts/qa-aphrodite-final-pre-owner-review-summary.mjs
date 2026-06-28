#!/usr/bin/env node

import { runFinalReadinessPackageQa } from "./lib/qa-aphrodite-final-readiness-package.mjs";

runFinalReadinessPackageQa({
  packageNumber: 266,
  slug: "final-pre-owner-review-summary",
  route: "/dashboard/networks/zodiac/final-pre-owner-review-summary",
  title: "Final Pre-Owner-Review Summary",
  routeKey: "finalPreOwnerReviewSummary",
  requiredMarkers: [
    "Final Pre-Owner-Review Summary",
    "READY FOR OWNER REVIEW",
    "Can proceed to owner manual review: Yes",
    "Can execute soft launch now: No",
    "owner approval still required",
    "Package 267 - Owner Real-World Checklist Execution / or STOP for owner manual actions",
  ],
});
