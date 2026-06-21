import React from "react";
import Link from "next/link";
import { Shield, ShieldAlert, Coins } from "lucide-react";
import { MONETIZATION_AREAS, MONETIZATION_RISK_CONTROLS } from "@/lib/zodiac/zodiac-miniapp-monetization-architecture";

export const metadata = {
  title: "Mini App Monetization Architecture",
};

export default function MiniAppMonetizationArchitecturePage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Coins className="h-8 w-8 text-amber-500" />
          Mini App Monetization Architecture
        </h1>
        <p className="text-slate-400 mt-2">
          Architecture only / No payment implementation / No VIP unlock
        </p>
      </header>

      <div className="rounded-md bg-amber-950/40 border border-amber-900/50 p-4 mb-8">
        <div className="flex items-center gap-2 text-amber-500 font-semibold mb-2">
          <ShieldAlert className="h-5 w-5" />
          Monetization Spec Only / No real payments
        </div>
        <ul className="text-sm text-slate-300 list-disc pl-5 space-y-1">
          <li>no payment</li>
          <li>no real VIP access</li>
          <li>no subscription logic</li>
          <li>no database write</li>
          <li>no Telegram API call</li>
          <li>no active Telegram CTA logic changed</li>
        </ul>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Monetization Areas
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {MONETIZATION_AREAS.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-100">{item.area}</h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-400">
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">{item.purpose}</p>
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Required Before Implementation:</span>
                  <ul className="mt-1 list-disc pl-4 text-xs text-slate-400">
                    {item.requiredBeforeImplementation.map(req => <li key={req}>{req}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Forbidden in Current Stage:</span>
                  <ul className="mt-1 list-disc pl-4 text-xs text-red-400/80">
                    {item.forbiddenInCurrentStage.map(req => <li key={req}>{req}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-xs text-emerald-500/80 uppercase tracking-wider font-semibold">Safe Next Action:</span>
                  <p className="mt-1 text-xs text-slate-300">{item.safeNextAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Monetization Risk Controls
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {MONETIZATION_RISK_CONTROLS.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-100">{item.risk}</h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-900/40 text-emerald-400">
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-2">{item.reason}</p>
              <div className="text-sm text-emerald-400/90 border-t border-slate-800/60 pt-2 mt-2">
                <strong>Control:</strong> {item.control}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <section className="rounded-lg border border-slate-800 bg-slate-900/30 p-6 mt-8">
        <h3 className="text-lg font-medium text-slate-300 mb-3">Related Dashboards</h3>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li><Link href="/dashboard/networks/zodiac" className="text-blue-400 hover:text-blue-300 transition underline underline-offset-4">Zodiac Dashboard</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-readiness" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">Readiness Summary</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-architecture" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4">Architecture Spec</Link></li>
          <li><Link href="/dashboard/networks/zodiac/stability" className="text-purple-400 hover:text-purple-300 transition underline underline-offset-4">Stability Matrix</Link></li>
        </ul>
      </section>
    </div>
  );
}
