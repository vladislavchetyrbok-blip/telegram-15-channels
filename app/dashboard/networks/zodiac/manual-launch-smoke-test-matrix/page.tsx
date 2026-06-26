import Link from "next/link";
import { ClipboardCheck, ListChecks, MonitorSmartphone, Rocket, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_RULE,
  getAphroditeManualLaunchSmokeTestMatrix,
} from "@/lib/zodiac/aphrodite-manual-launch-smoke-test-matrix";

const smokeMatrix = getAphroditeManualLaunchSmokeTestMatrix();

export const metadata = {
  title: smokeMatrix.title,
};

export default function AphroditeManualLaunchSmokeTestMatrixPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <ClipboardCheck className="h-4 w-4" />
            <span>Aphrodite / Manual launch smoke matrix / Package 195</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{smokeMatrix.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{smokeMatrix.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Matrix фиксирует ручные проверки iPhone Telegram Mini App, Android Telegram Mini App, desktop Telegram,
            browser fallback, /miniapp, /miniapp/love-reading-preview, compatibility, birth matrix, 30 days couple,
            analytics noop, fallback routes и production safety blocked state.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {smokeMatrix.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="manual tests" value={String(smokeMatrix.summary.smokeTestsCount)} />
          <Metric label="blocked now" value={String(smokeMatrix.summary.blockedTestsCount)} tone="amber" />
          <Metric label="owner review" value={String(smokeMatrix.summary.ownerReviewTestsCount)} tone="amber" />
          <Metric label="launchApprovedNow" value={String(smokeMatrix.launchApprovedNow)} tone="rose" />
        </section>

        <ReviewSection title="manual smoke tests" icon={<MonitorSmartphone className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {smokeMatrix.smokeTests.map((test) => (
              <article key={test.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-medium text-white">{test.label}</h2>
                  <span className="rounded-md border border-amber-900/50 bg-amber-950 px-2 py-0.5 text-[11px] text-amber-200">
                    manual
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-slate-500">{test.routeOrContext}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{test.expectedResult}</p>
                <p className="mt-3 font-mono text-[11px] text-emerald-300">{test.source}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {smokeMatrix.boundaries.map((boundary) => (
                <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{boundary.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="launch flags" icon={<Rocket className="h-5 w-5 text-cyan-400" />}>
            <div className="grid gap-3 md:grid-cols-2">
              <Metric label="productionLaunchNow" value={String(smokeMatrix.productionLaunchNow)} tone="rose" />
              <Metric label="telegramApiNow" value={String(smokeMatrix.telegramApiNow)} tone="rose" />
              <Metric label="messageSendingNow" value={String(smokeMatrix.messageSendingNow)} tone="rose" />
              <Metric label="activeCtaChangedNow" value={String(smokeMatrix.activeCtaChangedNow)} tone="rose" />
              <Metric label="paymentEnabledNow" value={String(smokeMatrix.paymentEnabledNow)} tone="rose" />
              <Metric label="vipUnlockNow" value={String(smokeMatrix.vipUnlockNow)} tone="rose" />
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="next recommended package" icon={<ListChecks className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{smokeMatrix.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/product-copy-final-polish" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Product Copy Polish</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-checklist-refresh" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Public Launch Checklist</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-visual-readiness-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Visual Launch Review</Link>
            <Link href="/dashboard/networks/zodiac/production-payment-safety-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Production Safety Gate</Link>
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
