/**
 * Package 191: Public Launch Checklist Refresh.
 *
 * Static checklist-only model for future public launch review. It does not run
 * launch actions, call Telegram API, change BotFather, update active CTAs,
 * enable payments, unlock VIP, or write production data.
 */

export type AphroditePublicLaunchChecklistArea = {
  id: string;
  label: string;
  check: string;
  requiredBeforeLaunch: boolean;
  blockedNow: boolean;
  ownerReviewRequired: boolean;
  source: "checklist-only";
};

export type AphroditePublicLaunchChecklistBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditePublicLaunchChecklistRefreshModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  checklist: AphroditePublicLaunchChecklistArea[];
  boundaries: AphroditePublicLaunchChecklistBoundary[];
  summary: {
    totalChecklistItems: number;
    blockedItems: number;
    ownerReviewItems: number;
    launchReadyNow: false;
  };
  launchApprovedNow: false;
  productionLaunchNow: false;
  telegramApiNow: false;
  messageSendingNow: false;
  botFatherChangedNow: false;
  activeCtaChangedNow: false;
  paymentEnabledNow: false;
  vipUnlockNow: false;
  databaseWriteNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_PUBLIC_LAUNCH_CHECKLIST_REFRESH_TITLE =
  "Обновлённый checklist публичного запуска";

export const APHRODITE_PUBLIC_LAUNCH_CHECKLIST_REFRESH_CLASSIFICATION =
  "Только checklist / Запуск не выполняется / Нет Telegram API";

export const APHRODITE_PUBLIC_LAUNCH_CHECKLIST_REFRESH_RULE =
  "Public launch checklist фиксирует зоны ручной проверки будущего запуска, но не запускает продакшен, не меняет BotFather, не трогает active CTA и не вызывает Telegram API.";

export const APHRODITE_PUBLIC_LAUNCH_CHECKLIST_REFRESH_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет изменения BotFather",
  "Нет изменения active CTA",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "Launch checklist ничего не запускает",
] as const;

const checklist: AphroditePublicLaunchChecklistArea[] = [
  {
    id: "botfather-profile",
    label: "BotFather profile",
    check: "Проверить имя, описание, короткое описание, аватар и публичный текст бота вручную, без API-изменений.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "main-mini-app-button",
    label: "Main Mini App button",
    check: "Подтвердить будущую главную кнопку Mini App и её route без изменения текущей active CTA.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "mini-app-routes",
    label: "Mini App routes",
    check: "Проверить `/miniapp`, fallback и ключевые пользовательские маршруты в браузере и Telegram WebView.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "daily-weekly-monthly-content",
    label: "daily/weekly/monthly content",
    check: "Проверить, что daily, weekly и monthly материалы готовы как контент, а публикация остаётся вне этого checklist.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "love-reading-preview",
    label: "Love Reading preview",
    check: "Проверить бесплатный preview, ясность результата и отсутствие платного unlock в текущем запуске.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "compatibility",
    label: "compatibility",
    check: "Проверить совместимость, ввод дат, результат и fallback без production-платежей.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "birth-matrix",
    label: "birth matrix",
    check: "Проверить матрицу судьбы, текстовый ввод даты рождения и понятную обработку ошибок.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "thirty-days-couple-calendar",
    label: "30 days couple calendar",
    check: "Проверить сценарий календаря пары на 30 дней, уникальность дней и отсутствие одинаковых шаблонных ответов.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "fallback-route",
    label: "fallback route",
    check: "Проверить безопасные fallback routes для неизвестных startapp, guard denied и старых ссылок.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "support-refund",
    label: "support/refund",
    check: "Проверить готовность текста поддержки и возвратов до включения будущей оплаты.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "privacy-terms",
    label: "privacy/terms",
    check: "Проверить privacy и terms тексты, дисклеймеры и отсутствие скрытого сбора данных.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "analytics-readiness",
    label: "analytics readiness",
    check: "Проверить только readiness и noop-аналитику; внешняя аналитика не включается.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "retention-readiness",
    label: "retention readiness",
    check: "Проверить retention readiness, saved reports mock, return CTA readiness и reminder noop как документы/QA.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "production-safety",
    label: "production safety",
    check: "Запустить production safety check и подтвердить только ожидаемые env/backup blockers.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "env-blockers",
    label: "env blockers",
    check: "Проверить DATABASE_URL, TELEGRAM_BOT_TOKEN и другие blockers без записи секретов в dashboard.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "backup-freshness",
    label: "backup freshness",
    check: "Подтвердить свежесть backup перед будущим запуском; старый backup блокирует запуск.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
  {
    id: "owner-review",
    label: "owner review",
    check: "Финальное ручное подтверждение владельца обязательно; этот checklist сам не даёт разрешение на запуск.",
    requiredBeforeLaunch: true,
    blockedNow: true,
    ownerReviewRequired: true,
    source: "checklist-only",
  },
];

const boundaries: AphroditePublicLaunchChecklistBoundary[] = [
  { id: "no-production-launch", label: "Нет production-запуска", currentState: "checklist-only" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "нет Bot API вызовов" },
  { id: "no-message-send", label: "Нет отправки сообщений", currentState: "нет исходящей доставки" },
  { id: "no-botfather-change", label: "Нет изменения BotFather", currentState: "только ручная проверка профиля" },
  { id: "no-active-cta-change", label: "Нет изменения active CTA", currentState: "текущие CTA не трогаются" },
  { id: "no-payment", label: "Нет оплаты", currentState: "оплата не включается" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "доступ не выдаётся" },
  { id: "no-db-write", label: "Нет записи в базу данных", currentState: "нет persistence" },
  { id: "owner-review-required", label: "Owner review required", currentState: "запуск заблокирован до ручного решения" },
];

export function getAphroditePublicLaunchChecklistRefresh(): AphroditePublicLaunchChecklistRefreshModel {
  const copiedChecklist = checklist.map((item) => ({ ...item }));
  return {
    title: APHRODITE_PUBLIC_LAUNCH_CHECKLIST_REFRESH_TITLE,
    classification: APHRODITE_PUBLIC_LAUNCH_CHECKLIST_REFRESH_CLASSIFICATION,
    safetyLabels: APHRODITE_PUBLIC_LAUNCH_CHECKLIST_REFRESH_SAFETY_LABELS,
    checklist: copiedChecklist,
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    summary: {
      totalChecklistItems: copiedChecklist.length,
      blockedItems: copiedChecklist.filter((item) => item.blockedNow).length,
      ownerReviewItems: copiedChecklist.filter((item) => item.ownerReviewRequired).length,
      launchReadyNow: false,
    },
    launchApprovedNow: false,
    productionLaunchNow: false,
    telegramApiNow: false,
    messageSendingNow: false,
    botFatherChangedNow: false,
    activeCtaChangedNow: false,
    paymentEnabledNow: false,
    vipUnlockNow: false,
    databaseWriteNow: false,
    nextRecommendedPackage: "Package 192 — Mini App UX Simplification Review",
  };
}
