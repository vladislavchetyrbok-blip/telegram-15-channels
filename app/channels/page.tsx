import { ChannelCard } from "@/components/ChannelCard";
import { TelegramDryRunTester } from "@/components/TelegramDryRunTester";
import { channels, groupAChannels, groupBChannels } from "@/data/channels";
import { checkTelegramChannelsConnection } from "@/lib/telegram";

export default function ChannelsPage() {
  const telegramCheck = checkTelegramChannelsConnection();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Channels registry</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">15 каналов Telegram-сетки</h2>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="rounded-md border border-line bg-panel px-3 py-2 text-slate-300">A: {groupAChannels.length}</span>
          <span className="rounded-md border border-line bg-panel px-3 py-2 text-slate-300">B: {groupBChannels.length}</span>
        </div>
      </div>

      <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Telegram dry-run check</p>
            <p className="mt-2 text-sm text-slate-400">
              Все проверки безопасные: chat_id валидируется локально, реальные сообщения не отправляются.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <Metric label="channels" value={telegramCheck.total} />
            <Metric label="mock ready" value={telegramCheck.connectedMock} />
            <Metric label="missing token" value={telegramCheck.missingToken} />
            <Metric label="missing chat_id" value={telegramCheck.missingChatId} />
          </div>
        </div>
      </section>

      <TelegramDryRunTester />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
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
