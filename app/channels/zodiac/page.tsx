import { NetworkModeOverview } from "@/components/NetworkModeOverview";
import { zodiacChannels } from "@/data/zodiacNetwork";
import { getZodiacConnectionProgress } from "@/data/zodiacChannelConnections";
import Link from "next/link";
import { RadioTower, Settings2, Image as ImageIcon } from "lucide-react";

export default function ZodiacChannelsPage() {
  const connectionProgress = getZodiacConnectionProgress();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Zodiac Network</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Сеть Гороскопов</h2>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="rounded-md border border-line bg-panel px-3 py-2 text-slate-300">
            Каналов: {zodiacChannels.length}
          </span>
          <span className="rounded-md border border-line bg-panel px-3 py-2 text-slate-300">
            Готово: {connectionProgress.publishReady}/{connectionProgress.total}
          </span>
        </div>
      </div>

      <NetworkModeOverview />

      <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Zodiac Readiness</p>
            <p className="mt-2 text-sm text-slate-400">
              Статус подготовки Telegram каналов и визуальных ассетов для новой сети.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <Metric label="total" value={connectionProgress.total} />
            <Metric label="created" value={connectionProgress.created} />
            <Metric label="bot added" value={connectionProgress.botAdminAdded} />
            <Metric label="publish ready" value={connectionProgress.publishReady} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {zodiacChannels.map((channel) => (
          <Link
            key={channel.id}
            href={`/channels/zodiac/${channel.id}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-panel p-5 transition hover:border-cyan-500/50 hover:shadow-glow"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{channel.emoji}</span>
                  <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {channel.ruName}
                  </h3>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
                  {channel.shortDescription}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge icon={Settings2} text={channel.status === "planned" ? "Запланирован" : channel.status} />
              <Badge icon={RadioTower} text={channel.type} />
              <Badge icon={ImageIcon} text={channel.element} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-slate-950/40 px-3 py-2 text-right">
      <p className="font-semibold text-white">{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}

function Badge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded bg-white/5 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}
