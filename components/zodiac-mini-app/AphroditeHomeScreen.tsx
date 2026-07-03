"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  CircleDot,
  Crown,
  Gem,
  Hash,
  HeartHandshake,
  Sparkles,
  Star,
  Stars,
  User,
  WandSparkles,
} from "lucide-react";

import { AphroditeBadge } from "./aphrodite-design-system";
import { panelClass } from "./ui-primitives";
import type { HubTab, MoreFeatureId, ZodiacSign } from "./types";

export type AphroditeHomeCategoryTarget = {
  tab: HubTab;
  feature?: MoreFeatureId | null;
};

type AphroditeHomeAction = {
  id: string;
  title: string;
  text: string;
  icon: ReactNode;
  target: AphroditeHomeCategoryTarget;
  tone: "violet" | "rose" | "cyan" | "amber" | "emerald" | "slate";
  badge?: string;
};

const categoryIconClass: Record<AphroditeHomeAction["tone"], string> = {
  violet: "border-violet-200/25 bg-violet-200/10 text-violet-100",
  rose: "border-rose-200/25 bg-rose-200/10 text-rose-100",
  cyan: "border-cyan-200/25 bg-cyan-200/10 text-cyan-100",
  amber: "border-amber-200/30 bg-amber-200/10 text-amber-100",
  emerald: "border-emerald-200/25 bg-emerald-200/10 text-emerald-100",
  slate: "border-white/15 bg-white/[0.08] text-slate-100",
};

const quickActions: AphroditeHomeAction[] = [
  {
    id: "daily_tarot",
    title: "Карта дня",
    text: "Один аркан для фокуса, любви и мягкого действия.",
    icon: <WandSparkles className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "mystic", feature: "dailyCard" },
    tone: "violet",
    badge: "Таро V1",
  },
  {
    id: "compatibility",
    title: "Совместимость",
    text: "Любовь, пара, примирение.",
    icon: <HeartHandshake className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "love", feature: "compatibilityTool" },
    tone: "rose",
    badge: "Главное",
  },
  {
    id: "birth_matrix",
    title: "Матрица судьбы",
    text: "Личный код даты рождения.",
    icon: <Star className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "mystic", feature: "birthMatrix" },
    tone: "amber",
  },
  {
    id: "mystic_cards",
    title: "Мистические карты",
    text: "Таро, руны и дневные символы.",
    icon: <Gem className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "mystic", feature: "tarotCard" },
    tone: "rose",
    badge: "Мистика",
  },
  {
    id: "forecasts",
    title: "Прогноз",
    text: "День, неделя и знаки.",
    icon: <CalendarDays className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "forecasts", feature: "todayForecast" },
    tone: "cyan",
  },
  {
    id: "vip",
    title: "VIP превью",
    text: "Закрытый раздел только в режиме preview.",
    icon: <Crown className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "vip", feature: "vip" },
    tone: "amber",
    badge: "Закрыт",
  },
];

const categories: AphroditeHomeAction[] = [
  {
    id: "horoscopes",
    title: "Гороскопы",
    text: "Сегодня, неделя, месяц, удачные дни",
    icon: <CalendarDays className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "forecasts", feature: "todayForecast" },
    tone: "violet",
    badge: "Ежедневно",
  },
  {
    id: "compatibility",
    title: "Совместимость",
    text: "Любовь, дружба, работа, семья",
    icon: <HeartHandshake className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "love", feature: "compatibilityTool" },
    tone: "rose",
    badge: "Топ",
  },
  {
    id: "angel_numbers",
    title: "Ангельские числа",
    text: "11:11, 22:22, 15:15 и знаки Вселенной",
    icon: <Stars className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "forecasts", feature: "angelNumbers" },
    tone: "cyan",
    badge: "Популярное",
  },
  {
    id: "birth_matrix",
    title: "Матрица судьбы",
    text: "Расчет по дате рождения",
    icon: <Star className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "mystic", feature: "birthMatrix" },
    tone: "amber",
    badge: "Личное",
  },
  {
    id: "numerology",
    title: "Нумерология",
    text: "Число судьбы, души и личности",
    icon: <Hash className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "profile", feature: "numerology" },
    tone: "emerald",
    badge: "Расчет",
  },
  {
    id: "mystic",
    title: "Мистика",
    text: "Карта дня, символы, интуиция",
    icon: <WandSparkles className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "mystic", feature: "dailyCard" },
    tone: "violet",
  },
  {
    id: "tarot_runes",
    title: "Таро и руны",
    text: "Карта дня, руна дня, подсказка",
    icon: <Gem className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "mystic", feature: "tarotCard" },
    tone: "rose",
    badge: "Подсказка",
  },
  {
    id: "moon_rituals",
    title: "Луна и ритуалы",
    text: "Лунный календарь и практики",
    icon: <CircleDot className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "mystic", feature: "lunarRitual" },
    tone: "cyan",
  },
  {
    id: "vip",
    title: "VIP раздел",
    text: "Превью · без оплаты",
    icon: <Crown className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "vip", feature: "vip" },
    tone: "amber",
    badge: "Без оплаты",
  },
  {
    id: "profile",
    title: "Мой профиль",
    text: "Данные, история и быстрый доступ",
    icon: <User className="h-6 w-6" aria-hidden="true" />,
    target: { tab: "profile", feature: "natalChart" },
    tone: "slate",
  },
];

