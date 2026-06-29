import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_SOFT_LAUNCH_CANDIDATE_GO_NO_GO_RECORD_TITLE =
  "Soft Launch Candidate Go No-Go Record";

export const APHRODITE_SOFT_LAUNCH_CANDIDATE_GO_NO_GO_RECORD_ROUTE =
  "/dashboard/networks/zodiac/soft-launch-candidate-go-no-go-record" as const;

export function getAphroditeSoftLaunchCandidateGoNoGoRecord() {
  return getAphroditeManualEvidencePackage(300);
}
