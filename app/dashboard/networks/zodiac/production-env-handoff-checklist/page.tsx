import Link from "next/link";
import { ClipboardCheck, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_ROUTE,
  getAphroditeProductionEnvHandoffChecklist,
  type AphroditeProductionEnvReadiness,
} from "@/lib/zodiac/aphrodite-production-env-handoff-checklist";

const model = getAphroditeProductionEnvHandoffChecklist();

export const metadata = {
  title: model.title,
};

export default function AphroditeProductionEnvHandoffChecklistPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-emerald-300">
            <KeyRound className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Production Env Handoff / Package {model.packageNumber}</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Static owner handoff checklist for production environment setup. It lists required env names, where to configure them, how to verify readiness, and how to keep secrets out of code and reports.
          </p>
          <div className="grid max-w-5xl gap-2 sm:grid-cols-2">
            {model.requiredMessages.map((message) => (
              <div key={message} className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-sm leading-6 text-amber-100">
                {message}
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="publicLaunchApproved" value={String(model.publicLaunchApproved)} tone="rose" />
          <Metric label="ownerManualReviewRequired" value={String(model.ownerManualReviewRequired)} tone="amber" />
          <Metric label="secretsAdded" value={String(model.safetyFlags.secretsAdded)} tone="rose" />
          <Metric label="realEnvValuesStored" value={String(model.safetyFlags.realEnvValuesStored)} tone="rose" />
          <Metric label="telegramApiCallMade" value={String(model.safetyFlags.telegramApiCallMade)} tone="rose" />
        </section>

        <ReviewSection title="production env checklist" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <div className="hidden grid-cols-[0.95fr_0.55fr_0.75fr_1.15fr_1.2fr_1.15fr_0.65fr] gap-0 border-b border-slate-800 bg-slate-950 px-4 py-3 text-[11px] font-semibold uppercase tracking-normal text-slate-500 xl:grid">
              <div>Name</div>
              <div>Required for launch</div>
              <div>Current readiness</div>
              <div>Where owner should configure it</div>
              <div>Verification step</div>
              <div>Safety rule</div>
              <div>Never commit value</div>
            </div>
            <div className="divide-y divide-slate-800">
              {model.envItems.map((item) => (
                <article key={item.id} className="grid gap-3 bg-black/30 p-4 xl:grid-cols-[0.95fr_0.55fr_0.75fr_1.15fr_1.2fr_1.15fr_0.65fr]">
                  <MatrixCell label="Name">
                    <div className="font-mono text-sm text-white">{item.name}</div>
                  </MatrixCell>
                  <MatrixCell label="Required for launch">{item.requiredForLaunch ? "Yes" : "No"}</MatrixCell>
                  <MatrixCell label="Current readiness">
                    <span className={readinessClassName(item.currentReadiness)}>{item.currentReadiness}</span>
                  </MatrixCell>
                  <MatrixCell label="Where owner should configure it">{item.configureWhere}</MatrixCell>
                  <MatrixCell label="Verification step">{item.verificationStep}</MatrixCell>
                  <MatrixCell label="Safety rule">{item.safetyRule}</MatrixCell>
                  <MatrixCell label="Never commit value">
                    <span className="inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200">
                      {item.neverCommitValue ? "Yes" : "No"}
                    </span>
                  </MatrixCell>
                </article>
              ))}
            </div>
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="secret hygiene" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <ul className="grid gap-2 text-sm leading-6 text-slate-300">
              {model.secretHygieneRules.map((rule) => (
                <li key={rule} className="rounded-md border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-emerald-100">
                  {rule}
                </li>
              ))}
            </ul>
          </ReviewSection>

          <ReviewSection title="remaining env blockers" icon={<ShieldAlert className="h-5 w-5 text-amber-200" />}>
            <ul className="grid gap-2 text-sm leading-6 text-slate-300">
              {model.remainingEnvBlockers.map((blocker) => (
                <li key={blocker} className="rounded-md border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-rose-100">
                  {blocker}
                </li>
              ))}
            </ul>
          </ReviewSection>
        </section>

        <ReviewSection title="owner manual review and safety confirmation" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="mb-4 flex flex-wrap gap-2">
            {model.readinessStates.map((state) => (
              <span key={state} className={readinessClassName(state)}>{state}</span>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
            <Link href="/dashboard/networks/zodiac/backup-restore-rehearsal-readiness" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Backup/Restore Readiness</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-dry-run-matrix" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Dry-Run Matrix</Link>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] leading-5 text-slate-500">{APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_ROUTE}</p>
        </div>
      </div>
    </div>
  );
}

function readinessClassName(state: AphroditeProductionEnvReadiness) {
  if (state === "CONFIGURED") return "inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200";
  if (state === "MISSING") return "inline-flex max-w-full break-words rounded border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-xs leading-5 text-rose-200";
  if (state === "NOT CHECKED") return "inline-flex max-w-full break-words rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs leading-5 text-slate-300";
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

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" | "amber" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : tone === "amber" ? "text-amber-200" : "text-emerald-300";

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 break-words text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
