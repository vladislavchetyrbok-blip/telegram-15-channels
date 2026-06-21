import { AlertTriangle, CheckCircle2, ChevronRight, Rocket, Shield, Activity, Calendar, LayoutGrid, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

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

export default function ZodiacPriorityPage() {
  const scopeItems = [
    "12 знаков",
    "общий канал",
    "ежедневные гороскопы",
    "недельные гороскопы",
    "совместимость",
    "числа / аффирмации",
    "Mini App",
    "Studio Reels/Shorts"
  ]

  const phases = [
    { step: "Фаза 1", title: "проверить 13 каналов", status: "Ожидание" },
    { step: "Фаза 2", title: "аудит ежедневной системы", status: "Ожидание" },
    { step: "Фаза 3", title: "проверить Mini App", status: "Ожидание" },
    { step: "Фаза 4", title: "подготовить CTA", status: "Ожидание" },
    { step: "Фаза 5", title: "dry-run публикаций", status: "Ожидание" },
    { step: "Фаза 6", title: "ручное разрешение на live", status: "Ожидание" }
  ]

  const packages = [
    { name: "Package 90", desc: "контентные профили 13 каналов" },
    { name: "Package 91", desc: "аудит, предпросмотр и улучшение качества" },
    { name: "Package 92", desc: "Studio Reels/Shorts для Зодиака" },
    { name: "Package 93", desc: "dry-run preview и календарь Зодиака" }
  ]

  return (
    <div className="min-h-screen bg-[#0a1122] p-8 font-sans text-slate-300">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>Афродита</span>
            <ChevronRight className="h-4 w-4" />
            <span>Зодиак</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-blue-400">Приоритет запуска</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <Rocket className="h-8 w-8 text-blue-500" />
                Зодиак — приоритет запуска
              </h1>
              <p className="mt-2 text-slate-400">
                Первый модуль Афродиты для запуска: каналы Зодиака, ежедневные публикации, Mini App, совместимость, числа, аффирмации и контент для Студии.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Priority overview KPI cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard title="Модуль" value="Зодиак" caption="Первый модуль" icon={LayoutGrid} tone="blue" />
          <MetricCard title="Статус" value="Приоритет запуска" caption="В фокусе разработки" icon={Activity} tone="amber" />
          <MetricCard title="Каналов" value="13" caption="Целевая сетка" icon={Rocket} tone="cyan" />
          <MetricCard title="Публикация" value="Заблокирована" caption="Live-публикация отключена" icon={Shield} tone="rose" />
          <MetricCard title="Режим" value="Dry-run / подготовка" caption="Безопасное тестирование" icon={CheckCircle2} tone="slate" />
          <MetricCard title="Следующий этап" value="Package 91" caption="Ежедневная система уже настроена" icon={Calendar} tone="blue" />
        </section>

        {/* Action Links */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/networks/zodiac/profiles" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 shadow-sm hover:bg-indigo-500/20 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutGrid className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Конфиг 13 каналов</h3>
              </div>
              <div className="text-sm text-indigo-300">Позиционирование</div>
            </div>
            <ChevronRight className="h-5 w-5 text-indigo-400" />
          </Link>
          <Link href="/dashboard/networks/zodiac/daily-system" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm hover:bg-emerald-500/20 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Ежедневная система</h3>
              </div>
              <div className="text-sm text-emerald-300">Настроенный контур</div>
            </div>
            <ChevronRight className="h-5 w-5 text-emerald-400" />
          </Link>
          <Link href="/dashboard/networks/zodiac/soft-launch" className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5 shadow-sm hover:bg-cyan-500/20 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Soft Launch</h3>
              </div>
              <div className="text-sm text-cyan-300">Календарь проверок</div>
            </div>
            <ChevronRight className="h-5 w-5 text-cyan-400" />
          </Link>
          <Link href="/dashboard/networks/zodiac/content-quality" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm hover:bg-amber-500/20 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Качество контента</h3>
              </div>
              <div className="text-sm text-amber-300">Проверка тона, повторяемости, CTA, структуры и безопасных формулировок действующих гороскопов.</div>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-400" />
          </Link>
          <Link href="/dashboard/networks/zodiac/template-refinement" className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-5 shadow-sm hover:bg-fuchsia-500/20 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutGrid className="h-5 w-5 text-fuchsia-400" />
                <h3 className="text-lg font-semibold text-white">Шаблоны Зодиака</h3>
              </div>
              <div className="text-sm text-fuchsia-300">Структура постов, уникальность знаков, CTA, Mini App-связка и контроль повторяемости.</div>
            </div>
            <ChevronRight className="h-5 w-5 text-fuchsia-400" />
          </Link>
          <Link href="/dashboard/networks/zodiac/quality-scoring" className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5 shadow-sm hover:bg-sky-500/20 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-semibold text-white">Оценка качества</h3>
              </div>
              <div className="text-sm text-sky-300">Scoring перед soft launch: структура, CTA, безопасность, повторяемость и различимость знаков.</div>
            </div>
            <ChevronRight className="h-5 w-5 text-sky-400" />
          </Link>
        </section>

        {/* Safety block */}
        <section className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-rose-500" />
            <h2 className="text-lg font-semibold text-rose-100">Safety Status</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Live-публикация отключена",
              "Telegram API не вызывается",
              "Токены не используются",
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
          {/* 2. Zodiac scope */}
          <section className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-blue-400" />
              Zodiac Scope
            </h2>
            <ul className="grid grid-cols-2 gap-3">
              {scopeItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/30 p-2 rounded-lg border border-slate-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 5. Next packages */}
          <section className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Next Packages
            </h2>
            <div className="space-y-3">
              {packages.map((pkg, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                  <div className="text-sm font-mono text-amber-400 mt-0.5">{pkg.name}</div>
                  <div className="text-sm text-slate-300">— {pkg.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 3. Launch phases */}
        <section className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-400" />
            Launch Phases
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {phases.map((phase) => (
              <div key={phase.step} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition hover:bg-slate-800">
                <div className="text-xs font-bold text-slate-500 mb-1">{phase.step}</div>
                <div className="font-medium text-white">{phase.title}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
