import type { MysticLunarCalendarDay } from "@/lib/zodiac-mystic-content";

const energyLegend: Array<{ key: MysticLunarCalendarDay["energyKey"]; label: string; dot: string }> = [
  { key: "growth", label: "рост", dot: "bg-emerald-300" },
  { key: "cleansing", label: "очищение", dot: "bg-cyan-300" },
  { key: "love", label: "любовь", dot: "bg-rose-300" },
  { key: "money", label: "деньги", dot: "bg-amber-300" },
  { key: "rest", label: "отдых", dot: "bg-slate-300" },
  { key: "intuition", label: "интуиция", dot: "bg-violet-300" },
];

const energyClasses: Record<MysticLunarCalendarDay["energyKey"], string> = {
  growth: "from-emerald-300/24 to-emerald-500/8 text-emerald-50 ring-emerald-200/25",
  cleansing: "from-cyan-300/24 to-cyan-500/8 text-cyan-50 ring-cyan-200/25",
  love: "from-rose-300/24 to-rose-500/8 text-rose-50 ring-rose-200/25",
  money: "from-amber-300/24 to-amber-500/8 text-amber-50 ring-amber-200/25",
  rest: "from-slate-300/18 to-slate-500/8 text-slate-50 ring-slate-200/20",
  intuition: "from-violet-300/24 to-indigo-500/8 text-violet-50 ring-violet-200/25",
};

export function LunarCalendarVisual({
  publicMode,
  days,
  selectedDateKey,
  onSelectDate,
}: {
  publicMode: boolean;
  days: MysticLunarCalendarDay[];
  selectedDateKey: string;
  onSelectDate?: (dateKey: string) => void;
}) {
  return (
    <div
      data-lunar-calendar-visual="true"
      className={
        publicMode
          ? "overflow-hidden rounded-2xl border border-violet-200/20 bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.22),transparent_36%),linear-gradient(145deg,rgba(15,23,42,0.98),rgba(30,27,75,0.78))] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.45)]"
          : "overflow-hidden rounded-2xl border border-violet-100 bg-[radial-gradient(circle_at_top_left,rgba(196,181,253,0.35),transparent_36%),linear-gradient(145deg,#ffffff,#f8fafc)] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-violet-100" : "text-xs font-semibold uppercase tracking-wide text-violet-700"}>
            символический лунный календарь
          </p>
          <h4 className={publicMode ? "mt-1 text-lg font-semibold text-white" : "mt-1 text-lg font-semibold text-slate-950"}>
            14 дней ритма
          </h4>
        </div>
        <span className={publicMode ? "rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-200" : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"}>
          выбрано {selectedDateKey}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5" data-lunar-calendar-grid="true">
        {days.map((day) => {
          const activeClass = day.isSelected
            ? publicMode
              ? "scale-[1.02] border-amber-200/70 bg-amber-200/18 shadow-[0_0_0_1px_rgba(253,230,138,0.36)]"
              : "scale-[1.02] border-amber-300 bg-amber-50 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
            : publicMode
              ? "border-white/10 bg-white/7"
              : "border-slate-200 bg-white";
          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDate?.(day.dateKey)}
              data-lunar-calendar-day={day.dateKey}
              data-lunar-selected={day.isSelected ? "true" : undefined}
              className={`min-h-[74px] min-w-0 rounded-xl border p-1.5 text-left transition ${activeClass}`}
            >
              <span className={publicMode ? "block truncate text-[10px] font-semibold text-slate-400" : "block truncate text-[10px] font-semibold text-slate-500"}>
                {day.weekdayLabel}
              </span>
              <span className={publicMode ? "mt-0.5 block text-xs font-bold text-white" : "mt-0.5 block text-xs font-bold text-slate-900"}>
                {day.dayLabel}
              </span>
              <span className={`mt-1 flex h-7 w-full items-center justify-center rounded-lg bg-gradient-to-br text-base ring-1 ${energyClasses[day.energyKey]}`}>
                {day.phaseSymbol}
              </span>
              <span className={publicMode ? "mt-1 block truncate text-[10px] text-slate-300" : "mt-1 block truncate text-[10px] text-slate-600"}>
                {day.isToday ? "сегодня" : day.energyLabel}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" data-lunar-calendar-legend="true">
        {energyLegend.map((item) => (
          <span key={item.key} className={publicMode ? "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-xs font-semibold text-slate-200" : "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"}>
            <span className={`h-2 w-2 rounded-full ${item.dot}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
