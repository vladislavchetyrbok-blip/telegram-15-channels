import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_REDACTED_ENV_PRESENCE_VERIFICATION_GATE_TITLE =
  "Redacted Env Presence Verification Gate";

export const APHRODITE_REDACTED_ENV_PRESENCE_VERIFICATION_GATE_ROUTE =
  "/dashboard/networks/zodiac/redacted-env-presence-verification-gate" as const;

export function getAphroditeRedactedEnvPresenceVerificationGate() {
  return getAphroditeManualEvidencePackage(294);
}
