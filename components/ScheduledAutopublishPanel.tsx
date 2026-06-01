"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, FileText, Loader2, PauseCircle, Play, RefreshCw, Send, ShieldAlert, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

const text = {
  title: "\u0410\u0432\u0442\u043e\u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044f",
  intro:
    "Тест отправляет 1 пост в 1 канал. Ручная массовая публикация отделена от расписания. Постоянная автопубликация идёт ежедневно по Europe/Kyiv, с распределением по времени.",
  localWarning:
    "Сейчас автопубликация работает только пока включён компьютер и запущен сервер/worker. Для работы 24/7 нужен VPS или другой постоянно включённый сервер.",
  preparing: "\u0413\u043e\u0442\u043e\u0432\u0438\u043c \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044e...",
  generatingText: "\u0413\u0435\u043d\u0435\u0440\u0438\u0440\u0443\u0435\u043c \u0442\u0435\u043a\u0441\u0442...",
  image: "\u0413\u0435\u043d\u0435\u0440\u0438\u0440\u0443\u0435\u043c/\u043f\u043e\u0434\u0431\u0438\u0440\u0430\u0435\u043c \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0443...",
  telegram: "\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u043c \u0432 Telegram...",
  success: "\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043e \u0443\u0441\u043f\u0435\u0448\u043d\u043e",
  errorPrefix: "\u041e\u0448\u0438\u0431\u043a\u0430",
  testNow: "\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c \u0442\u0435\u0441\u0442 \u0441\u0435\u0439\u0447\u0430\u0441",
  publishAllNow: "\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c \u0441\u0435\u0439\u0447\u0430\u0441 \u0432\u043e \u0432\u0441\u0435 15",
  runSchedule: "\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u044c \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0438\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438",
  checkStatus: "\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0441\u0442\u0430\u0442\u0443\u0441",
  enabled: "\u0432\u043a\u043b\u044e\u0447\u0435\u043d\u0430",
  disabled: "\u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u0430",
  confirmMany: "\u0411\u0443\u0434\u0435\u0442 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043e \u0432 X \u043a\u0430\u043d\u0430\u043b\u043e\u0432. \u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c?",
  confirmAll: "\u0411\u0443\u0434\u0435\u0442 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043e 15 \u043f\u043e\u0441\u0442\u043e\u0432 \u0432 15 \u043a\u0430\u043d\u0430\u043b\u043e\u0432. \u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c?",
  toggleOn:
    "\u0410\u0432\u0442\u043e\u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044f \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u0430. \u041f\u043b\u0430\u043d\u0438\u0440\u043e\u0432\u0449\u0438\u043a \u0436\u0434\u0451\u0442 \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435.",
  toggleOff: "\u0410\u0432\u0442\u043e\u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044f \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u0430.",
  currentChannel: "\u0422\u0435\u043a\u0443\u0449\u0438\u0439 \u043a\u0430\u043d\u0430\u043b",
  duration: "\u0412\u0440\u0435\u043c\u044f \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f",
  published: "\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043e",
  errors: "\u041e\u0448\u0438\u0431\u043a\u0438",
  skipped: "\u041f\u0440\u043e\u043f\u0443\u0449\u0435\u043d\u043e \u0431\u0435\u0437 \u0434\u0443\u0431\u043b\u0435\u0439",
};

interface Timing {
  textMs: number;
  imageMs: number;
  telegramMs: number;
  totalMs: number;
}

