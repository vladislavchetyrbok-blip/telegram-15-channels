import { ContentCalendarPanel } from "@/components/ContentCalendarPanel";

export default function ContentCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Calendar queue</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Контент-календарь</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          План публикаций на 7 дней: 105 строк, preview по id, регенерация и одиночная ручная публикация без массового запуска.
        </p>
      </div>
      <ContentCalendarPanel />
    </div>
  );
}
