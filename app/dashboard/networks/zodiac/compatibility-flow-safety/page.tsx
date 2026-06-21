import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, ShieldAlert, CheckCircle2, Lock, ArrowRight, Route } from "lucide-react";
import {
  compatibilityFlowSteps,
  compatibilityFlowCtas,
  compatibilityFlowRisks,
} from "@/lib/zodiac/zodiac-compatibility-flow-safety";

export const metadata: Metadata = {
  title: "Compatibility Flow Safety Audit | Zodiac Dashboard",
  description: "Read-only audit of Zodiac Compatibility flow safety boundaries.",
};

const statusColors = {
  "existing": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "mock-safe": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "preview-only": "bg-violet-500/10 text-violet-500 border-violet-500/20",
  "dashboard-readiness": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  "needs-review": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "future-only": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "protected": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "blocked": "bg-red-500/10 text-red-500 border-red-500/20",
  "safe": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export default function CompatibilityFlowSafetyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <Link href="/dashboard/networks/zodiac" className="rounded-full p-2 transition hover:bg-slate-800">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Compatibility Flow Safety Audit</h1>
            <p className="text-sm text-slate-400">Package 114 Baseline</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 space-y-12">
        
        {/* System Classification */}
        <section className="rounded-lg border border-emerald-900/30 bg-emerald-900/10 p-6 flex items-start gap-4">
          <ShieldCheck className="h-8 w-8 text-emerald-500 mt-1 shrink-0" />
          <div>
            <h2 className="text-xl font-medium text-emerald-400">System Readiness Classification</h2>
            <p className="mt-2 text-lg font-bold text-emerald-100">Compatibility flow audit only / No scoring engine changes / No live CTA changes</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-500/80">
              <ul className="list-disc list-inside space-y-1">
                <li>No payment integration</li>
                <li>No real VIP access</li>
                <li>No subscription logic</li>
                <li>No database write</li>
              </ul>
              <ul className="list-disc list-inside space-y-1">
                <li>No Telegram API call</li>
                <li>No active Telegram CTA logic changed</li>
                <li>No production compatibility engine changes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Compatibility Flow Steps */}
        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Route className="h-5 w-5 text-emerald-500" /> Flow Steps Map
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Step</th>
                    <th className="px-4 py-3 font-medium">Route</th>
                    <th className="px-4 py-3 font-medium">Purpose</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Safety Boundary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {compatibilityFlowSteps.map((step, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-300 whitespace-nowrap">{step.step}</td>
                      <td className="px-4 py-3 font-medium text-slate-400 whitespace-nowrap">
                        <code>{step.route}</code>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{step.purpose}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusColors[step.currentStatus] || statusColors["needs-review"]}`}>
                          {step.currentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ul className="list-disc list-inside text-slate-400 text-xs space-y-1">
                          {step.safetyBoundary.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Compatibility CTA Map
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">CTA</th>
                    <th className="px-4 py-3 font-medium">Destination</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Safety Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {compatibilityFlowCtas.map((cta, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-400 whitespace-nowrap"><code>{cta.sourceRoute}</code></td>
                      <td className="px-4 py-3 text-slate-200">{cta.label}</td>
                      <td className="px-4 py-3 text-slate-400">
                        <div className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          <code>{cta.destinationRoute}</code>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{cta.ctaType}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusColors[cta.safetyStatus] || statusColors["needs-review"]}`}>
                          {cta.safetyStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Risks and Blockers */}
        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" /> Known Risks & Safe Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compatibilityFlowRisks.map((risk, idx) => (
              <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-200">{risk.area}</div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusColors[risk.status] || statusColors["needs-review"]}`}>
                    {risk.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-3">{risk.reason}</p>
                <div className="text-xs text-emerald-500/80 bg-emerald-950/30 inline-block px-2 py-1 rounded border border-emerald-900/30">
                  <span className="font-semibold">Safe Action:</span> {risk.safeNextAction}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Future Blockers */}
        <section className="rounded-lg border border-red-900/30 bg-red-900/10 p-6 flex items-start gap-4">
          <Lock className="h-6 w-6 text-red-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-red-400 mb-2">Blocked Until Production Architecture</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-500/80">
              <li>Real compatibility scoring engine connection</li>
              <li>VIP paywalls for detailed compat breakdowns</li>
              <li>Relationship graph persistence</li>
              <li>Live Telegram CTA publishing changes</li>
            </ul>
          </div>
        </section>

      </main>
    </div>
  );
}
