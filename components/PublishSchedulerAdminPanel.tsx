"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Database, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicationLogEntry {
  id: string;
  runId: string | null;
  source: string | null;
  channelId: string | null;
  postId: string | null;
  status: "success" | "skipped" | "failed" | string;
  message: string | null;
  telegramMessageId?: number | null;
  telegramMessageLink?: string | null;
  dryRun: boolean | null;
  createdAt: string;
}

interface SchedulerStatusPayload {
  ok: boolean;
  storeMode: string;
  dryRun: boolean;
  realPublishEnabled: boolean;
  autopublishEnabled: boolean;
  timezone: string;
  dailyLimitPerChannel: number;
  maxPostsPerDay: number;
  lastRun: {
    runId: string | null;
    source: string | null;
    startedAt: string | null;
    finishedAt: string | null;
    lastRunAt: string | null;
    message: string | null;
  };
  checked: number;
  published: number;
  skipped: number;
  errors: number;
  message: string | null;
  lastPublished: PublicationLogEntry[];
  lastErrors: PublicationLogEntry[];
  recentLogs: PublicationLogEntry[];
}

interface LogsPayload {
  ok: boolean;
  total: number;
  logs: PublicationLogEntry[];
}

export function PublishSchedulerAdminPanel() {
  const [status, setStatus] = useState<SchedulerStatusPayload | null>(null);
  const [logs, setLogs] = useState<PublicationLogEntry[]>([]);
  const [busy, setBusy] = useState<"load" | "dry-run" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: "load" | null = "load") => {
    if (mode) setBusy(mode);
    setError(null);
    try {
      const [statusResponse, logsResponse] = await Promise.all([
        fetch("/api/admin/publish-scheduler/status", { cache: "no-store" }),
        fetch("/api/admin/publication-logs?limit=100", { cache: "no-store" }),
      ]);

      const nextStatus = (await statusResponse.json()) as SchedulerStatusPayload;
      const nextLogs = (await logsResponse.json()) as LogsPayload;
      setStatus(nextStatus);
      setLogs(nextLogs.logs ?? []);
      setMessage(nextStatus.message ?? "Статус обновлен.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось загрузить статус scheduler.");
    } finally {
      if (mode) setBusy(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const recentPublished = useMemo(
    () => logs.filter((entry) => entry.status === "success").slice(0, 10),
    [logs],
  );
  const recentErrors = useMemo(
    () => logs.filter((entry) => entry.status === "failed" || entry.status === "error").slice(0, 10),
    [logs],
  );

  async function runDryRun() {
    if (busy) return;
    setBusy("dry-run");
    setError(null);
    setMessage("Проверяем due-публикации в safe dry-run. Telegram не будет затронут.");
    try {
      const response = await fetch("/api/admin/publish-scheduler/dry-run", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Dry-run завершился с ошибкой.");
      }
      setMessage(payload.result?.message ?? "Dry-run завершен.");
      await load(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Dry-run failed.");
    } finally {
      setBusy(null);
    }
  }

  const lastRunLabel = status?.lastRun.lastRunAt ? new Date(status.lastRun.lastRunAt).toLocaleString() : "нет запусков";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Publish Scheduler</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Центр управления публикациями</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Панель читает JSON runtime, показывает состояние GitHub Actions scheduler и дает безопасную ручную проверку без реальной отправки в Telegram.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void load()} disabled={Boolean(busy)} className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-slate-950/70 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60">
              {busy === "load" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Обновить
            </button>
            <button type="button" onClick={() => void runDryRun()} disabled={Boolean(busy)} className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
              {busy === "dry-run" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Проверить готовые публикации
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
          <p className="font-semibold">Реальная публикация управляется через GitHub Secrets.</p>
          <p className="mt-1">Для боевой отправки: TELEGRAM_REAL_PUBLISH_ENABLED=true и TELEGRAM_DRY_RUN=false. Для паузы: TELEGRAM_REAL_PUBLISH_ENABLED=false.</p>
          <p className="mt-1">Кнопка проверки на этой странице всегда запускает dry-run и не отправляет сообщения в Telegram.</p>
        </div>

        {message ? <p className="mt-4 rounded-md border border-cyan-300/20 bg-cyan-300/5 p-3 text-sm text-cyan-50">{message}</p> : null}
        {error ? <p className="mt-4 rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p> : null}
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Store mode" value={status?.storeMode ?? "unknown"} icon={Database} />
        <Metric label="Dry run" value={status ? (status.dryRun ? "yes" : "no") : "unknown"} tone={status?.dryRun ? "warn" : "ok"} />
        <Metric label="Real publish" value={status?.realPublishEnabled ? "enabled" : "disabled"} tone={status?.realPublishEnabled ? "ok" : "warn"} />
        <Metric label="Autopublish" value={status?.autopublishEnabled ? "enabled" : "disabled"} tone={status?.autopublishEnabled ? "ok" : "warn"} />
        <Metric label="Timezone" value={status?.timezone ?? "Europe/Kyiv"} icon={Clock3} />
        <Metric label="Daily/channel" value={String(status?.dailyLimitPerChannel ?? 1)} />
        <Metric label="Max/day" value={String(status?.maxPostsPerDay ?? 15)} />
        <Metric label="Last run" value={lastRunLabel} />
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="Due checked" value={String(status?.checked ?? 0)} />
        <Metric label="Published" value={String(status?.published ?? 0)} tone={(status?.published ?? 0) ? "ok" : "dry"} icon={CheckCircle2} />
        <Metric label="Skipped" value={String(status?.skipped ?? 0)} tone={(status?.skipped ?? 0) ? "warn" : "dry"} />
        <Metric label="Errors" value={String(status?.errors ?? 0)} tone={(status?.errors ?? 0) ? "error" : "ok"} icon={AlertTriangle} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <LogTable title="Последние опубликованные посты" rows={recentPublished} empty="Пока нет success-логов." />
        <LogTable title="Последние ошибки" rows={recentErrors} empty="Ошибок в последних логах нет." />
      </section>

      <LogTable title="Последние события публикаций" rows={logs.slice(0, 20)} empty="Логов публикаций пока нет." showStatus />
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "dry",
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "error" | "dry";
  icon?: typeof Database;
}) {
  return (
    <div className={cn("rounded-md border px-3 py-2", tone === "ok" && "border-emerald-300/25 bg-emerald-300/10", tone === "warn" && "border-amber-300/25 bg-amber-300/10", tone === "error" && "border-rose-300/25 bg-rose-300/10", tone === "dry" && "border-line bg-slate-950/45")}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      </div>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function LogTable({
  title,
  rows,
  empty,
  showStatus = false,
}: {
  title: string;
  rows: PublicationLogEntry[];
  empty: string;
  showStatus?: boolean;
}) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4 shadow-glow">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-3 overflow-auto">
        {rows.length ? (
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="border-b border-line px-2 py-2">Время</th>
                <th className="border-b border-line px-2 py-2">Канал</th>
                <th className="border-b border-line px-2 py-2">Post ID</th>
                {showStatus ? <th className="border-b border-line px-2 py-2">Status</th> : null}
                <th className="border-b border-line px-2 py-2">Telegram</th>
                <th className="border-b border-line px-2 py-2">Source</th>
                <th className="border-b border-line px-2 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} className="text-slate-300">
                  <td className="border-b border-line/60 px-2 py-2">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="border-b border-line/60 px-2 py-2">{entry.channelId ?? "-"}</td>
                  <td className="border-b border-line/60 px-2 py-2">{entry.postId ?? "-"}</td>
                  {showStatus ? <td className={cn("border-b border-line/60 px-2 py-2", entry.status === "success" ? "text-emerald-100" : entry.status === "failed" || entry.status === "error" ? "text-rose-100" : "text-amber-100")}>{entry.status}</td> : null}
                  <td className="border-b border-line/60 px-2 py-2">
                    {entry.telegramMessageLink ? (
                      <a className="text-cyan-200 underline-offset-2 hover:underline" href={entry.telegramMessageLink} target="_blank" rel="noreferrer">{entry.telegramMessageId}</a>
                    ) : entry.telegramMessageId ?? "-"}
                  </td>
                  <td className="border-b border-line/60 px-2 py-2">{entry.source ?? "-"}{entry.dryRun ? " / dry" : ""}</td>
                  <td className="border-b border-line/60 px-2 py-2">{entry.message ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">{empty}</p>
        )}
      </div>
    </section>
  );
}
