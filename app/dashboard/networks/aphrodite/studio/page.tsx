import { Clapperboard, MonitorPlay, Palette, ShieldCheck, Sparkles, Video } from "lucide-react";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export const dynamic = "force-dynamic";

const MOCK_PROJECTS = [
  { id: "proj-1", title: "Zodiac Daily Reels", status: "rendering", progress: 85, type: "video" },
  { id: "proj-2", title: "Crypto Market Update", status: "queued", progress: 0, type: "video" },
  { id: "proj-3", title: "Weekend Promotion Graphics", status: "draft", progress: 0, type: "image" },
  { id: "proj-4", title: "Currency Highlights", status: "completed", progress: 100, type: "video" },
];

export default function AphroditeStudioPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/studio");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        <AphroditePageHeader
          title="Content Studio"
          description="Future module for multimedia rendering, video automation, and graphics generation pipelines."
          badgeText="Studio Module"
          icon={Clapperboard}
          safetyLocked={true}
          safetyMessage="Rendering backend offline"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                <MonitorPlay className="h-5 w-5 text-blue-400" />
                Active Render Queue
              </h2>
              <div className="space-y-4">
                {MOCK_PROJECTS.map((project) => (
                  <div key={project.id} className="rounded-lg border border-slate-800/80 bg-slate-800/30 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-slate-800 p-2">
                          {project.type === "video" ? (
                            <Video className="h-4 w-4 text-purple-400" />
                          ) : (
                            <Palette className="h-4 w-4 text-pink-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{project.title}</p>
                          <p className="text-xs text-slate-400 capitalize">{project.status}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{project.progress}%</span>
                    </div>
                    {project.status === "rendering" && (
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500 ease-out"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Templates
              </h2>
              <ul className="space-y-3">
                <li className="flex items-center justify-between rounded-md p-2 hover:bg-slate-800/50 transition">
                  <span className="text-sm text-slate-300">Daily Horoscope Reel</span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 uppercase">Ready</span>
                </li>
                <li className="flex items-center justify-between rounded-md p-2 hover:bg-slate-800/50 transition">
                  <span className="text-sm text-slate-300">Crypto Price Ticker</span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 uppercase">Ready</span>
                </li>
                <li className="flex items-center justify-between rounded-md p-2 hover:bg-slate-800/50 transition">
                  <span className="text-sm text-slate-300">Weekly Summary Graphic</span>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 uppercase">Draft</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
