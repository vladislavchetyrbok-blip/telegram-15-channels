"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Eye, ImageIcon, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "ok" | "warning" | "error";
type Tone = "ok" | "warning" | "error" | "info";

interface PremiumVisualQualityReport {
  status: Status;
  summary: {
    totalPosts: number;
    unpublishedPosts: number;
    weakDemoVisuals: number;
    regenerationRecommended: number;
    blockPublication: number;
    queuePreviewItems: number;
    averageVisualQualityScore: number;
    averagePremiumScore: number;
    averageChannelFitScore: number;
    byVisualMode: Record<string, number>;
    flags: Record<string, number>;
    productionStoreMode: string;
    sourceOfTruth: string;
    previewOnly: boolean;
    realTelegramSendChanged: boolean;
  };
  samples: VisualSample[];
  weakVisuals: VisualSample[];
  regenerationQueuePreview: RegenerationPreviewItem[];
  issues: IssueSummary[];
  recommendations: string[];
  profiles: Record<string, {
    visualIdentity: string;
    preferredComposition: string;
    preferredSubjects: string[];
    preferredColorMood: string;
    forbiddenPatterns: string[];
    promptKeywords: string[];
    negativePromptPatterns: string[];
    allowedVisualModes: string[];
    goodDirectionExamples: string[];
    badDirectionExamples: string[];
  }>;
  visualModes: string[];
  qualityFlags: string[];
  lastCheckedAt: string;
}

interface VisualSample {
  postId: string;
  channelId: string;
  title: string;
  topic: string;
  contentTemplate: string;
  lengthBucket: string;
  targetAudience: string;
  visualMode: string;
  imageCount: number;
  originalImage: string | null;
  originalImagePrompt: string;
  improvedPrompt: string;
  negativePrompt: string;
  visualModeReason: string;
  visualQualityScore: number;
  premiumScore: number;
  channelFitScore: number;
  regenerationRecommended: boolean;
  blockPublication: boolean;
  flags: string[];
  reason: string;
  recommendedAction: string;
}

interface RegenerationPreviewItem {
  postId: string;
  channelId: string;
  title: string;
  visualQualityScore: number;
  premiumScore: number;
  channelFitScore: number;
  visualMode: string;
  imageCount: number;
  originalImage: string | null;
  originalImagePrompt: string;
  recommendedPrompt: string;
  negativePrompt: string;
  regenerationReason: string;
  issues: string[];
  recommendedAction: string;
}

interface IssueSummary {
  type: string;
  severity: string;
  count: number;
  examples: string[];
  message: string;
}

interface VisualRegenerationDraftReport {
  status: Status;
  summary: {
    totalDrafts: number;
    draft: number;
    approved: number;
    rejected: number;
    needsChanges: number;
    applied: number;
    activeDrafts: number;
    previewOnly: number;
    withBackup: number;
    realImageGenerated: number;
  };
  storePath: string;
  backupRoot: string;
  drafts: VisualRegenerationDraft[];
  warnings: string[];
  errors: string[];
  telegramRealSendWasNotRun: boolean;
  githubActionsWereNotTriggered: boolean;
  publishSchedulerChanged: boolean;
  lastCheckedAt: string;
}

