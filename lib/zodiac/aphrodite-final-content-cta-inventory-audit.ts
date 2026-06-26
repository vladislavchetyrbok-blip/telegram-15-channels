/**
 * Package 219: Final Content & CTA Inventory Audit.
 *
 * Static inventory/audit only. This model does not change active CTA logic,
 * publish scripts, cron/workflows, Telegram API, Telegram messages, BotFather,
 * DB writes, external analytics, payments, or VIP unlock.
 */

export type AphroditeCtaInventoryRiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type AphroditeCtaInventoryStatus = "PASS" | "MANUAL REVIEW" | "BLOCKED" | "NOT CHECKED";

export type AphroditeCtaInventoryItem = {
  id: string;
  areaFlow: string;
  userVisibleCtaLabel: string;
  expectedDestination: string;
  riskLevel: AphroditeCtaInventoryRiskLevel;
  status: AphroditeCtaInventoryStatus;
  notes: string;
  activeLogicChanged: false;
};

export type AphroditeFinalContentCtaInventoryAuditModel = {
  packageNumber: 219;
  title: string;
  route: "/dashboard/networks/zodiac/final-content-cta-inventory-audit";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  auditOnlyMessages: readonly string[];
  riskLevels: readonly AphroditeCtaInventoryRiskLevel[];
  statuses: readonly AphroditeCtaInventoryStatus[];
  inventory: readonly AphroditeCtaInventoryItem[];
  manualReviewItems: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    workflowChanged: false;
    publishScriptsChanged: false;
  };
};

export const APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_TITLE =
  "Final Content & CTA Inventory Audit";

export const APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_ROUTE =
  "/dashboard/networks/zodiac/final-content-cta-inventory-audit" as const;

export const APHRODITE_CTA_INVENTORY_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;

export const APHRODITE_CTA_INVENTORY_STATUSES = [
  "PASS",
  "MANUAL REVIEW",
  "BLOCKED",
  "NOT CHECKED",
] as const;

export const APHRODITE_CTA_INVENTORY_AUDIT_MESSAGES = [
  "This is an inventory audit only.",
  "Active CTA logic was not changed.",
  "No Telegram messages were sent.",
  "No publish scripts or workflows were changed.",
] as const;

