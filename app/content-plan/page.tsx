import { Lightbulb } from "lucide-react";
import { ZodiacDailyPreviewPanel } from "@/components/ZodiacDailyPreviewPanel";

export default function ContentPlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Preview Mode</p>
        <h2 className="mt-2 flex items-center gap-3 text-3xl font-semibold text-white">
          <Lightbulb className="h-8 w-8 text-cyan-400" />
          Zodiac content preview
        </h2>
        <div className="mt-6 max-w-2xl rounded-lg border border-line bg-panel/82 p-6 shadow-glow">
          <p className="text-sm leading-6 text-slate-300">
            Phase 2 preview mode for the planned Zodiac Network. Generate 13 daily horoscope previews locally without Telegram, runtime writes, or AI dependency.
          </p>
        </div>
      </div>

      <ZodiacDailyPreviewPanel />
    </div>
  );
}
