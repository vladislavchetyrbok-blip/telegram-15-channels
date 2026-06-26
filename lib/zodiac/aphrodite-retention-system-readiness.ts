/**
 * Package 186: Retention System Readiness.
 *
 * Static readiness model only. This file defines future retention strategy and
 * must not send reminders, write/read databases, call Telegram API, or enable
 * production tracking.
 */

export type AphroditeRetentionSurface = {
  id: string;
  label: string;
  module: string;
  returnReason: string;
  futureEventId: string;
  cadence: "daily" | "weekly" | "monthly" | "relationship" | "future" | "return";
  safetyNote: string;
  source: "readiness-only";
};

export type AphroditeRetentionIdea = {
  id: string;
  label: string;
  description: string;
  blockedUntil: string[];
};

export type AphroditeRetentionSafetyBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeRetentionSystemReadinessModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  surfaces: AphroditeRetentionSurface[];
  ideas: AphroditeRetentionIdea[];
  boundaries: AphroditeRetentionSafetyBoundary[];
  realRemindersNow: false;
  telegramApiNow: false;
  databaseWriteNow: false;
  externalAnalyticsNow: false;
  productionTrackingNow: false;
  paymentTrackingNow: false;
  vipUnlockNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_RETENTION_SYSTEM_READINESS_TITLE = "Retention System Readiness";

export const APHRODITE_RETENTION_SYSTEM_READINESS_CLASSIFICATION =
  "Только readiness / Удержание не автоматизировано / Нет уведомлений";

export const APHRODITE_RETENTION_SYSTEM_READINESS_RULE =
  "Retention readiness describes future return habits and retention events only. It must not send reminders, schedule messages, write database records, call Telegram API, or enable production tracking.";

export const APHRODITE_RETENTION_SYSTEM_READINESS_SAFETY_LABELS = [
  "Нет реальных уведомлений",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет записи в базу данных",
  "Нет внешней аналитики",
  "Нет production tracking",
  "Нет payment tracking",
  "Нет реальной оплаты",
  "Нет VIP-разблокировки",
  "Retention readiness ничего не отправляет",
] as const;

const surfaces: AphroditeRetentionSurface[] = [
  {
    id: "daily-message",
    label: "Daily Message",
    module: "Telegram content",
    returnReason: "Короткая ежедневная точка входа формирует привычку возвращаться.",
    futureEventId: "daily_message_return_future",
    cadence: "daily",
    safetyNote: "Без автоотправки и без Telegram API.",
    source: "readiness-only",
  },
  {
    id: "daily-horoscope",
    label: "Daily Horoscope",
    module: "Daily content",
    returnReason: "Ежедневный прогноз поддерживает мягкий регулярный ритуал.",
    futureEventId: "daily_horoscope_return_future",
    cadence: "daily",
    safetyNote: "Без analytics event sending.",
    source: "readiness-only",
  },
  {
    id: "weekly-horoscope",
    label: "Weekly Horoscope",
    module: "Weekly content",
    returnReason: "Недельный прогноз помогает планировать новую неделю.",
    futureEventId: "weekly_horoscope_return_future",
    cadence: "weekly",
    safetyNote: "Без cron/scheduling изменений.",
    source: "readiness-only",
  },
  {
    id: "monthly-horoscope",
    label: "Monthly Horoscope",
    module: "Monthly content",
    returnReason: "Месячный прогноз создаёт повод вернуться после 20 числа и в начале месяца.",
    futureEventId: "monthly_horoscope_return_future",
    cadence: "monthly",
    safetyNote: "Без изменения publish pipeline.",
    source: "readiness-only",
  },
  {
    id: "love-reading-return",
    label: "AI Love Reading return",
    module: "AI Love Reading",
    returnReason: "Пользователь возвращается к отношениям, когда нужен новый эмоциональный срез.",
    futureEventId: "love_reading_revisit_future",
    cadence: "relationship",
    safetyNote: "Без сохранения raw names или report text.",
    source: "readiness-only",
  },
  {
    id: "full-love-report-teaser-return",
    label: "Full Love Report teaser return",
    module: "Full Love Report",
    returnReason: "Будущий teaser напоминает о продолжении отчёта без оплаты сейчас.",
    futureEventId: "full_love_report_teaser_return_future",
    cadence: "future",
    safetyNote: "Без real payment и без VIP unlock.",
    source: "readiness-only",
  },
  {
    id: "compatibility-return",
    label: "Compatibility return",
    module: "Compatibility",
    returnReason: "Совместимость провоцирует повторную проверку пары или другого сценария.",
    futureEventId: "compatibility_return_future",
    cadence: "relationship",
    safetyNote: "Без raw birth dates в retention payload.",
    source: "readiness-only",
  },
  {
    id: "birth-matrix-return",
    label: "Birth Matrix return",
    module: "Birth Matrix",
    returnReason: "Матрица судьбы остаётся личной точкой возврата к себе.",
    futureEventId: "birth_matrix_return_future",
    cadence: "return",
    safetyNote: "Без сохранения даты рождения.",
    source: "readiness-only",
  },
  {
    id: "vip-couple-calendar-return",
    label: "VIP Couple Calendar return",
    module: "VIP Couple Calendar",
    returnReason: "Будущий календарь пары создаёт ежедневные причины вернуться.",
    futureEventId: "vip_couple_calendar_return_future",
    cadence: "future",
    safetyNote: "Без VIP access и entitlement изменений.",
    source: "readiness-only",
  },
  {
    id: "saved-reports-future",
    label: "Saved reports future",
    module: "Saved Reports",
    returnReason: "Будущая история отчётов помогает возвращаться к уже полученным инсайтам.",
    futureEventId: "saved_reports_return_future",
    cadence: "future",
    safetyNote: "Без DB persistence и без localStorage production state.",
    source: "readiness-only",
  },
  {
    id: "streak-future",
    label: "Streak future",
    module: "Streak",
    returnReason: "Мягкая серия посещений может поддерживать привычку без давления.",
    futureEventId: "soft_streak_return_future",
    cadence: "future",
    safetyNote: "Без streak persistence.",
    source: "readiness-only",
  },
  {
    id: "reminder-future",
    label: "Reminder future",
    module: "Reminder",
    returnReason: "Будущие manual reminder preferences могут поддержать возврат по согласию.",
    futureEventId: "manual_reminder_return_future",
    cadence: "future",
    safetyNote: "Без real reminders и без уведомлений.",
    source: "readiness-only",
  },
  {
    id: "telegram-channel-cta-return",
    label: "Telegram channel CTA return",
    module: "Telegram CTA",
    returnReason: "Посты в канале возвращают пользователя в Mini App без изменения active CTA сейчас.",
    futureEventId: "telegram_channel_cta_return_future",
    cadence: "return",
    safetyNote: "Active Telegram CTA generation не меняется.",
    source: "readiness-only",
  },
  {
    id: "mini-app-return-visit",
    label: "Mini App return visit",
    module: "Mini App",
    returnReason: "Главный hub собирает повторные визиты в один безопасный маршрут.",
    futureEventId: "miniapp_return_visit_future",
    cadence: "return",
    safetyNote: "Без production tracking.",
    source: "readiness-only",
  },
];

