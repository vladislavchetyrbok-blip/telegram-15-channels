"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type StoreKey = "channels" | "posts" | "publication_logs" | "scheduler_runs";
type Counts = Record<StoreKey, number>;
type IdGroups = Record<StoreKey, string[]>;

interface MirrorSyncStatus {
  sourceOfTruth: "json";
  productionStoreMode: "json";
  supabaseMirrorConfigured: boolean;
  localCounts: Counts;
  supabaseCounts: Counts;
  missingInSupabase: IdGroups;
  extraInSupabase: IdGroups;
  synced: boolean;
  safeToRunMirrorSync: boolean;
  safeToSwitchToSupabase: false;
  lastCheckedAt: string;
  warnings: string[];
  problems: string[];
}

const rows: Array<{ key: StoreKey; label: string }> = [
  { key: "channels", label: "Channels" },
  { key: "posts", label: "Posts" },
  { key: "publication_logs", label: "Publication logs" },
  { key: "scheduler_runs", label: "Scheduler runs" },
];

export function MirrorSyncStatusPanel() {
  const [status, setStatus] = useState<MirrorSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const missingTotal = useMemo(() => totalIds(status?.missingInSupabase), [status]);
  const extraTotal = useMemo(() => totalIds(status?.extraInSupabase), [status]);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/mirror-sync/status", { cache: "no-store" });
      const payload = (await response.json()) as MirrorSyncStatus | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Mirror sync status request failed.");
      }
      setStatus(payload as MirrorSyncStatus);
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
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Supabase mirror sync</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Insert-only mirror status</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only page. JSON remains production source; browser apply sync is intentionally unavailable.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh status
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Production source" value="JSON" tone="ok" />
        <Metric label="Supabase role" value="mirror" tone="info" />
        <Metric label="Sync mode" value="insert-only" tone="ok" />
        <Metric label="Safe to switch" value="false" tone="warn" />
        <Metric label="Delete mode" value="disabled" tone="ok" />
        <Metric label="Update existing" value="disabled" tone="ok" />
        <Metric label="Missing in Supabase" value={String(missingTotal)} tone={missingTotal === 0 ? "ok" : "warn"} />
        <Metric label="Extra in Supabase" value={String(extraTotal)} tone={extraTotal === 0 ? "ok" : "warn"} />
      </section>

      <section className={cn("rounded-lg border p-4", status?.synced ? "border-emerald-300/25 bg-emerald-300/10" : "border-amber-300/25 bg-amber-300/10")}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Synced</p>
            <p className="mt-1 text-xl font-semibold text-white">{status?.synced ? "yes" : "no"}</p>
          </div>
          <p className="text-sm text-slate-400">{status?.lastCheckedAt ?? "not checked yet"}</p>
        </div>
        <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-300">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
          <p>Mirror sync can only insert missing Supabase records from JSON. It does not delete, update, publish, or switch production store mode.</p>
        </div>
        {error ? <p className="mt-3 text-sm leading-6 text-rose-100">{error}</p> : null}
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <h2 className="text-base font-semibold text-white">Counts JSON vs Supabase</h2>
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
                  <td className="px-3 py-2 text-right text-slate-300">{status?.localCounts?.[row.key] ?? "-"}</td>
                  <td className="px-3 py-2 text-right text-slate-300">{status?.supabaseCounts?.[row.key] ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <IdList title="Missing in Supabase" groups={status?.missingInSupabase} empty="No missing IDs." />
        <IdList title="Extra in Supabase" groups={status?.extraInSupabase} empty="No extra IDs." />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={status?.warnings ?? []} empty="No warnings." />
        <TextList title="Problems" items={status?.problems ?? []} empty="No problems." />
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

function IdList({ title, groups, empty }: { title: string; groups?: IdGroups; empty: string }) {
  const ids = rows.flatMap((row) => (groups?.[row.key] ?? []).map((id) => `${row.key}: ${id}`));

  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {ids.length ? (
        <ul className="mt-3 max-h-72 space-y-2 overflow-auto text-sm leading-6 text-slate-400">
          {ids.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      )}
    </section>
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

function totalIds(groups?: IdGroups) {
  if (!groups) return 0;
  return rows.reduce((total, row) => total + groups[row.key].length, 0);
}
