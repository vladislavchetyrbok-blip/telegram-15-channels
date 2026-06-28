#!/usr/bin/env node

import { runFinalReadinessPackageQa } from "./lib/qa-aphrodite-final-readiness-package.mjs";

runFinalReadinessPackageQa({
  packageNumber: 258,
  slug: "owner-approval-gate-final-manual-decision-plan",
  route: "/dashboard/networks/zodiac/owner-approval-gate-final-manual-decision-plan",
  title: "Owner Approval Gate Final Manual Decision Plan",
  routeKey: "ownerApprovalGateFinalManualDecisionPlan",
  requiredMarkers: [
    "owner approval missing",
    "manual decision only",
    "approval not granted",
    "soft launch cannot execute now",
    "Package 259 - Limited Soft Launch Dry Run Matrix",
  ],
  allowedExtraFiles: [
    "lib/zodiac/aphrodite-final-readiness-common.ts",
    "components/zodiac/AphroditeFinalReadinessPage.tsx",
    "scripts/lib/qa-aphrodite-final-readiness-package.mjs",
  ],
});
