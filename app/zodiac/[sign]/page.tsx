import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CosmicSiteShell,
  ProfilePanel,
  SiteCTA,
  SiteHero,
  SiteSection,
  ZodiacProfileVisual,
  ZodiacSignCard,
} from "@/components/public-site/CosmicSite";
import { PublicArtHero } from "@/components/public-site/PublicArtHero";
import { getPublicSign, zodiacPublicSigns } from "@/lib/public-website";

type ZodiacSignPageProps = {
  params: {
    sign: string;
  };
};

export function generateStaticParams() {
  return zodiacPublicSigns.map((sign) => ({ sign: sign.slug }));
}

export function generateMetadata({ params }: ZodiacSignPageProps): Metadata {
  const sign = getPublicSign(params.sign);
  if (!sign) {
    return {
      title: "Знак не найден",
    };
  }

  return {
    title: `${sign.ruName} — знак зодиака, любовь и энергия`,
    description: `${sign.ruName}: стихия ${sign.element}, энергия, стиль любви, сильные стороны и дневной teaser для Telegram Mini App.`,
    openGraph: {
      title: `${sign.ruName} — Zodiac Love Check`,
      description: `${sign.energy}. Мистический профиль знака без фатальных обещаний.`,
      type: "website",
    },
  };
}

export default function ZodiacSignPage({ params }: ZodiacSignPageProps) {
  const sign = getPublicSign(params.sign);
  if (!sign) notFound();

  const otherSigns = zodiacPublicSigns.filter((item) => item.slug !== sign.slug).slice(0, 6);
  const heroVisual =
    sign.slug === "aries" ? (
      <PublicArtHero
        mobileSrc="/public-site/art/signs/aries-profile-mobile.webp"
        desktopSrc="/public-site/art/signs/aries-profile-desktop.webp"
        variant="immersive"
        theme="aries"
        priority
      />
    ) : (
      <ZodiacProfileVisual sign={sign} />
    );

  return (
    <CosmicSiteShell activePath="/zodiac">
      <SiteHero
        eyebrow={`${sign.symbol} ${sign.ruName}`}
        title={sign.ruName}
        description={`${sign.dates}. Стихия: ${sign.element}. ${sign.todayTeaser}`}
        primaryLabel="Открыть в Telegram"
        secondaryLabel="Карта дня"
        layout={sign.slug === "aries" ? "immersive" : "standard"}
        visual={heroVisual}
      />

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <ProfilePanel title="Энергия">{sign.energy}</ProfilePanel>
        <ProfilePanel title="Стиль любви">{sign.loveStyle}</ProfilePanel>
        <ProfilePanel title="Сильные стороны">
          <ul className="space-y-2">
            {sign.strengths.map((strength) => (
              <li key={strength} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-100" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </ProfilePanel>
        <ProfilePanel title="Теневая сторона">{sign.shadow}</ProfilePanel>
      </section>

      <SiteSection
        eyebrow="Сегодня"
        title="Дневной teaser"
        description={sign.todayTeaser}
      >
        <div className="luxury-manuscript-scroll luxury-seal-corners relative overflow-hidden rounded-[1.25rem] p-6 text-sm leading-7 text-slate-300 sm:p-8">
          <div className="luxury-ornament-field absolute inset-0 opacity-[0.14]" aria-hidden="true" />
          <div className="animate-ember-drift absolute right-8 top-6 h-16 w-16 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.16),transparent_70%)] blur-xl" aria-hidden="true" />
          <div className="relative">В Mini App этот знак можно соединить с картой дня, совместимостью и другими личными подсказками.</div>
        </div>
      </SiteSection>

      <SiteSection eyebrow="Другие знаки" title="Продолжить навигацию по зодиаку">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {otherSigns.map((item) => (
            <ZodiacSignCard key={item.slug} sign={item} />
          ))}
        </div>
      </SiteSection>

      <SiteCTA title={`Открой знак ${sign.ruName} в Telegram`} />
    </CosmicSiteShell>
  );
}
