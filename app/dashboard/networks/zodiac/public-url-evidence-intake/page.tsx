import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditePublicUrlEvidenceIntake } from "@/lib/zodiac/aphrodite-public-url-evidence-intake";

const model = getAphroditePublicUrlEvidenceIntake();

export const metadata = {
  title: model.title,
};

export default function PublicUrlEvidenceIntakePage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
