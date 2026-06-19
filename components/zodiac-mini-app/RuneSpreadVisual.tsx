import type { MysticRuneSpread } from "@/lib/zodiac-mystic-content";

interface RuneSpreadVisualProps {
  publicMode: boolean;
  spread: MysticRuneSpread;
}

export function RuneSpreadVisual({ publicMode, spread }: RuneSpreadVisualProps) {
  return (
    <div
      className={
        publicMode
          ? "overflow-hidden rounded-xl border border-cyan-200/20 bg-gradient-to-br from-slate-950 via-cyan-950/60 to-emerald-950/45 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.32)]"
          : "overflow-hidden rounded-xl border border-cyan-100 bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.2)]"
      }
      data-rune-spread-visual="true"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Rune spread</p>
          <h4 className="mt-1 text-base font-semibold text-white">{spread.modeLabel}</h4>
        </div>
        <div className="rounded-full border border-cyan-200/30 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50">
          {spread.honesty}
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${spread.runes.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
        {spread.runes.map((item) => (
          <article
            key={`${item.key}-${item.position}`}
            className="relative min-h-[190px] overflow-hidden rounded-xl border border-white/12 bg-white/[0.06] p-3"
            data-rune-card={item.key}
            data-rune-position={item.position}
          >
            <div className="absolute inset-x-6 top-6 h-20 rounded-full bg-cyan-200/12 blur-2xl" />
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-cyan-100/35 bg-gradient-to-b from-cyan-100/18 via-white/8 to-emerald-900/28 shadow-inner">
              <span className={`text-6xl leading-none text-cyan-50 ${item.orientation === "reversed" ? "rotate-180" : ""}`}>{item.rune.symbol}</span>
            </div>
            <div className="relative mt-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">{item.position}</p>
              <h5 className="mt-1 text-sm font-semibold leading-5 text-white">{item.rune.name}</h5>
              <span className="mt-2 inline-flex rounded-full border border-white/12 bg-black/20 px-2 py-1 text-[11px] font-semibold text-cyan-100">
                {item.orientation === "upright" ? "прямое значение" : "перевернутое значение"}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3" data-rune-legend="true">
        {spread.runes.map((item) => (
          <div key={`legend-${item.key}`} className="rounded-lg border border-white/10 bg-black/20 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-100">{item.position}</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">{item.rune.mainMeaning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
