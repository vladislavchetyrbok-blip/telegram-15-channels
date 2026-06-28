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
    id: "compatibility",
    title: "Проверить совместимость",
    text: "Любовь, пара, примирение.",
    icon: <HeartHandshake className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "love", feature: "compatibilityTool" },
    tone: "rose",
    badge: "Главное",
  },
  {
    id: "birth_matrix",
    title: "Матрица судьбы",
    text: "Код даты рождения.",
    icon: <Star className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "mystic", feature: "birthMatrix" },
    tone: "amber",
  },
  {
    id: "mystic",
    title: "Мистическая карта",
    text: "Карта дня, Таро и руна.",
    icon: <WandSparkles className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "mystic", feature: "dailyCard" },
    tone: "violet",
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
    title: "VIP preview",
    text: "Без оплаты · VIP закрыт.",
    icon: <Crown className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "vip", feature: "vip" },
    tone: "amber",
    badge: "Preview",
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
    text: "Знаки дня, символы, интуиция",
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
    text: "Preview · без оплаты",
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
      <div className="rounded-lg border border-rose-200/20 bg-[linear-gradient(145deg,rgba(251,113,133,0.18),rgba(167,139,250,0.13)_48%,rgba(246,213,138,0.1))] p-3 shadow-[0_18px_54px_rgba(7,7,19,0.38)] min-[390px]:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <AphroditeBadge tone="rose">Зодиак</AphroditeBadge>
          <AphroditeBadge tone="violet">романтика</AphroditeBadge>
          <AphroditeBadge tone="gold">VIP preview</AphroditeBadge>
          {selectedSign ? (
            <AphroditeBadge tone="gold">
              {selectedSign.emoji} {selectedSign.name}
            </AphroditeBadge>
          ) : null}
        </div>

        <div className="mt-3 space-y-1.5">
          <h2 className="break-words text-2xl font-semibold leading-8 text-white">Что между вами сейчас?</h2>
          <p className="text-sm leading-5 text-slate-200">Совместимость, Матрица, Мистика и VIP preview.</p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCategory({ tab: "love", feature: "compatibilityTool" }, "compatibility")}
          className="mt-4 flex min-h-[58px] w-full items-center justify-between gap-3 rounded-lg border border-amber-100/35 bg-[linear-gradient(135deg,#fb7185,#f6d58a)] px-4 py-3 text-left text-[#190914] shadow-[0_16px_44px_rgba(251,113,133,0.28)] transition hover:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/55"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5">Проверить совместимость</span>
            <span className="mt-1 block text-xs leading-4 text-[#3d1622]">
              Любовь, пара, примирение
            </span>
          </span>
          <HeartHandshake className="h-5 w-5 shrink-0" aria-hidden="true" />
        </button>

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
