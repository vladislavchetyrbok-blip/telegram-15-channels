import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { Activity, Rocket, CheckCircle2, LockKeyhole, FileText, CheckSquare, Search, PenTool, RadioTower, Database, LayoutDashboard, Clapperboard, Check } from "lucide-react";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const phases = [
  { step: "Фаза 1", title: "Аудит каналов", desc: "Проверка доступов и админов", status: "В процессе", safety: "Безопасно", icon: Search },
  { step: "Фаза 2", title: "Обновить описания и аватары", desc: "Актуализация профилей", status: "Ожидает", safety: "Безопасно", icon: PenTool },
  { step: "Фаза 3", title: "Подготовить 7 постов на канал", desc: "Черновики в Студии", status: "Ожидает", safety: "Только черновики", icon: FileText },
  { step: "Фаза 4", title: "Проверить рубрики и CTA", desc: "Проверка кнопок и ссылок", status: "Ожидает", safety: "Безопасно", icon: CheckSquare },
  { step: "Фаза 5", title: "Dry-run публикаций", desc: "Тестовая отправка", status: "Заблокировано", safety: "Требует код", icon: Activity },
  { step: "Фаза 6", title: "Ручное разрешение на live", desc: "Финальный запуск", status: "Заблокировано", safety: "Опасная зона", icon: Rocket },
];

const channelsData = [
  { name: "Ідеї для бізнесу", cat: "Общая тема", lang: "UA", freq: "3–5 постов в неделю", rubric: "Идея недели", idea: "Малый бизнес без лишнего риска", status: "Ожидает" },
  { name: "Мужской стиль и вещи", cat: "Общая тема", lang: "RU", freq: "3–5 постов в неделю", rubric: "Вещь недели", idea: "Базовый гардероб", status: "Ожидает" },
  { name: "Техника для дома", cat: "Общая тема", lang: "RU", freq: "3–5 постов в неделю", rubric: "Что купить", idea: "Надёжность и обслуживание", status: "Ожидает" },
  { name: "Україна: можливості та ринок", cat: "Общая тема", lang: "UA", freq: "3–5 постов в неделю", rubric: "Можливість тижня", idea: "Програма / грант / ринок", status: "Ожидает" },
  { name: "Деньги и возможности", cat: "Общая тема", lang: "RU", freq: "5 постов в неделю", rubric: "Где теряются деньги", idea: "Подработка без шума", status: "Ожидает" },
  { name: "AI и технологии", cat: "Общая тема", lang: "RU", freq: "5 постов в неделю", rubric: "Инструмент дня", idea: "Автоматизация", status: "Ожидает" },
  { name: "Личный прогресс", cat: "Общая тема", lang: "RU", freq: "3–5 постов в неделю", rubric: "Мысль дня", idea: "Система вместо мотивации", status: "Ожидает" },
  { name: "Авто и комфорт", cat: "Общая тема", lang: "RU", freq: "3–5 постов в неделю", rubric: "Уход за авто", idea: "Комфорт в поездке", status: "Ожидает" },
  { name: "Дніпро / Город Днепр", cat: "Общая тема", lang: "MIX", freq: "5 постов в неделю", rubric: "Район дня", idea: "Городское наблюдение", status: "Ожидает" },
  { name: "Рыбалка и отдых", cat: "Общая тема", lang: "RU", freq: "3–5 постов в неделю", rubric: "Подготовка", idea: "Выезд недели", status: "Ожидает" },
  { name: "Инвестиции в недвижимость", cat: "Недвижимость", lang: "RU", freq: "3 поста в неделю", rubric: "Объект / сегмент недели", idea: "Окупаемость / аренда / спрос", status: "Ожидает" },
  { name: "Земля и дома / Земля та будинки", cat: "Недвижимость", lang: "MIX", freq: "3 поста в неделю", rubric: "Проверка документов", idea: "Риск сделки", status: "Ожидает" },
  { name: "Коммерческая недвижимость", cat: "Недвижимость", lang: "RU", freq: "3 поста в неделю", rubric: "Локация", idea: "Аренда", status: "Ожидает" },
  { name: "Нерухомість Дніпра", cat: "Недвижимость", lang: "UA", freq: "3–5 постов в неделю", rubric: "Объект недели", idea: "Проверка объекта", status: "Ожидает" },
  { name: "Недвижимость Днепра", cat: "Недвижимость", lang: "RU", freq: "3–5 постов в неделю", rubric: "Локальный совет", idea: "Районы", status: "Ожидает" },
];

const studioLinks = [
  { title: "Студия", href: "/dashboard/networks/aphrodite/studio", icon: Clapperboard },
  { title: "Шаблоны", href: "/dashboard/networks/aphrodite/studio/templates", icon: FileText },
  { title: "Брифы", href: "/dashboard/networks/aphrodite/studio/briefs", icon: PenTool },
  { title: "Очередь", href: "/dashboard/networks/aphrodite/studio/queue", icon: Database },
];

