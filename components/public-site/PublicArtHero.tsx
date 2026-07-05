import Image from "next/image";
import type { ReactNode } from "react";

type PublicArtHeroProps = {
  mobileSrc: string;
  desktopSrc: string;
  variant?: "framed" | "immersive";
  theme?: "home" | "tarot" | "compatibility" | "zodiac" | "aries";
  priority?: boolean;
  children?: ReactNode;
};

export function PublicArtHero({
  mobileSrc,
  desktopSrc,
  variant = "framed",
  theme = "home",
  priority = false,
  children,
}: PublicArtHeroProps) {
  const imageLoadProps = priority ? { priority: true } : { loading: "lazy" as const };

  if (variant === "immersive") {
    const isTarot = theme === "tarot";
    const isCompat = theme === "compatibility";
    const isZodiac = theme === "zodiac";
    const isAries = theme === "aries";

    // Route-specific desktop crops and zoom levels to prevent left-text+right-image split feeling
    const desktopImageClass = isTarot || isCompat
      ? "hidden scale-[1.14] object-cover object-center sm:block"
      : isAries
      ? "hidden scale-[1.12] object-cover object-center sm:block"
      : isZodiac
      ? "hidden scale-[1.08] object-cover object-center sm:block"
      : "hidden scale-[1.06] object-cover object-[55%_45%] sm:block";

    const mobileImageClass = isTarot || isCompat || isAries
      ? "object-cover object-center scale-[1.10] sm:hidden"
      : "object-cover object-center scale-[1.04] sm:hidden";

    return (
      <div className="absolute inset-0 overflow-hidden bg-[#02020a]" aria-hidden="true">
        <Image
          src={mobileSrc}
          alt=""
          fill
          sizes="100vw"
          className={mobileImageClass}
          data-public-art-asset={mobileSrc}
          {...imageLoadProps}
        />
        <Image
          src={desktopSrc}
          alt=""
          fill
          sizes="100vw"
          className={desktopImageClass}
          data-public-art-asset={desktopSrc}
          {...imageLoadProps}
        />

        {/* Bespoke route-specific ambient lighting & ritual glow */}
        {isTarot ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_10%,rgba(5,3,16,0.7)_55%,rgba(2,2,10,0.96)_100%)]" />
            <div className="animate-candle-flicker absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.28),rgba(180,83,9,0.14)_45%,transparent_70%)] blur-3xl pointer-events-none" />
            <div className="animate-aura-pulse absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.12),transparent_65%)] blur-2xl pointer-events-none" />
          </>
        ) : isCompat ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_12%,rgba(10,5,20,0.65)_58%,rgba(2,2,10,0.96)_100%)]" />
            <div className="animate-rose-gold-shimmer absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(244,176,197,0.28),rgba(125,92,255,0.18)_50%,transparent_72%)] blur-3xl pointer-events-none" />
            <div className="animate-aura-pulse absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.15),transparent_70%)] blur-2xl pointer-events-none" />
          </>
        ) : isAries ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_12%,rgba(15,4,6,0.68)_60%,rgba(2,2,10,0.96)_100%)]" />
            <div className="animate-ember-drift absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.26),rgba(246,213,138,0.2)_50%,transparent_72%)] blur-3xl pointer-events-none" />
            <div className="animate-aura-pulse absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.14),transparent_68%)] blur-2xl pointer-events-none" />
          </>
        ) : isZodiac ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_15%,rgba(5,5,18,0.68)_65%,rgba(2,2,10,0.96)_100%)]" />
            <div className="animate-celestial-shimmer absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.22),rgba(88,28,135,0.2)_55%,transparent_75%)] blur-3xl pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(2,2,10,0.3)_45%,rgba(2,2,10,0.88)_100%)]" />
            <div className="animate-nebula-breathe absolute left-[20%] top-[15%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(247,190,86,0.22),transparent_68%)] blur-3xl pointer-events-none" />
            <div className="animate-aura-pulse absolute right-[15%] top-[20%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(125,92,255,0.22),transparent_70%)] blur-3xl pointer-events-none" />
          </>
        )}

        {/* Unified cinematic depth scrims */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,2,10,0.45)_0%,transparent_25%,transparent_55%,rgba(2,2,10,0.94)_100%)]" />
        <div className="luxury-grain gold-dust-drift absolute inset-0 opacity-[0.24]" />
        {children ? <div className="absolute inset-0">{children}</div> : null}
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-[0.86] w-full max-w-[38rem] overflow-hidden rounded-[1.25rem] border border-amber-100/14 bg-[#050510] shadow-[0_34px_110px_rgba(0,0,0,0.6),0_0_92px_rgba(246,213,138,0.16)]" aria-hidden="true">
      <Image
        src={mobileSrc}
        alt=""
        fill
        sizes="(max-width: 639px) 92vw, 0px"
        className="object-cover sm:hidden"
        data-public-art-asset={mobileSrc}
        {...imageLoadProps}
      />
      <Image
        src={desktopSrc}
        alt=""
        fill
        sizes="(min-width: 640px) 42vw, 0px"
        className="hidden object-cover sm:block"
        data-public-art-asset={desktopSrc}
        {...imageLoadProps}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,transparent_38%,rgba(1,1,8,0.32)_78%),linear-gradient(180deg,rgba(2,2,10,0.06),rgba(2,2,10,0.34)_82%,rgba(2,2,10,0.74))]" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/8" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/55 to-transparent" />
      <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-100/35 to-transparent" />
      {children ? <div className="absolute inset-0">{children}</div> : null}
    </div>
  );
}
