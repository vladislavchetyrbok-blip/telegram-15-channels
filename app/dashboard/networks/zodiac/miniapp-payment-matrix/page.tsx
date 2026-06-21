import React from "react";
import Link from "next/link";
import { ShieldAlert, CreditCard, Coins } from "lucide-react";
import { PAYMENT_PROVIDERS, PAYMENT_DECISION_RULES } from "@/lib/zodiac/zodiac-miniapp-payment-matrix";

export const metadata = {
  title: "Mini App Payment Provider Matrix",
};

export default function MiniAppPaymentMatrixPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-fuchsia-500" />
          Payment Provider Decision Matrix
        </h1>
        <p className="text-slate-400 mt-2">
          Evaluation of Telegram Stars vs External Providers.
        </p>
      </header>

      <div className="rounded-md bg-amber-950/40 border border-amber-900/50 p-4 mb-8">
        <div className="flex items-center gap-2 text-amber-500 font-semibold mb-2">
          <ShieldAlert className="h-5 w-5" />
          Decision Matrix Only / Mock Mode Active
        </div>
        <ul className="text-sm text-slate-300 list-disc pl-5 space-y-1">
          <li>No payment SDKs loaded</li>
          <li>No checkout flows active</li>
          <li>No live API connections</li>
          <li>Safe for architectural review</li>
        </ul>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
          <Coins className="h-5 w-5 text-fuchsia-400" />
          Provider Evaluation
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PAYMENT_PROVIDERS.map((item, idx) => (
            <div key={idx} className="p-5 rounded-lg border border-slate-800 bg-slate-900/50 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="font-bold text-lg text-slate-100">{item.provider}</h3>
                <span className="px-2 py-1 mt-1 inline-block text-[10px] font-medium rounded-full bg-slate-800 text-slate-400 uppercase">
                  {item.type}
                </span>
              </div>
              
              <div className="space-y-4 flex-grow">
                <div>
                  <span className="text-xs text-emerald-500/80 uppercase tracking-wider font-semibold">Pros:</span>
                  <ul className="mt-1 list-disc pl-4 text-xs text-slate-300 space-y-1">
                    {item.pros.map(pro => <li key={pro}>{pro}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-xs text-rose-500/80 uppercase tracking-wider font-semibold">Cons:</span>
                  <ul className="mt-1 list-disc pl-4 text-xs text-slate-300 space-y-1">
                    {item.cons.map(con => <li key={con}>{con}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Complexity:</span>
                  <span className={`font-medium ${item.complexity === 'High' ? 'text-rose-400' : item.complexity === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {item.complexity}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Fees:</span>
                  <span className="font-medium text-slate-200">{item.fees}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="block text-xs text-fuchsia-400/80 uppercase tracking-wider font-semibold mb-1">Recommendation:</span>
                <p className="text-sm text-fuchsia-200">{item.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Decision Rules & Policy
        </h2>
        <div className="space-y-3">
          {PAYMENT_DECISION_RULES.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
              <h3 className="font-medium text-slate-200 mb-1">{item.rule}</h3>
              <p className="text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/30 p-6 mt-8">
        <h3 className="text-lg font-medium text-slate-300 mb-3">Related Dashboards</h3>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li><Link href="/dashboard/networks/zodiac" className="text-blue-400 hover:text-blue-300 transition underline underline-offset-4">Zodiac Dashboard</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-monetization-architecture" className="text-amber-400 hover:text-amber-300 transition underline underline-offset-4">Monetization Architecture</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-production-wiring" className="text-fuchsia-400 hover:text-fuchsia-300 transition underline underline-offset-4">Production Wiring</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-risk-register" className="text-red-400 hover:text-red-300 transition underline underline-offset-4">Risk Register</Link></li>
        </ul>
      </section>
    </div>
  );
}
