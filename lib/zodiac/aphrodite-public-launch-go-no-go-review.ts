/**
 * Package 212: Public Launch Go/No-Go Review.
 *
 * Review/readiness only. This model does not launch production, call Telegram
 * API, send messages, change BotFather or active CTA, write to DB, enable
 * payments, unlock VIP, or change workflows/cron/publish scripts.
 */

export type AphroditePublicLaunchDependency = {
  id: string;
  title: string;
  routeOrSource: string;
  status: "ready-for-manual-review" | "blocked" | "manual-required";
  note: string;
};

export type AphroditePublicLaunchGate = {
  id: string;
  title: string;
  result: "go" | "no-go" | "manual-required";
  evidence: string;
};

export type AphroditeProductionPreflightBlocker = {
  id: string;
  title: string;
  sourceBlocker: string;
  classification: "Manual production env blocker" | "Manual backup freshness blocker";
  status: "BLOCKED";
  ownerExplanation: string;
  nextActions: readonly string[];
  notCodeFailureReason: string;
  forbiddenAutomation: readonly string[];
};

export type AphroditeProductionPreflightSafetySummary = {
  automaticLaunch: false;
  automaticSecretCreation: false;
  productionDbConnection: false;
  telegramApiCall: false;
  databaseWrite: false;
};

export type AphroditePublicLaunchGoNoGoReviewModel = {
  packageNumber: 212;
  preflightReadinessPackageNumber: 216;
  title: string;
  classification: string;
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  unresolvedBlockerCount: number;
  safetyLabels: readonly string[];
  dependencies: readonly AphroditePublicLaunchDependency[];
  gates: readonly AphroditePublicLaunchGate[];
  productionSafetyBlockers: readonly string[];
  envBlockers: readonly string[];
  backupBlockers: readonly string[];
  productionPreflightBlockers: readonly AphroditeProductionPreflightBlocker[];
  productionPreflightNextActions: readonly string[];
  productionPreflightSafetySummary: AphroditeProductionPreflightSafetySummary;
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaChanged: false;
    databaseWriteAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    workflowChanged: false;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_TITLE = "Public Launch Go/No-Go Review";

export const APHRODITE_PRODUCTION_PREFLIGHT_PACKAGE_NUMBER = 216;

export const APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_CLASSIFICATION =
  "Только Go/No-Go review / Запуск не разрешён / Нужна ручная проверка";

export const APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_RULE =
  "Package 212 собирает финальный Go/No-Go review после visual readiness, real device checklist, WebView/startapp diagnostics, cache marker readiness и issue triage board. publicLaunchApproved=false до ручного подтверждения владельца.";

export const APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет изменения BotFather",
  "Нет изменения active CTA",
  "Нет записи в базу данных",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "Go/No-Go review ничего не запускает",
] as const;

