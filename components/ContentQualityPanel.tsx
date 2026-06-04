"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, FileText, ImageIcon, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "ok" | "warning" | "error";
type QualityStatus = "excellent" | "good" | "warning" | "bad" | "blocked";
type Tone = "ok" | "warning" | "error" | "info";

interface ContentQualityReport {
  status: Status;
  productionStoreMode: "json";
  sourceOfTruth: "json";
  safeToSwitchToSupabase: false;
  summary: {
    totalPosts: number;
    excellent: number;
    good: number;
    warning: number;
    bad: number;
    blocked: number;
    goodPosts: number;
    warningPosts: number;
    badPosts: number;
    blockedPosts: number;
    missingImages: number;
    needsRegeneration: number;
    readyToPublish: number;
    blockedByQuality: number;
    safeToPublish: number;
    riskyToPublish: number;
  };
  channelQuality: ChannelQuality[];
  problemPosts: ProblemPost[];
  repeatedProblems: RepeatedProblem[];
  recommendations: string[];
  warnings: string[];
  errors: string[];
  lastCheckedAt: string;
}

interface ChannelQuality {
  channelId: string;
  channelName: string;
  totalPosts: number;
  readyPosts: number;
  weakPosts: number;
  missingImages: number;
  duplicateTopics: number;
  averageQualityScore: number;
  status: QualityStatus;
}

interface ProblemPost {
  postId: string;
  channelId: string;
  channel: string;
  title: string;
  topic: string;
  textLength: number;
  imagePath: string;
  qualityScore: number;
  status: QualityStatus;
  readyToPublish: boolean;
  blockedByQuality: boolean;
  needsRegeneration: boolean;
  safeToPublish: boolean;
  riskyToPublish: boolean;
  issues: string[];
  recommendation: string;
}

interface RepeatedProblem {
  issueType: string;
  count: number;
  examples: string[];
}

