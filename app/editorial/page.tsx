import { EditorialProfilesPanel } from "@/components/EditorialProfilesPanel";

export default function EditorialPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Channel quality system</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Редакционные правила</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Уникальные профили для 15 каналов: тон, аудитория, запреты, форматирование и проверка качества
          перед сохранением черновиков.
        </p>
      </div>

      <EditorialProfilesPanel />
    </div>
  );
}
