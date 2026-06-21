import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ArrowRight, ShieldCheck, Link2 } from "lucide-react";
import { miniappCtaAuditBaseline } from "@/lib/zodiac/zodiac-miniapp-cta-audit";

export const metadata: Metadata = {
  title: "Mini App CTA Audit | Zodiac Dashboard",
  description: "Read-only audit of CTA consistency across the Zodiac Mini App.",
};

const statusColors = {
  safe: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "needs-review": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "future-only": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function MiniAppCtaAuditPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <Link href="/dashboard/networks/zodiac" className="rounded-full p-2 transition hover:bg-slate-800">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Mini App CTA Consistency Audit</h1>
            <p className="text-sm text-slate-400">Package 111 Baseline</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="mb-8 rounded-lg border border-emerald-900/30 bg-emerald-900/10 p-4 flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-lg font-medium text-emerald-400">Safe UI Boundary</h2>
            <p className="mt-1 text-sm text-emerald-500/80">
              All listed CTAs are verified to be non-transactional and safe for mock routes. 
              No active Telegram publishing logic or payment integrations are linked.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Source Route</th>
                  <th className="px-4 py-3 font-medium">CTA Label</th>
                  <th className="px-4 py-3 font-medium">Destination</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Safety Status</th>
                  <th className="px-4 py-3 font-medium w-1/3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {miniappCtaAuditBaseline.map((item, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Link2 className="h-3.5 w-3.5 text-slate-500" />
                        {item.sourceRoute}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200">
                      "{item.label}"
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                        {item.destination}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
                        {item.ctaType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusColors[item.safetyStatus]}`}>
                        {item.safetyStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs leading-relaxed">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
