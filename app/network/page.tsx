import { NetworkControlPanel } from "@/components/NetworkControlPanel";

export default function NetworkPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Network analytics</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Пульт сети</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Единая панель управления 15 Telegram-каналами: здоровье LM Studio, Telegram dry-run, очередь
          черновиков, расписание, контент-план и редакционные профили.
        </p>
      </div>

      <NetworkControlPanel />
    </div>
  );
}
