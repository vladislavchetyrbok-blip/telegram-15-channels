"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  CalendarDays,
  CheckCircle2,
  FilePlus2,
  Gauge,
  Lightbulb,
  Loader2,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { localAi } from "@/data/system";
import { cn } from "@/lib/utils";
import type { ChannelAnalytics, NetworkAnalytics, NetworkHealth } from "@/types";

interface AnalyticsPayload {
  ok: boolean;
  analytics: NetworkAnalytics;
}

interface ChannelAnalyticsPayload {
  ok: boolean;
  channels: ChannelAnalytics[];
}

type QuickAction = "telegram" | "ai" | "idea" | "draft" | "dry-run" | "check-all";

export function NetworkControlPanel() {
  const [analytics, setAnalytics] = useState<NetworkAnalytics | null>(null);
  const [channels, setChannels] = useState<ChannelAnalytics[]>([]);
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState(channelGenerationConfigs[0]?.id ?? "");
  const [busyAction, setBusyAction] = useState<QuickAction | null>(null);
  const [message, setMessage] = useState("Dry-run режим: реальные публикации отключены.");

  const selectedChannel = useMemo(
    () => channelGenerationConfigs.find((channel) => channel.id === selectedChannelId) ?? channelGenerationConfigs[0],
    [selectedChannelId],
  );

  const loadState = useCallback(async () => {
    const [analyticsResponse, channelsResponse, healthResponse] = await Promise.all([
      fetch("/api/network/analytics", { cache: "no-store" }),
      fetch("/api/network/channel-analytics", { cache: "no-store" }),
      fetch("/api/network/health", { cache: "no-store" }),
    ]);
    const analyticsPayload = (await analyticsResponse.json()) as AnalyticsPayload;
    const channelsPayload = (await channelsResponse.json()) as ChannelAnalyticsPayload;
    const healthPayload = (await healthResponse.json()) as NetworkHealth;

    setAnalytics(analyticsPayload.analytics);
    setChannels(channelsPayload.channels);
    setHealth(healthPayload);
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  async function runQuickAction(action: QuickAction) {
    if (!selectedChannel) {
      return;
    }

    try {
      setBusyAction(action);

      if (action === "telegram") {
        const response = await fetch("/api/telegram/check-config", { cache: "no-store" });
        const payload = await response.json();
        setMessage(`Telegram config: ${payload.ok ? "ok" : "requires setup"}. Dry-run: ${String(payload.dryRun)}.`);
      }

      if (action === "ai") {
        const response = await fetch(`${localAi.apiUrl}/models`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("LM Studio server is not available");
        }

        const payload = (await response.json()) as { data?: Array<{ id?: string }> };
        const models = payload.data?.map((model) => model.id).filter(Boolean) as string[] | undefined;
        setMessage(`LM Studio connected: ${models?.join(", ") || "model available"}`);
      }

      if (action === "idea") {
        const response = await fetch("/api/content-plan/generate-day", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId: selectedChannel.id }),
        });
        const payload = await response.json();
        setMessage(payload.ok ? `Идея создана для канала: ${selectedChannel.name}. Telegram не трогали.` : payload.error);
      }

      if (action === "draft") {
        const response = await fetch("/api/posts/generate-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId: selectedChannel.id }),
        });
        const payload = await response.json();
        setMessage(payload.draft ? `Черновик создан: ${payload.draft.id}. Реальной отправки нет.` : payload.error);
      }

      if (action === "dry-run") {
        if (selectedChannel.status === "paused_legacy") {
          setMessage("Legacy network is paused. AI dry-run generation is blocked for old mixed-topic channels.");
          return;
        }

        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelName: selectedChannel.name,
            language: selectedChannel.language,
            topic: selectedChannel.topic,
            mode: "local",
          }),
        });
        const payload = await response.json();
        setMessage(
          payload.ok
            ? `AI -> dry-run готов. telegramSent=false. model=${payload.model ?? "n/a"}.`
            : payload.error ?? "AI dry-run не выполнен.",
        );
      }

      if (action === "check-all") {
        const response = await fetch("/api/network/check-all", { method: "POST" });
        const payload = await response.json();
        setMessage(payload.ok ? "Полная проверка сети: ok, режим dry-run." : `Проверка сети требует внимания: ${payload.warnings?.join("; ")}`);
      }

      await loadState();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Действие не выполнено.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Network command center</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Пульт сети</h3>
            <p className="mt-2 text-sm text-slate-400">
              Dry-run режим: реальные публикации отключены. Аналитика считается по черновикам, расписанию,
              контент-плану, редакционным правилам и dry-run событиям.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 xl:grid-cols-6">
            <Metric label="каналов" value={analytics?.channelsTotal ?? 15} />
            <Metric label="черновиков" value={analytics?.draftsTotal ?? 0} />
            <Metric label="запланировано" value={analytics?.scheduledTotal ?? 0} />
            <Metric label="идей" value={analytics?.contentPlanItemsTotal ?? 0} />
            <Metric label="dry-run" value={analytics?.dryRunSentTotal ?? 0} />
            <Metric label="Real sends total" value={analytics?.realTelegramSentTotal ?? 0} tone="dry" />
            <Metric label="logos uploaded" value={analytics?.logosUploaded ?? 0} />
            <Metric label="logos approved" value={analytics?.logosApproved ?? 0} />
            <Metric label="logos review" value={analytics?.logosNeedReview ?? 0} tone="dry" />
            <Metric label="logos rejected" value={analytics?.logosRejected ?? 0} tone="dry" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Общий статус</h3>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <HealthRow label="Telegram" value="dry-run" state="dry" />
              <HealthRow label="Production broadcast" value={analytics?.productionBroadcast ?? "disabled"} state="warn" />
              <HealthRow label="Dry-run" value={analytics?.dryRunActive ? "active" : "check env"} state={analytics?.dryRunActive ? "dry" : "warn"} />
              <HealthRow label="Last real send" value={analytics?.lastRealSendChannelTitle ?? "none"} state="dry" />
              <HealthRow label="LM Studio" value={health?.ai.connected ? "connected" : "requires check"} state={health?.ai.connected ? "ok" : "warn"} />
              <HealthRow label="Bot token" value={health?.telegram.tokenPresent ? "configured" : "missing"} state={health?.telegram.tokenPresent ? "ok" : "warn"} />
              <HealthRow label="chat_id" value={`${health?.telegram.channelsWithChatId ?? 0}/15`} state={(health?.telegram.channelsWithChatId ?? 0) === 15 ? "ok" : "error"} />
              <HealthRow label="Editorial profiles" value={`${analytics?.editorialProfilesTotal ?? 0}/15`} state={(analytics?.editorialProfilesTotal ?? 0) === 15 ? "ok" : "warn"} />
              <HealthRow label="Real Telegram sent" value={String(analytics?.realTelegramSentTotal ?? 0)} state="dry" />
            </div>
            {health?.warnings.length ? (
              <div className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
                {health.warnings.join(" ")}
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-emerald-300/25 bg-emerald-300/10 p-3 text-xs text-emerald-100">
                Сеть готова к локальной работе. Telegram заблокирован dry-run режимом.
              </div>
            )}
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Быстрые действия</h3>
            </div>
            <select
              value={selectedChannelId}
              onChange={(event) => setSelectedChannelId(event.target.value)}
              className="mt-4 h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
            >
              {channelGenerationConfigs.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <ActionButton icon={ShieldCheck} label="Проверить Telegram config" busy={busyAction === "telegram"} onClick={() => runQuickAction("telegram")} />
              <ActionButton icon={Bot} label="Проверить LM Studio" busy={busyAction === "ai"} onClick={() => runQuickAction("ai")} />
              <ActionButton icon={Lightbulb} label="Сгенерировать идею" busy={busyAction === "idea"} onClick={() => runQuickAction("idea")} />
              <ActionButton icon={FilePlus2} label="Сгенерировать черновик" busy={busyAction === "draft"} onClick={() => runQuickAction("draft")} />
              <ActionButton icon={Wand2} label="AI -> Dry-run" busy={busyAction === "dry-run"} onClick={() => runQuickAction("dry-run")} />
              <ActionButton icon={RefreshCw} label="Проверить всё" busy={busyAction === "check-all"} onClick={() => runQuickAction("check-all")} />
            </div>
            <p className="mt-3 rounded-md border border-line bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">{message}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              <QuickLink href="/drafts" label="Открыть очередь" />
              <QuickLink href="/calendar" label="Открыть календарь" />
              <QuickLink href="/editorial" label="Открыть редакционные правила" />
              <QuickLink href="/production-send" label="Боевой запуск" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <RadioTower className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">15 каналов</h3>
            </div>
            <span className="rounded-full border border-slate-600 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300">
              dry-run / mock
            </span>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {channels.map((channel) => (
              <ChannelCard key={channel.channelId} channel={channel} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, tone = "ok" }: { label: string; value: number; tone?: "ok" | "dry" }) {
  return (
    <div className={cn("rounded-md border px-3 py-2 text-right", tone === "dry" ? "border-slate-600 bg-slate-800/50" : "border-cyan-300/15 bg-cyan-300/5")}>
      <p className="font-semibold text-white">{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}

function HealthRow({ label, value, state }: { label: string; value: string; state: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="inline-flex items-center gap-2 font-medium text-slate-100">
        <StatusDot state={state} />
        {value}
      </span>
    </div>
  );
}

function ChannelCard({ channel }: { channel: ChannelAnalytics }) {
  return (
    <div className="rounded-lg border border-line bg-slate-950/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="line-clamp-1 text-sm font-semibold text-white">{channel.channelTitle}</p>
          <p className="mt-1 text-xs text-slate-500">
            {channel.language} · {channel.telegramChatId}
          </p>
        </div>
        <StatusDot state={channel.status === "connected_mock" ? "ok" : "warn"} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <MiniStat label="drafts" value={channel.draftsTotal} />
        <MiniStat label="approved" value={channel.approvedDrafts} />
        <MiniStat label="schedule" value={channel.scheduledPosts} />
        <MiniStat label="dry-run" value={channel.dryRunSent} />
        <MiniStat label="ideas" value={channel.contentIdeas} />
        <MiniStat label="quality" value={channel.qualityScoreMock} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>failed: {channel.failedGenerations}</span>
        <span>real sent: {channel.realTelegramSent}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-black/20 px-2 py-1.5 text-right">
      <p className="font-semibold text-slate-100">{value}</p>
      <p className="text-slate-600">{label}</p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  busy,
  onClick,
}: {
  icon: typeof CheckCircle2;
  label: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-slate-950/70 px-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/15"
    >
      {label}
    </Link>
  );
}

function StatusDot({ state }: { state: "ok" | "warn" | "error" | "dry" }) {
  return (
    <span
      className={cn(
        "h-2.5 w-2.5 shrink-0 rounded-full",
        state === "ok" && "bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.55)]",
        state === "warn" && "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.45)]",
        state === "error" && "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.45)]",
        state === "dry" && "bg-slate-500",
      )}
    />
  );
}
