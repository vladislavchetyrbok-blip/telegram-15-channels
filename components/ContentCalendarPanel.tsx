"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Eye, ImageIcon, RefreshCw, SendHorizontal, SkipForward, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarStatus = "planned" | "ready" | "published" | "skipped" | "error" | "needs_review";
type QualityStatus = "ready" | "blocked" | "needs_review";

interface CalendarItem {
  id: string;
  date: string;
  time: string;
  timezone: "Europe/Kyiv";
  channelId: string;
  channelName: string;
  language: "ru" | "uk";
  rubric: string;
  category: string;
  title: string;
  shortDescription: string;
  postText: string;
  visualBrief: string;
  visualPath: string;
  visualConfig: Record<string, unknown>;
  qualityStatus: QualityStatus;
  qualityIssues: string[];
  status: CalendarStatus;
  message_id: number | null;
  link: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CalendarState {
  ok: boolean;
  timezone: "Europe/Kyiv";
  expectedRows: number;
  summary: {
    ready: number;
    planned: number;
    published: number;
    skipped: number;
    error: number;
    needsReview: number;
  };
  items: CalendarItem[];
}

interface PreviewState {
  ok: boolean;
  preview: {
    id: string;
    channelId: string;
    channelName: string;
    date: string;
    time: string;
    timezone: "Europe/Kyiv";
    title: string;
    text: string;
    imagePath: string;
    visualBrief: string;
    qualityIssues: string[];
    qualityStatus: QualityStatus;
    canPublish: boolean;
  } | null;
  message: string;
}

export function ContentCalendarPanel() {
  const [state, setState] = useState<CalendarState | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    void load();
  }, []);

  const dates = useMemo(() => Array.from(new Set((state?.items ?? []).map((item) => item.date))).sort(), [state?.items]);
  const channels = useMemo(() => Array.from(new Map((state?.items ?? []).map((item) => [item.channelId, item.channelName])).entries()), [state?.items]);
  const items = useMemo(() => {
    return (state?.items ?? []).filter((item) => {
      if (dateFilter !== "all" && item.date !== dateFilter) return false;
      if (channelFilter !== "all" && item.channelId !== channelFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });
  }, [channelFilter, dateFilter, state?.items, statusFilter]);

  async function load() {
    setBusy("load");
    try {
      const response = await fetch("/api/content-calendar", { cache: "no-store" });
      const payload = (await response.json()) as CalendarState;
      setState(payload);
    } finally {
      setBusy(null);
    }
  }

  async function loadPreview(id: string) {
    setBusy(`preview:${id}`);
    try {
      const response = await fetch(`/api/content-calendar/preview?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const payload = (await response.json()) as PreviewState;
      setPreview(payload);
      setMessage(payload.message);
    } finally {
      setBusy(null);
    }
  }

  async function runAction(item: CalendarItem, action: "regenerate_text" | "regenerate_image" | "regenerate_full" | "mark_ready" | "skip" | "publish_now") {
    if (action === "skip" && !window.confirm("Skip this one calendar row?")) return;
    if (action === "publish_now" && !window.confirm("Publish exactly this one calendar row to Telegram now?")) return;

    setBusy(`${action}:${item.id}`);
    try {
      const response = await fetch("/api/content-calendar/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, action, confirmed: action === "publish_now" }),
      });
      const payload = await response.json();
      setMessage(typeof payload.message === "string" ? payload.message : "Action completed.");
      await load();
      if (preview?.preview?.id === item.id) await loadPreview(item.id);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Content Calendar v1</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Контент-календарь</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              7 дней x 15 каналов, фиксированные слоты Europe/Kyiv. Действия ниже меняют только выбранную строку календаря.
            </p>
          </div>
          <button type="button" onClick={() => load()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/35 px-4 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10">
            <RefreshCw className={cn("h-4 w-4", busy === "load" && "animate-spin")} />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="Rows" value={`${state?.items.length ?? 0}/${state?.expectedRows ?? 105}`} tone={state?.ok ? "ok" : "warn"} />
          <Metric label="Ready" value={state?.summary.ready ?? 0} tone="ok" />
          <Metric label="Published" value={state?.summary.published ?? 0} tone="dry" />
          <Metric label="Needs review" value={state?.summary.needsReview ?? 0} tone={(state?.summary.needsReview ?? 0) ? "warn" : "ok"} />
          <Metric label="Skipped" value={state?.summary.skipped ?? 0} tone="dry" />
          <Metric label="Timezone" value={state?.timezone ?? "Europe/Kyiv"} tone="dry" />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-slate-950/55 p-3">
        <div className="flex flex-wrap gap-2">
          <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-9 rounded-md border border-line bg-slate-950 px-2 text-xs text-slate-200">
            <option value="all">All days</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
          <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} className="h-9 rounded-md border border-line bg-slate-950 px-2 text-xs text-slate-200">
            <option value="all">All channels</option>
            {channels.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-md border border-line bg-slate-950 px-2 text-xs text-slate-200">
            <option value="all">All statuses</option>
            <option value="planned">planned</option>
            <option value="ready">ready</option>
            <option value="published">published</option>
            <option value="skipped">skipped</option>
            <option value="error">error</option>
            <option value="needs_review">needs_review</option>
          </select>
        </div>
      </section>

      <section className="max-h-[620px] overflow-auto rounded-lg border border-line bg-slate-950/40">
        <table className="w-full min-w-[1420px] text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="border-b border-line px-3 py-2">Date</th>
              <th className="border-b border-line px-3 py-2">Time</th>
              <th className="border-b border-line px-3 py-2">Channel</th>
              <th className="border-b border-line px-3 py-2">Topic</th>
              <th className="border-b border-line px-3 py-2">Title</th>
              <th className="border-b border-line px-3 py-2">Status</th>
              <th className="border-b border-line px-3 py-2">Quality</th>
              <th className="border-b border-line px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="text-slate-300">
                <td className="border-b border-line/60 px-3 py-2">{item.date}</td>
                <td className="border-b border-line/60 px-3 py-2 font-mono text-cyan-100">{item.time}</td>
                <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{item.channelName}</td>
                <td className="border-b border-line/60 px-3 py-2">{item.rubric}</td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div className="max-w-[360px] truncate font-medium text-slate-100">{item.title}</div>
                  <div className="mt-1 max-w-[360px] truncate text-slate-500">{item.shortDescription}</div>
                </td>
                <td className={cn("border-b border-line/60 px-3 py-2", statusTone(item.status))}>{item.status}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.qualityStatus === "ready" ? "text-emerald-100" : "text-amber-100")}>
                  {item.qualityStatus}
                  {item.qualityIssues.length ? <div className="mt-1 max-w-[260px] truncate text-slate-500">{item.qualityIssues.join("; ")}</div> : null}
                </td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <ActionButton busy={busy === `preview:${item.id}`} onClick={() => loadPreview(item.id)} title="Preview" icon={<Eye className="h-3.5 w-3.5" />} />
                    <ActionButton busy={busy === `regenerate_text:${item.id}`} onClick={() => runAction(item, "regenerate_text")} title="Text" icon={<Wand2 className="h-3.5 w-3.5" />} />
                    <ActionButton busy={busy === `regenerate_image:${item.id}`} onClick={() => runAction(item, "regenerate_image")} title="Image" icon={<ImageIcon className="h-3.5 w-3.5" />} />
                    <ActionButton busy={busy === `regenerate_full:${item.id}`} onClick={() => runAction(item, "regenerate_full")} title="Full" icon={<RefreshCw className="h-3.5 w-3.5" />} />
                    <ActionButton busy={busy === `mark_ready:${item.id}`} onClick={() => runAction(item, "mark_ready")} title="Ready" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
                    <ActionButton busy={busy === `skip:${item.id}`} onClick={() => runAction(item, "skip")} title="Skip" icon={<SkipForward className="h-3.5 w-3.5" />} />
                    <ActionButton busy={busy === `publish_now:${item.id}`} onClick={() => runAction(item, "publish_now")} title="Publish one" icon={<SendHorizontal className="h-3.5 w-3.5" />} danger />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {preview?.preview ? (
        <section className="rounded-lg border border-emerald-300/20 bg-emerald-300/5 p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Preview</p>
              <h4 className="mt-2 text-lg font-semibold text-white">{preview.preview.title}</h4>
              <p className="mt-1 text-sm text-slate-400">
                {preview.preview.channelName} / {preview.preview.date} {preview.preview.time} {preview.preview.timezone}
              </p>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-slate-950/70 p-3 text-sm leading-6 text-slate-200">{preview.preview.text}</pre>
            </div>
            <div className="w-full lg:w-[360px]">
              <div className="rounded-md border border-line bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500">{preview.preview.visualBrief}</p>
                <p className={cn("mt-3 text-sm font-semibold", preview.preview.canPublish ? "text-emerald-100" : "text-amber-100")}>
                  {preview.preview.canPublish ? "canPublish=true" : "canPublish=false"}
                </p>
                <p className="mt-2 break-all font-mono text-[11px] text-slate-500">{preview.preview.imagePath}</p>
                {preview.preview.qualityIssues.length ? <p className="mt-3 text-xs text-amber-100">{preview.preview.qualityIssues.join("; ")}</p> : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {message ? <p className="rounded-md border border-line bg-slate-950/70 p-3 text-sm text-slate-300">{message}</p> : null}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: "ok" | "warn" | "dry" }) {
  return (
    <div className={cn("rounded-md border p-3", tone === "ok" && "border-emerald-300/25 bg-emerald-300/5", tone === "warn" && "border-amber-300/25 bg-amber-300/5", tone === "dry" && "border-line bg-slate-950/45")}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function ActionButton({ title, icon, busy, danger, onClick }: { title: string; icon: ReactNode; busy: boolean; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-md border px-2 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        danger ? "border-rose-300/30 text-rose-100 hover:bg-rose-300/10" : "border-line text-slate-200 hover:bg-slate-800/70",
      )}
    >
      {icon}
      {title}
    </button>
  );
}

function statusTone(status: CalendarStatus) {
  if (status === "ready" || status === "published") return "text-emerald-100";
  if (status === "error" || status === "needs_review") return "text-rose-100";
  if (status === "skipped") return "text-amber-100";
  return "text-slate-300";
}
