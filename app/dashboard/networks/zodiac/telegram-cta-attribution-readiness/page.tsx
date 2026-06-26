import Link from "next/link";
import { BarChart3, FileCheck2, Link2, MousePointerClick, Route, ShieldCheck, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_RULE,
  getAphroditeTelegramCtaAttributionReadiness,
} from "@/lib/zodiac/aphrodite-telegram-cta-attribution-readiness";

const readiness = getAphroditeTelegramCtaAttributionReadiness();

export const metadata = {
  title: readiness.title,
};

export default function AphroditeTelegramCtaAttributionReadinessPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-cyan-300">
            <MousePointerClick className="h-4 w-4" />
            <span>Aphrodite / Telegram CTA / Attribution readiness</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{readiness.title}</h1>
          <p className="text-sm font-medium text-cyan-300/90">{readiness.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 184 фиксирует будущую attribution-схему для Telegram CTA: source channel, sign, language,
            content type daily/weekly/monthly, CTA type, product target, startapp param draft, campaign key,
            period key и fallback route. Это только readiness-слой; активная генерация CTA не меняется.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {readiness.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="dimensions" value={String(readiness.dimensions.length)} />
          <Metric label="source examples" value={String(readiness.sourceExamples.length)} />
          <Metric label="active CTA changed" value="Нет" tone="rose" />
          <Metric label="tracking enabled" value="Нет" tone="rose" />
        </section>

        <ReviewSection title="attribution dimensions" icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {readiness.dimensions.map((dimension) => (
              <article key={dimension.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-medium text-white">{dimension.label}</h2>
                  <span className="rounded-md border border-cyan-900/50 bg-cyan-950 px-2 py-0.5 text-[11px] text-cyan-200">
                    {dimension.source}
                  </span>
                </div>
                <p className="mt-3 break-words font-mono text-xs leading-5 text-emerald-300">{dimension.valueExample}</p>
                <p className="mt-3 text-xs leading-5 text-slate-400">{dimension.purpose}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="source key examples" icon={<Link2 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 lg:grid-cols-2">
            {readiness.sourceExamples.map((example) => (
              <article key={example.sourceKey} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-mono text-sm font-semibold text-white">{example.sourceKey}</h2>
                    <p className="mt-1 text-xs text-slate-500">{example.channel} / {example.contentType}</p>
                  </div>
                  <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    {example.source}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-xs md:grid-cols-3">
                  <MiniMetric label="target" value={example.productTarget} />
                  <MiniMetric label="fallback" value={example.fallbackRoute} />
                  <MiniMetric label="startapp draft" value={example.startappParamDraft} />
                </div>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 md:grid-cols-3">
          <SafetyCard icon={<Smartphone className="h-5 w-5 text-rose-300" />} title="Active CTA untouched">
            Страница не меняет `scripts/zodiac-telegram-publisher.mjs`, publish scripts, Mini App routes или Telegram Bot API.
          </SafetyCard>
          <SafetyCard icon={<Route className="h-5 w-5 text-rose-300" />} title="Draft only">
            startapp param draft показан как будущая схема attribution, но не применяется к живым ссылкам.
          </SafetyCard>
          <SafetyCard icon={<ShieldCheck className="h-5 w-5 text-rose-300" />} title="No tracking">
            Нет внешней аналитики, отправки событий, записи в базу данных, production tracking и payment tracking.
          </SafetyCard>
        </section>

        <ReviewSection title="safety boundaries" icon={<FileCheck2 className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {readiness.boundaries.map((boundary) => (
              <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                <div className="text-sm font-medium text-white">{boundary.label}</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="next recommended package" icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{readiness.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Analytics/Funnel</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Noop Event Bus</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-mock-dashboard" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock Dashboard</Link>
            <Link href="/dashboard/networks/zodiac/analytics" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Аналитика Mini App</Link>
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
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={tone === "rose" ? "mt-2 text-lg font-semibold text-rose-300" : "mt-2 text-lg font-semibold text-emerald-300"}>{value}</div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 p-2">
      <div className="font-mono text-[10px] text-slate-500">{label}</div>
      <div className="mt-1 break-words font-mono text-xs text-emerald-300">{value}</div>
    </div>
  );
}

function SafetyCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-medium text-white">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{children}</p>
    </article>
  );
}
