import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, ChevronRight, LayoutGrid, Star, Fingerprint, Hash, HeartHandshake, Calendar, Users, LockKeyhole } from "lucide-react";
import { MOCK_MINI_APP_HUB_ITEMS, MOCK_MINI_APP_SAFETY_RULES } from "@/lib/zodiac/zodiac-miniapp-hub";

export const metadata: Metadata = {
  title: "Zodiac Mini App Hub",
  description: "Central navigation for Zodiac Mini App modules.",
};

const iconMap: Record<string, any> = {
  "Compatibility": HeartHandshake,
  "Birth Matrix": Fingerprint,
  "Mystic Numbers": Hash,
  "Affirmations": Star,
  "VIP Preview": LockKeyhole,
  "Lunar Calendar": Calendar,
  "Relationship Map": Users,
};

const statusColors = {
  "existing": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "active-mock": "border-violet-500/30 bg-violet-500/10 text-violet-400",
  "placeholder": "border-slate-500/30 bg-slate-500/10 text-slate-400",
  "future": "border-slate-700/50 bg-slate-800/30 text-slate-500",
};

export default function MiniAppHubPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#070b14] text-slate-100 font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#070b14]/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-violet-400" />
            <h1 className="text-lg font-semibold text-slate-100">Mini App Hub</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
        <div className="mb-6 rounded-lg border border-amber-900/30 bg-amber-900/10 p-3 text-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-500">Static Hub (Package 106)</p>
            <ul className="mt-2 space-y-1 text-xs text-amber-500/80">
              {MOCK_MINI_APP_SAFETY_RULES.map((rule, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-amber-500/50" />
                  <span className="font-medium text-amber-400">{rule.label}:</span> {rule.description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-100">Zodiac Universe</h2>
            <p className="mt-2 text-sm text-slate-400">Select a module to explore your cosmic blueprint.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {MOCK_MINI_APP_HUB_ITEMS.map((item, idx) => {
              const Icon = iconMap[item.title] || Star;
              const isFuture = item.status === "future" || item.status === "placeholder";
              
              const CardContent = (
                <div className={`relative flex flex-col gap-3 rounded-xl border p-4 transition ${isFuture ? "border-slate-800/50 bg-slate-900/20" : "border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-700 active:scale-[0.98]"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${isFuture ? "bg-slate-800 text-slate-500" : "bg-violet-900/30 text-violet-400"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isFuture ? "text-slate-500" : "text-slate-200"}`}>{item.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-slate-800/50 pt-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[item.status]}`}>
                        {item.status.replace('-', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> {item.safetyLabel}
                      </span>
                    </div>
                    
                    {!isFuture && (
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </div>
              );

              return isFuture ? (
                <div key={idx} className="opacity-75">{CardContent}</div>
              ) : (
                <Link key={idx} href={item.href} className="block">
                  {CardContent}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Launch</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link href="/compatibility" className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Check compatibility
              </Link>
              <Link href="/birth-matrix" className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Try mock Birth Matrix
              </Link>
              <Link href="/mystic-numbers" className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Preview Mystic Numbers
              </Link>
              <Link href="/affirmations" className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Open Affirmations
              </Link>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Dashboard Links</h3>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard/networks/zodiac/miniapp-route-safety" className="text-xs text-emerald-500/80 hover:text-emerald-400 transition flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> View safety baseline
              </Link>
              <Link href="/dashboard/networks/zodiac/miniapp-architecture" className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" /> Mini App Architecture
              </Link>
              <Link href="/dashboard/networks/zodiac/miniapp-audit" className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" /> Mini App Audit
              </Link>
              <Link href="/dashboard/networks/zodiac/stability" className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" /> Stability Matrix
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
