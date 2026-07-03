import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, CircleDot, Heart, Sparkles, Star, WandSparkles } from "lucide-react";

import { TELEGRAM_MINI_APP_LINK, siteNavItems, type ZodiacPublicSign } from "@/lib/public-website";

type ShellProps = {
  children: ReactNode;
  activePath?: string;
};

export function CosmicSiteShell({ children, activePath = "/" }: ShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02030b] text-[#fff7ed]">
      <CosmicBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-3 sm:px-6 lg:px-8">
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(247,199,121,0.2),transparent_32rem),radial-gradient(circle_at_12%_16%,rgba(190,24,93,0.18),transparent_26rem),radial-gradient(circle_at_88%_8%,rgba(129,140,248,0.2),transparent_30rem),radial-gradient(circle_at_50%_78%,rgba(76,29,149,0.34),transparent_38rem),linear-gradient(180deg,#02030b_0%,#060717_38%,#10071b_68%,#03030b_100%)]" />
      <div className="cosmic-nebula absolute inset-0 opacity-80" />
      <div className="cosmic-starfield absolute inset-0 opacity-90" />
      <div className="cosmic-starfield cosmic-starfield-deep absolute inset-0 opacity-45" />
      <div className="cosmic-aurora absolute left-1/2 top-[-18rem] h-[36rem] w-[64rem] -translate-x-1/2 rounded-full" />
      <div className="cosmic-drift absolute left-[-10rem] top-20 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/14 blur-3xl" />
      <div className="cosmic-drift-slow absolute right-[-8rem] top-8 h-[32rem] w-[32rem] rounded-full bg-amber-300/12 blur-3xl" />
      <div className="absolute left-1/2 top-[28rem] h-px w-[min(70rem,86vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-100/22 to-transparent" />
      <div className="absolute bottom-[-22rem] left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full border border-amber-100/10 bg-[radial-gradient(circle,rgba(246,213,138,0.08),transparent_62%)]" />
    </div>
  );
}

