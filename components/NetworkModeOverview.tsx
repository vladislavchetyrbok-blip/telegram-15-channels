import { PauseCircle, RadioTower, Sparkles } from "lucide-react";
import {
  legacyNetwork,
  networkMode,
  zodiacChannels,
  zodiacNetwork,
} from "@/data/zodiacNetwork";

export function NetworkModeOverview() {
  const telegramBindingsEmpty = zodiacChannels.every(
    (channel) => channel.telegramUsername === null && channel.telegramChannelId === null,
  );

  return (
    <section className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Network mode</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Zodiac Network Phase 1</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{networkMode.note}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-sm font-semibold text-violet-100">
          <Sparkles className="h-4 w-4" />
          active mode: {networkMode.active}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-amber-300/25 bg-amber-300/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
            <PauseCircle className="h-4 w-4" />
            Legacy network: paused
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-100/80">
            {legacyNetwork.channelCount} mixed-topic channels are preserved, recoverable, and marked as paused for generation and publishing.
          </p>
        </div>

        <div className="rounded-md border border-cyan-300/25 bg-cyan-300/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
            <RadioTower className="h-4 w-4" />
            Zodiac network: planned experiment
          </div>
          <p className="mt-2 text-sm leading-6 text-cyan-100/80">
            {zodiacNetwork.channelCount} planned channels: {zodiacNetwork.plannedGeneralChannels} general and {zodiacNetwork.plannedSignChannels} sign channels.
            Telegram bindings: {telegramBindingsEmpty ? "0/13 configured" : `${zodiacNetwork.telegramBindingsReady}/13 configured`}.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {zodiacChannels.map((channel) => (
          <div key={channel.id} className="rounded-md border border-line bg-black/20 px-3 py-2">
            <p className="truncate text-sm font-semibold text-white">
              {channel.emoji} {channel.ruName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {channel.id} · {channel.status}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
