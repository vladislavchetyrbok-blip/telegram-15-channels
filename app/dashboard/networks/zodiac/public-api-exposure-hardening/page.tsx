import Link from "next/link";
import { LockKeyhole, Radar, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_ROUTE,
  getAphroditePublicApiExposureHardening,
  type AphroditePublicApiExposureStatus,
} from "@/lib/zodiac/aphrodite-public-api-exposure-hardening";

const model = getAphroditePublicApiExposureHardening();

export const metadata = {
  title: model.title,
};

export default function AphroditePublicApiExposureHardeningPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-cyan-300">
            <LockKeyhole className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Public API hardening / Package {model.packageNumber}</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Readiness view for the two unauthenticated API surfaces found by audit. The status endpoint is redacted and analytics events are treated as preview/no-trust telemetry.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="publicLaunchApproved" value={String(model.publicLaunchApproved)} tone="rose" />
          <Metric label="ownerManualReviewRequired" value={String(model.ownerManualReviewRequired)} tone="amber" />
          <Metric label="DB write added" value={String(model.safetyFlags.databaseWriteAdded)} tone="rose" />
          <Metric label="external analytics added" value={String(model.safetyFlags.externalAnalyticsAdded)} tone="rose" />
          <Metric label="Telegram API used" value={String(model.safetyFlags.telegramApiUsed)} tone="rose" />
        </section>

        <ReviewSection title="public API exposure status" icon={<Radar className="h-5 w-5 text-cyan-400" />}>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <div className="hidden grid-cols-[0.9fr_0.9fr_1.4fr_1.5fr_0.7fr_1.2fr] border-b border-slate-800 bg-slate-950 px-4 py-3 text-[11px] font-semibold uppercase tracking-normal text-slate-500 xl:grid">
              <div>Area</div>
              <div>Route</div>
              <div>Before</div>
              <div>Hardened behavior</div>
              <div>Status</div>
              <div>Manual work</div>
            </div>
            <div className="divide-y divide-slate-800">
              {model.items.map((item) => (
                <article key={item.area} className="grid gap-3 bg-black/30 p-4 xl:grid-cols-[0.9fr_0.9fr_1.4fr_1.5fr_0.7fr_1.2fr]">
                  <MatrixCell label="Area">{item.area}</MatrixCell>
                  <MatrixCell label="Route">
                    <span className="break-all font-mono text-xs text-slate-200">{item.route}</span>
                  </MatrixCell>
                  <MatrixCell label="Before">{item.exposureBefore}</MatrixCell>
                  <MatrixCell label="Hardened behavior">{item.hardening}</MatrixCell>
                  <MatrixCell label="Status">
                    <span className={statusClassName(item.status)}>{item.status}</span>
                  </MatrixCell>
                  <MatrixCell label="Manual work">{item.remainingManualWork}</MatrixCell>
                </article>
              ))}
            </div>
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
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
              {model.safetyNotes.map((note) => (
                <li key={note} className="rounded-md border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-emerald-100">{note}</li>
              ))}
            </ul>
          </ReviewSection>

          <ReviewSection title="remaining blockers" icon={<ShieldAlert className="h-5 w-5 text-amber-300" />}>
            <ul className="grid gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
              {model.remainingBlockers.map((blocker) => (
                <li key={blocker} className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-amber-100">
                  {blocker}
                </li>
              ))}
            </ul>
          </ReviewSection>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Related readiness sections</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/dashboard-auth-system-decision" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Dashboard Auth Decision</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-dry-run-matrix" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Dry-Run Matrix</Link>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] leading-5 text-slate-500">{APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_ROUTE}</p>
        </div>
      </div>
    </div>
  );
}

function statusClassName(status: AphroditePublicApiExposureStatus) {
  if (status === "HARDENED") return "inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200";
  if (status === "REDACTED") return "inline-flex max-w-full break-words rounded border border-cyan-900/50 bg-cyan-950/30 px-2 py-1 text-xs leading-5 text-cyan-200";
  if (status === "NO TRUST") return "inline-flex max-w-full break-words rounded border border-violet-900/50 bg-violet-950/30 px-2 py-1 text-xs leading-5 text-violet-200";
  if (status === "MANUAL REQUIRED") return "inline-flex max-w-full break-words rounded border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-xs leading-5 text-amber-200";
  return "inline-flex max-w-full break-words rounded border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-xs leading-5 text-rose-200";
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
