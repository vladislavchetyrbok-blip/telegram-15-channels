import Link from "next/link";
import { Camera, ClipboardCheck, ListChecks, MonitorSmartphone, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_ROUTE,
  getAphroditeRealDeviceQaExecutionPack,
  type AphroditeRealDeviceQaExecutionSeverity,
  type AphroditeRealDeviceQaExecutionStatus,
} from "@/lib/zodiac/aphrodite-real-device-qa-execution-pack";

const model = getAphroditeRealDeviceQaExecutionPack();

export const metadata = {
  title: model.title,
};

export default function AphroditeRealDeviceQaExecutionPackPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-emerald-300">
            <MonitorSmartphone className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Real Device QA Execution / Package {model.packageNumber}</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Execution pack for owner-run real-device QA before soft launch. It records which phone/browser/WebView checks must be run, what evidence is required, which screenshots are needed, and why launch is still blocked.
          </p>
          <div className="rounded-lg border border-rose-900/50 bg-rose-950/20 px-4 py-3 text-sm leading-6 text-rose-100">
            {model.launchGate.launchNotApprovedWording}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="publicLaunchApproved" value={String(model.publicLaunchApproved)} tone="rose" />
          <Metric label="ownerManualReviewRequired" value={String(model.ownerManualReviewRequired)} tone="amber" />
          <Metric label="deviceChecks" value={String(model.deviceChecks.length)} />
          <Metric label="Mini App flow checks" value={String(model.miniAppFlowChecks.length)} />
          <Metric label="screenshots required" value={String(model.screenshotsChecklist.length)} tone="amber" />
          <Metric label="productionLaunchDone" value={String(model.safetyFlags.productionLaunchDone)} tone="rose" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <ReviewSection title="status legend" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
            <div className="flex flex-wrap gap-2">
              {model.statuses.map((status) => (
                <span key={status} className={statusClassName(status)}>{status}</span>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="blocker severity" icon={<ShieldAlert className="h-5 w-5 text-amber-200" />}>
            <div className="flex flex-wrap gap-2">
              {model.blockerSeverities.map((severity) => (
                <span key={severity} className={severityClassName(severity)}>{severity}</span>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="real-device checks" icon={<MonitorSmartphone className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 xl:grid-cols-2">
            {model.deviceChecks.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="Mini App flow execution checks" icon={<ListChecks className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 xl:grid-cols-2">
            {model.miniAppFlowChecks.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="owner evidence section" icon={<UserCheck className="h-5 w-5 text-amber-300" />}>
            <div className="grid gap-3">
              {model.ownerEvidenceFields.map((field) => (
                <article key={field.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-medium text-white">{field.label}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{field.expectedEntry}</p>
                    </div>
                    <span className={statusClassName(field.status)}>{field.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="screenshots checklist" icon={<Camera className="h-5 w-5 text-cyan-400" />}>
            <ul className="grid gap-2 text-sm leading-6 text-slate-300">
              {model.screenshotsChecklist.map((item) => (
                <li key={item} className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </ReviewSection>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="launch gate section" icon={<ShieldAlert className="h-5 w-5 text-rose-300" />}>
            <div className="space-y-3">
              <EvidenceField label="publicLaunchApproved" value={String(model.launchGate.publicLaunchApproved)} />
              <EvidenceField label="ownerManualReviewRequired" value={String(model.launchGate.ownerManualReviewRequired)} />
              <EvidenceField label="launch not approved" value={model.launchGate.launchNotApprovedWording} />
              <ListBlock title="required before soft launch" items={model.launchGate.requiredBeforeSoftLaunch} />
            </div>
          </ReviewSection>

          <ReviewSection title="remaining blockers" icon={<ShieldAlert className="h-5 w-5 text-amber-200" />}>
            <ul className="grid gap-2 text-sm leading-6 text-slate-300">
              {model.remainingBlockers.map((blocker) => (
                <li key={blocker} className="rounded-md border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-rose-100">
                  {blocker}
                </li>
              ))}
            </ul>
          </ReviewSection>
        </section>

        <ReviewSection title="safety confirmation" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            <Link href="/dashboard/networks/zodiac/real-device-visual-qa-checklist" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Real Device Visual QA</Link>
            <Link href="/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">StartApp Diagnostics</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-go-no-go-review" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Public Launch Go/No-Go</Link>
            <Link href="/dashboard/networks/zodiac/manual-launch-runbook-rollback-pack" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Manual Launch Runbook</Link>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] leading-5 text-slate-500">{APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_ROUTE}</p>
        </div>
      </div>
    </div>
  );
}

function CheckCard({ check }: { check: ReturnType<typeof getAphroditeRealDeviceQaExecutionPack>["deviceChecks"][number] }) {
  return (
    <article className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-white">{check.deviceEnvironment}</h2>
          <p className="mt-1 break-words font-mono text-xs text-slate-500">{check.flow}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={statusClassName(check.status)}>{check.status}</span>
          <span className={severityClassName(check.blockerSeverity)}>{check.blockerSeverity}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <EvidenceField label="Expected result" value={check.expectedResult} />
        <EvidenceField label="Evidence needed" value={check.evidenceNeeded} />
        <EvidenceField label="Screenshot required" value={check.screenshotRequired} />
        <EvidenceField label="Notes" value={check.notes} />
      </div>
    </article>
  );
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

function ListBlock({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase text-slate-500">{title}</div>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-400">
        {items.map((item) => (
          <li key={item} className="break-words">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EvidenceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase text-slate-500">{label}</div>
      <p className="mt-1 text-xs leading-5 text-slate-300">{value}</p>
    </div>
  );
}

function statusClassName(status: AphroditeRealDeviceQaExecutionStatus) {
  if (status === "PASS") return "inline-flex max-w-full break-words rounded-md border border-emerald-900/50 bg-emerald-950/30 px-2.5 py-1.5 text-xs leading-5 text-emerald-200";
  if (status === "FAIL" || status === "BLOCKED") return "inline-flex max-w-full break-words rounded-md border border-rose-900/50 bg-rose-950/30 px-2.5 py-1.5 text-xs leading-5 text-rose-200";
  if (status === "OWNER REVIEW REQUIRED") return "inline-flex max-w-full break-words rounded-md border border-cyan-900/50 bg-cyan-950/30 px-2.5 py-1.5 text-xs leading-5 text-cyan-200";
  return "inline-flex max-w-full break-words rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs leading-5 text-slate-300";
}

function severityClassName(severity: AphroditeRealDeviceQaExecutionSeverity) {
  if (severity === "blocker") return "inline-flex max-w-full break-words rounded-md border border-rose-900/50 bg-rose-950/30 px-2.5 py-1.5 text-xs leading-5 text-rose-200";
  if (severity === "high") return "inline-flex max-w-full break-words rounded-md border border-amber-900/50 bg-amber-950/30 px-2.5 py-1.5 text-xs leading-5 text-amber-200";
  if (severity === "medium") return "inline-flex max-w-full break-words rounded-md border border-cyan-900/50 bg-cyan-950/30 px-2.5 py-1.5 text-xs leading-5 text-cyan-200";
  return "inline-flex max-w-full break-words rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs leading-5 text-slate-300";
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
