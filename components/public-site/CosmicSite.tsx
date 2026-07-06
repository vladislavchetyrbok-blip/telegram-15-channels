import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, CircleDot, Heart, Sparkles, Star, WandSparkles } from "lucide-react";

import { TELEGRAM_MINI_APP_LINK, siteNavItems, type ZodiacPublicSign } from "@/lib/public-website";

type ShellProps = {
  children: ReactNode;
  activePath?: string;
};

type HeroSceneVariant = "home" | "tarot" | "compatibility" | "zodiac" | "sign";
type SiteHeroLayout = "standard" | "immersive";

export function CosmicSiteShell({ children, activePath = "/" }: ShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02020a] text-[#fff7ed]">
      <CosmicBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[100vw] flex-col px-4 py-3 sm:max-w-7xl sm:px-6 lg:px-8">
        <SiteNav activePath={activePath} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </main>
  );
}

export function CosmicBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-12%,rgba(246,213,138,0.26),transparent_28rem),radial-gradient(circle_at_10%_12%,rgba(244,176,197,0.18),transparent_24rem),radial-gradient(circle_at_90%_4%,rgba(125,92,255,0.2),transparent_28rem),radial-gradient(circle_at_48%_72%,rgba(88,28,135,0.38),transparent_42rem),linear-gradient(180deg,#02020a_0%,#050612_34%,#10061c_66%,#02020a_100%)]" />
      <div className="cosmic-nebula animate-nebula-breathe absolute inset-0 opacity-95" />
      <div className="luxury-grain absolute inset-0 opacity-[0.18]" />
      <div className="cosmic-starfield absolute inset-0 opacity-85" />
      <div className="cosmic-starfield cosmic-starfield-deep absolute inset-0 opacity-40" />
      <div className="cosmic-aurora absolute left-1/2 top-[-19rem] h-[38rem] w-[74rem] -translate-x-1/2 rounded-full" />
      <div className="absolute left-[-12rem] top-24 h-[34rem] w-[34rem] rounded-full border border-rose-100/8 bg-[radial-gradient(circle,rgba(244,176,197,0.13),transparent_66%)] blur-2xl" />
      <div className="absolute right-[-12rem] top-6 h-[36rem] w-[36rem] rounded-full border border-amber-100/8 bg-[radial-gradient(circle,rgba(246,213,138,0.14),transparent_66%)] blur-2xl" />
      <div className="absolute left-1/2 top-[30rem] h-px w-[min(78rem,88vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-100/28 to-transparent" />
      <div className="absolute bottom-[-24rem] left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full border border-amber-100/10 bg-[radial-gradient(circle,rgba(246,213,138,0.09),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,transparent_48%,rgba(0,0,0,0.62)_100%)]" />
    </div>
  );
}