const inventory: readonly AphroditeCtaInventoryItem[] = [
  {
    id: "daily-zodiac-posts",
    areaFlow: "Daily Zodiac posts",
    userVisibleCtaLabel: "Открыть Mini App / daily forecast CTA",
    expectedDestination: "/miniapp or daily startapp route",
    riskLevel: "MEDIUM",
    status: "MANUAL REVIEW",
    notes: "Owner should verify daily post copy, CTA label, destination and startapp parameter before public launch.",
    activeLogicChanged: false,
  },
  {
    id: "weekly-zodiac-posts",
    areaFlow: "Weekly Zodiac posts",
    userVisibleCtaLabel: "Прогноз на неделю / weekly CTA",
    expectedDestination: "/miniapp or weekly startapp route",
    riskLevel: "MEDIUM",
    status: "MANUAL REVIEW",
    notes: "Owner should confirm weekly copy points to the upcoming week and does not imply launch approval.",
    activeLogicChanged: false,
  },
  {
    id: "general-channel-cta",
    areaFlow: "General channel CTA",
    userVisibleCtaLabel: "Открыть Aphrodite / Zodiac Mini App",
    expectedDestination: "/miniapp",
    riskLevel: "MEDIUM",
    status: "MANUAL REVIEW",
    notes: "General channel CTA needs a manual route/startapp check in Telegram WebView.",
    activeLogicChanged: false,
  },
  {
    id: "sign-channels-cta",
    areaFlow: "Sign channels CTA",
    userVisibleCtaLabel: "Открыть прогноз знака",
    expectedDestination: "/channels/zodiac/[sign] or sign-specific startapp route",
    riskLevel: "MEDIUM",
    status: "MANUAL REVIEW",
    notes: "Owner should verify all sign channel labels and destinations before launch.",
    activeLogicChanged: false,
  },
  {
    id: "mini-app-entry-cta",
    areaFlow: "Mini App entry CTA",
    userVisibleCtaLabel: "Открыть Mini App",
    expectedDestination: "/miniapp",
    riskLevel: "LOW",
    status: "PASS",
    notes: "Entry point is inventoried; live Telegram route still depends on owner manual WebView verification.",
    activeLogicChanged: false,
  },
  {
    id: "compatibility-cta",
    areaFlow: "Compatibility CTA",
    userVisibleCtaLabel: "Проверить совместимость",
    expectedDestination: "/compatibility",
    riskLevel: "LOW",
    status: "MANUAL REVIEW",
    notes: "Owner should verify compatibility flow copy and destination in browser and Telegram WebView.",
    activeLogicChanged: false,
  },
  {
    id: "birth-matrix-cta",
    areaFlow: "Birth Matrix CTA",
    userVisibleCtaLabel: "Рассчитать матрицу судьбы",
    expectedDestination: "/birth-matrix",
    riskLevel: "LOW",
    status: "MANUAL REVIEW",
    notes: "Owner should verify date input flow and CTA destination after the birth-date fixes.",
    activeLogicChanged: false,
  },
  {
    id: "mystic-cards-cta",
    areaFlow: "Mystic Cards CTA",
    userVisibleCtaLabel: "Открыть мистические карты",
    expectedDestination: "/mystic-numbers or Mini App Mystic section",
    riskLevel: "MEDIUM",
    status: "NOT CHECKED",
    notes: "Mystic card destination needs final manual visual and route review.",
    activeLogicChanged: false,
  },
  {
    id: "vip-locked-state-cta",
    areaFlow: "VIP locked state CTA",
    userVisibleCtaLabel: "VIP доступ / разблокировать позже",
    expectedDestination: "Locked preview or future paywall readiness route",
    riskLevel: "HIGH",
    status: "BLOCKED",
    notes: "VIP CTA must remain locked until payments, entitlement and owner launch approval are explicitly enabled later.",
    activeLogicChanged: false,
  },
  {
    id: "public-launch-dashboard-links",
    areaFlow: "Public launch dashboard links",
    userVisibleCtaLabel: "Open readiness dashboard",
    expectedDestination: "/dashboard/networks/zodiac/public-launch-go-no-go-review",
    riskLevel: "LOW",
    status: "PASS",
    notes: "Readiness dashboard links are inventory-only and do not perform launch actions.",
    activeLogicChanged: false,
  },
  {
    id: "telegram-webview-startapp-links",
    areaFlow: "Telegram WebView/startapp links",
    userVisibleCtaLabel: "Open via Telegram startapp",
    expectedDestination: "Bot deep link / startapp parameter routes",
    riskLevel: "HIGH",
    status: "MANUAL REVIEW",
    notes: "Owner must verify real Telegram WebView/startapp behavior on device; no BotFather change was made.",
    activeLogicChanged: false,
  },
  {
    id: "owner-manual-review-cta-status",
    areaFlow: "Owner manual review CTA/status",
    userVisibleCtaLabel: "Owner review required",
    expectedDestination: "/dashboard/networks/zodiac/public-launch-go-no-go-review",
    riskLevel: "HIGH",
    status: "BLOCKED",
    notes: "publicLaunchApproved remains false and ownerManualReviewRequired remains true until owner approval.",
    activeLogicChanged: false,
  },
];

const manualReviewItems = [
  "Daily Zodiac posts",
  "Weekly Zodiac posts",
  "General channel CTA",
  "Sign channels CTA",
  "Compatibility CTA",
  "Birth Matrix CTA",
  "Mystic Cards CTA",
  "VIP locked state CTA",
  "Telegram WebView/startapp links",
  "Owner manual review CTA/status",
] as const;

export function getAphroditeFinalContentCtaInventoryAudit(): AphroditeFinalContentCtaInventoryAuditModel {
  return {
    packageNumber: 219,
    title: APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_TITLE,
    route: APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    auditOnlyMessages: [...APHRODITE_CTA_INVENTORY_AUDIT_MESSAGES],
    riskLevels: [...APHRODITE_CTA_INVENTORY_RISK_LEVELS],
    statuses: [...APHRODITE_CTA_INVENTORY_STATUSES],
    inventory: inventory.map((item) => ({ ...item })),
    manualReviewItems: [...manualReviewItems],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      databaseWriteAdded: false,
      externalAnalyticsAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      workflowChanged: false,
      publishScriptsChanged: false,
    },
  };
}
