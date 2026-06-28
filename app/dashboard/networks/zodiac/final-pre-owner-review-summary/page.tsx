import { AphroditeFinalReadinessPage } from "@/components/zodiac/AphroditeFinalReadinessPage";
import { getAphroditeFinalPreOwnerReviewSummary } from "@/lib/zodiac/aphrodite-final-pre-owner-review-summary";

const model = getAphroditeFinalPreOwnerReviewSummary();

export const metadata = {
  title: model.title,
};

export default function AphroditeFinalPreOwnerReviewSummaryPage() {
  return <AphroditeFinalReadinessPage model={model} />;
}
