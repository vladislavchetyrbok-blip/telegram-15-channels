import Link from "next/link";
import { Bug, ClipboardCheck, Route, ShieldCheck, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_RULE,
  getAphroditeTelegramWebViewStartAppDiagnostics,
} from "@/lib/zodiac/aphrodite-telegram-webview-startapp-diagnostics";

const model = getAphroditeTelegramWebViewStartAppDiagnostics();

export const metadata = {
  title: model.title,
};

export default function AphroditeTelegramWebViewStartAppDiagnosticsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-emerald-300">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Telegram WebView diagnostics / Package 209</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="inline-flex max-w-full rounded-md border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-sm font-medium leading-6 text-emerald-200">{model.classification}</p>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Диагностика связывает startapp parameters, ожидаемые routes, wrong route symptoms, stale Telegram WebView cache,
            version marker check, cache-buster query check и platform-specific поведение iOS, Android, Telegram Desktop и browser fallback.
          </p>
          <p className="max-w-5xl break-words rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_RULE}
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
          <Metric label="startapp routes" value={String(model.routes.length)} />
          <Metric label="cache diagnostics" value={String(model.cacheDiagnostics.length)} />
          <Metric label="telegramApiUsed" value={String(model.safetyFlags.telegramApiUsed)} tone="rose" />
          <Metric label="botFatherChanged" value={String(model.safetyFlags.botFatherChanged)} tone="rose" />
        </section>

        <ReviewSection title="startapp routes" icon={<Route className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {model.routes.map((route) => (
              <article key={route.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-sm font-medium text-white">{route.startapp}</h2>
                  <code className="max-w-full break-all rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-cyan-200">{route.expectedRoute}</code>
                </div>
                <p className="mt-2 text-xs text-slate-500">{route.expectedScreen}</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <ListBlock title="diagnosis signals" items={route.diagnosisSignals} />
                  <ListBlock title="wrong route symptoms" items={route.wrongRouteSymptoms} />
                </div>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="cache diagnosis" icon={<Bug className="h-5 w-5 text-amber-300" />}>
            <div className="space-y-3">
              {model.cacheDiagnostics.map((diagnostic) => (
                <div key={diagnostic.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h2 className="text-sm font-medium text-white">{diagnostic.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-amber-100/80">{diagnostic.symptom}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{diagnostic.check}</p>
                  <p className="mt-2 text-xs leading-5 text-emerald-200/80">{diagnostic.recommendedManualAction}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="platform behavior" icon={<Smartphone className="h-5 w-5 text-cyan-400" />}>
            <div className="space-y-3">
              {model.platformDiagnostics.map((platform) => (
                <div key={platform.id} className="min-w-0 rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h2 className="text-sm font-medium text-white">{platform.title}</h2>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <ListBlock title="behavior to check" items={platform.behaviorToCheck} />
                    <ListBlock title="risk notes" items={platform.riskNotes} />
                  </div>
                </div>
              ))}
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
            <p className="mt-3 text-xs text-slate-500">Package 210 не начинается автоматически из этой страницы.</p>
          </ReviewSection>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/real-device-visual-qa-checklist" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Real Device Visual QA</Link>
            <Link href="/dashboard/networks/zodiac/live-version-cache-marker-readiness" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Live Version Cache Marker</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-visual-readiness-review" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Visual Launch Review</Link>
            <Link href="/miniapp" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Mini App hub</Link>
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
