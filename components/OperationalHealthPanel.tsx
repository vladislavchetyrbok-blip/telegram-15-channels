"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Activity, AlertTriangle, CheckCircle2, Database, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "ok" | "warning" | "error";

interface HealthReport {
  status: Status;
  productionStoreMode: "json";
  sourceOfTruth: "json";
  safeToSwitchToSupabase: false;
  whyNotPublishing: string[];
  queue: {
    readyPosts: number;
    scheduledPosts: number;
    publishedPosts: number;
    failedPosts: number;
    skippedPosts: number;
    blockedPosts: number;
    postsWithoutImages: number;
    weakTextCount: number;
    weakImageCount: number;
    nextDuePost: string | null;
    nextDueChannel: string | null;
    nextDueChannelName: string | null;
    nextDueTime: string | null;
  };
  logs: {
    recentLogs: LogRow[];
    failedLogs: LogRow[];
    skippedLogs: LogRow[];
    lastSuccessfulPublication: LogRow | null;
    lastFailedPublication: LogRow | null;
    failedToday: number;
    publishedToday: number;
    skippedToday: number;
    groupedErrorReasons: Array<{ reason: string; count: number }>;
  };
  scheduler: {
    recentRuns: SchedulerRun[];
    lastSchedulerRunTime: string | null;
    lastSchedulerStatus: string;
    lastSchedulerError: string | null;
    nextExpectedRun: string | null;
    schedulerHealth: Status;
  };
  contentQuality: {
    weakTextCount: number;
    weakImageCount: number;
    postsWithoutImages: number;
    genericPhraseCount: number;
    serviceLabelCount: number;
    blockReasonCount: number;
    problematicPosts: ProblemPost[];
  };
  telegram: {
    botTokenConfigured: boolean;
    telegramRealPublishEnabled: string | null;
    telegramDryRun: string | null;
    autopublishEnabled: string | null;
    autopublishTimezone: string | null;
    autopublishDailyLimitPerChannel: string | null;
    autopublishMaxPostsPerDay: string | null;
    messageSendAttempted: boolean;
    postPublishAttempted: boolean;
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
    safeToSwitchToSupabase: false;
  };
  backups: {
    latestBackupTime: string | null;
    latestBackupAgeHours: number | null;
    latestBackupOlderThan24h: boolean;
    latestSupabaseExportExists: boolean;
    latestBackupManifestPresent: boolean;
    backupStatus: string;
  };
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface LogRow {
  id: string | null;
  runId: string | null;
  source: string | null;
  channelId: string | null;
  postId: string | null;
  status: string;
  message: string | null;
  dryRun: boolean | null;
  createdAt: string | null;
}

interface SchedulerRun {
  runId: string | null;
  source: string | null;
  storeMode: string;
  dryRun: boolean;
  realPublishEnabled: boolean;
  checked: number;
  published: number;
  skipped: number;
  errors: number;
  message: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  updatedAt: string | null;
  lastError: string | null;
}

interface ProblemPost {
  id: string | null;
  channel: string | null;
  title: string | null;
  issue: string;
}

const countRows = [
  ["channels", "Channels"],
  ["posts", "Posts"],
  ["publication_logs", "Publication logs"],
  ["scheduler_runs", "Scheduler runs"],
] as const;

export function OperationalHealthPanel() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/operational-health/status", { cache: "no-store" });
      const payload = (await response.json()) as HealthReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Operational health request failed.");
      }
      setReport(payload as HealthReport);
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
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Operational Health</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Logs & Health</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only diagnostics for queue, logs, scheduler, content quality, store sync, and backups.</p>
          </div>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh health
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <Metric label="Overall status" value={labelStatus(report?.status)} tone={toneForStatus(report?.status)} />
        <Metric label="Why not publishing" value={shortReason(report?.whyNotPublishing)} tone={report?.whyNotPublishing.length ? "warning" : "ok"} />
        <Metric label="Ready posts" value={String(report?.queue.readyPosts ?? "-")} tone="info" />
        <Metric label="Scheduled posts" value={String(report?.queue.scheduledPosts ?? "-")} tone="info" />
        <Metric label="Published today" value={String(report?.logs.publishedToday ?? "-")} tone="ok" />
        <Metric label="Failed today" value={String(report?.logs.failedToday ?? "-")} tone={(report?.logs.failedToday ?? 0) > 0 ? "error" : "ok"} />
        <Metric label="Skipped today" value={String(report?.logs.skippedToday ?? "-")} tone={(report?.logs.skippedToday ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Next due post" value={report?.queue.nextDuePost ?? "none"} tone="info" />
        <Metric label="Last success" value={report?.logs.lastSuccessfulPublication?.createdAt ?? "none"} tone="ok" />
        <Metric label="Last failed" value={report?.logs.lastFailedPublication?.createdAt ?? "none"} tone={report?.logs.lastFailedPublication ? "warning" : "ok"} />
        <Metric label="Last scheduler run" value={report?.scheduler.lastSchedulerRunTime ?? "none"} tone={toneForStatus(report?.scheduler.schedulerHealth)} />
        <Metric label="Backup age" value={formatAge(report?.backups.latestBackupAgeHours)} tone={report?.backups.latestBackupOlderThan24h ? "warning" : "ok"} />
        <Metric label="Store synced" value={yesNo(report?.store.synced)} tone={report?.store.synced ? "ok" : "error"} />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Queue health" icon={<Activity className="h-4 w-4" />}>
          <Rows rows={[
            ["Ready posts", String(report?.queue.readyPosts ?? "-")],
            ["Scheduled posts", String(report?.queue.scheduledPosts ?? "-")],
            ["Published posts", String(report?.queue.publishedPosts ?? "-")],
            ["Failed posts", String(report?.queue.failedPosts ?? "-")],
            ["Skipped posts", String(report?.queue.skippedPosts ?? "-")],
            ["Blocked posts", String(report?.queue.blockedPosts ?? "-")],
            ["Next due channel", report?.queue.nextDueChannel ?? "none"],
            ["Next due time", report?.queue.nextDueTime ?? "none"],
          ]} />
        </Panel>

        <Panel title="Telegram safety flags" icon={<ShieldCheck className="h-4 w-4" />}>
          <Rows rows={[
            ["Bot token configured", yesNo(report?.telegram.botTokenConfigured)],
            ["Real publish enabled", report?.telegram.telegramRealPublishEnabled ?? "unset"],
            ["Telegram dry run", report?.telegram.telegramDryRun ?? "unset"],
            ["Autopublish enabled", report?.telegram.autopublishEnabled ?? "unset"],
            ["Timezone", report?.telegram.autopublishTimezone ?? "unset"],
            ["Daily limit/channel", report?.telegram.autopublishDailyLimitPerChannel ?? "unset"],
            ["Max posts/day", report?.telegram.autopublishMaxPostsPerDay ?? "unset"],
            ["Publish attempted here", yesNo(report?.telegram.postPublishAttempted)],
          ]} />
        </Panel>

        <Panel title="JSON ↔ Supabase sync" icon={<Database className="h-4 w-4" />}>
          <Rows rows={[
            ["Source of truth", report?.sourceOfTruth ?? "json"],
            ["Production store", report?.productionStoreMode ?? "json"],
            ["Synced", yesNo(report?.store.synced)],
            ["Missing in Supabase", String(report?.store.missingInSupabaseCount ?? "-")],
            ["Extra in Supabase", String(report?.store.extraInSupabaseCount ?? "-")],
            ["Safe to switch", String(report?.safeToSwitchToSupabase ?? false)],
          ]} />
          <div className="mt-3 overflow-hidden rounded-md border border-line">
            <table className="min-w-full divide-y divide-line text-left text-sm">
              <tbody className="divide-y divide-line">
                {countRows.map(([key, label]) => (
                  <tr key={key}>
                    <td className="px-3 py-2 font-semibold text-slate-200">{label}</td>
                    <td className="px-3 py-2 text-right text-slate-300">JSON {report?.store.counts.json[key] ?? "-"}</td>
                    <td className="px-3 py-2 text-right text-slate-300">Supabase {report?.store.counts.supabase[key] ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Backup status" icon={<ShieldCheck className="h-4 w-4" />}>
          <Rows rows={[
            ["Latest backup", report?.backups.latestBackupTime ?? "none"],
            ["Backup age", formatAge(report?.backups.latestBackupAgeHours)],
            ["Manifest present", yesNo(report?.backups.latestBackupManifestPresent)],
            ["Supabase export", yesNo(report?.backups.latestSupabaseExportExists)],
            ["Backup status", report?.backups.backupStatus ?? "unknown"],
          ]} />
        </Panel>
      </section>

      <Panel title="Why not publishing" icon={<AlertTriangle className="h-4 w-4" />}>
        <TextItems items={report?.whyNotPublishing ?? []} empty="No blocking reason detected." />
      </Panel>

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Content quality problems" icon={<FileText className="h-4 w-4" />}>
          <Rows rows={[
            ["Weak texts", String(report?.contentQuality.weakTextCount ?? "-")],
            ["Weak images", String(report?.contentQuality.weakImageCount ?? "-")],
            ["Posts without images", String(report?.contentQuality.postsWithoutImages ?? "-")],
            ["Generic phrase posts", String(report?.contentQuality.genericPhraseCount ?? "-")],
            ["Service label posts", String(report?.contentQuality.serviceLabelCount ?? "-")],
            ["Block reason posts", String(report?.contentQuality.blockReasonCount ?? "-")],
          ]} />
        </Panel>

        <Panel title="Scheduler runs" icon={<Activity className="h-4 w-4" />}>
          <Rows rows={[
            ["Health", report?.scheduler.schedulerHealth ?? "unknown"],
            ["Last status", report?.scheduler.lastSchedulerStatus ?? "unknown"],
            ["Last run", report?.scheduler.lastSchedulerRunTime ?? "none"],
            ["Next expected run", report?.scheduler.nextExpectedRun ?? "unknown"],
            ["Last error", report?.scheduler.lastSchedulerError ?? "none"],
          ]} />
        </Panel>
      </section>

      <Panel title="Recent publication logs" icon={<FileText className="h-4 w-4" />}>
        <LogsTable rows={report?.logs.recentLogs ?? []} />
      </Panel>

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Recent scheduler runs" icon={<Activity className="h-4 w-4" />}>
          <SchedulerTable rows={report?.scheduler.recentRuns ?? []} />
        </Panel>

        <Panel title="Problematic posts" icon={<AlertTriangle className="h-4 w-4" />}>
          <ProblemPostsTable rows={report?.contentQuality.problematicPosts ?? []} />
        </Panel>
      </section>

      <Panel title="Failed / skipped reasons" icon={<AlertTriangle className="h-4 w-4" />}>
        <ReasonsTable rows={report?.logs.groupedErrorReasons ?? []} />
      </Panel>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={report?.warnings ?? []} empty="No warnings." tone="warning" />
        <TextList title="Errors" items={report?.errors ?? []} empty="No errors." tone="error" />
      </section>

      <p className="text-xs leading-5 text-slate-500">Last checked: {report?.lastCheckedAt ?? "not checked yet"}</p>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "ok" | "warning" | "error" | "info" }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", toneClass(tone))}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-sm font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <div className="mb-3 flex items-center gap-2 text-white">
        <span className="text-cyan-200">{icon}</span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
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

function LogsTable({ rows }: { rows: LogRow[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No publication logs.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-line">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Channel</th>
            <th className="px-3 py-2">Post</th>
            <th className="px-3 py-2">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr key={row.id ?? `${row.createdAt}-${index}`}>
              <td className="px-3 py-2 text-slate-400">{row.createdAt ?? "-"}</td>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.status}</td>
              <td className="px-3 py-2 text-slate-300">{row.channelId ?? "-"}</td>
              <td className="px-3 py-2 text-slate-300">{row.postId ?? "-"}</td>
              <td className="px-3 py-2 text-slate-400">{row.message ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SchedulerTable({ rows }: { rows: SchedulerRun[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No scheduler runs.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-line">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.runId ?? row.updatedAt ?? "scheduler-run"}>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.runId ?? "-"}</td>
              <td className="px-3 py-2 text-slate-300">checked {row.checked}</td>
              <td className="px-3 py-2 text-slate-300">published {row.published}</td>
              <td className="px-3 py-2 text-slate-300">skipped {row.skipped}</td>
              <td className="px-3 py-2 text-slate-300">errors {row.errors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProblemPostsTable({ rows }: { rows: ProblemPost[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No problematic posts detected.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-line">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr key={row.id ?? `${row.channel}-${index}`}>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.id ?? "-"}</td>
              <td className="px-3 py-2 text-slate-300">{row.channel ?? "-"}</td>
              <td className="px-3 py-2 text-slate-300">{row.title ?? "-"}</td>
              <td className="px-3 py-2 text-slate-400">{row.issue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReasonsTable({ rows }: { rows: Array<{ reason: string; count: number }> }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No grouped failed or skipped reasons.</p>;
  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {rows.map((row) => (
        <div key={row.reason} className="grid grid-cols-[minmax(0,1fr)_5rem] gap-3 px-3 py-2 text-sm">
          <span className="break-words text-slate-300">{row.reason}</span>
          <span className="text-right font-semibold text-white">{row.count}</span>
        </div>
      ))}
    </div>
  );
}

function TextItems({ items, empty }: { items: string[]; empty: string }) {
  return items.length ? (
    <ul className="space-y-2 text-sm leading-6 text-slate-300">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-slate-500">{empty}</p>
  );
}

function TextList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "warning" | "error" }) {
  return (
    <section className={cn("rounded-lg border p-4", items.length ? toneClass(tone) : "border-line bg-panel/82")}>
      <div className="flex items-center gap-2">
        {items.length ? <AlertTriangle className="h-4 w-4 text-amber-200" /> : <CheckCircle2 className="h-4 w-4 text-emerald-200" />}
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {items.length ? <TextItems items={items} empty={empty} /> : <p className="mt-3 text-sm text-slate-500">{empty}</p>}
    </section>
  );
}

function labelStatus(status?: string) {
  return status ? status.toUpperCase() : "loading";
}

function toneForStatus(status?: string) {
  if (status === "ok") return "ok";
  if (status === "error") return "error";
  if (status === "warning") return "warning";
  return "info";
}

function toneClass(tone: "ok" | "warning" | "error" | "info") {
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

function shortReason(items: string[] | undefined) {
  return items?.[0] ?? "none";
}

function formatAge(value: number | null | undefined) {
  if (typeof value !== "number") return "unknown";
  if (value < 1) return `${Math.round(value * 60)} min`;
  return `${value.toFixed(1)} h`;
}
