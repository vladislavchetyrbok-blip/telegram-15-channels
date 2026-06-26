import Link from "next/link";
import { BarChart3, GitBranch, ListChecks, Repeat2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_RULE,
  getAphroditeRetentionMockDashboardSafetySuite,
} from "@/lib/zodiac/aphrodite-retention-mock-dashboard-safety-suite";

const suite = getAphroditeRetentionMockDashboardSafetySuite();

export const metadata = {
  title: suite.title,
};

export default function AphroditeRetentionMockDashboardSafetySuitePage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / Retention / Mock safety suite</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{suite.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{suite.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 190 сводит retention readiness, saved reports mock, return CTA readiness, streak/reminder noop,
            analytics privacy safety и daily/weekly/monthly cadence в один mock dashboard. Все данные статические:
            reminders, tracking, Telegram API, DB read/write, payment и VIP unlock не включаются.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_RETENTION_MOCK_DASHBOARD_SAFETY_SUITE_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {suite.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          <Metric label="retention surfaces" value={String(suite.dependencySnapshot.retentionSurfaces)} />
          <Metric label="saved report mocks" value={String(suite.dependencySnapshot.savedReportMocks)} />
          <Metric label="CTA paths" value={String(suite.dependencySnapshot.returnCtaPaths)} />
          <Metric label="future reminder types" value={String(suite.dependencySnapshot.futureReminderTypes)} />
          <Metric label="real reminders" value="Нет" tone="rose" />
        </section>

        <ReviewSection title="mock retention funnel" icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {suite.mockRetentionFunnel.map((step) => (
              <article key={step.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{step.label}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">{step.description}</p>
                <p className="mt-3 font-mono text-[11px] text-emerald-300">{step.source}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="daily / weekly / monthly return loops" icon={<Repeat2 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {suite.returnLoops.map((loop) => (
              <article key={loop.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-medium text-white">{loop.label}</h2>
                  <span className="rounded-md border border-cyan-900/50 bg-cyan-950 px-2 py-0.5 text-[11px] text-cyan-200">
                    {loop.cadence}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-slate-500">{loop.connectedPackage}</p>
                <p className="mt-3 text-xs leading-5 text-emerald-200/80">{loop.safetyState}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="dependency safety snapshot" icon={<GitBranch className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {suite.dependencies.map((dependency) => (
              <Link key={dependency.packageId} href={dependency.route} className="rounded-lg border border-slate-800 bg-black/30 p-4 hover:border-emerald-600">
                <div className="text-xs font-mono text-emerald-300">{dependency.packageId}</div>
                <h2 className="mt-2 text-sm font-medium text-white">{dependency.title}</h2>
                <p className="mt-3 text-xs text-slate-500">{dependency.status}</p>
              </Link>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 md:grid-cols-2">
          <ReviewSection title="retention blockers" icon={<ListChecks className="h-5 w-5 text-amber-300" />}>
            <div className="space-y-3">
              {suite.retentionBlockers.map((blocker) => (
                <div key={blocker.id} className="rounded-lg border border-amber-900/40 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{blocker.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{blocker.reason}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="privacy / safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {suite.privacySafetyBoundaries.map((boundary) => (
                <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{boundary.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="next recommended package" icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{suite.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/streak-reminder-noop-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Streak Reminder Noop</Link>
            <Link href="/dashboard/networks/zodiac/return-journey-cta-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Return CTA Readiness</Link>
            <Link href="/dashboard/networks/zodiac/saved-reports-history-mock-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Saved Reports Mock</Link>
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
