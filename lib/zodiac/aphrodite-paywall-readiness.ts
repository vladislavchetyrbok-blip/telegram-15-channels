/**
 * Aphrodite paywall readiness (Package 154).
 *
 * Static, local-only packaging for a future Full Love Report and VIP offer.
 * This file deliberately does not implement payments, invoices, Entitlement
 * creation, Telegram API calls, persistence, gating, scheduling, or unlocks.
 */

export type AphroditePaywallReadinessItem = {
  id: string;
  title: string;
  status: "available-now" | "future-readiness" | "blocked";
  summary: string;
  userValue: string[];
  safetyLabels: string[];
};

export type AphroditeVipOfferSection = {
  id: string;
  title: string;
  shortLabel: string;
  state: "free-preview" | "future-full-report" | "future-vip" | "future-regular-format";
  description: string;
  includes: string[];
  notConnectedYet: string[];
};

export type AphroditePaywallTrustBlock = {
  id: string;
  title: string;
  text: string;
  placement: "before-offer" | "inside-offer" | "footer";
};

export type AphroditePaywallBoundary = {
  token: string;
  label: string;
  detail: string;
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditePaywallNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_PAYWALL_READINESS_CLASSIFICATION =
  "Только подготовка оффера / Нет оплаты / Нет реальной VIP-разблокировки";

export const APHRODITE_PAYWALL_ALLOWED_LABELS = [
  "Что будет в полном Love Report позже",
  "Полная версия будет подключена позже",
  "Сейчас доступен бесплатный preview",
  "Нет оплаты",
  "Нет реальной VIP-разблокировки",
  "Только подготовка оффера",
];

const SAFETY_LABELS = [
  "Нет оплаты",
  "Нет реальной VIP-разблокировки",
  "Нет вызова Telegram API",
  "Нет записи в базу данных",
  "Нет активной платёжной CTA",
];

const FULL_LOVE_REPORT_SECTIONS = [
  "что он/она может чувствовать",
  "почему может отдаляться",
  "главная энергия связи",
  "сильная сторона",
  "зона риска",
  "red flags",
  "30-дневный прогноз",
  "личные рекомендации",
];

export function getAphroditePaywallReadinessItems(): AphroditePaywallReadinessItem[] {
  return [
    {
      id: "free-love-reading-preview",
      title: "Бесплатный Love Reading Preview",
      status: "available-now",
      summary: "Бесплатный preview показывает первую ценность: главную энергию связи, сильную сторону, зону риска и мягкий следующий шаг.",
      userValue: [
        "быстро понять эмоциональный тон связи",
        "увидеть одну сильную сторону без длинной анкеты",
        "получить одну бережную зону внимания",
        "вернуться в Mini App без оплаты",
      ],
      safetyLabels: SAFETY_LABELS.slice(),
    },
    {
      id: "future-full-love-report",
      title: "Будущий Full Love Report",
      status: "future-readiness",
      summary: "Полный Love Report позже сможет дать больше глубины: чувства, причины дистанции, прогноз на 30 дней, red flags и личные рекомендации.",
      userValue: FULL_LOVE_REPORT_SECTIONS.slice(),
      safetyLabels: SAFETY_LABELS.slice(),
    },
    {
      id: "future-short-vip-access",
      title: "Будущий короткий VIP-доступ",
      status: "future-readiness",
      summary: "Короткий будущий VIP-доступ описан как упаковка оффера, но доступ не открывается и не проверяется.",
      userValue: [
        "короткий период просмотра расширенных разделов",
        "мягкое объяснение состава будущего VIP",
        "разделение бесплатного preview и будущей полной версии",
      ],
      safetyLabels: SAFETY_LABELS.slice(),
    },
    {
      id: "future-regular-format-readiness",
      title: "Будущий регулярный формат",
      status: "future-readiness",
      summary: "Будущий регулярный формат только обозначен на уровне готовности продукта. Подключения, биллинга и доступа нет.",
      userValue: [
        "понятная будущая структура регулярного продукта",
        "ясные ограничения до реальной реализации",
        "никакой активной платёжной CTA",
      ],
      safetyLabels: SAFETY_LABELS.slice(),
    },
  ];
}

export function getAphroditeVipOfferSections(): AphroditeVipOfferSection[] {
  return [
    {
      id: "free-preview",
      title: "Сейчас доступен бесплатный preview",
      shortLabel: "Бесплатный preview",
      state: "free-preview",
      description: "Пользователь получает первую мягкую интерпретацию без оплаты и без реальной VIP-разблокировки.",
      includes: [
        "главная энергия связи",
        "одна сильная сторона",
        "одна зона риска",
        "один бережный следующий шаг",
      ],
      notConnectedYet: ["платёж", "VIP-доступ", "Telegram Stars invoice", "запись в базу данных"],
    },
    {
      id: "full-love-report",
      title: "Что будет в полном Love Report позже",
      shortLabel: "Full Love Report позже",
      state: "future-full-report",
      description: "Полная версия будет подключена позже и пока описана только как состав будущего отчёта.",
      includes: FULL_LOVE_REPORT_SECTIONS.slice(),
      notConnectedYet: ["оплата", "successful_payment handler", "Entitlement creation", "реальная выдача доступа"],
    },
    {
      id: "short-vip-access",
      title: "Будущий короткий VIP-доступ",
      shortLabel: "Будущий VIP",
      state: "future-vip",
      description: "Будущий короткий VIP-доступ описывает упаковку ценности, но не открывает закрытые разделы.",
      includes: [
        "короткое окно доступа к расширенным материалам",
        "понятные условия будущего доступа",
        "отдельные trust blocks перед любым будущим включением",
      ],
      notConnectedYet: ["реальная VIP-разблокировка", "проверка доступа", "хранение покупок"],
    },
    {
      id: "regular-format",
      title: "Будущий регулярный формат",
      shortLabel: "Регулярный формат позже",
      state: "future-regular-format",
      description: "Регулярный формат оставлен как readiness placeholder без подписочного биллинга.",
      includes: [
        "идея регулярных обновлений",
        "границы поддержки",
        "условия будущей отмены и возврата до запуска",
      ],
      notConnectedYet: ["subscription billing", "автопродление", "платёжная CTA"],
    },
  ];
}

export function getAphroditePaywallTrustBlocks(): AphroditePaywallTrustBlock[] {
  return [
    {
      id: "support",
      title: "Поддержка",
      text: "Перед будущим подключением оплаты должен быть понятный канал поддержки: куда писать, что указать и как быстро ждать ответ.",
      placement: "before-offer",
    },
    {
      id: "privacy",
      title: "Приватность",
      text: "Личные данные для Love Reading должны использоваться только для подготовки результата и не должны передаваться третьим лицам.",
      placement: "before-offer",
    },
    {
      id: "access-terms",
      title: "Условия доступа",
      text: "До реального запуска нужно заранее описать срок, состав и ограничения будущего доступа простым языком.",
      placement: "inside-offer",
    },
    {
      id: "refund-rules",
      title: "Правила возврата",
      text: "До любой оплаты должны быть готовы правила возврата: когда возврат возможен, как его запросить и кто принимает решение.",
      placement: "inside-offer",
    },
    {
      id: "self-reflection-disclaimer",
      title: "Дисклеймер саморефлексии",
      text: "Love Reading помогает мягко осмыслить отношения, но не заменяет личное решение, терапию, юридический или медицинский совет.",
      placement: "footer",
    },
    {
      id: "report-includes",
      title: "Что входит в отчёт",
      text: "Будущий Full Love Report должен заранее показывать состав: чувства, дистанция, энергия связи, red flags, прогноз и рекомендации.",
      placement: "inside-offer",
    },
    {
      id: "not-connected-yet",
      title: "Что сейчас ещё не подключено",
      text: "Сейчас не подключены оплата, Telegram Stars invoice, successful_payment handler, реальная VIP-разблокировка и запись в базу данных.",
      placement: "footer",
    },
  ];
}

export function getAphroditePaywallBoundaries(): AphroditePaywallBoundary[] {
  return [
    { token: "no-payment", label: "Нет оплаты", detail: "Нет платёжной формы, провайдера, invoice или оплаты внутри Mini App.", riskLevel: "critical" },
    { token: "no-real-vip-unlock", label: "Нет реальной VIP-разблокировки", detail: "Будущий VIP описан только как упаковка ценности, доступ не открывается.", riskLevel: "critical" },
    { token: "no-telegram-api-call", label: "Нет вызова Telegram API", detail: "Нет обращения к bot API, BotFather или Telegram Stars.", riskLevel: "critical" },
    { token: "no-database-write", label: "Нет записи в базу данных", detail: "Нет persistence, профиля покупки или записи доступа.", riskLevel: "critical" },
    { token: "no-stars-invoice", label: "Нет Telegram Stars invoice", detail: "Не создаётся invoice draft и не вызывается live invoice.", riskLevel: "critical" },
    { token: "no-successful-payment-handler", label: "Нет successful_payment handler", detail: "Нет обработчика успешного платежа.", riskLevel: "critical" },
    { token: "no-entitlement-creation", label: "Нет entitlement creation", detail: "Нет создания, проверки или записи доступа.", riskLevel: "critical" },
    { token: "no-production-launch", label: "Нет production-запуска", detail: "Страница только документирует readiness, запуск не выполняется.", riskLevel: "high" },
    { token: "no-active-payment-cta", label: "Нет активной платёжной CTA", detail: "Нет кнопки покупки, оплаты, разблокировки или активации.", riskLevel: "critical" },
  ];
}

export function getAphroditePaywallNextSteps(): AphroditePaywallNextStep[] {
  return [
    {
      package: "Package 155",
      title: "Entitlement Enforcement Design Review",
      purpose: "Проверить будущий дизайн выдачи доступа до любой реальной реализации.",
      blockedUntil: ["Package 154 принят", "owner approval", "отдельное решение по платежам"],
    },
  ];
}
