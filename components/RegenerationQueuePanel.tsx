"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "excellent" | "good" | "warning" | "bad" | "blocked";
type RegenerationType = "text" | "image" | "both" | "manual_review";
type Priority = "high" | "medium" | "low";
type Tone = "ok" | "warning" | "error" | "info";

interface RegenerationQueueReport {
  summary: {
    totalPosts: number;
    needsRegeneration: number;
    textOnly: number;
    imageOnly: number;
    both: number;
    manualReview: number;
    highPriority: number;
  };
  queue: QueuePost[];
  channelBreakdown: ChannelBreakdown[];
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface QueuePost {
  postId: string;
  channelId: string;
  channel: string;
  title: string;
  topic: string;
  qualityScore: number;
  status: Status;
  issues: string[];
  regenerationType: RegenerationType;
  priority: Priority;
  reason: string;
  recommendation: string;
}

interface ChannelBreakdown {
  channelId: string;
  channelName: string;
  totalPosts: number;
  weakPosts: number;
  textIssues: number;
  imageIssues: number;
  highPriorityCount: number;
}

export function RegenerationQueuePanel() {
  const [report, setReport] = useState<RegenerationQueueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/regeneration-queue/status", { cache: "no-store" });
      const payload = (await response.json()) as RegenerationQueueReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Regeneration queue request failed.");
      }
      setReport(payload as RegenerationQueueReport);
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
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Content Quality</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Regeneration Queue</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only queue of posts that need text, image, combined, or manual-review repair before publishing decisions.</p>
          </div>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh queue
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <Metric label="Needs regeneration" value={String(report?.summary.needsRegeneration ?? "-")} tone={(report?.summary.needsRegeneration ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Text only" value={String(report?.summary.textOnly ?? "-")} tone={(report?.summary.textOnly ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Image only" value={String(report?.summary.imageOnly ?? "-")} tone={(report?.summary.imageOnly ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Both text and image" value={String(report?.summary.both ?? "-")} tone={(report?.summary.both ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Manual review" value={String(report?.summary.manualReview ?? "-")} tone={(report?.summary.manualReview ?? 0) > 0 ? "error" : "ok"} />
        <Metric label="High priority" value={String(report?.summary.highPriority ?? "-")} tone={(report?.summary.highPriority ?? 0) > 0 ? "error" : "ok"} />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <Panel title="Regeneration queue" icon={<AlertTriangle className="h-4 w-4" />}>
        <QueueTable rows={report?.queue ?? []} />
      </Panel>

      <Panel title="Channel breakdown" icon={<ShieldCheck className="h-4 w-4" />}>
        <ChannelBreakdownTable rows={report?.channelBreakdown ?? []} />
      </Panel>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={report?.warnings ?? []} empty="No warnings." tone="warning" />
        <TextList title="Errors" items={report?.errors ?? []} empty="No errors." tone="error" />
      </section>

      <p className="text-xs leading-5 text-slate-500">Total posts checked: {report?.summary.totalPosts ?? "-"} - Last checked: {report?.lastCheckedAt ?? "not checked yet"}</p>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: Tone }) {
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

function QueueTable({ rows }: { rows: QueuePost[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No posts currently require regeneration.</p>;

  return (
    <div className="overflow-hidden rounded-md border border-line">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-3 py-2">Post id</th>
            <th className="px-3 py-2">Channel</th>
            <th className="px-3 py-2">Topic/title</th>
            <th className="px-3 py-2 text-right">Score</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Priority</th>
            <th className="px-3 py-2">Issues</th>
            <th className="px-3 py-2">Recommendation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={`${row.channelId}-${row.postId}`}>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.postId}</td>
              <td className="px-3 py-2">
                <p className="font-semibold text-slate-200">{row.channelId}</p>
                <p className="mt-1 max-w-[11rem] break-words text-xs text-slate-500">{row.channel}</p>
              </td>
              <td className="px-3 py-2">
                <p className="max-w-xs break-words text-slate-300">{row.topic || row.title}</p>
                <p className="mt-1 max-w-xs break-words text-xs text-slate-500">{row.reason}</p>
              </td>
              <td className="px-3 py-2 text-right font-semibold text-white">{row.qualityScore}</td>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.status}</td>
              <td className="px-3 py-2 text-slate-300">{formatType(row.regenerationType)}</td>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.priority}</td>
              <td className="px-3 py-2 text-slate-400">{row.issues.join(", ")}</td>
              <td className="px-3 py-2 text-slate-400">{row.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChannelBreakdownTable({ rows }: { rows: ChannelBreakdown[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No channel quality problems detected.</p>;

  return (
    <div className="overflow-hidden rounded-md border border-line">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-3 py-2">Channel id</th>
            <th className="px-3 py-2 text-right">Total posts</th>
            <th className="px-3 py-2 text-right">Weak posts</th>
            <th className="px-3 py-2 text-right">Text issues</th>
            <th className="px-3 py-2 text-right">Image issues</th>
            <th className="px-3 py-2 text-right">High priority</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.channelId}>
              <td className="px-3 py-2">
                <p className="font-semibold text-slate-200">{row.channelId}</p>
                <p className="mt-1 max-w-xs break-words text-xs text-slate-500">{row.channelName}</p>
              </td>
              <td className="px-3 py-2 text-right text-slate-300">{row.totalPosts}</td>
              <td className="px-3 py-2 text-right text-slate-300">{row.weakPosts}</td>
              <td className="px-3 py-2 text-right text-slate-300">{row.textIssues}</td>
              <td className="px-3 py-2 text-right text-slate-300">{row.imageIssues}</td>
              <td className="px-3 py-2 text-right font-semibold text-white">{row.highPriorityCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

function formatType(type: RegenerationType) {
  if (type === "manual_review") return "manual review";
  if (type === "both") return "both";
  return type;
}

function toneClass(tone: Tone) {
  return cn(
    tone === "ok" && "border-emerald-300/25 bg-emerald-300/10",
    tone === "warning" && "border-amber-300/25 bg-amber-300/10",
    tone === "error" && "border-rose-300/25 bg-rose-300/10",
    tone === "info" && "border-sky-300/25 bg-sky-300/10",
  );
}
