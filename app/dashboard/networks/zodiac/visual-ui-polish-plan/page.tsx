import Link from "next/link";
import { Brush, Eye, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_VISUAL_UI_POLISH_PLAN_RULE,
  getAphroditeVisualUiPolishPlan,
} from "@/lib/zodiac/aphrodite-visual-ui-polish-plan";

const polishPlan = getAphroditeVisualUiPolishPlan();

export const metadata = {
  title: polishPlan.title,
};

export default function AphroditeVisualUiPolishPlanPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <Brush className="h-4 w-4" />
            <span>Aphrodite / Visual UI polish plan / Package 193</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{polishPlan.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{polishPlan.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            План описывает future polish для simplified visual style, premium mystical but not overloaded, readable cards,
            fewer gradients, better spacing, clearer typography, result cards style и Telegram WebApp safe area. Live дизайн
            в этом пакете не меняется.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_VISUAL_UI_POLISH_PLAN_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {polishPlan.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="polish areas" value={String(polishPlan.summary.polishAreasPlanned)} />
          <Metric label="principles" value={String(polishPlan.summary.principlesCount)} />
          <Metric label="liveDesignChangedNow" value={String(polishPlan.liveDesignChangedNow)} tone="rose" />
          <Metric label="telegramApiNow" value={String(polishPlan.telegramApiNow)} tone="rose" />
        </section>

        <ReviewSection title="visual polish areas" icon={<Layers3 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {polishPlan.polishAreas.map((area) => (
              <article key={area.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{area.label}</h2>
                <p className="mt-2 text-xs leading-5 text-amber-100/80">{area.currentIssue}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{area.polishPlan}</p>
                <p className="mt-3 font-mono text-[11px] text-emerald-300">{area.source}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <ReviewSection title="visual principles" icon={<Sparkles className="h-5 w-5 text-cyan-400" />}>
            <div className="grid gap-3 md:grid-cols-2">
              {polishPlan.principles.map((principle) => (
                <div key={principle.id} className="rounded-lg border border-slate-800 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{principle.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{principle.description}</p>
                  <p className="mt-2 font-mono text-[11px] text-amber-200">{principle.implementationState}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {polishPlan.boundaries.map((boundary) => (
                <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{boundary.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="next recommended package" icon={<Eye className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{polishPlan.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-ux-simplification-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mini App UX Review</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-checklist-refresh" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Public Launch Checklist</Link>
            <Link href="/miniapp" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mini App hub</Link>
            <Link href="/dashboard/networks/zodiac/product-copy-final-polish" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Product Copy Polish</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-medium text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : "text-emerald-300";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
