import { Lightbulb } from "lucide-react";
import { ZodiacDailyPreviewPanel } from "@/components/ZodiacDailyPreviewPanel";
import { ZodiacWeeklyPreviewPanel } from "@/components/ZodiacWeeklyPreviewPanel";

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
            Preview mode for the planned Zodiac Network. Generate daily and weekly horoscope previews locally without Telegram, runtime writes, or AI dependency.
          </p>
        </div>
        
        <div className="mt-4 max-w-2xl rounded-lg border border-blue-500/30 bg-blue-500/10 p-6 space-y-4">
          <p className="text-sm text-blue-200">
            <strong>Safe Local Workflow:</strong>
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-200/80 space-y-1">
            <li>Generate daily/weekly preview.</li>
            <li>Export JSON.</li>
            <li>Validate, review, and optionally enhance locally via <code>zodiac:pipeline</code>.</li>
            <li>Connect real Telegram channels later.</li>
            <li>Dry-run locally before real publish.</li>
          </ol>
          <p className="text-xs text-blue-300 border-t border-blue-500/20 pt-3 mt-3">
            Real publish is disabled. Export does not publish.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        <ZodiacDailyPreviewPanel />
        <ZodiacWeeklyPreviewPanel />
      </div>
    </div>
  );
}
