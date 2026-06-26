import Link from "next/link";
import { ClipboardCheck, GitBranch, Radar, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_RULE,
  getAphroditeLiveVersionCacheMarkerReadiness,
} from "@/lib/zodiac/aphrodite-live-version-cache-marker-readiness";

const model = getAphroditeLiveVersionCacheMarkerReadiness();

export const metadata = {
  title: model.title,
};

export default function AphroditeLiveVersionCacheMarkerReadinessPage() {
  return (
    <div
      className="min-h-screen bg-black p-8 text-slate-200"
      data-aphrodite-visual-version={model.dashboardOnlyMarker.value}
      data-aphrodite-marker-scope={model.dashboardOnlyMarker.scope}
    >
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <Radar className="h-4 w-4" />
            <span>Aphrodite / Live version cache marker / Package 210</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{model.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{model.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Readiness слой фиксирует source commit marker, live HTML marker, route-specific marker, /miniapp marker/check, /birth-matrix marker/check,
            /compatibility marker/check, Telegram WebView cache diagnosis, browser cache-buster diagnosis, Vercel deployment check notes и stale build symptoms.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_RULE}
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
          <Metric label={model.dashboardOnlyMarker.attribute} value={model.dashboardOnlyMarker.value} />
          <Metric label="marker checks" value={String(model.markerChecks.length)} />
          <Metric label="deploySettingsChanged" value={String(model.safetyFlags.deploySettingsChanged)} tone="rose" />
          <Metric label="productionLaunchDone" value={String(model.safetyFlags.productionLaunchDone)} tone="rose" />
        </section>

        <ReviewSection title="version marker plan" icon={<GitBranch className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {model.markerChecks.map((check) => (
              <article key={check.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{check.title}</h2>
                <p className="mt-1 font-mono text-xs text-slate-500">{check.target}</p>
                <p className="mt-3 text-xs text-cyan-200">{check.markerOrSignal}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{check.verificationMethod}</p>
                <ListBlock title="stale symptoms" items={check.staleSymptoms} />
              </article>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="route marker checks" icon={<Radar className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-3">
            {model.routeMarkers.map((route) => (
              <article key={route.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <code className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-cyan-200">{route.route}</code>
                <h2 className="mt-3 text-sm font-medium text-white">{route.expectedMarkerStrategy}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{route.check}</p>
                <p className="mt-3 text-xs leading-5 text-amber-100/80">{route.fallbackDiagnosis}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="cache and deployment diagnosis" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
            <div className="grid gap-3 md:grid-cols-2">
              <ListBlock title="cache diagnostics" items={model.cacheDiagnostics} />
              <ListBlock title="Vercel deployment check notes" items={model.vercelDeploymentNotes} />
            </div>
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
          <p className="mt-3 text-xs text-slate-500">Package 211 не начинается автоматически из этой страницы.</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">StartApp Diagnostics</Link>
            <Link href="/dashboard/networks/zodiac/visual-issue-triage-board" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Visual Issue Triage Board</Link>
            <Link href="/dashboard/networks/zodiac/real-device-visual-qa-checklist" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Real Device Visual QA</Link>
            <Link href="/miniapp" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mini App hub</Link>
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
      <div className={`mt-2 break-words text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
