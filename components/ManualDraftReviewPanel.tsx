"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, FileText, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type RegenerationType = "text" | "image" | "both" | "manual_review";
type Priority = "high" | "medium" | "low";
type DraftStatus = "draft" | "approved" | "rejected" | "needs_changes";
type Tone = "ok" | "warning" | "error" | "info";
type ReviewAction = "approve" | "reject" | "needs_changes";

interface ReviewReport {
  summary: ReviewSummary;
  drafts: RegenerationDraft[];
  draftsByChannel: Record<string, number>;
  draftsByType: Record<string, number>;
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface ReviewSummary {
  totalDrafts: number;
  draft: number;
  approved: number;
  rejected: number;
  needsChanges: number;
  applied: number;
  pendingReview: number;
  highPriorityPending: number;
}

interface RegenerationDraft {
  id: string;
  sourcePostId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
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
  status: DraftStatus;
  approved: boolean;
  approvedAt: string | null;
  rejectedAt: string | null;
  reviewNote: string;
  applied: boolean;
}

export function ManualDraftReviewPanel() {
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<ReviewAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh(nextSelectedId = "") {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/regeneration-review/status", { cache: "no-store" });
      const payload = (await response.json()) as ReviewReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Draft review request failed.");
      }

      const nextReport = payload as ReviewReport;
      const nextSelected = nextReport.drafts.some((draft) => draft.id === nextSelectedId)
        ? nextSelectedId
        : nextReport.drafts[0]?.id ?? "";

      setReport(nextReport);
      setSelectedDraftId(nextSelected);
      setReviewNote(nextReport.drafts.find((draft) => draft.id === nextSelected)?.reviewNote ?? "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh("");
  }, []);

  const selectedDraft = useMemo(
    () => report?.drafts.find((draft) => draft.id === selectedDraftId) ?? report?.drafts[0] ?? null,
    [report, selectedDraftId],
  );