function SiteNav({ activePath }: { activePath: string }) {
  return (
    <header className="relative z-30 flex items-center justify-between gap-3 py-4">
      <Link href="/" className="group inline-flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/60">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-100/40 bg-[radial-gradient(circle_at_50%_18%,rgba(255,244,207,0.24),rgba(246,213,138,0.1)_42%,rgba(0,0,0,0.12)_100%)] text-amber-100 shadow-[0_0_42px_rgba(246,213,138,0.26)] backdrop-blur">
          <span className="absolute inset-1 rounded-full border border-white/10" aria-hidden="true" />
          <Star className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-sm font-semibold text-amber-100">ZODIAC</span>
          <span className="block truncate text-xs text-amber-50/56">карта · знаки · любовь</span>
        </span>
      </Link>
      <nav
        aria-label="Основная навигация сайта"
        className="animate-orbit-shimmer hidden items-center gap-1 rounded-full border border-amber-100/25 bg-black/40 p-1 shadow-[0_18px_80px_rgba(0,0,0,0.6),0_0_20px_rgba(246,213,138,0.12),0_0_0_1px_rgba(255,255,255,0.05)_inset] backdrop-blur-2xl md:flex"
      >
        {siteNavItems.map((item) => {
          const active = activePath === item.href || (item.href !== "/" && activePath.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "rounded-full bg-amber-100/14 px-3 py-2 text-sm font-semibold text-amber-50 shadow-[inset_0_0_22px_rgba(246,213,138,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/60"
                  : "rounded-full px-3 py-2 text-sm font-semibold text-amber-50/68 transition hover:bg-amber-100/[0.08] hover:text-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/50"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <a
        href={TELEGRAM_MINI_APP_LINK}
        data-site-cta="telegram-mini-app"
        aria-label="Открыть в Telegram"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#ffe7a3]/76 bg-[linear-gradient(135deg,#fff2c4_0%,#f7d36b_42%,#c4862c_100%)] px-3 text-sm font-extrabold text-[#1a0d04] shadow-[0_0_0_1px_rgba(255,255,255,0.35)_inset,0_0_34px_rgba(247,211,107,0.28),0_18px_56px_rgba(0,0,0,0.38)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7d36b]/85 sm:px-4"
      >
        <span className="hidden sm:inline">Открыть в Telegram</span>
        <span className="sm:hidden">TG</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </header>
  );
}

export function SiteHero({
  eyebrow,
  title,
  description,
  primaryLabel = "Открыть в Telegram",
  secondaryLabel,
  visual,
  layout = "standard",
  mobileSafeTop = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  visual?: ReactNode;
  layout?: SiteHeroLayout;
  mobileSafeTop?: boolean;
}) {
  if (layout === "immersive") {
    return (
      <section
        className={`relative left-1/2 -mt-[5.25rem] min-h-[100svh] w-screen -translate-x-1/2 overflow-hidden px-4 pb-10 ${
          mobileSafeTop ? "pt-[calc(env(safe-area-inset-top)+8.5rem)]" : "pt-[7.5rem]"
        } sm:px-6 sm:pt-[8.25rem] lg:px-8`}
      >
        <div className="absolute inset-0">
          {visual ?? <PremiumHeroScene variant="home" />}
        </div>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(246,213,138,0.18),transparent_31rem),radial-gradient(circle_at_22%_56%,rgba(244,176,197,0.15),transparent_25rem),radial-gradient(circle_at_50%_88%,rgba(246,213,138,0.11),transparent_34rem),linear-gradient(90deg,rgba(2,2,10,0.94)_0%,rgba(2,2,10,0.58)_42%,rgba(2,2,10,0.16)_70%,rgba(2,2,10,0.6)_100%)]"
          aria-hidden="true"
        />
        <div className="animate-celestial-shimmer absolute left-[-8rem] top-[18%] h-[28rem] w-[28rem] rounded-full border border-amber-100/10 bg-[radial-gradient(circle,rgba(246,213,138,0.12),transparent_68%)] blur-xl" aria-hidden="true" />
        <div className="absolute right-[-10rem] bottom-[6%] h-[28rem] w-[28rem] rounded-full border border-rose-100/10 bg-[radial-gradient(circle,rgba(244,176,197,0.1),transparent_68%)] blur-xl" aria-hidden="true" />
        <div className="cosmic-starfield absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#02020a] via-[#02020a]/72 to-transparent" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-8.25rem)] max-w-7xl items-end pb-[12vh] pt-24 sm:pb-[13vh] lg:pb-[15vh]">
          <div className="max-w-[37rem]">
            {eyebrow ? (
              <p className="mb-4 flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#f6d58a]/90 [text-shadow:0_0_20px_rgba(246,213,138,0.4)]">
                <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#f6d58a]/60" />
                <span>{eyebrow}</span>
              </p>
            ) : null}
            <div className="mb-5 h-px w-28 bg-gradient-to-r from-amber-100 via-[#d99b42] to-transparent shadow-[0_0_24px_rgba(246,213,138,0.42)]" aria-hidden="true" />
            <h1 className="max-w-[42rem] [font-family:Georgia,'Times_New_Roman',serif] text-4xl font-normal leading-[1.02] tracking-wide text-transparent bg-[linear-gradient(115deg,#fffef8_0%,#f8d889_38%,#f5b9c9_68%,#fffef8_100%)] bg-clip-text [text-shadow:0_20px_70px_rgba(0,0,0,0.9)] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-5 max-w-[34rem] text-base leading-7 text-[#f6ead8]/86 [text-shadow:0_10px_34px_rgba(0,0,0,0.78)] sm:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PremiumCTA>{primaryLabel}</PremiumCTA>
              {secondaryLabel ? (
                <a
                  href={TELEGRAM_MINI_APP_LINK}
                  data-site-cta="telegram-mini-app"
                  className="inline-flex min-h-[3.6rem] items-center justify-center rounded-full border border-[#f6d58a]/45 bg-black/30 px-7 text-sm font-semibold tracking-wide text-[#f6d58a] shadow-[0_0_25px_rgba(246,213,138,0.12)_inset,0_18px_56px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#f6d58a]/85 hover:bg-[#f6d58a]/[0.12] hover:text-[#fff8e8] hover:shadow-[0_0_38px_rgba(246,213,138,0.25)_inset,0_22px_65px_rgba(0,0,0,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d58a]/70"
                >
                  {secondaryLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative grid min-h-[calc(100svh-5rem)] items-center gap-6 overflow-hidden py-4 sm:py-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(22rem,1fr)] lg:gap-10 lg:py-12">
      <div className="absolute left-1/2 top-4 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full border border-amber-100/10 bg-[radial-gradient(circle,rgba(246,213,138,0.12),transparent_64%)] opacity-80 blur-sm lg:left-[68%] lg:top-8 lg:h-[30rem] lg:w-[30rem]" aria-hidden="true" />
      <div className="relative order-1 mx-auto w-full max-w-[21rem] sm:max-w-[28rem] lg:order-2 lg:mr-0 lg:max-w-[36rem]">
        {visual ?? <PremiumHeroScene variant="home" />}
      </div>
      <div className="relative z-10 order-2 max-w-3xl lg:order-1">
        {eyebrow ? (
          <p className="mb-4 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#f6d58a]/90 [text-shadow:0_0_20px_rgba(246,213,138,0.4)]">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#f6d58a]/60" />
            <span>{eyebrow}</span>
          </p>
        ) : null}
        <h1 className="mt-4 max-w-4xl [font-family:Georgia,'Times_New_Roman',serif] text-4xl font-normal leading-[1.02] tracking-wide text-transparent bg-[linear-gradient(115deg,#fffef8_0%,#f8d889_38%,#f5b9c9_68%,#fffef8_100%)] bg-clip-text [text-shadow:0_16px_56px_rgba(0,0,0,0.8)] sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 max-sm:[-webkit-box-orient:vertical] max-sm:[-webkit-line-clamp:3] max-sm:[display:-webkit-box] max-sm:overflow-hidden sm:text-lg">{description}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <PremiumCTA>{primaryLabel}</PremiumCTA>
          {secondaryLabel ? (
            <a
              href={TELEGRAM_MINI_APP_LINK}
              data-site-cta="telegram-mini-app"
              className="inline-flex min-h-[3.6rem] items-center justify-center rounded-full border border-[#f6d58a]/45 bg-black/30 px-7 text-sm font-semibold tracking-wide text-[#f6d58a] shadow-[0_0_25px_rgba(246,213,138,0.12)_inset,0_18px_56px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#f6d58a]/85 hover:bg-[#f6d58a]/[0.12] hover:text-[#fff8e8] hover:shadow-[0_0_38px_rgba(246,213,138,0.25)_inset,0_22px_65px_rgba(0,0,0,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d58a]/70"
            >
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PremiumCTA({ children = "Открыть в Telegram", className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <a
      href={TELEGRAM_MINI_APP_LINK}
      data-site-cta="telegram-mini-app"
      aria-label="Открыть в Telegram"
      className={`animate-orbit-shimmer group relative isolate inline-flex min-h-[3.6rem] items-center justify-center overflow-hidden rounded-full border border-[#ffe8a5] bg-[linear-gradient(135deg,#fff6d6_0%,#f7d36b_35%,#d89c3e_70%,#a86d20_100%)] px-8 text-sm font-extrabold tracking-wider text-[#140a02] shadow-[0_0_0_1px_rgba(255,255,255,0.5)_inset,0_-10px_22px_rgba(140,70,10,0.35)_inset,0_0_45px_rgba(247,211,107,0.48),0_24px_70px_rgba(0,0,0,0.75)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.65)_inset,0_-10px_22px_rgba(140,70,10,0.35)_inset,0_0_65px_rgba(247,211,107,0.7),0_28px_85px_rgba(0,0,0,0.85)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7d36b] ${className}`}
    >
      <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" aria-hidden="true" />
      <span className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.45)_32%,transparent_48%)] opacity-75 transition duration-500 group-hover:translate-x-4" aria-hidden="true" />
      <span className="relative flex items-center justify-center gap-2.5 uppercase tracking-wider">
        <Sparkles className="animate-star-glint h-4 w-4 text-[#784306] transition duration-500 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
        {children}
        <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </a>
  );
}

export function PremiumHeroScene({ variant = "home", sign }: { variant?: HeroSceneVariant; sign?: ZodiacPublicSign }) {
  const showPhone = variant === "home" || variant === "compatibility" || variant === "zodiac";
  const showPair = variant === "compatibility";

  return (
    <div className="relative mx-auto aspect-[0.86] w-full min-w-0 overflow-visible" aria-hidden="true">
      <div className="absolute inset-x-[3%] top-[4%] h-[82%] rounded-full border border-amber-100/12 bg-[radial-gradient(circle,rgba(246,213,138,0.16),transparent_58%)] blur-sm" />
      <div className="premium-float absolute inset-x-[5%] top-[5%] mx-auto w-[90%]">
        <ZodiacHalo sign={sign} compact={variant === "sign"} />
      </div>
      {showPair ? (
        <div className="absolute inset-x-[5%] top-[24%] h-[42%]">
          <div className="absolute left-[10%] top-[12%] h-28 w-28 rounded-full border border-rose-100/30 bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.28),transparent_13%),radial-gradient(circle,rgba(244,176,197,0.28),rgba(88,28,135,0.22)_58%,rgba(5,6,19,0.92)_78%)] shadow-[0_0_80px_rgba(244,176,197,0.28)] sm:h-36 sm:w-36" />
          <div className="absolute right-[8%] top-[26%] h-28 w-28 rounded-full border border-amber-100/30 bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.25),transparent_13%),radial-gradient(circle,rgba(246,213,138,0.3),rgba(67,56,202,0.2)_58%,rgba(5,6,19,0.92)_78%)] shadow-[0_0_80px_rgba(246,213,138,0.26)] sm:h-36 sm:w-36" />
          <div className="absolute left-[31%] top-[48%] h-px w-[39%] rotate-[10deg] bg-gradient-to-r from-rose-100/20 via-amber-100/80 to-rose-100/20" />
          <div className="absolute left-1/2 top-[46%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/36 bg-[#090817]/82 text-amber-100 shadow-[0_0_48px_rgba(246,213,138,0.24)] backdrop-blur">
            <Heart className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      ) : null}
      <div className={showPhone ? "absolute bottom-[2%] left-[6%] w-[54%]" : "absolute bottom-[7%] left-[3%] w-[61%]"}>
        <TarotCardStack title={variant === "sign" && sign ? sign.ruName : "ЗВЕЗДА"} subtitle={variant === "sign" && sign ? sign.enName : "КАРТА ДНЯ"} />
      </div>
      {showPhone ? (
        <div className="premium-tilt absolute bottom-0 right-[3%] w-[50%] max-w-[18rem]">
          <PremiumPhoneMockup mode={variant} sign={sign} />
        </div>
      ) : (
        <div className="premium-tilt absolute bottom-[3%] right-[8%] w-[44%] max-w-[15rem]">
          <MysticOrb compact />
        </div>
      )}
      <div className="absolute bottom-[9%] right-[7%] hidden rounded-lg border border-amber-100/24 bg-black/34 px-3 py-2 text-xs font-semibold uppercase text-amber-100 shadow-[0_14px_44px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:block">
        карта дня
      </div>
    </div>
  );
}

export function PremiumPhoneMockup({ mode = "home", sign }: { mode?: HeroSceneVariant; sign?: ZodiacPublicSign }) {
  const title = mode === "compatibility" ? "Совместимость" : mode === "zodiac" ? "Зодиак" : "Звездная карта";
  const cardTitle = mode === "compatibility" ? "82%" : mode === "zodiac" && sign ? sign.ruName : "ЗВЕЗДА";
  const cardLabel = mode === "compatibility" ? "совпадение ритма" : mode === "zodiac" ? "профиль знака" : "карта дня";

  return (
    <div className="relative mx-auto aspect-[9/18.6] w-full min-w-[9.5rem] rounded-[2rem] border border-amber-100/30 bg-[#050510] p-2 shadow-[0_34px_110px_rgba(0,0,0,0.64),0_0_70px_rgba(246,213,138,0.16)]">
      <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.16),transparent_22%,rgba(246,213,138,0.08)_70%,transparent)]" />
      <div className="relative h-full overflow-hidden rounded-[1.45rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(246,213,138,0.2),transparent_28%),radial-gradient(circle_at_8%_16%,rgba(244,176,197,0.16),transparent_30%),linear-gradient(180deg,#0a0717,#120820_48%,#05040c)] p-3">
        <div className="mx-auto h-1.5 w-14 rounded-full bg-white/18" />
        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase text-amber-100/80">Telegram Апп</p>
            <p className="text-sm font-semibold text-white">{title}</p>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-100/22 bg-amber-100/[0.08] text-amber-100">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-4 rounded-lg border border-amber-100/24 bg-[radial-gradient(circle_at_50%_0%,rgba(246,213,138,0.18),transparent_32%),linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
          <p className="text-[10px] font-semibold uppercase text-amber-100/75">{cardLabel}</p>
          <p className="mt-2 text-2xl font-semibold leading-none text-white">{cardTitle}</p>
          <div className="mt-3 h-20 rounded-lg border border-amber-100/16 bg-[radial-gradient(circle,rgba(246,213,138,0.18),transparent_60%),linear-gradient(145deg,rgba(91,33,182,0.34),rgba(244,176,197,0.12))] shadow-[inset_0_0_30px_rgba(246,213,138,0.06)]" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.055] p-2">
            <p className="text-[10px] text-slate-400">Любовь</p>
            <p className="mt-1 text-sm font-semibold text-rose-100">мягко</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.055] p-2">
            <p className="text-[10px] text-slate-400">Знак</p>
            <p className="mt-1 text-sm font-semibold text-amber-100">{sign?.symbol ?? "♌︎"}</p>
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-black/26 p-1 backdrop-blur">
          {["Карта", "Пара", "Знак"].map((item, index) => (
            <span key={item} className={index === 0 ? "rounded-md bg-amber-100/18 px-2 py-1 text-center text-[10px] font-semibold text-amber-50" : "px-2 py-1 text-center text-[10px] font-semibold text-slate-400"}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MysticOrb({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative aspect-square w-full min-w-0 ${compact ? "max-w-[13rem]" : ""}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.18),transparent_58%)] blur-md" />
      <div className="cosmic-orbit absolute inset-2 rounded-full border border-amber-100/24 shadow-[0_0_46px_rgba(246,213,138,0.12)]" />
      <div className="cosmic-orbit-reverse absolute inset-8 rounded-full border border-rose-100/18" />
      <div className="absolute inset-[17%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.28),transparent_14%),radial-gradient(circle,rgba(246,213,138,0.25),rgba(167,139,250,0.17)_42%,rgba(5,6,19,0.96)_72%)] shadow-[0_0_110px_rgba(167,139,250,0.34),inset_0_0_44px_rgba(246,213,138,0.08)]" />
      <div className="absolute inset-x-[16%] top-1/2 h-px bg-gradient-to-r from-transparent via-amber-100/60 to-transparent" />
      <div className="absolute inset-y-[16%] left-1/2 w-px bg-gradient-to-b from-transparent via-rose-100/45 to-transparent" />
      <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/34 bg-[#080817]/76 shadow-[0_0_42px_rgba(246,213,138,0.18),inset_0_0_36px_rgba(246,213,138,0.14)] backdrop-blur sm:h-28 sm:w-28">
        <Star className="h-8 w-8 text-amber-100 sm:h-10 sm:w-10" aria-hidden="true" />
      </div>
    </div>
  );
}

export function TarotCardStack({ title = "ЗВЕЗДА", subtitle = "КАРТА ДНЯ" }: { title?: string; subtitle?: string }) {
  return (
    <div className="relative aspect-[5/7] w-full min-w-0" aria-hidden="true">
      <div className="absolute inset-x-[8%] bottom-[8%] h-[78%] rotate-[-10deg] rounded-lg border border-amber-100/20 bg-[linear-gradient(150deg,#080712,#201034_48%,#4a173d)] opacity-70 shadow-[0_26px_80px_rgba(0,0,0,0.44)]" />
      <div className="absolute inset-x-[6%] bottom-[5%] h-[82%] rotate-[8deg] rounded-lg border border-rose-100/20 bg-[linear-gradient(150deg,#070712,#151035_48%,#2d1749)] opacity-80 shadow-[0_26px_80px_rgba(0,0,0,0.48)]" />
      <TarotPreviewCard title={title} subtitle={subtitle} />
    </div>
  );
}

export function TarotPreviewCard({ title = "ЗВЕЗДА", subtitle = "карта дня" }: { title?: string; subtitle?: string }) {
  return (
    <div className="relative isolate mx-auto aspect-[5/8] w-full overflow-hidden rounded-lg border border-amber-100/45 bg-[radial-gradient(circle_at_50%_16%,rgba(255,229,169,0.26),transparent_24%),radial-gradient(circle_at_50%_46%,rgba(190,24,93,0.22),transparent_34%),linear-gradient(160deg,#050511,#15102c_48%,#34133d)] p-4 text-center shadow-[0_34px_100px_rgba(0,0,0,0.58),0_0_60px_rgba(246,213,138,0.16)]">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_34%,transparent_46%)]" />
      <div className="absolute inset-3 rounded-lg border border-amber-100/24 shadow-[inset_0_0_34px_rgba(246,213,138,0.08)]" />
      <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-amber-100/65 to-transparent" />
      <div className="absolute inset-x-8 bottom-8 h-px bg-gradient-to-r from-transparent via-rose-100/34 to-transparent" />
      <div className="relative flex h-full flex-col items-center justify-between">
        <p className="text-[11px] font-semibold uppercase text-amber-100/85">{subtitle}</p>
        <div className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-100/38 bg-[radial-gradient(circle,rgba(246,213,138,0.2),rgba(255,255,255,0.04)_62%,transparent_70%)] shadow-[0_0_64px_rgba(246,213,138,0.28)] sm:h-24 sm:w-24">
            <Star className="h-8 w-8 text-amber-100" aria-hidden="true" />
          </div>
          <p className="text-3xl font-semibold text-white sm:text-4xl">{title}</p>
          <p className="mx-auto max-w-[12rem] text-sm leading-5 text-slate-300">один знак надежды и внутреннего света</p>
        </div>
        <div className="h-10 w-full rounded-lg border border-rose-200/22 bg-[linear-gradient(90deg,rgba(246,213,138,0.1),rgba(244,176,197,0.13),rgba(167,139,250,0.08))]" />
      </div>
    </div>
  );
}

