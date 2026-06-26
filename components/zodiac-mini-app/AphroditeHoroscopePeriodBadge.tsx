import type { AphroditeHoroscopePeriodType } from "@/lib/zodiac/aphrodite-horoscope-visual-cards";

const periodLabels: Record<AphroditeHoroscopePeriodType, string> = {
  daily: "День",
  weekly: "Неделя",
  monthly: "Месяц",
};

const toneClasses: Record<AphroditeHoroscopePeriodType, string> = {
  daily: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  weekly: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
  monthly: "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-100",
};

export function AphroditeHoroscopePeriodBadge({
  periodType,
  periodLabel,
}: {
  periodType: AphroditeHoroscopePeriodType;
  periodLabel: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase ${toneClasses[periodType]}`}
      data-aphrodite-horoscope-period={periodType}
    >
      <span>{periodLabels[periodType]}</span>
      <span className="h-1 w-1 rounded-full bg-current opacity-60" />
      <span className="normal-case">{periodLabel}</span>
    </span>
  );
}
