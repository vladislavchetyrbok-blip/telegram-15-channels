import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditeManualEvidenceReadinessSummary } from "@/lib/zodiac/aphrodite-manual-evidence-readiness-summary";

const model = getAphroditeManualEvidenceReadinessSummary();

export const metadata = {
  title: model.title,
};

export default function ManualEvidenceReadinessSummaryPage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
