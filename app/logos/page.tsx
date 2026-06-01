import { ChannelLogosPanel } from "@/components/ChannelLogosPanel";

export default function LogosPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Logo governance</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Логотипы каналов</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Загрузка, привязка и ручная проверка логотипов для всех 15 Telegram-каналов. Telegram остаётся в
          dry-run/mock режиме.
        </p>
      </div>

      <ChannelLogosPanel />
    </div>
  );
}
