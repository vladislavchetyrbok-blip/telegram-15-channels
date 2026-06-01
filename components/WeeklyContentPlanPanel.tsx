"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CalendarDays, CheckCircle2, Filter, RefreshCw, Sparkles, Trash2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

type WeeklyAction = "generate_weekly_plan" | "check_weekly_plan" | "improve_weak_weekly" | "repair_captions" | "schedule_weekly_ready" | "clear_blocked_weekly";
type WeeklyRowAction =
  | "weekly_item_open"
  | "weekly_item_regenerate_text"
  | "weekly_item_regenerate_image"
  | "weekly_item_mark_ready"
  | "weekly_item_block"
  | "weekly_item_delete";

export interface WeeklyContentPlanSummary {
  days: number;
  channels: number;
  total: number;
  readyToPublish: number;
  scheduled: number;
  published: number;
  blocked: number;
  weakText: number;
  weakImage: number;
  telegramImageStatusOk: number;
  uniqueTopics: number;
  duplicateTopics: number;
  missingImages: number;
  generatedImages: number;
}

export interface WeeklyContentPlanItem {
  id: string;
  postId: string;
  channelId: string;
  channelName: string;
  contentPlanDate: string;
  contentTopic: string;
  scheduledAt: string;
  publishTime: string;
  title: string;
  language: "ru" | "uk";
  textQuality: "strong" | "medium" | "weak";
  textLength: number;
  body?: string;
  telegramCaption?: string;
  telegramCaptionLength: number;
  telegramCaptionStatus: string;
  imageUrl: string;
  telegramImagePath: string;
  telegramImageStatus: string;
  imageQuality: "strong" | "medium" | "weak";
  provider?: string;
  fallbackProvider?: string;
  fallbackUsed?: boolean;
  premiumVersion?: string;
  source?: string;
  status: string;
  qualityIssues: string[];
  duplicateTopic: boolean;
}