const dependencies: readonly AphroditePublicLaunchDependency[] = [
  {
    id: "visual-readiness",
    title: "visual readiness",
    routeOrSource: "/dashboard/networks/zodiac/public-launch-visual-readiness-review",
    status: "ready-for-manual-review",
    note: "Package 207 dependency exists; visual readiness still requires owner review.",
  },
  {
    id: "real-device-checklist",
    title: "real device checklist",
    routeOrSource: "/dashboard/networks/zodiac/real-device-visual-qa-checklist",
    status: "manual-required",
    note: "Manual iPhone/Android/Telegram Desktop checks must be confirmed by owner.",
  },
  {
    id: "webview-startapp-diagnostics",
    title: "WebView/startapp diagnostics",
    routeOrSource: "/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics",
    status: "ready-for-manual-review",
    note: "Wrong route/cache/startapp symptoms are mapped; no BotFather change was made.",
  },
  {
    id: "live-version-cache-marker",
    title: "live version/cache marker",
    routeOrSource: "/dashboard/networks/zodiac/live-version-cache-marker-readiness",
    status: "ready-for-manual-review",
    note: "Live version marker plan exists; deploy itself is not changed.",
  },
  {
    id: "issue-triage-board",
    title: "issue triage board",
    routeOrSource: "/dashboard/networks/zodiac/visual-issue-triage-board",
    status: "ready-for-manual-review",
    note: "Visual issue board exists; unresolved blockers must be reviewed manually.",
  },
  {
    id: "launch-checklist",
    title: "launch checklist",
    routeOrSource: "/dashboard/networks/zodiac/public-launch-checklist-refresh",
    status: "manual-required",
    note: "Launch checklist must be reviewed before public launch approval.",
  },
  {
    id: "manual-smoke-matrix",
    title: "manual smoke matrix",
    routeOrSource: "/dashboard/networks/zodiac/manual-launch-smoke-test-matrix",
    status: "manual-required",
    note: "Manual smoke matrix must confirm /miniapp, /birth-matrix, /compatibility and Love Reading preview.",
  },
  {
    id: "support-refund-readiness",
    title: "support/refund readiness",
    routeOrSource: "/dashboard/networks/zodiac/support-refund-policy-readiness",
    status: "manual-required",
    note: "Support/refund readiness must be owner-approved before paid or public launch.",
  },
  {
    id: "analytics-privacy-readiness",
    title: "analytics/privacy readiness",
    routeOrSource: "/dashboard/networks/zodiac/analytics-privacy-safety-suite",
    status: "manual-required",
    note: "Analytics/privacy boundaries are documented; no external analytics event sending is approved here.",
  },
  {
    id: "production-safety-blockers",
    title: "production safety blockers",
    routeOrSource: "npm run production:safety:check",
    status: "blocked",
    note: "Current safety check is blocked by missing env and stale backup.",
  },
  {
    id: "env-blockers",
    title: "env blockers",
    routeOrSource: "DATABASE_URL / TELEGRAM_BOT_TOKEN",
    status: "blocked",
    note: "DATABASE_URL missing = Manual production env blocker; TELEGRAM_BOT_TOKEN missing = Manual production env blocker.",
  },
  {
    id: "backup-blocker",
    title: "backup blocker",
    routeOrSource: "latest backup age",
    status: "blocked",
    note: "backup older than 24h = Manual backup freshness blocker.",
  },
  {
    id: "owner-approval",
    title: "owner approval",
    routeOrSource: "manual owner confirmation",
    status: "manual-required",
    note: "Owner must confirm real-device checks; publicLaunchApproved remains false.",
  },
];

const gates: readonly AphroditePublicLaunchGate[] = [
  {
    id: "visual-readiness-gate",
    title: "visual readiness",
    result: "manual-required",
    evidence: "Visual readiness review exists, but owner must confirm real-device screenshots.",
  },
  {
    id: "real-device-gate",
    title: "real device checklist",
    result: "manual-required",
    evidence: "Package 208 checklist exists; manual device run is still required.",
  },
  {
    id: "webview-startapp-gate",
    title: "WebView/startapp diagnostics",
    result: "manual-required",
    evidence: "Package 209 diagnostics exist; actual Telegram route must be checked by owner.",
  },
  {
    id: "cache-marker-gate",
    title: "live version/cache marker",
    result: "manual-required",
    evidence: "Package 210 marker readiness exists; live deployment marker must be checked.",
  },
  {
    id: "triage-gate",
    title: "issue triage board",
    result: "manual-required",
    evidence: "Package 211 board exists; unresolved blocker count must be reviewed.",
  },
  {
    id: "production-safety-gate",
    title: "production safety blockers",
    result: "no-go",
    evidence: "DATABASE_URL, TELEGRAM_BOT_TOKEN and backup age are manual production blockers, not code failure.",
  },
  {
    id: "owner-approval-gate",
    title: "owner approval",
    result: "no-go",
    evidence: "ownerManualReviewRequired=true and publicLaunchApproved=false.",
  },
];

const productionSafetyBlockers = [
  "DATABASE_URL is not configured",
  "TELEGRAM_BOT_TOKEN is not configured",
  "Latest backup is older than 24 hours",
] as const;

const envBlockers = ["DATABASE_URL", "TELEGRAM_BOT_TOKEN"] as const;
const backupBlockers = ["backup older than 24h"] as const;

export const APHRODITE_PRODUCTION_PREFLIGHT_NEXT_ACTIONS = [
  "configure production env manually",
  "verify backup freshness manually",
  "run production safety script again",
  "owner manual review required",
] as const;

