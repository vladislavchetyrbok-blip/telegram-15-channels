"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface UnifiedStatus {
  telegram: {
    tokenConfigured: boolean;
    getMeOk: boolean;
    botAccessOk: number;
    lastError: string | null;
  };
  autopublish: {
    enabled: boolean;
    schedulerStatus: string;
    workerRunning: boolean;
  };
  content: {
    readyToPublish: number;
  };
}

export function UnifiedStatusStrip() {
  const [status, setStatus] = useState<UnifiedStatus | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/system/unified-status", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted && payload) setStatus(payload as UnifiedStatus);
      })
      .catch(() => {
        if (mounted) setStatus(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const schedulerStatus = status?.autopublish.schedulerStatus ?? "loading";
  const schedulerLabel = status && !status.autopublish.enabled && status.autopublish.schedulerStatus === "stopped" ? "stopped by disabled" : schedulerStatus;

  return (
    <section className="border-b border-line bg-[#08101f]/86 px-4 py-3 sm:px-6 lg:px-8">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        <MiniStatus label="Telegram token" value={status ? (status.telegram.tokenConfigured ? "configured" : "missing") : "loading"} ok={Boolean(status?.telegram.tokenConfigured)} />
        <MiniStatus label="getMe" value={status ? (status.telegram.getMeOk ? "OK" : "not checked/error") : "loading"} ok={Boolean(status?.telegram.getMeOk)} />
        <MiniStatus label="Bot access" value={status ? `${status.telegram.botAccessOk}/15` : "loading"} ok={(status?.telegram.botAccessOk ?? 0) > 0} />
        <MiniStatus label="Ready posts" value={status?.content.readyToPublish ?? "loading"} ok={(status?.content.readyToPublish ?? 0) > 0} />
        <MiniStatus label="Worker" value={status ? (status.autopublish.workerRunning ? "running" : "not running") : "loading"} ok={Boolean(status?.autopublish.workerRunning)} />
        <MiniStatus label="Scheduler" value={schedulerLabel} ok={status ? (status.autopublish.enabled ? status.autopublish.schedulerStatus !== "error" : true) : false} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Logos: not blocking. Statistics: not blocking. Real publish is controlled by preflight and is not started automatically.
        {status?.telegram.lastError ? <span className="ml-2 text-amber-200">Last Telegram issue: {status.telegram.lastError}</span> : null}
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