export function WeeklyContentPlanPanel({
  summary,
  items,
  onRefresh,
}: {
  summary?: WeeklyContentPlanSummary;
  items: WeeklyContentPlanItem[];
  onRefresh: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [dayFilter, setDayFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const days = useMemo(() => Array.from(new Set(items.map((item) => item.contentPlanDate))).sort(), [items]);
  const channels = useMemo(() => Array.from(new Map(items.map((item) => [item.channelId, item.channelName])).entries()), [items]);
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (dayFilter !== "all" && item.contentPlanDate !== dayFilter) return false;
      if (channelFilter !== "all" && item.channelId !== channelFilter) return false;
      if (statusFilter === "ready_to_publish" && item.status !== "ready_to_publish") return false;
      if (statusFilter === "blocked" && item.status !== "blocked") return false;
      if (statusFilter === "weak_text" && item.textQuality !== "weak") return false;
      if (statusFilter === "weak_image" && item.imageQuality !== "weak") return false;
      if (statusFilter === "missing_image" && item.telegramImageStatus === "OK") return false;
      if (statusFilter === "already_published" && item.status !== "published") return false;
      return true;
    });
  }, [channelFilter, dayFilter, items, statusFilter]);

  async function runWeeklyAction(action: WeeklyAction, confirmed = false) {
    if (action === "clear_blocked_weekly" && !confirmed && !window.confirm("Clear blocked plan rows?")) return;

    setBusy(action);
    try {
      const response = await fetch("/api/autopublish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, confirmed: confirmed || action === "clear_blocked_weekly" }),
      });
      const payload = await response.json();
      setResultMessage(typeof payload.message === "string" ? payload.message : "Operation completed.");
      await onRefresh();
    } finally {
      setBusy(null);
    }
  }

  async function runRowAction(item: WeeklyContentPlanItem, action: WeeklyRowAction) {
    if (action === "weekly_item_delete" && !window.confirm("Delete this plan row?")) return;
    if (action === "weekly_item_block" && !window.confirm("Block this plan row?")) return;

    setBusy(`${action}:${item.id}`);
    try {
      const response = await fetch("/api/autopublish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, itemId: item.id }),
      });
      const payload = await response.json();
      setResultMessage(typeof payload.message === "string" ? payload.message : "Operation completed.");
      await onRefresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-emerald-300/25 bg-emerald-300/5 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Weekly plan</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Weekly content plan</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            The plan contains 105 rows: 15 channels, 7 days, 1 post per channel per day. This is queue and schedule only, without Telegram sending.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <WeeklyButton busy={busy === "generate_weekly_plan"} onClick={() => runWeeklyAction("generate_weekly_plan")} icon={<Sparkles className="h-4 w-4" />}>
            Generate 7-day plan
          </WeeklyButton>
          <WeeklyButton busy={busy === "check_weekly_plan"} onClick={() => runWeeklyAction("check_weekly_plan")} icon={<CheckCircle2 className="h-4 w-4" />}>
            Check plan
          </WeeklyButton>
          <WeeklyButton busy={busy === "improve_weak_weekly"} onClick={() => runWeeklyAction("improve_weak_weekly")} icon={<Wand2 className="h-4 w-4" />}>
            Improve weak rows
          </WeeklyButton>
          <WeeklyButton busy={busy === "repair_captions"} onClick={() => runWeeklyAction("repair_captions")} icon={<Wand2 className="h-4 w-4" />}>
            Repair long captions
          </WeeklyButton>
          <WeeklyButton busy={busy === "repair_captions"} onClick={() => runWeeklyAction("repair_captions")} icon={<CheckCircle2 className="h-4 w-4" />}>
            Return repaired rows
          </WeeklyButton>
          <WeeklyButton busy={busy === "schedule_weekly_ready"} onClick={() => runWeeklyAction("schedule_weekly_ready")} icon={<CalendarDays className="h-4 w-4" />}>
            Schedule ready rows
          </WeeklyButton>
          <WeeklyButton busy={busy === "clear_blocked_weekly"} onClick={() => runWeeklyAction("clear_blocked_weekly")} tone="danger" icon={<Trash2 className="h-4 w-4" />}>
            Clear blocked rows
          </WeeklyButton>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <WeeklyMetric label="Total rows" value={summary?.total ?? 0} tone="dry" />
        <WeeklyMetric label="Ready" value={summary?.readyToPublish ?? 0} tone="ok" />
        <WeeklyMetric label="Scheduled" value={summary?.scheduled ?? 0} tone="dry" />
        <WeeklyMetric label="Blocked" value={summary?.blocked ?? 0} tone={(summary?.blocked ?? 0) ? "error" : "ok"} />
        <WeeklyMetric label="Weak text" value={summary?.weakText ?? 0} tone={(summary?.weakText ?? 0) ? "error" : "ok"} />
        <WeeklyMetric label="Weak image" value={summary?.weakImage ?? 0} tone={(summary?.weakImage ?? 0) ? "error" : "ok"} />
        <WeeklyMetric label="Telegram image OK" value={summary?.telegramImageStatusOk ?? 0} tone="ok" />
        <WeeklyMetric label="Unique topics" value={summary?.uniqueTopics ?? 0} tone={(summary?.duplicateTopics ?? 0) ? "warn" : "ok"} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-slate-950/60 p-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <select value={dayFilter} onChange={(event) => setDayFilter(event.target.value)} className="h-9 rounded-md border border-line bg-slate-950 px-2 text-xs text-slate-200">
          <option value="all">All days</option>
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
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
          <option value="ready_to_publish">ready_to_publish</option>
          <option value="blocked">blocked</option>
          <option value="weak_text">weak text</option>
          <option value="weak_image">weak image</option>
          <option value="missing_image">missing image</option>
          <option value="already_published">already published</option>
        </select>
        <button type="button" onClick={() => onRefresh()} className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-xs font-semibold text-slate-200">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="mt-4 max-h-[520px] overflow-auto">
        <table className="w-full min-w-[1720px] text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="border-b border-line px-3 py-2">Date</th>
              <th className="border-b border-line px-3 py-2">Time</th>
              <th className="border-b border-line px-3 py-2">Channel</th>
              <th className="border-b border-line px-3 py-2">Topic</th>
              <th className="border-b border-line px-3 py-2">Title</th>
              <th className="border-b border-line px-3 py-2">Text quality</th>
              <th className="border-b border-line px-3 py-2">Body length</th>
              <th className="border-b border-line px-3 py-2">Caption status</th>
              <th className="border-b border-line px-3 py-2">Mojibake</th>
              <th className="border-b border-line px-3 py-2">Real ready</th>
              <th className="border-b border-line px-3 py-2">Image quality</th>
              <th className="border-b border-line px-3 py-2">Telegram image</th>
              <th className="border-b border-line px-3 py-2">Provider</th>
              <th className="border-b border-line px-3 py-2">Version</th>
              <th className="border-b border-line px-3 py-2">Status</th>
              <th className="border-b border-line px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const mojibakeStatus = getMojibakeStatus(item);
              const realReadyStatus = getRealReadyStatus(item, mojibakeStatus);

              return (
              <tr key={item.id} className="text-slate-300">
                <td className="border-b border-line/60 px-3 py-2">{item.contentPlanDate}</td>
                <td className="border-b border-line/60 px-3 py-2 text-cyan-100">{new Date(item.scheduledAt).toLocaleTimeString()}</td>
                <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{item.channelName}</td>
                <td className="border-b border-line/60 px-3 py-2">{item.contentTopic}</td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div className="max-w-[280px] truncate">{item.title}</div>
                  <div className="mt-1 font-mono text-[11px] text-slate-500">{item.postId}</div>
                </td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.textQuality === "weak" ? "text-rose-100" : "text-emerald-100")}>
                  {item.textQuality} / {item.textLength}
                </td>
                <td className="border-b border-line/60 px-3 py-2">{item.body?.length ?? item.textLength}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.telegramCaptionStatus === "OK" ? "text-emerald-100" : "text-rose-100")}>
                  {item.telegramCaptionStatus} / {item.telegramCaptionLength}
                </td>
                <td className={cn("border-b border-line/60 px-3 py-2", mojibakeStatus === "TEXT OK" ? "text-emerald-100" : "text-rose-100")}>{mojibakeStatus}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", realReadyStatus === "READY" ? "text-emerald-100" : "text-rose-100")}>{realReadyStatus}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.imageQuality === "weak" ? "text-rose-100" : "text-emerald-100")}>{item.imageQuality}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.telegramImageStatus === "OK" ? "text-emerald-100" : "text-rose-100")}>{item.telegramImageStatus}</td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div>{item.provider ?? "local_template"}</div>
                  <div className="mt-1 text-slate-500">fallback: {item.fallbackUsed ? item.fallbackProvider ?? "yes" : "false"}</div>
                </td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div>{item.premiumVersion ?? "premium_v2"}</div>
                  <div className="mt-1 text-slate-500">{item.source ?? "template"}</div>
                </td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.status === "ready_to_publish" || item.status === "scheduled" ? "text-emerald-100" : "text-amber-100")}>
                  {item.status}
                  {item.qualityIssues.length ? <div className="mt-1 max-w-[260px] truncate text-slate-500">{item.qualityIssues.join("; ")}</div> : null}
                </td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <SmallAction onClick={() => runRowAction(item, "weekly_item_open")}>Open</SmallAction>
                    <SmallAction onClick={() => runRowAction(item, "weekly_item_regenerate_text")}>Regenerate text</SmallAction>
                    <SmallAction onClick={() => runRowAction(item, "weekly_item_regenerate_image")}>Regenerate image</SmallAction>
                    <SmallAction onClick={() => runRowAction(item, "weekly_item_mark_ready")}>Ready</SmallAction>
                    <SmallAction onClick={() => runRowAction(item, "weekly_item_block")}>Block</SmallAction>
                    <SmallAction onClick={() => runRowAction(item, "weekly_item_delete")}>Delete</SmallAction>
                  </div>
                </td>
              </tr>
              );
            })}
            {!filteredItems.length ? (
              <tr>
                <td colSpan={16} className="px-3 py-4 text-slate-400">
                  Plan is empty. Click Generate 7-day plan.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {resultMessage ? <p className="mt-4 rounded-md border border-line bg-slate-950/70 p-3 text-sm text-slate-300">{resultMessage}</p> : null}
    </div>
  );
}