const secretForbiddenAutomation = [
  "Do not add secrets to the repo",
  "Do not create production secrets automatically",
  "Do not connect to production DB",
] as const;

const telegramForbiddenAutomation = [
  "Do not add secrets to the repo",
  "Do not call Telegram API",
  "Do not send Telegram messages",
] as const;

const backupForbiddenAutomation = [
  "Do not fabricate backup evidence",
  "Do not connect to production DB",
  "Do not mark backup fresh automatically",
] as const;

const productionPreflightBlockers: readonly AphroditeProductionPreflightBlocker[] = [
  {
    id: "database-url",
    title: "DATABASE_URL missing",
    sourceBlocker: "DATABASE_URL is not configured",
    classification: "Manual production env blocker",
    status: "BLOCKED",
    ownerExplanation: "DATABASE_URL missing = Manual production env blocker. Owner must configure production env manually before launch review can move forward.",
    nextActions: [
      "configure production env manually",
      "run production safety script again",
      "owner manual review required",
    ],
    notCodeFailureReason: "Missing production DATABASE_URL is an operations preflight item, not code failure.",
    forbiddenAutomation: secretForbiddenAutomation,
  },
  {
    id: "telegram-bot-token",
    title: "TELEGRAM_BOT_TOKEN missing",
    sourceBlocker: "TELEGRAM_BOT_TOKEN is not configured",
    classification: "Manual production env blocker",
    status: "BLOCKED",
    ownerExplanation: "TELEGRAM_BOT_TOKEN missing = Manual production env blocker. Owner must configure production env manually before Telegram readiness can be approved.",
    nextActions: [
      "configure production env manually",
      "run production safety script again",
      "owner manual review required",
    ],
    notCodeFailureReason: "Missing production TELEGRAM_BOT_TOKEN is an operations preflight item, not code failure.",
    forbiddenAutomation: telegramForbiddenAutomation,
  },
  {
    id: "backup-freshness",
    title: "backup older than 24h",
    sourceBlocker: "Latest backup is older than 24 hours",
    classification: "Manual backup freshness blocker",
    status: "BLOCKED",
    ownerExplanation: "backup older than 24h = Manual backup freshness blocker. Owner must verify backup freshness manually before launch approval.",
    nextActions: [
      "verify backup freshness manually",
      "run production safety script again",
      "owner manual review required",
    ],
    notCodeFailureReason: "Stale backup evidence is an operations readiness item, not code failure.",
    forbiddenAutomation: backupForbiddenAutomation,
  },
];

const productionPreflightSafetySummary: AphroditeProductionPreflightSafetySummary = {
  automaticLaunch: false,
  automaticSecretCreation: false,
  productionDbConnection: false,
  telegramApiCall: false,
  databaseWrite: false,
};

export function getAphroditePublicLaunchGoNoGoReview(): AphroditePublicLaunchGoNoGoReviewModel {
  return {
    packageNumber: 212,
    preflightReadinessPackageNumber: APHRODITE_PRODUCTION_PREFLIGHT_PACKAGE_NUMBER,
    title: APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_TITLE,
    classification: APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_CLASSIFICATION,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    unresolvedBlockerCount: 3,
    safetyLabels: APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_SAFETY_LABELS,
    dependencies: dependencies.map((dependency) => ({ ...dependency })),
    gates: gates.map((gate) => ({ ...gate })),
    productionSafetyBlockers: [...productionSafetyBlockers],
    envBlockers: [...envBlockers],
    backupBlockers: [...backupBlockers],
    productionPreflightBlockers: productionPreflightBlockers.map((blocker) => ({
      ...blocker,
      nextActions: [...blocker.nextActions],
      forbiddenAutomation: [...blocker.forbiddenAutomation],
    })),
    productionPreflightNextActions: [...APHRODITE_PRODUCTION_PREFLIGHT_NEXT_ACTIONS],
    productionPreflightSafetySummary: { ...productionPreflightSafetySummary },
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaChanged: false,
      databaseWriteAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      workflowChanged: false,
    },
    nextRecommendedPackage: "Package 213 — Live Screenshot Fix Sprint",
  };
}
