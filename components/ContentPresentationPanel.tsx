"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileText, ImageIcon, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "ok" | "warning" | "error";
type Tone = "ok" | "warning" | "error" | "info";

interface ContentPresentationReport {
  status: Status;
  summary: {
    totalPosts: number;
    unpublishedPosts: number;
    weakPresentationPosts: number;
    demoAutogenRiskPosts: number;
    withoutHierarchyOrBold: number;
    dashBulletPosts: number;
    averageQualityScore: number;
    byLengthBucket: Record<string, number>;
    byTemplate: Record<string, number>;
    byVisualMode: Record<string, number>;
    byTypographyMode: Record<string, number>;
    previewOnly: boolean;
    realRichTextSendEnabled: boolean;
  };
  samples: SamplePost[];
  issues: IssueSummary[];
  recommendations: string[];
  richText: {
    flagName: string;
    enabledForRealSend: boolean;
    defaultValue: boolean;
    previewOnly: boolean;
  };
  lengthBuckets: Record<string, { minWords: number; maxWords: number; label: string }>;
  contentTemplates: string[];
  visualModes: string[];
  channelProfiles: Record<string, {
    lengthMix: Record<string, number>;
    allowedTemplates: string[];
    visualStyles: string[];
    imageCountDistribution: Record<string, number>;
    tone: string;
    formattingDensity: string;
    badPatterns: string[];
  }>;
  lastCheckedAt: string;
}

interface SamplePost {
  postId: string;
  channelId: string;
  title: string;
  originalTextSummary: string;
  lengthBucket: string;
  contentTemplate: string;
  typographyMode: string;
  visualMode: string;
  qualityScore: number;
  issues: string[];
  recommendations: string[];
  formattedPreview: string;
  visualGuidance: {
    imageCount: number;
    preferredStyles: string[];
    avoid: string[];
  };
}

interface IssueSummary {
  type: string;
  severity: string;
  count: number;
  examples: string[];
  message: string;
}

export function ContentPresentationPanel() {
  const [report, setReport] = useState<ContentPresentationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/content-presentation/status", { cache: "no-store" });
      const payload = (await response.json()) as ContentPresentationReport | { message?: string };
      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Content presentation request failed.");
      }
      setReport(payload as ContentPresentationReport);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const topProfiles = useMemo(() => Object.entries(report?.channelProfiles ?? {}).slice(0, 6), [report]);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Premium Presentation</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Premium Content Presentation</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Read-only preparation layer for richer text hierarchy, template variety, visual-mode intent, and presentation risk checks.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <RefreshButton loading={loading} onClick={refresh} label="Refresh presentation check" icon={<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />} />
          <RefreshButton loading={loading} onClick={refresh} label="Refresh preview" icon={<Eye className="h-4 w-4" />} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-7">
        <Metric label="Overall status" value={labelStatus(report?.status)} tone={toneForStatus(report?.status)} />
        <Metric label="Weak presentation" value={String(report?.summary.weakPresentationPosts ?? "-")} tone={(report?.summary.weakPresentationPosts ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Demo/autogen risk" value={String(report?.summary.demoAutogenRiskPosts ?? "-")} tone={(report?.summary.demoAutogenRiskPosts ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="No hierarchy/bold" value={String(report?.summary.withoutHierarchyOrBold ?? "-")} tone={(report?.summary.withoutHierarchyOrBold ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Dash bullets" value={String(report?.summary.dashBulletPosts ?? "-")} tone={(report?.summary.dashBulletPosts ?? 0) > 0 ? "warning" : "ok"} />
        <Metric label="Unpublished" value={String(report?.summary.unpublishedPosts ?? "-")} tone="info" />
        <Metric label="Avg score" value={String(report?.summary.averageQualityScore ?? "-")} tone="info" />
      </section>

      {error ? <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p> : null}

      <section className="grid gap-3 xl:grid-cols-3">
        <Panel title="Presentation status" icon={<CheckCircle2 className="h-4 w-4" />}>
          <Rows rows={[
            ["Total posts", String(report?.summary.totalPosts ?? "-")],
            ["Preview-only rich text", String(report?.richText.previewOnly ?? true)],
            ["Real rich text send", String(report?.richText.enabledForRealSend ?? false)],
            ["Feature flag", report?.richText.flagName ?? "ENABLE_TELEGRAM_RICH_TEXT"],
            ["Default flag", String(report?.richText.defaultValue ?? false)],
            ["Last checked", report?.lastCheckedAt ?? "not checked yet"],
          ]} />
        </Panel>
        <Panel title="Length buckets" icon={<FileText className="h-4 w-4" />}>
          <KeyValueList rows={report?.summary.byLengthBucket ?? {}} />
        </Panel>
        <Panel title="Visual modes" icon={<ImageIcon className="h-4 w-4" />}>
          <KeyValueList rows={report?.summary.byVisualMode ?? {}} />
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Templates" icon={<FileText className="h-4 w-4" />}>
          <KeyValueList rows={report?.summary.byTemplate ?? {}} />
        </Panel>
        <Panel title="Quality flags" icon={<AlertTriangle className="h-4 w-4" />}>
          <IssueList rows={report?.issues ?? []} />
        </Panel>
      </section>

      <Panel title="Preview samples" icon={<Eye className="h-4 w-4" />}>
        <div className="space-y-3">
          {(report?.samples ?? []).map((sample) => (
            <article key={sample.postId} className="rounded-lg border border-line bg-slate-950/30 p-3">
              <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{sample.channelId} / {sample.postId}</p>
                  <p className="mt-1 break-words text-sm text-slate-300">{sample.title}</p>
                </div>
                <p className="shrink-0 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">score {sample.qualityScore}</p>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-4">
                <Chip label="Length" value={sample.lengthBucket} />
                <Chip label="Template" value={sample.contentTemplate} />
                <Chip label="Typography" value={sample.typographyMode} />
                <Chip label="Visual" value={`${sample.visualMode} (${sample.visualGuidance.imageCount})`} />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">{sample.originalTextSummary}</p>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-[#070b14] p-3 text-sm leading-6 text-slate-200">{sample.formattedPreview}</pre>
              <div className="mt-3 grid gap-3 text-xs leading-5 text-slate-400 lg:grid-cols-2">
                <TextItems title="Issues" items={sample.issues} empty="No sample issues." />
                <TextItems title="Recommendations" items={sample.recommendations} empty="No recommendations." />
              </div>
            </article>
          ))}
          {report && !report.samples.length ? <p className="text-sm text-slate-500">No unpublished posts available for preview.</p> : null}
        </div>
      </Panel>

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="Channel profiles" icon={<Sparkles className="h-4 w-4" />}>
          <div className="space-y-3">
            {topProfiles.map(([channelId, profile]) => (
              <div key={channelId} className="rounded-md border border-line p-3">
                <p className="font-semibold text-slate-200">{channelId}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{profile.tone} / {profile.formattingDensity}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">Templates: {profile.allowedTemplates.join(", ")}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">Visuals: {profile.visualStyles.join(", ")}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Recommendations" icon={<CheckCircle2 className="h-4 w-4" />}>
          <TextItems items={report?.recommendations ?? []} empty="No recommendations." />
        </Panel>
      </section>
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
  if (!rows.length) return <p className="text-sm text-slate-500">No presentation issues.</p>;
  return (
    <div className="divide-y divide-line rounded-md border border-line">
      {rows.slice(0, 12).map((row) => (
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
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  );
}

function TextItems({ title, items, empty }: { title?: string; items: string[]; empty: string }) {
  return (
    <div>
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
