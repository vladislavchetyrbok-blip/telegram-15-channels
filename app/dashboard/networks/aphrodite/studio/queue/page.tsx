import { Kanban, ListTree, ShieldCheck, Lock, CheckCircle2, AlertCircle, FileText, Video, Image as ImageIcon, MessageSquareText, Search } from "lucide-react";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export const dynamic = "force-dynamic";

export default function AphroditeStudioQueuePage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/studio/queue");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        <AphroditePageHeader
          title="Очередь Студии Афродиты"
          description="Производственная доска контента: идеи, сценарии, визуалы, видео, подписи, проверка и подготовка публикаций."
          badgeText="Review Board"
          icon={Kanban}
          safetyLocked={true}
          safetyMessage="API отключены / Только чтение"
        />

        {/* 7. Safety block */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-amber-500">Система Безопасности</h2>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm text-amber-200/80">
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Очередь только для просмотра</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Генерация не подключена</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Публикация в Telegram отключена</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> API-ключи не используются</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Серверных записей нет</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Все действия требуют будущего отдельного approval</li>
          </ul>
        </div>

        {/* 8. Links */}
        <div className="flex flex-wrap gap-3">
          <a href="/dashboard/networks/aphrodite/studio" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Студия</a>
          <a href="/dashboard/networks/aphrodite/studio/templates" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Шаблоны</a>
          <a href="/dashboard/networks/aphrodite/calendar" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Календарь</a>
          <a href="/dashboard/networks/aphrodite/channels" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Каналы</a>
        </div>

        {/* 1. Queue Overview */}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {[
            { label: "Всего задач", val: 12, col: "text-blue-400" },
            { label: "Черновики", val: 3, col: "text-slate-400" },
            { label: "Сценарии", val: 2, col: "text-purple-400" },
            { label: "Визуалы", val: 2, col: "text-emerald-400" },
            { label: "Видео", val: 2, col: "text-pink-400" },
            { label: "На проверке", val: 2, col: "text-amber-400" },
            { label: "Готово", val: 1, col: "text-green-400" }
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
              <div className="text-sm font-medium text-slate-400 mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.col}`}>{stat.val}</div>
            </div>
          ))}
        </div>

        {/* 2. Production Pipeline */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 overflow-x-auto">
          <h2 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ListTree className="h-4 w-4" /> Pipeline
          </h2>
          <div className="flex min-w-max items-center gap-2 text-sm font-medium">
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Идея</span>
            <span className="text-slate-600">→</span>
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Сценарий</span>
            <span className="text-slate-600">→</span>
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Визуал</span>
            <span className="text-slate-600">→</span>
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Видео</span>
            <span className="text-slate-600">→</span>
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Подпись</span>
            <span className="text-slate-600">→</span>
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Проверка</span>
            <span className="text-slate-600">→</span>
            <span className="rounded bg-slate-800 px-3 py-1.5 text-green-400">Готово</span>
          </div>
        </div>

        {/* 5. Filters / grouping UI */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Search className="h-4 w-4" /> Фильтры
          </h2>
          <div className="flex flex-wrap gap-2">
            {["Все", "Зодиак", "Валюты", "Крипта", "Металлы", "Недвижимость", "Reels", "Shorts", "Image", "Caption", "Review"].map((f, i) => (
              <span key={f} className={`rounded-full border px-3 py-1 text-sm ${i === 0 ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-slate-700 bg-slate-800 text-slate-300'} cursor-default`}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* 3 & 4. Kanban / Review Board & Mock queue items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-start overflow-x-auto pb-4">
          
          {/* Column: Идеи */}
          <div className="space-y-3 min-w-[250px]">
            <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2 flex justify-between">
              <span>Идеи</span> <span className="text-slate-500">3</span>
            </h3>
            <QueueCard title="Зодиак: прогноз дня для Близнецов — Reels" module="Зодиак" type="Video" badge="Reels" />
            <QueueCard title="Зодиак: 3 знака, которым повезёт — Shorts" module="Зодиак" type="Video" badge="Shorts" />
            <QueueCard title="Валюты: курс доллара и евро на сегодня — вертикальный ролик" module="Валюты" type="Video" badge="Reels" />
          </div>

          {/* Column: Сценарий */}
          <div className="space-y-3 min-w-[250px]">
            <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2 flex justify-between">
              <span>Сценарий</span> <span className="text-slate-500">2</span>
            </h3>
            <QueueCard title="Крипта: BTC/ETH/SOL — топ движения дня" module="Крипта" type="Text" badge="Post" />
            <QueueCard title="Металлы: золото и серебро сегодня — инфографика" module="Металлы" type="Image" badge="Infographic" />
          </div>

          {/* Column: Визуал */}
          <div className="space-y-3 min-w-[250px]">
            <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2 flex justify-between">
              <span>Визуал</span> <span className="text-slate-500">2</span>
            </h3>
            <QueueCard title="Недвижимость: рынок аренды Днепра — короткий обзор" module="Недвижимость" type="Video" badge="Reels" />
            <QueueCard title="Общие каналы: вечерний дайджест — Telegram post" module="Общие" type="Image" badge="Digest" />
          </div>

          {/* Column: Видео */}
          <div className="space-y-3 min-w-[250px]">
            <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2 flex justify-between">
              <span>Видео</span> <span className="text-slate-500">2</span>
            </h3>
            <QueueCard title="Зодиак: аффирмация дня — картинка" module="Зодиак" type="Video" badge="Reels" />
            <QueueCard title="Крипта: дисклеймер и риск-блок — подпись" module="Крипта" type="Video" badge="Shorts" />
          </div>

          {/* Column: Подпись */}
          <div className="space-y-3 min-w-[250px]">
            <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2 flex justify-between">
              <span>Подпись</span> <span className="text-slate-500">0</span>
            </h3>
          </div>

          {/* Column: Проверка */}
          <div className="space-y-3 min-w-[250px]">
            <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2 flex justify-between">
              <span>Проверка</span> <span className="text-slate-500">2</span>
            </h3>
            <QueueCard title="Валюты: weekly currency recap — digest" module="Валюты" type="Text" badge="Digest" review />
            <QueueCard title="Металлы: медь/алюминий — промышленный обзор" module="Металлы" type="Text" badge="Post" review />
          </div>

          {/* Column: Готово */}
          <div className="space-y-3 min-w-[250px]">
            <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2 flex justify-between">
              <span>Готово</span> <span className="text-slate-500">1</span>
            </h3>
            <QueueCard title="Зодиак: совместимость недели — carousel" module="Зодиак" type="Image" badge="Carousel" done />
          </div>

        </div>

        {/* 6. Review checklist */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Чеклист перед публикацией
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Текст вычитан",
              "Нет запрещённых обещаний",
              "Нет финансового совета",
              "Дисклеймер добавлен",
              "CTA корректный",
              "Визуал соответствует теме",
              "Дата актуальна",
              "Ручная проверка пройдена",
              "Публикация только после отдельного разрешения"
            ].map((check, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function QueueCard({ title, module, type, badge, review, done }: { title: string, module: string, type: string, badge: string, review?: boolean, done?: boolean }) {
  return (
    <div className={`rounded-lg border bg-slate-900 p-3 shadow-sm ${done ? 'border-green-500/30' : review ? 'border-amber-500/30' : 'border-slate-800'}`}>
      <div className="flex items-start justify-between mb-2 gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${done ? 'bg-green-500/20 text-green-300' : review ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
          {module}
        </span>
        <span className="text-[10px] font-medium text-slate-500 border border-slate-700 px-1 rounded">{badge}</span>
      </div>
      <p className="text-xs font-medium text-slate-200 leading-snug">{title}</p>
      <div className="mt-3 flex items-center gap-1.5 text-slate-500">
        {type === "Video" ? <Video className="h-3.5 w-3.5" /> : type === "Image" ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
        <span className="text-[10px] uppercase font-medium">{type}</span>
      </div>
    </div>
  );
}
