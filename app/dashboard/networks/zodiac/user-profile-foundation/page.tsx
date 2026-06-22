import React from "react";
import { AlertTriangle, ShieldCheck, Database, KeyRound, ServerCrash } from "lucide-react";
import Link from "next/link";
import { USER_PROFILE_FOUNDATION_ITEMS } from "@/lib/zodiac/zodiac-user-profile-foundation";

export default function UserProfileFoundationPage() {
  return (
    <div className="min-h-screen bg-[#070b14] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">User Profile Database Foundation</h1>
          <p className="text-slate-400">
            Profile foundation only / schema implementation pending / No payments / No VIP access
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-6">
            <h3 className="text-emerald-400 font-semibold flex items-center mb-4">
              <ShieldCheck className="w-5 h-5 mr-2" />
              What this does
            </h3>
            <ul className="space-y-2 text-sm text-emerald-200/70">
              <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Defines verified Telegram identity mapping</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Defines empty profile draft structure</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Uses validated Telegram identity as future source</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Prepares safe typed models</li>
            </ul>
          </div>

          <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-6">
            <h3 className="text-rose-400 font-semibold flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 mr-2" />
              What this does NOT do
            </h3>
            <ul className="space-y-2 text-sm text-rose-200/70">
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No live database migration executed</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No users created or sessions persisted</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No payment implementation</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No real VIP access</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No subscription logic</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No Telegram API call</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No bot sending logic modified</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No active Telegram CTA logic changed</li>
              <li className="flex items-start"><span className="text-rose-500 mr-2">•</span> No production launch</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-400" />
            Foundation Status
          </h2>
          <div className="space-y-4">
            {USER_PROFILE_FOUNDATION_ITEMS.map((item, idx) => (
              <div key={idx} className="p-4 rounded border border-slate-800 bg-slate-950/50 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-300">{item.area}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      item.status === 'typed-foundation-only' ? 'bg-sky-900/40 text-sky-400' :
                      item.status === 'schema-prepared' ? 'bg-amber-900/40 text-amber-400' :
                      item.status === 'future-only' ? 'bg-slate-800 text-slate-400' :
                      'bg-rose-900/40 text-rose-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{item.purpose}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {item.allowedNow.length > 0 && (
                      <div>
                        <span className="text-xs text-emerald-500/80 font-semibold mb-1 block">ALLOWED</span>
                        <ul className="text-xs text-slate-400 list-disc pl-4">
                          {item.allowedNow.map(w => <li key={w}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                    {item.blockedUntil.length > 0 && (
                      <div>
                        <span className="text-xs text-rose-500/80 font-semibold mb-1 block">BLOCKED UNTIL</span>
                        <ul className="text-xs text-slate-500 list-disc pl-4">
                          {item.blockedUntil.map(w => <li key={w}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-lg border border-slate-800 bg-slate-900/30 p-6 mt-8">
          <h3 className="text-lg font-medium text-slate-300 mb-3">Safe Navigation</h3>
          <ul className="flex flex-wrap gap-4 text-sm">
            <li><Link href="/dashboard/networks/zodiac" className="text-blue-400 hover:text-blue-300 transition underline underline-offset-4">Zodiac Dashboard</Link></li>
            <li><Link href="/dashboard/networks/zodiac/real-implementation-path" className="text-amber-400 hover:text-amber-300 transition underline underline-offset-4">Real Implementation Path</Link></li>
            <li><Link href="/dashboard/networks/zodiac/telegram-initdata-validation" className="text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4">Telegram initData Validation</Link></li>
            <li><Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-rose-400 hover:text-rose-300 transition underline underline-offset-4">Owner Review Gate</Link></li>
            <li><Link href="/dashboard/networks/zodiac/stability" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4">Stability</Link></li>
          </ul>
        </section>

      </div>
    </div>
  );
}
