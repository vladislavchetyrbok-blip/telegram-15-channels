import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { CheckCircle2, ShieldAlert, FileQuestion, Ban, AlertTriangle, ShieldCheck, Smartphone, Layers } from "lucide-react";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { 
  miniAppArchitectureModules, 
  miniAppRouteBoundaries, 
  miniAppImplementationPhases, 
  miniAppRiskControls 
} from "@/lib/zodiac/zodiac-miniapp-architecture";

export const dynamic = "force-dynamic";

const statusIcons: Record<string, React.ElementType> = {
  "partially existing": FileQuestion,
  placeholder: Ban,
  missing: AlertTriangle,
  future: CheckCircle2,
};

const statusColors: Record<string, string> = {
  "partially existing": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  placeholder: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  missing: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  future: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
};

const riskColors: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-rose-400",
};

export default async function MiniAppArchitecturePage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/miniapp-architecture");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AphroditePageHeader
          title="Mini App Architecture Spec"
          description="Read-only architecture specification for upcoming Mini App modules and data requirements."
          badgeText="Package 102"
          icon={Layers}
          safetyLocked={true}
          safetyMessage="Architecture definitions only"
        />

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Module Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 pr-4 font-semibold">Module</th>
                  <th className="pb-3 pr-4 font-semibold">Status / Route</th>
                  <th className="pb-3 pr-4 font-semibold">Required Data & UI</th>
                  <th className="pb-3 pr-4 font-semibold">Backend / Phase</th>
                  <th className="pb-3 font-semibold">Safe Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {miniAppArchitectureModules.map((item) => {
                  const StatusIcon = statusIcons[item.status] || FileQuestion;
                  return (
                    <tr key={item.id} className="group transition-colors hover:bg-slate-800/30">
                      <td className="py-4 pr-4 align-top">
                        <div className="font-medium text-slate-100">{item.name}</div>
                        <div className={`mt-1 text-xs font-medium capitalize ${riskColors[item.riskLevel]}`}>
                          Risk: {item.riskLevel}
                        </div>
                        {item.paymentDependency && (
                          <div className="mt-1 text-xs text-amber-500 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            Payment Dep
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4 align-top">
                        <span className={`mb-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${statusColors[item.status]}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {item.status}
                        </span>
                        <div className="mt-1 text-xs text-slate-400">
                          <code className="rounded bg-slate-800/50 px-1.5 py-0.5">{item.routeRecommendation}</code>
                        </div>
                      </td>
                      <td className="py-4 pr-4 align-top">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-slate-500">DATA:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.dataRequired.map((d, i) => (
                              <span key={i} className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300">{d}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500">UI:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.uiRequired.map((u, i) => (
                              <span key={i} className="rounded bg-slate-700/50 px-1.5 py-0.5 text-xs text-slate-300">{u}</span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 align-top text-slate-300">
                        <div className="mb-2 text-xs">
                          <span className="font-semibold text-slate-500">PHASE: </span>
                          <span className="font-medium text-emerald-400">{item.implementationPhase}</span>
                        </div>
                        <ul className="list-disc pl-4 text-xs text-slate-400">
                          {item.backendRequired.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-4 align-top text-slate-400 text-sm">
                        {item.safeNextAction}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-slate-100">Implementation Mocks</h2>
            </div>
            <div className="space-y-4 mb-6">
              <div className="rounded-md border border-slate-800 bg-slate-800/20 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-slate-200">Birth Matrix UI Mock</h3>
                    <p className="mt-1 text-xs text-slate-400">Package 103 static implementation without database.</p>
                  </div>
                  <a href="/birth-matrix" className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 transition">
                    View Mock
                  </a>
                </div>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-800/20 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-slate-200">Mystic Numbers UI Mock</h3>
                    <p className="mt-1 text-xs text-slate-400">Package 104 static implementation without database.</p>
                  </div>
                  <a href="/mystic-numbers" className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 transition">
                    View Mock
                  </a>
                </div>
              </div>
            </div>

            <h2 className="mb-4 text-lg font-semibold text-slate-100">Route Boundaries</h2>
            <div className="space-y-4">
              {miniAppRouteBoundaries.map((boundary, i) => (
                <div key={i} className="rounded-md border border-slate-800 bg-slate-800/20 p-3">
                  <div className="font-medium text-slate-200">{boundary.area}</div>
                  <code className="mt-1 block text-xs text-slate-400">{boundary.path}</code>
                  <div className="mt-2 text-sm text-emerald-400/90">{boundary.isolation}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Implementation Phases</h2>
            <div className="space-y-4">
              {miniAppImplementationPhases.map((phase) => (
                <div key={phase.phase} className="flex gap-4 border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-slate-300">
                    {phase.phase}
                  </div>
                  <div>
                    <div className="font-medium text-slate-200">{phase.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{phase.focus}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 rounded-md border border-amber-900/30 bg-amber-900/10 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-medium text-amber-500">
                <ShieldAlert className="h-4 w-4" />
                Risk Controls
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-amber-400/80">
                {miniAppRiskControls.map((control, i) => (
                  <li key={i}>{control}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
