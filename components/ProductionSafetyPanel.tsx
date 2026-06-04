"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Database, GitBranch, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusTone = "ok" | "warning" | "error" | "info";

interface ProductionSafetyReport {
  status: "ok" | "warning" | "error";
  safeForManualPublish: boolean;
  safeForScheduledPublishing: boolean;
  safeToSwitchToSupabase: false;
  productionStoreMode: "json";
  sourceOfTruth: "json";
  checks: {
    git: {
      branch: string | null;
      commit: string | null;
      workingTreeClean: boolean;
      dirtyFileCount: number;
      publishSchedulerChanged: boolean;
      envLocalTracked: boolean;
    };
    production: {
      productionStoreMode: string;
      sourceOfTruth: string;
      publishDueStore: string;
      productionSourceIsJson: boolean;
      safeToSwitchToSupabase: false;
    };
    telegram: {
      botTokenConfigured: boolean;
      realPublishEnabled: string | null;
      dryRun: string | null;
      botAccessCheck: string;
      messageSendAttempted: boolean;
    };
    scheduler: {
      readyPostsCount: number;
      scheduledPostsCount: number;
      publishedTodayCount: number;
      failedTodayCount: number;
      skippedTodayCount: number;
      nextDuePost: { postId: string | null; scheduledAt: string | null } | null;
      nextChannel: { channelId: string | null; channelName: string | null } | null;
    };
    store: {
      synced: boolean;
      counts: {
        json: Record<string, number>;
        supabase: Record<string, number>;
      };
      missingInSupabaseCount: number;
      extraInSupabaseCount: number;
      storeCompareStatus: string;
      dualReadStatus: string;
      mirrorSyncStatus: string;
      safeToRunMirrorSync: boolean;
      safeToSwitchToSupabase: false;
    };
    backup: {
      backupsDirExists: boolean;
      latestBackupTime: string | null;
      latestBackupAgeHours: number | null;
      latestBackupOlderThan24h: boolean;
      latestBackupManifestPresent: boolean;
      latestSupabaseExportExists: boolean;
      backupStatus: string;
    };
  };
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

const countRows = [
  ["channels", "Channels"],
  ["posts", "Posts"],
  ["publication_logs", "Publication logs"],
  ["scheduler_runs", "Scheduler runs"],
] as const;

export function ProductionSafetyPanel() {
  const [report, setReport] = useState<ProductionSafetyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/production-safety/status", { cache: "no-store" });
      const payload = (await response.json()) as ProductionSafetyReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Production safety request failed.");
      }
      setReport(payload as ProductionSafetyReport);
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
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Production Safety</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Safety Control Center</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only status before publish operations. No publishing, Actions runs, migrations, or mirror apply actions are available here.</p>
          </div>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh safety status
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-7">
        <Metric label="Overall status" value={labelStatus(report?.status)} tone={toneForStatus(report?.status)} />
        <Metric label="Production source" value="JSON" tone="ok" />
        <Metric label="Supabase role" value="Mirror only" tone="info" />
        <Metric label="Safe to switch" value="NO" tone="warning" />
        <Metric label="Real publish enabled" value={report?.checks.telegram.realPublishEnabled ?? "unknown"} tone="info" />
        <Metric label="Git tree" value={report?.checks.git.workingTreeClean ? "clean" : "dirty"} tone={report?.checks.git.workingTreeClean ? "ok" : "warning"} />
        <Metric label="Backup age" value={formatAge(report?.checks.backup.latestBackupAgeHours)} tone={report?.checks.backup.latestBackupOlderThan24h ? "warning" : "ok"} />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Telegram safety" icon={<ShieldCheck className="h-4 w-4" />}>
          <Rows rows={[
            ["Bot token configured", yesNo(report?.checks.telegram.botTokenConfigured)],
            ["Real publish enabled", report?.checks.telegram.realPublishEnabled ?? "unset"],
            ["Telegram dry run", report?.checks.telegram.dryRun ?? "unset"],
            ["Bot access check", report?.checks.telegram.botAccessCheck ?? "not_run"],
            ["Message send attempted", yesNo(report?.checks.telegram.messageSendAttempted)],
          ]} />
        </Panel>

        <Panel title="Scheduler / queue" icon={<CheckCircle2 className="h-4 w-4" />}>
          <Rows rows={[
            ["Ready posts", String(report?.checks.scheduler.readyPostsCount ?? "-")],
            ["Scheduled posts", String(report?.checks.scheduler.scheduledPostsCount ?? "-")],
            ["Published today", String(report?.checks.scheduler.publishedTodayCount ?? "-")],
            ["Failed today", String(report?.checks.scheduler.failedTodayCount ?? "-")],
            ["Skipped today", String(report?.checks.scheduler.skippedTodayCount ?? "-")],
            ["Next due post", report?.checks.scheduler.nextDuePost?.postId ?? "none"],
            ["Next channel", report?.checks.scheduler.nextChannel?.channelId ?? "none"],
          ]} />
        </Panel>

