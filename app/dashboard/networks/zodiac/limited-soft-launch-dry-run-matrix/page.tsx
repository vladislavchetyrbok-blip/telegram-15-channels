import { AphroditeFinalReadinessPage } from "@/components/zodiac/AphroditeFinalReadinessPage";
import { getAphroditeLimitedSoftLaunchDryRunMatrix } from "@/lib/zodiac/aphrodite-limited-soft-launch-dry-run-matrix";

const model = getAphroditeLimitedSoftLaunchDryRunMatrix();

export const metadata = {
  title: model.title,
};

export default function AphroditeLimitedSoftLaunchDryRunMatrixPage() {
  return <AphroditeFinalReadinessPage model={model} />;
}
