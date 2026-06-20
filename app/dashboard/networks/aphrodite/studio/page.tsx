import { Clapperboard, MonitorPlay, Palette, ShieldCheck, Sparkles, Video, ListTree, ArrowRight, FileText, Image as ImageIcon, Layout, PlaySquare, Settings, Lock } from "lucide-react";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export const dynamic = "force-dynamic";

export default function AphroditeStudioPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/studio");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        <AphroditePageHeader
          title="Афродита Студия"
          description="Фабрика контента для Telegram-каналов: идеи, сценарии, Reels, Shorts, визуалы, обложки и подготовка публикаций."
          badgeText="Content Factory"
          icon={Clapperboard}
          safetyLocked={true}
          safetyMessage="API отключены / Только чтение"
        />

        {/* Safety Block */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-amber-500">Система Безопасности</h2>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm text-amber-200/80">
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> No live generation APIs connected</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> No API keys stored</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> No Telegram publishing from Studio yet</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Manual review required</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Future integrations must be approved</li>
          </ul>
        </div>

        {/* 1. Studio Overview & 2. Content Pipeline */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Обзор Студии
            </h2>
            <div className="flex flex-wrap gap-2">
              {["идеи", "сценарии", "сториборды", "короткие видео", "Reels / Shorts", "картинки", "обложки", "подписи", "очередь генерации", "проверка перед публикацией"].map((item) => (
                <span key={item} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
          
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-center">
            <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
              <ListTree className="h-5 w-5 text-purple-400" />
              Content Pipeline
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 font-medium">
              <span>Идея</span> <ArrowRight className="h-4 w-4 text-slate-600" />
              <span>Сценарий</span> <ArrowRight className="h-4 w-4 text-slate-600" />
              <span>Сториборд</span> <ArrowRight className="h-4 w-4 text-slate-600" />
              <span>Визуал</span> <ArrowRight className="h-4 w-4 text-slate-600" />
              <span>Видео</span> <ArrowRight className="h-4 w-4 text-slate-600" />
              <span>Подпись</span> <ArrowRight className="h-4 w-4 text-slate-600" />
              <span className="text-blue-400">Проверка</span> <ArrowRight className="h-4 w-4 text-slate-600" />
              <span className="text-emerald-400">План публикации</span>
            </div>
          </div>
        </div>

        {/* 3. Content Types */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Content Types</h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            {[
              { icon: PlaySquare, label: "Reels / Shorts" },
              { icon: Video, label: "Telegram Video" },
              { icon: ImageIcon, label: "Telegram Image Post" },
              { icon: Layout, label: "Story / Vertical Post" },
              { icon: Palette, label: "Cover / Thumbnail" },
              { icon: FileText, label: "Text Caption" },
              { icon: Layout, label: "Carousel / подборка" },
              { icon: FileText, label: "Weekly Digest" }
            ].map((type, i) => (
              <div key={i} className="rounded-lg border border-slate-800/80 bg-slate-800/30 p-4 text-center hover:bg-slate-800/50 transition">
                <type.icon className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                <div className="text-xs font-medium text-slate-300">{type.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Module-specific Studio presets */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Module-specific Presets</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Каналы Зодиака", canGen: "Ежедневные гороскопы, советы", example: "Овен: 3 правила дня", format: "Vertical Video (9:16)" },
              { title: "Валюты", canGen: "Ежедневные курсы, тренды", example: "Доллар вырос? Что делать", format: "Carousel (4:5)" },
              { title: "Крипта", canGen: "Топ-10 монет, аналитика", example: "Почему BTC растет сегодня", format: "Vertical Video (9:16)" },
              { title: "Металлы", canGen: "Золото и серебро инфографика", example: "Цены на золото достигли пика", format: "Square Image (1:1)" },
              { title: "Недвижимость", canGen: "Обзоры рынка, советы", example: "Топ-5 квартир до $100k", format: "Telegram Video (16:9)" },
              { title: "Общие каналы", canGen: "Мемы, новости, подборки", example: "Главные новости за неделю", format: "Weekly Digest" }
            ].map((preset, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <h3 className="font-semibold text-white mb-2">{preset.title}</h3>
                <div className="space-y-1 text-sm text-slate-400">
                  <p><span className="text-slate-500">Content:</span> {preset.canGen}</p>
                  <p><span className="text-slate-500">Example:</span> {preset.example}</p>
                  <p><span className="text-slate-500">Format:</span> {preset.format}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 uppercase">Draft / Template Only</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Reels/Shorts workflow & 7. Prompt templates */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Reels / Shorts Workflow</h2>
            <ul className="space-y-3">
              {[
                "1. Hook (Первые 3 секунды)",
                "2. 3–5 short scenes",
                "3. Voiceover text",
                "4. Visual prompts",
                "5. Captions / subtitles",
                "6. Music / mood note",
                "7. CTA (Call to Action)",
                "8. Publish checklist"
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-800/30 px-4 py-2 text-sm text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-400">{i + 1}</div>
                  {step.substring(3)}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Prompt Templates</h2>
            <div className="space-y-3">
              {[
                { title: "Script prompt", desc: "Напиши сценарий для Reels (до 30 сек)..." },
                { title: "Image prompt", desc: "Cinematic, high contrast, minimalist 8k..." },
                { title: "Video prompt", desc: "Slow zoom in, dynamic lighting..." },
                { title: "Caption prompt", desc: "Напиши вовлекающий текст для поста с CTA..." },
                { title: "Thumbnail prompt", desc: "Bold centered text, expressive face..." }
              ].map((prompt, i) => (
                <div key={i} className="rounded-lg border border-slate-800/80 bg-slate-800/30 p-3">
                  <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">{prompt.title}</div>
                  <div className="font-mono text-xs text-slate-400">{prompt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Mock generation queue */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <MonitorPlay className="h-5 w-5 text-blue-400" />
            Mock Generation Queue
          </h2>
          <div className="space-y-3">
            {[
              { title: "Зодиак: прогноз дня — Reels", status: "review", color: "text-amber-400", bg: "bg-amber-400/10" },
              { title: "Валюты: курс дня — Shorts", status: "waiting assets", color: "text-blue-400", bg: "bg-blue-400/10" },
              { title: "Крипта: топ-10 — вертикальный ролик", status: "future render", color: "text-purple-400", bg: "bg-purple-400/10" },
              { title: "Металлы: золото/серебро — инфографика", status: "draft", color: "text-slate-400", bg: "bg-slate-400/10" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800">
                    <Video className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="font-medium text-slate-200">{item.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${item.color} ${item.bg}`}>
                    {item.status}
                  </span>
                  <button disabled className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-slate-500 cursor-not-allowed opacity-50">
                    Render (Disabled)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
