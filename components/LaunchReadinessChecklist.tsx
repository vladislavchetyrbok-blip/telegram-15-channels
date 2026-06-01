"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LaunchReadiness {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  canEnableAutopublish: boolean;
  safeToRunNextPost: boolean;
  readyPosts: number;
  publishedPosts: number;
  botAccessOk: number;
  imageOk: boolean;
  textOk: boolean;
  captionOk: boolean;
  mojibakeOk: boolean;
  oldErrorsAreHistoryOnly: boolean;
  telegram: {
    tokenConfigured: boolean;
    getMeOk: boolean;
    botUsername: string | null;
    accessOk: number;
    channelsTotal: number;
  };
  visuals: {
    premiumV2: number;
    totalImages: number;
    telegramImageOk: number;
    weakImages: number;
    provider: string;
    fallbackProvider: string;
  };
  autopublish: {
    enabled: boolean;
    workerRunning: boolean;
    schedulerStatus: string;
    publishedToday: number;
    failedToday: number;
    blockedToday: number;
  };
  checkedAt: string;
}

export function LaunchReadinessChecklist() {
  const [state, setState] = useState<LaunchReadiness | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Prepare autopublish launch runs readiness checks only. It does not enable autopublish and does not send posts.");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/autopublish/launch-readiness", { cache: "no-store" });
      const payload = (await response.json()) as LaunchReadiness;
      setState(payload);
      setMessage(payload.ready ? "Launch readiness OK. Autopublish is still controlled manually." : "Launch readiness has blockers. Nothing was sent.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const schedulerExplanation = useMemo(() => {
    if (state?.autopublish.workerRunning && !state.autopublish.enabled) {
      return "Worker работает, но публикации заблокированы, потому что autopublish выключен.";
    }

    if (state?.autopublish.enabled) return "Autopublish is enabled; scheduler controls posting by the daily plan.";
    if (state?.autopublish.workerRunning) return "Worker is running.";
    return "Worker is not running.";
  }, [state]);

  return (
    <section className="rounded-lg border border-emerald-300/25 bg-emerald-300/5 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Launch checklist</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Daily autopublish readiness</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Final read-only gate before manual autopublish enablement. This checks Telegram access, content quality, visual readiness, worker state, and historical errors.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={busy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShieldCheck className="h-4 w-4" />
          Prepare autopublish launch
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <ChecklistItem label="Telegram token configured" ok={Boolean(state?.telegram.tokenConfigured)} value={state?.telegram.tokenConfigured ? "configured" : "missing"} />
        <ChecklistItem label="getMe OK" ok={Boolean(state?.telegram.getMeOk)} value={state?.telegram.getMeOk ? state.telegram.botUsername ?? "OK" : "not OK"} />
        <ChecklistItem label="Bot access OK" ok={(state?.telegram.accessOk ?? 0) === (state?.telegram.channelsTotal ?? 15)} value={`${state?.telegram.accessOk ?? 0}/${state?.telegram.channelsTotal ?? 15}`} />
        <ChecklistItem label="Ready posts count" ok={(state?.readyPosts ?? 0) > 0} value={state?.readyPosts ?? 0} />
        <ChecklistItem label="premium_v2 images OK" ok={Boolean(state && state.visuals.premiumV2 === state.visuals.totalImages)} value={`${state?.visuals.premiumV2 ?? 0}/${state?.visuals.totalImages ?? 0}`} />
        <ChecklistItem label="Weak images" ok={(state?.visuals.weakImages ?? 1) === 0} value={state?.visuals.weakImages ?? "-"} />
        <ChecklistItem label="Caption OK" ok={Boolean(state?.captionOk)} value={state?.captionOk ? "OK" : "check"} />
        <ChecklistItem label="Mojibake" ok={Boolean(state?.mojibakeOk)} value={state?.mojibakeOk ? "0" : "found"} />
        <ChecklistItem label="Old errors" ok={Boolean(state?.oldErrorsAreHistoryOnly)} value={state?.oldErrorsAreHistoryOnly ? "history only" : "active"} />
        <ChecklistItem label="Autopublish" ok={Boolean(state && !state.autopublish.enabled)} value={state?.autopublish.enabled ? "enabled" : "disabled"} neutral />
        <ChecklistItem label="Worker" ok={Boolean(state?.autopublish.workerRunning)} value={state?.autopublish.workerRunning ? "running" : "stopped"} neutral />
        <ChecklistItem label="Scheduler" ok={state?.autopublish.schedulerStatus === "running"} value={state?.autopublish.schedulerStatus ?? "unknown"} neutral />
      </div>

      <div className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">
        <p className="font-semibold text-white">{schedulerExplanation}</p>
        <p className="mt-2">{message}</p>
      </div>

      {state?.blockers.length ? (
        <StatusList title="Blockers" items={state.blockers} tone="error" />
      ) : (
        <p className="mt-4 rounded-md border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-100">
          No active blockers. Autopublish remains disabled until explicitly enabled.
        </p>
      )}

      {state?.warnings.length ? <StatusList title="Warnings" items={state.warnings} tone="warn" /> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric label="Can enable autopublish" value={state?.canEnableAutopublish ? "true" : "false"} tone={state?.canEnableAutopublish ? "ok" : "warn"} />
        <Metric label="Safe next post" value={state?.safeToRunNextPost ? "true" : "false"} tone={state?.safeToRunNextPost ? "ok" : "warn"} />
        <Metric label="Published posts" value={state?.publishedPosts ?? 0} tone="dry" />
        <Metric label="Checked" value={state?.checkedAt ? new Date(state.checkedAt).toLocaleTimeString() : "pending"} tone="dry" />
      </div>
    </section>
  );
}

function ChecklistItem({ label, ok, value, neutral = false }: { label: string; ok: boolean; value: string | number; neutral?: boolean }) {
  const tone = neutral ? "dry" : ok ? "ok" : "error";

  return (
    <div className="rounded-md border border-line bg-slate-950/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
        {neutral ? <RefreshCw className="h-4 w-4 text-cyan-100" /> : ok ? <CheckCircle2 className="h-4 w-4 text-emerald-100" /> : <CircleAlert className="h-4 w-4 text-rose-100" />}
      </div>
      <p className={cn("mt-2 truncate text-lg font-semibold", tone === "ok" && "text-emerald-100", tone === "error" && "text-rose-100", tone === "dry" && "text-cyan-100")}>{value}</p>
    </div>
  );
}

function StatusList({ title, items, tone }: { title: string; items: string[]; tone: "warn" | "error" }) {
  return (
    <div className={cn("mt-4 rounded-md border p-3 text-sm", tone === "warn" ? "border-amber-300/25 bg-amber-300/10 text-amber-100" : "border-rose-300/25 bg-rose-300/10 text-rose-100")}>
      <p className="font-semibold text-white">{title}</p>
      <ul className="mt-2 grid gap-1">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: "ok" | "warn" | "dry" }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-lg font-semibold", tone === "ok" && "text-emerald-100", tone === "warn" && "text-amber-100", tone === "dry" && "text-cyan-100")}>{value}</p>
    </div>
  );
}
