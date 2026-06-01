import { PostDraftQueuePanel } from "@/components/PostDraftQueuePanel";

export default function DraftsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Editorial dry-run queue</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Очередь постов</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Черновики для 15 Telegram-каналов проходят через редакционную очередь: генерация, предпросмотр, одобрение, отклонение,
          перегенерация и планирование. Telegram остаётся в dry-run/mock режиме.
        </p>
      </div>

      <PostDraftQueuePanel />
    </div>
  );
}
