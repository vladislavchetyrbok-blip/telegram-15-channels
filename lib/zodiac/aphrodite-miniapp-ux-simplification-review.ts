/**
 * Package 192: Mini App UX Simplification Review.
 *
 * Static UX review for future Mini App simplification. It does not modify live
 * Mini App routes, payments, VIP access, Telegram API, database writes, or
 * production launch behavior.
 */

export type AphroditeMiniappUxReviewArea = {
  id: string;
  label: string;
  currentRisk: string;
  simplificationReview: string;
  source: "ux-review-only";
};

export type AphroditeMiniappUxRecommendation = {
  id: string;
  label: string;
  reason: string;
  implementationState: "not-started";
};

export type AphroditeMiniappUxBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeMiniappUxSimplificationReviewModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  uxAreas: AphroditeMiniappUxReviewArea[];
  recommendations: AphroditeMiniappUxRecommendation[];
  boundaries: AphroditeMiniappUxBoundary[];
  summary: {
    uxAreasReviewed: number;
    recommendationsCount: number;
    liveFlowChangedNow: false;
  };
  liveUiChangedNow: false;
  liveFlowChangedNow: false;
  paymentChangedNow: false;
  vipUnlockNow: false;
  telegramApiNow: false;
  databaseWriteNow: false;
  productionLaunchNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_TITLE =
  "Review упрощения Mini App UX";

export const APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_CLASSIFICATION =
  "Только UX review / Live UI не изменён / Нет запуска";

export const APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_RULE =
  "Mini App UX Simplification Review описывает будущие улучшения пользовательского пути, но не меняет live UI, routes, payments, VIP, Telegram API или database state.";

export const APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет изменения оплаты",
  "Нет VIP-разблокировки",
  "Нет Telegram API",
  "Нет записи в базу данных",
  "UX review не меняет live flow",
] as const;

const uxAreas: AphroditeMiniappUxReviewArea[] = [
  {
    id: "mini-app-home-screen",
    label: "Mini App home screen",
    currentRisk: "Первый экран может перегружать пользователя количеством входов.",
    simplificationReview: "Оставить один главный путь и короткий список вторичных действий.",
    source: "ux-review-only",
  },
  {
    id: "love-reading-entry",
    label: "Love Reading entry",
    currentRisk: "Путь к Love Reading может конкурировать с другими карточками.",
    simplificationReview: "Сделать Love Reading главным эмоциональным входом с коротким понятным CTA.",
    source: "ux-review-only",
  },
  {
    id: "compatibility-entry",
    label: "Compatibility entry",
    currentRisk: "Совместимость может теряться среди похожих астрологических модулей.",
    simplificationReview: "Поставить compatibility как второй понятный вход после Love Reading.",
    source: "ux-review-only",
  },
  {
    id: "birth-matrix-entry",
    label: "Birth Matrix entry",
    currentRisk: "Матрица судьбы требует отдельного ожидания по дате рождения и результату.",
    simplificationReview: "Показать как спокойный самостоятельный инструмент, не смешивая с paywall teaser.",
    source: "ux-review-only",
  },
  {
    id: "daily-weekly-monthly-content-entry",
    label: "Daily/weekly/monthly content entry",
    currentRisk: "Daily, weekly и monthly могут выглядеть как три равных конкурирующих модуля.",
    simplificationReview: "Сгруппировать гороскопы в один вход с понятными tabs или сегментами.",
    source: "ux-review-only",
  },
  {
    id: "too-many-cards-modules",
    label: "too many cards/modules",
    currentRisk: "Большое число cards/modules увеличивает cognitive load.",
    simplificationReview: "Сократить верхний уровень до 3-4 вариантов и перенести остальное ниже.",
    source: "ux-review-only",
  },
  {
    id: "unclear-vip-teasers",
    label: "unclear VIP teasers",
    currentRisk: "VIP teasers могут выглядеть как активная оплата, хотя оплата не включена.",
    simplificationReview: "Оставить teaser ниже free actions и явно помечать как future/preview.",
    source: "ux-review-only",
  },
  {
    id: "cta-hierarchy",
    label: "CTA hierarchy",
    currentRisk: "Несколько CTA одинаковой силы мешают выбрать следующий шаг.",
    simplificationReview: "Один primary CTA на экран, остальные действия вторичные.",
    source: "ux-review-only",
  },
  {
    id: "button-labels",
    label: "button labels",
    currentRisk: "Длинные button labels хуже читаются в Telegram WebView.",
    simplificationReview: "Сократить labels до действия и результата: открыть, рассчитать, посмотреть.",
    source: "ux-review-only",
  },
  {
    id: "mobile-readability",
    label: "mobile readability",
    currentRisk: "Плотные тексты и мелкие подписи ухудшают mobile scan.",
    simplificationReview: "Укоротить абзацы, увеличить rhythm и держать result copy в коротких блоках.",
    source: "ux-review-only",
  },
  {
    id: "loading-states",
    label: "loading states",
    currentRisk: "Без понятного loading пользователь не уверен, что расчёт идёт.",
    simplificationReview: "Подготовить мягкие skeleton/loading states без external calls.",
    source: "ux-review-only",
  },
  {
    id: "empty-error-states",
    label: "empty/error states",
    currentRisk: "Ошибки ввода могут выглядеть как поломка сценария.",
    simplificationReview: "Сделать дружелюбные empty/error states с коротким восстановлением.",
    source: "ux-review-only",
  },
  {
    id: "back-button-behavior",
    label: "back button behavior",
    currentRisk: "Переходы назад могут быть неочевидны внутри Telegram WebView.",
    simplificationReview: "Унифицировать back behavior и явно возвращать пользователя к hub.",
    source: "ux-review-only",
  },
  {
    id: "telegram-webapp-feel",
    label: "Telegram WebApp feel",
    currentRisk: "Интерфейс может ощущаться как внешний сайт, а не Mini App.",
    simplificationReview: "Упростить navigation, учесть safe area и избегать тяжёлых hero-блоков.",
    source: "ux-review-only",
  },
  {
    id: "reduce-cognitive-load",
    label: "reduce cognitive load",
    currentRisk: "Пользователь видит много обещаний до первого результата.",
    simplificationReview: "Сначала дать быстрый бесплатный результат, затем аккуратно показывать расширения.",
    source: "ux-review-only",
  },
];

