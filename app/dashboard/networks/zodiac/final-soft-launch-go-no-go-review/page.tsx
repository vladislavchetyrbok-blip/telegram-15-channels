import { AphroditeFinalReadinessPage } from "@/components/zodiac/AphroditeFinalReadinessPage";
import { getAphroditeFinalSoftLaunchGoNoGoReview } from "@/lib/zodiac/aphrodite-final-soft-launch-go-no-go-review";

const model = getAphroditeFinalSoftLaunchGoNoGoReview();

export const metadata = {
  title: model.title,
};

export default function AphroditeFinalSoftLaunchGoNoGoReviewPage() {
  return <AphroditeFinalReadinessPage model={model} />;
}
