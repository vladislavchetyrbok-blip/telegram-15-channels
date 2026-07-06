import type { Metadata } from "next";

import {
  CosmicSiteShell,
  SiteCTA,
  SiteHero,
  ZodiacSealCard,
  ZodiacWheel,
} from "@/components/public-site/CosmicSite";
import { PublicArtHero } from "@/components/public-site/PublicArtHero";
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
        eyebrow="ЗОЛОТОЙ ЗОДИАК"
        title="Небесная карта 12 знаков"
        description="Выбери свой знак в круге золотых печатей: стихия, энергия, стиль любви и мягкий дневной ориентир внутри Telegram Mini App."
        primaryLabel="Открыть в Telegram"
        secondaryLabel="Смотреть знаки"
        layout="immersive"
        mobileSafeTop
        visual={
          <PublicArtHero
            mobileSrc="/public-site/art/zodiac/zodiac-astrolabe-mobile.webp"
            desktopSrc="/public-site/art/zodiac/zodiac-astrolabe-desktop.webp"
            variant="immersive"
            theme="zodiac"
            priority
          />
        }
      />

      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#02020a] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(246,213,138,0.2),transparent_30rem),radial-gradient(circle_at_18%_34%,rgba(88,28,135,0.34),transparent_30rem),radial-gradient(circle_at_84%_72%,rgba(244,176,197,0.12),transparent_28rem),radial-gradient(circle_at_50%_78%,rgba(246,213,138,0.1),transparent_34rem),linear-gradient(180deg,#02020a_0%,#090414_48%,#02020a_100%)]" aria-hidden="true" />
        <div className="cosmic-starfield absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="luxury-grain gold-dust-drift absolute inset-0 opacity-[0.16]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,transparent_48%,rgba(0,0,0,0.72)_100%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="lg:sticky lg:top-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-amber-100/68">ГАЛЕРЕЯ ПЕЧАТЕЙ</p>
              <h2 className="mt-4 max-w-xl [font-family:Georgia,'Times_New_Roman',serif] text-4xl font-semibold leading-[0.98] text-white [text-shadow:0_18px_62px_rgba(0,0,0,0.72)] sm:text-5xl">
                12 знаков как золотые медальоны
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-amber-50/68 sm:text-base">
                Зодиак здесь работает как навигационный инструмент: каждый символ открывает отдельный профиль, а круг ниже остаётся вторичным ориентиром, не заменяя глубину небесной карты.
              </p>
              <div className="relative mx-auto mt-8 w-full max-w-[21.75rem] overflow-visible rounded-[1.75rem] border border-amber-100/18 bg-[radial-gradient(circle_at_50%_12%,rgba(246,213,138,0.12),transparent_46%),linear-gradient(160deg,rgba(255,255,255,0.08),rgba(0,0,0,0.28))] p-5 shadow-[0_26px_96px_rgba(0,0,0,0.58),0_0_58px_rgba(246,213,138,0.12),0_0_0_1px_rgba(255,255,255,0.045)_inset] backdrop-blur-xl sm:max-w-[28rem] sm:p-5 lg:mx-0">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/42 to-transparent" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-white/[0.055]" aria-hidden="true" />
                <div className="animate-celestial-shimmer pointer-events-none absolute left-1/2 top-1/2 h-[calc(100%-1.75rem)] w-[calc(100%-1.75rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/10" aria-hidden="true" />
                <ZodiacWheel signs={zodiacPublicSigns} compactMobile />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {zodiacPublicSigns.map((sign) => (
                <ZodiacSealCard key={sign.slug} sign={sign} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/22 to-transparent" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-lg border border-amber-100/16 bg-[radial-gradient(circle_at_82%_0%,rgba(246,213,138,0.16),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.028))] p-5 shadow-[0_26px_90px_rgba(0,0,0,0.42)] sm:p-8">
          <div className="absolute right-[-5rem] top-[-5rem] h-64 w-64 rounded-full border border-amber-100/12 bg-[radial-gradient(circle,rgba(246,213,138,0.14),transparent_66%)]" aria-hidden="true" />
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-amber-100/70">В MINI APP</p>
          <h2 className="mt-4 max-w-3xl [font-family:Georgia,'Times_New_Roman',serif] text-3xl font-semibold leading-tight text-white sm:text-5xl">
            Знак — вход в личный ритуал
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            В Telegram можно соединить знак с картой дня, совместимостью и другими мягкими мистическими форматами. Public page остаётся красивым входом, а персональный сценарий открывается внутри Mini App.
          </p>
        </div>
      </section>

      <SiteCTA />
    </CosmicSiteShell>
  );
}
