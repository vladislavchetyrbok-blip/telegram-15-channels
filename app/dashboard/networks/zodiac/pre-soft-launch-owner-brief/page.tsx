import { AphroditeFinalReadinessPage } from "@/components/zodiac/AphroditeFinalReadinessPage";
import { getAphroditePreSoftLaunchOwnerBrief } from "@/lib/zodiac/aphrodite-pre-soft-launch-owner-brief";

const model = getAphroditePreSoftLaunchOwnerBrief();

export const metadata = {
  title: model.title,
};

export default function AphroditePreSoftLaunchOwnerBriefPage() {
  return <AphroditeFinalReadinessPage model={model} />;
}
