import type { Metadata } from "next";

import {
  CosmicSiteShell,
  SiteCTA,
  SiteHero,
  SiteSection,
  ZodiacSignCard,
  ZodiacWheel,
} from "@/components/public-site/CosmicSite";
import { zodiacPublicSigns } from "@/lib/public-website";

export const metadata: Metadata = {
  title: "Знаки зодиака — 12 мистических профилей",
  description: "Индекс 12 знаков зодиака: стихия, энергия, стиль любви и дневной teaser для Telegram Mini App.",
  openGraph: {
    title: "Знаки зодиака",
    description: "12 красивых public pages для знаков зодиака.",
    type: "website",
  },
};

export default function ZodiacIndexPage() {
  return (
    <CosmicSiteShell activePath="/zodiac">
      <SiteHero
        eyebrow="zodiac index"
        title="12 знаков как ночная карта характера"
        description="Выбери знак и открой короткий мистический профиль: стихия, энергия, любовь, сильные стороны и дневной teaser."
        primaryLabel="Открыть в Telegram"
        secondaryLabel="Выбрать знак"
        visual={<ZodiacWheel signs={zodiacPublicSigns} />}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {zodiacPublicSigns.map((sign) => (
          <ZodiacSignCard key={sign.slug} sign={sign} />
        ))}
      </section>

      <SiteSection
        eyebrow="В Mini App"
        title="Знак — только вход в личный ритуал"
        description="В Telegram можно выбрать карту дня, совместимость, прогноз и другие мягкие мистические форматы."
      >
        <div className="rounded-lg border border-white/12 bg-white/[0.055] p-5 text-sm leading-7 text-slate-300">
          Public pages помогают быстро почувствовать настроение знака. Персональный сценарий открывается внутри Telegram Mini App.
        </div>
      </SiteSection>

      <SiteCTA />
    </CosmicSiteShell>
  );
}
