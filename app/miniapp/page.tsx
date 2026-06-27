import type { Metadata } from "next";
import Link from "next/link";
import {
  Fingerprint,
  Heart,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";

import {
  AphroditeBadge,
  AphroditeCard,
  AphroditeLockedPreviewCard,
  AphroditeMysticCardPreview,
  AphroditeSurface,
} from "@/components/zodiac-mini-app/aphrodite-design-system";
import { createAphroditeLoveReadingFoundationPreview } from "@/lib/zodiac/aphrodite-ai-love-reading-foundation";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "Aphrodite Mini App",
  description:
    "Premium Aphrodite Mini App home screen with compatibility, Birth Matrix, Mystic Cards, and locked VIP preview.",
};

const lovePreview = createAphroditeLoveReadingFoundationPreview({
  firstName: "Вы",
  partnerName: "Он/она",
  firstSign: "leo",
  partnerSign: "scorpio",
});

const secondaryCtas = [
  {
    title: "Матрица судьбы",
    description: "Личный код по дате рождения, спокойный результат и безопасный текстовый ввод.",
    href: "/birth-matrix",
    icon: Fingerprint,
    tone: "gold",
  },
  {
    title: "Мистическая карта",
    description: "Карта дня, Таро, руна и короткая подсказка настроения без страха и давления.",
    href: "/compatibility?startapp=mystic",
    icon: WandSparkles,
    tone: "violet",
  },
] as const;

const trustNotes = [
  "Без оплаты на этом экране.",
  "VIP preview закрыт.",
  "Без сообщений в Telegram.",
  "Без записи в базу данных.",
] as const;

export default function MiniAppHubPage() {
  recordAphroditeMiniAppNoopIntegrationPoint("route-miniapp-opened");

  return (
    <main
      data-aphrodite-miniapp-entry-redesign="package-238"
      className="min-h-screen overflow-x-hidden bg-[#070713] px-3 py-4 text-[#fff7ed] sm:px-5 sm:py-6"
    >
      <div className="mx-auto max-w-md space-y-4 pb-[calc(28px+env(safe-area-inset-bottom))]">
        <AphroditeSurface className="border-rose-200/20">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <AphroditeBadge tone="rose">Aphrodite</AphroditeBadge>
              <AphroditeBadge tone="violet">premium mystical romantic</AphroditeBadge>
            </div>

            <section className="space-y-3">
              <h1 className="break-words text-3xl font-semibold leading-9 text-white">
                Узнайте, что между вами сейчас
              </h1>
              <p className="text-sm leading-6 text-slate-200">
                Совместимость пары, Матрица судьбы и мистическая карта собраны в одном спокойном Mini App
                экране: романтично, понятно и без дешевой тревожности.
              </p>
            </section>

            <Link
              href="/compatibility?startapp=compat_love"
              className="flex min-h-[58px] w-full items-center justify-between gap-3 rounded-lg border border-amber-100/35 bg-[linear-gradient(135deg,#fb7185,#f6d58a)] px-4 py-3 text-left text-[#190914] shadow-[0_16px_44px_rgba(251,113,133,0.28)] transition hover:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/55"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-5">Проверить совместимость</span>
                <span className="mt-1 block text-xs leading-4 text-[#3d1622]">
                  Главный вход в любовь, пару и отношения
                </span>
              </span>
              <HeartHandshake className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>

            <div className="grid gap-2 min-[390px]:grid-cols-2">
              {secondaryCtas.map((cta) => (
                <Link
                  key={cta.title}
                  href={cta.href}
                  className="min-h-[118px] rounded-lg border border-white/12 bg-white/[0.065] p-3 text-left shadow-[0_14px_44px_rgba(8,13,30,0.28)] transition hover:border-rose-200/35 hover:bg-white/[0.095] focus:outline-none focus:ring-2 focus:ring-amber-200/45"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] text-amber-100">
                    <cta.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="mt-3 block text-sm font-semibold leading-5 text-white">{cta.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-300">{cta.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </AphroditeSurface>

        <AphroditeCard tone="rose" className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <AphroditeBadge tone="rose">daily / love teaser</AphroditeBadge>
            <Sparkles className="h-5 w-5 shrink-0 text-rose-100" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-semibold leading-6 text-white">Короткий preview отношений</h2>
            <p className="text-sm leading-6 text-slate-300">
              {lovePreview.connectionEnergy} Следующий шаг: {lovePreview.nextStep}
            </p>
          </div>
        </AphroditeCard>

        <div className="grid gap-3 min-[390px]:grid-cols-2">
          <AphroditeMysticCardPreview
            title="Мистическая карта"
            meaning="Мягкая подсказка дня в violet/rose/gold стиле: красиво, читаемо и без пугающей мистики."
          />
          <AphroditeLockedPreviewCard
            variant="home"
            scope="miniapp-entry"
            title="VIP locked preview"
            subtitle="Static Mini App entry"
            preview="Full relationship report, Birth Matrix Pro and shareable premium card stay preview-only: no active payment, no VIP unlock, entitlement не меняется."
            features={["Deep compatibility report", "Birth Matrix Pro", "Shareable premium card"]}
            previewItems={["Relationship calendar", "Personal advice", "Owner review required"]}
          />
        </div>

        <AphroditeCard tone="cosmic" className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200/25 bg-emerald-200/10 text-emerald-100">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold leading-6 text-white">Безопасные границы</h2>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Этот экран открывает только существующие безопасные разделы и не запускает оплату, VIP-доступ или отправку сообщений.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {trustNotes.map((note) => (
              <AphroditeBadge key={note} tone="gold">{note}</AphroditeBadge>
            ))}
          </div>
        </AphroditeCard>

        <footer className="flex items-center justify-center gap-2 px-3 pb-[env(safe-area-inset-bottom)] text-center text-[11px] leading-5 text-slate-500">
          <Heart className="h-3.5 w-3.5 text-rose-300" aria-hidden="true" />
          <span>Нижние отступы сохранены для Telegram WebView.</span>
          <Star className="h-3.5 w-3.5 text-amber-200" aria-hidden="true" />
        </footer>
      </div>
    </main>
  );
}
