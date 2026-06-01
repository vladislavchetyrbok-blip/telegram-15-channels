import { TelegramSafetyPanel } from "@/components/TelegramSafetyPanel";

export default function TelegramSafetyPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Telegram safety</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Безопасность Telegram</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Safety gate перед будущей production-отправкой. Сейчас реальные публикации заблокированы, active mode:
          dry-run.
        </p>
      </div>

      <TelegramSafetyPanel />
    </div>
  );
}
