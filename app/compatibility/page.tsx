import type { Metadata } from "next";

import { CosmicSiteShell, ProfilePanel, SiteCTA, SiteHero, SiteSection } from "@/components/public-site/CosmicSite";
import { PublicArtHero } from "@/components/public-site/PublicArtHero";
import { ZodiacCompatibilityMiniApp } from "@/components/ZodiacCompatibilityMiniApp";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "Совместимость знаков — мистический Telegram Mini App",
  description: "Love compatibility landing page для Telegram Mini App: мягкий взгляд на пару, общение и точки бережности.",
  openGraph: {
    title: "Совместимость знаков",
    description: "Мистическая страница о совместимости без fake guarantees и давления.",
    type: "website",
  },
};

interface CompatibilityPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function CompatibilityPage({ searchParams = {} }: CompatibilityPageProps) {
  if (shouldRenderMiniApp(searchParams)) {
    recordAphroditeMiniAppNoopIntegrationPoint("route-compatibility-opened");

    return (
      <ZodiacCompatibilityMiniApp
        variant="public"
        initialSign={firstParam(searchParams.sign)}
        initialMode={firstParam(searchParams.mode)}
        source={firstParam(searchParams.source)}
        startParam={firstParam(searchParams.startapp) || firstParam(searchParams.tgWebAppStartParam) || firstParam(searchParams.start)}
      />
    );
  }

  return (
    <CosmicSiteShell activePath="/compatibility">
      <SiteHero
        eyebrow="СОВМЕСТИМОСТЬ"
        title="Совместимость как мягкая карта отношений"
        description="Не обещание будущего и не оценка пары. Это красивый способ посмотреть на ритм общения, сильные стороны и места, где нужна бережность."
        primaryLabel="Открыть в Telegram"
        secondaryLabel="Узнать совместимость"
        layout="immersive"
        visual={
          <PublicArtHero
            mobileSrc="/public-site/art/compatibility/compatibility-orbs-mobile.webp"
            desktopSrc="/public-site/art/compatibility/compatibility-orbs-desktop.webp"
            variant="immersive"
            theme="compatibility"
            priority
          />
        }
      />

      <SiteSection
        eyebrow="Внутри сценария"
        title="Что можно увидеть"
        description="Mini App помогает рассмотреть пару спокойно: через знаки, настроение, язык общения и маленькие действия."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <ProfilePanel title="Ритм пары">
            Как вы сближаетесь, где легко договариваться и где лучше замедлиться.
          </ProfilePanel>
          <ProfilePanel title="Сильные стороны">
            Что поддерживает контакт: тепло, честность, общая цель или способность слышать друг друга.
          </ProfilePanel>
          <ProfilePanel title="Точки бережности">
            Где важно не давить, не угадывать за другого и выбирать ясные слова.
          </ProfilePanel>
        </div>
      </SiteSection>

      <SiteSection
        eyebrow="Без давления"
        title="Совместимость не решает за вас"
        description="Формат создан для саморефлексии и разговора, а не для страха, контроля или громких гарантий."
      >
        <div className="rounded-lg border border-amber-100/18 bg-black/20 p-5 text-sm leading-7 text-slate-300">
          Лучший результат — не «идеальный процент», а ясность: что между вами сейчас, какой тон выбрать и какой маленький шаг может сделать контакт спокойнее.
        </div>
      </SiteSection>

      <SiteCTA
        title="Открой совместимость в Telegram"
        text="Запусти Mini App и выбери сценарий для пары в тёмной, спокойной cosmic эстетике."
      />
    </CosmicSiteShell>
  );
}

function shouldRenderMiniApp(searchParams: Record<string, string | string[] | undefined>) {
  return Boolean(
    firstParam(searchParams.miniapp) ||
      firstParam(searchParams.startapp) ||
      firstParam(searchParams.tgWebAppStartParam) ||
      firstParam(searchParams.start) ||
      firstParam(searchParams.sign) ||
      firstParam(searchParams.mode),
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
