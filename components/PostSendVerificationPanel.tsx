"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Database, FileSearch, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AuditStatus = "ok" | "warning" | "error";
type Tone = "ok" | "warning" | "error" | "info";

interface PostSendVerificationReport {
  status: AuditStatus;
  productionStoreMode: "json";
  sourceOfTruth: "json";
  safeToSwitchToSupabase: false;
  lastPublication: LastPublication;
  selectedPostVerification: SelectedPostVerification | null;
  bulkSafety: BulkSafety;
  storeConsistency: StoreConsistency;
  githubActions: GithubActionsSafety;
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface LastPublication {
  latestPublicationLog: Record<string, unknown> | null;
  latestPublishedPostId: string | null;
  latestPublishedChannelId: string | null;
  latestPublishedAt: string | null;
  latestTelegramMessageId: string | number | null;
  latestStatus: string;
  latestError: string | null;
  latestWasActualPublication: boolean;
}

interface SelectedPostVerification {
  requestedPostId: string;
  postExists: boolean;
  postId: string;
  postChannelId: string | null;
  postStatus: string;
  publishResult: string;
  statusIsPublishedLike: boolean;
  testPublished: boolean;
  publicationLogExists: boolean;
  logCountForPost: number;
  actualPublicationLogCountForPost: number;
  latestLog: Record<string, unknown> | null;
  latestLogStatus: string;
  latestLogChannelId: string | null;
  actualLogChannelIds: string[];
  telegramMessageIdExists: boolean;
  telegramMessageId: string | number | null;
  channelIdMatches: boolean;
  duplicatePostInJson: boolean;
  duplicatePostCountInJson: number;
  duplicatePublicationLogs: boolean;
  otherPostsTouchedInLast10Minutes: string[];
}

interface BulkSafety {
  windowMinutes: number;
  maxAllowedForManualTest: number;
  publicationsInLast10Minutes: number;
  uniquePostsPublishedInLast10Minutes: number;
  uniqueChannelsTouchedInLast10Minutes: number;
  recentPublishedPostIds: string[];
  recentTouchedChannelIds: string[];
  bulkDetected: boolean;
  warnings: string[];
}

interface StoreConsistency {
  status: AuditStatus;
  synced: boolean;
  supabaseConfigured: boolean;
  message: string;
  localCounts: Record<string, number> | null;
  supabaseCounts: Record<string, number> | null;
  missingCounts: Record<string, number> | null;
  extraCounts: Record<string, number> | null;
  duplicateCounts: {
    local: Record<string, number> | null;
    supabase: Record<string, number> | null;
  } | null;
  compareCheckedAt: string | null;
  productionStoreMode: "json";
  sourceOfTruth: "json";
  safeToSwitchToSupabase: false;
}

interface GithubActionsSafety {
  workflowNotTriggeredByThisCheck: boolean;
  workflowDispatchUsed: boolean;
  githubActionsTriggered: boolean;
  githubApiAvailable: boolean;
  tokenValueExposed: false;
}

export function PostSendVerificationPanel() {
  const [report, setReport] = useState<PostSendVerificationReport | null>(null);
  const [postId, setPostId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh(nextPostId = postId) {
    setLoading(true);
    setError(null);

    try {
      const query = nextPostId ? `?postId=${encodeURIComponent(nextPostId)}` : "";
      const response = await fetch(`/api/admin/post-send-verification/status${query}`, { cache: "no-store" });
      const payload = (await response.json()) as PostSendVerificationReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Post-send verification request failed.");
      }

      const nextReport = payload as PostSendVerificationReport;
      setReport(nextReport);
      setPostId(nextPostId || nextReport.lastPublication.latestPublishedPostId || "");
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

  const selected = report?.selectedPostVerification ?? null;
  const storeRows = useMemo(
    () => [
      ["Production store", report?.productionStoreMode ?? "json"],
      ["Source of truth", report?.sourceOfTruth ?? "json"],
      ["Safe to switch to Supabase", yesNo(report?.safeToSwitchToSupabase)],
      ["Supabase configured", yesNo(report?.storeConsistency.supabaseConfigured)],
      ["Store synced", yesNo(report?.storeConsistency.synced)],
      ["Compare checked at", report?.storeConsistency.compareCheckedAt ?? "-"],
    ] as Array<[string, string]>,
    [report],
  );

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <FileSearch className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Publication audit</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Post-Send Verification</h1>
          </div>
        </div>
        <button type="button" onClick={() => void refresh(postId)} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh audit
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-10">
        <Metric label="Overall audit status" value={labelStatus(report?.status)} tone={toneForStatus(report?.status)} />
        <Metric label="Last publication status" value={report?.lastPublication.latestStatus ?? "-"} tone={report?.lastPublication.latestWasActualPublication ? "ok" : "warning"} />
        <Metric label="Last post id" value={report?.lastPublication.latestPublishedPostId ?? "-"} tone="info" />
        <Metric label="Last channel" value={report?.lastPublication.latestPublishedChannelId ?? "-"} tone="info" />
        <Metric label="Last published at" value={report?.lastPublication.latestPublishedAt ?? "-"} tone="info" />
        <Metric label="Telegram message id present" value={yesNo(Boolean(report?.lastPublication.latestTelegramMessageId))} tone={report?.lastPublication.latestTelegramMessageId ? "ok" : "warning"} />
        <Metric label="Publications in last 10 minutes" value={formatNumber(report?.bulkSafety.publicationsInLast10Minutes)} tone={(report?.bulkSafety.publicationsInLast10Minutes ?? 0) <= 1 ? "ok" : "error"} />
        <Metric label="Unique posts touched" value={formatNumber(report?.bulkSafety.uniquePostsPublishedInLast10Minutes)} tone={(report?.bulkSafety.uniquePostsPublishedInLast10Minutes ?? 0) <= 1 ? "ok" : "error"} />
        <Metric label="Unique channels touched" value={formatNumber(report?.bulkSafety.uniqueChannelsTouchedInLast10Minutes)} tone={(report?.bulkSafety.uniqueChannelsTouchedInLast10Minutes ?? 0) <= 1 ? "ok" : "error"} />
        <Metric label="Bulk detected" value={yesNo(report?.bulkSafety.bulkDetected)} tone={report?.bulkSafety.bulkDetected ? "error" : "ok"} />
        <Metric label="Store synced" value={yesNo(report?.storeConsistency.synced)} tone={report?.storeConsistency.synced ? "ok" : "warning"} />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_27rem]">
        <Panel title="Last publication" icon={<FileSearch className="h-4 w-4" />}>
          <Rows rows={[
            ["postId", report?.lastPublication.latestPublishedPostId ?? "-"],
            ["channelId", report?.lastPublication.latestPublishedChannelId ?? "-"],
            ["status", report?.lastPublication.latestStatus ?? "-"],
            ["publishedAt", report?.lastPublication.latestPublishedAt ?? "-"],
            ["telegramMessageId", valueText(report?.lastPublication.latestTelegramMessageId)],
            ["actual publication", yesNo(report?.lastPublication.latestWasActualPublication)],
            ["error", report?.lastPublication.latestError ?? "-"],
          ]} />
        </Panel>

        <Panel title="GitHub Actions safety" icon={<ShieldCheck className="h-4 w-4" />}>
          <Rows rows={[
            ["Workflow triggered by this check", yesNo(report ? !report.githubActions.workflowNotTriggeredByThisCheck : undefined)],
            ["workflow_dispatch used", yesNo(report?.githubActions.workflowDispatchUsed)],
            ["GitHub Actions triggered", yesNo(report?.githubActions.githubActionsTriggered)],
            ["GitHub API available", yesNo(report?.githubActions.githubApiAvailable)],
            ["Token value exposed", yesNo(report?.githubActions.tokenValueExposed)],
          ]} />
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Bulk safety" icon={<ShieldCheck className="h-4 w-4" />}>
          <Rows rows={[
            ["Window minutes", formatNumber(report?.bulkSafety.windowMinutes)],
            ["Max allowed for manual test", formatNumber(report?.bulkSafety.maxAllowedForManualTest)],
            ["Publications in last 10 minutes", formatNumber(report?.bulkSafety.publicationsInLast10Minutes)],
            ["Unique posts", formatNumber(report?.bulkSafety.uniquePostsPublishedInLast10Minutes)],
            ["Unique channels", formatNumber(report?.bulkSafety.uniqueChannelsTouchedInLast10Minutes)],
            ["Bulk detected", yesNo(report?.bulkSafety.bulkDetected)],
            ["Recent post ids", report?.bulkSafety.recentPublishedPostIds.join(", ") || "-"],
            ["Recent channel ids", report?.bulkSafety.recentTouchedChannelIds.join(", ") || "-"],
          ]} />
          <div className="mt-3">
            <TextItems items={report?.bulkSafety.warnings ?? []} empty="No bulk warnings." />
          </div>
        </Panel>

        <Panel title="Selected post check" icon={<FileSearch className="h-4 w-4" />}>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={postId}
                onChange={(event) => setPostId(event.target.value)}
                placeholder="postId"
                className="min-h-10 flex-1 rounded-md border border-line bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
              />
              <button type="button" onClick={() => void refresh(postId)} disabled={loading || !postId.trim()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-sky-300/30 bg-sky-300/10 px-3 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-60">
                <FileSearch className="h-4 w-4" />
                Check post id
              </button>
            </div>
            <Rows rows={[
              ["Requested post id", selected?.requestedPostId ?? "-"],
              ["Post exists", yesNo(selected?.postExists)],
              ["Publication log exists", yesNo(selected?.publicationLogExists)],
              ["Log count for post", formatNumber(selected?.logCountForPost)],
              ["Actual publication logs", formatNumber(selected?.actualPublicationLogCountForPost)],
              ["Post status", selected?.postStatus ?? "-"],
              ["Publish result", selected?.publishResult ?? "-"],
              ["Published/testPublished status", yesNo(selected?.statusIsPublishedLike || selected?.testPublished)],
              ["Telegram message id exists", yesNo(selected?.telegramMessageIdExists)],
              ["Telegram message id", valueText(selected?.telegramMessageId)],
              ["Post channelId", selected?.postChannelId ?? "-"],
              ["Latest log channelId", selected?.latestLogChannelId ?? "-"],
              ["ChannelId matches", yesNo(selected?.channelIdMatches)],
              ["Duplicate post in JSON", yesNo(selected?.duplicatePostInJson)],
              ["Duplicate publication logs", yesNo(selected?.duplicatePublicationLogs)],
              ["Other posts touched recently", selected?.otherPostsTouchedInLast10Minutes.join(", ") || "-"],
            ]} />
          </div>
        </Panel>
      </section>

      <Panel title="Store consistency" icon={<Database className="h-4 w-4" />}>
        <Rows rows={storeRows} />
        <p className="mt-3 break-words text-sm leading-6 text-slate-400">{report?.storeConsistency.message ?? "-"}</p>
        <StoreCounts report={report} />
      </Panel>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={report?.warnings ?? []} empty="No warnings." tone="warning" />
        <TextList title="Errors" items={report?.errors ?? []} empty="No errors." tone="error" />
      </section>

      <p className="text-xs leading-5 text-slate-500">Last checked: {report?.lastCheckedAt ?? "not checked yet"}</p>
    </div>
  );
}

function StoreCounts({ report }: { report: PostSendVerificationReport | null }) {
  const rows = ["channels", "posts", "publication_logs", "scheduler_runs"];

  return (
    <div className="mt-3 overflow-x-auto rounded-md border border-line">
      <table className="min-w-[720px] divide-y divide-line text-left text-xs">
        <thead className="bg-slate-950/60 text-slate-500">
          <tr>
            <th className="px-3 py-2">table</th>
            <th className="px-3 py-2 text-right">json</th>
            <th className="px-3 py-2 text-right">supabase</th>
            <th className="px-3 py-2 text-right">missing</th>
            <th className="px-3 py-2 text-right">extra</th>
            <th className="px-3 py-2 text-right">json duplicates</th>
            <th className="px-3 py-2 text-right">supabase duplicates</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row}>
              <td className="px-3 py-2 font-semibold text-slate-300">{row}</td>
              <td className="px-3 py-2 text-right text-slate-400">{valueText(report?.storeConsistency.localCounts?.[row])}</td>
              <td className="px-3 py-2 text-right text-slate-400">{valueText(report?.storeConsistency.supabaseCounts?.[row])}</td>
              <td className="px-3 py-2 text-right text-slate-400">{valueText(report?.storeConsistency.missingCounts?.[row])}</td>
              <td className="px-3 py-2 text-right text-slate-400">{valueText(report?.storeConsistency.extraCounts?.[row])}</td>
              <td className="px-3 py-2 text-right text-slate-400">{valueText(report?.storeConsistency.duplicateCounts?.local?.[row])}</td>
              <td className="px-3 py-2 text-right text-slate-400">{valueText(report?.storeConsistency.duplicateCounts?.supabase?.[row])}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

function Rows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-3 px-3 py-2 text-sm">
          <span className="text-slate-500">{label}</span>
          <span className="break-words text-right font-semibold text-slate-200">{value || "-"}</span>
        </div>
      ))}
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
      {Array.from(new Set(items)).map((item) => (
        <li key={item} className="break-words">{item}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-slate-500">{empty}</p>
  );
}

function formatNumber(value?: number) {
  return typeof value === "number" ? String(value) : "-";
}

function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function yesNo(value: boolean | undefined) {
  if (value === undefined) return "unknown";
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
