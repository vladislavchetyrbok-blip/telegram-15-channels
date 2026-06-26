import Link from "next/link";
import { ClipboardCheck, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_RULE,
  getAphroditePublicLaunchGoNoGoReview,
} from "@/lib/zodiac/aphrodite-public-launch-go-no-go-review";

const model = getAphroditePublicLaunchGoNoGoReview();

export const metadata = {
  title: model.title,
};

export default function AphroditePublicLaunchGoNoGoReviewPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-emerald-300">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Public launch Go-No-Go / Package 212</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="inline-flex max-w-full rounded-md border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-sm font-medium leading-6 text-amber-200">{model.classification}</p>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Финальный review собирает visual readiness, real device checklist, WebView/startapp diagnostics, live version/cache marker,
            issue triage board, launch checklist, manual smoke matrix, support/refund readiness, analytics/privacy readiness,
            production safety blockers, env blockers, backup blocker, owner approval и unresolved blocker count.
          </p>
          <p className="max-w-5xl break-words rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_RULE}
          </p>
          <div className="max-w-5xl rounded-lg border border-rose-900/50 bg-rose-950/20 px-4 py-3 text-sm leading-6 text-rose-100">
            Launch is not approved. DATABASE_URL, TELEGRAM_BOT_TOKEN и backup age показаны как manual production blockers, not code failure.
          </div>
          <div className="flex max-w-5xl flex-wrap gap-2 text-xs">
            {model.safetyLabels.map((label) => (
              <span key={label} className="max-w-full break-words rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 leading-5 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="publicLaunchApproved" value={String(model.publicLaunchApproved)} tone="rose" />
          <Metric label="ownerManualReviewRequired" value={String(model.ownerManualReviewRequired)} tone="amber" />
          <Metric label="unresolvedBlockerCount" value={String(model.unresolvedBlockerCount)} tone="rose" />
          <Metric label="productionLaunchDone" value={String(model.safetyFlags.productionLaunchDone)} tone="rose" />
        </section>

        <ReviewSection title="launch dependencies" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {model.dependencies.map((dependency) => (
              <article key={dependency.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-sm font-medium text-white">{dependency.title}</h2>
                  <span className={statusClassName(dependency.status)}>{dependency.status}</span>
                </div>
                <p className="mt-2 break-all font-mono text-xs text-cyan-200">{dependency.routeOrSource}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{dependency.note}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="go/no-go gates" icon={<UserCheck className="h-5 w-5 text-cyan-400" />}>
            <div className="space-y-3">
              {model.gates.map((gate) => (
                <div key={gate.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-sm font-medium text-white">{gate.title}</h2>
                    <span className={gate.result === "go" ? "text-emerald-300" : gate.result === "no-go" ? "text-rose-300" : "text-amber-200"}>{gate.result}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{gate.evidence}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="production safety blockers" icon={<ShieldAlert className="h-5 w-5 text-rose-300" />}>
            <div className="grid gap-3">
              <p className="rounded-md border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-xs leading-5 text-amber-100">
                Manual production blockers: это операционные условия перед запуском, не ошибка кода Package 213.
              </p>
              <ListBlock title="production safety blockers" items={model.productionSafetyBlockers} />
              <ListBlock title="env blockers" items={model.envBlockers} />
              <ListBlock title="backup blocker" items={model.backupBlockers} />
            </div>
          </ReviewSection>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(model.safetyFlags).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="font-mono text-xs text-slate-500">{key}</div>
                  <p className="mt-1 text-sm font-medium text-emerald-300">{String(value)}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="next recommended package" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
            <p className="text-sm leading-6 text-slate-300">{model.nextRecommendedPackage}</p>
            <p className="mt-3 text-xs text-slate-500">Package 213 не начинается автоматически из этой страницы.</p>
          </ReviewSection>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-visual-readiness-review" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Visual Launch Review</Link>
            <Link href="/dashboard/networks/zodiac/real-device-visual-qa-checklist" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Real Device Visual QA</Link>
            <Link href="/dashboard/networks/zodiac/visual-issue-triage-board" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Visual Issue Triage Board</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusClassName(status: string) {
  if (status === "blocked") return "inline-flex max-w-full break-words rounded border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-xs leading-5 text-rose-200";
  if (status === "manual-required") return "inline-flex max-w-full break-words rounded border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-xs leading-5 text-amber-200";
  return "inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200";
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

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" | "amber" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : tone === "amber" ? "text-amber-200" : "text-emerald-300";

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 break-words text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
