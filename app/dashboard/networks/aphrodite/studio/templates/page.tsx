import { Library, LayoutTemplate, ShieldCheck, Image as ImageIcon, Video, FileText, Lock, MessageSquareText } from "lucide-react";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export const dynamic = "force-dynamic";

export default function AphroditeStudioTemplatesPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/studio/templates");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        <AphroditePageHeader
          title="Шаблоны Студии Афродиты"
          description="Библиотека сценариев, промптов, Reels/Shorts, визуалов, обложек, подписей и CTA для Telegram-каналов."
          badgeText="Template Library"
          icon={Library}
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
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Templates are static</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> No generation API connected</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> No automatic Telegram publishing</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Manual review required</li>
            <li className="flex items-center gap-2"><Lock className="h-4 w-4" /> Future integrations require approval</li>
          </ul>
        </div>

        {/* 1. Template categories */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Категории Шаблонов</h2>
          <div className="flex flex-wrap gap-2">
            {["Reels / Shorts", "Telegram Video", "Image Post", "Cover / Thumbnail", "Caption", "Carousel", "Weekly Digest", "CTA", "Prompt Pack"].map((item) => (
              <span key={item} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-300">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Module presets */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Пресеты по Модулям</h2>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {["Каналы Зодиака", "Валюты", "Крипта", "Металлы", "Недвижимость", "Общие каналы"].map((preset, i) => (
              <div key={i} className="rounded-lg border border-slate-800/80 bg-slate-800/30 p-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition cursor-default">
                {preset}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Reels / Shorts script templates */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-400" />
            Reels / Shorts Script Templates
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { mod: "Каналы Зодиака", hook: "Что ждет Овна сегодня?", s1: "Карта дня", s2: "Главный совет", s3: "Осторожно!", vo: "Mystical soft voice", vis: "Astrology aesthetic, dark stars", cta: "Смотри прогноз на неделю в закрепе" },
              { mod: "Валюты", hook: "Доллар по 100 — это предел?", s1: "График за месяц", s2: "Причины роста", s3: "Что дальше", vo: "Fast professional tone", vis: "Financial charts, clean UI", cta: "Подпишись на ежедневный курс" },
              { mod: "Крипта", hook: "Почему BTC растет прямо сейчас?", s1: "Новости SEC", s2: "Киты покупают", s3: "Ключевой уровень", vo: "Energetic tech tone", vis: "Crypto coins 3D, neon tech", cta: "Больше сигналов в канале" }
            ].map((script, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-semibold text-blue-300">{script.mod}</h3>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400 uppercase">Шаблон</span>
                </div>
                <div className="text-sm text-slate-400 space-y-1">
                  <p><span className="text-slate-500 w-24 inline-block">Hook:</span> {script.hook}</p>
                  <p><span className="text-slate-500 w-24 inline-block">Scene 1:</span> {script.s1}</p>
                  <p><span className="text-slate-500 w-24 inline-block">Scene 2:</span> {script.s2}</p>
                  <p><span className="text-slate-500 w-24 inline-block">Scene 3:</span> {script.s3}</p>
                  <p><span className="text-slate-500 w-24 inline-block">Voiceover:</span> {script.vo}</p>
                  <p><span className="text-slate-500 w-24 inline-block">Subtitle:</span> Bold yellow, center</p>
                  <p><span className="text-slate-500 w-24 inline-block">Visuals:</span> {script.vis}</p>
                  <p><span className="text-slate-500 w-24 inline-block">CTA:</span> {script.cta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Image prompt templates */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-emerald-400" />
            Image Prompt Templates
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { title: "Zodiac Daily Forecast", desc: "Mystical tarot card style, glowing zodiac sign, cosmic background, dark purple and gold, 8k resolution, highly detailed." },
              { title: "Currency Rate Image", desc: "Clean financial dashboard aesthetic, flat design, big bold numbers, green and red arrows, minimalist." },
              { title: "Crypto Top-10 Image", desc: "Cyberpunk aesthetic, neon lighting, glowing bitcoin logo, 3d rendered, dark tech background." },
              { title: "Metals Daily Image", desc: "Industrial close-up, shiny gold bars and silver coins, hyper-realistic, dramatic lighting, financial wealth." },
              { title: "Real Estate Market", desc: "Luxury modern apartment interior, bright sunlight, wide angle lens, premium architecture photography." }
            ].map((img, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-emerald-300 text-sm mb-2">{img.title}</h3>
                  <p className="font-mono text-xs text-slate-400 leading-relaxed">{img.desc}</p>
                </div>
                <div className="mt-4">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 uppercase">Пример</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Telegram caption templates */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-cyan-400" />
            Telegram Caption Templates
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "📅 Дата: {date}\n\n🌟 {module}: Главные новости дня.\n\n📊 Текущий показатель: {main_value}\n\n🔥 {cta}\n\n📝 Источник: {source_note}",
              "🚀 Срочные новости! {module} обновляет максимумы.\n\nЗначение сегодня: {main_value} ({date}).\n\n👇 Что думаете об этом? Пишите в комментарии!\n\n{cta}\n\nДанные от {source_note}."
            ].map((cap, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300">{cap}</pre>
                <div className="mt-3 flex justify-end">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 uppercase">Черновик</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Cover / Thumbnail templates */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-pink-400" />
            Cover / Thumbnail Templates
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { name: "Bold Number", desc: "Giant numbers, minimal background" },
              { name: "Dark Premium", desc: "Black background, gold text" },
              { name: "Zodiac Mystical", desc: "Stars, constellations, glowing text" },
              { name: "Finance Clean", desc: "White bg, blue accents, charts" },
              { name: "Metals Industrial", desc: "Metallic textures, heavy font" },
              { name: "Real Estate Local", desc: "Cityscape backdrop, bold labels" }
            ].map((thumb, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <h3 className="font-semibold text-pink-300 text-sm">{thumb.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{thumb.desc}</p>
                <div className="mt-3">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 uppercase">Только просмотр</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
