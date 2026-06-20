import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Lock,
  LockKeyhole,
  FileText,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export const dynamic = "force-dynamic";

interface ScheduleItem {
  time: string;
  module: string;
  title: string;
  status: "ready" | "draft" | "paused" | "locked" | "future";
}

const SCHEDULE: ScheduleItem[] = [
  { time: "09:00", module: "Currency", title: "Currency Daily Rates", status: "draft" },
  { time: "10:00", module: "Zodiac", title: "Zodiac Daily", status: "ready" },
  { time: "12:00", module: "Metals", title: "Metals Daily Watch", status: "draft" },
  { time: "13:00", module: "Crypto", title: "Crypto Top 10 Snapshot", status: "draft" },
  { time: "14:00", module: "Currency", title: "Currency Optional Intraday Snapshot", status: "future" },
  { time: "18:00", module: "Zodiac", title: "Zodiac CTA / Engagement", status: "locked" },
  { time: "20:00", module: "Real Estate", title: "Real Estate Future Posts", status: "paused" },
  { time: "21:00", module: "Review", title: "Weekly / Promo / Manual Review Queue", status: "locked" },
];

function StatusBadge({ status }: { status: ScheduleItem["status"] }) {
  const styles = {
    ready: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    draft: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    paused: "border-slate-500/30 bg-slate-500/10 text-slate-400",
    locked: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    future: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function AphroditeCalendarPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/calendar");

  return (
    <main className="min-h-screen bg-[#060b14] p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-blue-400" />
              Aphrodite Publishing Calendar
            </h1>
            <p className="text-sm text-slate-400">
              Read-only daily and weekly content schedule across all platform modules.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/networks/aphrodite"
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors"
            >
              Overview
            </Link>
            <Link 
              href="/dashboard/networks/aphrodite/channels"
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors"
            >
              Registry
            </Link>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-400" />
                  Today&apos;s Planned Schedule
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-[10px] font-medium text-slate-300 uppercase tracking-wider">
                  Planning UI Only
                </span>
              </div>
              <div className="divide-y divide-slate-800/50">
                {SCHEDULE.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="text-sm font-mono font-medium text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {item.time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-medium text-blue-400/80 uppercase tracking-wider">
                            {item.module}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-200">{item.title}</h3>
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-rose-500/20 bg-[#0f1b33] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Lock className="h-24 w-24" />
              </div>
              <h2 className="text-base font-semibold text-rose-300 mb-5 flex items-center gap-2">
                <LockKeyhole className="h-5 w-5" />
                Publishing Safety
              </h2>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">Live publishing locked</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">Dry-run first</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">Ledger required</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">No Telegram API calls from this page</span>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                Documentation
              </h2>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Learn more about the platform scheduling rules and deduplication ledger.
              </p>
              <Link 
                href="/dashboard/networks/zodiac/docs" 
                className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Read Publishing Docs <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
