/**
 * Package 179: Support & Refund Policy readiness.
 *
 * Policy/readiness model only. It describes future support and refund handling
 * for a paid MVP without enabling payments, refunds, VIP access, Telegram API
 * calls, database writes, or production launch.
 */

export type AphroditeSupportRefundArea =
  | "paysupport"
  | "refund-policy"
  | "support-contact"
  | "terms"
  | "privacy"
  | "payment-dispute"
  | "manual-review"
  | "telegram-stars-policy"
  | "user-expectations"
  | "product-delivery"
  | "failed-payment"
  | "duplicate-payment"
  | "revocation"
  | "owner-review";

export type AphroditeSupportRefundReadinessStatus =
  | "draft-policy"
  | "owner-review-required"
  | "blocked-until-live-payment"
  | "blocked-until-support-contact"
  | "blocked-until-terms"
  | "blocked-until-refund-policy"
  | "not-production-ready";

export type AphroditeSupportRefundReadinessItem = {
  id: string;
  area: AphroditeSupportRefundArea;
  label: string;
  currentState: string;
  futureUserVisibleText: string;
  requiredBeforePaymentLaunch: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeRefundScenario = {
  id: string;
  label: string;
  scenario: string;
  futurePolicyDraft: string;
  manualReviewRequired: boolean;
  entitlementActionFuture: string[];
  ledgerActionFuture: string[];
  blockedNow: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeSupportRefundBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeSupportRefundNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_SUPPORT_REFUND_READINESS_TITLE = "Support & Refund Readiness";

export const APHRODITE_SUPPORT_REFUND_READINESS_CLASSIFICATION =
  "Только policy readiness / Возвраты не автоматизированы / Нет оплаты";

export const APHRODITE_SUPPORT_REFUND_POLICY_RULE =
  "Support/refund readiness describes future policy only. It must not enable payments, refunds, VIP access, Telegram API calls, or database writes.";

export const APHRODITE_SUPPORT_REFUND_SAFETY_LABELS = [
  "Нет реальной оплаты",
  "Нет Telegram Stars invoice",
  "Нет sendInvoice",
  "Нет createInvoiceLink",
  "Нет pre_checkout_query handler",
  "Нет successful_payment handler",
  "Нет payment ledger write",
  "Нет entitlement creation",
  "Нет реальной VIP-разблокировки",
  "Нет автоматического возврата",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Support/refund readiness не включает оплату",
] as const;

const readinessItems: AphroditeSupportRefundReadinessItem[] = [
  {
    id: "telegram-paysupport-readiness",
    area: "paysupport",
    label: "Telegram /paysupport readiness",
    currentState: "Команда /paysupport пока не подключена как live bot flow; Package 179 описывает только будущий текст и требования.",
    futureUserVisibleText:
      "/paysupport должен объяснять, какой продукт был оплачен, как связаться с поддержкой, какие данные нужны для ручной проверки и почему возврат не автоматический.",
    requiredBeforePaymentLaunch: ["утверждённый текст /paysupport", "support contact", "refund policy", "owner review"],
    blockedUntil: ["отдельный Telegram bot support package", "TELEGRAM_BOT_TOKEN review", "owner approval"],
    riskLevel: "critical",
  },
  {
    id: "support-contact-readiness",
    area: "support-contact",
    label: "support contact readiness",
    currentState: "Публичный контакт поддержки для платного MVP не финализирован.",
    futureUserVisibleText:
      "Перед оплатой пользователь должен видеть, куда писать по вопросам оплаты, доступа, технической ошибки и возврата.",
    requiredBeforePaymentLaunch: ["support handle/email", "SLA wording", "manual triage owner"],
    blockedUntil: ["support contact approved", "owner review"],
    riskLevel: "high",
  },
  {
    id: "refund-policy-draft",
    area: "refund-policy",
    label: "refund policy draft",
    currentState: "Есть только draft-политика; автоматических возвратов нет.",
    futureUserVisibleText:
      "Возвраты рассматриваются вручную. Решение зависит от статуса платежа, доставки отчёта, доступа, технической ошибки и правил Telegram Stars.",
    requiredBeforePaymentLaunch: ["refund windows", "refund eligibility", "refund denial wording", "revocation process"],
    blockedUntil: ["refund policy approved", "Telegram Stars policy checked"],
    riskLevel: "critical",
  },
  {
    id: "failed-payment-support",
    area: "failed-payment",
    label: "failed payment support",
    currentState: "Failed payment support описан только как будущая ручная triage-процедура.",
    futureUserVisibleText:
      "Если оплата не прошла, доступ не выдаётся. Пользователь должен проверить статус Telegram Stars и обратиться в поддержку с деталями попытки.",
    requiredBeforePaymentLaunch: ["payment status wording", "no-access guarantee for failed payment", "support contact"],
    blockedUntil: ["live payment events exist", "support policy approved"],
    riskLevel: "high",
  },
  {
    id: "duplicate-payment-support",
    area: "duplicate-payment",
    label: "duplicate payment support",
    currentState: "Duplicate payment handling не автоматизирован; будущая проверка должна быть ручной и ledger-based.",
    futureUserVisibleText:
      "Если пользователь считает, что оплатил дважды, поддержка вручную проверяет payment ledger и Telegram Stars данные.",
    requiredBeforePaymentLaunch: ["idempotent ledger", "duplicate detection rules", "manual review playbook"],
    blockedUntil: ["payment ledger write exists", "support/refund policy approved"],
    riskLevel: "critical",
  },
  {
    id: "wrong-product-dispute",
    area: "payment-dispute",
    label: "wrong product/payment dispute",
    currentState: "Wrong product dispute описан только как будущий ручной кейс.",
    futureUserVisibleText:
      "Если выбран не тот продукт, поддержка проверяет продукт, время покупки, delivery status и возможность ручного решения.",
    requiredBeforePaymentLaunch: ["product catalog mapping", "manual review owner", "refund/credit wording"],
    blockedUntil: ["owner review", "refund policy approved"],
    riskLevel: "high",
  },
  {
    id: "successful-payment-report-not-opened",
    area: "product-delivery",
    label: "successful payment but report not opened",
    currentState: "Delivery support не автоматизирован; future policy должна описать ручную проверку доступа.",
    futureUserVisibleText:
      "Если платёж прошёл, но отчёт не открылся, поддержка проверяет ledger, entitlement и delivery status перед любым решением.",
    requiredBeforePaymentLaunch: ["delivery status model", "entitlement check", "manual support playbook"],
    blockedUntil: ["successful_payment handler exists", "entitlement storage exists", "ledger exists"],
    riskLevel: "critical",
  },
  {
    id: "entitlement-revocation-after-refund",
    area: "revocation",
    label: "entitlement revocation after refund",
    currentState: "Revocation описан как будущая зависимость; Package 179 не отзывает доступ.",
    futureUserVisibleText:
      "Если возврат одобрен, будущий VIP-доступ должен быть отозван вручную или через отдельный verified revocation flow.",
    requiredBeforePaymentLaunch: ["revocation policy", "entitlement storage", "audit trail", "owner approval"],
    blockedUntil: ["entitlement creation exists", "refund policy approved", "ledger audit exists"],
    riskLevel: "critical",
  },
  {
    id: "manual-owner-review",
    area: "manual-review",
    label: "manual owner review",
    currentState: "Спорные случаи требуют owner review; automated refund запрещён.",
    futureUserVisibleText:
      "Сложные случаи оплаты и возврата рассматриваются вручную. Пользователь получает объяснение решения и следующие шаги.",
    requiredBeforePaymentLaunch: ["owner review checklist", "support escalation rule", "refund denial template"],
    blockedUntil: ["owner review gate approved"],
    riskLevel: "critical",
  },
  {
    id: "terms-privacy-dependency",
    area: "terms",
    label: "privacy/terms dependency",
    currentState: "Terms/privacy для платного MVP не финализированы.",
    futureUserVisibleText:
      "Перед оплатой пользователь должен видеть условия продукта, поддержку, правила возврата, обработку данных и ограничения Telegram Stars.",
    requiredBeforePaymentLaunch: ["terms draft", "privacy wording", "data retention wording", "owner approval"],
    blockedUntil: ["terms approved", "privacy approved"],
    riskLevel: "critical",
  },
  {
    id: "telegram-stars-policy-dependency",
    area: "telegram-stars-policy",
    label: "Telegram Stars policy dependency",
    currentState: "Telegram Stars policy dependency описана, но live invoice не включён.",
    futureUserVisibleText:
      "Правила возврата и поддержки должны учитывать ограничения Telegram Stars и платформенные правила Telegram.",
    requiredBeforePaymentLaunch: ["Telegram Stars policy review", "platform limitation wording", "support escalation wording"],
    blockedUntil: ["Telegram Stars review approved", "owner review"],
    riskLevel: "critical",
  },
  {
    id: "user-expectation-disclaimer",
    area: "user-expectations",
    label: "user expectation disclaimer",
    currentState: "Перед оплатой нужен честный disclaimer: что именно покупает пользователь и какие ограничения у продукта.",
    futureUserVisibleText:
      "Пользователь должен понимать, что покупает цифровой развлекательный отчёт, когда доступ появляется, где поддержка и как запросить ручную проверку.",
    requiredBeforePaymentLaunch: ["pre-payment copy", "delivery timing", "refund limitation", "support contact"],
    blockedUntil: ["owner-approved public copy"],
    riskLevel: "high",
  },
];

const refundScenarios: AphroditeRefundScenario[] = [
  {
    id: "duplicate-payment",
    label: "duplicate payment",
    scenario: "Пользователь сообщает, что оплатил один продукт дважды.",
    futurePolicyDraft: "Поддержка вручную проверяет ledger, Telegram Stars данные и productId. Автоматический возврат не выполняется.",
    manualReviewRequired: true,
    entitlementActionFuture: ["не выдавать второй доступ автоматически", "проверить active entitlement", "при approved refund сохранить один доступ"],
    ledgerActionFuture: ["найти оба payment records", "проверить idempotency key", "отметить disputed/refund-reviewed только в будущем ledger"],
    blockedNow: ["нет real payment", "нет ledger write", "нет refund automation"],
    riskLevel: "critical",
  },
  {
    id: "payment-succeeded-access-not-delivered",
    label: "payment succeeded but access not delivered",
    scenario: "Платёж успешен, но пользователь не видит Full Love Report или VIP-раздел.",
    futurePolicyDraft: "Поддержка вручную сверяет successful_payment event, ledger record, entitlement и delivery status.",
    manualReviewRequired: true,
    entitlementActionFuture: ["проверить entitlement", "создать или восстановить доступ только после verified ledger в будущем package"],
    ledgerActionFuture: ["проверить payment status", "проверить delivery status", "создать audit note"],
    blockedNow: ["нет successful_payment handler", "нет entitlement creation", "нет DB write"],
    riskLevel: "critical",
  },
  {
    id: "wrong-product-selected",
    label: "wrong product selected",
    scenario: "Пользователь купил не тот продукт или ожидал другой формат отчёта.",
    futurePolicyDraft: "Решение принимается вручную с учётом product description, статуса чтения отчёта и Telegram Stars правил.",
    manualReviewRequired: true,
    entitlementActionFuture: ["не менять продукт автоматически", "проверить delivery/read status", "возможный manual correction только после owner review"],
    ledgerActionFuture: ["проверить purchased productId", "добавить dispute note", "не менять ledger без verified policy"],
    blockedNow: ["нет product switch automation", "нет refund automation"],
    riskLevel: "high",
  },
  {
    id: "technical-error-after-payment",
    label: "technical error after payment",
    scenario: "После оплаты произошла техническая ошибка, отчёт не открылся или страница сломалась.",
    futurePolicyDraft: "Поддержка сначала пытается восстановить доступ; refund рассматривается вручную, если delivery невозможно подтвердить.",
    manualReviewRequired: true,
    entitlementActionFuture: ["проверить access state", "восстановить entitlement только после verified ledger"],
    ledgerActionFuture: ["проверить payment event", "проверить delivery audit", "добавить support note"],
    blockedNow: ["нет production payment", "нет support automation", "нет DB write"],
    riskLevel: "critical",
  },
  {
    id: "refund-after-reading-report",
    label: "user asks refund after reading report",
    scenario: "Пользователь прочитал цифровой отчёт и просит вернуть оплату.",
    futurePolicyDraft: "Нужна ручная оценка: цифровой продукт уже доставлен, поэтому refund может быть ограничен правилами policy и Telegram Stars.",
    manualReviewRequired: true,
    entitlementActionFuture: ["проверить read/delivery status", "при approved refund отозвать доступ"],
    ledgerActionFuture: ["проверить delivery timestamp", "добавить manual decision note"],
    blockedNow: ["нет delivery audit", "нет refund policy approval"],
    riskLevel: "high",
  },
  {
    id: "telegram-stars-platform-limitation",
    label: "Telegram Stars platform limitation",
    scenario: "Возврат ограничен правилами Telegram Stars или платформенным процессом.",
    futurePolicyDraft: "Пользователю нужно объяснить платформенное ограничение и доступные manual support steps.",
    manualReviewRequired: true,
    entitlementActionFuture: ["не отзывать доступ без confirmed refund decision", "manual review обязательный"],
    ledgerActionFuture: ["отметить platform-limited review", "не обещать автоматический refund"],
    blockedNow: ["нет Telegram Stars live review", "нет platform refund automation"],
    riskLevel: "critical",
  },
  {
    id: "abuse-fraud-manual-review",
    label: "abuse/fraud/manual review",
    scenario: "Есть подозрение на abuse, fraud, charge dispute или повторные спорные запросы.",
    futurePolicyDraft: "Все такие случаи уходят на owner/manual review; automatic refund и automatic access changes запрещены.",
    manualReviewRequired: true,
    entitlementActionFuture: ["не выдавать дополнительный доступ", "не отзывать доступ без owner decision"],
    ledgerActionFuture: ["создать manual review note", "проверить related payment records"],
    blockedNow: ["нет fraud automation", "нет owner-approved dispute workflow"],
    riskLevel: "critical",
  },
  {
    id: "refund-approved-entitlement-revoked",
    label: "refund approved then entitlement revoked",
    scenario: "Owner/support одобрил возврат; будущий доступ должен быть отозван.",
    futurePolicyDraft: "После confirmed refund future flow должен revoke entitlement и сохранить audit trail. Package 179 этого не делает.",
    manualReviewRequired: true,
    entitlementActionFuture: ["revoked status", "access removed", "audit reason stored"],
    ledgerActionFuture: ["refund approved note", "refund reference", "manual owner decision"],
    blockedNow: ["нет entitlement revocation", "нет ledger write", "нет DB write"],
    riskLevel: "critical",
  },
  {
    id: "refund-denied-with-explanation",
    label: "refund denied with explanation",
    scenario: "Запрос на возврат отклонён после ручной проверки.",
    futurePolicyDraft: "Пользователь получает понятное объяснение причины, ссылку на policy и возможные дальнейшие шаги.",
    manualReviewRequired: true,
    entitlementActionFuture: ["не отзывать доступ", "оставить current access state"],
    ledgerActionFuture: ["manual denial note", "policy reason", "support timestamp"],
    blockedNow: ["нет denial automation", "нет support message sending"],
    riskLevel: "high",
  },
];

const boundaries: AphroditeSupportRefundBoundary[] = [
  {
    area: "payment",
    visibleLabel: "Нет реальной оплаты",
    dataBoundary: "no-real-payment",
    allowedNow: ["policy readiness", "support wording draft"],
    blockedUntil: ["future payment package", "owner approval"],
    riskLevel: "critical",
  },
  {
    area: "telegram-stars",
    visibleLabel: "Нет Telegram Stars invoice",
    dataBoundary: "no-stars-invoice",
    allowedNow: ["Telegram Stars policy notes"],
    blockedUntil: ["live invoice package", "Telegram API review"],
    riskLevel: "critical",
  },
  {
    area: "invoice-send",
    visibleLabel: "Нет sendInvoice",
    dataBoundary: "no-send-invoice",
    allowedNow: ["support copy only"],
    blockedUntil: ["separate Telegram invoice implementation"],
    riskLevel: "critical",
  },
  {
    area: "invoice-link",
    visibleLabel: "Нет createInvoiceLink",
    dataBoundary: "no-create-invoice-link",
    allowedNow: ["no invoice link"],
    blockedUntil: ["separate invoice link review"],
    riskLevel: "critical",
  },
  {
    area: "pre-checkout",
    visibleLabel: "Нет pre_checkout_query handler",
    dataBoundary: "no-pre-checkout-handler",
    allowedNow: ["policy dependency description"],
    blockedUntil: ["future handler package"],
    riskLevel: "critical",
  },
  {
    area: "successful-payment",
    visibleLabel: "Нет successful_payment handler",
    dataBoundary: "no-successful-payment-handler",
    allowedNow: ["delivery support policy draft"],
    blockedUntil: ["future payment handler package"],
    riskLevel: "critical",
  },
  {
    area: "payment-ledger",
    visibleLabel: "Нет payment ledger write",
    dataBoundary: "no-payment-ledger-write",
    allowedNow: ["ledger dependency notes"],
    blockedUntil: ["verified payment ledger package"],
    riskLevel: "critical",
  },
  {
    area: "entitlement",
    visibleLabel: "Нет entitlement creation",
    dataBoundary: "no-entitlement-creation",
    allowedNow: ["revocation dependency notes"],
    blockedUntil: ["verified entitlement storage"],
    riskLevel: "critical",
  },
  {
    area: "vip",
    visibleLabel: "Нет реальной VIP-разблокировки",
    dataBoundary: "no-real-vip-unlock",
    allowedNow: ["future access policy notes"],
    blockedUntil: ["verified payment and entitlement"],
    riskLevel: "critical",
  },
  {
    area: "refund",
    visibleLabel: "Нет автоматического возврата",
    dataBoundary: "no-automatic-refund",
    allowedNow: ["manual refund scenario drafts"],
    blockedUntil: ["future support/refund implementation and owner approval"],
    riskLevel: "critical",
  },
  {
    area: "database",
    visibleLabel: "Нет записи в базу данных",
    dataBoundary: "no-database-write",
    allowedNow: ["static TypeScript model"],
    blockedUntil: ["DATABASE_URL review", "fresh backup"],
    riskLevel: "critical",
  },
  {
    area: "schema",
    visibleLabel: "Нет миграции схемы базы данных",
    dataBoundary: "no-database-schema-migration",
    allowedNow: ["documentation only"],
    blockedUntil: ["separate migration package"],
    riskLevel: "critical",
  },
  {
    area: "telegram-api",
    visibleLabel: "Нет вызова Telegram API",
    dataBoundary: "no-telegram-api-call",
    allowedNow: ["dashboard review"],
    blockedUntil: ["TELEGRAM_BOT_TOKEN review", "bot support package"],
    riskLevel: "critical",
  },
  {
    area: "production-launch",
    visibleLabel: "Нет production-запуска",
    dataBoundary: "no-production-launch",
    allowedNow: ["readiness report"],
    blockedUntil: ["owner-approved production package"],
    riskLevel: "critical",
  },
  {
    area: "support-readiness",
    visibleLabel: "Support/refund readiness не включает оплату",
    dataBoundary: "support-readiness-no-payment",
    allowedNow: ["policy draft", "manual review checklist"],
    blockedUntil: ["Package 180+ readiness and explicit owner approval"],
    riskLevel: "critical",
  },
];

const nextSteps: AphroditeSupportRefundNextStep[] = [
  {
    package: "Package 180",
    title: "Analytics/Funnel Tracking Readiness",
    purpose:
      "Описать paid funnel events, support/refund analytics events, privacy-safe tracking и dashboard readiness без запуска оплаты.",
    blockedUntil: [
      "Package 179 committed",
      "support/refund remains policy-only",
      "no payment runtime",
      "no Telegram API call",
      "no database write",
    ],
  },
];

export function getAphroditeSupportRefundReadinessItems(): AphroditeSupportRefundReadinessItem[] {
  return readinessItems.map((item) => ({
    ...item,
    requiredBeforePaymentLaunch: item.requiredBeforePaymentLaunch.slice(),
    blockedUntil: item.blockedUntil.slice(),
  }));
}

export function getAphroditeRefundScenarios(): AphroditeRefundScenario[] {
  return refundScenarios.map((scenario) => ({
    ...scenario,
    entitlementActionFuture: scenario.entitlementActionFuture.slice(),
    ledgerActionFuture: scenario.ledgerActionFuture.slice(),
    blockedNow: scenario.blockedNow.slice(),
  }));
}

export function getAphroditeSupportRefundBoundaries(): AphroditeSupportRefundBoundary[] {
  return boundaries.map((boundary) => ({
    ...boundary,
    allowedNow: boundary.allowedNow.slice(),
    blockedUntil: boundary.blockedUntil.slice(),
  }));
}

export function getAphroditeSupportRefundNextSteps(): AphroditeSupportRefundNextStep[] {
  return nextSteps.map((step) => ({
    ...step,
    blockedUntil: step.blockedUntil.slice(),
  }));
}
