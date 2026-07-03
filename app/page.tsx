import type { Metadata } from "next";

import {
  CosmicSiteShell,
  SiteCTA,
  SiteFeatureCard,
  SiteHero,
  SiteSection,
  StepCard,
  TarotAndOrbVisual,
  ZodiacSignCard,
  ZodiacWheel,
} from "@/components/public-site/CosmicSite";
import { publicFeatureCards, zodiacPublicSigns } from "@/lib/public-website";

export const metadata: Metadata = {
  title: "Zodiac Love Check — мистический Telegram Mini App",
  description: "Премиальный мистический портал: карта дня, совместимость, знаки зодиака и мягкие подсказки в Telegram Mini App.",
  openGraph: {
    title: "Zodiac Love Check",
    description: "Карта дня, совместимость и 12 знаков в тёмной cosmic эстетике.",
    type: "website",
  },
};

export default function PublicHomePage() {
  return (
    <CosmicSiteShell activePath="/">
      <SiteHero
        eyebrow="mystic cosmic portal"
        title="Карта, знак и любовь в одном ночном ритуале"
        description="Открой красивый Telegram Mini App: ежедневная карта Таро, совместимость пары, знаки зодиака и мягкие подсказки без шума и лишних обещаний."
        secondaryLabel="Узнать совместимость"
        visual={<TarotAndOrbVisual />}
      />

      <SiteSection
        eyebrow="Внутри портала"
        title="Мистический интерфейс без тяжёлых обещаний"
        description="Короткие форматы, глубокая атмосфера и аккуратная подача для ежедневного возвращения в Mini App."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {publicFeatureCards.map((feature, index) => (
            <SiteFeatureCard
              key={feature.title}
              {...feature}
              className={index === 0 ? "lg:col-span-2 lg:row-span-2 lg:p-6" : "lg:col-span-2"}
            />
          ))}
        </div>
      </SiteSection>

      <SiteSection
        eyebrow="Как это работает"
        title="Один вход, несколько мягких сценариев"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <StepCard index="01" title="Открой Telegram" text="Переход ведёт только в бот Mini App, без скрытых страниц и внешних оплат." />
          <StepCard index="02" title="Выбери карту, знак или совместимость" text="Сценарии короткие, читаемые и подходят для просмотра с телефона." />
          <StepCard index="03" title="Получай личный мистический прогноз" text="Формат создан для саморефлексии, настроя и бережного дневного ритуала." />
        </div>
      </SiteSection>

      <SiteSection
        eyebrow="Зодиак"
        title="12 знаков как мини-профили"
        description="Каждый знак получил отдельную public page: элемент, энергия, стиль любви и дневной teaser."
      >
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-center">
          <ZodiacWheel signs={zodiacPublicSigns} />
          <div className="grid gap-3 sm:grid-cols-2">
            {zodiacPublicSigns.map((sign) => (
              <ZodiacSignCard key={sign.slug} sign={sign} />
            ))}
          </div>
        </div>
      </SiteSection>

      <SiteCTA />
    </CosmicSiteShell>
  );
}
