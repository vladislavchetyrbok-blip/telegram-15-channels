import Link from "next/link";
import { Layers3, ListChecks, MousePointerClick, ShieldCheck, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_RULE,
  getAphroditeMiniappUxSimplificationReview,
} from "@/lib/zodiac/aphrodite-miniapp-ux-simplification-review";

const uxReview = getAphroditeMiniappUxSimplificationReview();

export const metadata = {
  title: uxReview.title,
};

export default function AphroditeMiniappUxSimplificationReviewPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <Smartphone className="h-4 w-4" />
            <span>Aphrodite / Mini App UX review / Package 192</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{uxReview.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{uxReview.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Review фиксирует будущий план упрощения Mini App home screen, Love Reading entry, Compatibility entry,
            Birth Matrix entry, daily/weekly/monthly content entry, CTA hierarchy и Telegram WebApp feel. Live UI и live
            flow в этом пакете не меняются.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {uxReview.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="UX areas" value={String(uxReview.summary.uxAreasReviewed)} />
          <Metric label="recommendations" value={String(uxReview.summary.recommendationsCount)} />
          <Metric label="liveUiChangedNow" value={String(uxReview.liveUiChangedNow)} tone="rose" />
          <Metric label="productionLaunchNow" value={String(uxReview.productionLaunchNow)} tone="rose" />
        </section>

        <ReviewSection title="reviewed UX areas" icon={<Layers3 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {uxReview.uxAreas.map((area) => (
              <article key={area.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{area.label}</h2>
                <p className="mt-2 text-xs leading-5 text-amber-100/80">{area.currentRisk}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{area.simplificationReview}</p>
                <p className="mt-3 font-mono text-[11px] text-emerald-300">{area.source}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <ReviewSection title="future simplification recommendations" icon={<MousePointerClick className="h-5 w-5 text-cyan-400" />}>
            <div className="grid gap-3 md:grid-cols-2">
              {uxReview.recommendations.map((recommendation) => (
                <div key={recommendation.id} className="rounded-lg border border-slate-800 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{recommendation.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{recommendation.reason}</p>
                  <p className="mt-2 font-mono text-[11px] text-amber-200">{recommendation.implementationState}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {uxReview.boundaries.map((boundary) => (
                <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{boundary.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="next recommended package" icon={<ListChecks className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{uxReview.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-checklist-refresh" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Public Launch Checklist</Link>
            <Link href="/miniapp" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mini App hub</Link>
            <Link href="/dashboard/networks/zodiac/compatibility-flow-safety" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Compatibility Flow Safety</Link>
            <Link href="/dashboard/networks/zodiac/visual-ui-polish-plan" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Visual UI Polish Plan</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-visual-readiness-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Visual Launch Review</Link>
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
