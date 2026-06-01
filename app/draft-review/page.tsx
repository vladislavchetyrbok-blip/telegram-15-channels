import { DraftReviewPanel } from "@/components/DraftReviewPanel";

export default function DraftReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">editorial review</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Проверка черновиков</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Ручная редакционная проверка первой партии: качество, правила канала, валютная политика и действия с
          черновиками без публикации в Telegram.
        </p>
      </div>

      <DraftReviewPanel />
    </div>
  );
}
