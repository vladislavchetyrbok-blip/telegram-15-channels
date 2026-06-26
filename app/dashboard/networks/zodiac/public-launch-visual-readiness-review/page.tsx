import Link from "next/link";
import { AlertTriangle, ClipboardCheck, Eye, FileCheck2, MonitorSmartphone, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CLASSIFICATION,
  APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CONCLUSION,
  APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_RULE,
  APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_TITLE,
  APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT,
  APHRODITE_PUBLIC_LAUNCH_VISUAL_SAFETY_LABELS,
  getAphroditePublicLaunchVisualBlockers,
  getAphroditePublicLaunchVisualNextSteps,
  getAphroditePublicLaunchVisualReadinessChecklist,
  getAphroditePublicLaunchVisualReadinessSurfaces,
  getAphroditePublicLaunchVisualSafetyBoundaries,
} from "@/lib/zodiac/aphrodite-public-launch-visual-readiness-review";
import type { AphroditePublicLaunchVisualChecklistItem, AphroditePublicLaunchVisualReadinessStatus } from "@/lib/zodiac/aphrodite-public-launch-visual-readiness-review";

export const metadata = {
  title: APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_TITLE,
};

const surfaces = getAphroditePublicLaunchVisualReadinessSurfaces();
const checklist = getAphroditePublicLaunchVisualReadinessChecklist();
const blockers = getAphroditePublicLaunchVisualBlockers();
const boundaries = getAphroditePublicLaunchVisualSafetyBoundaries();
const nextSteps = getAphroditePublicLaunchVisualNextSteps();

const mvpReadySurfaces = surfaces.filter((surface) => surface.status === "ready-for-manual-review" || surface.status === "good-enough-for-mvp");
const polishSurfaces = surfaces.filter((surface) => surface.status === "needs-polish");
const deviceChecklist = checklist.filter((item) => item.category === "mobile-device");
const telegramChecklist = checklist.filter((item) => item.category === "telegram-webview");
const browserFallbackChecklist = checklist.filter((item) => item.category === "browser-fallback");

const statusTone: Record<AphroditePublicLaunchVisualReadinessStatus, string> = {
  "ready-for-manual-review": "border-emerald-900/40 bg-emerald-950/20 text-emerald-200",
  "good-enough-for-mvp": "border-cyan-900/40 bg-cyan-950/20 text-cyan-200",
  "needs-polish": "border-amber-900/40 bg-amber-950/20 text-amber-200",
  "needs-device-test": "border-violet-900/40 bg-violet-950/20 text-violet-200",
  blocked: "border-rose-900/40 bg-rose-950/20 text-rose-200",
  "not-user-facing": "border-slate-700 bg-slate-900 text-slate-300",
};

