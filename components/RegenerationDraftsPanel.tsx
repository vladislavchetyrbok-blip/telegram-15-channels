"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type RegenerationType = "text" | "image" | "both" | "manual_review";
type Priority = "high" | "medium" | "low";
type Tone = "ok" | "warning" | "error" | "info";

interface RegenerationDraftsReport {
  summary: {
    totalDrafts: number;
    activeDrafts: number;
    approvedDrafts: number;
    appliedDrafts: number;
    textDrafts: number;
    imageDrafts: number;
    bothDrafts: number;
    manualReviewDrafts: number;
    highPriorityDrafts: number;
    staleDrafts: number;
  };
  drafts: RegenerationDraft[];
  draftsByChannel: Record<string, number>;
  draftsByType: Record<string, number>;
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface RegenerationDraft {
  id: string;
  sourcePostId: string;
  channelId: string;
  createdAt: string;
  regenerationType: RegenerationType;
  priority: Priority;
  original: {
    text: string;
    imagePath: string;
    topic: string;
  };
  draft: {
    text: string;
    imagePrompt: string;
    imagePath: string | null;
  };
  issues: string[];
  recommendation: string;
  status: string;
  approved: boolean;
  applied: boolean;
}

export function RegenerationDraftsPanel() {
  const [report, setReport] = useState<RegenerationDraftsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/regeneration-drafts/status", { cache: "no-store" });
      const payload = (await response.json()) as RegenerationDraftsReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Regeneration drafts request failed.");
      }
      setReport(payload as RegenerationDraftsReport);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const summary = report?.summary;

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Content Quality</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Regeneration Drafts</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only draft candidates for text, image, combined, and manual-review improvements.</p>
          </div>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh drafts
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-8">
        <Metric label="Total drafts" value={formatNumber(summary?.totalDrafts)} tone="info" />
        <Metric label="Active drafts" value={formatNumber(summary?.activeDrafts)} tone={(summary?.activeDrafts ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Text drafts" value={formatNumber(summary?.textDrafts)} tone="info" />
        <Metric label="Image drafts" value={formatNumber(summary?.imageDrafts)} tone="info" />
        <Metric label="Both drafts" value={formatNumber(summary?.bothDrafts)} tone="info" />
        <Metric label="High priority" value={formatNumber(summary?.highPriorityDrafts)} tone={(summary?.highPriorityDrafts ?? 0) > 0 ? "error" : "ok"} />
        <Metric label="Approved" value={formatNumber(summary?.approvedDrafts)} tone={(summary?.approvedDrafts ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Applied" value={formatNumber(summary?.appliedDrafts)} tone={(summary?.appliedDrafts ?? 0) > 0 ? "warning" : "ok"} />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <Panel title="Draft candidates" icon={<ShieldCheck className="h-4 w-4" />}>
        <DraftsTable rows={report?.drafts ?? []} />
      </Panel>

      <section className="grid gap-3 md:grid-cols-2">
        <Breakdown title="Drafts by channel" rows={report?.draftsByChannel ?? {}} />
        <Breakdown title="Drafts by type" rows={report?.draftsByType ?? {}} />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={report?.warnings ?? []} empty="No warnings." tone="warning" />
        <TextList title="Errors" items={report?.errors ?? []} empty="No errors." tone="error" />
      </section>

      <p className="text-xs leading-5 text-slate-500">Last checked: {report?.lastCheckedAt ?? "not checked yet"}</p>
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

function DraftsTable({ rows }: { rows: RegenerationDraft[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No regeneration drafts have been created.</p>;

  return (
    <div className="overflow-hidden rounded-md border border-line">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-3 py-2">Draft id</th>
            <th className="px-3 py-2">Source post id</th>
            <th className="px-3 py-2">Channel</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Priority</th>
            <th className="px-3 py-2">Issues</th>
            <th className="px-3 py-2">Original preview</th>
            <th className="px-3 py-2">Draft preview</th>
            <th className="px-3 py-2">Image prompt</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Created at</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.id}</td>
              <td className="px-3 py-2 text-slate-300">{row.sourcePostId}</td>
              <td className="px-3 py-2 text-slate-300">{row.channelId}</td>
              <td className="px-3 py-2 text-slate-300">{formatType(row.regenerationType)}</td>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.priority}</td>
              <td className="px-3 py-2 text-slate-400">{row.issues.join(", ") || "-"}</td>
              <td className="px-3 py-2">
                <p className="max-w-xs whitespace-pre-wrap break-words text-slate-400">{preview(row.original.text)}</p>
              </td>
              <td className="px-3 py-2">
                <p className="max-w-xs whitespace-pre-wrap break-words text-slate-300">{preview(row.draft.text)}</p>
              </td>
              <td className="px-3 py-2">
                <p className="max-w-xs break-words text-slate-400">{preview(row.draft.imagePrompt)}</p>
              </td>
              <td className="px-3 py-2 text-slate-300">{row.status}</td>
              <td className="px-3 py-2 text-slate-400">{row.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Record<string, number> }) {
  const entries = Object.entries(rows).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));

  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {entries.length ? (
        <div className="mt-3 space-y-2">
          {entries.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 break-words text-slate-400">{label}</span>
              <span className="font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No drafts.</p>
      )}
    </section>
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

function preview(value: string) {
  return value.length > 220 ? `${value.slice(0, 220)}...` : value;
}

function formatType(type: RegenerationType) {
  if (type === "manual_review") return "manual review";
  return type;
}

function formatNumber(value?: number) {
  return typeof value === "number" ? String(value) : "-";
}

function toneClass(tone: Tone) {
  return cn(
    tone === "ok" && "border-emerald-300/25 bg-emerald-300/10",
    tone === "warning" && "border-amber-300/25 bg-amber-300/10",
    tone === "error" && "border-rose-300/25 bg-rose-300/10",
    tone === "info" && "border-sky-300/25 bg-sky-300/10",
  );
}
