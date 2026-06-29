import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditeRedactedEnvPresenceVerificationGate } from "@/lib/zodiac/aphrodite-redacted-env-presence-verification-gate";

const model = getAphroditeRedactedEnvPresenceVerificationGate();

export const metadata = {
  title: model.title,
};

export default function RedactedEnvPresenceVerificationGatePage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
