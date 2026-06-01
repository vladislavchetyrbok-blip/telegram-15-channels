import { CalendarView } from "@/components/CalendarView";
import { PublicationSchedulePanel } from "@/components/PublicationSchedulePanel";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Publication calendar</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Календарь публикаций</h2>
      </div>
      <PublicationSchedulePanel />
      <CalendarView />
    </div>
  );
}
