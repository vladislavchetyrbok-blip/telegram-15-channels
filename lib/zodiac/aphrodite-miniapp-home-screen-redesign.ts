/**
 * Package 238: Aphrodite Mini App Home Screen Redesign.
 *
 * User-facing visual redesign for the Mini App home/entry screen only. It
 * applies the Package 237 Aphrodite design system to /miniapp and the live
 * /compatibility home panel without changing app flows, active CTA logic,
 * Telegram, payments, VIP unlock, database writes, cron/workflows, publish
 * scripts, secrets, or public launch flags.
 */

export type AphroditeMiniappHomeStatus =
  | "PASS"
  | "READY"
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED";

export type AphroditeMiniappHomeRow = {
  area: string;
  status: AphroditeMiniappHomeStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeMiniappHomeCta = {
  label: string;
  destination: string;
  status: AphroditeMiniappHomeStatus;
  detail: string;
  activeLogicChanged: false;
};

export type AphroditeMiniappHomeScreenRedesignModel = {
  packageNumber: 238;
  title: string;
  route: "/dashboard/networks/zodiac/miniapp-home-screen-redesign";
  redesignedRoutes: readonly string[];
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  redesignedSections: readonly AphroditeMiniappHomeRow[];
  primaryCTA: AphroditeMiniappHomeCta;
  secondaryCTAs: readonly AphroditeMiniappHomeCta[];
  visualPrinciplesApplied: readonly AphroditeMiniappHomeRow[];
  mobileBreakpoints: readonly string[];
  safetyBoundaries: readonly string[];
  whatWasNotChanged: readonly AphroditeMiniappHomeRow[];
  nextPackageRecommendation: string;
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    appFlowsChanged: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
  };
};

export const APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_TITLE =
  "Mini App Home Screen Redesign";

export const APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_ROUTE =
  "/dashboard/networks/zodiac/miniapp-home-screen-redesign" as const;

const redesignedSections: readonly AphroditeMiniappHomeRow[] = [
  {
    area: "premium hero",
    status: "READY",
    detail:
      "The home screen now opens with Aphrodite, premium mystical romantic mood, short emotional headline, and dark cosmic rose/violet/gold depth.",
    ownerAction: "Verify first viewport on 360px, 390px, 430px, desktop, and Telegram WebView.",
  },
  {
    area: "short emotional headline/subheadline",
    status: "READY",
    detail:
      "Hero copy explains compatibility, Birth Matrix, and Mystic Cards in calm relationship language without cheap horoscope spam.",
    ownerAction: "Owner should confirm the final Russian tone before soft launch.",
  },
  {
    area: "primary compatibility CTA",
    status: "PASS",
    detail:
      "Primary CTA remains a safe route into existing compatibility flow; active CTA logic was not changed.",
    ownerAction: "Check the button opens the same compatibility flow in browser and Telegram WebView.",
  },
  {
    area: "secondary Birth Matrix and Mystic Cards CTAs",
    status: "PASS",
    detail:
      "Secondary CTAs point to existing safe flows and keep a lower visual priority than compatibility.",
    ownerAction: "Verify date input and Mystic Cards manually in later visual packages.",
  },
  {
    area: "VIP locked preview",
    status: "BLOCKED",
    detail:
      "VIP preview creates desire with a gold locked state while explicitly stating no active payment and no VIP unlock.",
    ownerAction: "Do not connect payment or entitlement until the owner explicitly starts a payment/VIP package.",
  },
  {
    area: "daily/mystic teaser",
    status: "READY",
    detail:
      "Home includes a calm daily/love teaser and a mystic card preview using Package 237 design primitives.",
    ownerAction: "Verify Russian wrapping on mobile widths.",
  },
  {
    area: "trust/safety microcopy",
    status: "READY",
    detail:
      "The screen states no active payment, no VIP unlock, no Telegram API, no DB write, publicLaunchApproved=false, and ownerManualReviewRequired=true.",
    ownerAction: "Keep these safety notes visible until launch approval is granted manually.",
  },
  {
    area: "Telegram WebView safe-area spacing",
    status: "DOCUMENTED",
    detail:
      "Bottom spacing uses safe-area-aware padding and avoids placing critical CTAs under Telegram/iOS chrome.",
    ownerAction: "Manual real-device QA still required.",
  },
];

