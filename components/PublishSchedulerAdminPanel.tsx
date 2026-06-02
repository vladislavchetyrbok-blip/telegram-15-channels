"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Loader2,
  PauseCircle,
  RefreshCw,
  ShieldCheck,
  SkipForward,
} from "lucide-react";
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
    () => logs.filter((entry) => entry.status === "success").slice(0, 8),
    [logs],
  );
  const recentErrors = useMemo(
    () => logs.filter((entry) => entry.status === "failed" || entry.status === "error").slice(0, 8),
    [logs],
  );

  async function runDryRun() {
    if (busy) return;
    setBusy("dry-run");
    setError(null);
    setMessage("Проверяем готовые публикации в safe dry-run. Telegram не будет затронут.");
    try {
      const response = await fetch("/api/admin/publish-scheduler/dry-run", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || !payload.ok || payload.dryRun !== true) {
        throw new Error(payload.message ?? "Dry-run завершился с ошибкой.");
      }
      setMessage(`Dry-run завершен: checked ${payload.checked ?? 0}, published ${payload.published ?? 0}, skipped ${payload.skipped ?? 0}, errors ${payload.errors ?? 0}.`);
      await load(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Dry-run failed.");
    } finally {
      setBusy(null);
    }
  }

  const lastRunLabel = status?.lastRun.lastRunAt ? new Date(status.lastRun.lastRunAt).toLocaleString() : "нет запусков";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-5">
      <section className="rounded-lg border border-line bg-panel/82 p-4 shadow-glow sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Publish Scheduler</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">Центр публикаций</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Mobile-first панель для контроля GitHub Actions scheduler, JSON runtime и логов публикаций. Ручная проверка здесь всегда работает только в dry-run.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
            <button type="button" onClick={() => void load()} disabled={Boolean(busy)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-line bg-slate-950/70 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60">
              {busy === "load" ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              Обновить
            </button>
            <button type="button" onClick={() => void runDryRun()} disabled={Boolean(busy)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
              {busy === "dry-run" ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
              Проверить готовые посты
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
          <p className="font-semibold">Реальная публикация управляется через GitHub Secrets.</p>
          <p className="mt-1">Для боевой отправки: TELEGRAM_REAL_PUBLISH_ENABLED=true и TELEGRAM_DRY_RUN=false. Для паузы: TELEGRAM_REAL_PUBLISH_ENABLED=false.</p>
          <p className="mt-1">Кнопки этой страницы не публикуют в Telegram.</p>
        </div>
      </section>

      {message ? <Notice tone="info" text={message} /> : null}
      {error ? <Notice tone="error" text={error} /> : null}

      <SectionTitle title="Состояние" />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Store mode" value={status?.storeMode ?? "unknown"} icon={Database} />
        <Metric label="Dry-run" value={status ? (status.dryRun ? "включен" : "выключен") : "unknown"} tone={status?.dryRun ? "warn" : "ok"} />
        <Metric label="Real publish" value={status?.realPublishEnabled ? "enabled" : "disabled"} tone={status?.realPublishEnabled ? "ok" : "warn"} />
        <Metric label="Autopublish" value={status?.autopublishEnabled ? "enabled" : "disabled"} tone={status?.autopublishEnabled ? "ok" : "warn"} />
        <Metric label="Timezone" value={status?.timezone ?? "Europe/Kyiv"} icon={Clock3} />
        <Metric label="Limit/channel" value={String(status?.dailyLimitPerChannel ?? 1)} />
        <Metric label="Max/day" value={String(status?.maxPostsPerDay ?? 15)} />
        <Metric label="Источник" value={status?.lastRun.source ?? "unknown"} />
      </section>

      <SectionTitle title="Последний запуск" />
      <section className="grid gap-3 lg:grid-cols-[1.2fr_2fr]">
        <div className="rounded-lg border border-line bg-panel/82 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Время</p>
          <p className="mt-1 text-lg font-semibold text-white">{lastRunLabel}</p>
          <p className="mt-3 break-all text-xs leading-5 text-slate-500">runId: {status?.lastRun.runId ?? "-"}</p>
        </div>
        <div className="rounded-lg border border-line bg-panel/82 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Сообщение</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{status?.lastRun.message ?? status?.message ?? "Пока нет данных."}</p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric label="Опубликовано" value={String(status?.published ?? 0)} tone={(status?.published ?? 0) ? "ok" : "dry"} icon={CheckCircle2} />
        <Metric label="Пропущено" value={String(status?.skipped ?? 0)} tone={(status?.skipped ?? 0) ? "warn" : "dry"} icon={SkipForward} />
        <Metric label="Ошибки" value={String(status?.errors ?? 0)} tone={(status?.errors ?? 0) ? "error" : "ok"} icon={AlertTriangle} />
      </section>

      <SectionTitle title="Последние публикации" />
      <LogList rows={recentPublished} empty="Пока нет success-логов." />

      <SectionTitle title="Последние ошибки" />
      <LogList rows={recentErrors} empty="Ошибок в последних логах нет." />

      <SectionTitle title="Последние события" />
      <LogList rows={logs.slice(0, 20)} empty="Логов публикаций пока нет." showStatus />

      <SectionTitle title="Как поставить на паузу" />
      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <div className="flex gap-3">
          <PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
          <div className="space-y-2 text-sm leading-6 text-slate-300">
            <p>Сейчас безопасная пауза делается через GitHub Secrets: установи TELEGRAM_REAL_PUBLISH_ENABLED=false.</p>
            <p>Чтобы снова разрешить боевую отправку: TELEGRAM_REAL_PUBLISH_ENABLED=true и TELEGRAM_DRY_RUN=false.</p>
            <p>Ручные кнопки в этой админке оставлены безопасными: они проверяют очередь, но не отправляют посты.</p>
          </div>
        </div>
      </section>

      <SectionTitle title="Архитектура" />
      <section className="grid gap-3 md:grid-cols-2">
        <ArchitectureCard
          title="Сейчас"
          steps={["local/admin panel", "JSON files", "git push", "GitHub Actions", "Telegram"]}
        />
        <ArchitectureCard
          title="Позже"
          steps={["phone", "hosted admin", "Supabase/PostgreSQL", "GitHub Actions/server worker", "Telegram"]}
        />
      </section>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="pt-1 text-lg font-semibold text-white">{title}</h2>;
}

function Notice({ text, tone }: { text: string; tone: "info" | "error" }) {
  return (
    <p className={cn("rounded-md border p-3 text-sm leading-6", tone === "info" ? "border-cyan-300/20 bg-cyan-300/5 text-cyan-50" : "border-rose-300/25 bg-rose-300/10 text-rose-100")}>
      {text}
    </p>
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
  icon?: LucideIcon;
}) {
  return (
    <div className={cn("rounded-lg border px-4 py-3", tone === "ok" && "border-emerald-300/25 bg-emerald-300/10", tone === "warn" && "border-amber-300/25 bg-amber-300/10", tone === "error" && "border-rose-300/25 bg-rose-300/10", tone === "dry" && "border-line bg-panel/82")}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      </div>
      <p className="mt-2 break-words text-lg font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function LogList({
  rows,
  empty,
  showStatus = false,
}: {
  rows: PublicationLogEntry[];
  empty: string;
  showStatus?: boolean;
}) {
  if (!rows.length) {
    return <p className="rounded-lg border border-line bg-panel/82 p-4 text-sm text-slate-500">{empty}</p>;
  }

  return (
    <div id="publication-events" className="grid gap-3 md:grid-cols-2">
      {rows.map((entry) => (
        <article key={entry.id} className="rounded-lg border border-line bg-panel/82 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
              <p className="mt-1 break-words text-sm font-semibold text-white">{entry.channelId ?? "system"}</p>
            </div>
            {showStatus ? <StatusPill status={entry.status} /> : null}
          </div>
          <dl className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
            <Meta label="Post" value={entry.postId ?? "-"} />
            <Meta label="Source" value={`${entry.source ?? "-"}${entry.dryRun ? " / dry" : ""}`} />
            <Meta label="Message" value={entry.message ?? "-"} />
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-slate-500">Telegram</dt>
              <dd className="min-w-0 break-words text-slate-300">
                {entry.telegramMessageLink ? (
                  <a className="inline-flex items-center gap-1 text-cyan-200 underline-offset-2 hover:underline" href={entry.telegramMessageLink} target="_blank" rel="noreferrer">
                    {entry.telegramMessageId}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : entry.telegramMessageId ?? "-"}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-slate-300">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === "success" ? "ok" : status === "failed" || status === "error" ? "error" : "warn";
  return (
    <span className={cn("shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]", tone === "ok" && "border-emerald-300/25 bg-emerald-300/10 text-emerald-100", tone === "warn" && "border-amber-300/25 bg-amber-300/10 text-amber-100", tone === "error" && "border-rose-300/25 bg-rose-300/10 text-rose-100")}>
      {status}
    </span>
  );
}

function ArchitectureCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-lg border border-line bg-panel/82 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <span key={step} className="inline-flex items-center gap-2 rounded-md border border-line bg-slate-950/50 px-2.5 py-2 text-xs text-slate-300">
            {index + 1}. {step}
          </span>
        ))}
      </div>
    </div>
  );
}
