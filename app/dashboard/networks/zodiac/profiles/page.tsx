import { ShieldAlert, Presentation, Layers, Info, LayoutGrid, Activity, Rocket, Shield, CheckCircle2, Calendar } from "lucide-react"
import Link from "next/link"
import { zodiacChannelProfiles } from "@/lib/zodiac/zodiac-channel-profiles"
import { cn } from "@/lib/utils"

function MetricCard({ title, value, caption, icon: Icon, tone = "blue" }: { title: string, value: string, caption: string, icon: any, tone?: "blue" | "slate" | "amber" | "cyan" | "rose" }) {
  const tones = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    slate: "border-slate-500/20 bg-slate-500/10 text-slate-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-400"
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("rounded-lg p-2 flex items-center justify-center", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{caption}</div>
      </div>
    </div>
  )
}

export default function ZodiacProfilesPage() {
  return (
    <div className="min-h-screen bg-[#0a1122] p-8 font-sans text-slate-300">
      <div className="mx-auto max-w-6xl space-y-8">
        
        <div className="flex flex-col gap-2 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                Контентные профили Зодиака
              </h1>
              <p className="mt-2 text-slate-400 max-w-2xl">
                13 каналов Зодиака: позиционирование, рубрики, тон, форматы постов, CTA и связка со Студией.
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard title="Каналов" value="13" caption="Целевая сетка" icon={LayoutGrid} tone="cyan" />
          <MetricCard title="Знаков" value="12" caption="Аудитория по знакам" icon={Activity} tone="blue" />
          <MetricCard title="Общий канал" value="1" caption="Для всех знаков" icon={Rocket} tone="slate" />
          <MetricCard title="Статус" value="Подготовка" caption="Настройка логики" icon={Activity} tone="amber" />
          <MetricCard title="Публикация" value="Заблокирована" caption="Live-публикация отключена" icon={Shield} tone="rose" />
          <MetricCard title="Следующий этап" value="7 дней постов" caption="Подготовка контента" icon={Calendar} tone="blue" />
        </section>

        <section className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            <h2 className="text-lg font-semibold text-rose-100">Safety Block</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Live-публикация отключена",
              "Telegram API не вызывается",
              "Токены не используются",
              "Контент готовится только для dry-run",
              "Запуск только после отдельного разрешения"
            ].map((rule, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-rose-300">
                <CheckCircle2 className="h-4 w-4 text-rose-500" />
                {rule}
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Общая контентная структура (Daily)
            </h2>
            <div className="text-sm text-slate-400 mb-4">
              Стандартный шаблон поста для каждого из 13 каналов
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-300">
              <li>Заголовок</li>
              <li>Энергия дня</li>
              <li>Любовь</li>
              <li>Деньги / работа</li>
              <li>Совет дня</li>
              <li>Число дня</li>
              <li>Аффирмация</li>
              <li>CTA в Mini App / совместимость / подписку</li>
            </ol>
          </section>

          <section className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Presentation className="h-5 w-5 text-fuchsia-400" />
              Интеграция со Студией
            </h2>
            <div className="text-sm text-slate-400 mb-4">
              Все визуалы (Reels, Shorts, Images) создаются через единую студию Афродиты по шаблонам Зодиака.
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link href="/dashboard/networks/aphrodite/studio" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-800 hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-300">Студия</span>
              </Link>
              <Link href="/dashboard/networks/aphrodite/studio/templates" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-800 hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-300">Шаблоны</span>
              </Link>
              <Link href="/dashboard/networks/aphrodite/studio/briefs" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-800 hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-300">Брифы</span>
              </Link>
              <Link href="/dashboard/networks/aphrodite/studio/queue" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-800 hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-300">Очередь рендера</span>
              </Link>
            </div>
          </section>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Info className="h-5 w-5 text-blue-400" />
            13 профилей
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {zodiacChannelProfiles.map((profile) => (
              <div key={profile.slug} className="rounded-xl border border-slate-800 bg-[#0f1b33]/80 p-5 flex flex-col shadow-sm hover:border-slate-700 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                    <div className="mt-1 flex gap-2">
                      {profile.element && <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">{profile.element}</span>}
                      {profile.type === 'general' && <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">Общий</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 text-sm space-y-5">
                  <div>
                    <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider font-semibold">Позиционирование</div>
                    <div className="text-slate-300 leading-snug">{profile.contentPositioning}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider font-semibold">Тон</div>
                    <div className="text-slate-300 leading-snug">{profile.tone}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider font-semibold">Рубрики (Daily)</div>
                      <ul className="list-disc pl-4 text-slate-300 text-xs space-y-1">
                        {profile.dailyRubrics.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider font-semibold">Студия</div>
                        <ul className="list-disc pl-4 text-slate-300 text-xs space-y-1">
                          {profile.studioFormats.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider font-semibold">Форматы</div>
                        <div className="text-slate-300 text-xs leading-snug">{profile.postFormats.join(", ")}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider font-semibold">CTA</div>
                    <div className="text-slate-300 text-xs leading-snug">{profile.ctaStyle}</div>
                  </div>
                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="text-rose-400/80 text-xs flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      {profile.safetyNote}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
