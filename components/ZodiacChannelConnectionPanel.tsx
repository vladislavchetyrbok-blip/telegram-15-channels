import { 
  zodiacChannelConnections, 
  getZodiacConnectionProgress 
} from "@/data/zodiacChannelConnections";
import { Link, CheckCircle2, Circle, AlertCircle } from "lucide-react";

export function ZodiacChannelConnectionPanel() {
  const progress = getZodiacConnectionProgress();

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-5 shadow-glow">
        <h3 className="text-xl font-semibold text-white">Zodiac Channel Connections Registry</h3>
        <p className="mt-2 text-sm text-slate-400">
          Manual setup progress. Do not run the real publisher until all channels are connected and dry-run verified.
        </p>
        
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5 text-xs">
          <Metric label="Total Channels" value={progress.total} />
          <Metric label="Created" value={progress.created} />
          <Metric label="Bot Admin Added" value={progress.botAdminAdded} />
          <Metric label="Channel ID Added" value={progress.channelIdConnected} />
          <Metric label="Publish Ready" value={progress.publishReady} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {zodiacChannelConnections.map((channel) => (
          <article
            key={channel.id}
            className="rounded-lg border border-line bg-panel/70 p-5 transition hover:border-cyan-300/40 hover:bg-slate-900/80"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-semibold text-slate-200">{channel.displayName}</h4>
              <StatusBadge status={channel.publishStatus} />
            </div>
            
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-500 text-xs">Planned Username</span>
                <span className="font-mono text-xs">@{channel.plannedUsername}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-500 text-xs">Actual Username</span>
                {channel.actualUsername ? (
                  <span className="font-mono text-xs text-cyan-300">@{channel.actualUsername}</span>
                ) : (
                  <span className="text-xs text-slate-600">null</span>
                )}
              </div>
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-500 text-xs">Public Link</span>
                {channel.publicLink ? (
                  <a href={channel.publicLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-300 hover:underline text-xs">
                    <Link className="h-3 w-3" /> Link
                  </a>
                ) : (
                  <span className="text-xs text-slate-600">null</span>
                )}
              </div>
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-500 text-xs">Channel ID</span>
                {channel.telegramChannelId ? (
                  <span className="font-mono text-xs text-cyan-300">{channel.telegramChannelId}</span>
                ) : (
                  <span className="text-xs text-slate-600">null</span>
                )}
              </div>
              
              <div className="mt-4 flex flex-col gap-2 pt-2">
                <StepIndicator label="Creation Status" status={channel.creationStatus} />
                <StepIndicator label="Bot Admin Status" status={channel.botAdminStatus} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-slate-950/40 px-3 py-2">
      <p className="text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "publish_ready") {
    return <span className="shrink-0 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Ready</span>;
  }
  if (status === "dry_run_ready") {
    return <span className="shrink-0 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">Dry-Run</span>;
  }
  return <span className="shrink-0 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Not Ready</span>;
}

function StepIndicator({ label, status }: { label: string; status: string }) {
  const isDone = status === "created" || status === "admin_added";
  const Icon = isDone ? CheckCircle2 : (status === "needs_review" || status === "needs_check" ? AlertCircle : Circle);
  const color = isDone ? "text-emerald-400" : (status === "needs_review" || status === "needs_check" ? "text-amber-400" : "text-slate-600");

  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-slate-400">{label}:</span>
      <span className={`font-medium ${color}`}>{status}</span>
    </div>
  );
}
