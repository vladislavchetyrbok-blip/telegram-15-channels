import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { Activity, Calendar, Play, FileText, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ZODIAC_CHANNELS = [
  "Общий гороскоп", "Овен", "Телец", "Близнецы", "Рак", "Лев",
  "Дева", "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"
];

const PREVIEW_DAYS = [
  { label: "Сегодня", dayOffset: 0 },
  { label: "Завтра", dayOffset: 1 },
  { label: "День 3", dayOffset: 2 },
  { label: "День 4", dayOffset: 3 },
  { label: "День 5", dayOffset: 4 },
  { label: "День 6", dayOffset: 5 },
  { label: "День 7", dayOffset: 6 },
];

export default function ZodiacSoftLaunchPage() {
  const getFutureDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AphroditePageHeader
          title="Soft Launch Зодиака"
          description="Предпросмотр мягкого запуска: ближайшие дни, 13 каналов, dry-run, ledger, готовность и ручной контроль перед live."
          badgeText="Зодиак"
          icon={Play}
          safetyLocked={true}
          safetyMessage="Только чтение. Нет live API."
        />

        {/* 1. KPI cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Каналов</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">13</p>
          </div>
          <div className="rounded-lg border border-cyan-900/50 bg-cyan-900/10 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-500">Режим</p>
            <p className="mt-2 text-xl font-bold text-cyan-100">Soft launch preview</p>
          </div>
          <div className="rounded-lg border border-rose-900/50 bg-rose-900/10 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">Публикация</p>
            <p className="mt-2 text-xl font-bold text-rose-100">Заблокирована</p>
          </div>
          <div className="rounded-lg border border-emerald-900/50 bg-emerald-900/10 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Dry-run</p>
            <p className="mt-2 text-xl font-bold text-emerald-100">Доступен</p>
          </div>
          <div className="rounded-lg border border-amber-900/50 bg-amber-900/10 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Ledger</p>
            <p className="mt-2 text-xl font-bold text-amber-100">Проверяется</p>
          </div>
          <div className="rounded-lg border border-purple-900/50 bg-purple-900/10 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-500">Live</p>
            <p className="mt-2 text-xl font-bold text-purple-100">Только вручную</p>
          </div>
        </section>

        {/* 6. Safety block */}
        <section className="space-y-3 rounded-lg border border-rose-900/30 bg-rose-950/20 p-5">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-base font-semibold">Live-публикация отключена</h2>
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-rose-200/70">
            <li>Telegram API не вызывается из этой страницы</li>
            <li>Токены не используются</li>
            <li>UI только показывает план и проверки</li>
            <li>Запуск только после отдельного разрешения</li>
          </ul>
        </section>

        {/* 2. Soft launch phases */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-100">Фазы Soft Launch</h2>
          </div>
          <div className="divide-y divide-slate-800/60">
            {[
              { phase: "Фаза 1 — проверить текущий день", command: "npm run zodiac:publish:date:dry", status: "Выполняется" },
              { phase: "Фаза 2 — проверить 3 дня вперёд", command: "npm run zodiac:publish:date:dry", status: "Ожидает" },
              { phase: "Фаза 3 — проверить 7 дней вперёд", command: "npm run zodiac:publish:date:dry", status: "Ожидает" },
              { phase: "Фаза 4 — проверить ledger", command: "npm run zodiac:ledger:check", status: "Ожидает" },
              { phase: "Фаза 5 — проверить навигацию каналов", command: "npm run zodiac:navigation:dry", status: "Ожидает" },
              { phase: "Фаза 6 — ручное разрешение на live", command: "Owner approval", status: "Заблокировано" },
            ].map((p, i) => (
              <div key={i} className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-200">{p.phase}</p>
                  <code className="text-xs text-cyan-400 mt-1 block">{p.command}</code>
                </div>
                <div className="text-sm font-medium text-slate-400 border border-slate-800 rounded px-2 py-1 w-fit">
                  {p.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Calendar preview */}
        <section className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-400" /> Календарь на 7 дней
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-800/30">
                <tr>
                  <th className="px-5 py-3 font-medium">День</th>
                  <th className="px-5 py-3 font-medium">Дата</th>
                  <th className="px-5 py-3 font-medium">Каналы</th>
                  <th className="px-5 py-3 font-medium">Ожидаемые посты</th>
                  <th className="px-5 py-3 font-medium">Dry-run</th>
                  <th className="px-5 py-3 font-medium">Ledger</th>
                  <th className="px-5 py-3 font-medium">Статус</th>
                  <th className="px-5 py-3 font-medium text-right">Следующее действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {PREVIEW_DAYS.map((day) => {
                  const dateStr = getFutureDate(day.dayOffset);
                  return (
                    <tr key={day.label} className="hover:bg-slate-800/20">
                      <td className="px-5 py-4 font-medium text-slate-200">{day.label}</td>
                      <td className="px-5 py-4 font-mono text-xs">{dateStr}</td>
                      <td className="px-5 py-4">13</td>
                      <td className="px-5 py-4">13</td>
                      <td className="px-5 py-4 text-emerald-400">OK (Mock)</td>
                      <td className="px-5 py-4 text-emerald-400">Valid</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                          Pending Live
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <code className="text-xs text-slate-500">npm run zodiac:publish:date:dry -- {dateStr}</code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 4. Channel coverage */}
          <section className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="border-b border-slate-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" /> Охват 13 каналов
              </h2>
            </div>
            <div className="divide-y divide-slate-800/60 h-[400px] overflow-y-auto">
              {ZODIAC_CHANNELS.map((ch) => (
                <div key={ch} className="px-5 py-3">
                  <p className="font-medium text-slate-200">{ch}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="inline-flex rounded border border-emerald-900/50 bg-emerald-900/10 px-1.5 py-0.5 text-[10px] text-emerald-400">В ежедневной системе</span>
                    <span className="inline-flex rounded border border-cyan-900/50 bg-cyan-900/10 px-1.5 py-0.5 text-[10px] text-cyan-400">Проверяется через dry-run</span>
                    <span className="inline-flex rounded border border-rose-900/50 bg-rose-900/10 px-1.5 py-0.5 text-[10px] text-rose-400">Заблокировано (live)</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Commands panel */}
          <section className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="border-b border-slate-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" /> Safe Commands
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Проверка конкретного дня (пример):</p>
                <div className="rounded bg-slate-950 p-3 relative group">
                  <code className="text-sm text-cyan-300">npm run zodiac:publish:date:dry -- {getFutureDate(0)}</code>
                </div>
                <p className="text-xs text-slate-500 mt-1">Только локальная проверка / dry-run</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Общая проверка системы:</p>
                <div className="rounded bg-slate-950 p-3 space-y-2">
                  <code className="text-sm text-emerald-300 block">npm run zodiac:dashboard:qa</code>
                  <code className="text-sm text-emerald-300 block">npm run production:safety:check</code>
                </div>
                <p className="text-xs text-slate-500 mt-1">Без вызова API Telegram</p>
              </div>
              
              <div className="rounded border border-amber-900/30 bg-amber-900/10 p-3">
                <p className="text-sm text-amber-200/80">
                  Все эти команды безопасны для локального выполнения. Они не публикуют посты.
                </p>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
