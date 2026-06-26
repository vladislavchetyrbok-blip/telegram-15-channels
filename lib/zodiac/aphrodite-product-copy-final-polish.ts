/**
 * Package 194: Product Copy Final Polish.
 *
 * Static copy polish standards for future Aphrodite launch. This package keeps
 * live product copy unchanged and does not enable payments, VIP access,
 * Telegram API, database writes, or production launch behavior.
 */

export type AphroditeProductCopyStandard = {
  id: string;
  label: string;
  standard: string;
  riskToAvoid: string;
  source: "copy-polish-only";
};

export type AphroditeProductCopyGuardrail = {
  id: string;
  label: string;
  description: string;
  required: true;
};

export type AphroditeProductCopyBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeProductCopyFinalPolishModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  standards: AphroditeProductCopyStandard[];
  guardrails: AphroditeProductCopyGuardrail[];
  boundaries: AphroditeProductCopyBoundary[];
  summary: {
    standardsCount: number;
    guardrailsCount: number;
    onlyDocsDashboardCopyNow: true;
  };
  liveCopyChangedNow: false;
  onlyDocsDashboardCopyNow: true;
  productionLaunchNow: false;
  paymentEnabledNow: false;
  vipUnlockNow: false;
  telegramApiNow: false;
  databaseWriteNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_PRODUCT_COPY_FINAL_POLISH_TITLE =
  "Финальная полировка текстов Aphrodite";

export const APHRODITE_PRODUCT_COPY_FINAL_POLISH_CLASSIFICATION =
  "Только copy polish / Live тексты почти не меняются / Нет запуска";

export const APHRODITE_PRODUCT_COPY_FINAL_POLISH_RULE =
  "Product Copy Final Polish задаёт будущие copy standards и guardrails, но не меняет live Mini App flow, не включает оплату, не открывает VIP и не вызывает Telegram API.";

export const APHRODITE_PRODUCT_COPY_FINAL_POLISH_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет изменения оплаты",
  "Нет VIP-разблокировки",
  "Нет Telegram API",
  "Нет записи в базу данных",
  "Copy polish не включает оплату",
] as const;

const standards: AphroditeProductCopyStandard[] = [
  {
    id: "first-screen-promise",
    label: "first screen promise",
    standard: "Первый экран должен обещать быстрый понятный результат, а не список всех возможностей.",
    riskToAvoid: "Слишком широкий promise, который не ведёт к первому действию.",
    source: "copy-polish-only",
  },
  {
    id: "ai-love-reading",
    label: "AI Love Reading",
    standard: "Love Reading copy должен звучать тепло, конкретно и не обещать абсолютную судьбу.",
    riskToAvoid: "Манипулятивные формулировки и hard prophecy.",
    source: "copy-polish-only",
  },
  {
    id: "compatibility",
    label: "compatibility",
    standard: "Compatibility copy объясняет совместимость как reflection/insight, а не окончательный verdict.",
    riskToAvoid: "Тон, который пугает или закрывает отношения одним score.",
    source: "copy-polish-only",
  },
  {
    id: "birth-matrix",
    label: "birth matrix",
    standard: "Birth matrix copy должен объяснять дату рождения, результат и границы интерпретации.",
    riskToAvoid: "Слишком эзотерический текст без практического смысла.",
    source: "copy-polish-only",
  },
  {
    id: "thirty-days-couple",
    label: "30 days couple",
    standard: "30 days couple copy должен обещать разнообразный календарь действий пары.",
    riskToAvoid: "Повторяющиеся одинаковые обещания на каждый день.",
    source: "copy-polish-only",
  },
  {
    id: "daily-weekly-monthly-horoscopes",
    label: "daily/weekly/monthly horoscopes",
    standard: "Гороскопы должны явно называть period: сегодня, на новую неделю или на следующий месяц.",
    riskToAvoid: "Путаница current/next period и слишком общие формулировки.",
    source: "copy-polish-only",
  },
  {
    id: "full-love-report-teaser",
    label: "Full Love Report teaser",
    standard: "Teaser будущего полного отчёта должен быть честным preview без активной оплаты.",
    riskToAvoid: "Создать впечатление, что payment уже включён.",
    source: "copy-polish-only",
  },
  {
    id: "paywall-copy-future",
    label: "paywall copy future",
    standard: "Будущий paywall copy должен быть ясным, без давления и без скрытых условий.",
    riskToAvoid: "Fear-based urgency и обещание доступа без готовой оплаты.",
    source: "copy-polish-only",
  },
  {
    id: "support-refund-wording",
    label: "support/refund wording",
    standard: "Support/refund wording должен быть спокойным, понятным и готовым до будущей оплаты.",
    riskToAvoid: "Неясные условия поддержки и возврата.",
    source: "copy-polish-only",
  },
  {
    id: "privacy-disclaimers",
    label: "privacy disclaimers",
    standard: "Privacy disclaimers должны честно объяснять данные, ограничения и отсутствие скрытого tracking.",
    riskToAvoid: "Скрытая аналитика или неясность по обработке персональных данных.",
    source: "copy-polish-only",
  },
  {
    id: "no-hard-prophecy",
    label: "no hard prophecy",
    standard: "Тексты не должны звучать как неизбежное предсказание судьбы.",
    riskToAvoid: "Категоричные утверждения о будущем, отношениях или человеке.",
    source: "copy-polish-only",
  },
  {
    id: "no-manipulative-fear-copy",
    label: "no manipulative fear copy",
    standard: "Нельзя давить страхом потери, измены, одиночества или срочности.",
    riskToAvoid: "Fear copy, который ухудшает доверие и безопасность продукта.",
    source: "copy-polish-only",
  },
  {
    id: "no-medical-legal-financial-advice",
    label: "no medical/legal/financial advice",
    standard: "Aphrodite не должна давать medical, legal или financial advice.",
    riskToAvoid: "Высокорисковые советы вне развлекательного/рефлексивного контекста.",
    source: "copy-polish-only",
  },
  {
    id: "short-mobile-readable-text",
    label: "short mobile-readable text",
    standard: "Copy должен быть коротким, сканируемым и удобным в Telegram WebView.",
    riskToAvoid: "Длинные абзацы, которые пользователь не дочитывает.",
    source: "copy-polish-only",
  },
];

