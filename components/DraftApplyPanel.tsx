"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileCheck2, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type RegenerationType = "text" | "image" | "both" | "manual_review";
type Priority = "high" | "medium" | "low";
type Tone = "ok" | "warning" | "error" | "info";

interface DraftApplyReport {
  summary: DraftApplySummary;
  approvedNotApplied: DraftApplyDraft[];
  applied: DraftApplyDraft[];
  blocked: DraftApplyDraft[];
  lastApplied: DraftApplyDraft[];
  pendingApprovedDrafts: DraftApplyDraft[];
  appliedByChannel: Record<string, number>;
  latestBackup: { name: string; path: string; createdAt: string } | null;
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface DraftApplySummary {
  totalDrafts: number;
  approvedNotApplied: number;
  appliedDrafts: number;
  rejected: number;
  needsChanges: number;
  safeToApplyCount: number;
  blockedApplyCount: number;
}

interface DraftApplyDraft {
  id: string;
  sourcePostId: string;
  channelId: string;
  channelName: string;
  regenerationType: RegenerationType;
  priority: Priority;
  status: string;
  approved: boolean;
  approvedAt: string | null;
  applied: boolean;
  appliedAt: string | null;
  applyBackupPath: string | null;
  applySummary: unknown;
  issues: string[];
  recommendation: string;
  safeToApply: boolean;
  blockReason: string;
  blockReasons: string[];
  warnings: string[];
  affectedFields: string[];
  currentPostText: string;
  draftText: string;
  currentImagePath: string;
  draftImagePrompt: string;
  draftImagePath: string | null;
}

export function DraftApplyPanel() {
  const [report, setReport] = useState<DraftApplyReport | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [confirmApply, setConfirmApply] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh(nextSelectedId = selectedDraftId) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/draft-apply/status", { cache: "no-store" });
      const payload = (await response.json()) as DraftApplyReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Draft apply status request failed.");
      }

      const nextReport = payload as DraftApplyReport;
      const rows = [...nextReport.approvedNotApplied, ...nextReport.applied, ...nextReport.blocked];
      const nextSelected = rows.some((draft) => draft.id === nextSelectedId)
        ? nextSelectedId
        : nextReport.approvedNotApplied[0]?.id ?? nextReport.blocked[0]?.id ?? nextReport.applied[0]?.id ?? "";

