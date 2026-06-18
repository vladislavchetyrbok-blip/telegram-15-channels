import { CalendarDays } from "lucide-react";
import type { DayEnergy } from "./types";
import { SectionHeader, panelClass } from "./ui-primitives";

export function EnergyCard({ publicMode, energy }: { publicMode: boolean; energy: DayEnergy }) {
  return (
    <div className={publicMode ? "rounded-lg border border-indigo-200/15 bg-indigo-200/10 p-3 text-slate-100" : "rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-slate-700"}>
      <p className={publicMode ? "text-sm font-semibold text-indigo-100" : "text-sm font-semibold text-indigo-800"}>🌙 Энергия дня: {energy.type}</p>
      <div className="mt-2 grid gap-2 text-sm leading-5">
        <p><span className="font-semibold">Лучше для:</span> {energy.bestFor}</p>
        <p><span className="font-semibold">Тон:</span> {energy.relationshipTone}</p>
        <p><span className="font-semibold">Избегать:</span> {energy.avoid}</p>
      </div>
    </div>
  );
}

export function DateLoadingSection({ publicMode, title }: { publicMode: boolean; title: string }) {
  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<CalendarDays className="h-5 w-5" />} title={title} subtitle="Обновляем дату" />
      <div className="mt-5 h-28 animate-pulse rounded-lg border border-white/12 bg-white/8" />
    </section>
  );
}
