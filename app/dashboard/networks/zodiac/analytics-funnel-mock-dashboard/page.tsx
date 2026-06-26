import Link from "next/link";
import { BarChart3, Database, FileCheck2, LockKeyhole, MousePointerClick, ShieldCheck, Smartphone, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_RULE,
  getAphroditeAnalyticsFunnelMockDashboard,
} from "@/lib/zodiac/aphrodite-analytics-funnel-mock-dashboard";

const dashboard = getAphroditeAnalyticsFunnelMockDashboard();

export const metadata = {
  title: dashboard.title,
};

export default function AphroditeAnalyticsFunnelMockDashboardPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-cyan-300">
            <BarChart3 className="h-4 w-4" />
            <span>Aphrodite / Analytics / Mock funnel</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{dashboard.title}</h1>
          <p className="text-sm font-medium text-cyan-300/90">{dashboard.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 183 показывает будущую аналитическую воронку Aphrodite на статичных mock-числах. Это обзор будущих KPI:
            Telegram CTA, Mini App open, AI Love Reading, preview, paywall teaser, future payment intent, guard denied,
            fallback recovery, return visits и daily/weekly/monthly content CTA. Реальные данные не читаются.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_ANALYTICS_FUNNEL_MOCK_DASHBOARD_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {dashboard.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="mock funnel steps" value={String(dashboard.funnelSteps.length)} />
          <Metric label="mock KPIs" value={String(dashboard.kpis.length)} />
          <Metric label="real data reads" value="Нет" tone="rose" />
          <Metric label="events sent" value="Нет" tone="rose" />
        </section>

        <ReviewSection title="mock funnel overview" icon={<TrendingUp className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {dashboard.funnelSteps.map((step) => (
              <article key={step.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-medium text-white">{step.label}</h2>
                  <span className="rounded-md border border-cyan-900/50 bg-cyan-950 px-2 py-0.5 text-[11px] text-cyan-200">
                    {step.source}
                  </span>
                </div>
                <div className="mt-4 font-mono text-2xl font-semibold text-emerald-300">{step.mockRateLabel}</div>
                <p className="mt-1 font-mono text-xs text-slate-500">mock count: {step.mockCount}</p>
                <p className="mt-3 text-xs leading-5 text-slate-400">{step.description}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <ReviewSection title="future KPIs mock" icon={<FileCheck2 className="h-5 w-5 text-cyan-400" />}>
            <div className="space-y-3">
              {dashboard.kpis.map((kpi) => (
                <article key={kpi.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-medium text-white">{kpi.label}</h2>
                      <p className="mt-1 font-mono text-xs text-slate-500">{kpi.id}</p>
                    </div>
                    <span className="font-mono text-lg font-semibold text-emerald-300">{kpi.mockValue}</span>
                  </div>
                  <p className="mt-3 font-mono text-xs leading-5 text-cyan-100/80">{kpi.formula}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{kpi.interpretation}</p>
                </article>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="daily/weekly/monthly content CTA" icon={<MousePointerClick className="h-5 w-5 text-cyan-400" />}>
            <div className="space-y-3">
              {dashboard.contentRows.map((row) => (
                <article key={row.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h2 className="text-sm font-medium text-white">{row.label}</h2>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <MiniMetric label="mock CTA" value={String(row.mockCtaViews)} />
                    <MiniMetric label="Mini App" value={String(row.mockMiniAppOpens)} />
                    <MiniMetric label="conversion" value={row.mockConversion} />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Source: {row.source}. Это mock data only.</p>
                </article>
              ))}
            </div>
          </ReviewSection>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SafetyCard icon={<Database className="h-5 w-5 text-rose-300" />} title="No DB read/write">
            Страница не подключает базу, не читает runtime storage, не использует `DATABASE_URL` и не пишет analytics events.
          </SafetyCard>
          <SafetyCard icon={<Smartphone className="h-5 w-5 text-rose-300" />} title="No Telegram API">
            Telegram Bot API, sendMessage, sendInvoice и startapp generation здесь не вызываются и не меняются.
          </SafetyCard>
          <SafetyCard icon={<LockKeyhole className="h-5 w-5 text-rose-300" />} title="No payment tracking">
            future payment intent отображается только как mock KPI. Реальная оплата, invoice и VIP unlock не добавлены.
          </SafetyCard>
        </section>

        <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {dashboard.boundaries.map((boundary) => (
              <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                <div className="text-sm font-medium text-white">{boundary.label}</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="next recommended package" icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{dashboard.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Analytics/Funnel</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Noop Event Bus</Link>
            <Link href="/dashboard/networks/zodiac/telegram-cta-attribution-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">CTA Attribution</Link>
            <Link href="/dashboard/networks/zodiac/analytics-privacy-safety-suite" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Privacy Safety Suite</Link>
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
      <div className="mt-1 font-mono text-sm text-emerald-300">{value}</div>
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
