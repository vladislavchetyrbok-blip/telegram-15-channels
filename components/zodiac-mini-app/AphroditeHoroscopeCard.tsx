import { Heart, Sparkles, Zap } from "lucide-react";
import type { ReactNode } from "react";

import type { AphroditeHoroscopeVisualCardDefinition } from "@/lib/zodiac/aphrodite-horoscope-visual-cards";
import { AphroditeHoroscopePeriodBadge } from "@/components/zodiac-mini-app/AphroditeHoroscopePeriodBadge";

export function AphroditeHoroscopeCard({
  card,
}: {
  card: AphroditeHoroscopeVisualCardDefinition;
}) {
  return (
    <article
      className="rounded-lg border border-white/10 bg-slate-950 p-4 text-slate-100 shadow-sm"
      data-aphrodite-horoscope-card={card.periodType}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">{card.title}</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{card.signLabel}</h2>
        </div>
        <AphroditeHoroscopePeriodBadge periodType={card.periodType} periodLabel={card.periodLabel} />
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p className="text-[11px] font-semibold uppercase text-emerald-200">Главная тема</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{card.mainTheme}</p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <HoroscopeMiniBlock icon={<Heart className="h-4 w-4" />} title="Любовь" text={card.loveRelationship} />
        <HoroscopeMiniBlock icon={<Zap className="h-4 w-4" />} title="Энергия" text={card.energy} />
        <HoroscopeMiniBlock icon={<Sparkles className="h-4 w-4" />} title="Зона внимания" text={card.attentionZone} />
      </div>

      <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3">
        <p className="text-[11px] font-semibold uppercase text-emerald-200">CTA/fallback area</p>
        <p className="mt-1 text-sm leading-6 text-emerald-50">{card.ctaFallback}</p>
      </div>
    </article>
  );
}

function HoroscopeMiniBlock({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-300">{text}</p>
    </div>
  );
}
