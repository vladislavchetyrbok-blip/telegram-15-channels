import { ProblemTelegramChannels } from "@/components/ProblemTelegramChannels";
import { TelegramConnectionPanel } from "@/components/TelegramConnectionPanel";

export default function TelegramConnectionPage() {
  return (
    <div className="space-y-6">
      <ProblemTelegramChannels />
      <TelegramConnectionPanel />
    </div>
  );
}
