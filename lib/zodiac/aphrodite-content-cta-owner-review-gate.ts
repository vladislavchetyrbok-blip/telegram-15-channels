/**
 * Package 233: Content CTA Owner Review Gate.
 *
 * Static owner review gate only. It does not change active CTA logic,
 * publish scripts, cron/workflows, Telegram sending, payments, VIP, or DB writes.
 */

export type AphroditeContentCtaOwnerReviewStatus =
  | "MANUAL REVIEW"
  | "BLOCKED"
  | "NOT CHECKED"
  | "OWNER REVIEW REQUIRED";

export type AphroditeContentCtaOwnerReviewItem = {
  area: string;
  status: AphroditeContentCtaOwnerReviewStatus;
  detail: string;
  ownerAction: string;
  activeLogicChanged: "No";
};

export type AphroditeContentCtaOwnerReviewGateModel = {
  packageNumber: 233;
  title: string;
  route: "/dashboard/networks/zodiac/content-cta-owner-review-gate";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  items: readonly AphroditeContentCtaOwnerReviewItem[];
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
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
    cronWorkflowPublishChanged: false;
    publishScriptsChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
  };
};

export const APHRODITE_CONTENT_CTA_OWNER_REVIEW_GATE_TITLE =
  "Content CTA Owner Review Gate";

export const APHRODITE_CONTENT_CTA_OWNER_REVIEW_GATE_ROUTE =
  "/dashboard/networks/zodiac/content-cta-owner-review-gate" as const;

const items: readonly AphroditeContentCtaOwnerReviewItem[] = [
  {
    area: "Daily Zodiac posts CTA",
    status: "MANUAL REVIEW",
    detail: "Owner must review daily post CTA label, destination, tone, and channel context before soft launch.",
    ownerAction: "Compare generated daily CTA copy with owner-approved destination inventory.",
    activeLogicChanged: "No",
  },
  {
    area: "Weekly Zodiac posts CTA",
    status: "MANUAL REVIEW",
    detail: "Owner must review weekly CTA copy for upcoming-week framing and destination clarity.",
    ownerAction: "Confirm weekly CTA does not imply an unapproved production launch action.",
    activeLogicChanged: "No",
  },
  {
    area: "general channel CTA",
    status: "MANUAL REVIEW",
    detail: "Owner must review general channel CTA label, destination, and fallback behavior.",
    ownerAction: "Open expected destination manually and record screenshot or note.",
    activeLogicChanged: "No",
  },
  {
    area: "sign channel CTA",
    status: "MANUAL REVIEW",
    detail: "Owner must review sign-channel CTA consistency across zodiac sign channels.",
    ownerAction: "Spot-check at least one sign channel CTA and record destination evidence.",
    activeLogicChanged: "No",
  },
  {
    area: "Mini App entry CTA",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner must confirm the Mini App entry CTA opens the expected Mini App route/startapp flow.",
    ownerAction: "Check route in live browser and Telegram WebView manually.",
    activeLogicChanged: "No",
  },
  {
    area: "compatibility CTA",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner must review compatibility CTA copy and destination after result screens.",
    ownerAction: "Record result-screen screenshot and destination route.",
    activeLogicChanged: "No",
  },
  {
    area: "Birth Matrix CTA",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner must verify Birth Matrix CTA opens the text date flow and result screen.",
    ownerAction: "Record route and visible Russian birth-date helper text if present.",
    activeLogicChanged: "No",
  },
  {
    area: "Mystic Cards CTA",
    status: "MANUAL REVIEW",
    detail: "Owner must verify Mystic Cards CTA copy, availability, and destination.",
    ownerAction: "Mark BLOCKED with reason if the route is intentionally outside launch scope.",
    activeLogicChanged: "No",
  },
  {
    area: "VIP locked CTA",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner must verify locked-state CTA does not unlock VIP or imply active payment.",
    ownerAction: "Record locked-state screenshot and confirm no entitlement was created.",
    activeLogicChanged: "No",
  },
  {
    area: "public launch dashboard links",
    status: "MANUAL REVIEW",
    detail: "Owner must review readiness dashboard links for go/no-go, dry-run, and manual protocols.",
    ownerAction: "Open readiness links and confirm public launch remains not approved.",
    activeLogicChanged: "No",
  },
  {
    area: "Telegram WebView/startapp links",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner must check startapp/deep-link links on real Telegram WebView before launch.",
    ownerAction: "Record parameter, route, screenshot, and any fallback behavior.",
    activeLogicChanged: "No",
  },
  {
    area: "owner decision status",
    status: "BLOCKED",
    detail: "Owner decision remains required and public launch is not approved.",
    ownerAction: "Owner records explicit go/no-go outside this static package.",
    activeLogicChanged: "No",
  },
] as const;

const safetyNotes = [
  "Active CTA logic was not changed.",
  "No publish scripts changed.",
  "No Telegram messages were sent.",
  "Owner review required.",
  "Public launch not approved.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "content/CTA owner review",
  "Telegram WebView/startapp manual QA",
  "real-device screenshots",
  "owner explicit approval",
] as const;

export function getAphroditeContentCtaOwnerReviewGate(): AphroditeContentCtaOwnerReviewGateModel {
  return {
    packageNumber: 233,
    title: APHRODITE_CONTENT_CTA_OWNER_REVIEW_GATE_TITLE,
    route: APHRODITE_CONTENT_CTA_OWNER_REVIEW_GATE_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    items: items.map((item) => ({ ...item })),
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
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
      cronWorkflowPublishChanged: false,
      publishScriptsChanged: false,
      secretsAdded: false,
      productionDbConnected: false,
    },
  };
}
