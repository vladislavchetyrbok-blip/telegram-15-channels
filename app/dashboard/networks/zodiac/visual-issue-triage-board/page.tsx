import Link from "next/link";
import { ClipboardCheck, Columns3, ImagePlus, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_RULE,
  getAphroditeVisualIssueTriageBoard,
} from "@/lib/zodiac/aphrodite-visual-issue-triage-board";

const model = getAphroditeVisualIssueTriageBoard();

export const metadata = {
  title: model.title,
};

export default function AphroditeVisualIssueTriageBoardPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-emerald-300">
            <Columns3 className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Visual issue triage / Package 211</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="inline-flex max-w-full rounded-md border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-sm font-medium leading-6 text-emerald-200">{model.classification}</p>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Ручная доска для screenshot findings, live QA defects, route/startapp problems, cache/deploy symptoms и visual polish candidates.
            Она не создаёт issue tracker records и не отправляет данные наружу.
          </p>
          <p className="max-w-5xl break-words rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_RULE}
          </p>
          <p className="max-w-5xl rounded-lg border border-cyan-900/40 bg-cyan-950/20 px-4 py-3 text-sm leading-6 text-cyan-100">
            Visual issues are separate from production blockers: эта доска фиксирует UX/screenshots, а DATABASE_URL, TELEGRAM_BOT_TOKEN и backup age относятся к manual production blockers в Go/No-Go review.
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
          <Metric label="categories" value={String(model.categories.length)} />
          <Metric label="severity levels" value={String(model.severities.length)} />
          <Metric label="statuses" value={String(model.statuses.length)} />
          <Metric label="externalIntegrationsUsed" value={String(model.safetyFlags.externalIntegrationsUsed)} tone="rose" />
        </section>

        <ReviewSection title="issue categories" icon={<ImagePlus className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {model.categories.map((category) => (
              <article key={category.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{category.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{category.description}</p>
                <p className="mt-3 text-xs leading-5 text-amber-100/80">{category.screenshotHint}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="severity" icon={<Columns3 className="h-5 w-5 text-cyan-400" />}>
            <div className="space-y-3">
              {model.severities.map((severity) => (
                <div key={severity.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h2 className="text-sm font-medium text-white">{severity.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{severity.responseRule}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="status" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
            <div className="space-y-3">
              {model.statuses.map((status) => (
                <div key={status.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h2 className="text-sm font-medium text-white">{status.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{status.meaning}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="manual board rules" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
            <ListBlock title="rules" items={model.manualBoardRules} />
          </ReviewSection>

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
        </section>

        <ReviewSection title="next recommended package" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{model.nextRecommendedPackage}</p>
          <p className="mt-3 text-xs text-slate-500">Package 212 не начинается автоматически из этой страницы.</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/live-version-cache-marker-readiness" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Live Version Cache Marker</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-go-no-go-review" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Public Launch Go/No-Go</Link>
            <Link href="/dashboard/networks/zodiac/real-device-visual-qa-checklist" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Real Device Visual QA</Link>
            <Link href="/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">StartApp Diagnostics</Link>
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

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : "text-emerald-300";

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 break-words text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