function getMojibakeStatus(item: WeeklyContentPlanItem) {
  const issueText = item.qualityIssues.join("; ").toLowerCase();
  const combined = [item.title, item.body, item.telegramCaption, item.contentTopic].filter(Boolean).join("\n");
  const fragments = [
    "\u0420\u040f",
    "\u0420\u0455",
    "\u0420\u0451",
    "\u0420\u00b5",
    "\u0420\u00b0",
    "\u0420\u2018",
    "\u0420\u040c",
    "\u0420\u040e",
    "\u0420\u201d",
    "\u0420\u2122",
    "\u0420\u203a",
    "\u0420\u00a0",
    "\u00d0",
    "\u00d1",
    "\ufffd",
    "P\u00d0",
  ];

  if (issueText.includes("mojibake") || issueText.includes("invalid_text") || fragments.some((fragment) => combined.includes(fragment))) {
    return "BROKEN TEXT";
  }

  return "TEXT OK";
}

function getRealReadyStatus(item: WeeklyContentPlanItem, mojibakeStatus: string) {
  if (item.status !== "ready_to_publish" && item.status !== "scheduled") return "NOT READY";
  if (mojibakeStatus !== "TEXT OK") return "NOT READY";
  if (item.qualityIssues.length > 0) return "NOT READY";
  if (item.telegramCaptionStatus !== "OK" || item.telegramCaptionLength < 300 || item.telegramCaptionLength > 900) return "NOT READY";
  if (item.textQuality === "weak" || item.imageQuality === "weak") return "NOT READY";
  if (item.telegramImageStatus !== "OK") return "NOT READY";
  return "READY";
}

function WeeklyButton({
  children,
  icon,
  busy,
  tone = "secondary",
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  busy: boolean;
  tone?: "secondary" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        tone === "secondary" && "border border-emerald-300/40 text-emerald-100 hover:bg-emerald-300/10",
        tone === "danger" && "border border-rose-300/40 text-rose-100 hover:bg-rose-300/10",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function SmallAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded border border-line px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800">
      {children}
    </button>
  );
}

function WeeklyMetric({ label, value, tone = "dry" }: { label: string; value: string | number; tone?: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-2 truncate text-lg font-semibold",
          tone === "ok" && "text-emerald-100",
          tone === "warn" && "text-amber-100",
          tone === "error" && "text-rose-100",
          tone === "dry" && "text-cyan-100",
        )}
      >
        {value}
      </p>
    </div>
  );
}
