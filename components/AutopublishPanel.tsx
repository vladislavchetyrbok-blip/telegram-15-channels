"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, OctagonX, Pause, Play, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyContentPlanPanel, type WeeklyContentPlanItem, type WeeklyContentPlanSummary } from "@/components/WeeklyContentPlanPanel";
import { getCanonicalChannelTitle } from "@/lib/channel-canonical";

type AutopublishAction =
  | "enable"
  | "disable"
  | "pause_today"
  | "resume_today"
  | "emergency_stop"
  | "prepare_tomorrow"
  | "check_schedule"
  | "scheduler_tick"
  | "run_today"
  | "retry_today_errors"
  | "run_next_due_now"
  | "repair_captions";

type LogFilter = "all" | "today" | "success" | "failed" | "blocked" | "skipped" | "already_published";

interface PlanItem {
  date: string;
  plannedAt: string;
  channelId: string;
  channelName: string;
  telegramTarget: string;
  selectedPost: string | null;
  selectedPostTitle: string | null;
  textQuality: "strong" | "medium" | "weak" | "unknown";
  imageQuality: "strong" | "medium" | "weak" | "unknown";
  telegramImageStatus: string;
  bodyLength: number;
  telegramCaptionLength: number;
  telegramCaptionStatus: string;
  status: string;
  blockerReason: string | null;
}

interface AutopublishLogEntry {
  id: string;
  mode: string;
  channelId: string | null;
  channelName: string | null;
  telegramTarget: string | null;
  postId: string | null;
  title: string | null;
  imagePath: string | null;
  telegramImagePath: string | null;
  scheduledAt: string | null;
  attemptedAt: string;
  result: "success" | "failed" | "blocked" | "skipped" | "already_published";
  telegramMessageId: number | null;
  error: string | null;
  duration: number;
  retryCount: number;
}

interface AutopublishStatus {
  ok: boolean;
  config: {
    enabled: boolean;
    pausedToday: boolean;
    emergencyStop: boolean;
    dailyLimitPerChannel: number;
    maxPostsPerDay: number;
    timeStart: string;
    timeEnd: string;
    timezone: string;
    strategy: "manual_now" | "spread_day" | "custom_schedule";
    minMinutesBetweenPosts: number;
    updatedAt: string;
  };
  currentMode: "daily schedule" | "manual" | "paused" | "stopped";
  channelsTotal: number;
  linkedTargets: number;
  botAccessOk: number;
  readyPosts: number;
  tomorrowPosts: number;
  postsWithoutImages: number;
  weakText: number;
  weakImage: number;
  telegramImagesOk: number;
  todayPublished: number;
  failedToday: number;
  skippedToday: number;
  todayErrors: number;
  blockedToday: number;
  channelsWithoutReadyPosts: string[];
  nextPublication: string | null;
  nextChannel: string | null;
  nextPost: string | null;
  scheduler: {
    intervalMinutes: number;
    status: "running" | "stopped" | "paused" | "waiting" | "error";
    lastCheck: string | null;
    nextCheck: string | null;
    lastMessage: string | null;
    runtime: "server_worker" | "dev_endpoint";
    workerRunning: boolean;
  };
  queueHealth: "OK" | "needs attention";
  telegramConnection: "OK" | "error";
  contentQuality: "OK" | "weak items found";
  publishLog: AutopublishLogEntry[];
  todayLog: AutopublishLogEntry[];
  queue: Array<{
    channelId: string;
    channelName: string;
    telegramTarget: string;
    selectedPost: string | null;
    selectedPostTitle: string | null;
    status: string;
    blockerReason: string | null;
    telegramImageStatus: string;
    bodyLength: number;
    telegramCaptionLength: number;
    telegramCaptionStatus: string;
    mojibakeStatus: string;
    realReadyStatus: string;
    botAccess: string;
  }>;
  todayPlan: PlanItem[];
  tomorrowPlan: PlanItem[];
  weeklyPlan: WeeklyContentPlanSummary;
  weeklyPlanItems: WeeklyContentPlanItem[];
  diagnostics: string[];
  lastEnablePreflight: {
    ok: boolean;
    checkedAt: string;
    blockers: string[];
    telegram: { tokenConfigured: boolean; linkedTargets: number; botAccessOk: number; canPost: number };
    posts: { readyChannels: number; readyPosts: number; weakText: number; weakImage: number; postsWithoutImages: number; telegramImagesOk: number };
  } | null;
  message: string;
  updatedAt: string;
}

interface TelegramDiagnostics {
  ok: boolean;
  tokenConfigured: boolean;
  tokenValid: boolean;
  botId: number | null;
  botUsername: string | null;
  exactError: string | null;
}

