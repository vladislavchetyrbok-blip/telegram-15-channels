import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditeSoftLaunchCandidateGoNoGoRecord } from "@/lib/zodiac/aphrodite-soft-launch-candidate-go-no-go-record";

const model = getAphroditeSoftLaunchCandidateGoNoGoRecord();

export const metadata = {
  title: model.title,
};

export default function SoftLaunchCandidateGoNoGoRecordPage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
