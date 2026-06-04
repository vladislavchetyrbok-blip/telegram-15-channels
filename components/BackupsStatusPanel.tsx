"use client";

import { useEffect, useState } from "react";
import { Archive, Eye, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Counts = Record<string, number>;

interface BackupFolder {
  name: string;
  path: string;
  createdAt: string;
  hasManifest: boolean;
}

interface BackupStatus {
  ok: boolean;
  status: "ok" | "warning" | "error";
  backups: BackupFolder[];
  latestBackup: BackupFolder | null;
  latestManifest: any | null;
  current: {
    gitCommit: string | null;
    gitBranch: string | null;
    jsonCounts: Counts | null;
    supabaseCounts: Counts | null;
    synced: boolean;
    checkedAt: string;
  };
  warnings: string[];
  problems: string[];
}

export function BackupsStatusPanel() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLatest, setShowLatest] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/backups/status", { cache: "no-store" });
      const payload = (await response.json()) as BackupStatus | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Backup status request failed.");
      }
      setStatus(payload as BackupStatus);
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
            <Archive className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Backups</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Backup / Restore / Export Center</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only admin view. Backup creation and restore checks stay in CLI commands.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
          <button type="button" onClick={() => setShowLatest((value) => !value)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line bg-slate-950/70 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
            <Eye className="h-4 w-4" />
            View latest backup info
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Last backup" value={status?.latestBackup?.createdAt ?? "none"} tone={status?.latestBackup ? "ok" : "warn"} />
        <Metric label="Git commit" value={shortCommit(status?.current.gitCommit)} tone="info" />
        <Metric label="Synced" value={status?.current.synced ? "yes" : "no"} tone={status?.current.synced ? "ok" : "warn"} />
        <Metric label="Status" value={status?.status ?? "loading"} tone={status?.status === "ok" ? "ok" : "warn"} />
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <CountsPanel title="Current JSON counts" counts={status?.current.jsonCounts} />
        <CountsPanel title="Current Supabase counts" counts={status?.current.supabaseCounts} />
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <h2 className="text-base font-semibold text-white">Recent backup folders</h2>
        {status?.backups.length ? (
          <div className="mt-3 overflow-hidden rounded-md border border-line">
            <table className="min-w-full divide-y divide-line text-left text-sm">
              <tbody className="divide-y divide-line">
                {status.backups.map((backup) => (
                  <tr key={backup.name}>
                    <td className="px-3 py-2 font-semibold text-slate-200">{backup.name}</td>
                    <td className="px-3 py-2 text-slate-400">{backup.createdAt}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{backup.hasManifest ? "manifest" : "no manifest"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No backups found.</p>
        )}
      </section>

      {showLatest ? (
        <section className="rounded-lg border border-line bg-panel/82 p-4">
          <h2 className="text-base font-semibold text-white">Latest backup manifest</h2>
          <pre className="mt-3 max-h-96 overflow-auto rounded-md border border-line bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">{JSON.stringify(status?.latestManifest ?? null, null, 2)}</pre>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={status?.warnings ?? []} empty="No warnings." />
        <TextList title="Problems" items={status?.problems ?? []} empty="No problems." />
      </section>

      {error ? <p className="text-sm leading-6 text-rose-100">{error}</p> : null}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "info" }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", tone === "ok" && "border-emerald-300/25 bg-emerald-300/10", tone === "warn" && "border-amber-300/25 bg-amber-300/10", tone === "info" && "border-sky-300/25 bg-sky-300/10")}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-sm font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function CountsPanel({ title, counts }: { title: string; counts: Counts | null | undefined }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {["channels", "posts", "publication_logs", "scheduler_runs"].map((key) => (
          <div key={key} className="rounded-md border border-line bg-slate-950/50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{key}</p>
            <p className="mt-1 text-lg font-semibold text-white">{counts?.[key] ?? "-"}</p>
          </div>
        ))}
      </div>
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

function shortCommit(value: string | null | undefined) {
  return value ? value.slice(0, 7) : "unknown";
}