interface TelegramAccessDiagnostics {
  getMeOk: boolean;
  linked: number;
  channelsTotal: number;
  chatFound: number;
  botAdmin: number;
  canPost: number;
  accessOk: number;
  botUsername: string | null;
  exactError: string | null;
  checks: Array<{
    channelId: string;
    channelName: string;
    telegramTarget: string;
    chatFound: boolean;
    botAdmin: boolean;
    canPost: boolean;
    accessStatus: "OK" | "ERROR";
    exactError: string | null;
  }>;
}

interface PrepareResult {
  ok: boolean;
  readyChannelsWithTwoPosts: number;
  qualityAfter: { checked: number; weakText: number; weakImage: number; strong: number; medium: number; weak: number };
  improved: { regeneratedPosts: number; regeneratedImages: string[] };
  telegramImages: { checked: number; telegramImageStatusOk: number; pngOrJpgCreated: number; failed: number };
  message: string;
}

interface RunResult {
  ok: boolean;
  message: string;
  started?: boolean;
  status?: string;
  reason?: string | null;
  telegramAttempted?: boolean;
  selected?: {
    channelId: string;
    channelName: string;
    telegramTarget: string;
    selectedPost: string | null;
    selectedPostTitle: string | null;
    telegramImagePath: string | null;
    publishResult: string;
    telegramMessageId: number | null;
    publishError: string | null;
  } | null;
  result: {
    status?: string;
    reason?: string | null;
    telegramAttempted?: boolean;
    publishedSuccess: number;
    failed: number;
    blocked?: number;
    skipped: number;
    alreadyPublished: number;
  } | null;
}