export function AphroditeAstrologyCenterHome({
  publicMode,
  selectedSign,
  vipUntilLabel,
  onOpenCategory,
}: {
  publicMode: boolean;
  selectedSign: ZodiacSign | null;
  vipUntilLabel: string;
  onOpenCategory: (target: AphroditeHomeCategoryTarget, categoryId: string) => void;
}) {
  return (
    <section
      data-aphrodite-miniapp-home-redesign="package-238"
      data-aphrodite-critical-mobile-webview-visual-fix="package-267"
      className={`${panelClass(publicMode)} aphrodite-pkg-267-mobile-webview-fix space-y-3 overflow-hidden`}
    >
      <div className="rounded-lg border border-rose-200/20 bg-[radial-gradient(circle_at_16%_0%,rgba(244,114,182,0.22),transparent_31%),radial-gradient(circle_at_86%_18%,rgba(246,213,138,0.14),transparent_28%),linear-gradient(145deg,rgba(12,14,34,0.94),rgba(31,16,54,0.96)_52%,rgba(50,18,56,0.94))] p-3 shadow-[0_20px_70px_rgba(4,6,18,0.48)] min-[390px]:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <AphroditeBadge tone="rose">Зодиак</AphroditeBadge>
          <AphroditeBadge tone="violet">Карта дня</AphroditeBadge>
          <AphroditeBadge tone="gold">VIP превью</AphroditeBadge>
          {selectedSign ? (
            <AphroditeBadge tone="gold">
              {selectedSign.emoji} {selectedSign.name}
            </AphroditeBadge>
          ) : null}
        </div>

        <div className="mt-3 space-y-1.5">
          <h2 className="break-words text-2xl font-semibold leading-8 text-white">Что между вами сейчас?</h2>
          <p className="max-w-[29rem] text-sm leading-5 text-slate-200">Ежедневная карта, совместимость и личные мистические подсказки в одном спокойном Mini App.</p>
        </div>

        <HomeSpotlightButton action={quickActions[0]!} onOpenCategory={onOpenCategory} />

        <div className="aphrodite-pkg-267-two-after-430 mt-3 grid gap-2">
          {quickActions.slice(1).map((action) => (
            <HomeActionButton key={action.id} action={action} onOpenCategory={onOpenCategory} compact />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-6 text-white">Ещё</h2>
            <p className="text-xs leading-4 text-slate-400">Все разделы доступны ниже.</p>
          </div>
          <AphroditeBadge tone="gold">Разделы</AphroditeBadge>
        </div>

        <div className="aphrodite-pkg-267-two-after-430 grid gap-2">
          {categories.map((category) => (
            <HomeActionButton key={category.id} action={category} onOpenCategory={onOpenCategory} compact />
          ))}
        </div>
      </div>

      <div className="h-[calc(12px+var(--zma-safe-area-bottom,0px))]" aria-hidden="true" />
    </section>
  );
}

function HomeSpotlightButton({
  action,
  onOpenCategory,
}: {
  action: AphroditeHomeAction;
  onOpenCategory: (target: AphroditeHomeCategoryTarget, categoryId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenCategory(action.target, action.id)}
      className="group mt-4 grid min-h-[134px] w-full grid-cols-[auto_1fr] items-center gap-3 rounded-lg border border-amber-100/30 bg-[linear-gradient(135deg,rgba(246,213,138,0.92),rgba(244,176,197,0.94)_48%,rgba(167,139,250,0.94))] px-3 py-3 text-left text-[#160717] shadow-[0_18px_52px_rgba(244,176,197,0.26)] transition hover:border-amber-100/60 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-amber-100/60 min-[390px]:px-4"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/45 bg-white/20 text-[#2a1230] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        {action.icon}
      </span>
      <span className="min-w-0">
        <span className="inline-flex rounded-md border border-[#2a1230]/12 bg-[#2a1230]/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3b1531]">
          {action.badge}
        </span>
        <span className="mt-2 block text-xl font-semibold leading-7 text-[#170817]">{action.title}</span>
        <span className="mt-1 block text-sm leading-5 text-[#3b1531]">{action.text}</span>
        <span className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-[#2a1230]/15 bg-[#160717]/12 px-3 text-sm font-bold text-[#170817] transition group-hover:bg-[#160717]/18">
          Открыть карту дня
        </span>
      </span>
    </button>
  );
}

function HomeActionButton({
  action,
  onOpenCategory,
  compact = false,
}: {
  action: AphroditeHomeAction;
  onOpenCategory: (target: AphroditeHomeCategoryTarget, categoryId: string) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenCategory(action.target, action.id)}
      className={`aphrodite-pkg-267-card-fix group min-w-0 rounded-lg border border-white/12 bg-white/[0.065] text-left shadow-[0_12px_34px_rgba(8,13,30,0.22)] transition hover:border-rose-200/35 hover:bg-white/[0.095] focus:outline-none focus:ring-2 focus:ring-amber-200/45 ${
        compact ? "flex min-h-[58px] items-center gap-2.5 p-2" : "min-h-[116px] p-2.5"
      }`}
    >
      <span className={`inline-flex ${compact ? "h-8 w-8" : "h-11 w-11"} shrink-0 items-center justify-center rounded-lg border ${categoryIconClass[action.tone]}`}>
        {action.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="aphrodite-pkg-267-text-fix block min-w-0 break-words text-sm font-semibold leading-5 text-white">{action.title}</span>
        <span className="aphrodite-pkg-267-text-fix mt-0.5 block line-clamp-1 break-words text-xs leading-4 text-slate-300">{action.text}</span>
      </span>
      {action.badge && !compact ? (
        <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-200/20 bg-amber-200/10 px-2 py-1 text-[11px] font-semibold leading-4 text-amber-100">
          {action.badge}
        </span>
      ) : null}
    </button>
  );
}
