import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_FINAL_PRODUCTION_SAFETY_RECHECK_GATE_TITLE =
  "Final Production Safety Recheck Gate";

export const APHRODITE_FINAL_PRODUCTION_SAFETY_RECHECK_GATE_ROUTE =
  "/dashboard/networks/zodiac/final-production-safety-recheck-gate" as const;

export function getAphroditeFinalProductionSafetyRecheckGate() {
  return getAphroditeManualEvidencePackage(299);
}
