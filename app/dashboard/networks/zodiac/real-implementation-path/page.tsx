import React from "react";
import Link from "next/link";
import { 
  GitBranch, 
  ShieldCheck, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Lock, 
  UserCircle 
} from "lucide-react";
import { 
  REAL_IMPLEMENTATION_PHASES, 
  REAL_IMPLEMENTATION_RISKS, 
  CURRENT_IMPLEMENTATION_DECISION 
} from "@/lib/zodiac/zodiac-real-implementation-path";

export const metadata = {
  title: "Real Implementation Path",
};

export default function RealImplementationPathPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="mb-8 border-b border-indigo-900/50 pb-6">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <GitBranch className="h-8 w-8 text-indigo-400" />
          Real Implementation Path
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Guiding the transition from architecture design to live backend implementation.
        </p>
      </header>

      <div className="rounded-md bg-indigo-950/30 border border-indigo-900/50 p-6 mb-8">
        <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4 text-xl">
          <ShieldCheck className="h-6 w-6" />
          Selected path / Telegram identity first / No payments yet
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
        <h2 className="text-2xl font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-blue-400" />
          Decision: {CURRENT_IMPLEMENTATION_DECISION.decision}
        </h2>
        <p className="text-slate-300 leading-relaxed max-w-4xl">
          {CURRENT_IMPLEMENTATION_DECISION.reason}
        </p>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-indigo-400" />
          Implementation Roadmap (Packages 123–131)
        </h2>
        <div className="space-y-4">
          {REAL_IMPLEMENTATION_PHASES.map((phase) => (
            <div 
              key={phase.packageNumber} 
              className={`p-5 rounded-lg border ${
                phase.status === 'selected' ? 'border-indigo-500/50 bg-indigo-950/40 relative overflow-hidden' :
                phase.status === 'next' ? 'border-sky-900/50 bg-sky-950/20' :
                phase.status === 'future' ? 'border-slate-800 bg-slate-900/30' :
                'border-rose-900/30 bg-rose-950/10 opacity-75'
              }`}
            >
              {phase.status === 'selected' && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg">
                  Next Package
                </div>
              )}
              
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-200">
                  <span className="text-slate-500 mr-2">{`Package ${phase.packageNumber}:`}</span>
                  {phase.title}
                </h3>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                  phase.status === 'selected' ? 'bg-indigo-900 text-indigo-300' :
                  phase.status === 'next' ? 'bg-sky-900 text-sky-300' :
                  phase.status === 'future' ? 'bg-slate-800 text-slate-400' :
                  'bg-rose-900/50 text-rose-400 flex items-center gap-1'
                }`}>
                  {phase.status === 'blocked' && <Lock className="h-3 w-3" />}
                  {phase.status}
                </span>
              </div>
              
              <p className="text-sm text-slate-400 mb-4">{phase.purpose}</p>

              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/50">
                {phase.allowedWork.length > 0 && (
                  <div>
                    <span className="text-xs text-emerald-500 font-semibold block mb-2 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Allowed Next
                    </span>
                    <ul className="list-disc pl-4 text-sm text-slate-300 space-y-1">
                      {phase.allowedWork.map(w => <li key={w}>{w}</li>)}
                    </ul>
                  </div>
                )}
                {phase.forbiddenWork.length > 0 && (
                  <div>
                    <span className="text-xs text-rose-500 font-semibold block mb-2 uppercase tracking-wider flex items-center gap-1">
                      <Circle className="h-3 w-3" /> Forbidden Next
                    </span>
                    <ul className="list-disc pl-4 text-sm text-slate-400 space-y-1">
                      {phase.forbiddenWork.map(w => <li key={w}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Risk Controls
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {REAL_IMPLEMENTATION_RISKS.map((risk, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-300">{risk.area}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                  risk.riskLevel === 'critical' ? 'bg-rose-900/40 text-rose-400' :
                  risk.riskLevel === 'high' ? 'bg-orange-900/40 text-orange-400' :
                  'bg-amber-900/40 text-amber-400'
                }`}>
                  {risk.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{risk.reason}</p>
              <div className="text-xs font-medium text-emerald-400/90 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                {risk.requiredControl}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/30 p-6 mt-8">
        <h3 className="text-lg font-medium text-slate-300 mb-3">Safe Navigation</h3>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li><Link href="/dashboard/networks/zodiac" className="text-blue-400 hover:text-blue-300 transition underline underline-offset-4">Zodiac Dashboard</Link></li>
          <li><Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-rose-400 hover:text-rose-300 transition underline underline-offset-4">Owner Review Gate</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-master-index" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4">Master Index</Link></li>
          <li><Link href="/dashboard/networks/zodiac/miniapp-readiness" className="text-sky-400 hover:text-sky-300 transition underline underline-offset-4">Readiness Summary</Link></li>
          <li><Link href="/dashboard/networks/zodiac/stability" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">Stability</Link></li>
          <li><Link href="/dashboard/networks/zodiac/telegram-initdata-validation" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">Telegram initData Validation</Link></li>
          <li><Link href="/dashboard/networks/zodiac/user-profile-foundation" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">User Profile Foundation</Link></li>
          <li><Link href="/dashboard/networks/zodiac/product-catalog-foundation" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">Product Catalog Foundation</Link></li>
          <li><Link href="/dashboard/networks/zodiac/entitlement-foundation" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">Entitlement Foundation</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-access-boundary" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">VIP Access Boundary</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">VIP Compatibility Report</Link></li>
        </ul>
      </section>
    </div>
  );
}
