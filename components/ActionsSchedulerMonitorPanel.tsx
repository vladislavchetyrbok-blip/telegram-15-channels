"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Github, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "ok" | "warning" | "error";

interface MonitorReport {
  status: Status;
  productionStoreMode: "json";
  sourceOfTruth: "json";
  safeToSwitchToSupabase: false;
  workflow: {
    workflowFile: string | null;
    workflowName: string | null;
    hasSchedule: boolean;
    scheduleCron: string[];
    hasWorkflowDispatch: boolean;
    hasPushTrigger: boolean;
    branch: string | null;
    status: Status;
  };
  scheduler: {
    publishSchedulerChanged: boolean;
    hasSchedule: boolean;
    hasWorkflowDispatch: boolean;
    productionStoreMode: string;
    sourceOfTruth: string;
    productionSourceIsJson: boolean;
    safeToSwitchToSupabase: false;
    accidentalPostgresProductionMode: boolean;
  };
  queue: {
    readyPosts: number;
    scheduledPosts: number;
    publishedToday: number;
    failedToday: number;
    skippedToday: number;
    nextDuePost: string | null;
    nextDueChannel: string | null;
    nextDueChannelName: string | null;
    nextDueTime: string | null;
    channelsLinked: number;
    channelsTotal: number;
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
  };
  githubActions: {
    githubApiAvailable: boolean;
    tokenConfigured: boolean;
    repo: string | null;
    latestRuns: Array<{
      id: number;
      name: string | null;
      event: string | null;
      status: string | null;
      conclusion: string | null;
      branch: string | null;
      createdAt: string | null;
      updatedAt: string | null;
      htmlUrl: string | null;
    }>;
    message: string;
  };
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

export function ActionsSchedulerMonitorPanel() {
  const [report, setReport] = useState<MonitorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/actions-scheduler/status", { cache: "no-store" });
      const payload = (await response.json()) as MonitorReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Actions scheduler status request failed.");
      }
      setReport(payload as MonitorReport);
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
            <Github className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">GitHub Actions Monitor</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Actions Scheduler</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only workflow and queue monitor. This page cannot run workflows or publish Telegram posts.</p>
          </div>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh monitor
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-9">
        <Metric label="Overall status" value={labelStatus(report?.status)} tone={toneForStatus(report?.status)} />
        <Metric label="Production source" value="JSON" tone="ok" />
        <Metric label="Workflow file" value={report?.workflow.workflowFile ?? "unknown"} tone="info" />
        <Metric label="Schedule enabled" value={yesNo(report?.workflow.hasSchedule)} tone={report?.workflow.hasSchedule ? "ok" : "warning"} />
        <Metric label="Manual dispatch" value={yesNo(report?.workflow.hasWorkflowDispatch)} tone={report?.workflow.hasWorkflowDispatch ? "ok" : "warning"} />
        <Metric label="Real publish enabled" value={report?.telegram.telegramRealPublishEnabled ?? "unknown"} tone="info" />
        <Metric label="Ready posts" value={String(report?.queue.readyPosts ?? "-")} tone="info" />
        <Metric label="Published today" value={String(report?.queue.publishedToday ?? "-")} tone="ok" />
        <Metric label="Failed today" value={String(report?.queue.failedToday ?? "-")} tone={(report?.queue.failedToday ?? 0) > 0 ? "error" : "ok"} />
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <div className="flex items-center gap-2 text-white">
          <CalendarClock className="h-4 w-4 text-cyan-200" />
          <h2 className="text-base font-semibold">Next due post</h2>
        </div>
        <Rows rows={[
          ["Post", report?.queue.nextDuePost ?? "none"],
          ["Channel", report?.queue.nextDueChannel ?? "none"],
          ["Channel name", report?.queue.nextDueChannelName ?? "none"],
          ["Due time", report?.queue.nextDueTime ?? "none"],
        ]} />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Workflow configuration" icon={<Github className="h-4 w-4" />}>
          <Rows rows={[
            ["Workflow name", report?.workflow.workflowName ?? "unknown"],
            ["Workflow file", report?.workflow.workflowFile ?? "unknown"],
            ["Branch", report?.workflow.branch ?? "unknown"],
            ["Schedule", yesNo(report?.workflow.hasSchedule)],
            ["Workflow dispatch", yesNo(report?.workflow.hasWorkflowDispatch)],
            ["Push trigger", yesNo(report?.workflow.hasPushTrigger)],
            ["Workflow status", report?.workflow.status ?? "unknown"],
          ]} />
        </Panel>

