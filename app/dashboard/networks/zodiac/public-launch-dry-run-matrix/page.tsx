import Link from "next/link";
import { ClipboardCheck, Route, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_ROUTE,
  getAphroditePublicLaunchDryRunMatrix,
  type AphroditePublicLaunchDryRunStatus,
} from "@/lib/zodiac/aphrodite-public-launch-dry-run-matrix";

const model = getAphroditePublicLaunchDryRunMatrix();

export const metadata = {
  title: model.title,
};

export default function AphroditePublicLaunchDryRunMatrixPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-emerald-300">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Public launch dry-run / Package {model.packageNumber}</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Safe public launch simulation matrix. It shows what would happen in a real launch, what is blocked now,
            what requires owner action, and why the launch remains frozen.
          </p>
          <div className="grid max-w-5xl gap-2 sm:grid-cols-2">
            {model.dryRunOnlyMessages.map((message) => (
              <div key={message} className="rounded-lg border border-rose-900/50 bg-rose-950/20 px-4 py-3 text-sm leading-6 text-rose-100">
                {message}
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="publicLaunchApproved" value={String(model.publicLaunchApproved)} tone="rose" />
          <Metric label="ownerManualReviewRequired" value={String(model.ownerManualReviewRequired)} tone="amber" />
          <Metric label="productionLaunchDone" value={String(model.safetyFlags.productionLaunchDone)} tone="rose" />
          <Metric label="telegramApiUsed" value={String(model.safetyFlags.telegramApiUsed)} tone="rose" />
          <Metric label="messagesSent" value={String(model.safetyFlags.messagesSent)} tone="rose" />
        </section>

        <ReviewSection title="launch dry-run matrix" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <div className="hidden grid-cols-[1.1fr_0.65fr_1.35fr_1.25fr_1.25fr_1.15fr] gap-0 border-b border-slate-800 bg-slate-950 px-4 py-3 text-[11px] font-semibold uppercase tracking-normal text-slate-500 xl:grid">
              <div>Step name</div>
              <div>Status</div>
              <div>What would happen in real launch</div>
              <div>Why it is blocked now</div>
              <div>Required owner action</div>
              <div>Safety note</div>
            </div>
            <div className="divide-y divide-slate-800">
              {model.steps.map((step) => (
                <article key={step.id} className="grid gap-3 bg-black/30 p-4 xl:grid-cols-[1.1fr_0.65fr_1.35fr_1.25fr_1.25fr_1.15fr]">
                  <MatrixCell label="Step name">
                    <div className="text-sm font-medium text-white">{step.stepName}</div>
                    <div className="mt-1 break-words font-mono text-[11px] leading-5 text-slate-500">{step.id}</div>
                  </MatrixCell>
                  <MatrixCell label="Status">
                    <span className={statusClassName(step.status)}>{step.status}</span>
                  </MatrixCell>
                  <MatrixCell label="What would happen in real launch">{step.whatWouldHappen}</MatrixCell>
                  <MatrixCell label="Why it is blocked now">{step.whyBlockedNow}</MatrixCell>
                  <MatrixCell label="Required owner action">{step.requiredOwnerAction}</MatrixCell>
                  <MatrixCell label="Safety note">{step.safetyNote}</MatrixCell>
                </article>
              ))}
            </div>
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="status legend" icon={<Route className="h-5 w-5 text-cyan-400" />}>
            <div className="flex flex-wrap gap-2">
              {model.statuses.map((status) => (
                <span key={status} className={statusClassName(status)}>{status}</span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              PASS means the dry-run confirms a safety control. BLOCKED means launch cannot proceed. MANUAL and OWNER REQUIRED require owner action.
              NOT RUN means this dry-run did not execute the step.
            </p>
          </ReviewSection>

          <ReviewSection title="remaining blockers" icon={<ShieldAlert className="h-5 w-5 text-rose-300" />}>
            <ul className="grid gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
              {model.remainingBlockers.map((blocker) => (
                <li key={blocker} className="rounded-md border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-rose-100">
                  {blocker}
                </li>
              ))}
            </ul>
          </ReviewSection>
        </section>

        <ReviewSection title="safety confirmation" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {Object.entries(model.safetyFlags).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                <div className="break-words font-mono text-xs text-slate-500">{key}</div>
                <p className="mt-1 text-sm font-medium text-emerald-300">{String(value)}</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Related readiness sections</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-go-no-go-review" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Public Launch Go/No-Go</Link>
            <Link href="/dashboard/networks/zodiac/real-device-visual-qa-checklist" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Real Device Visual QA</Link>
            <Link href="/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">StartApp Diagnostics</Link>
            <Link href="/dashboard/networks/zodiac/live-version-cache-marker-readiness" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Live Version Cache Marker</Link>
            <Link href="/dashboard/networks/zodiac/visual-issue-triage-board" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Visual Issue Triage Board</Link>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] leading-5 text-slate-500">{APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_ROUTE}</p>
        </div>
      </div>
    </div>
  );
}

function statusClassName(status: AphroditePublicLaunchDryRunStatus) {
  if (status === "PASS") return "inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200";
  if (status === "BLOCKED") return "inline-flex max-w-full break-words rounded border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-xs leading-5 text-rose-200";
  if (status === "OWNER REQUIRED") return "inline-flex max-w-full break-words rounded border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-xs leading-5 text-amber-200";
  if (status === "NOT RUN") return "inline-flex max-w-full break-words rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs leading-5 text-slate-300";
  return "inline-flex max-w-full break-words rounded border border-cyan-900/50 bg-cyan-950/30 px-2 py-1 text-xs leading-5 text-cyan-200";
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

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" | "amber" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : tone === "amber" ? "text-amber-200" : "text-emerald-300";

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 break-words text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
