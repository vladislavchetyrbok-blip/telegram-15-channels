import { Monitor, Cpu, LayoutDashboard, ShieldCheck, TerminalSquare } from "lucide-react";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export const dynamic = "force-dynamic";

export default function AphroditeStudioPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/studio");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        <AphroditePageHeader
          title="Windows Studio (Operator App)"
          description="Aphrodite Studio is a future native Windows operator app for Владислав. It will wrap the web dashboard for deep OS integration."
          badgeText="Future Desktop App"
          icon={TerminalSquare}
          safetyLocked={true}
          safetyMessage="No desktop app created yet"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-400" />
                Windows Architecture Plan
              </h2>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3">
                  <Cpu className="h-5 w-5 text-slate-500 shrink-0" />
                  <span><strong>Web Wrapper:</strong> It wraps and uses the existing Aphrodite web dashboard. No separate desktop app is created now. No Tauri or Electron dependencies are installed.</span>
                </li>
                <li className="flex gap-3">
                  <LayoutDashboard className="h-5 w-5 text-slate-500 shrink-0" />
                  <span><strong>Operator Features:</strong> Designed for channel monitoring, dry-run review, publishing calendar, package reports, GitHub/Vercel status, and Telegram safety status on Windows.</span>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-slate-500 shrink-0" />
                  <span><strong>Safety Defaults:</strong> No live publish from desktop by default. No unsafe token storage on the local filesystem.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