        <Panel title="Schedule / cron" icon={<CalendarClock className="h-4 w-4" />}>
          {report?.workflow.scheduleCron.length ? (
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {report.workflow.scheduleCron.map((cron) => (
                <li key={cron} className="rounded-md border border-line bg-slate-950/50 px-3 py-2">{cron}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No cron schedule found.</p>
          )}
        </Panel>

        <Panel title="Queue status" icon={<CheckCircle2 className="h-4 w-4" />}>
          <Rows rows={[
            ["Ready posts", String(report?.queue.readyPosts ?? "-")],
            ["Scheduled posts", String(report?.queue.scheduledPosts ?? "-")],
            ["Published today", String(report?.queue.publishedToday ?? "-")],
            ["Failed today", String(report?.queue.failedToday ?? "-")],
            ["Skipped today", String(report?.queue.skippedToday ?? "-")],
            ["Channels linked", `${report?.queue.channelsLinked ?? "-"} / ${report?.queue.channelsTotal ?? "-"}`],
          ]} />
        </Panel>

        <Panel title="Telegram safety flags" icon={<ShieldCheck className="h-4 w-4" />}>
          <Rows rows={[
            ["Bot token configured", yesNo(report?.telegram.botTokenConfigured)],
            ["Real publish enabled", report?.telegram.telegramRealPublishEnabled ?? "unset"],
            ["Telegram dry run", report?.telegram.telegramDryRun ?? "unset"],
            ["Autopublish enabled", report?.telegram.autopublishEnabled ?? "unset"],
            ["Autopublish timezone", report?.telegram.autopublishTimezone ?? "unset"],
            ["Daily limit/channel", report?.telegram.autopublishDailyLimitPerChannel ?? "unset"],
            ["Max posts/day", report?.telegram.autopublishMaxPostsPerDay ?? "unset"],
            ["Message send attempted", yesNo(report?.telegram.messageSendAttempted)],
          ]} />
        </Panel>

        <Panel title="GitHub Actions API status" icon={<Github className="h-4 w-4" />}>
          <Rows rows={[
            ["GitHub API available", yesNo(report?.githubActions.githubApiAvailable)],
            ["Token configured", yesNo(report?.githubActions.tokenConfigured)],
            ["Repository", report?.githubActions.repo ?? "unknown"],
            ["Message", report?.githubActions.message ?? "not checked"],
          ]} />
        </Panel>

        <Panel title="Production guard" icon={<ShieldCheck className="h-4 w-4" />}>
          <Rows rows={[
            ["Production store mode", report?.productionStoreMode ?? "json"],
            ["Source of truth", report?.sourceOfTruth ?? "json"],
            ["Safe to switch Supabase", String(report?.safeToSwitchToSupabase ?? false)],
            ["publish-scheduler.yml changed", yesNo(report?.scheduler.publishSchedulerChanged)],
            ["Accidental postgres mode", yesNo(report?.scheduler.accidentalPostgresProductionMode)],
          ]} />
        </Panel>
      </section>

      <Panel title="Latest workflow runs" icon={<Github className="h-4 w-4" />}>
        {report?.githubActions.latestRuns.length ? (
          <div className="overflow-hidden rounded-md border border-line">
            <table className="min-w-full divide-y divide-line text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Run</th>
                  <th className="px-3 py-2">Event</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Branch</th>
                  <th className="px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.githubActions.latestRuns.map((run) => (
                  <tr key={run.id}>
                    <td className="px-3 py-2 font-semibold text-slate-200">{run.htmlUrl ? <a className="text-cyan-200 hover:underline" href={run.htmlUrl} target="_blank" rel="noreferrer">{run.id}</a> : run.id}</td>
                    <td className="px-3 py-2 text-slate-300">{run.event ?? "-"}</td>
                    <td className="px-3 py-2 text-slate-300">{run.status ?? "-"} / {run.conclusion ?? "-"}</td>
                    <td className="px-3 py-2 text-slate-300">{run.branch ?? "-"}</td>
                    <td className="px-3 py-2 text-slate-400">{run.updatedAt ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No workflow runs available from the local read-only check.</p>
        )}
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
    <div className="mt-3 divide-y divide-line rounded-md border border-line">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 px-3 py-2 text-sm">
          <span className="text-slate-500">{label}</span>
          <span className="break-words text-right font-semibold text-slate-200">{value}</span>
        </div>
      ))}
    </div>
  );
}

function TextList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "warning" | "error" }) {
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
