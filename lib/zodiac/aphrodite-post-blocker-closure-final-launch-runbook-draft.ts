import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_POST_BLOCKER_CLOSURE_FINAL_LAUNCH_RUNBOOK_DRAFT_TITLE =
  "Post-Blocker Closure Final Launch Runbook Draft";

export const APHRODITE_POST_BLOCKER_CLOSURE_FINAL_LAUNCH_RUNBOOK_DRAFT_ROUTE =
  "/dashboard/networks/zodiac/post-blocker-closure-final-launch-runbook-draft" as const;

export function getAphroditePostBlockerClosureFinalLaunchRunbookDraft() {
  return getAphroditeManualEvidencePackage(301);
}
