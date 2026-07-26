import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
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
  title: "APHRODITE - Telegram Mini App",
  description:
    "Совместимый вход в APHRODITE: карта дня, совместимость, гороскопы, матрица судьбы и мистика.",
  alternates: {
    canonical: "/aphrodite",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const secondaryCtas = [
  {
    title: "Матрица судьбы",
    description: "Код даты рождения.",
    href: "/aphrodite?startapp=birth_matrix",
    icon: Fingerprint,
    tone: "gold",
  },
  {
    title: "Таро и руны",
    description: "Расклады, руна, символы.",
    href: "/aphrodite?startapp=mystic",
    icon: WandSparkles,
    tone: "violet",
  },
  {
    title: "Прогноз",
    description: "День, неделя и знаки.",
    href: "/aphrodite?startapp=week",
    icon: Sparkles,
    tone: "rose",
  },
  {
    title: "VIP превью",
    description: "Без оплаты · VIP закрыт.",
    href: "/aphrodite?startapp=vip",
    icon: Star,
    tone: "gold",
  },
] as const;

const trustNotes = [
  "Без оплаты",
  "VIP закрыт",
  "Превью",
] as const;

interface MiniAppHubPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function MiniAppHubPage({ searchParams = {} }: MiniAppHubPageProps) {
  if (hasLegacyMiniAppIntent(searchParams)) {
    redirect(buildAphroditeAliasUrl(searchParams));
  }

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
              <AphroditeBadge tone="rose">APHRODITE</AphroditeBadge>
              <AphroditeBadge tone="violet">Telegram Mini App</AphroditeBadge>
            </div>

            <section className="space-y-3">
              <h1 className="aphrodite-wrap-anywhere text-2xl font-semibold leading-8 text-white">
                Что между вами сейчас?
              </h1>
              <p className="aphrodite-wrap-anywhere text-sm leading-5 text-slate-200">Совместимость, Матрица, Мистика и VIP превью в одном лёгком экране.</p>
            </section>

            <Link
              href="/aphrodite?startapp=compat_love"
              className="aphrodite-touch-target flex min-h-[58px] w-full items-center justify-between gap-3 rounded-lg border border-amber-100/35 bg-[linear-gradient(135deg,#fb7185,#f6d58a)] px-4 py-3 text-left text-[#190914] shadow-[0_16px_44px_rgba(251,113,133,0.28)] transition hover:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/55"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-5">Проверить совместимость</span>
                <span className="mt-1 block text-xs leading-4 text-[#3d1622]">Любовь, пара, примирение</span>
              </span>
              <HeartHandshake className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>

            <Link
              href="/aphrodite?startapp=mystic"
              className="aphrodite-touch-target block rounded-lg border border-amber-100/25 bg-[radial-gradient(circle_at_24%_0%,rgba(246,213,138,0.18),transparent_34%),linear-gradient(135deg,rgba(88,28,135,0.42),rgba(15,23,42,0.72))] p-3 text-left shadow-[0_16px_44px_rgba(88,28,135,0.24)] transition hover:border-amber-100/45 focus:outline-none focus:ring-2 focus:ring-amber-200/45"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-lg font-semibold leading-6 text-white">Карта дня</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-300">Открой главный знак сегодняшнего дня</span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-100/25 bg-amber-100/10 text-amber-100">
                  <WandSparkles className="h-5 w-5" aria-hidden="true" />
                </span>
              </span>
              <span className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-100 px-3 text-sm font-bold text-[#18091a]">
                Открыть карту
              </span>
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
          title="VIP превью"
          subtitle="VIP закрыт"
          preview="Премиум-разбор виден как короткое превью."
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

const legacyMiniAppIntentParams = [
  "miniapp",
  "startapp",
  "tgWebAppStartParam",
  "start",
  "sign",
  "mode",
  "tgWebAppData",
  "tgWebAppVersion",
  "tgWebAppPlatform",
  "tgWebAppThemeParams",
] as const;

function hasLegacyMiniAppIntent(searchParams: Record<string, string | string[] | undefined>) {
  return legacyMiniAppIntentParams.some((key) => firstParam(searchParams[key]));
}

function buildAphroditeAliasUrl(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) params.append(key, item);
    }
  }

  const query = params.toString();
  return query ? `/aphrodite?${query}` : "/aphrodite";
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
