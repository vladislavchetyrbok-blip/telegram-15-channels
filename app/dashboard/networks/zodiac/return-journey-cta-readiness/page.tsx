import Link from "next/link";
import { BellOff, Link2, MousePointerClick, Route, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_RETURN_JOURNEY_CTA_READINESS_RULE,
  getAphroditeReturnJourneyCtaReadiness,
} from "@/lib/zodiac/aphrodite-return-journey-cta-readiness";

const readiness = getAphroditeReturnJourneyCtaReadiness();

export const metadata = {
  title: readiness.title,
};

export default function AphroditeReturnJourneyCtaReadinessPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <MousePointerClick className="h-4 w-4" />
            <span>Aphrodite / Return journey / CTA readiness</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{readiness.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{readiness.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 188 фиксирует будущие пути возврата пользователя из daily/weekly/monthly контента, Telegram CTA,
            Mini App home, locked teaser, guard denied и будущей истории отчётов. Это только карта readiness:
            активная генерация CTA, startapp-публикация, tracking и доставка сообщений не меняются.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_RETURN_JOURNEY_CTA_READINESS_RULE}
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
          <Metric label="return paths" value={String(readiness.returnPaths.length)} />
          <Metric label="active CTA changed" value="Нет" tone="rose" />
          <Metric label="tracking" value="Нет" tone="rose" />
          <Metric label="must remain free" value="Да" />
        </section>

        <ReviewSection title="return journey CTA paths" icon={<Route className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {readiness.returnPaths.map((path) => (
              <article key={path.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-medium text-white">{path.source}</h2>
                  <span className="rounded-md border border-cyan-900/50 bg-cyan-950 px-2 py-0.5 text-[11px] text-cyan-200">
                    {path.activeNowClassification}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{path.safeCopy}</p>
                <dl className="mt-3 space-y-1 font-mono text-[11px] text-slate-500">
                  <div><dt className="inline text-slate-400">targetRoute:</dt> <dd className="inline">{path.targetRoute}</dd></div>
                  <div><dt className="inline text-slate-400">fallbackRoute:</dt> <dd className="inline">{path.fallbackRoute}</dd></div>
                  <div><dt className="inline text-slate-400">futureStartAppParam:</dt> <dd className="inline">{path.futureStartAppParam}</dd></div>
                  <div><dt className="inline text-slate-400">attributionKey:</dt> <dd className="inline">{path.attributionKey}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 md:grid-cols-3">
          <SafetyCard icon={<BellOff className="h-5 w-5 text-rose-300" />} title="No active CTA change">
            Active Telegram CTA generation, bot sending logic and production startapp publishing stay untouched.
          </SafetyCard>
          <SafetyCard icon={<Link2 className="h-5 w-5 text-rose-300" />} title="Fallback first">
            locked teaser, guard denied и saved report future всегда ведут в бесплатный preview fallback.
          </SafetyCard>
          <SafetyCard icon={<ShieldCheck className="h-5 w-5 text-rose-300" />} title="No tracking">
            Нет внешней аналитики, записи attribution events в базу, payment tracking или VIP-разблокировки.
          </SafetyCard>
        </section>

        <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {readiness.boundaries.map((boundary) => (
              <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                <div className="text-sm font-medium text-white">{boundary.label}</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="next recommended package" icon={<MousePointerClick className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{readiness.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/saved-reports-history-mock-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Saved Reports Mock</Link>
            <Link href="/dashboard/networks/zodiac/retention-system-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Retention Readiness</Link>
            <Link href="/dashboard/networks/zodiac/telegram-cta-attribution-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">CTA Attribution</Link>
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
