"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type StoreKey = "channels" | "posts" | "publication_logs" | "scheduler_runs";
type Counts = Record<StoreKey, number>;
type DuplicateItem = { id: string; count: number };
type DuplicateGroups = Record<StoreKey, DuplicateItem[]>;

interface StoreCompareReport {
  ok: boolean;
  status: "ok" | "warning" | "error";
  checkedAt: string;
  supabaseConfigured: boolean;
  message?: string;
  localCounts: Counts;
  supabaseCounts: Counts;
  missingInSupabase: Record<StoreKey, string[]>;
  extraInSupabase: Record<StoreKey, string[]>;
  duplicates: {
    local: DuplicateGroups;
    supabase: DuplicateGroups;
  };
  warnings: string[];
  problems: string[];
}

const storeRows: Array<{ key: StoreKey; label: string }> = [
  { key: "channels", label: "channels" },
  { key: "posts", label: "posts" },
  { key: "publication_logs", label: "publication logs" },
  { key: "scheduler_runs", label: "scheduler runs" },
];

export function StoreComparePanel() {
  const [report, setReport] = useState<StoreCompareReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayStatus = useMemo(() => {
    if (!report) return "loading";
    if (!report.supabaseConfigured) return "supabase unavailable";
    if (report.status === "ok") return "synced";
    if (report.status === "warning") return "mismatch";
    return "supabase unavailable";
  }, [report]);

  async function loadReport() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/store-compare", { cache: "no-store" });
      const payload = (await response.json()) as StoreCompareReport | { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Store compare request failed.");
      }
      setReport(payload as StoreCompareReport);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, []);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">JSON - Supabase</p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Store compare</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Read-only audit for the local JSON store and the Supabase mirror.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadReport()}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh compare
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {storeRows.map((row) => (
          <Metric key={`json-${row.key}`} label={`JSON ${row.label}`} value={String(report?.localCounts?.[row.key] ?? "-")} tone="json" />
        ))}
        {storeRows.map((row) => (
          <Metric key={`supabase-${row.key}`} label={`Supabase ${row.label}`} value={String(report?.supabaseCounts?.[row.key] ?? "-")} tone="supabase" />
        ))}
      </section>

      <section className={cn("rounded-lg border p-4", statusClass(report?.status, report?.supabaseConfigured))}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">status</p>
            <p className="mt-1 text-xl font-semibold text-white">{displayStatus}</p>
          </div>
          <p className="text-sm text-slate-400">{report?.checkedAt ?? "not checked yet"}</p>
        </div>
        {report?.message ? <p className="mt-3 text-sm leading-6 text-slate-300">{report.message}</p> : null}
        {error ? <p className="mt-3 text-sm leading-6 text-rose-100">{error}</p> : null}
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <IdTable title="Missing in Supabase" groups={report?.missingInSupabase} empty="No missing IDs." />
        <IdTable title="Extra in Supabase" groups={report?.extraInSupabase} empty="No extra IDs." />
        <DuplicateTable title="Duplicates in JSON" groups={report?.duplicates.local} empty="No JSON duplicates." />
        <DuplicateTable title="Duplicates in Supabase" groups={report?.duplicates.supabase} empty="No Supabase duplicates." />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={report?.warnings ?? []} empty="No warnings." />
        <TextList title="Problems" items={report?.problems ?? []} empty="No problems." />
      </section>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "json" | "supabase" }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", tone === "json" ? "border-sky-300/25 bg-sky-300/10" : "border-emerald-300/25 bg-emerald-300/10")}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-xl font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function IdTable({ title, groups, empty }: { title: string; groups?: Record<StoreKey, string[]>; empty: string }) {
  const rows = storeRows.flatMap((row) => (groups?.[row.key] ?? []).map((id) => ({ table: row.key, id })));

  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {rows.length ? (
        <div className="mt-3 max-h-72 overflow-auto rounded-md border border-line">
          <table className="min-w-full divide-y divide-line text-left text-xs">
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={`${row.table}-${row.id}`}>
                  <td className="w-40 px-3 py-2 font-semibold text-slate-300">{row.table}</td>
                  <td className="px-3 py-2 text-slate-400">{row.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      )}
    </section>
  );
}

function DuplicateTable({ title, groups, empty }: { title: string; groups?: DuplicateGroups; empty: string }) {
  const rows = storeRows.flatMap((row) => (groups?.[row.key] ?? []).map((item) => ({ table: row.key, ...item })));

  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {rows.length ? (
        <div className="mt-3 max-h-72 overflow-auto rounded-md border border-line">
          <table className="min-w-full divide-y divide-line text-left text-xs">
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={`${row.table}-${row.id}`}>
                  <td className="w-40 px-3 py-2 font-semibold text-slate-300">{row.table}</td>
                  <td className="px-3 py-2 text-slate-400">{row.id}</td>
                  <td className="w-20 px-3 py-2 text-right font-semibold text-amber-100">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

function statusClass(status?: string, supabaseConfigured = true) {
  if (!supabaseConfigured || status === "error") return "border-rose-300/25 bg-rose-300/10";
  if (status === "warning") return "border-amber-300/25 bg-amber-300/10";
  return "border-emerald-300/25 bg-emerald-300/10";
}
