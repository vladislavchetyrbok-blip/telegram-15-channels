import { CalendarDays } from "lucide-react";

export default function ContentCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">MVP Mode</p>
        <h2 className="mt-2 text-3xl font-semibold text-white flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-cyan-400" />
          Календарь
        </h2>
        <div className="mt-6 rounded-lg border border-line bg-panel/82 p-6 shadow-glow max-w-2xl">
          <p className="text-sm leading-6 text-slate-300">
            Раздел «Календарь» работает в MVP-режиме.
            Здесь вы сможете визуально планировать расписание выхода постов на неделю и месяц.
          </p>
        </div>
      </div>
    </div>
  );
}
