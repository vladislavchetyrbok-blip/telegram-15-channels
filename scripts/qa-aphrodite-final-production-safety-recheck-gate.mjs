#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 299,
  title: "Final Production Safety Recheck Gate",
  slug: "aphrodite-final-production-safety-recheck-gate",
  routeSlug: "final-production-safety-recheck-gate",
  route: "/dashboard/networks/zodiac/final-production-safety-recheck-gate",
  routeKey: "finalProductionSafetyRecheckGate",
  getterName: "getAphroditeFinalProductionSafetyRecheckGate",
  statuses: {
    finalProductionSafetyStatus: "BLOCKED_EXPECTED_MANUAL_BLOCKERS",
    readyForLaunch: false,
  },
  requiredPhrases: [
    "production:safety:check expected to fail until env + backup are fixed",
    "publicLaunchApproved=false",
    "ownerManualReviewRequired=true",
    "Do not launch while safety check is red",
  ],
});
