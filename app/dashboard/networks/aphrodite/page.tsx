import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  CalendarDays,
  ChevronRight,
  Database,
  LayoutDashboard,
  Lock,
  LockKeyhole,
  Network,
  RadioTower,
  Server,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export const dynamic = "force-dynamic";

interface ModuleCard {
  id: string;
  title: string;
  icon: React.ElementType;
  purpose: string;
  status: "Active" | "Draft" | "Planning" | "Locked" | "Future";
  safetyLevel: "Production" | "Dry-run Only" | "Read-only" | "Concept";
  nextStep: string;
  href?: string;
}

const modules: ModuleCard[] = [
  {
    id: "channel-registry",
    title: "Channel Registry",
    icon: Server,
    purpose: "Unified view of all channels across modules",
    status: "Active",
    safetyLevel: "Read-only",
    nextStep: "Verify channel states before publishing",
    href: "/dashboard/networks/aphrodite/channels",
  },
  {
    id: "zodiac-os",
    title: "Zodiac OS",
    icon: Sparkles,
    purpose: "Astrology content publishing module",
    status: "Active",
    safetyLevel: "Production",
    nextStep: "Review daily/weekly pipelines",
    href: "/dashboard/networks/zodiac",
  },
  {
    id: "currency-module",
    title: "Currency",
    icon: Activity,
    purpose: "Daily exchange rates & economic updates",
    status: "Draft",
    safetyLevel: "Dry-run Only",
    nextStep: "Define reliable data sources",
  },
  {
    id: "crypto-module",
    title: "Crypto",
    icon: Database,
    purpose: "Crypto market summaries & technicals",
    status: "Draft",
    safetyLevel: "Dry-run Only",
    nextStep: "Draft content template guidelines",
  },
  {
    id: "metals-module",
    title: "Metals",
    icon: LayoutDashboard,
    purpose: "Precious metals and commodity watch",
    status: "Draft",
    safetyLevel: "Dry-run Only",
    nextStep: "Configure initial channels",
  },
  {
    id: "publishing-engine",
    title: "Publishing",
    icon: RadioTower,
    purpose: "Core dispatcher for Telegram API",
    status: "Locked",
    safetyLevel: "Read-only",
    nextStep: "Keep locked until architecture sync",
  },
  {
    id: "data-sources",
    title: "Data Sources",
    icon: Workflow,
    purpose: "Centralized feed aggregators",
    status: "Planning",
    safetyLevel: "Concept",
    nextStep: "Design source normalization pipeline",
  },
  {
    id: "safety-guard",
    title: "Safety",
    icon: ShieldCheck,
    purpose: "Global rate limits & duplicate prevention",
    status: "Planning",
    safetyLevel: "Concept",
    nextStep: "Implement pre-flight checks",
  },
  {
    id: "schedule-calendar",
    title: "Schedule / Calendar",
    icon: Calendar,
    purpose: "Cross-module content scheduling view",
    status: "Planning",
    safetyLevel: "Concept",
    nextStep: "Integrate Zodiac ledger data",
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: BarChart3,
    purpose: "Aggregated performance and user metrics",
    status: "Planning",
    safetyLevel: "Concept",
    nextStep: "Define base engagement KPIs",
  },
  {
    id: "future-studio",
    title: "Future Windows Studio",
    icon: TerminalSquare,
    purpose: "Advanced visual content generator",
    status: "Future",
    safetyLevel: "Concept",
    nextStep: "Not yet scheduled",
  },
];