interface AutopublishStatusPayload {
  ok: boolean;
  enabled: boolean;
  serverStatus?: "working" | "not_working";
  workerRunning?: boolean;
  days: string[];
  time: string;
  timezone: string;
  dueToday: boolean;
  scheduledDay: boolean;
  beforeScheduledTime: boolean;
  lastRun: string | null;
  totalChannels: number;
  activeChannels?: number;
  publishedToday: number;
  waitingToday: number;
  errorsLast24h?: Array<{ channelId: string | null; channelName: string | null; error: string | null; attemptedAt: string }>;
  lastPublication?: {
    attemptedAt: string;
    channelId: string;
    channelName: string;
    title: string | null;
    telegramMessageId: number | null;
    telegramMessageLink: string | null;
  } | null;
  nextPublication?: {
    plannedAt: string;
    channelId: string;
    channelName: string;
    title: string | null;
  } | null;
  channels: Array<{ channelId: string; channelName: string }>;
  errorsToday: Array<{ channelId: string | null; channelName: string | null; error: string | null }>;
  journal: Array<{
    attemptedAt: string;
    channelId: string | null;
    channelName: string | null;
    postId: string | null;
    title: string | null;
    status: "success" | "error" | "skipped" | "already_published";
    error: string | null;
    telegramMessageId: number | null;
    telegramMessageLink?: string | null;
    timings: Timing | null;
    durationMs?: number;
    generationTextMs?: number;
    generationImageMs?: number;
    telegramSendMs?: number;
  }>;
  journalLast20?: AutopublishStatusPayload["journal"];
  adminReports?: {
    enabled: boolean;
    chatIdConfigured: boolean;
    lastDailyReportAt: string | null;
    lastTestReportAt: string | null;
    lastStatusReportAt: string | null;
    lastErrorAlertAt: string | null;
    lastReportResult: "success" | "skipped" | "error" | null;
    lastReportReason: string | null;
  };
  protectionMode?: {
    enabled: boolean;
    reason: string | null;
    activatedAt: string | null;
    clearedAt: string | null;
  };
  paused?: boolean;
  pausedReason?: string | null;
  errorCounters?: {
    consecutive: number;
    total24h: number;
    lastErrorAt: string | null;
  };
  dailyStats?: {
    date: string;
    success: number;
    skipped: number;
    errors: number;
  };
  lastDailyReportAt?: string | null;
  lastWorkerHeartbeatAt?: string | null;
  message: string;
}

interface AutopublishRunPayload {
  ok: boolean;
  totalChannels: number;
  published: number;
  skipped: number;
  errors: number;
  details: Array<{
    channelId: string;
    channelName: string;
    postId: string | null;
    title: string | null;
    status: "published" | "skipped" | "error" | "already_published";
    reason: string | null;
    telegramMessageId: number | null;
    timings?: Timing | null;
  }>;
  message: string;
  durationMs: number | null;
}

interface PreviewPayload {
  ok: boolean;
  channel: { channelId: string; channelName: string };
  preview: {
    id: string;
    postId: string;
    channelId: string;
    channelName: string;
    contentTopic: string;
    title: string;
    body: string;
    telegramCaption: string;
    imageUrl: string;
    telegramImagePath: string;
    status: string;
    textQuality: string;
    imageQuality: string;
    telegramImageStatus: string;
    qualityIssues: string[];
    readyToPublish: boolean;
  } | null;
  message: string;
}

interface PublishSchedulerStatusPayload {
  ok: boolean;
  lastRunAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  checked: number;
  published: number;
  skipped: number;
  errors: number;
  dryRun: boolean | null;
  storeMode: string | null;
  message: string | null;
  lastErrors: Array<{
    id: string;
    channelId: string | null;
    postId: string | null;
    status: string;
    message: string | null;
    createdAt: string;
  }>;
}

type BusyMode = "status" | "test" | "schedule" | "mass" | "toggle" | "admin";

interface MassProgress {
  current: number;
  total: number;
  currentChannelName: string;
}

