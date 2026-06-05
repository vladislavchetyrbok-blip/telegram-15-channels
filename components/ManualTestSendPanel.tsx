"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Eye, RefreshCw, SendHorizontal, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "ok" | "warning" | "error" | "info";

interface ManualTestSendReport {
  ok: boolean;
  status: "ok" | "warning" | "error";
  recommendedFirstTestPost: PreviewPost | null;
  safeForManualOnePostTest: boolean;
  safeForBulkPublishing: false;
  productionStoreMode: "json";
  sourceOfTruth: "json";
  selectedPostPreview: SelectedPostPreview | null;
  telegram: {
    botTokenConfigured: boolean;
    realPublishEnabled: string;
    dryRun: string;
    tokenValueExposed: false;
  };
  safety: {
    githubActionsTriggered: false;
    bulkPublishing: false;
    supabaseDirectWrite: false;
    schedulerYamlChanged: false;
    wouldSendToTelegram: false;
  };
  readinessIssues: string[];
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface PreviewPost {
  postId: string;
  channelId: string;
  channelName: string;
  topic: string;
  title: string;
  postStatus: string;
  telegramText: string;
  imagePath: string;
  imageExists: boolean;
  issues: string[];
  publishReadinessScore: number;
}

interface SelectedPostPreview {
  channel: {
    channelId: string;
    channelName: string;
    telegramTargetConfigured: boolean;
  };
  postId: string;
  postStatus: string;
  title: string;
  topic: string;
  text: string;
  textLength: number;
  imagePath: string;
  resolvedImagePath: string;
  imageExists: boolean;
  issues: string[];
  readinessScore: number;
  wouldSendToTelegram: false;
  telegramPayload: {
    method: string;
    chatId: string | null;
    photo: string;
    imagePath: string;
    caption: string;
    parseMode: string;
  };
}

interface SendResult {
  ok: boolean;
  sent: boolean;
  postId: string | null;
  channelId: string | null;
  backupPath: string | null;
  publicationLogId: string | null;
  telegramMessageId: number | null;
  warnings: string[];
  errors: string[];
}

export function ManualTestSendPanel() {
  const [report, setReport] = useState<ManualTestSendReport | null>(null);
  const [postId, setPostId] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  async function refresh(nextPostId = postId) {
    setLoading(true);
    setError(null);

    try {
      const query = nextPostId ? `?postId=${encodeURIComponent(nextPostId)}` : "";
      const response = await fetch(`/api/admin/manual-test-send/status${query}`, { cache: "no-store" });
      const payload = (await response.json()) as ManualTestSendReport | { message?: string; errors?: string[] };
      if (!response.ok && "message" in payload && payload.message) {
        throw new Error(payload.message);
      }

      const nextReport = payload as ManualTestSendReport;
      setReport(nextReport);
      setPostId(nextPostId || nextReport.selectedPostPreview?.postId || nextReport.recommendedFirstTestPost?.postId || "");
      setSendResult(null);
      setConfirmChecked(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function sendOnePost() {
    if (!report?.safeForManualOnePostTest || !postId || !confirmChecked) return;
    setSending(true);
    setError(null);
    setSendResult(null);

    try {
      const response = await fetch("/api/admin/manual-test-send/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, confirm: true }),
      });
      const payload = (await response.json()) as SendResult | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "One-post test send failed.");
      }
      setSendResult(payload as SendResult);
      await refresh(postId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    void refresh("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = report?.selectedPostPreview ?? null;
  const canSend = Boolean(report?.safeForManualOnePostTest && selected && confirmChecked && !loading && !sending);
  const dryRunPayload = useMemo(() => selected?.telegramPayload ?? null, [selected]);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <SendHorizontal className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Manual one-post test</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Manual Test Send</h1>
          </div>
        </div>
        <button type="button" onClick={() => void refresh(postId)} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-7">
        <Metric label="Recommended post" value={report?.recommendedFirstTestPost?.postId ?? "none"} tone={report?.recommendedFirstTestPost ? "ok" : "warning"} />
        <Metric label="Manual one-post safe" value={yesNo(report?.safeForManualOnePostTest)} tone={report?.safeForManualOnePostTest ? "ok" : "warning"} />
        <Metric label="Bulk publishing" value="NO" tone="error" />
        <Metric label="Token configured" value={yesNo(report?.telegram.botTokenConfigured)} tone={report?.telegram.botTokenConfigured ? "ok" : "warning"} />
        <Metric label="Real publish enabled" value={report?.telegram.realPublishEnabled ?? "unknown"} tone="info" />
        <Metric label="Dry-run flag" value={report?.telegram.dryRun ?? "unknown"} tone="info" />
        <Metric label="Readiness score" value={selected ? String(selected.readinessScore) : "-"} tone={selected && selected.readinessScore >= 82 ? "ok" : "warning"} />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}
      {sendResult ? <SendResultView result={sendResult} /> : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_27rem]">
        <Panel title="Dry-run preview" icon={<Eye className="h-4 w-4" />}>
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-[0.12em] text-slate-500" htmlFor="post-id">Post id</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="post-id"
                value={postId}
                onChange={(event) => setPostId(event.target.value)}
                className="min-h-10 flex-1 rounded-md border border-line bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              />
              <button type="button" onClick={() => void refresh(postId)} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-sky-300/30 bg-sky-300/10 px-3 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-60">
                <Eye className="h-4 w-4" />
                Dry-run preview
              </button>
            </div>
            <Rows rows={[
              ["Channel", selected ? `${selected.channel.channelName} (${selected.channel.channelId})` : "-"],
              ["Post status", selected?.postStatus ?? "-"],
              ["Image path", selected?.imagePath || "-"],
              ["Image exists", yesNo(selected?.imageExists)],
              ["Would send to Telegram", "false"],
              ["Production store", report?.productionStoreMode ?? "json"],
              ["Source of truth", report?.sourceOfTruth ?? "json"],
            ]} />
          </div>
        </Panel>

        <Panel title="Send one test post" icon={<ShieldCheck className="h-4 w-4" />}>
          <div className="space-y-3">
            <p className="rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
              One Telegram post will be sent. Bulk publishing and GitHub Actions are not part of this action.
            </p>
            <label className="flex items-start gap-3 rounded-md border border-line bg-slate-950/40 p-3 text-sm leading-6 text-slate-300">
              <input type="checkbox" checked={confirmChecked} onChange={(event) => setConfirmChecked(event.target.checked)} className="mt-1 h-4 w-4 accent-cyan-300" />
              I confirm sending exactly one selected test post.
            </label>
            <button type="button" onClick={() => void sendOnePost()} disabled={!canSend} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-rose-300/35 bg-rose-300/10 px-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:opacity-50">
              <SendHorizontal className="h-4 w-4" />
              {sending ? "Sending..." : "Send one test post"}
            </button>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Post text preview" icon={<Eye className="h-4 w-4" />}>
          <pre className="max-h-[28rem] whitespace-pre-wrap break-words rounded-md border border-line bg-slate-950/50 p-3 text-xs leading-5 text-slate-300">{selected?.text || "-"}</pre>
        </Panel>

        <Panel title="Telegram payload" icon={<SendHorizontal className="h-4 w-4" />}>
          <pre className="max-h-[28rem] whitespace-pre-wrap break-words rounded-md border border-line bg-slate-950/50 p-3 text-xs leading-5 text-slate-300">{dryRunPayload ? JSON.stringify(dryRunPayload, null, 2) : "-"}</pre>
        </Panel>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <TextList title="Warnings" items={report?.warnings ?? []} empty="No warnings." tone="warning" />
        <TextList title="Errors" items={[...(report?.errors ?? []), ...(report?.readinessIssues ?? [])]} empty="No errors." tone="error" />
      </section>

      <p className="text-xs leading-5 text-slate-500">Last checked: {report?.lastCheckedAt ?? "not checked yet"}</p>
    </div>
  );
}

function SendResultView({ result }: { result: SendResult }) {
  return (
    <section className={cn("rounded-lg border p-4", result.ok ? toneClass("ok") : toneClass("error"))}>
      <div className="flex items-center gap-2">
        {result.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-200" /> : <XCircle className="h-4 w-4 text-rose-200" />}
        <h2 className="text-base font-semibold text-white">Send result</h2>
      </div>
      <div className="mt-3">
        <Rows rows={[
          ["Sent", yesNo(result.sent)],
          ["Post id", result.postId ?? "-"],
          ["Channel id", result.channelId ?? "-"],
          ["Backup path", result.backupPath ?? "-"],
          ["Publication log id", result.publicationLogId ?? "-"],
          ["Telegram message id", result.telegramMessageId ? String(result.telegramMessageId) : "-"],
        ]} />
      </div>
    </section>
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
      {hasItems ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
          {Array.from(new Set(items)).map((item) => (
            <li key={item} className="break-words">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      )}
    </section>
  );
}

function yesNo(value: boolean | undefined) {
  if (value === undefined) return "unknown";
  return value ? "true" : "false";
}

function toneClass(tone: Tone) {
  return cn(
    tone === "ok" && "border-emerald-300/25 bg-emerald-300/10",
    tone === "warning" && "border-amber-300/25 bg-amber-300/10",
    tone === "error" && "border-rose-300/25 bg-rose-300/10",
    tone === "info" && "border-sky-300/25 bg-sky-300/10",
  );
}