interface VisualRegenerationDraft {
  draftId: string;
  postId: string;
  channelId: string;
  title: string;
  sourceStatus: string;
  status: string;
  approved: boolean;
  applied: boolean;
  previewOnly: boolean;
  oldImage: string;
  oldPrompt: string;
  newPremiumPrompt: string;
  negativePrompt: string;
  regenerationReason: string;
  scores: {
    before?: Record<string, number>;
    expectedAfter?: Record<string, number>;
    expectedImprovement?: Record<string, number>;
  };
  backupPath: string | null;
  backupCreated: boolean;
  placeholderPath: string;
  newImagePath: string | null;
  realImageGeneration: string;
  applySafety: {
    safeToApply: boolean;
    blockReasons: string[];
    affectedFields: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export function PremiumVisualQualityPanel() {
  const [report, setReport] = useState<PremiumVisualQualityReport | null>(null);
  const [draftReport, setDraftReport] = useState<VisualRegenerationDraftReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setDraftsLoading(true);
    setError(null);

    try {
      const [qualityResponse, draftsResponse] = await Promise.all([
        fetch("/api/admin/visual-quality/status", { cache: "no-store" }),
        fetch("/api/admin/visual-regeneration/status", { cache: "no-store" }),
      ]);
      const qualityPayload = (await qualityResponse.json()) as PremiumVisualQualityReport | { message?: string };
      const draftsPayload = (await draftsResponse.json()) as VisualRegenerationDraftReport | { message?: string };
      if (!qualityResponse.ok) {
        throw new Error("message" in qualityPayload && qualityPayload.message ? qualityPayload.message : "Visual quality request failed.");
      }
      if (!draftsResponse.ok) {
        throw new Error("message" in draftsPayload && draftsPayload.message ? draftsPayload.message : "Visual regeneration drafts request failed.");
      }
      setReport(qualityPayload as PremiumVisualQualityReport);
      setDraftReport(draftsPayload as VisualRegenerationDraftReport);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
      setDraftsLoading(false);
    }
  }

  async function refreshDrafts() {
    setDraftsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/visual-regeneration/status", { cache: "no-store" });
      const payload = (await response.json()) as VisualRegenerationDraftReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Visual regeneration drafts request failed.");
      }
      setDraftReport(payload as VisualRegenerationDraftReport);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setDraftsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const profileRows = useMemo(() => Object.entries(report?.profiles ?? {}).slice(0, 6), [report]);
  const queueRows = report?.regenerationQueuePreview ?? [];
  const weakRows = report?.weakVisuals?.slice(0, 8) ?? [];
  const visualDraftRows = draftReport?.drafts ?? [];

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Premium Visual Quality</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Premium Visual Quality</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only v2 gate for visual profiles, prompt quality, weak/demo signals, and regeneration preview. Telegram sending is unchanged.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <RefreshButton loading={loading} onClick={refresh} label="Refresh visual quality" icon={<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />} />
          <RefreshButton loading={loading} onClick={refresh} label="Refresh regeneration preview" icon={<Eye className="h-4 w-4" />} />
          <RefreshButton loading={draftsLoading} onClick={refreshDrafts} label="Refresh drafts" icon={<ShieldCheck className={cn("h-4 w-4", draftsLoading && "animate-pulse")} />} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-8">
        <Metric label="Overall status" value={labelStatus(report?.status)} tone={toneForStatus(report?.status)} />
        <Metric label="Weak/demo visual" value={String(report?.summary.weakDemoVisuals ?? "-")} tone={(report?.summary.weakDemoVisuals ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Needs regen" value={String(report?.summary.regenerationRecommended ?? "-")} tone={(report?.summary.regenerationRecommended ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Block preview" value={String(report?.summary.blockPublication ?? "-")} tone={(report?.summary.blockPublication ?? 0) > 0 ? "error" : "ok"} />
        <Metric label="Visual score" value={String(report?.summary.averageVisualQualityScore ?? "-")} tone="info" />
        <Metric label="Premium score" value={String(report?.summary.averagePremiumScore ?? "-")} tone="info" />
        <Metric label="Channel fit" value={String(report?.summary.averageChannelFitScore ?? "-")} tone="info" />
        <Metric label="Queue preview" value={String(report?.summary.queuePreviewItems ?? "-")} tone="info" />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="Visual status" icon={<CheckCircle2 className="h-4 w-4" />}>
          <Rows rows={[
            ["Total posts", String(report?.summary.totalPosts ?? "-")],
            ["Unpublished", String(report?.summary.unpublishedPosts ?? "-")],
            ["Preview only", String(report?.summary.previewOnly ?? true)],
            ["Real send changed", String(report?.summary.realTelegramSendChanged ?? false)],
            ["Store mode", report?.summary.productionStoreMode ?? "json"],
            ["Source of truth", report?.summary.sourceOfTruth ?? "json"],
            ["Last checked", report?.lastCheckedAt ?? "not checked yet"],
          ]} />
        </Panel>
        <Panel title="Visual modes" icon={<ImageIcon className="h-4 w-4" />}>
          <KeyValueList rows={report?.summary.byVisualMode ?? {}} />
        </Panel>
        <Panel title="Quality flags" icon={<AlertTriangle className="h-4 w-4" />}>
          <KeyValueList rows={report?.summary.flags ?? {}} />
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Issue summary" icon={<AlertTriangle className="h-4 w-4" />}>
          <IssueList rows={report?.issues ?? []} />
        </Panel>
        <Panel title="Recommendations" icon={<CheckCircle2 className="h-4 w-4" />}>
          <TextItems items={report?.recommendations ?? []} empty="No recommendations." />
        </Panel>
      </section>

      <Panel title="Regeneration queue preview" icon={<RefreshCw className="h-4 w-4" />}>
        <div className="space-y-3">
          {queueRows.map((row) => (
            <VisualQueueCard key={row.postId} row={row} />
          ))}
          {report && !queueRows.length ? <p className="text-sm text-slate-500">No unpublished visuals currently require regeneration.</p> : null}
        </div>
      </Panel>

      <Panel title="Controlled Visual Regeneration" icon={<ShieldCheck className="h-4 w-4" />}>
        <div className="space-y-3">
          <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-4">
            <Chip label="Drafts" value={String(draftReport?.summary.totalDrafts ?? 0)} />
            <Chip label="Approved" value={String(draftReport?.summary.approved ?? 0)} />
            <Chip label="Backups" value={String(draftReport?.summary.withBackup ?? 0)} />
            <Chip label="Real send" value={String(draftReport?.telegramRealSendWasNotRun ?? true)} />
          </div>
          <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-3">
            <Chip label="Store" value={draftReport?.storePath ?? "data/visual-regeneration-drafts/visual-regeneration-drafts.json"} />
            <Chip label="Backup root" value={draftReport?.backupRoot ?? "data/visual-regeneration-drafts/backups"} />
            <Chip label="Scheduler changed" value={String(draftReport?.publishSchedulerChanged ?? false)} />
          </div>
          {visualDraftRows.map((draft) => (
            <VisualDraftCard key={draft.draftId} draft={draft} />
          ))}
          {draftReport && !visualDraftRows.length ? <p className="text-sm text-slate-500">No controlled visual drafts created yet.</p> : null}
          <TextItems title="Draft warnings" items={draftReport?.warnings ?? []} empty="No draft warnings." />
        </div>
      </Panel>

      <Panel title="Weak visual samples" icon={<Eye className="h-4 w-4" />}>
        <div className="space-y-3">
          {weakRows.map((sample) => (
            <VisualSampleCard key={sample.postId} sample={sample} />
          ))}
          {report && !weakRows.length ? <p className="text-sm text-slate-500">No weak visual samples detected.</p> : null}
        </div>
      </Panel>

      <Panel title="Channel visual profiles" icon={<Sparkles className="h-4 w-4" />}>
        <div className="grid gap-3 xl:grid-cols-2">
          {profileRows.map(([channelId, profile]) => (
            <article key={channelId} className="rounded-md border border-line p-3">
              <p className="font-semibold text-slate-200">{channelId}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{profile.visualIdentity}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{profile.preferredComposition}</p>
              <TextItems title="Subjects" items={profile.preferredSubjects.slice(0, 5)} empty="No subjects." />
              <TextItems title="Forbidden" items={profile.forbiddenPatterns.slice(0, 5)} empty="No forbidden patterns." />
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function VisualDraftCard({ draft }: { draft: VisualRegenerationDraft }) {
  return (
    <article className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{draft.draftId}</p>
          <p className="mt-1 break-words text-sm text-slate-300">{draft.channelId} / {draft.postId}</p>
          <p className="mt-1 break-words text-sm text-slate-400">{draft.title}</p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 text-xs md:grid-cols-4">
          <Chip label="Status" value={draft.status} />
          <Chip label="Preview" value={String(draft.previewOnly)} />
          <Chip label="Safe apply" value={String(draft.applySafety.safeToApply)} />
          <Chip label="Backup" value={String(draft.backupCreated)} />
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
        <Chip label="Source" value={draft.sourceStatus} />
        <Chip label="Generated" value={draft.realImageGeneration} />
        <Chip label="New image" value={draft.newImagePath ?? "not generated"} />
      </div>
      <PromptBlock title="Old visual/prompt" value={draft.oldPrompt || draft.oldImage || "-"} />
      <PromptBlock title="New premium prompt" value={draft.newPremiumPrompt} />
      <PromptBlock title="Negative prompt" value={draft.negativePrompt} />
      <PromptBlock title="Regeneration reason" value={draft.regenerationReason} />
      <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
        <Chip label="Before" value={formatScores(draft.scores.before)} />
        <Chip label="Expected" value={formatScores(draft.scores.expectedAfter)} />
        <Chip label="Improvement" value={formatScores(draft.scores.expectedImprovement)} />
      </div>
      <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-2">
        <Chip label="Backup path" value={draft.backupPath ?? "not available"} />
        <Chip label="Placeholder" value={draft.placeholderPath || "not available"} />
      </div>
      <TextItems title="Apply block reasons" items={draft.applySafety.blockReasons} empty="No apply block reasons." />
      <TextItems title="Affected fields" items={draft.applySafety.affectedFields} empty="No affected fields." />
    </article>
  );
}

function VisualQueueCard({ row }: { row: RegenerationPreviewItem }) {
  return (
    <article className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3">
      <VisualHeader
        channelId={row.channelId}
        postId={row.postId}
        title={row.title}
        visualQualityScore={row.visualQualityScore}
        premiumScore={row.premiumScore}
        channelFitScore={row.channelFitScore}
      />
      <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
        <Chip label="Visual mode" value={`${row.visualMode} (${row.imageCount})`} />
        <Chip label="Action" value={row.recommendedAction} />
        <Chip label="Reason" value={row.regenerationReason} />
      </div>
      <PromptBlock title="Original image/prompt" value={row.originalImagePrompt || row.originalImage || "-"} />
      <PromptBlock title="Improved prompt" value={row.recommendedPrompt} />
      <PromptBlock title="Negative prompt" value={row.negativePrompt} />
      <TextItems title="Issues" items={row.issues} empty="No issues." />
    </article>
  );
}

function VisualSampleCard({ sample }: { sample: VisualSample }) {
  return (
    <article className="rounded-lg border border-line bg-slate-950/30 p-3">
      <VisualHeader
        channelId={sample.channelId}
        postId={sample.postId}
        title={sample.title}
        visualQualityScore={sample.visualQualityScore}
        premiumScore={sample.premiumScore}
        channelFitScore={sample.channelFitScore}
      />
      <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-4">
        <Chip label="Template" value={sample.contentTemplate} />
        <Chip label="Length" value={sample.lengthBucket} />
        <Chip label="Visual mode" value={`${sample.visualMode} (${sample.imageCount})`} />
        <Chip label="Regenerate" value={String(sample.regenerationRecommended)} />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{sample.visualModeReason}</p>
      <PromptBlock title="Original image/prompt" value={sample.originalImagePrompt || sample.originalImage || "-"} />
      <PromptBlock title="Improved prompt" value={sample.improvedPrompt} />
      <TextItems title="Flags" items={sample.flags} empty="No flags." />
    </article>
  );
}

function VisualHeader({ channelId, postId, title, visualQualityScore, premiumScore, channelFitScore }: { channelId: string; postId: string; title: string; visualQualityScore: number; premiumScore: number; channelFitScore: number }) {
  return (
    <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <p className="text-sm font-semibold text-white">{channelId} / {postId}</p>
        <p className="mt-1 break-words text-sm text-slate-300">{title}</p>
      </div>
      <div className="grid shrink-0 grid-cols-3 gap-2 text-center text-xs">
        <Score label="Visual" value={visualQualityScore} />
        <Score label="Premium" value={premiumScore} />
        <Score label="Fit" value={channelFitScore} />
      </div>
    </div>
  );
}

function RefreshButton({ loading, onClick, label, icon }: { loading: boolean; onClick: () => Promise<void>; label: string; icon: ReactNode }) {
  return (
    <button type="button" onClick={() => void onClick()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
      {icon}
      {label}
    </button>
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

function KeyValueList({ rows }: { rows: Record<string, number> }) {
  const entries = Object.entries(rows).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  if (!entries.length) return <p className="text-sm text-slate-500">No rows.</p>;
  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[minmax(0,1fr)_4rem] gap-3 px-3 py-2 text-sm">
          <span className="break-words text-slate-300">{key}</span>
          <span className="text-right font-semibold text-white">{value}</span>
        </div>
      ))}
    </div>
  );
}

function IssueList({ rows }: { rows: IssueSummary[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No visual quality issues.</p>;
  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {rows.slice(0, 14).map((row) => (
        <div key={row.type} className="px-3 py-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="break-words font-semibold text-slate-200">{row.type}</p>
            <p className="shrink-0 text-right font-semibold text-white">{row.count}</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{row.message}</p>
          <p className="mt-1 break-words text-xs text-slate-500">{row.examples.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line px-2 py-1">
      <span className="text-slate-500">{label}: </span>
      <span className="break-words font-semibold text-slate-200">{value}</span>
    </div>
  );
}

function PromptBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
      <p className="break-words rounded-md border border-line bg-[#070b14] p-3 text-xs leading-5 text-slate-300">{value}</p>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className={cn("rounded-md border px-2 py-1", value >= 78 ? "border-emerald-300/25 bg-emerald-300/10" : value >= 55 ? "border-amber-300/25 bg-amber-300/10" : "border-rose-300/25 bg-rose-300/10")}>
      <p className="text-[10px] uppercase text-slate-500">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}

function TextItems({ title, items, empty }: { title?: string; items: string[]; empty: string }) {
  return (
    <div className={title ? "mt-3" : ""}>
      {title ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p> : null}
      {items.length ? (
        <ul className="space-y-2 text-sm leading-6 text-slate-300">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{empty}</p>
      )}
    </div>
  );
}

function labelStatus(status?: string) {
  return status ? status.toUpperCase() : "loading";
}

function toneForStatus(status?: string): Tone {
  if (status === "ok") return "ok";
  if (status === "error") return "error";
  if (status === "warning") return "warning";
  return "info";
}

function toneClass(tone: Tone) {
  return cn(
    tone === "ok" && "border-emerald-300/25 bg-emerald-300/10",
    tone === "warning" && "border-amber-300/25 bg-amber-300/10",
    tone === "error" && "border-rose-300/25 bg-rose-300/10",
    tone === "info" && "border-sky-300/25 bg-sky-300/10",
  );
}

function formatScores(scores?: Record<string, number>) {
  const entries = Object.entries(scores ?? {});
  if (!entries.length) return "-";
  return entries.map(([key, value]) => `${key.replace("Score", "")}: ${value}`).join(", ");
}
