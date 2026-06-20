import { AlertTriangle, ArrowDownRight, ArrowUpRight, ChevronLeft, Gem, Layers, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export const dynamic = "force-dynamic";

const mockMetalsData = [
  { pair: "XAU/USD", name: "Gold", price: "$2,350.40", change: "+0.6%", trend: "up" },
  { pair: "XAG/USD", name: "Silver", price: "$28.15", change: "-0.2%", trend: "down" },
  { pair: "XPT/USD", name: "Platinum", price: "$945.80", change: "+1.1%", trend: "up" },
  { pair: "XPD/USD", name: "Palladium", price: "$980.20", change: "-1.5%", trend: "down" },
];

export default function AphroditeMetalsPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/metals");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        <header className="space-y-4 border-b border-slate-800/80 pb-6">
          <Link href="/dashboard/networks/aphrodite" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300">
            <ChevronLeft className="h-4 w-4" />
            Dashboard / Афродита
          </Link>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300 mb-4">
                <Gem className="h-3.5 w-3.5" />
                Metals Module
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-white">Precious Metals</h1>
              <p className="mt-2 text-sm text-slate-400 max-w-2xl">
                Read-only snapshot of precious metals market data. Live API connections are mocked for development safety.
              </p>
            </div>
            
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-300">Safety Locked</p>
                <p className="text-emerald-400/70 text-xs">API calls mocked</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mockMetalsData.map((item) => (
            <div key={item.pair} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm transition hover:border-blue-500/30 hover:bg-slate-800/50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.pair}</h3>
                  <p className="text-sm text-slate-400">{item.name}</p>
                </div>
                <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${item.trend === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                  {item.trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {item.change}
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-2xl font-semibold tracking-tight text-white">{item.price}</span>
                <span className="text-xs text-slate-500">/ oz</span>
              </div>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-500/20 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-200">Development Warning</h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-200/70">
                This dashboard is in Draft mode. The data displayed above is statically mocked. 
                Do not attempt to execute server writes or deploy content from this module until the data pipeline architecture is finalized.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
