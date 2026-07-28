import type { Metadata } from "next";

import {
  CosmicSiteShell,
  PageHeader,
  ProfilePanel,
  SiteCTA,
  SiteHero,
  SiteSection,
} from "@/components/public-site/CosmicSite";
import { PublicArtHero } from "@/components/public-site/PublicArtHero";

export const metadata: Metadata = {
  title: "Карта дня — Таро в Telegram Mini App",
  description: "Премиальная страница Карты дня: значение дня, любовь, совет и действие в мистическом Telegram Mini App.",
  openGraph: {
    title: "Карта дня — Zodiac Love Check",
    description: "Один старший аркан для дневного настроя и мягкой саморефлексии.",
    type: "website",
  },
};

export default function TarotLandingPage() {
  return (
    <CosmicSiteShell activePath="/tarot">
      <SiteHero
        eyebrow="КАРТА ДНЯ"
        title="Карта дня, которая звучит тихо и красиво"
        description="Один старший аркан открывается как маленький дневной ритуал: без фатальных обещаний, без давления, с вниманием к настрою и любви."
        primaryLabel="Открыть в Telegram"
        layout="immersive"
        visual={
          <PublicArtHero
            mobileSrc="/public-site/art/tarot/tarot-ritual-hero-mobile.webp"
            desktopSrc="/public-site/art/tarot/tarot-ritual-hero-desktop.webp"
            variant="immersive"
            theme="tarot"
            priority
          />
        }
      />

      <SiteSection
        eyebrow="Формат"
        title="Что открывает карта"
        description="В Mini App карта дня собирает короткую интерпретацию в четыре спокойных блока."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <ProfilePanel title="Значение дня">
            Главный тон дня: где стоит замедлиться, что подсвечено и какой знак можно принять без спешки.
          </ProfilePanel>
          <ProfilePanel title="Любовь">
            Мягкая подсказка для отношений: не прогноз, а повод услышать себя и другого внимательнее.
          </ProfilePanel>
          <ProfilePanel title="Совет">
            Короткая фраза, которую легко держать в голове в течение дня.
          </ProfilePanel>
          <ProfilePanel title="Действие">
            Маленький шаг, который помогает перевести символ карты в реальный жест.
          </ProfilePanel>
        </div>
      </SiteSection>

      <PageHeader
        eyebrow="Эстетика"
        title="Тёмная карта, золото и спокойная глубина"
        description="Mini App показывает аккуратную premium-карту без технических надписей, лишних блоков и визуального шума."
        headingLevel="h2"
      />

      <SiteCTA
        title="Открой карту дня в Telegram"
        text="Запусти Mini App и получи личный аркан дня в красивом, мобильном интерфейсе."
      />
    </CosmicSiteShell>
  );
}
