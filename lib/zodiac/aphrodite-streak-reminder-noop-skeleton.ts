/**
 * Package 189: Streak & Reminder Noop Skeleton.
 *
 * Safe noop-only skeleton for future streaks and reminders. It does not schedule
 * reminders, send Telegram messages, read/write databases, use notifications,
 * call external APIs, or unlock paid/VIP access.
 */

export type AphroditeFutureReminderType =
  | "daily-message-return"
  | "weekly-horoscope-return"
  | "monthly-horoscope-return"
  | "love-reading-revisit"
  | "compatibility-check-in"
  | "saved-report-revisit"
  | "couple-calendar-day-return";

export type AphroditeStreakNoopInput = {
  userScope: string;
  surface: string;
  eventType: AphroditeFutureReminderType;
  occurredAt: string;
};

export type AphroditeReminderNoopInput = {
  userScope: string;
  reminderType: AphroditeFutureReminderType;
  requestedFor: string;
  fallbackRoute: string;
};

export type AphroditeStreakNoopResult = {
  accepted: true;
  noopOnly: true;
  streakPersistedNow: false;
  reminderScheduledNow: false;
  telegramMessageSentNow: false;
  databaseWriteNow: false;
  externalNotificationNow: false;
  productionReminderNow: false;
  reason: string;
  futureStorageKey: string;
};

export type AphroditeReminderNoopResult = {
  accepted: true;
  noopOnly: true;
  streakPersistedNow: false;
  reminderScheduledNow: false;
  telegramMessageSentNow: false;
  databaseWriteNow: false;
  externalNotificationNow: false;
  productionReminderNow: false;
  reason: string;
  draftOnlyMessage: string;
};

export type AphroditeStreakReminderNoopSafetyBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeFutureReminderDefinition = {
  type: AphroditeFutureReminderType;
  label: string;
  futureCadence: "daily" | "weekly" | "monthly" | "manual";
  fallbackRoute: string;
  safetyNote: string;
};

export type AphroditeStreakReminderNoopSkeletonModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  futureReminderTypes: AphroditeFutureReminderDefinition[];
  boundaries: AphroditeStreakReminderNoopSafetyBoundary[];
  streakPersistedNow: false;
  reminderScheduledNow: false;
  telegramMessageSentNow: false;
  databaseReadNow: false;
  databaseWriteNow: false;
  externalNotificationNow: false;
  productionReminderNow: false;
  paymentTrackingNow: false;
  vipUnlockNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_STREAK_REMINDER_NOOP_SKELETON_TITLE = "Noop skeleton streak/reminder";

export const APHRODITE_STREAK_REMINDER_NOOP_SKELETON_CLASSIFICATION =
  "Только noop / Напоминания не создаются / Сообщения не отправляются";

export const APHRODITE_STREAK_REMINDER_NOOP_SKELETON_RULE =
  "Streak/reminder skeleton is noop-only. It can evaluate future inputs and draft text safely, but it must not persist streaks, schedule reminders, send Telegram messages, write/read databases, call notification APIs, or unlock VIP.";

export const APHRODITE_STREAK_REMINDER_NOOP_SKELETON_SAFETY_LABELS = [
  "Нет реальных streak",
  "Нет реальных напоминаний",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет записи в базу данных",
  "Нет внешних уведомлений",
  "Нет production reminder",
  "Нет payment tracking",
  "Нет реальной оплаты",
  "Нет VIP-разблокировки",
  "Reminder noop ничего не отправляет",
] as const;

