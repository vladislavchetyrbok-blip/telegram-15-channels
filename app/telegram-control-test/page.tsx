import { TelegramControlTestPanel } from "@/components/TelegramControlTestPanel";

export default function TelegramControlTestPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Telegram control test</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Контрольный тест Telegram</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Финальный dry-run сценарий перед будущим первым ручным single-channel тестом: один канал,
          одно сообщение, safety validation и ноль реальных отправок.
        </p>
      </div>

      <TelegramControlTestPanel />
    </div>
  );
}