        <Panel title="JSON ↔ Supabase sync" icon={<Database className="h-4 w-4" />}>
          <Rows rows={[
            ["Synced", yesNo(report?.checks.store.synced)],
            ["Store compare", report?.checks.store.storeCompareStatus ?? "unknown"],
            ["Dual-read", report?.checks.store.dualReadStatus ?? "unknown"],
            ["Missing in Supabase", String(report?.checks.store.missingInSupabaseCount ?? "-")],
            ["Extra in Supabase", String(report?.checks.store.extraInSupabaseCount ?? "-")],
            ["Safe to switch", "false"],
          ]} />
          <div className="mt-3 overflow-hidden rounded-md border border-line">
            <table className="min-w-full divide-y divide-line text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2 text-right">JSON</th>
                  <th className="px-3 py-2 text-right">Supabase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {countRows.map(([key, label]) => (
                  <tr key={key}>
                    <td className="px-3 py-2 font-semibold text-slate-200">{label}</td>
                    <td className="px-3 py-2 text-right text-slate-300">{report?.checks.store.counts.json[key] ?? "-"}</td>
                    <td className="px-3 py-2 text-right text-slate-300">{report?.checks.store.counts.supabase[key] ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Mirror sync" icon={<Database className="h-4 w-4" />}>
          <Rows rows={[
            ["Status", report?.checks.store.mirrorSyncStatus ?? "unknown"],
            ["Safe to run dry mirror check", yesNo(report?.checks.store.safeToRunMirrorSync)],
            ["Apply available here", "no"],
            ["Delete mode", "disabled"],
            ["Update existing", "disabled"],
          ]} />
        </Panel>

        <Panel title="Backups" icon={<ShieldCheck className="h-4 w-4" />}>
          <Rows rows={[
            ["data/backups exists", yesNo(report?.checks.backup.backupsDirExists)],
            ["Latest backup", report?.checks.backup.latestBackupTime ?? "none"],
            ["Latest backup age", formatAge(report?.checks.backup.latestBackupAgeHours)],
            ["Backup manifest", yesNo(report?.checks.backup.latestBackupManifestPresent)],
            ["Supabase export", yesNo(report?.checks.backup.latestSupabaseExportExists)],
            ["Backup status", report?.checks.backup.backupStatus ?? "unknown"],
          ]} />
        </Panel>

        <Panel title="Git / workflow safety" icon={<GitBranch className="h-4 w-4" />}>
          <Rows rows={[
            ["Branch", report?.checks.git.branch ?? "unknown"],
            ["Commit", shortCommit(report?.checks.git.commit)],
            ["Working tree", report?.checks.git.workingTreeClean ? "clean" : `dirty (${report?.checks.git.dirtyFileCount ?? 0})`],
            ["publish-scheduler.yml changed", yesNo(report?.checks.git.publishSchedulerChanged)],
            [".env.local tracked", yesNo(report?.checks.git.envLocalTracked)],
          ]} />
        </Panel>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={report?.warnings ?? []} empty="No warnings." tone="warning" />
        <TextList title="Errors" items={report?.errors ?? []} empty="No errors." tone="error" />
      </section>

      <p className="text-xs leading-5 text-slate-500">Last checked: {report?.lastCheckedAt ?? "not checked yet"}</p>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", toneClass(tone))}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-sm font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <div className="flex items-center gap-2 text-white">
        <span className="text-cyan-200">{icon}</span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm">
          <span className="text-slate-500">{label}</span>
          <span className="break-words text-right font-semibold text-slate-200">{value}</span>
        </div>
      ))}
    </div>
  );
}

function TextList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: StatusTone }) {
  return (
    <section className={cn("rounded-lg border p-4", items.length ? toneClass(tone) : "border-line bg-panel/82")}>
      <div className="flex items-center gap-2">
        {items.length ? <AlertTriangle className="h-4 w-4 text-amber-200" /> : <CheckCircle2 className="h-4 w-4 text-emerald-200" />}
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
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

function labelStatus(status?: string) {
  if (!status) return "loading";
  return status.toUpperCase();
}

function toneForStatus(status?: string): StatusTone {
  if (status === "ok") return "ok";
  if (status === "error") return "error";
  if (status === "warning") return "warning";
  return "info";
}

function toneClass(tone: StatusTone) {
  return cn(
    tone === "ok" && "border-emerald-300/25 bg-emerald-300/10",
    tone === "warning" && "border-amber-300/25 bg-amber-300/10",
    tone === "error" && "border-rose-300/25 bg-rose-300/10",
    tone === "info" && "border-sky-300/25 bg-sky-300/10",
  );
}

function yesNo(value: boolean | undefined) {
  if (value === undefined) return "unknown";
  return value ? "yes" : "no";
}

function shortCommit(value: string | null | undefined) {
  return value ? value.slice(0, 7) : "unknown";
}

function formatAge(value: number | null | undefined) {
  if (typeof value !== "number") return "unknown";
  if (value < 1) return `${Math.round(value * 60)} min`;
  return `${value.toFixed(1)} h`;
}