function SiteNav({ activePath }: { activePath: string }) {
  return (
    <header className="flex items-center justify-between gap-4 py-4">
      <Link href="/" className="group inline-flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-100/35 bg-[linear-gradient(145deg,rgba(246,213,138,0.16),rgba(255,255,255,0.045))] text-amber-100 shadow-[0_0_42px_rgba(246,213,138,0.22)] backdrop-blur">
          <Star className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-[0.18em] text-amber-100">ZODIAC</span>
          <span className="block text-xs text-slate-400">mystic mini app</span>
        </span>
      </Link>
      <nav className="hidden items-center gap-1 rounded-lg border border-amber-100/12 bg-[#090817]/55 p-1 shadow-[0_18px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl md:flex">
        {siteNavItems.map((item) => {
          const active = activePath === item.href || (item.href !== "/" && activePath.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "rounded-md bg-amber-100/14 px-3 py-2 text-sm font-semibold text-amber-50 shadow-[inset_0_0_22px_rgba(246,213,138,0.08)]"
                  : "rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
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
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-100/50 bg-[linear-gradient(135deg,#ffe3a3_0%,#f5b6c7_46%,#b796ff_100%)] px-4 text-sm font-bold text-[#160816] shadow-[0_0_0_1px_rgba(255,255,255,0.16)_inset,0_18px_56px_rgba(246,213,138,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/70"
      >
        Открыть
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
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  visual?: ReactNode;
}) {
  return (
    <section className="relative grid min-h-[calc(100svh-5rem)] items-center gap-7 overflow-hidden py-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.82fr)] lg:gap-10 lg:py-14">
      <div className="absolute left-1/2 top-4 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full border border-amber-100/10 bg-[radial-gradient(circle,rgba(246,213,138,0.12),transparent_64%)] opacity-80 blur-sm lg:left-[68%] lg:top-8 lg:h-[30rem] lg:w-[30rem]" aria-hidden="true" />
      <div className="relative z-10 order-2 max-w-3xl lg:order-none">
        <div className="inline-flex items-center gap-2 rounded-lg border border-amber-100/28 bg-[#0b0818]/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 shadow-[0_14px_48px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {eyebrow}
        </div>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] text-white [text-shadow:0_16px_56px_rgba(0,0,0,0.68)] sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 max-sm:[-webkit-box-orient:vertical] max-sm:[-webkit-line-clamp:3] max-sm:[display:-webkit-box] max-sm:overflow-hidden sm:text-lg">{description}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href={TELEGRAM_MINI_APP_LINK}
            data-site-cta="telegram-mini-app"
            className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-lg border border-amber-100/55 bg-[linear-gradient(135deg,#ffe3a3_0%,#f4adc2_46%,#a98cff_100%)] px-6 text-sm font-bold text-[#160816] shadow-[0_0_0_1px_rgba(255,255,255,0.18)_inset,0_22px_70px_rgba(246,213,138,0.3),0_10px_38px_rgba(167,139,250,0.22)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/70"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          {secondaryLabel ? (
            <a
              href={TELEGRAM_MINI_APP_LINK}
              data-site-cta="telegram-mini-app"
              className="inline-flex min-h-[3.25rem] items-center justify-center rounded-lg border border-white/18 bg-white/[0.07] px-6 text-sm font-semibold text-white shadow-[0_16px_54px_rgba(0,0,0,0.32)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-rose-100/40 hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-100/40"
            >
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
      <div className="relative order-1 mx-auto w-full max-w-[19rem] sm:max-w-[27rem] lg:order-none lg:mr-0 lg:max-w-[34rem]">{visual ?? <MysticOrb />}</div>
    </section>
  );
}

export function MysticOrb() {
  return (
    <div className="relative aspect-square w-full min-w-0" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.16),transparent_58%)] blur-md" />
      <div className="cosmic-orbit absolute inset-2 rounded-full border border-amber-100/24 shadow-[0_0_46px_rgba(246,213,138,0.12)]" />
      <div className="cosmic-orbit-reverse absolute inset-10 rounded-full border border-rose-100/18" />
      <div className="absolute inset-[17%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.26),transparent_14%),radial-gradient(circle,rgba(246,213,138,0.25),rgba(167,139,250,0.17)_42%,rgba(5,6,19,0.96)_72%)] shadow-[0_0_110px_rgba(167,139,250,0.34),inset_0_0_44px_rgba(246,213,138,0.08)]" />
      <div className="absolute inset-x-[16%] top-1/2 h-px bg-gradient-to-r from-transparent via-amber-100/60 to-transparent" />
      <div className="absolute inset-y-[16%] left-1/2 w-px bg-gradient-to-b from-transparent via-rose-100/45 to-transparent" />
      <div className="absolute left-[23%] top-[28%] h-px w-[54%] rotate-[28deg] bg-gradient-to-r from-transparent via-white/24 to-transparent" />
      <div className="absolute left-[24%] top-[68%] h-px w-[52%] rotate-[-31deg] bg-gradient-to-r from-transparent via-amber-100/26 to-transparent" />
      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/34 bg-[#080817]/76 shadow-[0_0_42px_rgba(246,213,138,0.18),inset_0_0_36px_rgba(246,213,138,0.14)] backdrop-blur">
        <Star className="h-10 w-10 text-amber-100" aria-hidden="true" />
      </div>
      {["left-[16%] top-[34%]", "right-[18%] top-[22%]", "left-[22%] bottom-[20%]", "right-[20%] bottom-[30%]"].map((position) => (
        <span key={position} className={`absolute ${position} h-1.5 w-1.5 rounded-full bg-amber-100 shadow-[0_0_16px_rgba(246,213,138,0.8)]`} />
      ))}
    </div>
  );
}

export function TarotPreviewCard({ title = "ЗВЕЗДА", subtitle = "карта дня" }: { title?: string; subtitle?: string }) {
  return (
    <div className="relative isolate mx-auto aspect-[5/8] w-full max-w-[17rem] overflow-hidden rounded-lg border border-amber-100/45 bg-[radial-gradient(circle_at_50%_16%,rgba(255,229,169,0.24),transparent_24%),radial-gradient(circle_at_50%_46%,rgba(190,24,93,0.22),transparent_34%),linear-gradient(160deg,#050511,#15102c_48%,#34133d)] p-4 text-center shadow-[0_34px_100px_rgba(0,0,0,0.58),0_0_60px_rgba(246,213,138,0.16)]">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_34%,transparent_46%)]" />
      <div className="absolute inset-3 rounded-lg border border-amber-100/24 shadow-[inset_0_0_34px_rgba(246,213,138,0.08)]" />
      <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-amber-100/65 to-transparent" />
      <div className="absolute inset-x-8 bottom-8 h-px bg-gradient-to-r from-transparent via-rose-100/34 to-transparent" />
      <div className="relative flex h-full flex-col items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/85">{subtitle}</p>
        <div className="space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-100/38 bg-[radial-gradient(circle,rgba(246,213,138,0.2),rgba(255,255,255,0.04)_62%,transparent_70%)] shadow-[0_0_64px_rgba(246,213,138,0.28)]">
            <Star className="h-8 w-8 text-amber-100" aria-hidden="true" />
          </div>
          <p className="text-4xl font-semibold tracking-[0.08em] text-white">{title}</p>
          <p className="mx-auto max-w-[12rem] text-sm leading-5 text-slate-300">мягкий знак надежды, ясности и внутреннего света</p>
        </div>
        <div className="h-10 w-full rounded-lg border border-rose-200/22 bg-[linear-gradient(90deg,rgba(246,213,138,0.1),rgba(244,176,197,0.13),rgba(167,139,250,0.08))]" />
      </div>
    </div>
  );
}

export function ZodiacWheel({ signs }: { signs: ZodiacPublicSign[] }) {
  const wheelStyle = { "--zodiac-wheel-radius": "clamp(8.2rem, 33vw, 11.2rem)" } as CSSProperties;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[28rem]" style={wheelStyle} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.16),transparent_62%)] blur-sm" />
      <div className="cosmic-orbit absolute inset-2 rounded-full border border-amber-100/22 bg-[radial-gradient(circle,rgba(246,213,138,0.08),transparent_58%)] shadow-[0_0_60px_rgba(246,213,138,0.12)]" />
      <div className="cosmic-orbit-reverse absolute inset-[12%] rounded-full border border-rose-100/16" />
      <div className="absolute inset-[28%] rounded-full border border-white/12 bg-[#070817]/78 shadow-[inset_0_0_34px_rgba(246,213,138,0.08)]" />
      <div className="absolute inset-x-[10%] top-1/2 h-px bg-gradient-to-r from-transparent via-amber-100/30 to-transparent" />
      <div className="absolute inset-y-[10%] left-1/2 w-px bg-gradient-to-b from-transparent via-rose-100/26 to-transparent" />
      {signs.map((sign, index) => {
        const angle = (index / signs.length) * 360;
        return (
          <span
            key={sign.slug}
            className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-amber-100/24 bg-[#0b0818]/72 text-lg text-amber-100 shadow-[0_10px_32px_rgba(0,0,0,0.36)] backdrop-blur"
            style={{ transform: `rotate(${angle}deg) translate(0, calc(-1 * var(--zodiac-wheel-radius))) rotate(-${angle}deg)` }}
          >
            {sign.symbol}
          </span>
        );
      })}
      <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/34 bg-[radial-gradient(circle,rgba(246,213,138,0.2),rgba(167,139,250,0.14),transparent_70%)] text-amber-100 shadow-[0_0_48px_rgba(246,213,138,0.16)]">
        <Sparkles className="h-7 w-7" aria-hidden="true" />
      </div>
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
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/18 to-transparent" aria-hidden="true" />
      <div className="mb-7 max-w-2xl">
        <p className="inline-flex rounded-lg border border-amber-100/18 bg-amber-100/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight text-white sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function SiteFeatureCard({ title, text, label, className = "" }: { title: string; text: string; label: string; className?: string }) {
  return (
    <article className={`group relative min-w-0 overflow-hidden rounded-lg border border-amber-100/14 bg-[radial-gradient(circle_at_18%_0%,rgba(246,213,138,0.12),transparent_28%),radial-gradient(circle_at_86%_22%,rgba(244,176,197,0.1),transparent_30%),linear-gradient(160deg,rgba(255,255,255,0.085),rgba(255,255,255,0.032))] p-4 shadow-[0_22px_76px_rgba(0,0,0,0.34)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-amber-100/32 hover:shadow-[0_28px_90px_rgba(0,0,0,0.42)] ${className}`}>
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/45 to-transparent" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-100/18 bg-amber-100/[0.07] text-amber-100 shadow-[0_0_28px_rgba(246,213,138,0.12)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-7 text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

export function StepCard({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-amber-100/16 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_64px_rgba(0,0,0,0.28)] backdrop-blur">
      <div className="absolute right-4 top-4 h-12 w-12 rounded-full border border-amber-100/14 bg-[radial-gradient(circle,rgba(246,213,138,0.12),transparent_68%)]" />
      <p className="text-sm font-semibold text-amber-100">{index}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

export function ZodiacSignCard({ sign }: { sign: ZodiacPublicSign }) {
  return (
    <Link
      href={`/zodiac/${sign.slug}`}
      className={`group relative min-w-0 overflow-hidden rounded-lg border border-amber-100/14 bg-[radial-gradient(circle_at_22%_8%,rgba(246,213,138,0.12),transparent_28%),linear-gradient(145deg,var(--tw-gradient-stops))] ${sign.accent} p-4 shadow-[0_20px_70px_rgba(0,0,0,0.34)] transition hover:-translate-y-1 hover:border-amber-100/36 hover:shadow-[0_28px_88px_rgba(0,0,0,0.42)]`}
    >
      <div className="absolute right-[-1.8rem] top-[-1.8rem] h-24 w-24 rounded-full border border-amber-100/12 bg-[radial-gradient(circle,rgba(246,213,138,0.12),transparent_66%)]" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-4xl text-amber-100 [text-shadow:0_0_24px_rgba(246,213,138,0.34)]">{sign.symbol}</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{sign.ruName}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{sign.enName}</p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 text-amber-100/70 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm leading-5 text-slate-300">{sign.element} · {sign.dates}</p>
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
    <section className="relative my-14 overflow-hidden rounded-lg border border-amber-100/24 bg-[radial-gradient(circle_at_20%_0%,rgba(246,213,138,0.22),transparent_30%),radial-gradient(circle_at_82%_28%,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_50%_110%,rgba(129,140,248,0.12),transparent_34%),linear-gradient(145deg,rgba(10,10,28,0.96),rgba(43,20,55,0.94))] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.52),0_0_70px_rgba(246,213,138,0.1)] sm:p-8">
      <div className="absolute right-[-5rem] top-[-5rem] h-52 w-52 rounded-full border border-amber-100/12 bg-[radial-gradient(circle,rgba(246,213,138,0.16),transparent_66%)]" aria-hidden="true" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/50 to-transparent" aria-hidden="true" />
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="inline-flex rounded-lg border border-amber-100/18 bg-amber-100/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">Telegram Mini App</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{text}</p>
        </div>
        <a
          href={TELEGRAM_MINI_APP_LINK}
          data-site-cta="telegram-mini-app"
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-lg border border-amber-100/55 bg-[linear-gradient(135deg,#ffe3a3_0%,#f4adc2_46%,#a98cff_100%)] px-6 text-sm font-bold text-[#160816] shadow-[0_0_0_1px_rgba(255,255,255,0.18)_inset,0_22px_70px_rgba(246,213,138,0.3)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/70"
        >
          Открыть в Telegram
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="relative py-12 sm:py-16">
      <div className="absolute right-0 top-8 hidden h-52 w-52 rounded-full border border-amber-100/10 bg-[radial-gradient(circle,rgba(246,213,138,0.08),transparent_66%)] md:block" aria-hidden="true" />
      <div className="max-w-3xl">
        <p className="inline-flex rounded-lg border border-amber-100/18 bg-amber-100/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white [text-shadow:0_14px_50px_rgba(0,0,0,0.62)] sm:text-6xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}

export function ProfilePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-amber-100/14 bg-[radial-gradient(circle_at_18%_0%,rgba(246,213,138,0.1),transparent_26%),linear-gradient(160deg,rgba(255,255,255,0.075),rgba(255,255,255,0.032))] p-5 shadow-[0_22px_76px_rgba(0,0,0,0.34)] backdrop-blur-xl">
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/36 to-transparent" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-slate-300">{children}</div>
    </section>
  );
}

export function LegalPageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <CosmicSiteShell activePath={title.includes("Privacy") ? "/privacy" : "/terms"}>
      <PageHeader eyebrow="Правила" title={title} description={description} />
      <section className="mx-auto max-w-3xl rounded-lg border border-amber-100/14 bg-white/[0.055] p-5 shadow-[0_22px_76px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-7">
        <div className="space-y-5 text-sm leading-7 text-slate-300">{children}</div>
      </section>
    </CosmicSiteShell>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-amber-100/10 py-6 text-sm text-slate-400">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CircleDot className="h-4 w-4 text-amber-100" aria-hidden="true" />
          <span>Мистический public website для Telegram Mini App</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
          <Link href="/terms" className="transition hover:text-white">Terms</Link>
          <a href={TELEGRAM_MINI_APP_LINK} data-site-cta="telegram-mini-app" className="transition hover:text-amber-100">
            Telegram
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
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]" aria-hidden="true">
      <MysticOrb />
      <div className="absolute inset-x-0 bottom-[9%] mx-auto w-[58%] rotate-[-7deg] opacity-70">
        <TarotPreviewCard title="" subtitle="" />
      </div>
      <div className="absolute inset-x-0 bottom-[7%] mx-auto w-[60%] rotate-[6deg] opacity-75">
        <TarotPreviewCard title="" subtitle="" />
      </div>
      <div className="absolute inset-x-0 bottom-[4%] mx-auto w-[62%] rotate-[-3deg]">
        <TarotPreviewCard />
      </div>
      <div className="absolute right-6 top-10 rounded-lg border border-amber-100/24 bg-black/34 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 shadow-[0_14px_44px_rgba(0,0,0,0.36)] backdrop-blur-xl">
        cosmic portal
      </div>
    </div>
  );
}

export function CompatibilityOrbsVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[32rem]" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(244,176,197,0.15),transparent_62%)] blur-sm" />
      <div className="cosmic-orbit absolute inset-4 rounded-full border border-amber-100/18" />
      <div className="cosmic-orbit-reverse absolute inset-12 rounded-full border border-rose-100/16" />
      <div className="absolute left-[18%] top-[30%] h-36 w-36 rounded-full border border-rose-100/28 bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.24),transparent_14%),radial-gradient(circle,rgba(244,176,197,0.26),rgba(88,28,135,0.2)_58%,rgba(5,6,19,0.9)_78%)] shadow-[0_0_80px_rgba(244,176,197,0.26)]" />
      <div className="absolute right-[17%] top-[42%] h-36 w-36 rounded-full border border-amber-100/28 bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.22),transparent_14%),radial-gradient(circle,rgba(246,213,138,0.28),rgba(67,56,202,0.18)_58%,rgba(5,6,19,0.9)_78%)] shadow-[0_0_80px_rgba(246,213,138,0.24)]" />
      <div className="absolute left-[31%] top-[50%] h-px w-[38%] rotate-[12deg] bg-gradient-to-r from-rose-100/20 via-amber-100/70 to-rose-100/20" />
      <div className="absolute left-1/2 top-[49%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/32 bg-[#090817]/80 text-amber-100 shadow-[0_0_44px_rgba(246,213,138,0.2)] backdrop-blur">
        <Heart className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 rounded-lg border border-amber-100/20 bg-black/34 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100 shadow-[0_14px_44px_rgba(0,0,0,0.36)] backdrop-blur-xl">
        love orbit
      </div>
    </div>
  );
}

export function ZodiacProfileVisual({ sign }: { sign: ZodiacPublicSign }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[30rem]" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.14),transparent_62%)] blur-sm" />
      <div className="cosmic-orbit absolute inset-3 rounded-full border border-amber-100/22" />
      <div className="cosmic-orbit-reverse absolute inset-12 rounded-full border border-rose-100/16" />
      <div className={`absolute inset-[22%] rounded-lg border border-amber-100/28 bg-[linear-gradient(145deg,var(--tw-gradient-stops))] ${sign.accent} shadow-[0_32px_100px_rgba(0,0,0,0.5)] backdrop-blur-xl`} />
      <div className="absolute inset-[27%] rounded-lg border border-amber-100/24 bg-[#080817]/64 shadow-[inset_0_0_38px_rgba(246,213,138,0.08)]" />
      <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 text-8xl text-amber-100 [text-shadow:0_0_40px_rgba(246,213,138,0.42)]">{sign.symbol}</div>
      <div className="absolute inset-x-[24%] bottom-[26%] text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-100/80">{sign.enName}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{sign.ruName}</p>
      </div>
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
