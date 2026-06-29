#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 301,
  title: "Post-Blocker Closure Final Launch Runbook Draft",
  slug: "aphrodite-post-blocker-closure-final-launch-runbook-draft",
  routeSlug: "post-blocker-closure-final-launch-runbook-draft",
  route: "/dashboard/networks/zodiac/post-blocker-closure-final-launch-runbook-draft",
  routeKey: "postBlockerClosureFinalLaunchRunbookDraft",
  getterName: "getAphroditePostBlockerClosureFinalLaunchRunbookDraft",
  statuses: {
    finalLaunchRunbookStatus: "DRAFT_BLOCKED_UNTIL_MANUAL_GATES_CLOSED",
  },
  requiredPhrases: [
    "Runbook only for after blockers are closed",
    "Order of final checks",
    "Rollback plan",
    "Owner go/no-go",
    "No launch now",
  ],
});
