import Link from "next/link";
import { FileText, ListChecks, PenLine, ShieldCheck, Type } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_PRODUCT_COPY_FINAL_POLISH_RULE,
  getAphroditeProductCopyFinalPolish,
} from "@/lib/zodiac/aphrodite-product-copy-final-polish";

const copyPolish = getAphroditeProductCopyFinalPolish();

export const metadata = {
  title: copyPolish.title,
};

export default function AphroditeProductCopyFinalPolishPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <PenLine className="h-4 w-4" />
            <span>Aphrodite / Product copy polish / Package 194</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{copyPolish.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{copyPolish.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Copy polish задаёт standards для first screen promise, AI Love Reading, compatibility, birth matrix, 30 days
            couple, daily/weekly/monthly horoscopes, Full Love Report teaser, support/refund wording и privacy disclaimers.
            Live product copy в Mini App не меняется.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_PRODUCT_COPY_FINAL_POLISH_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {copyPolish.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="copy standards" value={String(copyPolish.summary.standardsCount)} />
          <Metric label="guardrails" value={String(copyPolish.summary.guardrailsCount)} />
          <Metric label="liveCopyChangedNow" value={String(copyPolish.liveCopyChangedNow)} tone="rose" />
          <Metric label="paymentEnabledNow" value={String(copyPolish.paymentEnabledNow)} tone="rose" />
        </section>

        <ReviewSection title="copy standards" icon={<Type className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {copyPolish.standards.map((standard) => (
              <article key={standard.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{standard.label}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-300">{standard.standard}</p>
                <p className="mt-2 text-xs leading-5 text-amber-100/80">{standard.riskToAvoid}</p>
                <p className="mt-3 font-mono text-[11px] text-emerald-300">{standard.source}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <ReviewSection title="copy guardrails" icon={<ListChecks className="h-5 w-5 text-cyan-400" />}>
            <div className="grid gap-3 md:grid-cols-2">
              {copyPolish.guardrails.map((guardrail) => (
                <div key={guardrail.id} className="rounded-lg border border-slate-800 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{guardrail.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{guardrail.description}</p>
                  <p className="mt-2 font-mono text-[11px] text-emerald-300">required</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {copyPolish.boundaries.map((boundary) => (
                <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{boundary.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="next recommended package" icon={<FileText className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{copyPolish.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/visual-ui-polish-plan" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Visual UI Polish Plan</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-ux-simplification-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mini App UX Review</Link>
            <Link href="/dashboard/networks/zodiac/support-refund-policy-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Support & Refund</Link>
            <Link href="/dashboard/networks/zodiac/manual-launch-smoke-test-matrix" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Manual Smoke Matrix</Link>
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