const visualPrinciplesApplied: readonly AphroditeMiniappHomeRow[] = [
  {
    area: "premium mystical romantic modern",
    status: "PASS",
    detail:
      "The design uses a dark cosmic base, glass-like cards, soft violet/rose/gold accents, and clean CTA hierarchy.",
    ownerAction: "Use this as the visual baseline for Package 239.",
  },
  {
    area: "mobile-first",
    status: "PASS",
    detail:
      "Layout is stacked and compact by default, with min-[390px] two-column affordances only where text remains readable.",
    ownerAction: "Confirm screenshots at 360px, 390px, and 430px.",
  },
  {
    area: "not childish / not casino / not cheap horoscope spam",
    status: "DOCUMENTED",
    detail:
      "Copy avoids fake urgency, fear, gambling-like visuals, and noisy hero clutter.",
    ownerAction: "Reject future visual changes that make the product feel manipulative.",
  },
  {
    area: "result and preview cards",
    status: "READY",
    detail:
      "Love teaser, Mystic Cards preview, and VIP locked preview use shareable card language without activating locked access.",
    ownerAction: "Result/share card package remains separate.",
  },
];

const secondaryCTAs: readonly AphroditeMiniappHomeCta[] = [
  {
    label: "Матрица судьбы",
    destination: "/birth-matrix",
    status: "PASS",
    detail: "Existing Birth Matrix route is surfaced as a secondary CTA.",
    activeLogicChanged: false,
  },
  {
    label: "Мистическая карта",
    destination: "/compatibility?startapp=mystic",
    status: "PASS",
    detail: "Existing Mini App Mystic Cards flow is surfaced without changing routing behavior.",
    activeLogicChanged: false,
  },
];

const whatWasNotChanged: readonly AphroditeMiniappHomeRow[] = [
  {
    area: "Compatibility flow internals",
    status: "DOCUMENTED",
    detail: "Package 238 only changes the home/entry visual layer. Package 239 is the recommended next flow redesign.",
    ownerAction: "Do not treat this as compatibility result redesign.",
  },
  {
    area: "Birth Matrix flow",
    status: "DOCUMENTED",
    detail: "Birth Matrix calculations and date input behavior were not changed.",
    ownerAction: "Keep Package 240 separate.",
  },
  {
    area: "Mystic Cards flow",
    status: "DOCUMENTED",
    detail: "Mystic Cards content and interactions were not changed beyond home entry presentation.",
    ownerAction: "Keep Package 241 separate.",
  },
  {
    area: "active CTA logic",
    status: "PASS",
    detail: "Links/buttons continue to open existing safe routes; active CTA logic was not changed.",
    ownerAction: "Review final CTA wording manually before launch.",
  },
  {
    area: "public launch flags",
    status: "BLOCKED",
    detail: "publicLaunchApproved=false and ownerManualReviewRequired=true remain unchanged.",
    ownerAction: "Owner approval is still required before any launch.",
  },
];

const safetyBoundaries = [
  "Do not start Package 239.",
  "Do not change active CTA logic.",
  "Do not change app flows.",
  "Do not add payments.",
  "Do not unlock VIP.",
  "Do not use Telegram API.",
  "Do not send Telegram messages.",
  "Do not add DB writes.",
  "Do not add external analytics.",
  "Do not change cron/workflows/publish scripts.",
  "Do not add secrets.",
  "Do not change public launch flags.",
] as const;

const safetyNotes = [
  "Home screen visual redesign only.",
  "No production launch.",
  "No Telegram API.",
  "No messages sent.",
  "No BotFather changes.",
  "No active CTA logic change.",
  "No DB write added.",
  "No external analytics added.",
  "No payment added.",
  "No VIP unlock added.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "DATABASE_URL manual configuration",
  "TELEGRAM_BOT_TOKEN manual configuration",
  "backup freshness <24h",
  "restore rehearsal",
  "real-device QA manual execution",
  "Telegram WebView/startapp manual QA",
  "content/CTA owner review",
  "owner explicit approval",
] as const;

export function getAphroditeMiniappHomeScreenRedesign(): AphroditeMiniappHomeScreenRedesignModel {
  return {
    packageNumber: 238,
    title: APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_TITLE,
    route: APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_ROUTE,
    redesignedRoutes: ["/miniapp", "/compatibility home panel"],
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    redesignedSections: redesignedSections.map((item) => ({ ...item })),
    primaryCTA: {
      label: "Проверить совместимость",
      destination: "/compatibility?startapp=compat_love",
      status: "PASS",
      detail: "Primary home CTA opens the existing compatibility flow.",
      activeLogicChanged: false,
    },
    secondaryCTAs: secondaryCTAs.map((item) => ({ ...item })),
    visualPrinciplesApplied: visualPrinciplesApplied.map((item) => ({ ...item })),
    mobileBreakpoints: ["360px", "390px", "430px", "desktop"],
    safetyBoundaries: [...safetyBoundaries],
    whatWasNotChanged: whatWasNotChanged.map((item) => ({ ...item })),
    nextPackageRecommendation: "Package 239 - Compatibility Flow Redesign",
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      appFlowsChanged: false,
      databaseWriteAdded: false,
      externalAnalyticsAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      cronWorkflowPublishChanged: false,
      secretsAdded: false,
      productionDbConnected: false,
    },
  };
}
