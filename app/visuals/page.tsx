import { VisualAssetsPanel } from "@/components/VisualAssetsPanel";
import { VisualPreviewPanel } from "@/components/VisualPreviewPanel";

export default function VisualsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Asset governance</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Визуалы каналов</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Ручной visual audit для логотипов, иконок и preview-ассетов 15 Telegram-каналов. Реальная отправка
          Telegram заблокирована dry-run режимом.
        </p>
      </div>

      <VisualAssetsPanel />
      <VisualPreviewPanel />
    </div>
  );
}
