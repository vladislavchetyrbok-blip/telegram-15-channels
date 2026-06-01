"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Eye, RefreshCw, Users } from "lucide-react";
import { cn, formatDateTime, formatNumber } from "@/lib/utils";
import type { ChannelStats, ChannelStatsSource } from "@/lib/channel-stats";

const emptyStats = (channelId: string): ChannelStats => ({
  channelId,
  subscribers: null,
  averageViews: null,
  engagementRate: null,
  dataSource: "unknown",
  lastUpdated: null,
  status: "Telegram API не подключён / данные не обновлены",
});

export function ChannelStatsControl({ channelId, compact }: { channelId: string; compact?: boolean }) {
  const [stats, setStats] = useState<ChannelStats>(() => emptyStats(channelId));
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ subscribers: "", averageViews: "", engagementRate: "" });

  useEffect(() => {
    let mounted = true;

    fetch("/api/channel-stats", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { stats?: ChannelStats[] }) => {
        if (!mounted) return;
        const next = payload.stats?.find((item) => item.channelId === channelId) ?? emptyStats(channelId);
        setStats(next);
        setForm({
          subscribers: next.subscribers?.toString() ?? "",
          averageViews: next.averageViews?.toString() ?? "",
          engagementRate: next.engagementRate?.toString() ?? "",
        });
      })
      .catch(() => {
        if (mounted) setMessage("Статистика пока не синхронизирована.");
      });

    return () => {
      mounted = false;
    };
  }, [channelId]);

  const sourceLabel = useMemo(() => getSourceLabel(stats.dataSource), [stats.dataSource]);

  async function refreshFromTelegram() {
    try {
      setBusy(true);
      const response = await fetch("/api/channel-stats", { method: "POST" });
      const payload = (await response.json()) as { message?: string };
      setMessage(payload.message ?? "Telegram API не подключён. Можно ввести данные вручную или оставить не синхронизировано.");
    } finally {
      setBusy(false);
    }
  }

  async function saveManualStats() {
    try {
      setBusy(true);
      const response = await fetch(`/api/channels/${channelId}/manual-stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscribers: form.subscribers,
          averageViews: form.averageViews,
          engagementRate: form.engagementRate,
        }),
      });
      const payload = (await response.json()) as { stats?: ChannelStats };

      if (payload.stats) {
        setStats(payload.stats);
        setEditing(false);
        setMessage("Статистика сохранена как ручной ввод.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-line bg-black/15 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Статистика</p>
        <SourceBadge source={stats.dataSource} label={sourceLabel} />
      </div>

      <div className={cn("mt-3 grid gap-2", compact ? "grid-cols-1" : "md:grid-cols-3")}>
        <StatLine icon={Users} label="Подписчики" value={formatStat(stats.subscribers, "не синхронизировано")} />
        <StatLine icon={Eye} label="Средние просмотры" value={formatStat(stats.averageViews, "не синхронизировано")} />
        <StatLine icon={Activity} label="ER" value={stats.engagementRate === null ? "не рассчитан" : `${stats.engagementRate}%`} />
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-500">
        <p>Источник данных: <span className="text-slate-300">{stats.dataSource}</span></p>
        <p>Последнее обновление: <span className="text-slate-300">{stats.lastUpdated ? formatDateTime(stats.lastUpdated) : "не синхронизировано"}</span></p>
        <p>Статус: <span className="text-slate-300">{stats.status}</span></p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={refreshFromTelegram}
          disabled={busy}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-cyan-300/30 bg-slate-950 px-3 text-xs font-semibold text-cyan-100 hover:border-cyan-200 disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} />
          Обновить статистику из Telegram
        </button>
        <button
          type="button"
          onClick={() => setEditing((current) => !current)}
          className="inline-flex h-8 items-center rounded-md border border-line bg-slate-950 px-3 text-xs font-semibold text-slate-200 hover:border-cyan-300/40"
        >
          Ввести вручную
        </button>
      </div>

      {editing ? (
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <ManualInput label="Подписчики" value={form.subscribers} onChange={(value) => setForm((current) => ({ ...current, subscribers: value }))} />
          <ManualInput label="Средние просмотры" value={form.averageViews} onChange={(value) => setForm((current) => ({ ...current, averageViews: value }))} />
          <ManualInput label="ER" value={form.engagementRate} onChange={(value) => setForm((current) => ({ ...current, engagementRate: value }))} />
          <button
            type="button"
            onClick={saveManualStats}
            disabled={busy}
            className="h-9 self-end rounded-md bg-cyan-300 px-3 text-xs font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-60"
          >
            Сохранить
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-2 text-xs text-amber-100">{message}</p> : null}
    </div>
  );
}

function StatLine({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 p-2">
      <Icon className="mb-1 h-4 w-4 text-cyan-300" />
      <p className="font-semibold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ManualInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-xs text-slate-400">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        className="h-9 rounded-md border border-line bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300/50"
      />
    </label>
  );
}

function SourceBadge({ source, label }: { source: ChannelStatsSource; label: string }) {
  return (
    <span
      className={cn(
        "rounded border px-2 py-1 text-[11px] font-semibold",
        source === "real" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
        source === "manual" && "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        source === "demo" && "border-amber-300/30 bg-amber-300/10 text-amber-100",
        source === "unknown" && "border-slate-500/20 bg-slate-500/10 text-slate-300",
      )}
    >
      {label}
    </span>
  );
}

function getSourceLabel(source: ChannelStatsSource) {
  const labels = {
    real: "Telegram API",
    manual: "Введено вручную",
    demo: "Демо-данные",
    unknown: "unknown",
  };

  return labels[source];
}

function formatStat(value: number | null, fallback: string) {
  return value === null ? fallback : formatNumber(value);
}
