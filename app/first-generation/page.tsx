import { FirstBatchGenerationPanel } from "@/components/FirstBatchGenerationPanel";

export default function FirstGenerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">safe first batch</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Первая генерация</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Один черновик для каждого из 15 каналов через LM Studio. Все результаты остаются в редакционной очереди,
          Telegram не вызывается, массовая отправка и автопостинг отключены.
        </p>
      </div>

      <FirstBatchGenerationPanel />
    </div>
  );
}
