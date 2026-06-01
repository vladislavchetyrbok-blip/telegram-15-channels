import Link from "next/link";
import { ArrowUpRight, Radio, Send, Timer } from "lucide-react";
import { channels } from "@/data/channels";
import { getChannelGenerationConfig } from "@/data/channelGeneration";
import { channelRuntime, type ChannelRuntimeId } from "@/data/system";
import { checkTelegramChannelConnection, type TelegramChannelConnectionStatus } from "@/lib/telegram";
import type { Channel } from "@/types";
import { cn } from "@/lib/utils";
import { LanguageBadge } from "@/components/LanguageBadge";
import { ChannelLogoControl } from "@/components/ChannelLogoControl";
import { ChannelStatsControl } from "@/components/ChannelStatsControl";

export function ChannelCard({ channel }: { channel: Channel }) {
  const runtime = channelRuntime[channel.id as ChannelRuntimeId];
  const generationConfig = getChannelGenerationConfig(channel.id);
  const connection = generationConfig ? checkTelegramChannelConnection(generationConfig) : null;
  const telegramUsername = channel.telegramUsername ?? runtime?.username ?? `@${channel.id.replaceAll("-", "_")}`;
  const autoposting = channel.autoposting ?? runtime?.autoposting ?? "paused";
  const groupLabel = channel.group === "A" ? "Группа A: независимый канал" : "Группа B: недвижимость";

  return (
    <article className="group rounded-lg border border-line bg-panel/82 p-5 shadow-glow transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-panelSoft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <LanguageBadge language={channel.language} />
            <AutopostingBadge status={autoposting} />
            {connection && <ConnectionBadge status={connection.status} />}
            <span className="rounded border border-slate-500/20 bg-slate-500/10 px-2 py-1 text-[11px] text-slate-300">
              {channel.category}
            </span>
          </div>
          <h3 className="mt-4 text-lg font-semibold leading-snug text-white">{channel.name}</h3>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
            <Send className="h-4 w-4" />
            {telegramUsername}
          </p>
          {connection ? (
            <p className="mt-1 text-xs text-slate-500">
              chat_id: <span className="font-mono text-slate-300">{connection.telegramChatId}</span>
            </p>
          ) : null}
        </div>
        <Link href={`/channels/${channel.id}`} className="rounded-md border border-line bg-slate-950 p-2 text-slate-500 transition hover:border-cyan-300/40 hover:text-cyan-300">
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">{channel.description}</p>

      <div className="mt-4">
        <ChannelLogoControl channelId={channel.id} compact />
      </div>

      <div className="mt-4">
        <ChannelStatsControl channelId={channel.id} compact />
      </div>

      <div className="mt-4 rounded-md border border-line bg-black/15 p-3 text-sm">
        <Timer className="mb-2 h-4 w-4 text-blue-300" />
        <p className="font-semibold text-white">{channel.scheduledPosts}</p>
        <p className="text-xs text-slate-500">постов запланировано в mock/dry-run очереди</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-slate-500">
        <span>{groupLabel}</span>
        <span className="inline-flex items-center gap-1 text-slate-400">
          <Radio className="h-3 w-3" />
          статистика: unknown
        </span>
      </div>
    </article>
  );
}

function ConnectionBadge({ status }: { status: TelegramChannelConnectionStatus }) {
  const labels = {
    connected_mock: "connected mock",
    missing_token: "missing token",
    missing_chat_id: "missing chat_id",
  };

  const styles = {
    connected_mock: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
    missing_token: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    missing_chat_id: "border-rose-400/30 bg-rose-400/10 text-rose-100",
  };

  return <span className={cn("rounded border px-2 py-1 text-[11px] font-semibold", styles[status])}>{labels[status]}</span>;
}

function AutopostingBadge({ status }: { status: NonNullable<Channel["autoposting"]> }) {
  const labels = {
    on: "autoposting on",
    paused: "autoposting paused",
    off: "autoposting off",
  };

  const styles = {
    on: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    paused: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    off: "border-rose-400/30 bg-rose-400/10 text-rose-100",
  };

  return <span className={cn("rounded border px-2 py-1 text-[11px] font-semibold", styles[status])}>{labels[status]}</span>;
}

export function ChannelsSummaryStrip() {
  return (
    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Network pulse</p>
      <p className="mt-2 text-2xl font-semibold text-white">не синхронизировано</p>
      <p className="text-sm text-slate-400">суммарная аудитория не показывается без real/manual данных</p>
    </div>
  );
}
