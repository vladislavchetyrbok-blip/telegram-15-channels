import Link from "next/link";
import { BarChart3, Database, FileCheck2, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_RULE,
  getAphroditeAnalyticsPrivacySafetySuite,
} from "@/lib/zodiac/aphrodite-analytics-privacy-safety-suite";

const suite = getAphroditeAnalyticsPrivacySafetySuite();

export const metadata = {
  title: suite.title,
};

export default function AphroditeAnalyticsPrivacySafetySuitePage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / Analytics / Privacy safety suite</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{suite.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{suite.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 185 проверяет analytics-цепочку Packages 180-184: taxonomy/readiness, noop event bus,
            noop integration points, mock dashboard и Telegram CTA attribution readiness. Suite подтверждает,
            что raw names, raw birth dates, payment payloads, private Telegram messages и full report text не попадают в analytics payload.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_ANALYTICS_PRIVACY_SAFETY_SUITE_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {suite.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="checks" value={String(suite.checks.length)} />
          <Metric label="audited packages" value={String(suite.auditedPackages.length)} />
          <Metric label="events sent" value="Нет" tone="rose" />
          <Metric label="DB writes" value="Нет" tone="rose" />
        </section>

        <ReviewSection title="audited packages" icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {suite.auditedPackages.map((item) => (
              <div key={item} className="rounded-lg border border-slate-800 bg-black/30 p-4 text-sm leading-6 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="privacy checks" icon={<FileCheck2 className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 lg:grid-cols-2">
            {suite.checks.map((check) => (
              <article key={check.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium text-white">{check.label}</h2>
                    <p className="mt-1 font-mono text-xs text-slate-500">{check.packageScope}</p>
                  </div>
                  <span className="rounded-md border border-emerald-900/50 bg-emerald-950 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                    {check.result}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">{check.requirement}</p>
                <p className="mt-2 text-xs leading-5 text-cyan-100/80">{check.evidence}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 md:grid-cols-3">
          <SafetyCard icon={<Database className="h-5 w-5 text-rose-300" />} title="No data storage">
            Нет чтения базы данных и нет записи в базу данных для analytics readiness/noop/mock слоёв.
          </SafetyCard>
          <SafetyCard icon={<Smartphone className="h-5 w-5 text-rose-300" />} title="No Telegram API">
            Suite не вызывает Telegram Bot API и подтверждает, что analytics-пакеты не меняют active CTA.
          </SafetyCard>
          <SafetyCard icon={<LockKeyhole className="h-5 w-5 text-rose-300" />} title="No payment tracking">
            Payment payload analytics, invoice payloads, transaction ids и VIP unlock остаются запрещены.
          </SafetyCard>
        </section>

        <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {suite.boundaries.map((boundary) => (
              <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                <div className="text-sm font-medium text-white">{boundary.label}</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.enforcedBy.join(" / ")}</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="next recommended package" icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{suite.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Analytics/Funnel</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Noop Event Bus</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-mock-dashboard" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock Dashboard</Link>
            <Link href="/dashboard/networks/zodiac/telegram-cta-attribution-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">CTA Attribution</Link>
            <Link href="/dashboard/networks/zodiac/retention-system-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Retention Readiness</Link>
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
