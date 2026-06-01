import { SingleChannelTestPanel } from "@/components/SingleChannelTestPanel";

export default function SingleChannelTestPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Single-channel test</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Тестовая отправка в один канал</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Ручной isolated flow для будущей тестовой отправки в один выбранный канал. Сейчас dry-run активен,
          realSendingEnabled=false, поэтому Telegram sendMessage не вызывается.
        </p>
      </div>

      <SingleChannelTestPanel />
    </div>
  );
}