export function ZodiacHalo({
  signs,
  sign,
  compact = false,
  mobileCompact = false,
}: {
  signs?: ZodiacPublicSign[];
  sign?: ZodiacPublicSign;
  compact?: boolean;
  mobileCompact?: boolean;
}) {
  const glyphs = signs?.map((item) => item.symbol) ?? ["♈︎", "♉︎", "♊︎", "♋︎", "♌︎", "♍︎", "♎︎", "♏︎", "♐︎", "♑︎", "♒︎", "♓︎"];
  const radius = compact ? "clamp(5.2rem, 24vw, 8rem)" : "clamp(5.35rem, 31vw, 11.4rem)";
  const haloStyle = mobileCompact ? undefined : ({ "--zodiac-halo-radius": radius } as CSSProperties);
  const haloClass = mobileCompact
    ? "relative mx-auto aspect-square w-full max-w-[30rem] [--zodiac-halo-radius:clamp(4.25rem,25.5vw,6.05rem)] sm:[--zodiac-halo-radius:clamp(5.35rem,31vw,11.4rem)]"
    : "relative mx-auto aspect-square w-full max-w-[30rem]";
  const glyphClass = (active: boolean) =>
    mobileCompact
      ? active
        ? "absolute left-1/2 top-1/2 flex h-8 w-8 items-center justify-center rounded-lg border border-amber-100/48 bg-amber-100/18 text-lg text-amber-50 shadow-[0_0_34px_rgba(246,213,138,0.34)] backdrop-blur sm:h-11 sm:w-11 sm:text-xl"
        : "absolute left-1/2 top-1/2 flex h-7 w-7 items-center justify-center rounded-lg border border-amber-100/22 bg-[#0b0818]/72 text-base text-amber-100 shadow-[0_10px_32px_rgba(0,0,0,0.36)] backdrop-blur sm:h-9 sm:w-9 sm:text-lg"
      : active
        ? "absolute left-1/2 top-1/2 flex h-11 w-11 items-center justify-center rounded-lg border border-amber-100/48 bg-amber-100/18 text-xl text-amber-50 shadow-[0_0_34px_rgba(246,213,138,0.34)] backdrop-blur"
        : "absolute left-1/2 top-1/2 flex h-9 w-9 items-center justify-center rounded-lg border border-amber-100/22 bg-[#0b0818]/72 text-lg text-amber-100 shadow-[0_10px_32px_rgba(0,0,0,0.36)] backdrop-blur";

  return (
    <div className={haloClass} style={haloStyle} aria-hidden="true" data-public-zodiac-halo>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.16),transparent_62%)] blur-sm" />
      <div className="zodiac-halo-spin absolute inset-4 rounded-full border border-amber-100/24 bg-[radial-gradient(circle,rgba(246,213,138,0.08),transparent_58%)] shadow-[0_0_70px_rgba(246,213,138,0.14)]" />
      <div className="zodiac-halo-counter absolute inset-[16%] rounded-full border border-rose-100/18" />
      <div
        className="animate-orbit-shimmer pointer-events-none absolute left-1/2 top-1/2 h-[calc(var(--zodiac-halo-radius)*2)] w-[calc(var(--zodiac-halo-radius)*2)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f6d58a]/38 bg-[conic-gradient(from_0deg,rgba(246,213,138,0.28),rgba(244,176,197,0.1),rgba(246,213,138,0.34),rgba(125,92,255,0.12),rgba(246,213,138,0.28))] p-px shadow-[0_0_45px_rgba(246,213,138,0.18)]"
        data-public-zodiac-orbit-ring
      >
        <div className="h-full w-full rounded-full bg-[#050511]/72 shadow-[inset_0_0_26px_rgba(246,213,138,0.08)]" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[calc((var(--zodiac-halo-radius)*2)+1.4rem)] w-[calc((var(--zodiac-halo-radius)*2)+1.4rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/12 shadow-[0_0_40px_rgba(246,213,138,0.08)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[calc((var(--zodiac-halo-radius)*2)-1.3rem)] w-[calc((var(--zodiac-halo-radius)*2)-1.3rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-100/10" />
      <div className="absolute inset-[30%] rounded-full border border-white/12 bg-[#070817]/78 shadow-[inset_0_0_34px_rgba(246,213,138,0.08)]" />
      <div className="absolute inset-x-[10%] top-1/2 h-px bg-gradient-to-r from-transparent via-amber-100/30 to-transparent" />
      <div className="absolute inset-y-[10%] left-1/2 w-px bg-gradient-to-b from-transparent via-rose-100/26 to-transparent" />
      {glyphs.map((glyph, index) => {
        const angle = index * 30;
        const active = sign?.symbol === glyph;
        const orbitStyle = {
          "--zodiac-angle": `${angle}deg`,
          transform:
            "translate(-50%, -50%) rotate(var(--zodiac-angle)) translateY(calc(-1 * var(--zodiac-halo-radius))) rotate(calc(-1 * var(--zodiac-angle)))",
        } as CSSProperties;
        return (
          <span
            key={`${glyph}-${index}`}
            className={glyphClass(active)}
            data-public-zodiac-glyph
            data-public-zodiac-angle={angle}
            style={orbitStyle}
          >
            {glyph}
          </span>
        );
      })}
      <div className={mobileCompact ? "absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/34 bg-[radial-gradient(circle,rgba(246,213,138,0.22),rgba(167,139,250,0.14),transparent_70%)] text-amber-100 shadow-[0_0_48px_rgba(246,213,138,0.16)] sm:h-24 sm:w-24" : "absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/34 bg-[radial-gradient(circle,rgba(246,213,138,0.22),rgba(167,139,250,0.14),transparent_70%)] text-amber-100 shadow-[0_0_48px_rgba(246,213,138,0.16)] sm:h-24 sm:w-24"}>
        <Sparkles className="h-7 w-7" aria-hidden="true" />
      </div>
    </div>
  );
}

export function ZodiacWheel({ signs, compactMobile = false }: { signs: ZodiacPublicSign[]; compactMobile?: boolean }) {
  const wheelClass = compactMobile
    ? "relative mx-auto aspect-square w-[min(76vw,318px)] max-w-full overflow-visible px-3 sm:w-[min(86vw,410px)] sm:px-1 lg:w-[min(92vw,420px)] lg:px-0"
    : "relative mx-auto aspect-square w-[min(92vw,420px)] max-w-full overflow-visible";

  return (
    <div className={wheelClass} aria-hidden="true" data-public-zodiac-wheel>
      <ZodiacHalo signs={signs} mobileCompact={compactMobile} />
    </div>
  );
}

export function SiteSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative py-14 sm:py-[4.5rem]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/20 to-transparent" aria-hidden="true" />
      <div className="mb-8 max-w-3xl">
        <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#f6d58a]/85 [text-shadow:0_0_15px_rgba(246,213,138,0.3)]">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#f6d58a]/50" />
          <span>{eyebrow}</span>
        </p>
        <h2 className="mt-3 [font-family:Georgia,'Times_New_Roman',serif] text-3xl font-normal tracking-wide text-transparent bg-[linear-gradient(115deg,#fffdf7_0%,#f8d889_45%,#f4b5c7_75%,#fffdf7_100%)] bg-clip-text [text-shadow:0_12px_40px_rgba(0,0,0,0.8)] sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description ? <p className="mt-3.5 text-base leading-7 text-slate-300/90 sm:text-lg">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function LuxuryPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative min-w-0 overflow-hidden rounded-lg border border-amber-100/16 bg-[radial-gradient(circle_at_18%_0%,rgba(246,213,138,0.12),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(244,176,197,0.09),transparent_32%),linear-gradient(160deg,rgba(255,255,255,0.085),rgba(255,255,255,0.03))] shadow-[0_22px_76px_rgba(0,0,0,0.34)] backdrop-blur-xl ${className}`}>
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/42 to-transparent" aria-hidden="true" />
      {children}
    </div>
  );
}

export function SiteFeatureCard({ title, text, label, className = "" }: { title: string; text: string; label: string; className?: string }) {
  return (
    <article className={`group relative ${className}`}>
      <LuxuryPanel className="h-full p-4 transition duration-500 hover:-translate-y-1 hover:border-amber-100/34 hover:shadow-[0_28px_90px_rgba(0,0,0,0.54),0_0_45px_rgba(246,213,138,0.11)] lg:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(246,213,138,0.08),transparent_34%),linear-gradient(135deg,transparent,rgba(244,176,197,0.04),transparent)] opacity-0 transition duration-500 group-hover:opacity-100" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase text-amber-100">{label}</p>
          <span className="animate-star-glint flex h-9 w-9 items-center justify-center rounded-lg border border-amber-100/22 bg-amber-100/[0.08] text-amber-100 shadow-[0_0_30px_rgba(246,213,138,0.18)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <h3 className="mt-4 [font-family:Georgia,'Times_New_Roman',serif] text-xl font-normal tracking-wide text-[#fff8ea]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
      </LuxuryPanel>
    </article>
  );
}

export function StepCard({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <article>
      <LuxuryPanel className="h-full p-5">
        <div className="absolute right-4 top-4 h-12 w-12 rounded-full border border-amber-100/14 bg-[radial-gradient(circle,rgba(246,213,138,0.12),transparent_68%)]" aria-hidden="true" />
        <p className="text-sm font-semibold text-amber-100">{index}</p>
        <h3 className="mt-3 [font-family:Georgia,'Times_New_Roman',serif] text-xl font-normal tracking-wide text-[#fff8ea]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
      </LuxuryPanel>
    </article>
  );
}

export function ZodiacSignCard({ sign }: { sign: ZodiacPublicSign }) {
  return (
    <Link
      href={`/zodiac/${sign.slug}`}
      className="group relative min-w-0 overflow-hidden rounded-lg border border-amber-100/16 bg-[linear-gradient(145deg,var(--tw-gradient-stops))] shadow-[0_20px_70px_rgba(0,0,0,0.34)] transition hover:-translate-y-1 hover:border-amber-100/38 hover:shadow-[0_28px_88px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/60"
    >
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_22%_8%,rgba(246,213,138,0.14),transparent_30%)] ${sign.accent}`} aria-hidden="true" />
      <div className="absolute right-[-1.8rem] top-[-1.8rem] h-24 w-24 rounded-full border border-amber-100/12 bg-[radial-gradient(circle,rgba(246,213,138,0.12),transparent_66%)]" aria-hidden="true" />
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-4xl text-amber-100 [text-shadow:0_0_24px_rgba(246,213,138,0.34)]" aria-hidden="true">{sign.symbol}</p>
            <h3 className="mt-3 [font-family:Georgia,'Times_New_Roman',serif] text-xl font-normal tracking-wide text-[#fff8ea]">{sign.ruName}</h3>
            <p className="mt-1 text-xs uppercase text-slate-400">{sign.enName}</p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 text-amber-100/70 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm leading-5 text-slate-300">{sign.element} · {sign.dates}</p>
      </div>
    </Link>
  );
}

export function ZodiacSealCard({ sign }: { sign: ZodiacPublicSign }) {
  return (
    <Link
      href={`/zodiac/${sign.slug}`}
      className="animate-orbit-shimmer group relative isolate flex flex-col items-center justify-between overflow-hidden rounded-[1.35rem] border border-[#f6d58a]/32 bg-[radial-gradient(circle_at_50%_0%,rgba(246,213,138,0.2),transparent_45%),linear-gradient(160deg,#090614_0%,#04020a_100%)] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.65),inset_0_0_0_1px_rgba(255,255,255,0.08)] transition duration-500 hover:-translate-y-1.5 hover:border-[#f6d58a]/72 hover:shadow-[0_32px_100px_rgba(0,0,0,0.82),0_0_68px_rgba(246,213,138,0.28),inset_0_0_34px_rgba(246,213,138,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d58a]/70"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(246,213,138,0.2),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(244,176,197,0.15),transparent_40%)] opacity-80 transition duration-500 group-hover:opacity-100" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_35%,rgba(0,0,0,0.5)_100%)]" aria-hidden="true" />
      <div className="absolute inset-[1px] rounded-[1.28rem] border border-white/[0.06]" aria-hidden="true" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/50 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-[-4.5rem] left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.12),transparent_68%)] blur-2xl" aria-hidden="true" />

      {/* Medallion / Golden Seal */}
      <div className="animate-aura-pulse relative my-2 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[#f6d58a]/45 bg-[radial-gradient(circle_at_35%_30%,rgba(255,250,235,0.3),rgba(246,213,138,0.13)_45%,rgba(8,5,18,0.94)_90%)] shadow-[0_10px_40px_rgba(0,0,0,0.84),0_0_54px_rgba(246,213,138,0.32),inset_0_0_38px_rgba(246,213,138,0.2)] transition duration-500 group-hover:scale-105 group-hover:border-[#f6d58a]/85 group-hover:shadow-[0_10px_50px_rgba(0,0,0,0.92),0_0_78px_rgba(246,213,138,0.48),inset_0_0_48px_rgba(246,213,138,0.3)]">
        <span className={`absolute inset-[-18%] rounded-full bg-gradient-to-br ${sign.accent} opacity-45 blur-xl transition duration-500 group-hover:opacity-70`} aria-hidden="true" />
        <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_18deg,rgba(246,213,138,0.1),rgba(246,213,138,0.55),rgba(244,176,197,0.22),rgba(246,213,138,0.58),rgba(246,213,138,0.1))] opacity-70" aria-hidden="true" />
        <span className="absolute inset-[1px] rounded-full bg-[#070511]/88" aria-hidden="true" />
        <span className="absolute inset-2 rounded-full border border-[#f6d58a]/30" aria-hidden="true" />
        <span className="absolute inset-5 rounded-full border border-rose-200/20" aria-hidden="true" />
        <span className="absolute top-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#f6d58a] shadow-[0_0_12px_#f6d58a]" aria-hidden="true" />
        <span className="absolute bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#f6d58a]/60" aria-hidden="true" />
        <span className="relative z-10 text-5xl text-[#fff8ea] [text-shadow:0_0_30px_rgba(246,213,138,0.6)] transition duration-500 group-hover:scale-110" aria-hidden="true">
          {sign.symbol}
        </span>
      </div>

      <div className="relative mt-4 z-10">
        <h3 className="[font-family:Georgia,'Times_New_Roman',serif] text-2xl font-normal tracking-wide text-[#fff8ea] [text-shadow:0_5px_20px_rgba(0,0,0,0.8)]">{sign.ruName}</h3>
        <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#f6d58a]/85">{sign.element}</p>
        <p className="mx-auto mt-2.5 max-w-[13rem] text-xs text-slate-300/80">{sign.dates}</p>
      </div>

      <div className="relative mt-5 z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#f6d58a]/85 transition duration-300 group-hover:text-[#fff8ea]">
        <span>Открыть печать</span>
        <ArrowRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </Link>
  );
}

export function SiteCTA({
  title = "Открой свой знак сегодня",
  text = "Запусти Telegram Mini App и выбери карту дня, знак или совместимость в красивом мистическом интерфейсе.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="relative my-14">
      <LuxuryPanel className="p-5 sm:p-8">
        <div className="absolute right-[-5rem] top-[-5rem] h-52 w-52 rounded-full border border-amber-100/12 bg-[radial-gradient(circle,rgba(246,213,138,0.16),transparent_66%)]" aria-hidden="true" />
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="inline-flex rounded-lg border border-amber-100/18 bg-amber-100/[0.06] px-3 py-1.5 text-xs font-semibold uppercase text-amber-100">Telegram Mini App</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{text}</p>
          </div>
          <PremiumCTA className="lg:justify-self-end">Открыть в Telegram</PremiumCTA>
        </div>
      </LuxuryPanel>
    </section>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="relative py-12 sm:py-16">
      <div className="absolute right-0 top-8 hidden h-52 w-52 rounded-full border border-amber-100/10 bg-[radial-gradient(circle,rgba(246,213,138,0.08),transparent_66%)] md:block" aria-hidden="true" />
      <div className="max-w-3xl">
        <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#f6d58a]/85 [text-shadow:0_0_15px_rgba(246,213,138,0.3)]">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#f6d58a]/50" />
          <span>{eyebrow}</span>
        </p>
        <h1 className="mt-4 [font-family:Georgia,'Times_New_Roman',serif] text-4xl font-normal tracking-wide text-transparent bg-[linear-gradient(115deg,#fffef8_0%,#f8d889_40%,#f4b5c7_70%,#fffef8_100%)] bg-clip-text [text-shadow:0_14px_50px_rgba(0,0,0,0.8)] sm:text-6xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-300/90 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}

export function ProfilePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <LuxuryPanel className="h-full p-5">
        <h2 className="[font-family:Georgia,'Times_New_Roman',serif] text-xl font-normal tracking-wide text-[#fff8ea]">{title}</h2>
        <div className="mt-3 text-sm leading-6 text-slate-300">{children}</div>
      </LuxuryPanel>
    </section>
  );
}

export function LegalPageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <CosmicSiteShell activePath={title.includes("Privacy") ? "/privacy" : "/terms"}>
      <PageHeader eyebrow="Правила" title={title} description={description} />
      <section className="mx-auto max-w-3xl">
        <LuxuryPanel className="p-5 sm:p-7">
          <div className="space-y-5 text-sm leading-7 text-slate-300">{children}</div>
        </LuxuryPanel>
      </section>
    </CosmicSiteShell>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-amber-100/10 py-6 text-sm text-slate-400">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CircleDot className="animate-aura-pulse h-4 w-4 text-amber-100" aria-hidden="true" />
          <span>Мистический публичный портал для Telegram Mini App</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/50">Конфиденциальность</Link>
          <Link href="/terms" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/50">Условия</Link>
          <a href={TELEGRAM_MINI_APP_LINK} data-site-cta="telegram-mini-app" className="transition hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/50">
            Telegram Апп
          </a>
        </div>
      </div>
      <p className="mt-4 max-w-3xl text-xs leading-5 text-slate-500">
        Контент предназначен для развлечения и саморефлексии. Он не заменяет медицинскую, юридическую, финансовую или психологическую консультацию.
      </p>
    </footer>
  );
}

export function TarotAndOrbVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[36rem]" aria-hidden="true">
      <PremiumHeroScene variant="tarot" />
    </div>
  );
}

export function CompatibilityOrbsVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[36rem]" aria-hidden="true">
      <PremiumHeroScene variant="compatibility" />
    </div>
  );
}

export function ZodiacProfileVisual({ sign }: { sign: ZodiacPublicSign }) {
  return (
    <div className="relative mx-auto w-full max-w-[34rem]" aria-hidden="true">
      <PremiumHeroScene variant="sign" sign={sign} />
    </div>
  );
}

export function InlineIconTitle({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <WandSparkles className="h-4 w-4 text-amber-100" aria-hidden="true" />
      {title}
    </span>
  );
}
