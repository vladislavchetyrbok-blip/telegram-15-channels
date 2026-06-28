import type { MysticTarotSpread } from "@/lib/zodiac-mystic-content";

interface TarotSpreadVisualProps {
  publicMode: boolean;
  spread: MysticTarotSpread;
}

const arcanaMarks = ["☉", "☽", "✦", "◇", "✧"];

export function TarotSpreadVisual({ publicMode, spread }: TarotSpreadVisualProps) {
  return (
    <div
      className={
        publicMode
          ? "overflow-hidden rounded-xl border border-amber-200/20 bg-gradient-to-br from-slate-950 via-indigo-950/75 to-fuchsia-950/50 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
          : "overflow-hidden rounded-xl border border-amber-100 bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.22)]"
      }
      data-tarot-spread-visual="true"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Расклад Таро</p>
          <h4 className="mt-1 text-base font-semibold text-white">{spread.spreadLabel} · {spread.topicLabel}</h4>
        </div>
        <div className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">
          {spread.honesty}
        </div>
      </div>

      <div className={`mt-3 grid gap-2 ${spread.cards.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
        {spread.cards.map((item, index) => (
          <article
            key={`${item.key}-${item.position}`}
            className="relative min-h-[172px] overflow-hidden rounded-xl border border-white/12 bg-white/[0.06] p-2.5"
            data-tarot-card={item.key}
            data-tarot-position={item.position}
          >
            <div className="absolute inset-x-4 top-4 h-24 rounded-full bg-amber-200/10 blur-2xl" />
            <div className="relative mx-auto flex h-24 w-20 flex-col items-center justify-between rounded-[16px] border border-amber-100/35 bg-gradient-to-b from-amber-100/20 via-white/8 to-indigo-900/30 p-2.5 text-center shadow-inner">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-3xl text-amber-50">{arcanaMarks[index % arcanaMarks.length]}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-100">аркан</span>
            </div>
            <div className="relative mt-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-100">{item.position}</p>
              <h5 className="mt-1 text-sm font-semibold leading-5 text-white">{item.card.card}</h5>
              <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-300">{item.card.mainMeaning}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3" data-tarot-legend="true">
        {spread.cards.map((item) => (
          <div key={`legend-${item.key}`} className="rounded-lg border border-white/10 bg-black/20 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100">{item.position}</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">{item.shortMeaning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
