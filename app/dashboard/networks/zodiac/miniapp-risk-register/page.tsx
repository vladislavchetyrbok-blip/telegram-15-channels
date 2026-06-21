import React from "react";
import Link from "next/link";
import { AlertOctagon, ShieldAlert, GitCommit, CheckCircle2, Circle } from "lucide-react";
import { RISK_REGISTER, ROLLOUT_GATES } from "@/lib/zodiac/zodiac-miniapp-risk-register";

export const metadata = {
  title: "Mini App Risk Register & Gates",
};

export default function MiniAppRiskRegisterPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <AlertOctagon className="h-8 w-8 text-rose-500" />
          Production Risk Register & Gates
        </h1>
        <p className="text-slate-400 mt-2">
          Critical risks and go/no-go gates for Mini App production launch.
        </p>
      </header>

      <div className="rounded-md bg-amber-950/40 border border-amber-900/50 p-4 mb-8">
        <div className="flex items-center gap-2 text-amber-500 font-semibold mb-2">
          <ShieldAlert className="h-5 w-5" />
          Documentation Only / Mock Mode Active
        </div>
        <ul className="text-sm text-slate-300 list-disc pl-5 space-y-1">
          <li>No live launch has occurred</li>
          <li>System remains in isolated mock state</li>
          <li>Gates are manually tracked</li>
        </ul>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-rose-400" />
          Critical Risk Register
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {RISK_REGISTER.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {item.category}
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                  item.severity === 'Critical' ? 'bg-rose-900/40 text-rose-400' :
                  item.severity === 'High' ? 'bg-orange-900/40 text-orange-400' :
                  'bg-amber-900/40 text-amber-400'
                }`}>
                  {item.severity}
                </span>
              </div>
              <h3 className="font-medium text-slate-100 text-lg mb-2">{item.risk}</h3>
              <p className="text-sm text-slate-400 mb-4">{item.description}</p>
              
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs text-emerald-500/80 uppercase tracking-wider font-semibold block mb-1">Mitigation:</span>
                <p className="text-sm text-slate-300">{item.mitigation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
          <GitCommit className="h-5 w-5 text-indigo-400" />
          Go/No-Go Rollout Gates
        </h2>
        <div className="space-y-3">
          {ROLLOUT_GATES.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-800 bg-slate-900/50 flex gap-4 items-start">
              {item.status === 'Passed' ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-6 w-6 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-grow">
                <h3 className={`font-medium text-lg ${item.status === 'Passed' ? 'text-slate-200' : 'text-slate-400'}`}>
                  {item.gate}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
              </div>
              <div className="shrink-0">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.status === 'Passed' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/30 p-6 mt-8">
        <h3 className="text-lg font-medium text-slate-300 mb-3">Related Dashboards</h3>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li><Link href="/dashboard/networks/zodiac" className="text-blue-400 hover:text-blue-300 transition underline underline-offset-4">Zodiac Dashboard</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-production-wiring" className="text-fuchsia-400 hover:text-fuchsia-300 transition underline underline-offset-4">Production Wiring</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-payment-matrix" className="text-rose-400 hover:text-rose-300 transition underline underline-offset-4">Payment Matrix</Link></li>
        </ul>
      </section>
    </div>
  );
}
