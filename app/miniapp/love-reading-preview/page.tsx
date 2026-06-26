import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";
import { createAphroditeLoveReadingFoundationPreview } from "@/lib/zodiac/aphrodite-ai-love-reading-foundation";
import { getAphroditeVipOfferSections } from "@/lib/zodiac/aphrodite-paywall-readiness";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "AI Love Reading — бесплатный preview",
  description: "Локальный безопасный preview AI Love Reading. Без оплаты и без вызова Telegram API.",
};

// Локальный детерминированный пример из существующей модели (Package 136). Без AI-вызовов.
const sample = createAphroditeLoveReadingFoundationPreview({
  firstName: "Вы",
  partnerName: "Он/она",
  firstSign: "leo",
  partnerSign: "scorpio",
});
const fullLoveReportSection = getAphroditeVipOfferSections().find((section) => section.id === "full-love-report");

// Видимый текст — на русском. Превью носит иллюстративный характер.
const PREVIEW_BLOCKS = [
  { label: "Главная энергия связи", text: "Между вами может ощущаться тёплая, но непростая динамика: притяжение есть, и одновременно есть зона напряжения, за которой стоит мягко наблюдать." },
  { label: "Сильная сторона", text: "Ваша искренность часто помогает другому человеку почувствовать себя нужным и увиденным." },
  { label: "Зона риска", text: "Возможная зона внимания: чувства могут копиться молча, если их бережно не проговаривать." },
  { label: "Следующий шаг", text: "Мягкий следующий шаг: назвать одно настоящее чувство спокойно и без давления." },
];

const FUTURE_LOVE_REPORT = [
  "что он/она чувствует",
  "почему он/она отдаляется",
  "прогноз на 30 дней",
  "red flags",
  "личный совет",
];

const SAFETY_BOUNDARIES = [
  { token: "no-payment", label: "Нет оплаты" },
  { token: "no-real-vip-unlock", label: "Нет реальной VIP-разблокировки" },
  { token: "no-telegram-api-call", label: "Нет вызова Telegram API" },
  { token: "no-database-write", label: "Нет записи в базу данных" },
  { token: "local-preview-only", label: "Только локальный preview" },
];

export default function LoveReadingPreviewPage() {
  recordAphroditeMiniAppNoopIntegrationPoint("route-love-reading-opened");
  recordAphroditeMiniAppNoopIntegrationPoint("route-love-reading-preview-viewed");
  recordAphroditeMiniAppNoopIntegrationPoint("route-full-love-report-teaser-viewed");
  recordAphroditeMiniAppNoopIntegrationPoint("route-free-preview-fallback-shown");

  return (
    <div className="flex min-h-screen flex-col bg-[#070b14] text-slate-100 font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#070b14]/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <Heart className="h-5 w-5 text-rose-400" />
          <h1 className="text-base font-semibold text-slate-100">AI Love Reading</h1>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
        <section className="rounded-2xl border border-rose-900/40 bg-gradient-to-br from-rose-950/30 via-fuchsia-950/20 to-slate-900/40 p-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 border border-slate-800 px-3 py-1 text-xs text-rose-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Бесплатный preview
          </div>
          <h2 className="text-2xl font-bold text-white">AI Love Reading</h2>
          <p className="mt-2 text-sm leading-6 text-rose-100/90">
            Узнай, что между вами происходит, что он может чувствовать и где ваша главная зона риска.
          </p>
          <p className="mt-3 text-xs text-slate-400">{sample.headline} · пример рассчитан локально, данные не сохраняются.</p>
        </section>

        <section className="space-y-3">
          {PREVIEW_BLOCKS.map((b) => (
            <div key={b.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-[11px] uppercase tracking-wide text-emerald-400">{b.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-200">{b.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-800 bg-black/30 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Что будет в полном Love Report позже</p>
          <p className="text-sm text-slate-400">{FUTURE_LOVE_REPORT.join(" · ")}</p>
          <p className="mt-2 text-[11px] text-slate-500">Полный разбор пока не открыт. Здесь это только пояснение — без оплаты и без VIP-разблокировки.</p>
        </section>

        {fullLoveReportSection ? (
          <section className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4">
            <p className="text-[11px] uppercase tracking-wide text-rose-300">Что будет в полном Love Report позже</p>
            <p className="mt-2 text-sm leading-6 text-rose-100/90">{fullLoveReportSection.description}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {fullLoveReportSection.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400">Сейчас доступен бесплатный preview</span>
              <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400">Полная версия будет подключена позже</span>
              <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400">Нет оплаты</span>
              <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400">Нет реальной VIP-разблокировки</span>
            </div>
          </section>
        ) : null}

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Границы безопасности
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SAFETY_BOUNDARIES.map((b) => (
              <span
                key={b.token}
                data-boundary={b.token}
                className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-emerald-400 border border-slate-700"
              >
                {b.label}
              </span>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-2">
          <Link href="/compatibility" className="flex items-center justify-center rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-400 transition active:scale-[0.98]">
            Проверить связь
          </Link>
          <Link href="/miniapp" className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
            <ArrowLeft className="h-4 w-4" /> Вернуться к модулям
          </Link>
        </div>
      </main>
    </div>
  );
}
