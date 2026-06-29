#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 300,
  title: "Soft Launch Candidate Go No-Go Record",
  slug: "aphrodite-soft-launch-candidate-go-no-go-record",
  routeSlug: "soft-launch-candidate-go-no-go-record",
  route: "/dashboard/networks/zodiac/soft-launch-candidate-go-no-go-record",
  routeKey: "softLaunchCandidateGoNoGoRecord",
  getterName: "getAphroditeSoftLaunchCandidateGoNoGoRecord",
  statuses: {
    softLaunchDecision: "NO_GO",
    softLaunchStatus: "NOT_APPROVED",
    ownerGoNoGo: "NO_GO_UNTIL_BLOCKERS_CLOSED",
  },
  requiredPhrases: [
    "Current state is NO-GO",
    "Blocker list remains active",
    "Exact criteria for future GO",
    "No launch performed",
  ],
});
