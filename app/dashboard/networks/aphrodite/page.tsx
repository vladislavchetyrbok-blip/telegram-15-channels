import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { 
  LayoutDashboard, 
  TerminalSquare, 
  CheckCircle2, 
  Rocket, 
  RadioTower, 
  Database,
  LockKeyhole,
  Server,
  Clapperboard,
  Lock,
  ChevronRight,
  ShieldAlert,
  Calendar
} from "lucide-react";
import Link from "next/link";

const moduleGroups = [
  {
    title: "Активные модули",
    modules: [
      {
        id: "zodiac",
        title: "Каналы Зодиака",
        purpose: "Сеть из 13 каналов с гороскопами.",
        safetyLevel: "Рабочий модуль",
        nextStep: "Публикации",
        href: "/dashboard/networks/zodiac",
        icon: Rocket,
        status: "Активно",
        statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/30"
      },
      {
        id: "studio",
        title: "Студия",
        purpose: "Генерация контента.",
        safetyLevel: "Рабочий модуль",
        nextStep: "Создание креативов",
        href: "/dashboard/networks/aphrodite/studio",
        icon: Clapperboard,
        status: "Активно",
        statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/30"
      }
    ]
  },
  {
    title: "Черновики",
    modules: [
      {
        id: "currency",
        title: "Валюты",
        purpose: "Курсы валют.",
        safetyLevel: "Только просмотр",
        nextStep: "Шаблоны контента",
        href: "/dashboard/networks/aphrodite/currency",
        icon: RadioTower,
        status: "Черновик",
        statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30"
      },
      {
        id: "crypto",
        title: "Крипта",
        purpose: "Криптовалюты.",
        safetyLevel: "Только просмотр",
        nextStep: "Шаблоны контента",
        href: "/dashboard/networks/aphrodite/crypto",
        icon: RadioTower,
        status: "Черновик",
        statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30"
      },
      {
        id: "metals",
        title: "Металлы",
        purpose: "Драг. металлы.",
        safetyLevel: "Только просмотр",
        nextStep: "Шаблоны контента",
        href: "/dashboard/networks/aphrodite/metals",
        icon: RadioTower,
        status: "Черновик",
        statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30"
      }
    ]
  },
  {
    title: "Системные разделы",
    modules: [
      {
        id: "registry",
        title: "Реестр каналов",
        purpose: "Список всех каналов.",
        safetyLevel: "Рабочий модуль",
        nextStep: "Аудит",
        href: "/dashboard/networks/aphrodite/channels",
        icon: RadioTower,
        status: "Активно",
        statusColor: "text-slate-400 bg-slate-800 border-slate-700"
      },
      {
        id: "calendar",
        title: "Расписание",
        purpose: "Глобальное расписание.",
        safetyLevel: "Рабочий модуль",
        nextStep: "Аудит",
        href: "/dashboard/networks/aphrodite/calendar",
        icon: Calendar,
        status: "Активно",
        statusColor: "text-slate-400 bg-slate-800 border-slate-700"
      },
      {
        id: "data-sources",
        title: "Источники данных",
        purpose: "API ключи и интеграции.",
        safetyLevel: "Рабочий модуль",
        nextStep: "Аудит",
        href: "/dashboard/networks/aphrodite/data-sources",
        icon: Database,
        status: "Активно",
        statusColor: "text-slate-400 bg-slate-800 border-slate-700"
      }
    ]
  }
];

