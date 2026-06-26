import Link from "next/link";
import { Camera, ClipboardCheck, ListChecks, MonitorSmartphone, ShieldCheck, UserCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_REAL_DEVICE_VISUAL_QA_RULE,
  getAphroditeRealDeviceVisualQaChecklist,
} from "@/lib/zodiac/aphrodite-real-device-visual-qa-checklist";

const model = getAphroditeRealDeviceVisualQaChecklist();

export const metadata = {
  title: model.title,
};

export default function AphroditeRealDeviceVisualQaChecklistPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-emerald-300">
            <MonitorSmartphone className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Real device visual QA / Package 208 + Evidence Pack 214</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="inline-flex max-w-full rounded-md border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-sm font-medium leading-6 text-emerald-200">{model.classification}</p>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Checklist фиксирует, что нужно вручную проверить на iPhone, Android, Telegram Desktop, браузерах, narrow screens,
            slow network mode, Telegram safe area, keyboard open state и back button behavior перед public launch review.
          </p>
          <p className="max-w-5xl break-words rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_REAL_DEVICE_VISUAL_QA_RULE}
          </p>
          <div className="flex max-w-5xl flex-wrap gap-2 text-xs">
            {model.safetyLabels.map((label) => (
              <span key={label} className="max-w-full break-words rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 leading-5 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="evidencePackPackage" value={`Package ${model.evidencePackPackageNumber}`} />
          <Metric label="requiredEvidenceChecks" value={String(model.evidenceChecks.length)} />
          <Metric label="ownerManualReview" value={model.ownerManualReview.status} tone="amber" />
          <Metric label="publicLaunchApproved" value={String(model.ownerManualReview.publicLaunchApproved)} tone="rose" />
        </section>

        <ReviewSection title="evidence status legend" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
          <div className="flex flex-wrap gap-2">
            {model.evidenceStatuses.map((status) => (
              <span key={status} className={statusClassName(status)}>
                {status}
              </span>
            ))}
          </div>
          <p className="mt-4 rounded-md border border-rose-900/50 bg-rose-950/20 px-3 py-2 text-sm leading-6 text-rose-100">
            Launch remains not approved. publicLaunchApproved=false and ownerManualReviewRequired=true until the owner manually confirms every required evidence item.
          </p>
        </ReviewSection>

        <ReviewSection title="required real-device evidence pack" icon={<Camera className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {model.evidenceChecks.map((check) => (
              <article key={check.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium text-white">{check.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">{check.category}</p>
                  </div>
                  <span className={statusClassName(check.status)}>{check.status}</span>
                </div>
                <p className="mt-3 break-all font-mono text-xs text-cyan-200">{check.routeOrFlow}</p>
                <div className="mt-4 grid gap-3">
                  <EvidenceField label="required screenshot" value={check.requiredScreenshot} />
                  <EvidenceField label="PASS criteria" value={check.passCriteria} />
                  <EvidenceField label="FAIL criteria" value={check.failCriteria} />
                  <ListBlock title="cannot automate" items={check.cannotAutomate} />
                </div>
              </article>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="device checklist" icon={<MonitorSmartphone className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {model.devices.map((device) => (
              <article key={device.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{device.title}</h2>
                <p className="mt-1 break-words font-mono text-xs text-slate-500">{device.environment}</p>
                <div className="mt-4 grid gap-3">
                  <ListBlock title="manual checks" items={device.checklist} />
                  <ListBlock title="risk focus" items={device.riskFocus} />
                </div>
              </article>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="routes and screens" icon={<ListChecks className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {model.screens.map((screen) => (
              <article key={screen.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{screen.title}</h2>
                <p className="mt-1 break-words font-mono text-xs text-slate-500">{screen.routeOrFlow}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{screen.expectedVisualResult}</p>
                <ListBlock title="checks" items={screen.checks} />
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {model.boundaries.map((boundary) => (
                <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{boundary.visibleLabel}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="next recommended package" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
            <p className="text-sm leading-6 text-slate-300">{model.nextRecommendedPackage}</p>
            <p className="mt-3 text-xs text-slate-500">Package 209 не начинается автоматически из этой страницы.</p>
          </ReviewSection>
        </section>

        <ReviewSection title="owner manual review status" icon={<UserCheck className="h-5 w-5 text-amber-300" />}>
          <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{model.ownerManualReview.status}</p>
                <p className="mt-2 text-sm leading-6 text-amber-100">{model.ownerManualReview.summary}</p>
              </div>
              <span className={statusClassName(model.ownerManualReview.status)}>{model.ownerManualReview.status}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <EvidenceField label="publicLaunchApproved" value={String(model.ownerManualReview.publicLaunchApproved)} />
              <EvidenceField label="ownerManualReviewRequired" value={String(model.ownerManualReview.ownerManualReviewRequired)} />
            </div>
            <div className="mt-4">
              <ListBlock title="required before launch" items={model.ownerManualReview.requiredBeforeLaunch} />
            </div>
          </div>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-visual-readiness-review" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Visual Launch Review</Link>
            <Link href="/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">StartApp Diagnostics</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-visual-qa-consolidation" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Mini App Visual QA</Link>
            <Link href="/dashboard/networks/zodiac/manual-launch-smoke-test-matrix" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Manual Smoke Test Matrix</Link>
          </div>
        </div>
      </div>
    </div>
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

function statusClassName(status: string) {
  if (status === "PASS") return "inline-flex max-w-full rounded-md border border-emerald-900/50 bg-emerald-950/30 px-2.5 py-1.5 text-xs leading-5 text-emerald-200";
  if (status === "NEEDS FIX") return "inline-flex max-w-full rounded-md border border-amber-900/50 bg-amber-950/30 px-2.5 py-1.5 text-xs leading-5 text-amber-200";
  if (status === "BLOCKED") return "inline-flex max-w-full rounded-md border border-rose-900/50 bg-rose-950/30 px-2.5 py-1.5 text-xs leading-5 text-rose-200";
  if (status === "OWNER REVIEW REQUIRED") return "inline-flex max-w-full rounded-md border border-cyan-900/50 bg-cyan-950/30 px-2.5 py-1.5 text-xs leading-5 text-cyan-200";
  return "inline-flex max-w-full rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs leading-5 text-slate-300";
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
