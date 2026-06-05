"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Eye, ImageIcon, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "ok" | "warning" | "error";
type RenderStatus = "ok" | "warning" | "blocked";
type ChannelStatus = "ready" | "warning" | "blocked";
type Tone = "ok" | "warning" | "error" | "info";

interface FinalPreviewReport {
  status: Status;
  productionStoreMode: "json";
  sourceOfTruth: "json";
  safeToSwitchToSupabase: false;
  summary: FinalPreviewSummary;
  channelReadiness: ChannelReadiness[];
  previewPosts: PreviewPost[];
  recommendedFirstTestPost: PreviewPost | null;
  recommendedFirstTestChannel: { channelId: string; channelName: string } | null;
  safeForManualOnePostTest: boolean;
  safeForBulkPublishing: false;
  whyNotBulkPublishing: string[];
  requiredBeforePublishing: string[];
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface FinalPreviewSummary {
  totalPosts: number;
  readyPosts: number;
  scheduledPosts: number;
  alreadyPublishedPosts: number;
  failedPosts: number;
  skippedPosts: number;
  blockedPosts: number;
  missingImages: number;
  weakTexts: number;
  appliedDraftPosts: number;
  postsChangedByDraftApply: number;
  approvedOrAppliedDraftPosts: number;
  previewCandidatePosts: number;
}

interface PreviewPost {
  postId: string;
  channelId: string;
  channelName: string;
  topic: string;
  title: string;
  scheduledAt: string | null;
  postStatus: string;
  textPreview: string;
  telegramText: string;
  fullTextLength: number;
  imagePath: string;
  imageExists: boolean;
  imagePrompt: string | null;
  renderStatus: RenderStatus;
  issues: string[];
  publishReadinessScore: number;
  qualityStatus: string;
  changedByDraftApply: boolean;
  hasApprovedOrAppliedDraftRelation: boolean;
  appliedDraftId: string | null;
}

interface ChannelReadiness {
  channelId: string;
  channelName: string;
  active: boolean;
  readyPostsCount: number;
  blockedPostsCount: number;
  missingImagesCount: number;
  averageReadinessScore: number;
  nextCandidatePost: {
    postId: string;
    topic: string;
    publishReadinessScore: number;
    renderStatus: RenderStatus;
  } | null;
  status: ChannelStatus;
}

export function FinalPreviewPanel() {
  const [report, setReport] = useState<FinalPreviewReport | null>(null);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh(nextSelectedId = selectedPostId) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/final-preview/status", { cache: "no-store" });
      const payload = (await response.json()) as FinalPreviewReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Final preview request failed.");
      }

      const nextReport = payload as FinalPreviewReport;
      const nextSelected = nextReport.previewPosts.some((post) => post.postId === nextSelectedId)
        ? nextSelectedId
        : nextReport.recommendedFirstTestPost?.postId ?? nextReport.previewPosts[0]?.postId ?? "";
      setReport(nextReport);
      setSelectedPostId(nextSelected);
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