const futureReminderTypes: AphroditeFutureReminderDefinition[] = [
  {
    type: "daily-message-return",
    label: "daily message return",
    futureCadence: "daily",
    fallbackRoute: "/miniapp",
    safetyNote: "Будущий daily reminder требует opt-in и отдельный privacy review.",
  },
  {
    type: "weekly-horoscope-return",
    label: "weekly horoscope return",
    futureCadence: "weekly",
    fallbackRoute: "/miniapp",
    safetyNote: "Будущий weekly reminder не должен публиковаться не в воскресенье без manual preview mode.",
  },
  {
    type: "monthly-horoscope-return",
    label: "monthly horoscope return",
    futureCadence: "monthly",
    fallbackRoute: "/miniapp",
    safetyNote: "Будущий monthly reminder должен указывать следующий месяц после 20 числа.",
  },
  {
    type: "love-reading-revisit",
    label: "love reading revisit",
    futureCadence: "manual",
    fallbackRoute: "/miniapp/love-reading-preview",
    safetyNote: "Возврат к Love Reading остаётся бесплатным preview до реального доступа.",
  },
  {
    type: "compatibility-check-in",
    label: "compatibility check-in",
    futureCadence: "manual",
    fallbackRoute: "/compatibility",
    safetyNote: "Не хранить raw partner names или raw birth dates.",
  },
  {
    type: "saved-report-revisit",
    label: "saved report revisit",
    futureCadence: "manual",
    fallbackRoute: "/miniapp/love-reading-preview",
    safetyNote: "Saved report revisit не должен открывать paid/VIP report без entitlement.",
  },
  {
    type: "couple-calendar-day-return",
    label: "couple calendar day return",
    futureCadence: "daily",
    fallbackRoute: "/miniapp/love-reading-preview",
    safetyNote: "VIP couple calendar остаётся future-only и требует owner review.",
  },
];

const boundaries: AphroditeStreakReminderNoopSafetyBoundary[] = [
  { id: "no-real-streak", label: "Нет реальных streak", currentState: "streak result is draft-only" },
  { id: "no-real-reminder", label: "Нет реальных напоминаний", currentState: "no schedule, no timer, no job" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "no Bot API, no sendMessage" },
  { id: "no-message-send", label: "Нет отправки сообщений", currentState: "no outbound delivery" },
  { id: "no-database-write", label: "Нет записи в базу данных", currentState: "no DB persistence" },
  { id: "no-database-read", label: "Нет чтения базы данных", currentState: "no user lookup" },
  { id: "no-external-notification", label: "Нет внешних уведомлений", currentState: "no push/email provider" },
  { id: "no-production-reminder", label: "Нет production reminder", currentState: "all result flags false" },
  { id: "no-payment-tracking", label: "Нет payment tracking", currentState: "no payment event" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "no access grant" },
];

export function evaluateAphroditeStreakNoop(input: AphroditeStreakNoopInput): AphroditeStreakNoopResult {
  return {
    accepted: true,
    noopOnly: true,
    streakPersistedNow: false,
    reminderScheduledNow: false,
    telegramMessageSentNow: false,
    databaseWriteNow: false,
    externalNotificationNow: false,
    productionReminderNow: false,
    reason: `Noop evaluation only for ${input.eventType} on ${input.surface}.`,
    futureStorageKey: `future-streak:${input.userScope}:${input.eventType}`,
  };
}

export function draftAphroditeReminderNoop(input: AphroditeReminderNoopInput): AphroditeReminderNoopResult {
  return {
    accepted: true,
    noopOnly: true,
    streakPersistedNow: false,
    reminderScheduledNow: false,
    telegramMessageSentNow: false,
    databaseWriteNow: false,
    externalNotificationNow: false,
    productionReminderNow: false,
    reason: `Noop reminder draft only for ${input.reminderType}.`,
    draftOnlyMessage: `Будущий reminder draft ведёт в ${input.fallbackRoute}, но сейчас ничего не планируется.`,
  };
}

export function getAphroditeStreakReminderNoopSkeleton(): AphroditeStreakReminderNoopSkeletonModel {
  return {
    title: APHRODITE_STREAK_REMINDER_NOOP_SKELETON_TITLE,
    classification: APHRODITE_STREAK_REMINDER_NOOP_SKELETON_CLASSIFICATION,
    safetyLabels: APHRODITE_STREAK_REMINDER_NOOP_SKELETON_SAFETY_LABELS,
    futureReminderTypes: futureReminderTypes.map((type) => ({ ...type })),
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    streakPersistedNow: false,
    reminderScheduledNow: false,
    telegramMessageSentNow: false,
    databaseReadNow: false,
    databaseWriteNow: false,
    externalNotificationNow: false,
    productionReminderNow: false,
    paymentTrackingNow: false,
    vipUnlockNow: false,
    nextRecommendedPackage: "Package 190 — Retention Mock Dashboard & Safety QA Suite",
  };
}
