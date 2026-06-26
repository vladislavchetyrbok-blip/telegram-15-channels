import Link from "next/link";
import { CalendarDays, FileText, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { AphroditeHoroscopeCard } from "@/components/zodiac-mini-app/AphroditeHoroscopeCard";
import {
  APHRODITE_HOROSCOPE_VISUAL_CARDS_RULE,
  getAphroditeHoroscopeVisualCards,
} from "@/lib/zodiac/aphrodite-horoscope-visual-cards";

const cardsModel = getAphroditeHoroscopeVisualCards();

export const metadata = {
  title: cardsModel.title,
};

export default function AphroditeHoroscopeVisualCardsPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <CalendarDays className="h-4 w-4" />
            <span>Aphrodite / Horoscope visual cards / Package 203</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{cardsModel.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{cardsModel.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Daily, weekly и monthly horoscope cards получают единый visual pattern: sign label, period label,
            main theme, love/relationship section, energy section, zone of attention и безопасный CTA/fallback area.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_HOROSCOPE_VISUAL_CARDS_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {cardsModel.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="visual cards" value={String(cardsModel.cards.length)} />
          <Metric label="publishingChangedNow" value={String(cardsModel.safetyFlags.publishingChangedNow)} tone="rose" />
          <Metric label="ledgerChangedNow" value={String(cardsModel.safetyFlags.ledgerChangedNow)} tone="rose" />
          <Metric label="telegramApiNow" value={String(cardsModel.safetyFlags.telegramApiNow)} tone="rose" />
        </section>

        <ReviewSection title="preview карточек" icon={<Sparkles className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-4 xl:grid-cols-3">
            {cardsModel.cards.map((card) => (
              <AphroditeHoroscopeCard key={card.periodType} card={card} />
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <ReviewSection title="обязательная структура" icon={<FileText className="h-5 w-5 text-cyan-400" />}>
            <div className="grid gap-2 md:grid-cols-2">
              {cardsModel.requiredStructure.map((item) => (
                <div key={item} className="rounded-lg border border-slate-800 bg-black/20 px-3 py-2 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="границы безопасности" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {Object.entries(cardsModel.safetyFlags).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="font-mono text-xs text-slate-500">{key}</div>
                  <p className="mt-1 text-sm font-medium text-emerald-300">{String(value)}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="следующий рекомендуемый пакет" icon={<CalendarDays className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{cardsModel.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Zodiac Network
            </Link>
            <Link href="/dashboard/networks/zodiac/vip-natal-numerology-visual-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Review визуала VIP / Natal / Numerology
            </Link>
            <Link href="/dashboard/networks/zodiac/design-tokens-ui-shell" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Design Tokens & UI Shell
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-medium text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : "text-emerald-300";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
