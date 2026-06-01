import { AutopublishPanel } from "@/components/AutopublishPanel";
import { LaunchReadinessChecklist } from "@/components/LaunchReadinessChecklist";
import { ProblemTelegramChannels } from "@/components/ProblemTelegramChannels";
import { TelegramQuickPublishPanel } from "@/components/TelegramQuickPublishPanel";
import { VisualEngineSettingsPanel } from "@/components/VisualEngineSettingsPanel";

export const dynamic = "force-dynamic";

export default function PublishingCenterPage() {
  return (
    <div className="space-y-6">
      <LaunchReadinessChecklist />
      <ProblemTelegramChannels />
      <VisualEngineSettingsPanel compact />
      <AutopublishPanel />
      <TelegramQuickPublishPanel />
    </div>
  );
}