      setReport(nextReport);
      setSelectedDraftId(nextSelected);
      setConfirmApply(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allRows = useMemo(
    () => [...(report?.approvedNotApplied ?? []), ...(report?.blocked ?? []), ...(report?.applied ?? [])],
    [report],
  );
  const selectedDraft = useMemo(
    () => allRows.find((draft) => draft.id === selectedDraftId) ?? allRows[0] ?? null,
    [allRows, selectedDraftId],
  );
  const summary = report?.summary;
  const canApply = Boolean(selectedDraft?.safeToApply && selectedDraft.status === "approved" && selectedDraft.approved && !selectedDraft.applied);

  async function applyDraft() {
    if (!selectedDraft || !canApply || !confirmApply) return;

    setApplying(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/draft-apply/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: selectedDraft.id, confirm: true }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string; backup?: { backupDir?: string } };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Draft apply failed.");
      }
      setMessage(`${payload.message ?? "Draft applied."}${payload.backup?.backupDir ? ` Backup: ${payload.backup.backupDir}` : ""}`);
      await refresh(selectedDraft.id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-300">Manual Apply</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Draft Apply</h1>
          </div>
        </div>
        <button type="button" onClick={() => void refresh(selectedDraftId)} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <Metric label="Approved not applied" value={formatNumber(summary?.approvedNotApplied)} tone={(summary?.approvedNotApplied ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Safe to apply" value={formatNumber(summary?.safeToApplyCount)} tone={(summary?.safeToApplyCount ?? 0) > 0 ? "ok" : "info"} />
        <Metric label="Applied drafts" value={formatNumber(summary?.appliedDrafts)} tone="info" />
        <Metric label="Blocked drafts" value={formatNumber(summary?.blockedApplyCount)} tone={(summary?.blockedApplyCount ?? 0) > 0 ? "error" : "ok"} />
        <Metric label="Last applied" value={report?.lastApplied[0]?.appliedAt ?? "-"} tone="info" />
        <Metric label="Latest backup" value={report?.latestBackup?.name ?? "-"} tone={report?.latestBackup ? "ok" : "warning"} />
      </section>

      {message ? <p className="rounded-md border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm leading-6 text-emerald-100">{message}</p> : null}
      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <Panel title="Approved Drafts" icon={<ShieldCheck className="h-4 w-4" />}>
        <DraftsTable
          rows={report?.approvedNotApplied ?? []}
          selectedDraftId={selectedDraft?.id ?? ""}
          onSelect={(draft) => {
            setSelectedDraftId(draft.id);
            setConfirmApply(false);
          }}
        />
      </Panel>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel title="Compare Preview" icon={<Eye className="h-4 w-4" />}>
          <CompareView draft={selectedDraft} />
        </Panel>

        <Panel title="Apply Control" icon={<FileCheck2 className="h-4 w-4" />}>
          <div className="space-y-3">
            <TextList title="Apply warnings" items={selectedDraft?.warnings ?? []} empty="No apply warnings." tone="warning" />
            <TextList title="Block reasons" items={selectedDraft?.blockReasons ?? []} empty="No block reasons." tone="error" />

            <label className="flex items-start gap-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
              <input
                type="checkbox"
                checked={confirmApply}
                onChange={(event) => setConfirmApply(event.target.checked)}
                disabled={!canApply || applying}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-400"
              />
              <span>Confirm backup and JSON-only apply. Telegram publication and GitHub Actions are not triggered.</span>
            </label>

            <button type="button" onClick={() => void refresh(selectedDraft?.id ?? "")} disabled={!selectedDraft || loading} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-sky-300/30 bg-sky-300/10 px-3 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-60">
              <Eye className="h-4 w-4" />
              Dry-run preview
            </button>

            <button type="button" onClick={() => void applyDraft()} disabled={!canApply || !confirmApply || applying} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-60">
              <FileCheck2 className={cn("h-4 w-4", applying && "animate-pulse")} />
              Apply approved draft
            </button>
          </div>
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

function DraftsTable({ rows, selectedDraftId, onSelect }: { rows: DraftApplyDraft[]; selectedDraftId: string; onSelect: (draft: DraftApplyDraft) => void }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No approved drafts are waiting for apply.</p>;

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
            <th className="px-3 py-2">Approved at</th>
            <th className="px-3 py-2">Issues</th>
            <th className="px-3 py-2">Recommendation</th>
            <th className="px-3 py-2">Safe</th>
            <th className="px-3 py-2">Block reason</th>
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
              <td className="px-3 py-2 text-slate-400">{row.approvedAt ?? "-"}</td>
              <td className="max-w-[16rem] break-words px-3 py-2 text-slate-400">{row.issues.join(", ") || "-"}</td>
              <td className="max-w-[18rem] break-words px-3 py-2 text-slate-400">{row.recommendation || "-"}</td>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.safeToApply ? "yes" : "no"}</td>
              <td className="max-w-[18rem] break-words px-3 py-2 text-slate-400">{row.blockReason || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompareView({ draft }: { draft: DraftApplyDraft | null }) {
  if (!draft) return <p className="text-sm text-slate-500">No draft selected.</p>;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <TextBlock title="Current post text" value={draft.currentPostText} />
        <TextBlock title="Draft text" value={draft.draftText} />
      </div>
      <Rows rows={[
        ["Current imagePath", draft.currentImagePath || "-"],
        ["Draft imagePrompt", draft.draftImagePrompt || "-"],
        ["Affected fields", draft.affectedFields.join(", ") || "-"],
        ["Apply warnings", draft.warnings.join("; ") || "-"],
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
        <div key={label} className="grid gap-2 px-3 py-2 text-sm sm:grid-cols-[11rem_minmax(0,1fr)]">
          <span className="text-slate-500">{label}</span>
          <span className="break-words font-semibold text-slate-200">{value}</span>
        </div>
      ))}
    </div>
  );
}

function TextList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "warning" | "error" }) {
  return (
    <section className={cn("rounded-md border p-3", items.length ? toneClass(tone) : "border-line bg-slate-950/35")}>
      <div className="flex items-center gap-2">
        {items.length ? <AlertTriangle className="h-4 w-4 text-amber-200" /> : <CheckCircle2 className="h-4 w-4 text-emerald-200" />}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
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

function toneClass(tone: Tone) {
  return cn(
    tone === "ok" && "border-emerald-300/25 bg-emerald-300/10",
    tone === "warning" && "border-amber-300/25 bg-amber-300/10",
    tone === "error" && "border-rose-300/25 bg-rose-300/10",
    tone === "info" && "border-sky-300/25 bg-sky-300/10",
  );
}
