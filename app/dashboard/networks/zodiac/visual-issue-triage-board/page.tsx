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
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <Columns3 className="h-4 w-4" />
            <span>Aphrodite / Visual issue triage / Package 211</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{model.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{model.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Ручная доска для screenshot findings, live QA defects, route/startapp problems, cache/deploy symptoms и visual polish candidates.
            Она не создаёт issue tracker records и не отправляет данные наружу.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {model.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="categories" value={String(model.categories.length)} />
          <Metric label="severity levels" value={String(model.severities.length)} />
          <Metric label="statuses" value={String(model.statuses.length)} />
          <Metric label="externalIntegrationsUsed" value={String(model.safetyFlags.externalIntegrationsUsed)} tone="rose" />
        </section>

        <ReviewSection title="issue categories" icon={<ImagePlus className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {model.categories.map((category) => (
              <article key={category.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
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
                <div key={severity.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h2 className="text-sm font-medium text-white">{severity.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{severity.responseRule}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="status" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
            <div className="space-y-3">
              {model.statuses.map((status) => (
                <div key={status.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
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
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/live-version-cache-marker-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Live Version Cache Marker</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-go-no-go-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Public Launch Go/No-Go</Link>
            <Link href="/dashboard/networks/zodiac/real-device-visual-qa-checklist" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Real Device Visual QA</Link>
            <Link href="/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">StartApp Diagnostics</Link>
          </div>
        </div>
      </div>
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
    <div>
      <div className="text-[11px] font-semibold uppercase text-slate-500">{title}</div>
      <ul className="mt-1 space-y-1 text-xs leading-5 text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : "text-emerald-300";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
