import Link from "next/link";
import { ClipboardCheck, Database, RotateCcw, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_ROUTE,
  getAphroditeBackupRestoreRehearsalReadiness,
  type AphroditeBackupRestoreStatus,
} from "@/lib/zodiac/aphrodite-backup-restore-rehearsal-readiness";

const model = getAphroditeBackupRestoreRehearsalReadiness();

export const metadata = {
  title: model.title,
};

export default function AphroditeBackupRestoreRehearsalReadinessPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-emerald-300">
            <Database className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Backup & Restore Rehearsal / Package {model.packageNumber}</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Static readiness checklist for backup freshness, manual restore rehearsal, rollback dependencies, and owner review before public launch. It does not connect to production data.
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
          <Metric label="productionDbConnectionMade" value={String(model.safetyFlags.productionDbConnectionMade)} tone="rose" />
          <Metric label="backupCreatedAutomatically" value={String(model.safetyFlags.backupCreatedAutomatically)} tone="rose" />
          <Metric label="restoreExecutedAutomatically" value={String(model.safetyFlags.restoreExecutedAutomatically)} tone="rose" />
        </section>

        <ReviewSection title="backup & restore readiness sections" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-4 lg:grid-cols-2">
            {model.sections.map((section) => (
              <article key={section.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-medium text-white">{section.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{section.summary}</p>
                  </div>
                  <span className={statusClassName(section.status)}>{section.status}</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
                  {section.checklist.map((item) => (
                    <li key={item} className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="status legend" icon={<RotateCcw className="h-5 w-5 text-cyan-400" />}>
            <div className="flex flex-wrap gap-2">
              {model.statuses.map((status) => (
                <span key={status} className={statusClassName(status)}>{status}</span>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="remaining backup blockers" icon={<ShieldAlert className="h-5 w-5 text-amber-200" />}>
            <ul className="grid gap-2 text-sm leading-6 text-slate-300">
              {model.remainingBackupBlockers.map((blocker) => (
                <li key={blocker} className="rounded-md border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-rose-100">
                  {blocker}
                </li>
              ))}
            </ul>
          </ReviewSection>
        </section>

        <ReviewSection title="no automatic DB access guarantee" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
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
            <Link href="/dashboard/networks/zodiac/public-launch-dry-run-matrix" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Dry-Run Matrix</Link>
            <Link href="/dashboard/networks/zodiac/live-version-cache-marker-readiness" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Live Version/Cache Marker</Link>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] leading-5 text-slate-500">{APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_ROUTE}</p>
        </div>
      </div>
    </div>
  );
}

function statusClassName(status: AphroditeBackupRestoreStatus) {
  if (status === "PASS") return "inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200";
  if (status === "BLOCKED") return "inline-flex max-w-full break-words rounded border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-xs leading-5 text-rose-200";
  if (status === "NOT VERIFIED") return "inline-flex max-w-full break-words rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs leading-5 text-slate-300";
  if (status === "OWNER REVIEW REQUIRED") return "inline-flex max-w-full break-words rounded border border-violet-900/50 bg-violet-950/30 px-2 py-1 text-xs leading-5 text-violet-200";
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

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" | "amber" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : tone === "amber" ? "text-amber-200" : "text-emerald-300";

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 break-words text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