  async function reviewDraft(action: ReviewAction) {
    if (!selectedDraft) return;

    setSavingAction(action);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/regeneration-review/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId: selectedDraft.id,
          action,
          note: reviewNote,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Draft review update failed.");
      }
      setMessage(payload.message ?? "Draft review status updated.");
      await refresh(selectedDraft.id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setSavingAction(null);
    }
  }

  const summary = report?.summary;

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Manual Review</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Draft Review</h1>
          </div>
        </div>
        <button type="button" onClick={() => void refresh(selectedDraftId)} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-7">
        <Metric label="Total drafts" value={formatNumber(summary?.totalDrafts)} tone="info" />
        <Metric label="Pending review" value={formatNumber(summary?.pendingReview)} tone={(summary?.pendingReview ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Approved" value={formatNumber(summary?.approved)} tone={(summary?.approved ?? 0) > 0 ? "ok" : "info"} />
        <Metric label="Rejected" value={formatNumber(summary?.rejected)} tone={(summary?.rejected ?? 0) > 0 ? "error" : "info"} />
        <Metric label="Needs changes" value={formatNumber(summary?.needsChanges)} tone={(summary?.needsChanges ?? 0) > 0 ? "warning" : "info"} />
        <Metric label="Applied" value={formatNumber(summary?.applied)} tone={(summary?.applied ?? 0) > 0 ? "error" : "ok"} />
        <Metric label="High priority pending" value={formatNumber(summary?.highPriorityPending)} tone={(summary?.highPriorityPending ?? 0) > 0 ? "error" : "ok"} />
      </section>

      {message ? <p className="rounded-md border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm leading-6 text-emerald-100">{message}</p> : null}
      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <Panel title="Drafts" icon={<FileText className="h-4 w-4" />}>
        <DraftsTable
          rows={report?.drafts ?? []}
          selectedDraftId={selectedDraft?.id ?? ""}
          onSelect={(draft) => {
            setSelectedDraftId(draft.id);
            setReviewNote(draft.reviewNote ?? "");
          }}
        />
      </Panel>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel title="Compare" icon={<ShieldCheck className="h-4 w-4" />}>
          <CompareView draft={selectedDraft} />
        </Panel>

        <Panel title="Review" icon={<CheckCircle2 className="h-4 w-4" />}>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-200" htmlFor="review-note">Review note</label>
            <textarea
              id="review-note"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              className="min-h-32 w-full resize-y rounded-md border border-line bg-slate-950/70 p-3 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40"
              placeholder="Optional note"
            />
            <div className="grid gap-2">
              <button type="button" disabled={!selectedDraft || savingAction !== null} onClick={() => void reviewDraft("approve")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-60">
                <CheckCircle2 className={cn("h-4 w-4", savingAction === "approve" && "animate-pulse")} />
                Approve draft
              </button>
              <button type="button" disabled={!selectedDraft || savingAction !== null} onClick={() => void reviewDraft("reject")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-rose-300/30 bg-rose-300/10 px-3 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:opacity-60">
                <XCircle className={cn("h-4 w-4", savingAction === "reject" && "animate-pulse")} />
                Reject draft
              </button>
              <button type="button" disabled={!selectedDraft || savingAction !== null} onClick={() => void reviewDraft("needs_changes")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-60">
                <AlertTriangle className={cn("h-4 w-4", savingAction === "needs_changes" && "animate-pulse")} />
                Needs changes
              </button>
            </div>
          </div>
        </Panel>
      </section>

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

function DraftsTable({ rows, selectedDraftId, onSelect }: { rows: RegenerationDraft[]; selectedDraftId: string; onSelect: (draft: RegenerationDraft) => void }) {
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
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Issues</th>
            <th className="px-3 py-2">Recommendation</th>
            <th className="px-3 py-2">Created at</th>
            <th className="px-3 py-2">Updated at</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.id} className={cn("cursor-pointer transition hover:bg-slate-900/70", row.id === selectedDraftId && "bg-cyan-300/10")} onClick={() => onSelect(row)}>
              <td className="max-w-[18rem] break-words px-3 py-2 font-semibold text-slate-200">{row.id}</td>
              <td className="max-w-[16rem] break-words px-3 py-2 text-slate-300">{row.sourcePostId}</td>
              <td className="px-3 py-2 text-slate-300">{row.channelId}</td>
              <td className="px-3 py-2 text-slate-300">{formatType(row.regenerationType)}</td>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.priority}</td>
              <td className="px-3 py-2 font-semibold text-slate-200">{formatStatus(row.status)}</td>
              <td className="max-w-[16rem] break-words px-3 py-2 text-slate-400">{row.issues.join(", ") || "-"}</td>
              <td className="max-w-[18rem] break-words px-3 py-2 text-slate-400">{row.recommendation || "-"}</td>
              <td className="px-3 py-2 text-slate-400">{row.createdAt}</td>
              <td className="px-3 py-2 text-slate-400">{row.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompareView({ draft }: { draft: RegenerationDraft | null }) {
  if (!draft) return <p className="text-sm text-slate-500">No draft selected.</p>;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <TextBlock title="Original text" value={draft.original.text} />
        <TextBlock title="Draft text" value={draft.draft.text} />
      </div>
      <Rows rows={[
        ["Original image path", draft.original.imagePath || "-"],
        ["Draft image prompt", draft.draft.imagePrompt || "-"],
        ["Issues", draft.issues.join(", ") || "-"],
        ["Recommendation", draft.recommendation || "-"],
        ["Review note", draft.reviewNote || "-"],
      ]} />
    </div>
  );
}

function TextBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 p-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{value || "-"}</p>
    </div>
  );
}

function Rows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-2 px-3 py-2 text-sm sm:grid-cols-[12rem_minmax(0,1fr)]">
          <span className="text-slate-500">{label}</span>
          <span className="break-words font-semibold text-slate-200">{value}</span>
        </div>
      ))}
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

function formatNumber(value?: number) {
  return typeof value === "number" ? String(value) : "-";
}

function formatType(type: RegenerationType) {
  return type === "manual_review" ? "manual review" : type;
}

function formatStatus(status: DraftStatus) {
  return status === "needs_changes" ? "needs changes" : status;
}

function toneClass(tone: Tone) {
  return cn(
    tone === "ok" && "border-emerald-300/25 bg-emerald-300/10",
    tone === "warning" && "border-amber-300/25 bg-amber-300/10",
    tone === "error" && "border-rose-300/25 bg-rose-300/10",
    tone === "info" && "border-sky-300/25 bg-sky-300/10",
  );
}