export default function AphroditePlatformOverview() {
  return (
    <main className="min-h-screen bg-[#060b14]">
      
      <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        <AphroditePageHeader
          title="Афродита"
          description="Платформа управления сетями Telegram-каналов, модулями, публикациями, источниками данных и Студией."
          badgeText="Платформа управления"
          icon={LayoutDashboard}
          safetyLocked={true}
          safetyMessage="Публикация заблокирована"
        />

        {/* KPI Row (Compact) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="rounded-xl border border-slate-800/80 bg-[#0f1b33] p-3 flex flex-col justify-center shadow-sm">
            <span className="text-2xl font-semibold text-slate-500 tracking-tight leading-none">15</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">Старая сеть на паузе</span>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-[#0f1b33] p-3 flex flex-col justify-center shadow-sm">
            <span className="text-2xl font-semibold text-cyan-400 tracking-tight leading-none">13</span>
            <span className="text-[10px] font-medium text-cyan-300/80 uppercase tracking-wider mt-1">Каналы Зодиака</span>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-[#0f1b33] p-3 flex flex-col justify-center shadow-sm">
            <span className="text-2xl font-semibold text-amber-400 tracking-tight leading-none">9</span>
            <span className="text-[10px] font-medium text-amber-300/80 uppercase tracking-wider mt-1">Черновики</span>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-[#0f1b33] p-3 flex flex-col justify-center shadow-sm">
            <span className="text-2xl font-semibold text-emerald-400 tracking-tight leading-none">37</span>
            <span className="text-[10px] font-medium text-emerald-300/80 uppercase tracking-wider mt-1">Всего в реестре</span>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 flex flex-col justify-center shadow-sm">
            <span className="text-sm font-semibold text-rose-400 tracking-tight leading-none flex items-center gap-1.5 mb-1">
              <Lock className="h-4 w-4" /> заблокирована
            </span>
            <span className="text-[10px] font-medium text-rose-400/80 uppercase tracking-wider mt-1">Публикация</span>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex flex-col justify-center shadow-sm">
            <span className="text-2xl font-semibold text-emerald-400 tracking-tight leading-none">0</span>
            <span className="text-[10px] font-medium text-emerald-400/80 uppercase tracking-wider mt-1">Ошибки</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Modules Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {moduleGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">{group.title}</h3>
                  <div className="space-y-3">
                    {group.modules.map((m) => {
                      const Icon = m.icon;
                      return (
                        <Link key={m.id} href={m.href} className="group block relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#0f1b33] p-4 transition-all duration-200 shadow-sm hover:border-slate-700 hover:bg-[#132240]">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${m.statusColor}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-white tracking-tight leading-none">{m.title}</h4>
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1 block">{m.status}</span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-slate-400" />
                          </div>
                          <p className="text-xs text-slate-400 mb-3 truncate">{m.purpose}</p>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 px-2 py-0.5 rounded bg-slate-800/50">{m.safetyLevel}</span>
                            <span className="text-slate-400 truncate max-w-[100px]">{m.nextStep}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Safe actions */}
            <section className="rounded-xl border border-slate-800/80 bg-[#0f1b33] p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Следующие безопасные шаги
              </h2>
              <ul className="space-y-2.5">
                {[
                  "Проверить реестр каналов",
                  "Подготовить календарь публикаций",
                  "Настроить источники данных",
                  "Проверить лимиты безопасности"
                ].map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <div className="mt-1 flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50">
                      <div className="h-1 w-1 rounded-full bg-slate-400" />
                    </div>
                    <span className="text-xs text-slate-300 leading-tight">{action}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Architecture */}
            <section className="rounded-xl border border-slate-800/80 bg-[#0f1b33] p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-slate-400" />
                Архитектура платформы
              </h2>
              <div className="rounded-lg border border-slate-800 bg-[#080d1a] p-3 font-mono text-[11px] leading-relaxed text-slate-300">
<pre><code>{`Афродита
├ Каналы
├ Модули
├ Публикации
├ Источники
├ Безопасность
└ Студия`}</code></pre>
              </div>
            </section>
            
            {/* Safety status */}
            <section className="rounded-xl border border-slate-800/80 bg-[#0f1b33] p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                Статус безопасности
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  <Lock className="h-3.5 w-3.5" /> Публикация заблокирована
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <LockKeyhole className="h-3.5 w-3.5" /> Режим только просмотра
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
