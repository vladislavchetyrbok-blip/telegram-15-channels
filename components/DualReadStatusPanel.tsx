"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type StoreKey = "channels" | "posts" | "publication_logs" | "scheduler_runs";
type Counts = Record<StoreKey, number>;

interface DualReadReport {
  status: "ok" | "warning" | "error";
  productionStoreMode: "json";
  supabaseMirrorConfigured: boolean;
  sourceOfTruth: "json";
  jsonCounts: Counts;
  supabaseCounts: Counts;
  synced: boolean;
  warnings: string[];
  problems: string[];
  lastCheckedAt: string;
  safeToSwitchToSupabase: false;
}

const rows: Array<{ key: StoreKey; label: string }> = [
  { key: "channels", label: "Channels" },
  { key: "posts", label: "Posts" },
  { key: "publication_logs", label: "Publication logs" },
  { key: "scheduler_runs", label: "Scheduler runs" },
];

export function DualReadStatusPanel() {
  const [report, setReport] = useState<DualReadReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    if (!report) return "loading";
    if (!report.supabaseMirrorConfigured) return "supabase unavailable";
    return report.synced ? "synced" : "mismatch";
  }, [report]);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/dual-read-status", { cache: "no-store" });
      const payload = (await response.json()) as DualReadReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Dual-read status request failed.");
      }
      setReport(payload as DualReadReport);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Dual-read status</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">JSON source with Supabase mirror</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only check. JSON remains the source of truth; Supabase is only a mirror.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Production source" value="JSON" tone="ok" />
        <Metric label="Supabase role" value="read-only mirror" tone="info" />
        <Metric label="Synced" value={report?.synced ? "yes" : "no"} tone={report?.synced ? "ok" : "warn"} />
        <Metric label="Safe to switch" value="false" tone="warn" />
      </section>

      <section className={cn("rounded-lg border p-4", report?.status === "ok" ? "border-emerald-300/25 bg-emerald-300/10" : report?.status === "warning" ? "border-amber-300/25 bg-amber-300/10" : "border-rose-300/25 bg-rose-300/10")}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">status</p>
            <p className="mt-1 text-xl font-semibold text-white">{statusLabel}</p>
          </div>
          <p className="text-sm text-slate-400">{report?.lastCheckedAt ?? "not checked yet"}</p>
        </div>
        <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-300">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
          <p>sourceOfTruth: {report?.sourceOfTruth ?? "json"}; productionStoreMode: json; Supabase switch remains blocked for this stage.</p>
        </div>
        {error ? <p className="mt-3 text-sm leading-6 text-rose-100">{error}</p> : null}
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <h2 className="text-base font-semibold text-white">JSON vs Supabase counts</h2>
        <div className="mt-3 overflow-hidden rounded-md border border-line">
          <table className="min-w-full divide-y divide-line text-left text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-3 py-2">Store item</th>
                <th className="px-3 py-2 text-right">JSON</th>
                <th className="px-3 py-2 text-right">Supabase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-3 py-2 font-semibold text-slate-200">{row.label}</td>
                  <td className="px-3 py-2 text-right text-slate-300">{report?.jsonCounts?.[row.key] ?? "-"}</td>
                  <td className="px-3 py-2 text-right text-slate-300">{report?.supabaseCounts?.[row.key] ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={report?.warnings ?? []} empty="No warnings." />
        <TextList title="Problems" items={report?.problems ?? []} empty="No problems." />
      </section>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "info" }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", tone === "ok" && "border-emerald-300/25 bg-emerald-300/10", tone === "warn" && "border-amber-300/25 bg-amber-300/10", tone === "info" && "border-sky-300/25 bg-sky-300/10")}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-lg font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function TextList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      )}
    </section>
  );
}