export default function AphroditeLegacyRestartPage() {
  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <AphroditePageHeader
          title="Перезапуск 15 каналов"
          description="План безопасного возвращения старой сети Афродиты: рубрики, частота, первые темы, подготовка контента и ручная проверка перед публикацией."
          badgeText="План перезапуска"
          icon={Rocket}
          safetyLocked={true}
          safetyMessage="Live-публикация отключена"
        />

        {/* 1. Restart Overview */}
        <section className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <MetricCard title="Всего каналов" value="15" icon={RadioTower} tone="slate" />
          <MetricCard title="Общие темы" value="10" icon={FileText} tone="amber" />
          <MetricCard title="Недвижимость" value="5" icon={Activity} tone="cyan" />
          <MetricCard title="Статус" value="Подготовка" icon={Search} tone="blue" />
          <MetricCard title="Публикация" value="Заблокирована" icon={LockKeyhole} tone="rose" />
          <MetricCard title="Готово к запуску" value="0" icon={CheckCircle2} tone="slate" />
        </section>

        {/* 6. Safety Block */}
        <section className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <LockKeyhole className="h-6 w-6 text-rose-400" />
            <h2 className="text-lg font-semibold text-rose-300">Безопасность перезапуска</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Live-публикация отключена",
              "Telegram API не вызывается",
              "Все посты только в планировании",
              "Запуск только после отдельного разрешения",
              "Dry-run обязателен"
            ].map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-rose-200/80 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                <Check className="h-4 w-4 text-rose-400" />
                {rule}
              </div>
            ))}
          </div>
        </section>

        {/* 2. Relaunch Phases */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Этапы перезапуска
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {phases.map((phase) => (
              <div key={phase.step} className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm transition hover:border-slate-700 hover:bg-[#121f3a]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Этап</span>
                  <phase.icon className="h-4 w-4 text-slate-400" />
                </div>
                <h3 className="font-medium text-white mb-1">{`${phase.step} — ${phase.title}`}</h3>
                <p className="text-sm text-slate-400 mb-4">{phase.desc}</p>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded",
                    phase.status === "В процессе" ? "bg-blue-500/10 text-blue-400" :
                    phase.status === "Ожидает" ? "bg-slate-800/80 text-slate-300" :
                    "bg-rose-500/10 text-rose-400"
                  )}>
                    {phase.status}
                  </span>
                  <span className="text-xs text-slate-500">{phase.safety}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Studio Integration */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-indigo-400" />
            Связь со Студией
          </h2>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6 shadow-sm">
            <p className="text-sm text-indigo-200/70 mb-5 max-w-3xl">
              Для каждого канала требуется: бриф, шаблон, очередь, визуал, подпись, проверка, план публикации. 
              Весь подготовительный контент создаётся через Афродита Студию.
            </p>
            <div className="flex flex-wrap gap-3">
              {studioLinks.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-2 bg-[#0f1b33] border border-indigo-500/20 px-4 py-2 rounded-lg text-sm text-indigo-300 hover:bg-indigo-500/20 transition-colors">
                  <link.icon className="h-4 w-4" />
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 3 & 4. Channel Restart Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-emerald-400" />
            Матрица каналов (15)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0f1b33]">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#121f3a] text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Канал</th>
                  <th className="px-4 py-3 font-medium">Категория</th>
                  <th className="px-4 py-3 font-medium">Язык</th>
                  <th className="px-4 py-3 font-medium">Частота</th>
                  <th className="px-4 py-3 font-medium">Первая рубрика</th>
                  <th className="px-4 py-3 font-medium">Первая тема</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {channelsData.map((channel, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{channel.name}</td>
                    <td className="px-4 py-3 text-slate-400">
                      <span className={cn("px-2 py-0.5 rounded text-[11px]", channel.cat === "Общая тема" ? "bg-amber-500/10 text-amber-400" : "bg-cyan-500/10 text-cyan-400")}>
                        {channel.cat}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                        {channel.lang}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-400/80">{channel.freq}</td>
                    <td className="px-4 py-3">{channel.rubric}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[200px]">{channel.idea}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                        {channel.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, tone }: any) {
  const tones: Record<string, string> = {
    slate: "text-slate-300",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
    cyan: "text-cyan-400",
  };
  return (
    <div className="rounded-xl border border-slate-800/80 bg-[#0f1b33] p-4 flex flex-col justify-center shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <Icon className={cn("h-4 w-4 opacity-50", tones[tone])} />
      </div>
      <span className={cn("text-2xl font-semibold tracking-tight leading-none mt-1", tones[tone])}>{value}</span>
    </div>
  );
}
