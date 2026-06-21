import { AlertTriangle, CheckCircle2, ChevronRight, Activity, Calendar, LayoutGrid, Zap, Shield, Search, Terminal, AlertOctagon, CheckSquare, Database, FileText, ArrowRight, LayoutTemplate, Eye, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

function MetricCard({ title, value, caption, icon: Icon, tone = "blue" }: { title: string, value: string, caption: string, icon: any, tone?: "blue" | "slate" | "amber" | "cyan" | "rose" | "emerald" }) {
  const tones = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    slate: "border-slate-500/20 bg-slate-500/10 text-slate-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-400",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
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

function CommandBlock({ title, purpose, command, expected, risk, action }: { title: string, purpose: string, command: string, expected: string, risk: string, action: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Terminal className="h-5 w-5 text-indigo-400" />
        {title}
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">Назначение</span>
          <span className="text-slate-200 text-right font-medium">{purpose}</span>
        </div>
        <div className="flex flex-col border-b border-slate-800 pb-2 gap-1">
          <span className="text-slate-400">Команда</span>
          <code className="text-amber-400 bg-amber-400/10 px-2 py-1 rounded text-xs break-all">{command}</code>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">Ожидаемый результат</span>
          <span className="text-emerald-400 text-right">{expected}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">Риск при сбое</span>
          <span className="text-rose-400 text-right">{risk}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-slate-400">Действие</span>
          <span className="text-blue-400 text-right">{action}</span>
        </div>
      </div>
    </div>
  )
}

export default function ZodiacLedgerPage() {
  const taxonomy = [
    { label: "OK", desc: "проверка прошла", tone: "text-emerald-400 bg-emerald-400/10" },
    { label: "REVIEW", desc: "нужен ручной просмотр", tone: "text-amber-400 bg-amber-400/10" },
    { label: "BLOCKED", desc: "запуск запрещён", tone: "text-rose-400 bg-rose-400/10" },
    { label: "MISSING", desc: "не найден файл/канал/пост", tone: "text-rose-400 bg-rose-400/10" },
    { label: "DUPLICATE", desc: "возможный дубль", tone: "text-orange-400 bg-orange-400/10" },
    { label: "FAILED", desc: "ошибка проверки", tone: "text-rose-500 bg-rose-500/10" }
  ]

  const channels = [
    "Общий гороскоп", "Овен", "Телец", "Близнецы", "Рак", "Лев",
    "Дева", "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"
  ]

  const blockers = [
    "пропущен канал",
    "дублирующийся пост",
    "ошибка ledger",
    "не прошёл dry-run",
    "нет навигации",
    "не прошла production safety check",
    "нет ручного разрешения владельца"
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
            <span className="text-indigo-400">Ledger и dry-run</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <Search className="h-8 w-8 text-indigo-500" />
                Ledger и dry-run Зодиака
              </h1>
              <p className="mt-2 text-slate-400">
                Проверка ежедневной системы: dry-run команды, ledger-статусы, ошибки, пропуски, дубли и готовность к мягкому запуску.
              </p>
            </div>
          </div>
        </div>

        {/* 1. KPI cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard title="Каналов" value="13" caption="В сети Зодиака" icon={LayoutGrid} tone="blue" />
          <MetricCard title="Режим" value="Проверка" caption="Аудит системы" icon={Search} tone="amber" />
          <MetricCard title="Dry-run" value="Доступен" caption="Тестовая генерация" icon={Activity} tone="emerald" />
          <MetricCard title="Ledger" value="Проверяется" caption="Учет публикаций" icon={CheckSquare} tone="cyan" />
          <MetricCard title="Live" value="Заблокирован" caption="Реальная отправка" icon={Shield} tone="rose" />
          <MetricCard title="Статус" value="Только чтение" caption="UI без записи" icon={Search} tone="slate" />
        </section>

        {/* Action Links */}
        <section className="grid gap-4 md:grid-cols-3">
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
                <LayoutTemplate className="h-5 w-5 text-fuchsia-400" />
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
          <Link href="/dashboard/networks/zodiac/preview-review" className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-5 shadow-sm hover:bg-teal-500/20 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-5 w-5 text-teal-400" />
                <h3 className="text-lg font-semibold text-white">Preview Review</h3>
              </div>
              <div className="text-sm text-teal-300">Ручной просмотр dry-run примеров: структура, CTA, риски, scoring и готовность к soft launch.</div>
            </div>
            <ChevronRight className="h-5 w-5 text-teal-400" />
          </Link>
          <Link href="/dashboard/networks/zodiac/manual-review" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 shadow-sm hover:bg-rose-500/20 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ListChecks className="h-5 w-5 text-rose-400" />
                <h3 className="text-lg font-semibold text-white">Ручная проверка</h3>
              </div>
              <div className="text-sm text-rose-300">Очередь OK / REVIEW / BLOCKED перед soft launch и любым live-действием.</div>
            </div>
            <ChevronRight className="h-5 w-5 text-rose-400" />
          </Link>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 3. Status taxonomy */}
          <section className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Статусы проверок
            </h2>
            <div className="space-y-3">
              {taxonomy.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-800">
                  <span className={cn("px-2 py-1 rounded text-xs font-bold", item.tone)}>
                    {item.label}
                  </span>
                  <span className="text-sm text-slate-400">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Blockers */}
          <section className="rounded-xl border border-rose-900/30 bg-rose-950/10 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-rose-100 mb-4 flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-rose-500" />
              Блокирует Live-запуск
            </h2>
            <ul className="space-y-3">
              {blockers.map((blocker, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-rose-300/80 bg-rose-900/20 p-2 rounded-lg border border-rose-900/30">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  {blocker}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 2. Inspector blocks */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-6">
            <Terminal className="h-6 w-6 text-indigo-400" />
            Инспектор команд
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <CommandBlock
              title="Dry-run публикаций"
              purpose="Симуляция отправки постов"
              command="npm run zodiac:publish:date:dry"
              expected="OK, 13 success, 0 failed"
              risk="Посты не будут отправлены"
              action="Проверить контент и слоты"
            />
            <CommandBlock
              title="Ledger safety"
              purpose="Анализ учета отправленного"
              command="npm run zodiac:ledger:check"
              expected="OK, дублей нет"
              risk="Двойная отправка (спам)"
              action="Запустить ledger:check"
            />
            <CommandBlock
              title="Навигация каналов"
              purpose="Проверка кросс-ссылок"
              command="npm run zodiac:navigation:all:dry"
              expected="OK, все ссылки корректны"
              risk="Сломанные пути пользователя"
              action="Обновить связи"
            />
            <CommandBlock
              title="Описание каналов"
              purpose="Синхронизация about/bio"
              command="npm run zodiac:descriptions:dry"
              expected="OK, тексты актуальны"
              risk="Рассинхрон с позиционированием"
              action="Применить описания"
            />
            <CommandBlock
              title="Production safety"
              purpose="Проверка блокировок live"
              command="npm run production:safety:check"
              expected="FAIL (из-за защиты)"
              risk="Случайный запуск в прод"
              action="Проанализировать лог"
            />
            <CommandBlock
              title="Dashboard QA"
              purpose="Проверка UI и маршрутов"
              command="npm run zodiac:dashboard:qa"
              expected="PASS, все роуты доступны"
              risk="Недоступность управления"
              action="Починить код дашборда"
            />
          </div>
        </section>

        {/* 5. 13-channel coverage */}
        <section className="rounded-xl border border-slate-800 bg-[#0f1b33] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-indigo-400" />
            Покрытие каналов (13/13)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel, idx) => (
              <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
                <div className="font-medium text-white mb-3">{channel}</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>В ежедневной системе</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Проверяется через dry-run</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Live заблокирован</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Safety block */}
        <section className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-rose-500" />
            <h2 className="text-lg font-semibold text-rose-100">Safety Status</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Live-публикация отключена",
              "Telegram API не вызывается из этой страницы",
              "Токены не используются",
              "UI только показывает проверки",
              "Запуск только после отдельного разрешения"
            ].map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-rose-300">
                <CheckCircle2 className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                {rule}
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  )
}
