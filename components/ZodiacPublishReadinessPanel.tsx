"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { getZodiacPublishReadinessReport, type ZodiacPublishReadinessReport } from "@/lib/zodiac-publish-readiness";

export function ZodiacPublishReadinessPanel() {
  const [report, setReport] = useState<ZodiacPublishReadinessReport | null>(null);

  const runCheck = () => {
    setReport(getZodiacPublishReadinessReport());
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-line bg-panel p-5 shadow-glow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Pre-Publish Readiness Check</h3>
            <p className="mt-2 text-sm text-slate-400">
              Verify local configuration and content quality before attempting a dry-run or real publish.
            </p>
          </div>
          <button
            onClick={runCheck}
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Run Diagnostics
          </button>
        </div>

        <div className="mt-4 rounded border border-blue-500/30 bg-blue-500/10 p-3 flex gap-3 text-sm text-blue-200">
          <Info className="h-5 w-5 shrink-0 text-blue-400" />
          <p>Real publish is disabled until all 13 channels are connected and dry-run is approved.</p>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          <div className={`rounded-lg border p-5 ${report.ready ? "bg-emerald-950/20 border-emerald-500/30" : "bg-red-950/20 border-red-500/30"}`}>
            <div className="flex items-center gap-3">
              {report.ready ? (
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-8 w-8 text-red-400" />
              )}
              <div>
                <h4 className={`text-xl font-bold ${report.ready ? "text-emerald-400" : "text-red-400"}`}>
                  {report.ready ? "SYSTEM READY FOR DRY-RUN" : "NOT READY FOR PUBLISH"}
                </h4>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded border border-line bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Connected Channels</p>
              <p className="mt-1 text-2xl font-semibold text-white">{report.summary.connectedChannels} / 13</p>
            </div>
            <div className="rounded border border-line bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Publish Ready</p>
              <p className="mt-1 text-2xl font-semibold text-white">{report.summary.publishReadyChannels} / 13</p>
            </div>
            <div className="rounded border border-line bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Posts Passing Quality</p>
              <p className="mt-1 text-2xl font-semibold text-white">{report.summary.postsPassingQuality} / {report.summary.totalPosts}</p>
            </div>
          </div>

          {report.blockingIssues.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-5">
              <h4 className="flex items-center gap-2 font-semibold text-red-400">
                <AlertTriangle className="h-4 w-4" /> Blocking Issues
              </h4>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-red-200/80">
                {report.blockingIssues.map((issue, i) => <li key={i}>{issue}</li>)}
              </ul>
            </div>
          )}

          {report.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-5">
              <h4 className="flex items-center gap-2 font-semibold text-amber-400">
                <AlertTriangle className="h-4 w-4" /> Warnings
              </h4>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-amber-200/80">
                {report.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
              </ul>
            </div>
          )}

          {report.nextActions.length > 0 && (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-5">
              <h4 className="font-semibold text-cyan-400">Next Actions</h4>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-cyan-200/80">
                {report.nextActions.map((action, i) => <li key={i}>{action}</li>)}
              </ul>
            </div>
          )}

          <div className="rounded-lg border border-line bg-panel p-5">
            <h4 className="font-semibold text-white mb-4">Channel Readiness Detail</h4>
            <div className="space-y-3">
              {report.channelReadiness.map(ch => (
                <div key={ch.channelId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ch.ready ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className="text-sm font-medium text-slate-200">{ch.displayName}</span>
                  </div>
                  {!ch.ready && ch.nextAction && (
                    <span className="text-xs text-amber-400">{ch.nextAction}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
