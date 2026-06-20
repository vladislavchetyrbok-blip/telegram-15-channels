import {
  Banknote,
  CheckCircle2,
  Lock,
  LockKeyhole,
  FileText,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export const dynamic = "force-dynamic";

interface CurrencyRate {
  pair: string;
  rate: number;
  change: number;
  trend: "up" | "down" | "flat";
}

const MOCK_RATES: CurrencyRate[] = [
  { pair: "EUR/USD", rate: 1.0854, change: 0.0021, trend: "up" },
  { pair: "GBP/USD", rate: 1.2643, change: -0.0015, trend: "down" },
  { pair: "USD/JPY", rate: 151.20, change: 0.45, trend: "up" },
  { pair: "USD/CHF", rate: 0.8992, change: -0.0008, trend: "down" },
  { pair: "AUD/USD", rate: 0.6541, change: 0.0012, trend: "up" },
];

import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export default function AphroditeCurrencyPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/currency");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <AphroditePageHeader
          title="Currency Exchange Module"
          description="Fiat exchange rates, central bank updates, and currency publishing pipelines."
          badgeText="Currency"
          icon={Banknote}
          safetyLocked={false}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-slate-400" />
                  Live Market Rates
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-[10px] font-medium text-slate-300 uppercase tracking-wider">
                  Mock Data
                </span>
              </div>
              
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_RATES.map((rate) => (
                  <div key={rate.pair} className="rounded-xl border border-slate-800/50 bg-slate-800/20 p-4 hover:border-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">{rate.pair}</span>
                      {rate.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      ) : rate.trend === "down" ? (
                        <ArrowDownRight className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Activity className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-white">{rate.rate.toFixed(4)}</span>
                      <span className={`text-xs font-medium ${rate.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {rate.trend === 'up' ? '+' : ''}{rate.change.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-emerald-500/20 bg-[#0f1b33] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Lock className="h-24 w-24" />
              </div>
              <h2 className="text-base font-semibold text-emerald-300 mb-5 flex items-center gap-2">
                <LockKeyhole className="h-5 w-5" />
                Module Safety
              </h2>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">API connections mocked</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">Live publishing locked</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">Read-only operator view</span>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-400" />
                Module Status
              </h2>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                The Currency Module is currently in a draft state. Exchange rates shown are static placeholders for UI validation.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
