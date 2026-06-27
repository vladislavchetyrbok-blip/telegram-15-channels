import Link from "next/link";
import { Ban, LockKeyhole, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_ROUTE,
  getAphroditeDashboardAuthSystemDecision,
  type AphroditeDashboardAuthDecisionStatus,
} from "@/lib/zodiac/aphrodite-dashboard-auth-system-decision";

const model = getAphroditeDashboardAuthSystemDecision();

export const metadata = {
  title: model.title,
};

export default function AphroditeDashboardAuthSystemDecisionPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-cyan-300">
            <LockKeyhole className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Dashboard auth / Package {model.packageNumber}</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">{model.decisionSummary}</p>
          <div className="grid max-w-5xl gap-2 sm:grid-cols-2">
            {model.guardrails.slice(0, 4).map((message) => (
              <div key={message} className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 text-sm leading-6 text-emerald-100">
                {message}
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="publicLaunchApproved" value={String(model.publicLaunchApproved)} tone="rose" />
          <Metric label="ownerManualReviewRequired" value={String(model.ownerManualReviewRequired)} tone="amber" />
          <Metric label="dashboardRemainsProtected" value={String(model.safetyFlags.dashboardRemainsProtected)} />
          <Metric label="public bypass added" value={String(model.safetyFlags.dashboardPublicBypassAdded)} tone="rose" />
          <Metric label="secrets added" value={String(model.safetyFlags.secretsAdded)} tone="rose" />
        </section>

        <ReviewSection title="canonical auth decision" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2">
            <DecisionLine label="canonical dashboard auth" value={model.canonical.dashboardAuth} />
            <DecisionLine label="canonical session/cookie" value={model.canonical.sessionCookie} />
            <DecisionLine label="canonical login path" value={model.canonical.loginPath} />
            <DecisionLine label="canonical login API" value={model.canonical.loginApi} />
            <DecisionLine label="middleware protection" value={model.canonical.middlewareProtection} />
            <DecisionLine label="protected route pattern" value={model.canonical.protectedRoutePattern} />
          </div>
        </ReviewSection>

        <ReviewSection title="auth decision matrix" icon={<LockKeyhole className="h-5 w-5 text-cyan-400" />}>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <div className="hidden grid-cols-[0.9fr_1.1fr_0.7fr_1.4fr] border-b border-slate-800 bg-slate-950 px-4 py-3 text-[11px] font-semibold uppercase tracking-normal text-slate-500 xl:grid">
              <div>Area</div>
              <div>Decision</div>
              <div>Status</div>
              <div>Note</div>
            </div>
            <div className="divide-y divide-slate-800">
              {model.authDecisionItems.map((item) => (
                <article key={item.label} className="grid gap-3 bg-black/30 p-4 xl:grid-cols-[0.9fr_1.1fr_0.7fr_1.4fr]">
                  <MatrixCell label="Area">{item.label}</MatrixCell>
                  <MatrixCell label="Decision">
                    <span className="break-words font-mono text-xs text-slate-200">{item.value}</span>
                  </MatrixCell>
                  <MatrixCell label="Status">
                    <span className={statusClassName(item.status)}>{item.status}</span>
                  </MatrixCell>
                  <MatrixCell label="Note">{item.note}</MatrixCell>
                </article>
              ))}
            </div>
          </div>
        </ReviewSection>

        <ReviewSection title="legacy/orphan handling" icon={<Ban className="h-5 w-5 text-rose-300" />}>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <DecisionLine label="legacy/orphan auth" value={model.legacy.dashboardAuth} />
            <DecisionLine label="legacy env secret name" value={model.legacy.envSecretName} />
            <DecisionLine label="legacy login path" value={model.legacy.loginPath} />
            <DecisionLine label="legacy API routes" value={model.legacy.apiRoutes} />
            <DecisionLine label="legacy status" value={model.legacy.status} />
            <DecisionLine label="legacy handling" value={model.legacy.handling} />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {model.legacySurfaces.map((surface) => (
              <article key={surface.surface} className="rounded-lg border border-slate-800 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={statusClassName(surface.status)}>{surface.status}</span>
                  <span className="break-all font-mono text-xs text-slate-400">{surface.surface}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{surface.handling}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{surface.ownerNote}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="safety confirmation" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(model.safetyFlags).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="break-words font-mono text-xs text-slate-500">{key}</div>
                  <p className="mt-1 text-sm font-medium text-emerald-300">{String(value)}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="remaining blockers" icon={<ShieldAlert className="h-5 w-5 text-amber-300" />}>
            <ul className="grid gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
              {model.remainingBlockers.map((blocker) => (
                <li key={blocker} className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-amber-100">
                  {blocker}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              The dashboard auth decision does not approve launch and does not replace owner manual review.
            </p>
          </ReviewSection>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Related readiness sections</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-go-no-go-review" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Public Launch Go/No-Go</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-dry-run-matrix" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Dry-Run Matrix</Link>
            <Link href="/dashboard/networks/zodiac/real-device-qa-execution-pack" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Real Device QA Execution</Link>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] leading-5 text-slate-500">{APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_ROUTE}</p>
        </div>
      </div>
    </div>
  );
}

function statusClassName(status: AphroditeDashboardAuthDecisionStatus) {
  if (status === "CANONICAL") return "inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200";
  if (status === "PROTECTED") return "inline-flex max-w-full break-words rounded border border-cyan-900/50 bg-cyan-950/30 px-2 py-1 text-xs leading-5 text-cyan-200";
  if (status === "LEGACY DISABLED") return "inline-flex max-w-full break-words rounded border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-xs leading-5 text-rose-200";
  if (status === "NO BYPASS") return "inline-flex max-w-full break-words rounded border border-violet-900/50 bg-violet-950/30 px-2 py-1 text-xs leading-5 text-violet-200";
  return "inline-flex max-w-full break-words rounded border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-xs leading-5 text-amber-200";
}

function ReviewSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {icon}
        <h2 className="text-lg font-medium text-white sm:text-xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MatrixCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 text-sm leading-6 text-slate-300">
      <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500 xl:hidden">{label}</div>
      <div className="break-words">{children}</div>
    </div>
  );
}

function DecisionLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-black/20 p-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
      <p className="mt-2 break-words font-mono text-sm text-slate-100">{value}</p>
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" | "amber" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : tone === "amber" ? "text-amber-200" : "text-emerald-300";

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 break-words text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