export function ContentQualityPanel() {
  const [report, setReport] = useState<ContentQualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/content-quality/status", { cache: "no-store" });
      const payload = (await response.json()) as ContentQualityReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Content quality request failed.");
      }
      setReport(payload as ContentQualityReport);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const groupedProblems = useMemo(() => {
    const groups = new Map<string, ProblemPost[]>();
    for (const post of report?.problemPosts ?? []) {
      for (const issue of post.issues) {
        const current = groups.get(issue) ?? [];
        if (current.length < 5) current.push(post);
        groups.set(issue, current);
      }
    }
    return Array.from(groups.entries())
      .map(([issueType, examples]) => ({ issueType, count: (report?.problemPosts ?? []).filter((post) => post.issues.includes(issueType)).length, examples: examples.map((post) => `${post.channelId}/${post.postId}`) }))
      .sort((left, right) => right.count - left.count || left.issueType.localeCompare(right.issueType));
  }, [report]);

  const missingImages = (report?.problemPosts ?? []).filter((post) => post.issues.some((issue) => issue.includes("image")));
  const genericText = (report?.problemPosts ?? []).filter((post) => post.issues.some((issue) => ["generic_template_text", "repeated_template", "service_label"].includes(issue)));
  const topicMismatch = (report?.problemPosts ?? []).filter((post) => post.issues.includes("channel_topic_mismatch"));
  const repeatedTopics = (report?.problemPosts ?? []).filter((post) => post.issues.includes("duplicate_topic"));
  const repeatedVisuals = (report?.problemPosts ?? []).filter((post) => post.issues.includes("repeated_visual"));

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Content Quality</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Quality Control</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only checks for text quality, image readiness, repeated patterns, channel fit, and publish readiness.</p>
          </div>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh quality report
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-9">
        <Metric label="Overall status" value={labelStatus(report?.status)} tone={toneForStatus(report?.status)} />
        <Metric label="Total posts" value={String(report?.summary.totalPosts ?? "-")} tone="info" />
        <Metric label="Good posts" value={String(report?.summary.goodPosts ?? "-")} tone="ok" />
        <Metric label="Warning posts" value={String(report?.summary.warningPosts ?? "-")} tone="warning" />
        <Metric label="Bad posts" value={String(report?.summary.badPosts ?? "-")} tone="error" />
        <Metric label="Blocked posts" value={String(report?.summary.blockedPosts ?? "-")} tone="error" />
        <Metric label="Missing images" value={String(report?.summary.missingImages ?? "-")} tone={(report?.summary.missingImages ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Needs regeneration" value={String(report?.summary.needsRegeneration ?? "-")} tone={(report?.summary.needsRegeneration ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Safe / risky" value={`${report?.summary.safeToPublish ?? "-"} / ${report?.summary.riskyToPublish ?? "-"}`} tone="info" />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Channel quality ranking" icon={<ShieldCheck className="h-4 w-4" />}>
          <ChannelQualityTable rows={report?.channelQuality ?? []} />
        </Panel>

        <Panel title="Publication readiness" icon={<CheckCircle2 className="h-4 w-4" />}>
          <Rows rows={[
            ["Ready to publish", String(report?.summary.readyToPublish ?? "-")],
            ["Blocked by quality", String(report?.summary.blockedByQuality ?? "-")],
            ["Needs regeneration", String(report?.summary.needsRegeneration ?? "-")],
            ["Safe to publish", String(report?.summary.safeToPublish ?? "-")],
            ["Risky to publish", String(report?.summary.riskyToPublish ?? "-")],
            ["Production store", report?.productionStoreMode ?? "json"],
            ["Source of truth", report?.sourceOfTruth ?? "json"],
            ["Safe to switch", String(report?.safeToSwitchToSupabase ?? false)],
          ]} />
        </Panel>
      </section>

      <Panel title="Problem posts" icon={<AlertTriangle className="h-4 w-4" />}>
        <ProblemPostsTable rows={report?.problemPosts ?? []} />
      </Panel>

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Missing images" icon={<ImageIcon className="h-4 w-4" />}>
          <CompactPostList rows={missingImages} empty="No missing image problems." />
        </Panel>
        <Panel title="Generic/template text" icon={<FileText className="h-4 w-4" />}>
          <CompactPostList rows={genericText} empty="No generic text problems." />
        </Panel>
        <Panel title="Channel/topic mismatch" icon={<AlertTriangle className="h-4 w-4" />}>
          <CompactPostList rows={topicMismatch} empty="No channel/topic mismatch detected." />
        </Panel>
        <Panel title="Repeated topics" icon={<FileText className="h-4 w-4" />}>
          <CompactPostList rows={repeatedTopics} empty="No repeated topics detected." />
        </Panel>
        <Panel title="Repeated visuals" icon={<ImageIcon className="h-4 w-4" />}>
          <CompactPostList rows={repeatedVisuals} empty="No repeated visuals detected." />
        </Panel>
        <Panel title="Repeated/generic problems" icon={<FileText className="h-4 w-4" />}>
          <RepeatedProblemsTable rows={[...(report?.repeatedProblems ?? []), ...groupedProblems].slice(0, 20)} />
        </Panel>
      </section>

      <Panel title="Recommendations" icon={<CheckCircle2 className="h-4 w-4" />}>
        <TextItems items={report?.recommendations ?? []} empty="No recommendations." />
      </Panel>

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

function ChannelQualityTable({ rows }: { rows: ChannelQuality[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No channel quality rows.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-line">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-3 py-2">Channel</th>
            <th className="px-3 py-2 text-right">Total</th>
            <th className="px-3 py-2 text-right">Ready</th>
            <th className="px-3 py-2 text-right">Weak</th>
            <th className="px-3 py-2 text-right">Missing</th>
            <th className="px-3 py-2 text-right">Score</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.channelId}>
              <td className="px-3 py-2">
                <p className="font-semibold text-slate-200">{row.channelId}</p>
                <p className="mt-1 text-xs text-slate-500">{row.channelName}</p>
              </td>
              <td className="px-3 py-2 text-right text-slate-300">{row.totalPosts}</td>
              <td className="px-3 py-2 text-right text-slate-300">{row.readyPosts}</td>
              <td className="px-3 py-2 text-right text-slate-300">{row.weakPosts}</td>
              <td className="px-3 py-2 text-right text-slate-300">{row.missingImages}</td>
              <td className="px-3 py-2 text-right font-semibold text-white">{row.averageQualityScore}</td>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProblemPostsTable({ rows }: { rows: ProblemPost[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No problem posts detected.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-line">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-3 py-2">Post</th>
            <th className="px-3 py-2">Channel</th>
            <th className="px-3 py-2 text-right">Score</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Issues</th>
            <th className="px-3 py-2">Recommendation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.postId}>
              <td className="px-3 py-2">
                <p className="font-semibold text-slate-200">{row.postId}</p>
                <p className="mt-1 max-w-xs break-words text-xs text-slate-500">{row.title}</p>
              </td>
              <td className="px-3 py-2 text-slate-300">{row.channelId}</td>
              <td className="px-3 py-2 text-right font-semibold text-white">{row.qualityScore}</td>
              <td className="px-3 py-2 font-semibold text-slate-200">{row.status}</td>
              <td className="px-3 py-2 text-slate-400">{row.issues.slice(0, 4).join(", ")}</td>
              <td className="px-3 py-2 text-slate-400">{row.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompactPostList({ rows, empty }: { rows: ProblemPost[]; empty: string }) {
  if (!rows.length) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {rows.slice(0, 8).map((row) => (
        <div key={`${row.postId}-${row.issues.join("-")}`} className="px-3 py-2 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="break-words font-semibold text-slate-200">{row.postId}</p>
            <p className="text-xs font-semibold text-slate-400">{row.status} / {row.qualityScore}</p>
          </div>
          <p className="mt-1 break-words text-xs text-slate-500">{row.channelId}: {row.issues.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

function RepeatedProblemsTable({ rows }: { rows: RepeatedProblem[] }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No repeated or generic problems.</p>;
  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {rows.map((row, index) => (
        <div key={`${row.issueType}-${index}`} className="grid grid-cols-[minmax(0,1fr)_4rem] gap-3 px-3 py-2 text-sm">
          <div>
            <p className="font-semibold text-slate-200">{row.issueType}</p>
            <p className="mt-1 break-words text-xs text-slate-500">{row.examples.join(", ")}</p>
          </div>
          <p className="text-right font-semibold text-white">{row.count}</p>
        </div>
      ))}
    </div>
  );
}

function TextItems({ items, empty }: { items: string[]; empty: string }) {
  return items.length ? (
    <ul className="space-y-2 text-sm leading-6 text-slate-300">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-slate-500">{empty}</p>
  );
}

function TextList({ title, items, empty, tone }: { title: string; items: string[]; empty: string; tone: "warning" | "error" }) {
  return (
    <section className={cn("rounded-lg border p-4", items.length ? toneClass(tone) : "border-line bg-panel/82")}>
      <div className="flex items-center gap-2">
        {items.length ? <AlertTriangle className="h-4 w-4 text-amber-200" /> : <CheckCircle2 className="h-4 w-4 text-emerald-200" />}
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-3">
        <TextItems items={items} empty={empty} />
      </div>
    </section>
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