export function ScheduledAutopublishPanel() {
  const [status, setStatus] = useState<AutopublishStatusPayload | null>(null);
  const [lastRun, setLastRun] = useState<AutopublishRunPayload | null>(null);
  const [busy, setBusy] = useState<BusyMode | null>(null);
  const [phase, setPhase] = useState<string>("Ready");
  const [error, setError] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState("ai-tech");
  const [massProgress, setMassProgress] = useState<MassProgress | null>(null);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [publishScheduler, setPublishScheduler] = useState<PublishSchedulerStatusPayload | null>(null);

  const loadStatus = useCallback(async (busyMode: BusyMode | null = "status") => {
    if (busyMode) setBusy(busyMode);
    setError(null);
    try {
      const response = await fetch("/api/autopublish/status", { cache: "no-store" });
      const payload = (await response.json()) as AutopublishStatusPayload;
      setStatus(payload);
      setSelectedChannelId((current) => current || payload.channels[0]?.channelId || "ai-tech");
      const schedulerResponse = await fetch("/api/admin/publish-scheduler/status", { cache: "no-store" });
      if (schedulerResponse.ok) {
        setPublishScheduler((await schedulerResponse.json()) as PublishSchedulerStatusPayload);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Status check failed.");
    } finally {
      if (busyMode) setBusy(null);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const selectedChannel = useMemo(
    () => status?.channels.find((channel) => channel.channelId === selectedChannelId) ?? status?.channels[0],
    [selectedChannelId, status?.channels],
  );

  async function loadPreview() {
    if (busy || !selectedChannelId) return;
    setBusy("status");
    setError(null);
    try {
      const response = await fetch(`/api/autopublish/preview?channelId=${encodeURIComponent(selectedChannelId)}`, { cache: "no-store" });
      setPreview((await response.json()) as PreviewPayload);
      setPhase("Предпросмотр готов. Telegram не тронут.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Preview failed.";
      setError(message);
      setPhase(`${text.errorPrefix}: ${message}`);
    } finally {
      setBusy(null);
    }
  }

  async function regeneratePreview(action: "regenerate_text" | "regenerate_image") {
    if (busy || !preview?.preview) return;
    setBusy("status");
    setError(null);
    try {
      const response = await fetch("/api/autopublish/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: selectedChannelId, itemId: preview.preview.id, action }),
      });
      setPreview((await response.json()) as PreviewPayload);
      setPhase(action === "regenerate_text" ? "Текст перегенерирован." : "Картинка перегенерирована.");
      await loadStatus(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Regeneration failed.";
      setError(message);
      setPhase(`${text.errorPrefix}: ${message}`);
    } finally {
      setBusy(null);
    }
  }

  async function runWithPhases(mode: "test" | "schedule" | "mass") {
    if (busy || !status) return;

    const affected = mode === "test" ? 1 : mode === "mass" ? status.totalChannels : status.dueToday ? status.waitingToday : 0;
    if (mode === "mass") {
      if (!window.confirm(text.confirmAll)) return;
    } else if (affected > 1 && !window.confirm(text.confirmMany.replace("X", String(affected)))) {
      return;
    }

    setBusy(mode);
    setError(null);
    setLastRun(null);
    setMassProgress(null);
    let progressTimer: number | null = null;

    try {
      setPhase(text.preparing);
      await delay(250);
      setPhase(text.generatingText);
      await delay(250);
      setPhase(text.image);
      await delay(250);
      setPhase(text.telegram);

      if (mode === "mass") {
        const runChannels = status.channels;
        setMassProgress({
          current: runChannels.length ? 1 : 0,
          total: runChannels.length,
          currentChannelName: runChannels[0]?.channelName ?? "-",
        });
        progressTimer = window.setInterval(() => {
          setMassProgress((current) => {
            if (!current || current.current >= current.total) return current;
            const next = current.current + 1;
            return {
              current: next,
              total: current.total,
              currentChannelName: runChannels[next - 1]?.channelName ?? current.currentChannelName,
            };
          });
        }, 3000);
      }

      const response = await fetch("/api/autopublish/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "test"
            ? { mode: "test", channelId: selectedChannel?.channelId }
            : mode === "mass"
              ? { mode: "publish_all_now" }
              : { mode: "scheduled" },
        ),
      });
      const payload = (await response.json()) as AutopublishRunPayload;
      setLastRun(payload);

      if (progressTimer) {
        window.clearInterval(progressTimer);
        progressTimer = null;
      }
      if (mode === "mass") {
        const lastDetail = payload.details[payload.details.length - 1];
        setMassProgress({
          current: payload.details.length,
          total: status.totalChannels,
          currentChannelName: lastDetail?.channelName ?? "-",
        });
      }

      if (!payload.ok || payload.errors > 0) {
        const firstError = payload.details.find((item) => item.status === "error");
        setPhase(`${text.errorPrefix}: ${firstError?.reason ?? payload.message}`);
      } else if (payload.published > 0) {
        setPhase(text.success);
      } else {
        setPhase(payload.message);
      }

      await loadStatus(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Autopublish run failed.";
      setError(message);
      setPhase(`${text.errorPrefix}: ${message}`);
    } finally {
      if (progressTimer) window.clearInterval(progressTimer);
      setBusy(null);
    }
  }

  async function toggleEnabled() {
    if (busy || !status) return;
    setBusy("toggle");
    setError(null);
    try {
      const response = await fetch("/api/autopublish/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !status.enabled }),
      });
      const payload = (await response.json()) as AutopublishStatusPayload;
      setStatus(payload);
      setPhase(payload.enabled ? text.toggleOn : text.toggleOff);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Toggle failed.";
      setError(message);
      setPhase(`${text.errorPrefix}: ${message}`);
    } finally {
      setBusy(null);
    }
  }

  async function runAdminAction(
    action:
      | "pause"
      | "resume"
      | "send-test"
      | "send-status"
      | "emergency-stop"
      | "clear-protection",
  ) {
    if (busy) return;
    if (action === "emergency-stop" && !window.confirm("Emergency stop will pause autopublish and block scheduled sends until manual recovery. Continue?")) return;

    setBusy("admin");
    setError(null);
    try {
      const endpoint =
        action === "pause"
          ? "/api/admin/autopilot/pause"
          : action === "resume"
            ? "/api/admin/autopilot/resume"
            : action === "send-test"
              ? "/api/admin/reports/send-test"
              : action === "send-status"
                ? "/api/admin/reports/send-status"
                : action === "clear-protection"
                  ? "/api/admin/autopilot/clear-protection"
                  : "/api/admin/autopilot/emergency-stop";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "emergency-stop" ? JSON.stringify({ reason: "dashboard_emergency_stop" }) : JSON.stringify({}),
      });
      const payload = await response.json();
      setPhase(typeof payload.message === "string" ? payload.message : typeof payload.reason === "string" ? payload.reason : "Admin action completed.");
      await loadStatus(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Admin action failed.";
      setError(message);
      setPhase(`${text.errorPrefix}: ${message}`);
    } finally {
      setBusy(null);
    }
  }

  const errors = lastRun?.details.filter((item) => item.status === "error") ?? [];
  const disabled = Boolean(busy);
  const actionDisabled = disabled || !status;
  const journalEntries = status?.journalLast20 ?? status?.journal ?? [];
  const serverWorking = status?.serverStatus === "working" || Boolean(status);
  const activeChannels = status?.activeChannels ?? status?.totalChannels ?? 0;
  const protectionEnabled = Boolean(status?.protectionMode?.enabled);
  const paused = Boolean(status?.paused);
  const lastPublicationLabel = status?.lastPublication
    ? `${new Date(status.lastPublication.attemptedAt).toLocaleString()} / ${status.lastPublication.channelName}`
    : "none";
  const nextPublicationLabel = status?.nextPublication
    ? `${new Date(status.nextPublication.plannedAt).toLocaleString()} / ${status.nextPublication.channelName}`
    : "none";
  const publishSchedulerLastRunLabel = publishScheduler?.lastRunAt ? new Date(publishScheduler.lastRunAt).toLocaleString() : "none";

  return (
    <section className="rounded-lg border border-emerald-300/20 bg-emerald-300/5 p-5 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Autopublish</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{text.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{text.intro}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={toggleEnabled} disabled={actionDisabled} className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-slate-950/70 px-4 text-sm font-semibold text-slate-200 transition hover:border-emerald-300/40 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60">
            {busy === "toggle" ? <Loader2 className="h-4 w-4 animate-spin" /> : status?.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {status?.enabled ? "Autopublish ON" : "Autopublish OFF"}
          </button>
          <button type="button" onClick={() => void loadStatus()} disabled={disabled} className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-slate-950/70 px-4 text-sm font-semibold text-slate-200 transition hover:border-emerald-300/40 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60">
            {busy === "status" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {text.checkStatus}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
        {text.localWarning}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <Metric label="Автопубликация" value={status?.enabled ? text.enabled : text.disabled} tone={status?.enabled ? "ok" : "warn"} />
        <Metric label="Сервер" value={serverWorking ? "работает" : "не работает"} tone={serverWorking ? "ok" : "error"} />
        <Metric label="Активные каналы" value={`${activeChannels}/${status?.totalChannels ?? 15}`} tone={activeChannels === (status?.totalChannels ?? 15) ? "ok" : "warn"} />
        <Metric label="Опубликовано сегодня" value={String(status?.publishedToday ?? 0)} tone="ok" />
        <Metric label="Ждут сегодня" value={String(status?.waitingToday ?? 0)} tone={(status?.waitingToday ?? 0) ? "warn" : "ok"} />
        <Metric label="Ошибки 24ч" value={String(status?.errorsLast24h?.length ?? status?.errorsToday.length ?? 0)} tone={(status?.errorsLast24h?.length ?? status?.errorsToday.length ?? 0) ? "error" : "ok"} />
        <Metric label="Последняя публикация" value={lastPublicationLabel} />
        <Metric label="Ближайшая публикация" value={nextPublicationLabel} tone={status?.nextPublication ? "ok" : "warn"} />
        <Metric label="Worker" value={status?.workerRunning ? "работает" : "не работает"} tone={status?.workerRunning ? "ok" : "warn"} />
        <Metric label="Расписание" value={`${status?.time ?? "09:00"} / ${status?.timezone ?? "Europe/Kyiv"}`} />
      </div>

      <div className="mt-4 rounded-md border border-line bg-slate-950/60 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Autopilot Control</p>
            <h3 className="mt-1 text-base font-semibold text-white">Reports, pause and protection</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Safe controls only: these buttons do not publish channel posts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void runAdminAction(paused ? "resume" : "pause")} disabled={actionDisabled} className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60">
              {busy === "admin" ? <Loader2 className="h-4 w-4 animate-spin" /> : paused ? <Play className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              {paused ? "Resume" : "Pause"}
            </button>
            <button type="button" onClick={() => void runAdminAction("send-test")} disabled={actionDisabled} className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60">
              <FileText className="h-4 w-4" />
              Test report
            </button>
            <button type="button" onClick={() => void runAdminAction("send-status")} disabled={actionDisabled} className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60">
              <CalendarDays className="h-4 w-4" />
              Status report
            </button>
            <a href="#publication-journal" className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
              <FileText className="h-4 w-4" />
              Publication log
            </a>
            <a href="/content-calendar" className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
              <CalendarDays className="h-4 w-4" />
              Content calendar
            </a>
            {protectionEnabled ? (
              <button type="button" onClick={() => void runAdminAction("clear-protection")} disabled={actionDisabled} className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-300/30 px-3 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-60">
                <ShieldAlert className="h-4 w-4" />
                Clear protection
              </button>
            ) : null}
            <button type="button" onClick={() => void runAdminAction("emergency-stop")} disabled={actionDisabled} className="inline-flex h-9 items-center gap-2 rounded-md border border-rose-300/30 px-3 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-60">
              <AlertTriangle className="h-4 w-4" />
              Emergency stop
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Protection" value={protectionEnabled ? "enabled" : "clear"} tone={protectionEnabled ? "error" : "ok"} />
          <Metric label="Pause" value={paused ? status?.pausedReason ?? "paused" : "not paused"} tone={paused ? "warn" : "ok"} />
          <Metric label="Admin reports" value={status?.adminReports?.enabled ? "enabled" : "disabled"} tone={status?.adminReports?.enabled ? "ok" : "warn"} />
          <Metric label="Admin chat" value={status?.adminReports?.chatIdConfigured ? "configured" : "missing"} tone={status?.adminReports?.chatIdConfigured ? "ok" : "warn"} />
          <Metric label="Worker heartbeat" value={status?.lastWorkerHeartbeatAt ? new Date(status.lastWorkerHeartbeatAt).toLocaleString() : "none"} tone={status?.workerRunning ? "ok" : "warn"} />
          <Metric label="Consecutive errors" value={String(status?.errorCounters?.consecutive ?? 0)} tone={(status?.errorCounters?.consecutive ?? 0) ? "error" : "ok"} />
          <Metric label="Daily report" value={status?.lastDailyReportAt ? new Date(status.lastDailyReportAt).toLocaleString() : "not sent"} />
          <Metric label="Today stats" value={`${status?.dailyStats?.success ?? 0} ok / ${status?.dailyStats?.skipped ?? 0} skip / ${status?.dailyStats?.errors ?? 0} err`} tone={(status?.dailyStats?.errors ?? 0) ? "error" : "ok"} />
        </div>
        {status?.protectionMode?.reason || status?.pausedReason ? (
          <p className="mt-3 text-xs leading-5 text-amber-100">
            {status?.protectionMode?.reason ? `Protection reason: ${status.protectionMode.reason}. ` : ""}
            {status?.pausedReason ? `Pause reason: ${status.pausedReason}.` : ""}
          </p>
        ) : null}
        <div className="mt-4 rounded-md border border-cyan-300/20 bg-cyan-300/5 p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Remote Scheduler</p>
              <p className="mt-1 text-sm text-slate-300">{publishScheduler?.message ?? "No publish:due run recorded yet."}</p>
            </div>
            <p className="text-xs text-slate-500">Last run: {publishSchedulerLastRunLabel}</p>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <Metric label="Store" value={publishScheduler?.storeMode ?? "unknown"} />
            <Metric label="Dry run" value={publishScheduler?.dryRun === null || publishScheduler?.dryRun === undefined ? "unknown" : publishScheduler.dryRun ? "yes" : "no"} tone={publishScheduler?.dryRun ? "warn" : "ok"} />
            <Metric label="Published" value={String(publishScheduler?.published ?? 0)} tone={(publishScheduler?.published ?? 0) ? "ok" : "dry"} />
            <Metric label="Errors" value={String(publishScheduler?.errors ?? 0)} tone={(publishScheduler?.errors ?? 0) ? "error" : "ok"} />
          </div>
          {publishScheduler?.lastErrors?.length ? (
            <div className="mt-3 space-y-1 text-xs text-rose-100">
              {publishScheduler.lastErrors.slice(0, 5).map((entry) => (
                <p key={entry.id}>{entry.channelId ?? "system"} / {entry.postId ?? "-"}: {entry.message ?? entry.status}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,360px)_1fr]">
        <select value={selectedChannelId} onChange={(event) => setSelectedChannelId(event.target.value)} disabled={disabled} className="h-10 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100">
          {(status?.channels ?? []).map((channel) => (
            <option key={channel.channelId} value={channel.channelId}>{channel.channelName}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void loadPreview()} disabled={actionDisabled || !selectedChannel} className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
            {busy === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {text.testNow}
          </button>
          <button type="button" onClick={() => void runWithPhases("mass")} disabled={actionDisabled} className="inline-flex h-10 items-center gap-2 rounded-md bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60">
            {busy === "mass" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {text.publishAllNow}
          </button>
          <button type="button" onClick={() => void runWithPhases("schedule")} disabled={actionDisabled} className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60">
            {busy === "schedule" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {text.runSchedule}
          </button>
        </div>
      </div>

      {preview?.preview ? (
        <div className="mt-4 grid gap-4 rounded-md border border-cyan-300/25 bg-slate-950/60 p-4 lg:grid-cols-[320px_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${preview.preview.imageUrl}?v=${encodeURIComponent(preview.preview.id + preview.preview.telegramImagePath)}`} alt={preview.preview.title} className="aspect-[4/5] w-full rounded-md border border-line object-cover" />
            <p className="mt-2 text-xs text-slate-500">{preview.preview.telegramImageStatus} / {preview.preview.imageQuality}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">{preview.preview.channelName}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{preview.preview.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{preview.preview.contentTopic}</p>
            <div className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-slate-950 p-3 text-sm leading-6 text-slate-200">{preview.preview.body}</div>
            {preview.preview.qualityIssues.length ? <p className="mt-3 text-sm text-amber-100">{preview.preview.qualityIssues.join("; ")}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => void runWithPhases("test")} disabled={actionDisabled || !preview.preview.readyToPublish} className="h-9 rounded-md bg-cyan-300 px-3 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
                Опубликовать
              </button>
              <button type="button" onClick={() => void regeneratePreview("regenerate_text")} disabled={disabled} className="h-9 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 disabled:opacity-60">
                Перегенерировать текст
              </button>
              <button type="button" onClick={() => void regeneratePreview("regenerate_image")} disabled={disabled} className="h-9 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 disabled:opacity-60">
                Перегенерировать картинку
              </button>
              <button type="button" onClick={() => setPreview(null)} disabled={disabled} className="h-9 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 disabled:opacity-60">
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm leading-6 text-slate-300">
        <p className={cn(busy && "text-amber-100")}>{phase}</p>
        {massProgress ? (
          <p className="text-amber-100">
            {massProgress.current}/{massProgress.total}. {text.currentChannel}: {massProgress.currentChannelName}
          </p>
        ) : null}
        <p>{status?.message ?? "Status is loading."}</p>
        <p className="text-xs text-slate-500">Last run: {status?.lastRun ?? "none"} / Timezone: {status?.timezone ?? "Europe/Kyiv"}</p>
      </div>

      {lastRun ? (
        <div className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">
          <p className="font-semibold text-white">{lastRun.message}</p>
          <p className="mt-1 text-xs text-slate-500">
            {text.published}: {lastRun.published}/{lastRun.totalChannels}, {text.skipped}: {lastRun.skipped}, {text.errors}: {lastRun.errors}, {text.duration}: {formatDuration(lastRun.durationMs)}
          </p>
          {lastRun.details.length ? (
            <div className="mt-2 grid gap-1 text-xs text-slate-300 md:grid-cols-2">
              {lastRun.details.map((item) => (
                <p key={`${item.channelId}-${item.postId}-${item.status}`}>
                  {item.channelName}: {item.status}{item.telegramMessageId ? ` / Telegram ID ${item.telegramMessageId}` : ""}{item.reason ? ` / ${item.reason}` : ""}
                </p>
              ))}
            </div>
          ) : null}
          {errors.length ? <div className="mt-2 space-y-1 text-xs text-rose-100">{errors.slice(0, 10).map((item) => <p key={`${item.channelId}-${item.postId}`}>{item.channelName}: {item.reason ?? "error"}</p>)}</div> : null}
        </div>
      ) : null}

      <div id="publication-journal" className="mt-4 rounded-md border border-line bg-slate-950/60 p-3">
        <p className="text-sm font-semibold text-white">Publication journal: последние 20 записей</p>
        <div className="mt-3 max-h-72 overflow-auto">
          <table className="w-full min-w-[920px] text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="border-b border-line px-2 py-2">Date/time</th>
                <th className="border-b border-line px-2 py-2">Channel</th>
                <th className="border-b border-line px-2 py-2">Topic</th>
                <th className="border-b border-line px-2 py-2">Status</th>
                <th className="border-b border-line px-2 py-2">Telegram ID</th>
                <th className="border-b border-line px-2 py-2">Timings</th>
                <th className="border-b border-line px-2 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.slice(0, 20).map((entry) => (
                <tr key={`${entry.attemptedAt}-${entry.channelId}-${entry.postId}`} className="text-slate-300">
                  <td className="border-b border-line/60 px-2 py-2">{new Date(entry.attemptedAt).toLocaleString()}</td>
                  <td className="border-b border-line/60 px-2 py-2">{entry.channelName ?? "-"}</td>
                  <td className="border-b border-line/60 px-2 py-2">{entry.title ?? entry.postId ?? "-"}</td>
                  <td className={cn("border-b border-line/60 px-2 py-2", entry.status === "success" ? "text-emerald-100" : entry.status === "error" ? "text-rose-100" : "text-amber-100")}>{entry.status}</td>
                  <td className="border-b border-line/60 px-2 py-2">{entry.telegramMessageLink ? <a className="text-cyan-200 underline-offset-2 hover:underline" href={entry.telegramMessageLink} target="_blank" rel="noreferrer">{entry.telegramMessageId}</a> : entry.telegramMessageId ?? "-"}</td>
                  <td className="border-b border-line/60 px-2 py-2">{formatTimings(entry)}</td>
                  <td className="border-b border-line/60 px-2 py-2">{entry.error ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error ? <p className="mt-4 rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p> : null}
    </section>
  );
}

function Metric({ label, value, tone = "dry" }: { label: string; value: string; tone?: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className={cn("rounded-md border px-3 py-2", tone === "ok" && "border-emerald-300/25 bg-emerald-300/10", tone === "warn" && "border-amber-300/25 bg-amber-300/10", tone === "error" && "border-rose-300/25 bg-rose-300/10", tone === "dry" && "border-slate-700 bg-slate-950/50")}>
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function formatTimings(entry: { timings: Timing | null; durationMs?: number; generationTextMs?: number; generationImageMs?: number; telegramSendMs?: number }) {
  const textMs = entry.generationTextMs ?? entry.timings?.textMs ?? 0;
  const imageMs = entry.generationImageMs ?? entry.timings?.imageMs ?? 0;
  const telegramMs = entry.telegramSendMs ?? entry.timings?.telegramMs ?? 0;
  const totalMs = entry.durationMs ?? entry.timings?.totalMs ?? 0;

  if (!entry.timings && !entry.durationMs) return "-";
  return `text ${textMs}ms / image ${imageMs}ms / tg ${telegramMs}ms / total ${totalMs}ms`;
}

function formatDuration(ms: number | null) {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${Math.round(ms / 100) / 10}s`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