export default function AphroditePublicLaunchVisualReadinessReviewPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <Eye className="h-4 w-4" />
            <span>Aphrodite / Visual launch readiness / Package 207</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_TITLE}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Review оценивает визуальную готовность Aphrodite Mini App после packages 196-206: Mini App home, AI Love Reading preview,
            Birth Matrix, Compatibility result, Mystic / Universe, daily/weekly/monthly cards, fallback route и device-check готовность.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_RULE}
          </p>
          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 px-4 py-3 text-sm leading-6 text-rose-100">
            {APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CONCLUSION}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_PUBLIC_LAUNCH_VISUAL_SAFETY_LABELS.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="surfaces reviewed" value={String(surfaces.length)} />
          <Metric label="MVP-ready surfaces" value={String(mvpReadySurfaces.length)} />
          <Metric label="publicLaunchApproved" value={String(APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.publicLaunchApproved)} tone="rose" />
          <Metric label="ownerManualReviewRequired" value={String(APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT.ownerManualReviewRequired)} tone="amber" />
        </section>

        <ReviewSection title="summary" icon={<ClipboardCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <div className="text-sm font-medium text-white">Итог visual readiness</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Основные user-facing surfaces готовы к ручному public review или достаточно зрелые для MVP review. Автоматическое одобрение
                публичного запуска не выполняется.
              </p>
            </div>
            <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-4">
              <div className="text-sm font-medium text-white">launch result sample</div>
              <div className="mt-2 grid gap-2 font-mono text-xs text-rose-100">
                <code>publicLaunchApproved=false</code>
                <code>ownerManualReviewRequired=true</code>
              </div>
            </div>
          </div>
        </ReviewSection>

        <ReviewSection title="visual readiness by screen" icon={<FileCheck2 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-4 md:grid-cols-2">
            {surfaces.map((surface) => (
              <article key={surface.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium text-white">{surface.title}</h2>
                    <p className="mt-1 font-mono text-xs text-slate-500">{surface.route}</p>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-[11px] ${statusTone[surface.status]}`}>{surface.statusLabel}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-emerald-200/80">{surface.classification}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{surface.currentAssessment}</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <ListBlock title="evidence" items={surface.evidence} />
                  <ListBlock title="manual checks" items={surface.manualChecks} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {surface.sourceFiles.map((file) => (
                    <code key={file} className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-400">
                      {file}
                    </code>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="MVP-ready surfaces" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <CompactSurfaceList surfaces={mvpReadySurfaces} />
          </ReviewSection>

          <ReviewSection title="screens needing polish" icon={<AlertTriangle className="h-5 w-5 text-amber-300" />}>
            <CompactSurfaceList surfaces={polishSurfaces} emptyText="Отдельных user-facing blockers по polish нет, кроме guard/fallback review." />
          </ReviewSection>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <ChecklistSection title="mobile device checklist" items={deviceChecklist} />
          <ChecklistSection title="Telegram WebView checklist" items={telegramChecklist} />
          <ChecklistSection title="browser fallback checklist" items={browserFallbackChecklist} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <ReviewSection title="launch blockers" icon={<AlertTriangle className="h-5 w-5 text-rose-300" />}>
            <div className="space-y-3">
              {blockers.map((blocker) => (
                <div key={blocker.id} className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-sm font-medium text-white">{blocker.title}</h2>
                    <span className="rounded-md border border-rose-900/50 bg-rose-950 px-2 py-0.5 text-[11px] text-rose-100">
                      {blocker.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-rose-100/80">{blocker.reason}</p>
                  <ListBlock title="required before launch" items={blocker.requiredBeforeLaunch} />
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="owner manual review requirement" icon={<MonitorSmartphone className="h-5 w-5 text-cyan-400" />}>
            <p className="text-sm leading-6 text-slate-300">{APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CONCLUSION}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {checklist.filter((item) => item.category === "owner-review" || item.category === "safety").map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-800 bg-black/30 p-3">
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{item.expectedResult}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {boundaries.map((boundary) => (
              <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-4">
                <div className="text-sm font-medium text-white">{boundary.visibleLabel}</div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
                <p className="mt-2 text-xs leading-5 text-emerald-200/80">Разрешено сейчас: {boundary.allowedNow.join("; ")}.</p>
                <p className="mt-1 text-xs leading-5 text-rose-100/80">Запрещено сейчас: {boundary.blockedNow.join("; ")}.</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="next recommended package" icon={<MonitorSmartphone className="h-5 w-5 text-cyan-400" />}>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
            {nextSteps.map((step) => (
              <li key={step.package}>
                <span className="text-white">
                  {step.package} — {step.title}:
                </span>{" "}
                {step.purpose} Не делать: {step.mustNotDo.join("; ")}.
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Package 208 не начинается автоматически.</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-visual-qa-consolidation" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mini App Visual QA</Link>
            <Link href="/dashboard/networks/zodiac/manual-launch-smoke-test-matrix" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Manual Smoke Test Matrix</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-checklist-refresh" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Public Launch Checklist</Link>
            <Link href="/dashboard/networks/zodiac/first-paid-mvp-readiness-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Paid MVP Readiness</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistSection({ title, items }: { title: string; items: AphroditePublicLaunchVisualChecklistItem[] }) {
  return (
    <ReviewSection title={title} icon={<MonitorSmartphone className="h-5 w-5 text-cyan-400" />}>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-800 bg-black/30 p-3">
            <div className="text-sm font-medium text-white">{item.label}</div>
            <p className="mt-1 text-xs leading-5 text-slate-400">{item.expectedResult}</p>
          </div>
        ))}
      </div>
    </ReviewSection>
  );
}

function CompactSurfaceList({
  surfaces: list,
  emptyText = "Нет surface в этой категории.",
}: {
  surfaces: typeof surfaces;
  emptyText?: string;
}) {
  if (list.length === 0) {
    return <p className="text-sm leading-6 text-slate-400">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {list.map((surface) => (
        <div key={surface.id} className="rounded-lg border border-slate-800 bg-black/30 p-3">
          <div className="text-sm font-medium text-white">{surface.title}</div>
          <p className="mt-1 text-xs text-slate-500">{surface.statusLabel}</p>
        </div>
      ))}
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

function ListBlock({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="mt-3">
      <div className="text-[11px] font-semibold uppercase text-slate-500">{title}</div>
      <ul className="mt-1 space-y-1 text-xs leading-5 text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "amber" | "rose" }) {
  const toneClass =
    tone === "rose" ? "text-rose-300" : tone === "amber" ? "text-amber-300" : "text-emerald-300";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
