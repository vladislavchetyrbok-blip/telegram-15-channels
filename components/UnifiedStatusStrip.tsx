import { getUnifiedSystemStatus } from "@/lib/unified-system-status";
import { cn } from "@/lib/utils";

export async function UnifiedStatusStrip() {
  const status = await getUnifiedSystemStatus();
  const schedulerLabel = !status.autopublish.enabled && status.autopublish.schedulerStatus === "stopped" ? "stopped by disabled" : status.autopublish.schedulerStatus;

  return (
    <section className="border-b border-line bg-[#08101f]/86 px-4 py-3 sm:px-6 lg:px-8">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        <MiniStatus label="Telegram token" value={status.telegram.tokenConfigured ? "configured" : "missing"} ok={status.telegram.tokenConfigured} />
        <MiniStatus label="getMe" value={status.telegram.getMeOk ? "OK" : "not checked/error"} ok={status.telegram.getMeOk} />
        <MiniStatus label="Bot access" value={`${status.telegram.botAccessOk}/15`} ok={status.telegram.botAccessOk > 0} />
        <MiniStatus label="Ready posts" value={status.content.readyToPublish} ok={status.content.readyToPublish > 0} />
        <MiniStatus label="Worker" value={status.autopublish.workerRunning ? "running" : "not running"} ok={status.autopublish.workerRunning} />
        <MiniStatus label="Scheduler" value={schedulerLabel} ok={status.autopublish.enabled ? status.autopublish.schedulerStatus !== "error" : true} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Logos: not blocking. Statistics: not blocking. Real publish is controlled by preflight and is not started automatically.
        {status.telegram.lastError ? <span className="ml-2 text-amber-200">Last Telegram issue: {status.telegram.lastError}</span> : null}
      </p>
    </section>
  );
}

function MiniStatus({ label, value, ok }: { label: string; value: string | number; ok: boolean }) {
  return (
    <div className="rounded-md border border-line bg-black/20 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-semibold", ok ? "text-emerald-100" : "text-amber-100")}>{value}</p>
    </div>
  );
}
