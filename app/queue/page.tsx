import { AutopublishPanel } from "@/components/AutopublishPanel";
import { TelegramQuickPublishPanel } from "@/components/TelegramQuickPublishPanel";

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <AutopublishPanel />
      <TelegramQuickPublishPanel />
    </div>
  );
}