  const selectedPost = useMemo(
    () => report?.previewPosts.find((post) => post.postId === selectedPostId) ?? report?.recommendedFirstTestPost ?? report?.previewPosts[0] ?? null,
    [report, selectedPostId],
  );

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-300/30 bg-sky-300/10 text-sky-100">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase text-sky-300">Read-only publish preview</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Final Preview</h1>
          </div>
        </div>
        <button type="button" onClick={() => void refresh(selectedPostId)} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh preview
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-8">
        <Metric label="Overall preview status" value={labelStatus(report?.status)} tone={toneForStatus(report?.status)} />
        <Metric label="Ready posts" value={formatNumber(report?.summary.readyPosts)} tone={(report?.summary.readyPosts ?? 0) > 0 ? "ok" : "warning"} />
        <Metric label="Blocked posts" value={formatNumber(report?.summary.blockedPosts)} tone={(report?.summary.blockedPosts ?? 0) > 0 ? "error" : "ok"} />
        <Metric label="Missing images" value={formatNumber(report?.summary.missingImages)} tone={(report?.summary.missingImages ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Weak texts" value={formatNumber(report?.summary.weakTexts)} tone={(report?.summary.weakTexts ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Applied draft posts" value={formatNumber(report?.summary.appliedDraftPosts)} tone="info" />
        <Metric label="Safe 1-post test" value={report ? yesNo(report.safeForManualOnePostTest) : "-"} tone={report?.safeForManualOnePostTest ? "ok" : "warning"} />
        <Metric label="Bulk publishing" value="NO" tone="error" />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <Panel title="Recommended First Test Post" icon={<ShieldCheck className="h-4 w-4" />}>
          <RecommendedPost post={report?.recommendedFirstTestPost ?? null} channel={report?.recommendedFirstTestChannel ?? null} />
        </Panel>

        <Panel title="Publish Readiness" icon={<CheckCircle2 className="h-4 w-4" />}>
          <Rows rows={[
            ["Production store", report?.productionStoreMode ?? "json"],
            ["Source of truth", report?.sourceOfTruth ?? "json"],
            ["Safe to switch to Supabase", String(report?.safeToSwitchToSupabase ?? false)],
            ["Safe for bulk publishing", String(report?.safeForBulkPublishing ?? false)],
            ["Preview candidates", formatNumber(report?.summary.previewCandidatePosts)],
            ["Already published", formatNumber(report?.summary.alreadyPublishedPosts)],
          ]} />
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_29rem]">
        <Panel title="Preview Posts" icon={<Eye className="h-4 w-4" />}>
          <PreviewPostsTable rows={report?.previewPosts ?? []} selectedPostId={selectedPost?.postId ?? ""} onSelect={(post) => setSelectedPostId(post.postId)} />
        </Panel>

        <Panel title="Compare View" icon={<ImageIcon className="h-4 w-4" />}>
          <CompareView post={selectedPost} />
        </Panel>
      </section>

      <Panel title="Channel Readiness" icon={<ShieldCheck className="h-4 w-4" />}>
        <ChannelReadinessTable rows={report?.channelReadiness ?? []} />
      </Panel>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={[...(report?.warnings ?? []), ...(report?.requiredBeforePublishing ?? [])]} empty="No warnings." tone="warning" />
        <TextList title="Errors" items={report?.errors ?? []} empty="No errors." tone="error" />
      </section>

      <TextList title="Why Bulk Publishing Stays Off" items={report?.whyNotBulkPublishing ?? []} empty="Bulk publishing is off." tone="warning" />

      <p className="text-xs leading-5 text-slate-500">Last checked: {report?.lastCheckedAt ?? "not checked yet"}</p>
    </div>
  );
}

function RecommendedPost({ post, channel }: { post: PreviewPost | null; channel: { channelId: string; channelName: string } | null }) {
  if (!post) return <p className="text-sm text-slate-500">No recommended first test post found.</p>;

  return (
    <div className="divide-y divide-line rounded-md border border-line">
      <Row label="Post id" value={post.postId} />
      <Row label="Channel" value={channel ? `${channel.channelName} (${channel.channelId})` : post.channelName} />
      <Row label="Topic" value={post.topic} />
      <Row label="Readiness score" value={String(post.publishReadinessScore)} />
      <Row label="Image status" value={post.imageExists ? "exists" : "missing"} />
      <Row label="Issues" value={post.issues.length ? post.issues.join(", ") : "none"} />
    </div>
  );
}