const recommendations: AphroditeMiniappUxRecommendation[] = [
  { id: "reduce-top-level-modules", label: "reduce top-level modules", reason: "Меньше выбора на первом экране ускоряет первый результат.", implementationState: "not-started" },
  { id: "one-primary-cta", label: "one primary CTA", reason: "Один главный CTA убирает конкуренцию действий.", implementationState: "not-started" },
  { id: "short-labels", label: "short labels", reason: "Короткие labels лучше помещаются в mobile Telegram WebView.", implementationState: "not-started" },
  { id: "group-horoscopes", label: "group daily/weekly/monthly", reason: "Гороскопы должны восприниматься как единый контентный раздел.", implementationState: "not-started" },
  { id: "vip-below-free", label: "move VIP teasers below free actions", reason: "Free result должен идти до future paid teaser.", implementationState: "not-started" },
  { id: "explicit-fallback", label: "explicit fallback", reason: "Fallback route снижает потерю пользователя после guard denied или старой ссылки.", implementationState: "not-started" },
  { id: "consistent-back", label: "consistent back behavior", reason: "Пользователь должен предсказуемо возвращаться к hub.", implementationState: "not-started" },
  { id: "skeleton-loading-copy", label: "skeleton/loading copy", reason: "Loading state должен объяснять ожидание без обещания реального AI call.", implementationState: "not-started" },
  { id: "friendly-empty-error", label: "friendly empty/error states", reason: "Ошибки ввода должны давать короткое восстановление.", implementationState: "not-started" },
  { id: "telegram-safe-area", label: "Telegram safe area", reason: "Основные действия не должны конфликтовать с WebView controls.", implementationState: "not-started" },
];

const boundaries: AphroditeMiniappUxBoundary[] = [
  { id: "no-live-ui-change", label: "Live UI не изменён", currentState: "review-only" },
  { id: "no-live-flow-change", label: "Live flow не изменён", currentState: "нет изменений Mini App routes" },
  { id: "no-payment-change", label: "Нет изменения оплаты", currentState: "payment untouched" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "access untouched" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "нет Bot API вызовов" },
  { id: "no-db-write", label: "Нет записи в базу данных", currentState: "нет persistence" },
  { id: "no-production-launch", label: "Нет production-запуска", currentState: "launch untouched" },
];

export function getAphroditeMiniappUxSimplificationReview(): AphroditeMiniappUxSimplificationReviewModel {
  const copiedAreas = uxAreas.map((area) => ({ ...area }));
  const copiedRecommendations = recommendations.map((recommendation) => ({ ...recommendation }));
  return {
    title: APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_TITLE,
    classification: APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_CLASSIFICATION,
    safetyLabels: APHRODITE_MINIAPP_UX_SIMPLIFICATION_REVIEW_SAFETY_LABELS,
    uxAreas: copiedAreas,
    recommendations: copiedRecommendations,
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    summary: {
      uxAreasReviewed: copiedAreas.length,
      recommendationsCount: copiedRecommendations.length,
      liveFlowChangedNow: false,
    },
    liveUiChangedNow: false,
    liveFlowChangedNow: false,
    paymentChangedNow: false,
    vipUnlockNow: false,
    telegramApiNow: false,
    databaseWriteNow: false,
    productionLaunchNow: false,
    nextRecommendedPackage: "Package 193 — Aphrodite Visual UI Polish Plan",
  };
}
