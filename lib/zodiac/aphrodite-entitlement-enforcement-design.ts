/**
 * Aphrodite entitlement enforcement design review (Package 155).
 *
 * Static, local-only design model. This file does not implement payments,
 * Telegram invoices, successful payment handlers, VIP unlocks, entitlement
 * creation, persistence, schema changes, Telegram API calls, or production gating.
 */

export type AphroditeEntitlementSurface = {
  id: string;
  title: string;
  productId: string;
  currentState: string;
  currentClassification: "free-preview" | "future-vip-teaser" | "client-side-risk" | "design-only";
  protectedContent: string[];
  futureRequirement: string;
  requiredServerChecks: string[];
  currentRisk: "low" | "medium" | "high" | "critical";
  auditNotes: string[];
};

export type AphroditeEntitlementRule = {
  id: string;
  label: string;
  description: string;
  blockedShortcut: string;
  requiredServerCheck: string;
};

export type AphroditeEntitlementBoundary = {
  token: string;
  label: string;
  detail: string;
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeEntitlementNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_ENTITLEMENT_CLASSIFICATION =
  "Только дизайн доступа / Нет реальной VIP-разблокировки / Нет оплаты";

export const APHRODITE_ENTITLEMENT_FIELDS = [
  "userId / telegramUserId",
  "productId",
  "sourcePaymentId",
  "status",
  "startsAt",
  "expiresAt",
  "revokedAt",
  "createdAt",
  "updatedAt",
  "auditReason",
] as const;

const SERVER_CHECKS = [
  "проверить Telegram-пользователя на сервере",
  "найти активный server-side entitlement по productId",
  "сверить status, startsAt, expiresAt и revokedAt",
  "сверить sourcePaymentId с payment ledger",
  "проверить auditReason и owner review для спорных случаев",
  "вернуть только разрешённый уровень контента",
];

export function getAphroditeEntitlementSurfaces(): AphroditeEntitlementSurface[] {
  return [
    {
      id: "full-love-report",
      title: "Full Love Report",
      productId: "full_love_report",
      currentState: "Описан как будущий полный отчёт после бесплатного preview. Реального доступа и оплаты нет.",
      currentClassification: "future-vip-teaser",
      protectedContent: [
        "глубокая интерпретация чувств",
        "причины дистанции",
        "30-дневный прогноз",
        "red flags",
        "личные рекомендации",
      ],
      futureRequirement: "Открывать только после server-side entitlement, связанного с payment ledger и owner review.",
      requiredServerChecks: SERVER_CHECKS.slice(),
      currentRisk: "medium",
      auditNotes: [
        "Сейчас это безопасный teaser без фактической выдачи результата.",
        "Будущий полный отчёт нельзя открывать по кнопке UI или query param.",
      ],
    },
    {
      id: "vip-love-access",
      title: "VIP Love Access",
      productId: "vip_love_access",
      currentState: "В текущем UI есть ранний бесплатный VIP-промо флаг vipFreeAccess. Он не должен считаться будущей проверкой доступа.",
      currentClassification: "client-side-risk",
      protectedContent: [
        "расширенные relationship-инсайты",
        "VIP-блоки совместимости",
        "дополнительные love-сценарии",
      ],
      futureRequirement: "Заменить клиентский промо-флаг серверной проверкой entitlement перед любой выдачей VIP-контента.",
      requiredServerChecks: SERVER_CHECKS.slice(),
      currentRisk: "critical",
      auditNotes: [
        "Риск найден как существующий технический долг клиентского бесплатного доступа.",
        "Package 155 не расширяет этот механизм и не добавляет реальную разблокировку.",
      ],
    },
    {
      id: "ai-future-timeline-vip",
      title: "AI Future Timeline VIP",
      productId: "ai_future_timeline_vip",
      currentState: "Фундамент продукта описан локально и детерминированно. VIP-глубина обозначена как будущая.",
      currentClassification: "future-vip-teaser",
      protectedContent: [
        "расширенный future timeline",
        "периоды риска и сближения",
        "персональные next steps",
      ],
      futureRequirement: "Любой VIP-timeline должен проверяться на сервере перед расчётом и перед показом результата.",
      requiredServerChecks: SERVER_CHECKS.slice(),
      currentRisk: "medium",
      auditNotes: [
        "External AI API не используется.",
        "Будущий доступ не должен зависеть от состояния клиента.",
      ],
    },
    {
      id: "soulmate-scanner-vip",
      title: "Soulmate Scanner VIP",
      productId: "soulmate_scanner_vip",
      currentState: "Сейчас это локальная основа продукта с будущей VIP-глубиной без доступа и оплаты.",
      currentClassification: "future-vip-teaser",
      protectedContent: [
        "расширенная soulmate-карта",
        "глубокие сигналы совпадения",
        "персональная интерпретация паттернов",
      ],
      futureRequirement: "Выдавать VIP-слой только после server-side entitlement для конкретного продукта.",
      requiredServerChecks: SERVER_CHECKS.slice(),
      currentRisk: "medium",
      auditNotes: [
        "Сейчас безопасный preview.",
        "Будущий VIP нельзя открывать через локальное состояние формы.",
      ],
    },
    {
      id: "red-flags-scanner-vip",
      title: "Red Flags Scanner VIP",
      productId: "red_flags_scanner_vip",
      currentState: "Сейчас это локальная основа продукта с будущей VIP-глубиной без фактической блокировки доступа.",
      currentClassification: "future-vip-teaser",
      protectedContent: [
        "расширенная карта red flags",
        "уровни риска",
        "бережные рекомендации по действиям",
      ],
      futureRequirement: "Перед показом VIP-разделов нужен server-side entitlement и safety review результата.",
      requiredServerChecks: SERVER_CHECKS.slice(),
      currentRisk: "medium",
      auditNotes: [
        "Формулировки должны оставаться бережными и не медицинскими.",
        "Entitlement не заменяет owner review для чувствительных сценариев.",
      ],
    },
    {
      id: "birth-matrix-vip",
      title: "Birth Matrix VIP",
      productId: "birth_matrix_vip",
      currentState: "Маршрут Birth Matrix существует, дата рождения исправлена на текстовый ввод. VIP-слой должен быть отдельной будущей проверкой.",
      currentClassification: "future-vip-teaser",
      protectedContent: [
        "расширенная матрица судьбы",
        "детальные линии и периоды",
        "персональные трактовки по дате рождения",
      ],
      futureRequirement: "VIP-блоки Birth Matrix открывать только через server-side entitlement, а не через параметры маршрута.",
      requiredServerChecks: SERVER_CHECKS.slice(),
      currentRisk: "high",
      auditNotes: [
        "Дата рождения не является доказательством доступа.",
        "Query param и startapp не должны давать VIP.",
      ],
    },
    {
      id: "natal-chart-vip",
      title: "Natal Chart VIP",
      productId: "natal_chart_vip",
      currentState: "Натальная карта доступна как продуктовая поверхность. Будущие VIP-разделы требуют отдельной server-side boundary.",
      currentClassification: "future-vip-teaser",
      protectedContent: [
        "расширенная натальная карта",
        "дома и аспекты",
        "персональные периоды и рекомендации",
      ],
      futureRequirement: "VIP-результат Natal Chart должен возвращаться только после проверки активного entitlement.",
      requiredServerChecks: SERVER_CHECKS.slice(),
      currentRisk: "high",
      auditNotes: [
        "Дата/время/город рождения не должны открывать VIP сами по себе.",
        "Любой будущий exact astro provider остаётся отдельной зависимостью, не частью Package 155.",
      ],
    },
  ];
}

export function getAphroditeEntitlementRules(): AphroditeEntitlementRule[] {
  return [
    {
      id: "no-client-vip-unlock",
      label: "Нет клиентской VIP-разблокировки",
      description: "Клиентский UI может показать preview или locked copy, но не должен сам решать, есть ли VIP.",
      blockedShortcut: "client state, компонентный флаг или промо-режим",
      requiredServerCheck: "сервер возвращает entitlement decision для конкретного пользователя и productId",
    },
    {
      id: "no-local-storage-vip",
      label: "Нет доверия к localStorage для VIP",
      description: "localStorage можно использовать для черновика формы, но не для права на доступ.",
      blockedShortcut: "localStorage, sessionStorage или cached client profile",
      requiredServerCheck: "сервер сверяет entitlement с доверенным хранилищем и payment ledger",
    },
    {
      id: "no-query-param-vip",
      label: "Нет VIP по query param",
      description: "startapp, route param и query param могут вести к экрану, но не должны открывать закрытый результат.",
      blockedShortcut: "vip=true, startapp=vip, productId в URL",
      requiredServerCheck: "сервер игнорирует параметры доступа и проверяет entitlement отдельно",
    },
    {
      id: "no-ui-button-vip",
      label: "Нет VIP по кнопке UI",
      description: "Кнопка не выдаёт доступ. Она может только вести к будущему безопасному процессу оплаты после отдельного пакета.",
      blockedShortcut: "нажатие UI-кнопки или optimistic unlock",
      requiredServerCheck: "сервер подтверждает право после проверенного ledger-события",
    },
    {
      id: "no-access-without-entitlement",
      label: "Нет доступа без server-side entitlement",
      description: "Закрытый результат не должен формироваться и возвращаться без server-side entitlement.",
      blockedShortcut: "рендер VIP-раздела на клиенте до проверки",
      requiredServerCheck: "server-side entitlement с активным status и корректным сроком действия",
    },
    {
      id: "no-entitlement-without-ledger",
      label: "Нет entitlement без payment ledger",
      description: "Будущий entitlement должен ссылаться на проверенный источник оплаты или ручной auditReason.",
      blockedShortcut: "ручная запись доступа без связи с ledger",
      requiredServerCheck: "sourcePaymentId связан с payment ledger или есть owner-approved auditReason",
    },
    {
      id: "no-entitlement-without-owner-review",
      label: "Нет entitlement без owner review",
      description: "Перед реальной выдачей доступа владелец должен подтвердить правила, возвраты, поддержку и edge cases.",
      blockedShortcut: "автоматическое включение доступа без финального ревью",
      requiredServerCheck: "owner review отмечен до запуска реальной boundary",
    },
    {
      id: "no-stars-invoice-this-package",
      label: "Нет Telegram Stars invoice в этом пакете",
      description: "Package 155 описывает дизайн проверки доступа и не создаёт Telegram Stars invoice.",
      blockedShortcut: "создание invoice или invoice link",
      requiredServerCheck: "не применяется в Package 155",
    },
    {
      id: "no-successful-payment-handler-this-package",
      label: "Нет successful_payment handler в этом пакете",
      description: "Package 155 не добавляет обработчик платежа и не реагирует на события оплаты.",
      blockedShortcut: "обработка Telegram payment update",
      requiredServerCheck: "не применяется в Package 155",
    },
  ];
}

export function getAphroditeEntitlementBoundaries(): AphroditeEntitlementBoundary[] {
  return [
    { token: "no-real-vip-unlock", label: "Нет реальной VIP-разблокировки", detail: "Страница и модель описывают будущую boundary, но не открывают VIP-контент.", riskLevel: "critical" },
    { token: "no-payment", label: "Нет оплаты", detail: "Нет платёжной формы, провайдера, invoice, checkout или списания.", riskLevel: "critical" },
    { token: "no-stars-invoice", label: "Нет Telegram Stars invoice", detail: "Package 155 не создаёт live invoice и не вызывает Telegram Stars API.", riskLevel: "critical" },
    { token: "no-successful-payment-handler", label: "Нет successful_payment handler", detail: "Нет обработчика успешного платежа и нет реакции на payment update.", riskLevel: "critical" },
    { token: "no-database-write", label: "Нет записи в базу данных", detail: "Модель статическая, не пишет профили, платежи или доступ.", riskLevel: "critical" },
    { token: "no-database-schema-migration", label: "Нет миграции схемы базы данных", detail: "Поля entitlement описаны только как будущий дизайн, без schema/migration.", riskLevel: "critical" },
    { token: "no-telegram-api-call", label: "Нет вызова Telegram API", detail: "Нет bot API, BotFather, Stars API или отправки сообщений.", riskLevel: "critical" },
    { token: "no-production-launch", label: "Нет production-запуска", detail: "Нет включения live gating, production delivery или внешней автоматизации.", riskLevel: "high" },
    { token: "no-client-vip-unlock", label: "Нет клиентской VIP-разблокировки", detail: "Дизайн запрещает VIP через localStorage, query param, UI-кнопку и client state.", riskLevel: "critical" },
  ];
}

export function getAphroditeEntitlementNextSteps(): AphroditeEntitlementNextStep[] {
  return [
    {
      package: "Package 156",
      title: "VIP Access Boundary Real Implementation Plan",
      purpose: "Подготовить отдельный план реальной server-side boundary без автозапуска оплаты и без выдачи доступа до подтверждения владельца.",
      blockedUntil: [
        "Package 155 принят владельцем",
        "выбрана политика payment ledger",
        "подтверждён owner review",
        "подготовлены правила поддержки и возвратов",
      ],
    },
  ];
}