function PreviewPostsTable({ rows, selectedPostId, onSelect }: { rows: PreviewPost[]; selectedPostId: string; onSelect: (post: PreviewPost) => void }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No ready or scheduled preview posts.</p>;

  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="min-w-[980px] divide-y divide-line text-left text-sm">
        <thead className="bg-slate-950/60 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Post id</th>
            <th className="px-3 py-2">Channel</th>
            <th className="px-3 py-2">Topic/title</th>
            <th className="px-3 py-2">Text preview</th>
            <th className="px-3 py-2">Image</th>
            <th className="px-3 py-2 text-right">Score</th>
            <th className="px-3 py-2">Render</th>
            <th className="px-3 py-2">Issues</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.postId} className={cn("transition hover:bg-slate-900/70", selectedPostId === row.postId && "bg-cyan-300/10")}>
              <td className="px-3 py-2 align-top">
                <button type="button" onClick={() => onSelect(row)} className="max-w-[12rem] break-words text-left font-semibold text-cyan-100 hover:text-white">
                  {row.postId}
                </button>
                <p className="mt-1 text-xs text-slate-500">{row.postStatus}</p>
              </td>
              <td className="px-3 py-2 align-top text-slate-300">{row.channelName}</td>
              <td className="px-3 py-2 align-top">
                <p className="max-w-[13rem] break-words text-slate-200">{row.topic}</p>
              </td>
              <td className="px-3 py-2 align-top">
                <p className="max-w-xs break-words text-slate-400">{row.textPreview}</p>
              </td>
              <td className="px-3 py-2 align-top font-semibold text-slate-200">{row.imageExists ? "exists" : "missing"}</td>
              <td className="px-3 py-2 text-right align-top font-semibold text-white">{row.publishReadinessScore}</td>
              <td className="px-3 py-2 align-top"><StatusPill status={row.renderStatus} /></td>
              <td className="px-3 py-2 align-top">
                <p className="max-w-[16rem] break-words text-slate-400">{row.issues.length ? row.issues.slice(0, 5).join(", ") : "none"}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChannelReadinessTable({ rows }: { rows: ChannelReadiness[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No channel readiness rows.</p>;

  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="min-w-[760px] divide-y divide-line text-left text-sm">
        <thead className="bg-slate-950/60 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Channel</th>
            <th className="px-3 py-2 text-right">Ready</th>
            <th className="px-3 py-2 text-right">Blocked</th>
            <th className="px-3 py-2 text-right">Missing images</th>
            <th className="px-3 py-2 text-right">Average score</th>
            <th className="px-3 py-2">Next candidate</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.channelId}>
              <td className="px-3 py-2">
                <p className="font-semibold text-slate-200">{row.channelName}</p>
                <p className="mt-1 text-xs text-slate-500">{row.channelId} / active: {String(row.active)}</p>
              </td>
              <td className="px-3 py-2 text-right text-slate-300">{row.readyPostsCount}</td>
              <td className="px-3 py-2 text-right text-slate-300">{row.blockedPostsCount}</td>
              <td className="px-3 py-2 text-right text-slate-300">{row.missingImagesCount}</td>
              <td className="px-3 py-2 text-right font-semibold text-white">{row.averageReadinessScore}</td>
              <td className="px-3 py-2">
                <p className="max-w-xs break-words text-slate-300">{row.nextCandidatePost?.postId ?? "-"}</p>
                <p className="mt-1 max-w-xs break-words text-xs text-slate-500">{row.nextCandidatePost?.topic ?? ""}</p>
              </td>
              <td className="px-3 py-2"><StatusPill status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompareView({ post }: { post: PreviewPost | null }) {
  if (!post) return <p className="text-sm text-slate-500">Select a preview post.</p>;

  return (
    <div className="space-y-3 text-sm">
      <Rows rows={[
        ["Post", post.postId],
        ["Channel", post.channelName],
        ["Image path", post.imagePath || "-"],
        ["Image exists", String(post.imageExists)],
        ["Readiness score", String(post.publishReadinessScore)],
        ["Render status", post.renderStatus],
        ["Changed by draft apply", String(post.changedByDraftApply)],
      ]} />
      <div className="rounded-md border border-line bg-slate-950/50 p-3">
        <p className="mb-2 text-xs uppercase text-slate-500">Full text as Telegram will send it</p>
        <pre className="max-h-[22rem] whitespace-pre-wrap break-words text-xs leading-5 text-slate-300">{post.telegramText || "-"}</pre>
      </div>
      <div className="rounded-md border border-line bg-slate-950/50 p-3">
        <p className="mb-2 text-xs uppercase text-slate-500">Image prompt / metadata</p>
        <p className="break-words text-xs leading-5 text-slate-300">{post.imagePrompt ?? "-"}</p>
      </div>
      <TextItems items={post.issues} empty="No issues." />
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", toneClass(tone))}>
      <p className="text-[11px] uppercase text-slate-500">{label}</p>
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
      {rows.map(([label, value]) => <Row key={label} label={label} value={value} />)}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 px-3 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="break-words text-right font-semibold text-slate-200">{value || "-"}</span>
    </div>
  );
}

function TextList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "warning" | "error" }) {
  const hasItems = items.length > 0;
  const Icon = tone === "error" && hasItems ? XCircle : hasItems ? AlertTriangle : CheckCircle2;

  return (
    <section className={cn("rounded-lg border p-4", hasItems ? toneClass(tone) : "border-line bg-panel/82")}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", tone === "error" && hasItems ? "text-rose-200" : hasItems ? "text-amber-200" : "text-emerald-200")} />
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-3">
        <TextItems items={items} empty={empty} />
      </div>
    </section>
  );
}

function TextItems({ items, empty }: { items: string[]; empty: string }) {
  return items.length ? (
    <ul className="space-y-2 text-sm leading-6 text-slate-300">
      {items.map((item) => (
        <li key={item} className="break-words">{item}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-slate-500">{empty}</p>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === "ready" || status === "ok" ? "ok" : status === "blocked" ? "error" : "warning";
  return <span className={cn("inline-flex min-h-7 items-center rounded-md border px-2 text-xs font-semibold", toneClass(tone))}>{status}</span>;
}

function formatNumber(value?: number) {
  return typeof value === "number" ? String(value) : "-";
}

function yesNo(value: boolean) {
  return value ? "YES" : "NO";
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
