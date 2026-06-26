import Link from "next/link";
import { ClipboardCheck, ListChecks, MonitorSmartphone, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <MonitorSmartphone className="h-4 w-4" />
            <span>Aphrodite / Real device visual QA / Package 208</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{model.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{model.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Checklist фиксирует, что нужно вручную проверить на iPhone, Android, Telegram Desktop, браузерах, narrow screens,
            slow network mode, Telegram safe area, keyboard open state и back button behavior перед public launch review.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_REAL_DEVICE_VISUAL_QA_RULE}
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
          <Metric label="devices" value={String(model.devices.length)} />
          <Metric label="screens" value={String(model.screens.length)} />
          <Metric label="telegramApiUsed" value={String(model.launchFlags.telegramApiUsed)} tone="rose" />
          <Metric label="paymentAdded" value={String(model.launchFlags.paymentAdded)} tone="rose" />
        </section>

        <ReviewSection title="device checklist" icon={<MonitorSmartphone className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {model.devices.map((device) => (
              <article key={device.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{device.title}</h2>
                <p className="mt-1 font-mono text-xs text-slate-500">{device.environment}</p>
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
              <article key={screen.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h2 className="text-sm font-medium text-white">{screen.title}</h2>
                <p className="mt-1 font-mono text-xs text-slate-500">{screen.routeOrFlow}</p>
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

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-visual-readiness-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Visual Launch Review</Link>
            <Link href="/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">StartApp Diagnostics</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-visual-qa-consolidation" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mini App Visual QA</Link>
            <Link href="/dashboard/networks/zodiac/manual-launch-smoke-test-matrix" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Manual Smoke Test Matrix</Link>
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
