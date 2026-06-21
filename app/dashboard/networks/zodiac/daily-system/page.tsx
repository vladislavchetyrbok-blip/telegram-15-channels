import { ShieldAlert, Presentation, Layers, Info, CheckCircle2, Activity, Rocket, Calendar, Code2, Database, Terminal, GitBranch, Play } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

function MetricCard({ title, value, caption, icon: Icon, tone = "blue" }: { title: string, value: string, caption: string, icon: any, tone?: "blue" | "slate" | "amber" | "cyan" | "rose" | "emerald" | "indigo" }) {
  const tones = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    slate: "border-slate-500/20 bg-slate-500/10 text-slate-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-400",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    indigo: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
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
        <div className="text-xl font-bold text-white leading-tight">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{caption}</div>
      </div>
    </div>
  )
}

export default function ZodiacDailySystemPage() {
  return (
    <div className="min-h-screen bg-[#0a1122] p-8 font-sans text-slate-300">
      <div className="mx-auto max-w-6xl space-y-8">
        
        <div className="flex flex-col gap-2 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                Ежедневная система Зодиака
              </h1>
              <p className="mt-2 text-slate-400 max-w-2xl">
                Аудит уже настроенной ежедневной системы: 13 каналов, расписание, шаблоны, ledger, dry-run и безопасность публикаций.
              </p>
            </div>
            <Link
              href="/dashboard/networks/zodiac/soft-launch"
              className="hidden sm:flex flex-col items-end gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-right transition-colors hover:bg-cyan-500/20"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                <Play className="h-4 w-4" />
                Soft Launch Preview
              </div>
              <div className="text-xs text-cyan-500 max-w-[250px]">
                Проверка ближайших дней, 13 каналов, dry-run, ledger и ручной контроль перед live.
              </div>
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard title="Каналов" value="13" caption="В data/zodiac-channels.json" icon={Layers} tone="cyan" />
          <MetricCard title="Ежедневная логика" value="Настроена" caption="scripts/generate-zodiac-plan.mjs" icon={Activity} tone="emerald" />
          <MetricCard title="Публикации" value="Проверить режим" caption="Только dry-run по умолчанию" icon={Rocket} tone="amber" />
          <MetricCard title="Ledger" value="Найден / Проверить" caption="data/zodiac-ledger.json" icon={Database} tone="blue" />
          <MetricCard title="Dry-run" value="Доступен" caption="publish-zodiac-dry-run.mjs" icon={Terminal} tone="indigo" />
          <MetricCard title="Live" value="Только с разрешения" caption="npm run production:safety:check" icon={ShieldAlert} tone="rose" />
        </section>

        <section className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            <h2 className="text-lg font-semibold text-rose-100">Safety Block</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Не пересоздавать посты с нуля",
              "Не трогать токены",
              "Не включать live без отдельного разрешения",
              "Сначала dry-run и ledger",
              "Ежедневная система должна быть сохранена"
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
              <Code2 className="h-5 w-5 text-indigo-400" />
              Карта существующей системы
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                <div className="text-xs text-slate-500 mb-1">Конфиг каналов</div>
                <div className="text-sm font-mono text-slate-300">data/zodiac-channels.json</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                <div className="text-xs text-slate-500 mb-1">Генератор и расписание</div>
                <div className="text-sm font-mono text-slate-300">scripts/generate-zodiac-plan.mjs<br/>data/zodiac-daily-plan.json</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                <div className="text-xs text-slate-500 mb-1">Ledger публикаций</div>
                <div className="text-sm font-mono text-slate-300">data/zodiac-ledger.json</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                <div className="text-xs text-slate-500 mb-1">QA и статус</div>
                <div className="text-sm font-mono text-slate-300">scripts/zodiac-status.mjs</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                <div className="text-xs text-slate-500 mb-1">GitHub Action Workflow</div>
                <div className="text-sm font-mono text-slate-300">.github/workflows/zodiac-scheduler.yml</div>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-emerald-400" />
                Команды для проверки
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-black/40 rounded border border-slate-800 font-mono text-xs text-emerald-400">
                  npm run zodiac:status
                </div>
                <div className="p-3 bg-black/40 rounded border border-slate-800 font-mono text-xs text-emerald-400">
                  npm run zodiac:dry-run
                </div>
                <div className="p-3 bg-black/40 rounded border border-slate-800 font-mono text-xs text-emerald-400">
                  npm run zodiac:workflow:check
                </div>
                <div className="p-3 bg-black/40 rounded border border-slate-800 font-mono text-xs text-emerald-400">
                  npm run zodiac:publish:date:dry
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-cyan-400" />
                Ежедневный Flow
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300">
                <li><span className="text-white font-medium">Выбор даты</span>: Определение целевого дня</li>
                <li><span className="text-white font-medium">Генерация</span>: Создание/проверка постов</li>
                <li><span className="text-white font-medium">Валидация</span>: Проверка дублей и пропусков</li>
                <li><span className="text-white font-medium">Dry-run</span>: Безопасный прогон</li>
                <li><span className="text-white font-medium">Ledger</span>: Запись статусов (pending/sent)</li>
                <li><span className="text-white font-medium">Апрув</span>: Ручное подтверждение (перед Live)</li>
              </ol>
            </section>
          </div>
        </div>

      </div>
    </div>
  )
}
