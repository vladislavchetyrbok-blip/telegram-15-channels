#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 302,
  title: "Manual Evidence Readiness Summary",
  slug: "aphrodite-manual-evidence-readiness-summary",
  routeSlug: "manual-evidence-readiness-summary",
  route: "/dashboard/networks/zodiac/manual-evidence-readiness-summary",
  routeKey: "manualEvidenceReadinessSummary",
  getterName: "getAphroditeManualEvidenceReadinessSummary",
  statuses: {
    manualEvidenceReadinessStatus: "WAITING_FOR_OWNER_AND_ENV_EVIDENCE",
    readyForProductionLaunch: false,
  },
  requiredPhrases: [
    "Packages 293-302 completed",
    "Blockers still open",
    "Evidence still required",
    "Next real owner actions",
    "Package 303 - Owner Evidence Review After Manual Inputs",
  ],
});