export function AutopublishPanel() {
  const [status, setStatus] = useState<AutopublishStatus | null>(null);
  const [prepareResult, setPrepareResult] = useState<PrepareResult | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [schedulerResult, setSchedulerResult] = useState<Record<string, unknown> | null>(null);
  const [telegramDiagnostics, setTelegramDiagnostics] = useState<TelegramDiagnostics | null>(null);
  const [telegramAccess, setTelegramAccess] = useState<TelegramAccessDiagnostics | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<AutopublishAction | null>(null);
  const [logFilter, setLogFilter] = useState<LogFilter>("all");
  const [message, setMessage] = useState("Autopublish is disabled by default. Nothing is sent without a manual launch.");

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    setBusy("status");
    try {
      const response = await fetch("/api/autopublish", { cache: "no-store" });
      const payload = (await response.json()) as AutopublishStatus;
      setStatus(payload);
      setMessage(displayText(payload.message, "Autopublish status refreshed."));
    } finally {
      setBusy(null);
    }
  }

  async function runAction(action: AutopublishAction, confirmed = false) {
    setBusy(action);
    setConfirmAction(null);
    try {
      const response = await fetch("/api/autopublish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, confirmed }),
      });
      const payload = await response.json();

      if (action === "prepare_tomorrow") {
        setPrepareResult(payload as PrepareResult);
        setMessage((payload as PrepareResult).message);
      } else if (action === "run_today" || action === "retry_today_errors" || action === "run_next_due_now") {
        setRunResult(payload as RunResult);
        setMessage((payload as RunResult).message);
      } else if (action === "repair_captions") {
        setMessage(typeof payload.message === "string" ? displayText(payload.message, "Long captions were repaired.") : "Long captions were repaired.");
      } else if (action === "scheduler_tick") {
        setSchedulerResult(payload);
        setMessage(typeof payload.message === "string" ? displayText(payload.message, "Scheduler tick completed.") : "Scheduler tick completed.");
      } else {
        setStatus(payload as AutopublishStatus);
        setMessage(displayText((payload as AutopublishStatus).message, "Autopublish status updated."));
      }

      await loadStatus();
    } finally {
      setBusy(null);
    }
  }

  async function checkTelegramToken() {
    setBusy("telegram_token");
    try {
      const response = await fetch("/api/telegram/diagnostics", { cache: "no-store" });
      const payload = (await response.json()) as TelegramDiagnostics;
      setTelegramDiagnostics(payload);
      setMessage(payload.ok ? `Telegram getMe OK: ${payload.botUsername ?? payload.botId}` : `Telegram getMe error: ${payload.exactError ?? "unknown"}`);
    } finally {
      setBusy(null);
    }
  }

  async function checkAllTelegramAccess() {
    setBusy("telegram_access");
    try {
      const response = await fetch("/api/telegram/check-all-access", { method: "POST" });
      const payload = (await response.json()) as TelegramAccessDiagnostics;
      setTelegramAccess(payload);
      setMessage(`Telegram access: ${payload.accessOk}/${payload.channelsTotal} OK, getMe ${payload.getMeOk ? "OK" : "error"}.`);
      await loadStatus();
    } finally {
      setBusy(null);
    }
  }

  async function refreshTelegramDiagnostics() {
    setBusy("telegram_refresh");
    try {
      const diagnosticsResponse = await fetch("/api/telegram/diagnostics", { cache: "no-store" });
      const diagnosticsPayload = (await diagnosticsResponse.json()) as TelegramDiagnostics;
      setTelegramDiagnostics(diagnosticsPayload);

      const accessResponse = await fetch("/api/telegram/check-all-access", { method: "POST" });
      const accessPayload = (await accessResponse.json()) as TelegramAccessDiagnostics;
      setTelegramAccess(accessPayload);
      setMessage(`Telegram diagnostics: getMe ${accessPayload.getMeOk ? "OK" : "error"}, access ${accessPayload.accessOk}/${accessPayload.channelsTotal} OK.`);
      await loadStatus();
    } finally {
      setBusy(null);
    }
  }

  const blockedChannels = useMemo(
    () => status?.queue.filter((item) => item.status !== "ready_to_publish" && item.status !== "published" && item.status !== "already_published") ?? [],
    [status?.queue],
  );

  const filteredLog = useMemo(() => {
    const log = status?.publishLog ?? [];
    const today = new Date().toISOString().slice(0, 10);

    if (logFilter === "all") return log;
    if (logFilter === "today") return log.filter((entry) => entry.attemptedAt.slice(0, 10) === today);
    return log.filter((entry) => entry.result === logFilter);
  }, [logFilter, status?.publishLog]);

  return (
    <section className="rounded-lg border border-violet-300/25 bg-violet-300/5 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Autopublish</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Publication automation</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Daily autopublish controls: schedule, limits, duplicate protection, logs, emergency stop, and diagnostics explaining why the system is not publishing now.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <ActionButton busy={busy === "status"} onClick={loadStatus} icon={<RefreshCw className={cn("h-4 w-4", busy === "status" && "animate-spin")} />}>
            Refresh queue
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => runAction("prepare_tomorrow")} icon={<Sparkles className="h-4 w-4" />}>
            Prepare tomorrow content
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => runAction("repair_captions")} icon={<Wand2 className="h-4 w-4" />}>
            Repair long captions
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => runAction("repair_captions")} icon={<CheckCircle2 className="h-4 w-4" />}>
            Return repaired items to queue
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={loadStatus} icon={<RefreshCw className="h-4 w-4" />}>
            Check readiness
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => runAction("scheduler_tick")} icon={<CalendarClock className="h-4 w-4" />}>
            Check scheduler
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={checkTelegramToken} icon={<RefreshCw className="h-4 w-4" />}>
            Check Telegram token
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={checkAllTelegramAccess} icon={<RefreshCw className="h-4 w-4" />}>
            Check bot access
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={refreshTelegramDiagnostics} icon={<RefreshCw className="h-4 w-4" />}>
            Refresh Telegram diagnostics
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => runAction(status?.config.enabled ? "disable" : "enable")} icon={status?.config.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}>
            {status?.config.enabled ? "Disable autopublish" : "Enable autopublish"}
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => runAction("pause_today")} icon={<Pause className="h-4 w-4" />}>
            Pause today
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => setConfirmAction("run_today")} tone="primary" icon={<CalendarClock className="h-4 w-4" />}>
            Run today plan manually
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => setConfirmAction("run_next_due_now")} icon={<Play className="h-4 w-4" />}>
            Run next due post now
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => setConfirmAction("retry_today_errors")} icon={<RefreshCw className="h-4 w-4" />}>
            Retry today errors
          </ActionButton>
          <ActionButton busy={Boolean(busy)} onClick={() => runAction("emergency_stop")} tone="danger" icon={<OctagonX className="h-4 w-4" />}>
            Emergency stop
          </ActionButton>
        </div>
      </div>

      {confirmAction ? (
        <div className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-100" />
            <div>
              <p className="font-semibold text-white">
                {confirmAction === "retry_today_errors" ? "Retry only today's errors?" : "This can publish up to 1 post per channel that has not already published today. Continue?"}
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-100">
                Already published post IDs, message IDs, successful log entries, and channels at the daily limit are protected from duplicate sends.
              </p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setConfirmAction(null)} className="h-9 rounded-md border border-line px-3 text-xs font-semibold text-slate-200">
                  Cancel
                </button>
                <button type="button" onClick={() => runAction(confirmAction, true)} className="h-9 rounded-md bg-amber-300 px-3 text-xs font-semibold text-slate-950">
                  Yes, run one pass
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Metric label="Autopublish enabled" value={status?.config.enabled ? "true" : "false"} tone={status?.config.enabled ? "ok" : "dry"} />
        <Metric label="Current mode" value={status?.currentMode ?? "manual"} tone="dry" />
        <Metric label="Timezone" value={status?.config.timezone ?? "Europe/Kyiv"} tone="dry" />
        <Metric label="Daily limit/channel" value={status?.config.dailyLimitPerChannel ?? 1} tone="dry" />
        <Metric label="Max posts/day" value={status?.config.maxPostsPerDay ?? 15} tone="dry" />
        <Metric label="Published today" value={`${status?.todayPublished ?? 0}/15`} tone="ok" />
        <Metric label="Failed today" value={status?.failedToday ?? 0} tone={(status?.failedToday ?? 0) ? "error" : "ok"} />
        <Metric label="Skipped today" value={status?.skippedToday ?? 0} tone={(status?.skippedToday ?? 0) ? "warn" : "ok"} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Metric label="Next time" value={status?.nextPublication ? new Date(status.nextPublication).toLocaleTimeString() : "none"} tone="dry" />
        <Metric label="Next channel" value={status?.nextChannel ?? "none"} tone="dry" />
        <Metric label="Next post" value={status?.nextPost ?? "none"} tone="dry" />
        <Metric label="Scheduler" value={status?.scheduler.status ?? "stopped"} tone={status?.scheduler.status === "running" ? "ok" : "warn"} />
        <Metric label="Last check" value={status?.scheduler.lastCheck ? new Date(status.scheduler.lastCheck).toLocaleTimeString() : "none"} tone="dry" />
        <Metric label="Next check" value={status?.scheduler.nextCheck ? new Date(status.scheduler.nextCheck).toLocaleTimeString() : "none"} tone="dry" />
        <Metric label="Targets linked" value={`${status?.linkedTargets ?? 0}/15`} tone={(status?.linkedTargets ?? 0) === 15 ? "ok" : "warn"} />
        <Metric label="Bot access OK" value={`${status?.botAccessOk ?? 0}/15`} tone={(status?.botAccessOk ?? 0) === 15 ? "ok" : "warn"} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric label="Ready posts" value={status?.readyPosts ?? 0} tone="ok" />
        <Metric label="Without images" value={status?.postsWithoutImages ?? 0} tone={(status?.postsWithoutImages ?? 0) ? "error" : "ok"} />
        <Metric label="Weak text" value={status?.weakText ?? 0} tone={(status?.weakText ?? 0) ? "error" : "ok"} />
        <Metric label="Weak image" value={status?.weakImage ?? 0} tone={(status?.weakImage ?? 0) ? "error" : "ok"} />
      </div>

      <div className="mt-4 rounded-lg border border-line bg-slate-950/60 p-4">
        <p className="font-semibold text-white">Autopublish state</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Metric label="Scheduler status" value={status?.scheduler.status ?? "stopped"} tone={status?.scheduler.status === "running" ? "ok" : "warn"} />
          <Metric label="Worker" value={status?.scheduler.workerRunning ? "running" : "stopped"} tone={status?.scheduler.workerRunning ? "ok" : "warn"} />
          <Metric label="Last check" value={status?.scheduler.lastCheck ? new Date(status.scheduler.lastCheck).toLocaleTimeString() : "none"} tone="dry" />
          <Metric label="Next check" value={status?.scheduler.nextCheck ? new Date(status.scheduler.nextCheck).toLocaleTimeString() : "none"} tone="dry" />
          <Metric label="Blocked today" value={status?.blockedToday ?? 0} tone={(status?.blockedToday ?? 0) ? "error" : "ok"} />
          <Metric label="Queue health" value={status?.queueHealth ?? "needs attention"} tone={status?.queueHealth === "OK" ? "ok" : "warn"} />
          <Metric label="Telegram" value={status?.telegramConnection ?? "error"} tone={status?.telegramConnection === "OK" ? "ok" : "warn"} />
          <Metric label="Content quality" value={status?.contentQuality ?? "weak items found"} tone={status?.contentQuality === "OK" ? "ok" : "warn"} />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-slate-950/60 p-4">
        <p className="font-semibold text-white">Telegram diagnostics</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Metric label="Telegram token" value={telegramDiagnostics ? (telegramDiagnostics.tokenConfigured ? "configured" : "missing") : "not checked"} tone={telegramDiagnostics?.tokenConfigured ? "ok" : "warn"} />
          <Metric label="getMe" value={telegramDiagnostics ? (telegramDiagnostics.ok ? "OK" : "error") : telegramAccess ? (telegramAccess.getMeOk ? "OK" : "error") : "not checked"} tone={(telegramDiagnostics?.ok ?? telegramAccess?.getMeOk) ? "ok" : "warn"} />
          <Metric label="Bot username" value={telegramDiagnostics?.botUsername ?? telegramAccess?.botUsername ?? "unknown"} tone="dry" />
          <Metric label="Targets linked" value={`${telegramAccess?.linked ?? status?.linkedTargets ?? 0}/15`} tone={(telegramAccess?.linked ?? status?.linkedTargets ?? 0) === 15 ? "ok" : "warn"} />
          <Metric label="Chat found" value={`${telegramAccess?.chatFound ?? 0}/15`} tone={(telegramAccess?.chatFound ?? 0) ? "ok" : "warn"} />
          <Metric label="Bot admin" value={`${telegramAccess?.botAdmin ?? 0}/15`} tone={(telegramAccess?.botAdmin ?? 0) ? "ok" : "warn"} />
          <Metric label="Can post" value={`${telegramAccess?.canPost ?? 0}/15`} tone={(telegramAccess?.canPost ?? 0) ? "ok" : "warn"} />
          <Metric label="Bot access OK" value={`${telegramAccess?.accessOk ?? status?.botAccessOk ?? 0}/15`} tone={(telegramAccess?.accessOk ?? status?.botAccessOk ?? 0) ? "ok" : "warn"} />
        </div>
        {telegramDiagnostics?.exactError ? <p className="mt-3 text-sm text-amber-100">getMe error: {telegramDiagnostics.exactError}</p> : null}
        {telegramAccess?.exactError ? <p className="mt-3 text-sm text-amber-100">Telegram access error: {telegramAccess.exactError}</p> : null}
        {telegramAccess?.checks?.some((check) => check.accessStatus !== "OK") ? (
          <div className="mt-3 max-h-56 overflow-auto rounded-md border border-line">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="border-b border-line px-3 py-2">Channel</th>
                  <th className="border-b border-line px-3 py-2">Telegram target</th>
                  <th className="border-b border-line px-3 py-2">Chat</th>
                  <th className="border-b border-line px-3 py-2">Admin</th>
                  <th className="border-b border-line px-3 py-2">Can post</th>
                  <th className="border-b border-line px-3 py-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {telegramAccess.checks
                  .filter((check) => check.accessStatus !== "OK")
                  .map((check) => (
                    <tr key={check.channelId} className="text-slate-300">
                      <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{displayChannel(check.channelId, check.channelName)}</td>
                      <td className="border-b border-line/60 px-3 py-2 font-mono">{check.telegramTarget || "target missing"}</td>
                      <td className="border-b border-line/60 px-3 py-2">{check.chatFound ? "yes" : "no"}</td>
                      <td className="border-b border-line/60 px-3 py-2">{check.botAdmin ? "yes" : "no"}</td>
                      <td className="border-b border-line/60 px-3 py-2">{check.canPost ? "yes" : "no"}</td>
                      <td className="border-b border-line/60 px-3 py-2 text-amber-100">{check.exactError ?? "unknown"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {status?.lastEnablePreflight && !status.lastEnablePreflight.ok ? (
        <div className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4">
          <p className="font-semibold text-white">Enable preflight did not pass</p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <Metric label="Targets" value={`${status.lastEnablePreflight.telegram.linkedTargets}/15`} tone={status.lastEnablePreflight.telegram.linkedTargets === 15 ? "ok" : "warn"} />
            <Metric label="Bot access" value={`${status.lastEnablePreflight.telegram.botAccessOk}/15`} tone={status.lastEnablePreflight.telegram.botAccessOk === 15 ? "ok" : "warn"} />
            <Metric label="Ready channels" value={`${status.lastEnablePreflight.posts.readyChannels}/15`} tone={status.lastEnablePreflight.posts.readyChannels === 15 ? "ok" : "warn"} />
            <Metric label="Telegram images OK" value={status.lastEnablePreflight.posts.telegramImagesOk} tone="dry" />
          </div>
          <ul className="mt-3 grid gap-1 text-sm text-amber-100">
            {status.lastEnablePreflight.blockers.map((blocker) => (
              <li key={blocker}>- {blocker}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Diagnostics reasons={status?.diagnostics ?? []} schedulerMessage={status?.scheduler.lastMessage ?? null} />

      {prepareResult ? (
        <div className="mt-4 rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-4">
          <p className="font-semibold text-white">Content preparation report</p>
          <div className="mt-3 grid gap-3 md:grid-cols-6">
            <Metric label="Checked" value={prepareResult.qualityAfter.checked} tone="dry" />
            <Metric label="Regenerated" value={prepareResult.improved.regeneratedPosts} tone="ok" />
            <Metric label="Telegram images OK" value={prepareResult.telegramImages.telegramImageStatusOk} tone="ok" />
            <Metric label="Strong" value={prepareResult.qualityAfter.strong} tone="ok" />
            <Metric label="Medium" value={prepareResult.qualityAfter.medium} tone="dry" />
            <Metric label="Weak" value={prepareResult.qualityAfter.weak} tone={prepareResult.qualityAfter.weak ? "error" : "ok"} />
          </div>
        </div>
      ) : null}

      {runResult ? (
        <div className="mt-4 rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-4">
          <p className="font-semibold text-white">{runResult.message}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <Metric label="Success" value={runResult.result?.publishedSuccess ?? 0} tone="ok" />
            <Metric label="Failed" value={runResult.result?.failed ?? 0} tone={(runResult.result?.failed ?? 0) ? "error" : "ok"} />
            <Metric label="Skipped" value={runResult.result?.skipped ?? 0} tone="warn" />
            <Metric label="Already published" value={runResult.result?.alreadyPublished ?? 0} tone="dry" />
          </div>
          <div className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-xs text-slate-300">
            <p className="font-semibold text-white">Last manual run</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <Metric label="Status" value={runResult.status ?? runResult.result?.status ?? "unknown"} tone={runResult.ok ? "ok" : "warn"} />
              <Metric label="Telegram attempt" value={runResult.telegramAttempted ?? runResult.result?.telegramAttempted ? "yes" : "no"} tone={runResult.telegramAttempted ?? runResult.result?.telegramAttempted ? "ok" : "dry"} />
              <Metric label="Message ID" value={runResult.selected?.telegramMessageId ?? "-"} tone={runResult.selected?.telegramMessageId ? "ok" : "dry"} />
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <p>Channel: {displayChannel(runResult.selected?.channelId ?? null, runResult.selected?.channelName ?? null)}</p>
              <p>Post: {displayText(runResult.selected?.selectedPostTitle ?? runResult.selected?.selectedPost ?? "-", runResult.selected?.selectedPost ?? "-")}</p>
              <p>Target: {runResult.selected?.telegramTarget ?? "-"}</p>
              <p>Reason: {runResult.reason ?? runResult.result?.reason ?? runResult.selected?.publishError ?? "-"}</p>
            </div>
          </div>
        </div>
      ) : null}

      {schedulerResult ? (
        <p className="mt-4 rounded-md border border-blue-300/25 bg-blue-300/10 p-3 text-sm text-blue-100">
          Scheduler tick: {String(schedulerResult.message ?? schedulerResult.reason ?? "checked")}
        </p>
      ) : null}

      <PlanTable title="Today's publication plan" items={status?.todayPlan ?? []} />
      <PlanTable title="Tomorrow's publication plan" items={status?.tomorrowPlan ?? []} showGenerateHint />

      <WeeklyContentPlanPanel summary={status?.weeklyPlan} items={status?.weeklyPlanItems ?? []} onRefresh={loadStatus} />

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <QueueTable queue={status?.queue ?? []} />
        <LogPanel log={filteredLog} logFilter={logFilter} setLogFilter={setLogFilter} onRefresh={loadStatus} />
      </div>

      <TodayLog log={status?.todayLog ?? []} onRefresh={loadStatus} />

      {blockedChannels.length ? (
        <p className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">
          Channels without a ready post or with blockers: {blockedChannels.map((item) => `${displayChannel(item.channelId, item.channelName)}: ${displayText(item.blockerReason ?? item.status, item.status)}`).join("; ")}
        </p>
      ) : null}

      <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">{message}</p>
    </section>
  );
}

function Diagnostics({ reasons, schedulerMessage }: { reasons: string[]; schedulerMessage: string | null }) {
  return (
    <div className="mt-4 rounded-lg border border-line bg-slate-950/60 p-4">
      <p className="font-semibold text-white">Why is nothing publishing now?</p>
      <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
        {reasons.map((reason) => (
          <span key={reason} className="rounded-md border border-line bg-slate-900/70 px-3 py-2">
            {reason}
          </span>
        ))}
      </div>
      {schedulerMessage ? <p className="mt-3 text-sm text-slate-400">Last scheduler message: {displayText(schedulerMessage, "No clean scheduler message available.")}</p> : null}
    </div>
  );
}

function PlanTable({ title, items, showGenerateHint = false }: { title: string; items: PlanItem[]; showGenerateHint?: boolean }) {
  return (
    <div className="mt-4 rounded-lg border border-line bg-slate-950/60 p-4">
      <p className="font-semibold text-white">{title}</p>
      <div className="mt-3 max-h-96 overflow-auto">
        <table className="w-full min-w-[1080px] text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="border-b border-line px-3 py-2">Time</th>
              <th className="border-b border-line px-3 py-2">Channel</th>
              <th className="border-b border-line px-3 py-2">Telegram target</th>
              <th className="border-b border-line px-3 py-2">Post</th>
              <th className="border-b border-line px-3 py-2">Text quality</th>
              <th className="border-b border-line px-3 py-2">Body</th>
              <th className="border-b border-line px-3 py-2">Caption</th>
              <th className="border-b border-line px-3 py-2">Image quality</th>
              <th className="border-b border-line px-3 py-2">Telegram image</th>
              <th className="border-b border-line px-3 py-2">Status</th>
              <th className="border-b border-line px-3 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${title}-${item.channelId}`} className="text-slate-300">
                <td className="border-b border-line/60 px-3 py-2 text-cyan-100">{new Date(item.plannedAt).toLocaleTimeString()}</td>
                <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{displayChannel(item.channelId, item.channelName)}</td>
                <td className="border-b border-line/60 px-3 py-2 font-mono">{item.telegramTarget || "target missing"}</td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div className="font-mono text-[11px]">{item.selectedPost ?? "none"}</div>
                  <div className="mt-1 max-w-[280px] truncate text-slate-500">{displayText(item.selectedPostTitle ?? (showGenerateHint ? "needs generation" : "no ready post"), item.selectedPost ?? "no ready post")}</div>
                </td>
                <td className="border-b border-line/60 px-3 py-2">{item.textQuality}</td>
                <td className="border-b border-line/60 px-3 py-2">{item.bodyLength}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.telegramCaptionStatus === "OK" ? "text-emerald-100" : "text-rose-100")}>
                  {item.telegramCaptionStatus} / {item.telegramCaptionLength}
                </td>
                <td className="border-b border-line/60 px-3 py-2">{item.imageQuality}</td>
                <td className="border-b border-line/60 px-3 py-2">{item.telegramImageStatus}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.status === "scheduled" || item.status === "published" ? "text-emerald-100" : "text-amber-100")}>{item.status}</td>
                <td className="border-b border-line/60 px-3 py-2 text-slate-400">{item.blockerReason ?? "none"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QueueTable({ queue }: { queue: AutopublishStatus["queue"] }) {
  return (
    <div className="rounded-lg border border-line bg-slate-950/60 p-4">
      <p className="font-semibold text-white">Ready post queue</p>
      <div className="mt-3 max-h-80 overflow-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="border-b border-line px-3 py-2">Channel</th>
              <th className="border-b border-line px-3 py-2">Next post</th>
              <th className="border-b border-line px-3 py-2">Telegram</th>
              <th className="border-b border-line px-3 py-2">Caption</th>
              <th className="border-b border-line px-3 py-2">Mojibake</th>
              <th className="border-b border-line px-3 py-2">Real ready</th>
              <th className="border-b border-line px-3 py-2">Image</th>
              <th className="border-b border-line px-3 py-2">Status</th>
              <th className="border-b border-line px-3 py-2">Blocker</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item) => (
              <tr key={item.channelId} className="text-slate-300">
                <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{displayChannel(item.channelId, item.channelName)}</td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div className="font-mono text-[11px]">{item.selectedPost ?? "none"}</div>
                  <div className="mt-1 max-w-[260px] truncate text-slate-500">{displayText(item.selectedPostTitle ?? "no ready post", item.selectedPost ?? "no ready post")}</div>
                </td>
                <td className="border-b border-line/60 px-3 py-2 font-mono">{item.telegramTarget || "target missing"}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.telegramCaptionStatus === "OK" ? "text-emerald-100" : "text-rose-100")}>
                  {item.telegramCaptionStatus} / {item.telegramCaptionLength}
                </td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.mojibakeStatus === "TEXT OK" ? "text-emerald-100" : "text-rose-100")}>{item.mojibakeStatus}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.realReadyStatus === "READY" ? "text-emerald-100" : "text-rose-100")}>{item.realReadyStatus}</td>
                <td className="border-b border-line/60 px-3 py-2">{item.telegramImageStatus}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.status === "ready_to_publish" ? "text-emerald-100" : "text-amber-100")}>{item.status}</td>
                <td className="border-b border-line/60 px-3 py-2 text-slate-400">{item.blockerReason ?? "none"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LogPanel({
  log,
  logFilter,
  setLogFilter,
  onRefresh,
}: {
  log: AutopublishLogEntry[];
  logFilter: LogFilter;
  setLogFilter: (filter: LogFilter) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-lg border border-line bg-slate-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-white">Publication log</p>
        <div className="flex items-center gap-2">
          <select value={logFilter} onChange={(event) => setLogFilter(event.target.value as LogFilter)} className="h-8 rounded-md border border-line bg-slate-950 px-2 text-xs text-slate-200">
            <option value="all">all</option>
            <option value="today">today</option>
            <option value="success">success</option>
            <option value="failed">failed</option>
            <option value="blocked">blocked</option>
            <option value="skipped">skipped</option>
            <option value="already_published">already_published</option>
          </select>
          <button type="button" onClick={onRefresh} className="h-8 rounded-md border border-line px-2 text-xs text-slate-200">
            Refresh log
          </button>
        </div>
      </div>
      <div className="mt-3 max-h-80 overflow-auto">
        {log.length ? (
          <div className="grid gap-2">
            {log.map((entry) => (
              <div key={entry.id} className="rounded-md border border-line bg-slate-900/70 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-100">{displayChannel(entry.channelId, entry.channelName)}</p>
                  <span className={cn(entry.result === "success" ? "text-emerald-100" : entry.result === "failed" ? "text-rose-100" : "text-amber-100")}>{entry.result}</span>
                </div>
                <p className="mt-1 text-slate-500">{new Date(entry.attemptedAt).toLocaleString()} / {entry.mode}</p>
                <p className="mt-1 truncate text-slate-400">{displayText(entry.title ?? entry.error ?? "config event", entry.postId ?? "config event")}</p>
                {entry.telegramMessageId ? <p className="mt-1 font-mono text-cyan-100">message_id: {entry.telegramMessageId}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Log is empty.</p>
        )}
      </div>
    </div>
  );
}

function TodayLog({ log, onRefresh }: { log: AutopublishLogEntry[]; onRefresh: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-line bg-slate-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-white">Today log</p>
        <button type="button" onClick={onRefresh} className="h-8 rounded-md border border-line px-2 text-xs text-slate-200">
          Refresh log
        </button>
      </div>
      <div className="mt-3 max-h-72 overflow-auto">
        <table className="w-full min-w-[820px] text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="border-b border-line px-3 py-2">attemptedAt</th>
              <th className="border-b border-line px-3 py-2">channelName</th>
              <th className="border-b border-line px-3 py-2">postTitle</th>
              <th className="border-b border-line px-3 py-2">result</th>
              <th className="border-b border-line px-3 py-2">message_id</th>
              <th className="border-b border-line px-3 py-2">error</th>
              <th className="border-b border-line px-3 py-2">mode</th>
            </tr>
          </thead>
          <tbody>
            {log.map((entry) => (
              <tr key={entry.id} className="text-slate-300">
                <td className="border-b border-line/60 px-3 py-2">{new Date(entry.attemptedAt).toLocaleTimeString()}</td>
                <td className="border-b border-line/60 px-3 py-2">{displayChannel(entry.channelId, entry.channelName)}</td>
                <td className="border-b border-line/60 px-3 py-2">{displayText(entry.title ?? "config event", entry.postId ?? "config event")}</td>
                <td className="border-b border-line/60 px-3 py-2">{entry.result}</td>
                <td className="border-b border-line/60 px-3 py-2 font-mono">{entry.telegramMessageId ?? "-"}</td>
                <td className="border-b border-line/60 px-3 py-2 text-slate-400">{entry.error ?? "-"}</td>
                <td className="border-b border-line/60 px-3 py-2">{entry.mode}</td>
              </tr>
            ))}
            {!log.length ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-slate-400">
                  No records today.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const mojibakePattern = new RegExp(["\\u0420[\\u00A0-\\u00BF\\u0402-\\u040F\\u0452-\\u045F\\u2018-\\u201F]", "\\u0421[\\u00A0-\\u00BF\\u0402-\\u040F\\u0452-\\u045F\\u2018-\\u201F]", "\\u0432\\u0402", "[\\u00D0\\u00D1\\uFFFD]"].join("|"));

function hasMojibakeText(value: string) {
  return mojibakePattern.test(value);
}

function displayText(value: string | null | undefined, fallback = "legacy text hidden") {
  const next = String(value ?? "");
  if (!next) return fallback;
  return hasMojibakeText(next) ? fallback : next;
}

function displayChannel(channelId: string | null | undefined, value: string | null | undefined) {
  if (channelId) return getCanonicalChannelTitle(channelId, displayText(value, channelId));
  return displayText(value, "system");
}

function ActionButton({
  children,
  icon,
  busy,
  tone = "secondary",
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  busy: boolean;
  tone?: "primary" | "secondary" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        tone === "primary" && "bg-violet-300 text-slate-950 hover:bg-violet-200",
        tone === "secondary" && "border border-violet-300/40 text-violet-100 hover:bg-violet-300/10",
        tone === "danger" && "border border-rose-300/40 text-rose-100 hover:bg-rose-300/10",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function Metric({ label, value, tone = "dry" }: { label: string; value: string | number; tone?: "ok" | "warn" | "error" | "dry" }) {
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
