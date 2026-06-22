import React from "react";
import Link from "next/link";
import { Lock, ShieldAlert, CheckCircle2, Circle, AlertTriangle, AlertOctagon } from "lucide-react";
import { OWNER_REVIEW_AREAS, OWNER_DECISION_OPTIONS } from "@/lib/zodiac/zodiac-owner-review-gate";

export const metadata = {
  title: "Owner Review Gate Before Real Implementation",
};

export default function OwnerReviewGatePage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="mb-8 border-b border-rose-900/50 pb-6">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Lock className="h-8 w-8 text-rose-500" />
          Owner Review Gate Before Real Implementation
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Strict isolation boundary. The system is currently in a safe, mock-only state.
        </p>
      </header>

      <div className="rounded-md bg-rose-950/40 border border-rose-900/50 p-6 mb-8">
        <div className="flex items-center gap-2 text-rose-500 font-bold mb-4 text-xl">
          <ShieldAlert className="h-6 w-6" />
          Owner approval required / No real implementation / No production changes
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No payment</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No real VIP access</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No subscription logic</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No database write</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No Telegram API call</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No active Telegram CTA logic changed</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No production launch</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No workflow/cron/publish script changes</div>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Current System State (Packages 103–120)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400 border-collapse">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold border-b border-slate-800">Review Area</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-800">Status</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-800">Blocked Until</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-800">Safe Next Action</th>
              </tr>
            </thead>
            <tbody>
              {OWNER_REVIEW_AREAS.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition">
                  <td className="px-4 py-3 font-medium text-slate-300">
                    {item.area}
                    <div className="text-xs text-slate-600 mt-1">
                      {item.evidence.map(e => <span key={e} className="mr-2 inline-block font-mono bg-slate-900 px-1 rounded">{e}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                      item.currentStatus === 'complete' ? 'bg-emerald-900/40 text-emerald-400' :
                      item.currentStatus === 'mock-only' ? 'bg-indigo-900/40 text-indigo-400' :
                      item.currentStatus === 'architecture-only' ? 'bg-amber-900/40 text-amber-400' :
                      item.currentStatus === 'requires-owner-approval' ? 'bg-rose-900/40 text-rose-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {item.currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.blockedUntil.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1 text-rose-400/80">
                        {item.blockedUntil.map(b => <li key={b}>{b}</li>)}
                      </ul>
                    ) : (
                      <span className="text-slate-600 italic">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-emerald-400/80">{item.safeNextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
          <AlertOctagon className="h-6 w-6 text-amber-500" />
          Owner Decision Required: Next Phase Options
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {OWNER_DECISION_OPTIONS.map((item, idx) => (
            <div key={idx} className={`p-5 rounded-xl border ${
              item.riskLevel === 'critical' ? 'border-rose-900/50 bg-rose-950/20' :
              item.riskLevel === 'high' ? 'border-orange-900/50 bg-orange-950/20' :
              item.riskLevel === 'medium' ? 'border-amber-900/50 bg-amber-950/20' :
              'border-emerald-900/50 bg-emerald-950/20'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-slate-500 font-bold bg-slate-900 px-2 py-1 rounded">
                  Option {item.recommendedOrder}
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                  item.riskLevel === 'critical' ? 'bg-rose-900/40 text-rose-400' :
                  item.riskLevel === 'high' ? 'bg-orange-900/40 text-orange-400' :
                  item.riskLevel === 'medium' ? 'bg-amber-900/40 text-amber-400' :
                  'bg-emerald-900/40 text-emerald-400'
                }`}>
                  Risk: {item.riskLevel}
                </span>
              </div>
              <h3 className="font-semibold text-slate-200 text-lg mb-2">{item.option}</h3>
              <p className="text-sm text-slate-400 mb-4">{item.description}</p>
              
              {item.requiresBeforeStart.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-amber-500/80 uppercase tracking-wider font-semibold block mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Requires Before Start:
                  </span>
                  <ul className="list-disc pl-4 text-xs text-amber-200/60 space-y-0.5">
                    {item.requiresBeforeStart.map(r => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              )}

              {item.forbiddenWithoutApproval.length > 0 && (
                <div>
                  <span className="text-xs text-rose-500/80 uppercase tracking-wider font-semibold block mb-1 flex items-center gap-1">
                    <Circle className="h-3 w-3" /> Forbidden Without Approval:
                  </span>
                  <ul className="list-disc pl-4 text-xs text-rose-200/60 space-y-0.5">
                    {item.forbiddenWithoutApproval.map(r => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/30 p-6 mt-8">
        <h3 className="text-lg font-medium text-slate-300 mb-3">Safe Navigation</h3>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li><Link href="/dashboard/networks/zodiac/real-implementation-path" className="text-amber-400 hover:text-amber-300 transition underline underline-offset-4">Real Implementation Path</Link></li>
          <li><Link href="/dashboard/networks/zodiac" className="text-blue-400 hover:text-blue-300 transition underline underline-offset-4">Zodiac Dashboard</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-master-index" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4">Master Index</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-readiness" className="text-sky-400 hover:text-sky-300 transition underline underline-offset-4">Readiness Summary</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-risk-register" className="text-red-400 hover:text-red-300 transition underline underline-offset-4">Risk Register</Link></li>
          <li><Link href="/dashboard/networks/zodiac/stability" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">Stability</Link></li>
          <li><Link href="/dashboard/networks/zodiac/telegram-initdata-validation" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">Telegram initData Validation</Link></li>
          <li><Link href="/dashboard/networks/zodiac/user-profile-foundation" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">User Profile Foundation</Link></li>
        </ul>
      </section>
    </div>
  );
}
