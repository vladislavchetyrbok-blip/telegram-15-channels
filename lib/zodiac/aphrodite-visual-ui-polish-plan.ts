/**
 * Package 193: Aphrodite Visual UI Polish Plan.
 *
 * Static plan for future visual polish. It documents design direction only and
 * does not change live Mini App design, routes, payments, VIP access, Telegram
 * API, database writes, or production launch behavior.
 */

export type AphroditeVisualUiPolishArea = {
  id: string;
  label: string;
  currentIssue: string;
  polishPlan: string;
  source: "visual-plan-only";
};

export type AphroditeVisualUiPolishPrinciple = {
  id: string;
  label: string;
  description: string;
  implementationState: "not-started";
};

export type AphroditeVisualUiPolishBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeVisualUiPolishPlanModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  polishAreas: AphroditeVisualUiPolishArea[];
  principles: AphroditeVisualUiPolishPrinciple[];
  boundaries: AphroditeVisualUiPolishBoundary[];
  summary: {
    polishAreasPlanned: number;
    principlesCount: number;
    liveDesignChangedNow: false;
  };
  liveDesignChangedNow: false;
  liveUiChangedNow: false;
  productionLaunchNow: false;
  paymentChangedNow: false;
  vipUnlockNow: false;
  telegramApiNow: false;
  databaseWriteNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_VISUAL_UI_POLISH_PLAN_TITLE =
  "План визуального улучшения Aphrodite";

export const APHRODITE_VISUAL_UI_POLISH_PLAN_CLASSIFICATION =
  "Только UI polish plan / Live дизайн не изменён / Нет запуска";

export const APHRODITE_VISUAL_UI_POLISH_PLAN_RULE =
  "Visual UI Polish Plan фиксирует будущий визуальный стандарт Aphrodite, но не меняет live дизайн, routes, payments, VIP, Telegram API или database state.";

export const APHRODITE_VISUAL_UI_POLISH_PLAN_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет изменения оплаты",
  "Нет VIP-разблокировки",
  "Нет Telegram API",
  "Нет записи в базу данных",
  "UI polish plan не меняет live дизайн",
] as const;

const polishAreas: AphroditeVisualUiPolishArea[] = [
  {
    id: "simplified-visual-style",
    label: "simplified visual style",
    currentIssue: "Интерфейс может выглядеть слишком многослойным для первого результата.",
    polishPlan: "Сделать спокойную визуальную основу с ясными блоками и меньшим числом декоративных эффектов.",
    source: "visual-plan-only",
  },
  {
    id: "premium-mystical-not-overloaded",
    label: "premium mystical but not overloaded",
    currentIssue: "Мистический стиль может перегружать внимание пользователя.",
    polishPlan: "Сохранить premium mystical ощущение через типографику, свет и детали, но убрать визуальный шум.",
    source: "visual-plan-only",
  },
  {
    id: "readable-cards",
    label: "readable cards",
    currentIssue: "Карточки результата должны быстрее сканироваться на mobile.",
    polishPlan: "Усилить контраст текста, rhythm и предсказуемые отступы внутри result cards.",
    source: "visual-plan-only",
  },
  {
    id: "fewer-gradients",
    label: "fewer gradients",
    currentIssue: "Слишком много gradients делает экран менее спокойным.",
    polishPlan: "Оставить gradients только как мягкие акценты, не как основной фон каждого блока.",
    source: "visual-plan-only",
  },
  {
    id: "better-spacing",
    label: "better spacing",
    currentIssue: "Плотные блоки снижают ощущение premium и читаемость.",
    polishPlan: "Сделать spacing стабильным: компактно, но с воздухом между смысловыми зонами.",
    source: "visual-plan-only",
  },
  {
    id: "clearer-typography",
    label: "clearer typography",
    currentIssue: "Заголовки, подписи и body copy должны иметь более понятную иерархию.",
    polishPlan: "Ограничить размеры, убрать лишний caps и сделать result text главным.",
    source: "visual-plan-only",
  },
  {
    id: "main-cta-hierarchy",
    label: "main CTA hierarchy",
    currentIssue: "CTA могут конкурировать между собой.",
    polishPlan: "Один главный CTA, вторичные действия спокойнее и ниже по визуальному весу.",
    source: "visual-plan-only",
  },
  {
    id: "result-cards-style",
    label: "result cards style",
    currentIssue: "Разные результаты могут выглядеть несобранно.",
    polishPlan: "Единый стиль result cards: headline, insight, action, safety note.",
    source: "visual-plan-only",
  },
  {
    id: "compatibility-result-style",
    label: "compatibility result style",
    currentIssue: "Compatibility result должен быть эмоциональным, но понятным.",
    polishPlan: "Показать score, short insight и next action без перегруза.",
    source: "visual-plan-only",
  },
  {
    id: "love-reading-result-style",
    label: "Love Reading result style",
    currentIssue: "Love Reading result должен ощущаться главным продуктовым моментом.",
    polishPlan: "Сделать сильный first insight, мягкий romantic tone и ясный free preview boundary.",
    source: "visual-plan-only",
  },
  {
    id: "weekly-monthly-horoscope-cards",
    label: "weekly/monthly horoscope cards",
    currentIssue: "Weekly/monthly cards должны отличаться от daily без лишней сложности.",
    polishPlan: "Сделать cards с period label, theme, 2-3 bullets и calm CTA.",
    source: "visual-plan-only",
  },
  {
    id: "loading-empty-states",
    label: "loading/empty states",
    currentIssue: "Loading и empty states могут выглядеть как техническая пауза.",
    polishPlan: "Сделать короткие friendly states, которые удерживают ощущение Mini App.",
    source: "visual-plan-only",
  },
  {
    id: "mobile-first",
    label: "mobile first",
    currentIssue: "Первичная среда использования — Telegram WebView на телефоне.",
    polishPlan: "Планировать размеры, touch targets и line length от mobile вверх.",
    source: "visual-plan-only",
  },
  {
    id: "telegram-webapp-safe-area",
    label: "Telegram WebApp safe area",
    currentIssue: "Кнопки и bottom actions не должны конфликтовать с Telegram controls.",
    polishPlan: "Оставить safe area для bottom spacing и проверить top/bottom WebView layout.",
    source: "visual-plan-only",
  },
  {
    id: "dark-theme-consistency",
    label: "dark theme consistency",
    currentIssue: "Разные dark surfaces могут выглядеть несогласованно.",
    polishPlan: "Свести dark theme к ограниченному набору surface, border и text colors.",
    source: "visual-plan-only",
  },
];