const guardrails: AphroditeProductCopyGuardrail[] = [
  { id: "warm-not-fatalistic", label: "warm, not fatalistic", description: "Тон поддерживает пользователя и не закрывает выбор.", required: true },
  { id: "preview-not-payment", label: "preview, not payment", description: "Future paid surfaces называются preview/future, пока оплата не включена.", required: true },
  { id: "clear-period-labels", label: "clear period labels", description: "Daily/weekly/monthly periods должны быть названы явно.", required: true },
  { id: "no-pressure", label: "no pressure", description: "Нет давления страхом, дефицитом или обещанием срочного unlock.", required: true },
  { id: "privacy-plain-language", label: "privacy plain language", description: "Privacy и support copy пишутся простым языком.", required: true },
  { id: "mobile-short", label: "mobile short", description: "Основной текст помещается в короткие mobile-readable блоки.", required: true },
];

const boundaries: AphroditeProductCopyBoundary[] = [
  { id: "no-live-copy-change", label: "Live тексты не меняются", currentState: "standards-only" },
  { id: "no-payment-change", label: "Нет изменения оплаты", currentState: "payment untouched" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "access untouched" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "нет Bot API вызовов" },
  { id: "no-db-write", label: "Нет записи в базу данных", currentState: "нет persistence" },
  { id: "no-production-launch", label: "Нет production-запуска", currentState: "launch untouched" },
];

export function getAphroditeProductCopyFinalPolish(): AphroditeProductCopyFinalPolishModel {
  const copiedStandards = standards.map((standard) => ({ ...standard }));
  const copiedGuardrails = guardrails.map((guardrail) => ({ ...guardrail }));
  return {
    title: APHRODITE_PRODUCT_COPY_FINAL_POLISH_TITLE,
    classification: APHRODITE_PRODUCT_COPY_FINAL_POLISH_CLASSIFICATION,
    safetyLabels: APHRODITE_PRODUCT_COPY_FINAL_POLISH_SAFETY_LABELS,
    standards: copiedStandards,
    guardrails: copiedGuardrails,
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    summary: {
      standardsCount: copiedStandards.length,
      guardrailsCount: copiedGuardrails.length,
      onlyDocsDashboardCopyNow: true,
    },
    liveCopyChangedNow: false,
    onlyDocsDashboardCopyNow: true,
    productionLaunchNow: false,
    paymentEnabledNow: false,
    vipUnlockNow: false,
    telegramApiNow: false,
    databaseWriteNow: false,
    nextRecommendedPackage: "Package 195 — Manual Launch Smoke Test Matrix",
  };
}