const ideas: AphroditeRetentionIdea[] = [
  { id: "daily-return-habit", label: "daily return habit", description: "Ежедневный прогноз и короткое сообщение формируют спокойный ритуал.", blockedUntil: ["privacy review", "no real reminder approval"] },
  { id: "weekly-planning-habit", label: "weekly planning habit", description: "Недельный прогноз помогает возвращаться перед новой неделей.", blockedUntil: ["weekly retention QA"] },
  { id: "monthly-forecast-habit", label: "monthly forecast habit", description: "Месячный прогноз возвращает пользователя к крупному периоду.", blockedUntil: ["monthly retention QA"] },
  { id: "relationship-check-in", label: "relationship check-in", description: "Love Reading и Compatibility поддерживают повторные эмоциональные проверки.", blockedUntil: ["relationship privacy review"] },
  { id: "saved-report-history", label: "saved report history", description: "Будущая история отчётов создаёт возврат к прошлым инсайтам.", blockedUntil: ["Package 187", "storage design approval"] },
  { id: "new-insight-unlocked-later", label: "new insight unlocked later", description: "Будущий unlocked-later insight остаётся идеей без оплаты и VIP сейчас.", blockedUntil: ["owner review", "payment safety gate"] },
  { id: "soft-streak", label: "soft streak", description: "Мягкая серия посещений без давления и без persistence сейчас.", blockedUntil: ["Package 189"] },
  { id: "manual-reminder-preference", label: "manual reminder preference", description: "Будущий reminder только по явному выбору пользователя.", blockedUntil: ["reminder consent design", "Package 189"] },
  { id: "return-from-telegram-cta", label: "return from Telegram CTA", description: "Канал возвращает в Mini App через будущую attribution-схему.", blockedUntil: ["CTA owner review"] },
  { id: "return-from-miniapp-module", label: "return from Mini App module", description: "Внутренние модули возвращают пользователя к hub или безопасному fallback.", blockedUntil: ["route QA"] },
];

const boundaries: AphroditeRetentionSafetyBoundary[] = [
  { id: "no-real-reminders", label: "Нет реальных уведомлений", currentState: "reminder ideas only" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "no Bot API, no sendMessage, no sendPhoto" },
  { id: "no-message-sending", label: "Нет отправки сообщений", currentState: "no Telegram, push, email, or external notification" },
  { id: "no-database-write", label: "Нет записи в базу данных", currentState: "static arrays only" },
  { id: "no-external-analytics", label: "Нет внешней аналитики", currentState: "no SDK or tracking endpoint" },
  { id: "no-production-tracking", label: "Нет production tracking", currentState: "readiness-only model" },
  { id: "no-payment-tracking", label: "Нет payment tracking", currentState: "no payment intent or ledger write" },
  { id: "no-real-payment", label: "Нет реальной оплаты", currentState: "no invoice, no Stars payment" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "no entitlement or access grant" },
];

export function getAphroditeRetentionSystemReadiness(): AphroditeRetentionSystemReadinessModel {
  return {
    title: APHRODITE_RETENTION_SYSTEM_READINESS_TITLE,
    classification: APHRODITE_RETENTION_SYSTEM_READINESS_CLASSIFICATION,
    safetyLabels: APHRODITE_RETENTION_SYSTEM_READINESS_SAFETY_LABELS,
    surfaces: surfaces.map((surface) => ({ ...surface })),
    ideas: ideas.map((idea) => ({ ...idea, blockedUntil: idea.blockedUntil.slice() })),
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    realRemindersNow: false,
    telegramApiNow: false,
    databaseWriteNow: false,
    externalAnalyticsNow: false,
    productionTrackingNow: false,
    paymentTrackingNow: false,
    vipUnlockNow: false,
    nextRecommendedPackage: "Package 187 — Saved Reports / History Mock Readiness",
  };
}
