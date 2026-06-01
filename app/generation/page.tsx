import { ChannelGenerationPanel } from "@/components/ChannelGenerationPanel";

export default function GenerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">AI dry-run lab</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Генерация постов</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Генерация использует LM Studio локально и не отправляет сообщения в Telegram. Все результаты остаются в интерфейсе как preview.
        </p>
      </div>

      <ChannelGenerationPanel />
    </div>
  );
}