export default function AphroditePlatformOverview() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite");

  return (
    <main className="flex-1 bg-[#0a1428] text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <AphroditePageHeader
          title="Афродита (Aphrodite Platform)"
          description="The overarching operator platform for all Telegram publishing networks. Зодиак (Zodiac) and other vertical content engines operate as modules within this control plane."
          badgeText="Operator Platform"
          icon={LayoutDashboard}
          safetyLocked={true}
          safetyMessage="Live publish locked"
          backLink="/dashboard"
          backLabel="Dashboard Home"
        />

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          <div className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-3xl font-semibold text-white mb-1 tracking-tight">18</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Channels</span>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-3xl font-semibold text-slate-500 mb-1 tracking-tight">15</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Legacy Paused</span>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-3xl font-semibold text-blue-400 mb-1 tracking-tight">3</span>
            <span className="text-[11px] font-medium text-blue-300 uppercase tracking-wider">Draft Modules</span>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-3xl font-semibold text-slate-500 mb-1 tracking-tight">0</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active</span>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-3xl font-semibold text-slate-500 mb-1 tracking-tight">0</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Errors</span>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-[#0f1b33] p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Lock className="h-6 w-6 text-rose-400 mb-1.5" />
            <span className="text-sm font-semibold text-rose-300 tracking-tight">Locked</span>
            <span className="text-[10px] font-medium text-rose-400/80 uppercase tracking-wider mt-0.5">Live Publish</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Modules Grid */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-white tracking-tight">Platform Modules</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-[10px] font-medium text-slate-300 uppercase tracking-wider">
                  <LockKeyhole className="h-3 w-3" />
                  Read-only view
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {modules.map((m) => {
                  const Icon = m.icon;
                  const isLinkable = !!m.href;
                  
                  const content = (
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                            m.status === "Active" ? "border-blue-500/30 bg-blue-500/10 text-blue-400" :
                            m.status === "Draft" ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
                            m.status === "Locked" ? "border-rose-500/30 bg-rose-500/10 text-rose-400" :
                            "border-slate-700 bg-slate-800 text-slate-400"
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white tracking-tight">{m.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-medium uppercase tracking-wider ${
                                m.status === "Active" ? "text-blue-400" :
                                m.status === "Draft" ? "text-amber-400" :
                                m.status === "Locked" ? "text-rose-400" :
                                "text-slate-500"
                              }`}>{m.status}</span>
                            </div>
                          </div>
                        </div>
                        {isLinkable && (
                          <ChevronRight className="h-5 w-5 text-slate-600 transition-colors group-hover:text-slate-400" />
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                        {m.purpose}
                      </p>
                      
                      <div className="mt-auto space-y-3 pt-4 border-t border-slate-800/50">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Safety Level</span>
                          <span className="font-medium text-slate-300">{m.safetyLevel}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Next Step</span>
                          <span className="font-medium text-slate-300 truncate max-w-[160px]">{m.nextStep}</span>
                        </div>
                      </div>
                    </div>
                  );

                  const cardClasses = `group block relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 shadow-sm ${
                    isLinkable 
                      ? "border-slate-800/80 bg-[#0f1b33] hover:border-slate-700 hover:bg-[#132240] cursor-pointer" 
                      : "border-slate-800/50 bg-[#0a1222] opacity-80"
                  }`;

                  if (isLinkable) {
                    return (
                      <Link key={m.id} href={m.href!} className={cardClasses}>
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div key={m.id} className={cardClasses}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Next Safe Actions */}
            <section className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Next Safe Actions
              </h2>
              <ul className="space-y-4">
                {[
                  "Verify channel registry",
                  "Prepare publishing calendar",
                  "Define data sources for Currency/Crypto/Metals",
                  "Keep live publish locked",
                  "Do not connect payments yet"
                ].map((action, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    </div>
                    <span className="text-sm text-slate-300 leading-tight">{action}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Platform Architecture */}
            <section className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                <TerminalSquare className="h-5 w-5 text-slate-400" />
                Platform Architecture
              </h2>
              <div className="rounded-xl border border-slate-800 bg-[#080d1a] p-4 overflow-x-auto font-mono text-sm leading-relaxed text-slate-300">
<pre><code>{`Aphrodite OS
├─ Channels
├─ Modules
├─ Publishing
├─ Sources
├─ Safety
├─ Analytics
└─ Future Studio`}</code></pre>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
