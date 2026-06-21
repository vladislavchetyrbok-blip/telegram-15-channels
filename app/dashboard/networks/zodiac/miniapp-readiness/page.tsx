import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import {
  miniappReadinessRoutes,
  miniappReadinessPackages,
  miniappReadinessRisks,
} from "@/lib/zodiac/zodiac-miniapp-readiness-summary";

export const metadata: Metadata = {
  title: "Mini App Readiness Summary | Zodiac Dashboard",
  description: "Read-only summary of Zodiac Mini App mock system readiness.",
};

const statusColors = {
  "existing": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "active-mock": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "preview-only": "bg-violet-500/10 text-violet-500 border-violet-500/20",
  "dashboard-readiness": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};

const riskStatusColors = {
  "protected": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "blocked": "bg-red-500/10 text-red-500 border-red-500/20",
  "future-only": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "needs-review": "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export default function MiniAppReadinessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <Link href="/dashboard/networks/zodiac" className="rounded-full p-2 transition hover:bg-slate-800">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Mini App Readiness Summary</h1>
            <p className="text-sm text-slate-400">Post-Packages 103–111 Baseline</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 space-y-12">
        
        {/* System Readiness Classification */}
        <section className="rounded-lg border border-emerald-900/30 bg-emerald-900/10 p-6 flex items-start gap-4">
          <ShieldCheck className="h-8 w-8 text-emerald-500 mt-1 shrink-0" />
          <div>
            <h2 className="text-xl font-medium text-emerald-400">System Readiness Classification</h2>
            <p className="mt-2 text-lg font-bold text-emerald-100">Mock-ready / QA-protected / Not production-monetized</p>
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
                <li>No cron/workflow/publish script changes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Current Mini App Routes */}
        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Current Mini App Routes
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Route</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Introduced</th>
                    <th className="px-4 py-3 font-medium">QA Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {miniappReadinessRoutes.map((route, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-300">
                        <code>{route.route}</code>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{route.title}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusColors[route.status]}`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{route.packageIntroduced}</td>
                      <td className="px-4 py-3 text-slate-400">{route.qaCoverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Package Timeline */}
        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Package Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {miniappReadinessPackages.map((pkg, idx) => (
              <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-xs font-bold text-violet-400 mb-1">Package {pkg.packageNumber}</div>
                <h4 className="text-sm font-semibold text-slate-200 mb-2">{pkg.title}</h4>
                <p className="text-xs text-slate-400 mb-2">{pkg.result}</p>
                <div className="text-[11px] text-emerald-500/80 bg-emerald-950/30 inline-block px-2 py-0.5 rounded border border-emerald-900/30">
                  {pkg.safetyImpact}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Safety & Risks */}
        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" /> Risks & Blockers
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Area</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Safe Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {miniappReadinessRisks.map((risk, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-300">{risk.area}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${riskStatusColors[risk.status]}`}>
                          {risk.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{risk.reason}</td>
                      <td className="px-4 py-3 text-slate-400">{risk.safeNextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Blocked Until Future Approval */}
        <section className="rounded-lg border border-red-900/30 bg-red-900/10 p-6 flex items-start gap-4">
          <Lock className="h-6 w-6 text-red-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-red-400 mb-2">Blocked Until Future Approval</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-500/80">
              <li>Real payment implementation</li>
              <li>Entitlement model</li>
              <li>Profile storage</li>
              <li>Privacy / refund / access rules</li>
              <li>Telegram Mini App production launch wiring</li>
              <li>Live CTA publishing changes</li>
            </ul>
          </div>
        </section>

        {/* Related Dashboard Links */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/30 p-6">
          <h3 className="text-lg font-medium text-slate-300 mb-3">Related Dashboards</h3>
          <ul className="flex flex-wrap gap-4 text-sm">
            <li><Link href="/dashboard/networks/zodiac/miniapp-route-safety" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">View Route Safety</Link></li>
            <li><Link href="/dashboard/networks/zodiac/miniapp-cta-audit" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">View CTA Audit</Link></li>
            <li><Link href="/dashboard/networks/zodiac/miniapp-architecture" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4">Architecture Spec</Link></li>
            <li><Link href="/dashboard/networks/zodiac/stability" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4">Stability Matrix</Link></li>
            <li><Link href="/dashboard/networks/zodiac/miniapp-link-smoke" className="text-purple-400 hover:text-purple-300 transition underline underline-offset-4">Link Smoke Matrix</Link></li>
            <li><Link href="/dashboard/networks/zodiac/compatibility-flow-safety" className="text-purple-400 hover:text-purple-300 transition underline underline-offset-4">Compatibility Flow Safety</Link></li>
          </ul>
        </section>

        {/* Recommended Next Packages */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/30 p-6">
          <h3 className="text-lg font-medium text-slate-300 mb-3">Recommended Next Packages</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><strong>Package 113</strong> — Mini App Internal Link Smoke Matrix</li>
            <li><strong>Package 114</strong> — Compatibility Flow Safety Audit</li>
            <li><strong>Package 115</strong> — Mini App Production Monetization Architecture</li>
          </ul>
        </section>

      </main>
    </div>
  );
}
