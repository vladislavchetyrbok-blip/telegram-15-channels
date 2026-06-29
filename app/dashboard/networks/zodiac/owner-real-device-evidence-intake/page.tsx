import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditeOwnerRealDeviceEvidenceIntake } from "@/lib/zodiac/aphrodite-owner-real-device-evidence-intake";

const model = getAphroditeOwnerRealDeviceEvidenceIntake();

export const metadata = {
  title: model.title,
};

export default function OwnerRealDeviceEvidenceIntakePage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
