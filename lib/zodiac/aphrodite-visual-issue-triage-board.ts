/**
 * Package 211: Visual Issue Triage Board.
 *
 * Static/manual triage board only. This model does not create GitHub issues,
 * call external integrations, call Telegram API, send messages, write to DB,
 * enable payments, unlock VIP, change workflows, cron, publish scripts, or
 * production delivery.
 */

export type AphroditeVisualIssueCategory = {
  id: string;
  title: string;
  description: string;
  screenshotHint: string;
};

export type AphroditeVisualIssueSeverity = {
  id: "blocker" | "high" | "medium" | "low" | "polish";
  title: string;
  responseRule: string;
};

export type AphroditeVisualIssueStatus = {
  id: "new" | "confirmed" | "needs-screenshot" | "ready-for-fix" | "fixed" | "verified";
  title: string;
  meaning: string;
};

export type AphroditeVisualIssueTriageBoardModel = {
  packageNumber: 211;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  categories: readonly AphroditeVisualIssueCategory[];
  severities: readonly AphroditeVisualIssueSeverity[];
  statuses: readonly AphroditeVisualIssueStatus[];
  manualBoardRules: readonly string[];
  safetyFlags: {
    externalIntegrationsUsed: false;
    githubApiUsed: false;
    telegramApiUsed: false;
    messagesSent: false;
    databaseWriteAdded: false;
    productionLaunchDone: false;
    paymentAdded: false;
    vipUnlockAdded: false;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_TITLE = "Visual Issue Triage Board";

export const APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_CLASSIFICATION =
  "Только triage board / Issues не отправляются / Нет внешних интеграций";

export const APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_RULE =
  "Package 211 создаёт ручную triage board для screenshot/live QA findings. Доска ничего не отправляет, не создаёт GitHub issues, не вызывает внешние интеграции, Telegram API, оплату, VIP или базу данных.";

export const APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_SAFETY_LABELS = [
  "Нет внешних интеграций",
  "Нет GitHub API",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет записи в базу данных",
  "Нет production-запуска",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "Triage board ничего не отправляет",
] as const;

const categories: readonly AphroditeVisualIssueCategory[] = [
  {
    id: "layout-issue",
    title: "layout issue",
    description: "Компоненты расположены не по сетке, блоки выглядят случайно или ломают визуальную иерархию.",
    screenshotHint: "Нужен полный экран и ширина viewport.",
  },
  {
    id: "text-too-long",
    title: "text too long",
    description: "Текст не помещается, переносится неаккуратно или визуально перегружает карточку.",
    screenshotHint: "Нужен экран с самым длинным текстом.",
  },
  {
    id: "unclear-cta",
    title: "unclear CTA",
    description: "Пользователю непонятно, что произойдёт после нажатия, или CTA выглядит активным там, где действие запрещено.",
    screenshotHint: "Нужен экран CTA и путь входа.",
  },
  {
    id: "mobile-overflow",
    title: "mobile overflow",
    description: "Горизонтальная прокрутка, обрезанные элементы, конфликт safe area или клавиатуры.",
    screenshotHint: "Нужен mobile screenshot после открытия клавиатуры, если применимо.",
  },
  {
    id: "telegram-webview-issue",
    title: "Telegram WebView issue",
    description: "Поведение в Telegram отличается от browser fallback: stale cache, safe area, back button или keyboard issue.",
    screenshotHint: "Нужна платформа: iOS Telegram, Android Telegram или Telegram Desktop.",
  },
  {
    id: "date-input-issue",
    title: "date input issue",
    description: "Дата рождения не вводится, сбрасывается, показывает старый picker или не принимает ДД.ММ.ГГГГ.",
    screenshotHint: "Нужны route, введённая дата и состояние после blur/submit.",
  },
  {
    id: "compatibility-repeated-copy",
    title: "compatibility repeated copy",
    description: "Совместимость или 30 days couple calendar повторяет одинаковый текст.",
    screenshotHint: "Нужны две соседние карточки или весь результат пары.",
  },
  {
    id: "visual-hierarchy-issue",
    title: "visual hierarchy issue",
    description: "Главное действие, результат или предупреждение визуально теряется.",
    screenshotHint: "Нужен экран целиком без обрезки.",
  },
  {
    id: "loading-state-issue",
    title: "loading state issue",
    description: "Loading state пустой, слишком резкий, перекрывает контент или не объясняет ожидание.",
    screenshotHint: "Нужен screenshot/recording loading state.",
  },
  {
    id: "error-state-issue",
    title: "error state issue",
    description: "Ошибка выглядит технически, не даёт восстановления или ломает layout.",
    screenshotHint: "Нужен текст ошибки и маршрут.",
  },
  {
    id: "route-startapp-issue",
    title: "route/startapp issue",
    description: "Пользователь открывает не тот route или startapp ведёт не в ожидаемый экран.",
    screenshotHint: "Нужны startapp parameter, фактический route и screenshot.",
  },
  {
    id: "cache-deploy-issue",
    title: "cache/deploy issue",
    description: "Live route показывает stale build, старый marker или отличается от source commit.",
    screenshotHint: "Нужны URL с cache-buster и без него.",
  },
];

const severities: readonly AphroditeVisualIssueSeverity[] = [
  { id: "blocker", title: "blocker", responseRule: "Блокирует public launch или ломает ключевой flow." },
  { id: "high", title: "high", responseRule: "Сильно мешает пользователю, но есть обходной путь." },
  { id: "medium", title: "medium", responseRule: "Заметная проблема качества, можно фиксить в ближайшем sprint." },
  { id: "low", title: "low", responseRule: "Не блокирует проверку, но ухудшает впечатление." },
  { id: "polish", title: "polish", responseRule: "Финальная полировка после blockers/high." },
];

const statuses: readonly AphroditeVisualIssueStatus[] = [
  { id: "new", title: "new", meaning: "Новая запись без подтверждения." },
  { id: "confirmed", title: "confirmed", meaning: "Проблема воспроизведена вручную." },
  { id: "needs-screenshot", title: "needs screenshot", meaning: "Нужен screenshot или точный путь для диагностики." },
  { id: "ready-for-fix", title: "ready for fix", meaning: "Есть route, screenshot и ожидаемое поведение." },
  { id: "fixed", title: "fixed", meaning: "Исправление сделано локально или в commit." },
  { id: "verified", title: "verified", meaning: "Исправление проверено на целевом route/device." },
];

const manualBoardRules = [
  "Запись создаётся вручную в отчёте или задаче; этот dashboard ничего не отправляет.",
  "Каждый blocker/high требует route, screenshot, device и expected behavior.",
  "Статус needs screenshot обязателен, если проблема описана без изображения или точного пути.",
  "Fixed не означает verified: нужна отдельная проверка на целевом устройстве.",
  "Route/startapp и cache/deploy issues сверяются с Package 209 и Package 210.",
] as const;

export function getAphroditeVisualIssueTriageBoard(): AphroditeVisualIssueTriageBoardModel {
  return {
    packageNumber: 211,
    title: APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_TITLE,
    classification: APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_CLASSIFICATION,
    safetyLabels: APHRODITE_VISUAL_ISSUE_TRIAGE_BOARD_SAFETY_LABELS,
    categories: categories.map((category) => ({ ...category })),
    severities: severities.map((severity) => ({ ...severity })),
    statuses: statuses.map((status) => ({ ...status })),
    manualBoardRules: [...manualBoardRules],
    safetyFlags: {
      externalIntegrationsUsed: false,
      githubApiUsed: false,
      telegramApiUsed: false,
      messagesSent: false,
      databaseWriteAdded: false,
      productionLaunchDone: false,
      paymentAdded: false,
      vipUnlockAdded: false,
    },
    nextRecommendedPackage: "Package 212 — Public Launch Go/No-Go Review",
  };
}
