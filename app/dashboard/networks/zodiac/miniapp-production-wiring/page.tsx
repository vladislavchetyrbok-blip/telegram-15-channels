import React from "react";
import Link from "next/link";
import { Shield, ShieldAlert, PlugZap, Code2 } from "lucide-react";
import { WIRING_STAGES, ENV_VARIABLES_REQUIRED, WIRING_RISK_CONTROLS } from "@/lib/zodiac/zodiac-miniapp-production-wiring";

export const metadata = {
  title: "Mini App Production Wiring Spec",
};

export default function MiniAppProductionWiringPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <PlugZap className="h-8 w-8 text-fuchsia-500" />
          Mini App Production Wiring Spec
        </h1>
        <p className="text-slate-400 mt-2">
          Architecture specification for transitioning to live Telegram WebApp SDK.
        </p>
      </header>

      <div className="rounded-md bg-amber-950/40 border border-amber-900/50 p-4 mb-8">
        <div className="flex items-center gap-2 text-amber-500 font-semibold mb-2">
          <ShieldAlert className="h-5 w-5" />
          Wiring Spec Only / Mock Mode Active
        </div>
        <ul className="text-sm text-slate-300 list-disc pl-5 space-y-1">
          <li>No Telegram API connections made</li>
          <li>No initData validation implemented</li>
          <li>No auth routes created</li>
          <li>Safe for local development</li>
        </ul>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-fuchsia-400" />
          Wiring Implementation Stages
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {WIRING_STAGES.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-100">{item.stage}</h3>
                <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-slate-800 text-slate-400 uppercase">
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">{item.description}</p>
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Requirements:</span>
                  <ul className="mt-1 list-disc pl-4 text-xs text-slate-300 space-y-1">
                    {item.requirements.map(req => <li key={req}>{req}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Environment Variables Required
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ENV_VARIABLES_REQUIRED.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
              <h3 className="font-mono text-sm font-semibold text-sky-400 mb-2 truncate" title={item.name}>{item.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{item.purpose}</p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-rose-500/80 uppercase tracking-wider font-semibold block mb-1">Security Risk:</span>
                <p className="text-xs text-slate-300">{item.risk}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Wiring Risk Controls
        </h2>
        <div className="space-y-3">
          {WIRING_RISK_CONTROLS.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 flex gap-4 items-start">
              <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-slate-200 text-sm">{item.control}</h3>
                <p className="text-sm text-slate-400 mt-1">{item.reason}</p>
              </div>
              <div className="ml-auto shrink-0">
                <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-emerald-900/40 text-emerald-400">
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
          <li><Link href="/dashboard/networks/zodiac/miniapp-entitlements" className="text-sky-400 hover:text-sky-300 transition underline underline-offset-4">Entitlement Model</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-monetization-architecture" className="text-amber-400 hover:text-amber-300 transition underline underline-offset-4">Monetization Architecture</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-architecture" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4">Architecture Spec</Link></li>
        </ul>
      </section>
    </div>
  );
}
