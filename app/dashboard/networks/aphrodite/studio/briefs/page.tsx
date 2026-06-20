import { FileText, ShieldCheck, Lock, Edit3, Type, ListTree, ArrowRight, Presentation, Video, Image as ImageIcon } from "lucide-react";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export const dynamic = "force-dynamic";

export default function AphroditeStudioBriefsPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/studio/briefs");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        <AphroditePageHeader
          title="Брифы Студии Афродиты"
          description="Конструктор контент-брифов: тема, канал, формат, хук, сценарий, визуал, подпись, CTA и проверка перед публикацией."
          badgeText="Brief Builder"
          icon={Edit3}
          safetyLocked={true}
          safetyMessage="API отключены / Только чтение"
        />

        {/* 7. Safety Block */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-amber-500">Система Безопасности</h2>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm text-amber-200/80">
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Брифы только для просмотра</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Сохранение не подключено</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Генерация не подключена</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Публикация в Telegram отключена</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> API-ключи не используются</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Серверных записей нет</li>
            <li className="flex items-center gap-2 col-span-full"><Lock className="h-4 w-4" /> Подключение реальной генерации только отдельным пакетом после approval</li>
          </ul>
        </div>

        {/* Links to other Studio sections */}
        <div className="flex flex-wrap gap-3">
          <a href="/dashboard/networks/aphrodite/studio" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Студия</a>
          <a href="/dashboard/networks/aphrodite/studio/templates" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Шаблоны</a>
          <a href="/dashboard/networks/aphrodite/studio/queue" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Очередь</a>
          <a href="/dashboard/networks/aphrodite/calendar" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Календарь</a>
        </div>

        {/* 1. Brief Overview */}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Черновики брифов", val: 8, col: "text-slate-400" },
            { label: "Готовы к сценарию", val: 3, col: "text-blue-400" },
            { label: "Нужен визуал", val: 2, col: "text-pink-400" },
            { label: "На проверке", val: 2, col: "text-amber-400" },
            { label: "Готовы к очереди", val: 1, col: "text-green-400" }
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
              <div className="text-sm font-medium text-slate-400 mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.col}`}>{stat.val}</div>
            </div>
          ))}
        </div>

        {/* 6. Brief → Queue Flow */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 overflow-x-auto">
          <h2 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ListTree className="h-4 w-4" /> Жизненный цикл брифа
          </h2>
          <div className="flex min-w-max items-center gap-2 text-sm font-medium">
            <span className="rounded bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-blue-300">Бриф</span>
            <ArrowRight className="h-4 w-4 text-slate-600" />
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Сценарий</span>
            <ArrowRight className="h-4 w-4 text-slate-600" />
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Промпт</span>
            <ArrowRight className="h-4 w-4 text-slate-600" />
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Очередь Студии</span>
            <ArrowRight className="h-4 w-4 text-slate-600" />
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">Проверка</span>
            <ArrowRight className="h-4 w-4 text-slate-600" />
            <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300">План публикации</span>
          </div>
        </div>

        {/* 2. Brief Structure & 5. Prompt Builder Preview */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Brief Structure View */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Структура Брифа (Шаблон)
            </h2>
            <div className="space-y-2">
              {["Модуль", "Канал", "Формат", "Цель", "Хук", "Сценарий", "Визуальный стиль", "Промпт", "Подпись", "CTA", "Проверка"].map((field) => (
                <div key={field} className="flex items-center gap-3 rounded bg-slate-800/50 px-3 py-2 text-sm border border-slate-800/80">
                  <span className="w-40 font-medium text-slate-400">{field}</span>
                  <span className="text-slate-500 italic">[{field} placeholder]</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
               <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 uppercase">Пример</span>
            </div>
          </div>

          {/* Prompt Builder Preview */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
              <Type className="h-5 w-5 text-teal-400" />
              Конструктор Промптов (Preview)
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 uppercase">Script Prompt</label>
                <div className="rounded border border-slate-700 bg-slate-800 p-2 text-sm text-slate-300 min-h-[60px]">
                  Write a 3-scene script about...
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 uppercase">Image Prompt</label>
                <div className="rounded border border-slate-700 bg-slate-800 p-2 text-sm text-slate-300 min-h-[60px]">
                  Astrology aesthetic, glowing signs...
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 uppercase">Video Prompt</label>
                  <div className="rounded border border-slate-700 bg-slate-800 p-2 text-sm text-slate-500 italic min-h-[40px]">Not needed</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 uppercase">Caption Prompt</label>
                  <div className="rounded border border-slate-700 bg-slate-800 p-2 text-sm text-slate-300 min-h-[40px]">Short CTA text...</div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 uppercase">Thumbnail Prompt</label>
                <div className="rounded border border-slate-700 bg-slate-800 p-2 text-sm text-slate-300 min-h-[40px]">Bold text overlay...</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
               <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 uppercase">Только просмотр</span>
               <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 uppercase">Будущий этап</span>
            </div>
          </div>
        </div>

        {/* 4. Brief Template Blocks */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <Presentation className="h-5 w-5 text-rose-400" />
            Блоки Шаблонов
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Reels Brief Template", type: "Video" },
              { title: "Shorts Brief Template", type: "Video" },
              { title: "Telegram Image Brief Template", type: "Image" },
              { title: "Carousel Brief Template", type: "Gallery" },
              { title: "Market Digest Brief Template", type: "Text" },
              { title: "Zodiac Daily Brief Template", type: "Mixed" }
            ].map((bt, i) => (
              <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 hover:bg-slate-900/80 transition cursor-default">
                <h3 className="font-medium text-slate-200">{bt.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Формат: {bt.type}</p>
                <div className="mt-3">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400 uppercase">Шаблон</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Example Brief Cards */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-400" />
            Примеры Контент-Брифов
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Зодиак: прогноз дня для Близнецов — Reels",
                module: "Зодиак",
                format: "Video / Reels",
                hook: "Близнецы, вас ждёт сюрприз сегодня",
                outline: "Сцена 1: Утро, Сцена 2: Работа, Сцена 3: Вечер",
                visual: "Mystical, bright colors",
                cta: "Подписывайся на гороскоп",
                status: "Черновик",
                icon: Video
              },
              {
                title: "Зодиак: совместимость недели — Carousel",
                module: "Зодиак",
                format: "Image Carousel",
                hook: "С кем Овну стоит общаться на этой неделе?",
                outline: "Слайд 1: Овен+Лев, Слайд 2: Овен+Близнецы...",
                visual: "Dark background, stars",
                cta: "Сохрани чтобы не забыть",
                status: "Пример",
                icon: ImageIcon
              },
              {
                title: "Валюты: курс доллара и евро — Shorts",
                module: "Валюты",
                format: "Video / Shorts",
                hook: "Доллар снова растет?",
                outline: "Инфографика изменения курса за 7 дней",
                visual: "Clean UI, finance charts",
                cta: "Больше курсов в канале",
                status: "На проверке",
                icon: Video
              },
              {
                title: "Крипта: BTC/ETH/SOL движение дня — Telegram Video",
                module: "Крипта",
                format: "Telegram Square Video",
                hook: "Топ 3 монеты этого дня",
                outline: "Обзор цены BTC, ETH, SOL",
                visual: "Neon tech grid",
                cta: "Наш VIP канал",
                status: "Черновик",
                icon: Video
              },
              {
                title: "Металлы: золото и серебро — Image Post",
                module: "Металлы",
                format: "Telegram Post + Image",
                hook: "Золото бьет рекорды",
                outline: "Текстовый блок о ценах на унцию",
                visual: "Gold bars photorealistic",
                cta: "Следи за металлами",
                status: "Черновик",
                icon: ImageIcon
              },
              {
                title: "Недвижимость: аренда Днепра — Short Market Review",
                module: "Недвижимость",
                format: "Telegram Post",
                hook: "Где дешевле снять квартиру?",
                outline: "Топ 3 района по аренде",
                visual: "City map layout",
                cta: "Все объявления по ссылке",
                status: "Пример",
                icon: FileText
              }
            ].map((brief, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm leading-tight">{brief.title}</h3>
                    <div className="flex gap-2 items-center mt-2">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 uppercase">{brief.module}</span>
                      <span className="text-[10px] text-slate-500 border border-slate-700 px-1 rounded">{brief.status}</span>
                    </div>
                  </div>
                  <brief.icon className="h-4 w-4 text-slate-500 shrink-0" />
                </div>
                <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                  <p><span className="text-slate-500 w-20 inline-block">Формат:</span> {brief.format}</p>
                  <p><span className="text-slate-500 w-20 inline-block">Хук:</span> <span className="text-slate-300 italic">&quot;{brief.hook}&quot;</span></p>
                  <p><span className="text-slate-500 w-20 inline-block">Сценарий:</span> {brief.outline}</p>
                  <p><span className="text-slate-500 w-20 inline-block">Визуал:</span> {brief.visual}</p>
                  <p><span className="text-slate-500 w-20 inline-block">CTA:</span> {brief.cta}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-600 flex justify-end">
                  Сохранение не подключено
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
