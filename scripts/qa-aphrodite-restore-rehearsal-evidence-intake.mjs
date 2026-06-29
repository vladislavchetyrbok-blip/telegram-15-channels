#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 296,
  title: "Restore Rehearsal Evidence Intake",
  slug: "aphrodite-restore-rehearsal-evidence-intake",
  routeSlug: "restore-rehearsal-evidence-intake",
  route: "/dashboard/networks/zodiac/restore-rehearsal-evidence-intake",
  routeKey: "restoreRehearsalEvidenceIntake",
  getterName: "getAphroditeRestoreRehearsalEvidenceIntake",
  statuses: {
    restoreRehearsalStatus: "REQUIRED_NOT_COMPLETED",
    restoreEvidenceStatus: "PENDING_MANUAL_REHEARSAL",
  },
  requiredPhrases: [
    "Restore rehearsal must be manual/safe",
    "No production DB writes",
    "No production DB mutation",
    "Evidence required before launch",
  ],
});
