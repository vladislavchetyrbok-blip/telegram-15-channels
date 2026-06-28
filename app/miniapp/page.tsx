import type { Metadata } from "next";
import Link from "next/link";
import {
  Fingerprint,
  Heart,
  HeartHandshake,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";

import {
  AphroditeBadge,
  AphroditeLockedPreviewCard,
  AphroditeSurface,
} from "@/components/zodiac-mini-app/aphrodite-design-system";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "Aphrodite Mini App",
  description:
    "Короткий Aphrodite Mini App экран: совместимость, Матрица, Мистика и VIP preview.",
};

const secondaryCtas = [
  {
    title: "Матрица судьбы",
    description: "Код даты рождения.",
    href: "/birth-matrix",
    icon: Fingerprint,
    tone: "gold",
  },
  {
    title: "Мистическая карта",
    description: "Карта дня, Таро и руна.",
    href: "/compatibility?startapp=mystic",
    icon: WandSparkles,
    tone: "violet",
  },
  {
    title: "Прогноз",
    description: "День, неделя и знаки.",
    href: "/compatibility?startapp=week",
    icon: Sparkles,
    tone: "rose",
  },
  {
    title: "VIP preview",
    description: "Без оплаты · VIP закрыт.",
    href: "/vip-preview",
    icon: Star,
    tone: "gold",
  },
] as const;

const trustNotes = [
  "Без оплаты",
  "VIP закрыт",
  "Preview",
] as const;

export default function MiniAppHubPage() {
  recordAphroditeMiniAppNoopIntegrationPoint("route-miniapp-opened");

  return (
    <main
      data-aphrodite-miniapp-entry-redesign="package-238"
      data-aphrodite-telegram-webview-mobile-polish="package-244"
      data-aphrodite-critical-mobile-webview-visual-fix="package-267"
      className="aphrodite-mobile-shell aphrodite-pkg-267-mobile-webview-fix zodiac-miniapp-safe-area bg-[#070713] px-3 py-4 text-[#fff7ed] sm:px-5 sm:py-6"
    >
      <div className="aphrodite-scroll-safe aphrodite-safe-bottom mx-auto max-w-md space-y-4">
        <AphroditeSurface className="border-rose-200/20">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <AphroditeBadge tone="rose">Aphrodite</AphroditeBadge>
              <AphroditeBadge tone="violet">романтика</AphroditeBadge>
            </div>

            <section className="space-y-3">
              <h1 className="aphrodite-wrap-anywhere text-2xl font-semibold leading-8 text-white">
                Что между вами сейчас?
              </h1>
              <p className="aphrodite-wrap-anywhere text-sm leading-5 text-slate-200">Совместимость, Матрица, Мистика и VIP preview в одном лёгком экране.</p>
            </section>

            <Link
              href="/compatibility?startapp=compat_love"
              className="aphrodite-touch-target flex min-h-[58px] w-full items-center justify-between gap-3 rounded-lg border border-amber-100/35 bg-[linear-gradient(135deg,#fb7185,#f6d58a)] px-4 py-3 text-left text-[#190914] shadow-[0_16px_44px_rgba(251,113,133,0.28)] transition hover:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/55"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-5">Проверить совместимость</span>
                <span className="mt-1 block text-xs leading-4 text-[#3d1622]">Любовь, пара, примирение</span>
              </span>
              <HeartHandshake className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>

            <div className="aphrodite-pkg-267-two-after-430 grid gap-2">
              {secondaryCtas.map((cta) => (
                <Link
                  key={cta.title}
                  href={cta.href}
                  className="aphrodite-touch-target aphrodite-pkg-267-card-fix min-h-[94px] min-w-0 rounded-lg border border-white/12 bg-white/[0.065] p-2.5 text-left shadow-[0_14px_44px_rgba(8,13,30,0.22)] transition hover:border-rose-200/35 hover:bg-white/[0.095] focus:outline-none focus:ring-2 focus:ring-amber-200/45"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] text-amber-100">
                    <cta.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="aphrodite-pkg-267-text-fix mt-2 block text-sm font-semibold leading-5 text-white">{cta.title}</span>
                  <span className="aphrodite-pkg-267-text-fix mt-0.5 block line-clamp-1 text-xs leading-4 text-slate-300">{cta.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </AphroditeSurface>

        <AphroditeLockedPreviewCard
          variant="home"
          scope="miniapp-entry"
          title="VIP preview"
          subtitle="VIP закрыт"
          preview="Премиум-разбор виден как preview."
          features={["Разбор пары", "Матрица Pro", "Карточка"]}
          previewItems={["Без оплаты", "VIP закрыт"]}
          safetyLabel="Без оплаты · VIP закрыт"
        />

        <div className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2">
          <div className="flex flex-wrap gap-2">
            {trustNotes.map((note) => (
              <AphroditeBadge key={note} tone="gold">{note}</AphroditeBadge>
            ))}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-center gap-2 px-3 pb-[env(safe-area-inset-bottom)] text-center text-[11px] leading-5 text-slate-500">
          <Heart className="h-3.5 w-3.5 text-rose-300" aria-hidden="true" />
          <span>Готово для Telegram WebView.</span>
          <Star className="h-3.5 w-3.5 text-amber-200" aria-hidden="true" />
        </footer>
      </div>
    </main>
  );
}
