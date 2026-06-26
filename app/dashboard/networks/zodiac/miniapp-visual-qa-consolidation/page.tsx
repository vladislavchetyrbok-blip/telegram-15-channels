import Link from "next/link";
import { ClipboardCheck, FileText, Route, ShieldCheck, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_RULE,
  getAphroditeMiniAppVisualQaConsolidation,
} from "@/lib/zodiac/aphrodite-miniapp-visual-qa-consolidation";

const model = getAphroditeMiniAppVisualQaConsolidation();

export const metadata = {
  title: model.title,
};

export default function AphroditeMiniAppVisualQaConsolidationPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <ClipboardCheck className="h-4 w-4" />
            <span>Aphrodite / Mini App visual QA / Package 206</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{model.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{model.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Consolidated visual QA покрывает /miniapp, /miniapp/love-reading-preview, /birth-matrix, /compatibility,
            compatibility result, Birth Matrix result, Mystic sections, horoscope visual cards, date input и mobile CTA hierarchy.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {model.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="visual QA areas" value={String(model.areas.length)} />
          <Metric label="dependent QA scripts" value={String(model.dependentQaScripts.length)} />
          <Metric label="telegramApiUsed" value={String(model.safetyFlags.telegramApiUsed)} tone="rose" />
          <Metric label="paymentAdded" value={String(model.safetyFlags.paymentAdded)} tone="rose" />
        </section>

        <ReviewSection title="Покрытие visual QA" icon={<Smartphone className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 lg:grid-cols-2">
            {model.areas.map((area) => (
              <article key={area.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                    <Route className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-white">{area.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">{area.routeOrFlow}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ListBlock title="signals" items={area.requiredSignals} />
                  <ListBlock title="qa focus" items={area.qaFocus} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {area.sourceFiles.map((file) => (
                    <code key={file} className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-400">
                      {file}
                    </code>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="Full QA suite" icon={<FileText className="h-5 w-5 text-cyan-400" />}>
            <div className="grid gap-2">
              {model.dependentQaScripts.map((script) => (
                <code key={script} className="rounded-lg border border-slate-800 bg-black/30 px-3 py-2 text-xs text-slate-300">
                  {script}
                </code>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="Границы безопасности" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {Object.entries(model.safetyFlags).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="font-mono text-xs text-slate-500">{key}</div>
                  <p className="mt-1 text-sm font-medium text-emerald-300">{String(value)}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="Следующий рекомендуемый пакет" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{model.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Zodiac Network
            </Link>
            <Link href="/dashboard/networks/zodiac/horoscope-visual-cards" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Визуальные карточки гороскопов
            </Link>
            <Link href="/dashboard/networks/zodiac/vip-natal-numerology-visual-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Review визуала VIP / Natal / Numerology
            </Link>
            <Link href="/miniapp" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Mini App hub
            </Link>
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

function ListBlock({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase text-slate-500">{title}</div>
      <ul className="mt-1 space-y-1 text-xs leading-5 text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
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
