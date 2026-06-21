import { Metadata } from "next";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { miniappRouteSafetyBaseline } from "@/lib/zodiac/zodiac-miniapp-route-safety";

export const metadata: Metadata = {
  title: "Mini App Route Safety Baseline | Zodiac Dashboard",
  description: "Safety matrix and QA boundaries for Zodiac Mini App routes",
};

export default function MiniAppRouteSafetyPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Mini App Route Safety Baseline</h2>
          <p className="text-sm text-slate-400">
            Safety labels, required boundaries, and QA assertions for all Mini App mock routes.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-emerald-900/30 bg-emerald-900/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-400">Safe Mock Routes</span>
          </div>
          <div className="text-2xl font-bold text-emerald-100">{miniappRouteSafetyBaseline.length}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-sm font-medium text-slate-400 mb-1">Active DB Modifiers</div>
          <div className="text-2xl font-bold text-slate-100">0</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-sm font-medium text-slate-400 mb-1">Live Payments</div>
          <div className="text-2xl font-bold text-slate-100">0</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-sm font-medium text-slate-400 mb-1">Bot API Calls</div>
          <div className="text-2xl font-bold text-slate-100">0</div>
        </div>
      </div>

      <div className="space-y-6">
        {miniappRouteSafetyBaseline.map((item) => (
          <div key={item.route} className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-sm">
            <div className="bg-slate-800/40 p-4 border-b border-slate-800/50 flex flex-wrap gap-4 justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-slate-200">{item.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                    {item.route}
                  </code>
                  <span className="text-xs text-slate-400">{item.purpose}</span>
                </div>
              </div>
              <div className="flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-900/20 text-emerald-400 border border-emerald-900/50">
                <ShieldCheck className="h-3 w-3 mr-1.5" />
                {item.status.toUpperCase()}
              </div>
            </div>
            
            <div className="p-5 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Safety Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                    {item.safetyRequirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">QA Assertions</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.qaAssertions.map((assertion, i) => (
                      <span key={i} className="inline-flex items-center rounded-md bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-300 border border-slate-700">
                        {assertion}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Protected Boundaries
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-400/80">
                    {item.protectedBoundaries.map((boundary, i) => (
                      <li key={i}>{boundary}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                  <h4 className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Next Action</h4>
                  <p className="text-sm text-slate-300">{item.nextAction}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
