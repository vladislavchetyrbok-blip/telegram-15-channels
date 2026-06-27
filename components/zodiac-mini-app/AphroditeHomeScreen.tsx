"use client";

import type { ReactNode } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CircleDot,
  Crown,
  Gem,
  Hash,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  Stars,
  User,
  WandSparkles,
} from "lucide-react";

import { AphroditeBadge, AphroditeCard } from "./aphrodite-design-system";
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
    text: "Любовь, страсть, примирение и мягкий совет для пары.",
    icon: <HeartHandshake className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "love", feature: "compatibilityTool" },
    tone: "rose",
    badge: "Главное",
  },
  {
    id: "birth_matrix",
    title: "Матрица судьбы",
    text: "Личный код по дате рождения в безопасном текстовом вводе.",
    icon: <Star className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "mystic", feature: "birthMatrix" },
    tone: "amber",
  },
  {
    id: "mystic",
    title: "Мистическая карта",
    text: "Карта дня, Таро, руна и спокойная подсказка настроения.",
    icon: <WandSparkles className="h-5 w-5" aria-hidden="true" />,
    target: { tab: "mystic", feature: "dailyCard" },
    tone: "violet",
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
    text: "Премиум-функции остаются preview до ручного решения владельца",
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
      className={`${panelClass(publicMode)} space-y-4 overflow-hidden`}
    >
      <div className="rounded-lg border border-rose-200/20 bg-[linear-gradient(145deg,rgba(251,113,133,0.18),rgba(167,139,250,0.13)_48%,rgba(246,213,138,0.1))] p-4 shadow-[0_22px_70px_rgba(7,7,19,0.5)]">
        <div className="flex flex-wrap items-center gap-2">
          <AphroditeBadge tone="rose">Aphrodite</AphroditeBadge>
          <AphroditeBadge tone="violet">premium mystical romantic</AphroditeBadge>
          <AphroditeBadge tone="gold">VIP preview до {vipUntilLabel}</AphroditeBadge>
          {selectedSign ? (
            <AphroditeBadge tone="gold">
              {selectedSign.emoji} {selectedSign.name}
            </AphroditeBadge>
          ) : null}
        </div>

        <div className="mt-4 space-y-2">
          <h2 className="break-words text-2xl font-semibold leading-8 text-white">
            Астрологический центр для любви и знаков
          </h2>
          <p className="text-sm leading-6 text-slate-200">
            Выберите, что хотите узнать сегодня: совместимость пары, личную Матрицу судьбы,
            мистическую карту или прогноз дня.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCategory({ tab: "love", feature: "compatibilityTool" }, "compatibility")}
          className="mt-4 flex min-h-[58px] w-full items-center justify-between gap-3 rounded-lg border border-amber-100/35 bg-[linear-gradient(135deg,#fb7185,#f6d58a)] px-4 py-3 text-left text-[#190914] shadow-[0_16px_44px_rgba(251,113,133,0.28)] transition hover:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/55"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5">Проверить совместимость</span>
            <span className="mt-1 block text-xs leading-4 text-[#3d1622]">
              Главный вход в любовь, пару и отношения
            </span>
          </span>
          <HeartHandshake className="h-5 w-5 shrink-0" aria-hidden="true" />
        </button>

        <div className="mt-3 grid gap-2 min-[390px]:grid-cols-2">
          {quickActions.slice(1).map((action) => (
            <HomeActionButton key={action.id} action={action} onOpenCategory={onOpenCategory} compact />
          ))}
        </div>
      </div>

      <div className="grid gap-3 min-[390px]:grid-cols-2">
        <AphroditeCard tone="violet" className="min-h-[148px]">
          <div className="flex h-full flex-col justify-between gap-3">
            <AphroditeBadge tone="violet">карта дня</AphroditeBadge>
            <div>
              <h3 className="text-base font-semibold leading-6 text-white">Мягкий фокус дня</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Начните с совместимости или мистической карты, чтобы получить короткий личный ориентир
                без плотного технического текста.
              </p>
            </div>
          </div>
        </AphroditeCard>

        <AphroditeCard tone="locked" className="min-h-[148px]">
          <div className="flex h-full flex-col justify-between gap-3">
            <AphroditeBadge tone="locked">VIP locked preview</AphroditeBadge>
            <div>
              <h3 className="text-base font-semibold leading-6 text-white">Full relationship report</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Deep compatibility, Birth Matrix Pro and 30-day couple focus stay preview-only:
                no active payment, no VIP unlock.
              </p>
            </div>
          </div>
        </AphroditeCard>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-6 text-white">Разделы Mini App</h2>
            <p className="text-sm leading-6 text-slate-400">
              Все входы ведут в уже существующие безопасные flow.
            </p>
          </div>
          <AphroditeBadge tone="gold">10 разделов</AphroditeBadge>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
          {categories.map((category) => (
            <HomeActionButton key={category.id} action={category} onOpenCategory={onOpenCategory} />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-emerald-300/20 bg-emerald-950/15 p-3">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200/25 bg-emerald-200/10 text-emerald-100">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-5 text-emerald-100">Безопасный preview-режим</h3>
            <p className="mt-1 text-xs leading-5 text-emerald-50/80">
              No active payment. No VIP unlock. No Telegram messages are sent from this screen.
              Owner review is still required before public launch.
            </p>
          </div>
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
      className={`group min-w-0 rounded-lg border border-white/12 bg-white/[0.065] p-3 text-left shadow-[0_14px_44px_rgba(8,13,30,0.28)] transition hover:border-rose-200/35 hover:bg-white/[0.095] focus:outline-none focus:ring-2 focus:ring-amber-200/45 ${
        compact ? "min-h-[104px]" : "min-h-[154px]"
      }`}
    >
      <span className={`inline-flex ${compact ? "h-9 w-9" : "h-11 w-11"} items-center justify-center rounded-lg border ${categoryIconClass[action.tone]}`}>
        {action.icon}
      </span>
      <span className="mt-3 block min-w-0 break-words text-sm font-semibold leading-5 text-white">{action.title}</span>
      <span className="mt-1 block break-words text-xs leading-5 text-slate-300">{action.text}</span>
      {action.badge ? (
        <span className="mt-3 inline-flex items-center gap-1 rounded-md border border-amber-200/20 bg-amber-200/10 px-2 py-1 text-[11px] font-semibold leading-4 text-amber-100">
          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
          {action.badge}
        </span>
      ) : null}
    </button>
  );
}
