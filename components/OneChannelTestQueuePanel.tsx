"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleSlash, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "ok" | "warning" | "error";

interface QueueReport {
  status: Status;
  channelId: string;
  summary: {
    candidateCount: number;
    readyCount: number;
    blockedCount: number;
    alreadyPublishedCount: number;
  };
  queue: QueueItem[];
  safeForControlledChannelTest: boolean;
  safeForBulkPublishing: false;
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface QueueItem {
  postId: string;
  channelId: string;
  channelName: string;
  title: string;
  topic: string;
  status: string;
  scheduledAt: string | null;
  textLength: number;
  readinessScore: number;
  imageStatus: string;
  imagePath: string;
  imagePrompt: string | null;
  issues: string[];
  recommendation: string;
}

export function OneChannelTestQueuePanel() {
  const [report, setReport] = useState<QueueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/one-channel-test-queue/status?channelId=ai-tech", { cache: "no-store" });
      const payload = (await response.json()) as QueueReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Queue status request failed.");
      }
      setReport(payload as QueueReport);
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
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Controlled Test</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">One-Channel Test Queue</h1>
          </div>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh queue
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-7">
        <Metric label="Channel" value={report?.channelId ?? "ai-tech"} tone="info" />
        <Metric label="Candidate posts" value={String(report?.summary.candidateCount ?? "-")} tone="info" />
        <Metric label="Ready posts" value={String(report?.summary.readyCount ?? "-")} tone={(report?.summary.readyCount ?? 0) >= 2 ? "ok" : "warning"} />
        <Metric label="Blocked posts" value={String(report?.summary.blockedCount ?? "-")} tone={(report?.summary.blockedCount ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Already published" value={String(report?.summary.alreadyPublishedCount ?? "-")} tone="info" />
        <Metric label="Controlled test" value={report?.safeForControlledChannelTest ? "YES" : "NO"} tone={report?.safeForControlledChannelTest ? "ok" : "warning"} />
        <Metric label="Bulk publishing" value="NO" tone="error" />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <div className="mb-3 flex items-center gap-2 text-white">
          <CheckCircle2 className="h-4 w-4 text-cyan-200" />
          <h2 className="text-base font-semibold">Queue</h2>
        </div>
        <QueueTable rows={report?.queue ?? []} />
      </section>

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

function QueueTable({ rows }: { rows: QueueItem[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No queue candidates.</p>;

  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-3 py-2">Post id</th>
            <th className="px-3 py-2">Channel</th>
            <th className="px-3 py-2">Title / topic</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Score</th>
            <th className="px-3 py-2">Image</th>
            <th className="px-3 py-2">Issues</th>
            <th className="px-3 py-2">Recommendation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.postId} className="align-top">
              <td className="max-w-56 px-3 py-3 font-mono text-xs text-slate-300">{row.postId}</td>
              <td className="px-3 py-3 text-slate-300">{row.channelId}</td>
              <td className="max-w-72 px-3 py-3">
                <p className="font-semibold text-white">{row.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{row.topic}</p>
              </td>
              <td className="px-3 py-3 text-slate-300">{row.status}</td>
              <td className="px-3 py-3 text-right font-semibold text-cyan-100">{row.readinessScore}</td>
              <td className="px-3 py-3 text-slate-300">{row.imageStatus}</td>
              <td className="max-w-72 px-3 py-3 text-xs leading-5 text-slate-400">{row.issues.length ? row.issues.join(", ") : "none"}</td>
              <td className="max-w-64 px-3 py-3 text-xs leading-5 text-slate-300">{row.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "warning" | "error" }) {
  const Icon = tone === "error" ? CircleSlash : ShieldCheck;

  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <div className="mb-3 flex items-center gap-2 text-white">
        <Icon className={cn("h-4 w-4", tone === "error" ? "text-rose-200" : "text-amber-200")} />
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {items.length ? (
        <ul className="space-y-2 text-sm leading-6 text-slate-400">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{empty}</p>
      )}
    </section>
  );
}

function toneClass(tone: "ok" | "warning" | "error" | "info") {
  if (tone === "ok") return "border-emerald-300/25 bg-emerald-300/10";
  if (tone === "warning") return "border-amber-300/25 bg-amber-300/10";
  if (tone === "error") return "border-rose-300/25 bg-rose-300/10";
  return "border-sky-300/25 bg-sky-300/10";
}
