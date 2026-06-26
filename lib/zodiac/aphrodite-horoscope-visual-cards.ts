/**
 * Package 203: Aphrodite Daily/Weekly/Monthly Horoscope Visual Cards.
 *
 * UI definitions only. These records describe compact horoscope card structure
 * without changing generation, publishing, ledger, cron, Telegram API, payment,
 * VIP access, or database behavior.
 */

export type AphroditeHoroscopePeriodType = "daily" | "weekly" | "monthly";

export type AphroditeHoroscopeVisualCardDefinition = {
  periodType: AphroditeHoroscopePeriodType;
  title: string;
  signLabel: string;
  periodLabel: string;
  mainTheme: string;
  loveRelationship: string;
  energy: string;
  attentionZone: string;
  ctaFallback: string;
  layoutNotes: readonly string[];
};

export type AphroditeHoroscopeVisualCardsModel = {
  packageNumber: 203;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  cards: AphroditeHoroscopeVisualCardDefinition[];
  requiredStructure: readonly string[];
  safetyFlags: {
    publishingChangedNow: false;
    telegramApiNow: false;
    cronWorkflowChangedNow: false;
    ledgerChangedNow: false;
    paymentChangedNow: false;
    vipUnlockNow: false;
    databaseWriteNow: false;
    postsPublishedNow: false;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_HOROSCOPE_VISUAL_CARDS_TITLE =
  "Визуальные карточки гороскопов";

export const APHRODITE_HOROSCOPE_VISUAL_CARDS_CLASSIFICATION =
  "Только UI cards / Публикация не изменена / Нет Telegram API";

export const APHRODITE_HOROSCOPE_VISUAL_CARDS_SAFETY_LABELS = [
  "Нет изменения публикаций",
  "Нет Telegram API",
  "Нет изменения cron/workflows",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "Horoscope cards не публикуют посты",
] as const;

export const APHRODITE_HOROSCOPE_VISUAL_CARDS_RULE =
  "Package 203 добавляет reusable UI cards для daily/weekly/monthly horoscope preview и не меняет генерацию, ledger, cron, publish scripts, Telegram API или production delivery.";

const horoscopeCards: AphroditeHoroscopeVisualCardDefinition[] = [
  {
    periodType: "daily",
    title: "Daily horoscope card",
    signLabel: "Овен",
    periodLabel: "Сегодня",
    mainTheme: "Один главный фокус дня вместо длинного полотна текста.",
    loveRelationship: "Короткий relational insight: что сказать мягче и где не давить.",
    energy: "Пульс дня: спокойный темп, короткие паузы и ясный первый шаг.",
    attentionZone: "Не принимать усталость за знак судьбы и не обещать больше, чем реально сделать.",
    ctaFallback: "Открыть Mini App preview без оплаты и без VIP-разблокировки.",
    layoutNotes: [
      "sign label всегда виден в верхней строке",
      "period label расположен рядом с типом периода",
      "main theme идёт первым",
      "CTA/fallback area отделён от прогноза",
      "mobile card не превращается в стену текста",
    ],
  },
  {
    periodType: "weekly",
    title: "Weekly horoscope card",
    signLabel: "Телец",
    periodLabel: "Новая неделя",
    mainTheme: "Период показывает weekStart/weekEnd и тему недели без смешения с датой генерации.",
    loveRelationship: "Любовь и отношения вынесены в отдельный компактный блок.",
    energy: "Энергия недели описывает ритм, дни силы и восстановление.",
    attentionZone: "Зона внимания не звучит как жёсткое предсказание и не пугает.",
    ctaFallback: "Перейти к Mini App preview, не меняя weekly publish logic.",
    layoutNotes: [
      "week period должен читаться как upcoming week",
      "sections сокращены до сканируемых строк",
      "ledger key остаётся target-period based",
      "CTA/fallback не публикует пост",
      "карточка пригодна для Telegram WebView",
    ],
  },
  {
    periodType: "monthly",
    title: "Monthly horoscope card",
    signLabel: "Общий гороскоп",
    periodLabel: "Июль 2026",
    mainTheme: "Месячный прогноз показывает следующий календарный месяц после 20 числа.",
    loveRelationship: "Отношения описаны мягко: выбор, разговор, границы и поддержка.",
    energy: "Энергия месяца собрана в одну главную линию, без финансовых или медицинских обещаний.",
    attentionZone: "Зона внимания предупреждает о перегрузе, но не манипулирует страхом.",
    ctaFallback: "Открыть preview месяца без оплаты, VIP unlock и Telegram API.",
    layoutNotes: [
      "month label не должен описывать текущий месяц после 20 числа",
      "main theme перед подробностями",
      "love/energy/attention имеют одинаковую visual hierarchy",
      "fallback area безопасный и без pay CTA",
      "monthly card сохраняет компактную mobile высоту",
    ],
  },
];

export function getAphroditeHoroscopeVisualCards(): AphroditeHoroscopeVisualCardsModel {
  return {
    packageNumber: 203,
    title: APHRODITE_HOROSCOPE_VISUAL_CARDS_TITLE,
    classification: APHRODITE_HOROSCOPE_VISUAL_CARDS_CLASSIFICATION,
    safetyLabels: APHRODITE_HOROSCOPE_VISUAL_CARDS_SAFETY_LABELS,
    cards: horoscopeCards.map((card) => ({ ...card, layoutNotes: [...card.layoutNotes] })),
    requiredStructure: [
      "daily card",
      "weekly card",
      "monthly card",
      "sign label",
      "period label",
      "main theme",
      "love/relationship section",
      "energy section",
      "zone of attention",
      "CTA/fallback area",
      "compact mobile readable layout",
      "no wall of text",
      "no payment CTA",
      "no VIP unlock",
    ],
    safetyFlags: {
      publishingChangedNow: false,
      telegramApiNow: false,
      cronWorkflowChangedNow: false,
      ledgerChangedNow: false,
      paymentChangedNow: false,
      vipUnlockNow: false,
      databaseWriteNow: false,
      postsPublishedNow: false,
    },
    nextRecommendedPackage: "Package 204 — Mystic / Cards / Universe Message Visual Upgrade",
  };
}