const principles: AphroditeVisualUiPolishPrinciple[] = [
  { id: "calm-premium", label: "calm premium", description: "Premium ощущение строится на ясности, spacing и уверенной типографике.", implementationState: "not-started" },
  { id: "mystical-with-control", label: "mystical with control", description: "Мистика остаётся акцентом, а не визуальным шумом.", implementationState: "not-started" },
  { id: "result-first", label: "result first", description: "Пользователь должен быстро увидеть главный insight.", implementationState: "not-started" },
  { id: "mobile-scan", label: "mobile scan", description: "Каждый экран должен читаться короткими смысловыми блоками.", implementationState: "not-started" },
  { id: "single-action-focus", label: "single action focus", description: "Один главный next action на каждом ключевом экране.", implementationState: "not-started" },
  { id: "consistent-surfaces", label: "consistent surfaces", description: "Карточки, result blocks и status notes используют общий визуальный язык.", implementationState: "not-started" },
];

const boundaries: AphroditeVisualUiPolishBoundary[] = [
  { id: "no-live-design-change", label: "Live дизайн не изменён", currentState: "plan-only" },
  { id: "no-live-ui-change", label: "Live UI не изменён", currentState: "нет изменений Mini App components" },
  { id: "no-payment-change", label: "Нет изменения оплаты", currentState: "payment untouched" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "access untouched" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "нет Bot API вызовов" },
  { id: "no-db-write", label: "Нет записи в базу данных", currentState: "нет persistence" },
  { id: "no-production-launch", label: "Нет production-запуска", currentState: "launch untouched" },
];

export function getAphroditeVisualUiPolishPlan(): AphroditeVisualUiPolishPlanModel {
  const copiedAreas = polishAreas.map((area) => ({ ...area }));
  const copiedPrinciples = principles.map((principle) => ({ ...principle }));
  return {
    title: APHRODITE_VISUAL_UI_POLISH_PLAN_TITLE,
    classification: APHRODITE_VISUAL_UI_POLISH_PLAN_CLASSIFICATION,
    safetyLabels: APHRODITE_VISUAL_UI_POLISH_PLAN_SAFETY_LABELS,
    polishAreas: copiedAreas,
    principles: copiedPrinciples,
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    summary: {
      polishAreasPlanned: copiedAreas.length,
      principlesCount: copiedPrinciples.length,
      liveDesignChangedNow: false,
    },
    liveDesignChangedNow: false,
    liveUiChangedNow: false,
    productionLaunchNow: false,
    paymentChangedNow: false,
    vipUnlockNow: false,
    telegramApiNow: false,
    databaseWriteNow: false,
    nextRecommendedPackage: "Package 194 — Product Copy Final Polish",
  };
}
