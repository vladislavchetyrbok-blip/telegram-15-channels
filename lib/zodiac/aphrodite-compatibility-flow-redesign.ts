/**
 * Package 239: Aphrodite Compatibility Flow Redesign.
 *
 * User-facing visual/UX redesign for the compatibility flow only. This model
 * documents what changed and what stayed locked: compatibility calculation,
 * zodiac sign logic, birth-date parsing/validation/formatting, active CTA
 * destinations, payments, VIP unlock, Telegram, database, cron/workflows,
 * publish scripts, secrets, and launch flags were not changed.
 */

export type AphroditeCompatibilityRedesignStatus =
  | "PASS"
  | "READY"
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED";

export type AphroditeCompatibilityRedesignRow = {
  area: string;
  status: AphroditeCompatibilityRedesignStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeCompatibilityFlowRedesignModel = {
  packageNumber: 239;
  title: string;
  route: "/dashboard/networks/zodiac/compatibility-flow-redesign";
  liveRoutes: readonly string[];
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  redesignedSections: readonly AphroditeCompatibilityRedesignRow[];
  compatibilityInputPrinciples: readonly AphroditeCompatibilityRedesignRow[];
  resultPresentationPrinciples: readonly AphroditeCompatibilityRedesignRow[];
  scoreCardPrinciples: readonly AphroditeCompatibilityRedesignRow[];
  shareableResultPrinciples: readonly AphroditeCompatibilityRedesignRow[];
  vipLockedPreviewPrinciples: readonly AphroditeCompatibilityRedesignRow[];
  mobileBreakpoints: readonly string[];
  telegramWebViewRules: readonly AphroditeCompatibilityRedesignRow[];
  safetyBoundaries: readonly string[];
  whatWasNotChanged: readonly AphroditeCompatibilityRedesignRow[];
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
    compatibilityCalculationChanged: false;
    zodiacSignLogicChanged: false;
    birthDateParsingValidationChanged: false;
    package224DateFormattingBroken: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
  };
};

export const APHRODITE_COMPATIBILITY_FLOW_REDESIGN_TITLE =
  "Compatibility Flow Redesign";

export const APHRODITE_COMPATIBILITY_FLOW_REDESIGN_ROUTE =
  "/dashboard/networks/zodiac/compatibility-flow-redesign" as const;

const redesignedSections: readonly AphroditeCompatibilityRedesignRow[] = [
  {
    area: "two-person input flow",
    status: "READY",
    detail:
      "The compatibility flow now frames the form as a two-person relationship check with a premium glass container, clearer step progress, readable person panels, and short emotional helper copy.",
    ownerAction: "Verify that both person panels remain easy to complete at 360px, 390px, 430px, Telegram WebView, and desktop.",
  },
  {
    area: "mode and relationship selectors",
    status: "READY",
    detail:
      "Mode and relationship selectors use calmer rose/violet/gold active states with stronger touch targets and less technical visual density.",
    ownerAction: "Owner should confirm that selector labels still match the intended product language.",
  },
  {
    area: "result hero and score card",
    status: "PASS",
    detail:
      "The result presentation keeps the existing compatibility score and relationship type while making the score card more premium, romantic, and screenshot-friendly.",
    ownerAction: "Compare a real pair result before launch and confirm the score remains understandable.",
  },
  {
    area: "strengths risks advice next action",
    status: "PASS",
    detail:
      "Existing result data is presented in clearer blocks for overview, strengths, risks, communication advice, 30-day rhythm, message helper, and today's action.",
    ownerAction: "Manual content/CTA review remains required before soft launch.",
  },
  {
    area: "VIP locked preview",
    status: "BLOCKED",
    detail:
      "A compatibility-context locked preview now teases Full compatibility report, emotional dynamics, conflict risks, love calendar, and Birth Matrix connection while stating preview only, no active payment, and no real VIP unlock.",
    ownerAction: "Do not activate payment, entitlement, or VIP access until a separate approved payment/VIP package.",
  },
];

const compatibilityInputPrinciples: readonly AphroditeCompatibilityRedesignRow[] = [
  {
    area: "date input safety",
    status: "PASS",
    detail:
      "The compatibility flow continues to use the existing ZodiacDateInput and Package 224 live formatting behavior, including digit formatting such as 01012000 -> 01.01.2000.",
    ownerAction: "Run miniapp smoke and manual date-entry checks after deployment.",
  },
  {
    area: "auto-sign behavior",
    status: "PASS",
    detail:
      "Birth-date autosign remains connected to the existing parsing helper and the compatibility birth-date scope; zodiac sign logic was not changed.",
    ownerAction: "Check that 15.06.1998 and 01.01.1990 still auto-detect expected signs.",
  },
  {
    area: "mobile-first form rhythm",
    status: "READY",
    detail:
      "Inputs stay stacked and readable on Telegram WebView; optional precise fields remain hidden unless the existing precise mode is chosen.",
    ownerAction: "Verify keyboard state on iOS and Android Telegram WebView manually.",
  },
];

const resultPresentationPrinciples: readonly AphroditeCompatibilityRedesignRow[] = [
  {
    area: "relationship type",
    status: "PASS",
    detail:
      "The result still displays the existing relationshipModeLabel and modeLabel, now inside a more polished visual hierarchy.",
    ownerAction: "Owner review should confirm the tone is premium and not cheap horoscope spam.",
  },
  {
    area: "existing result data only",
    status: "PASS",
    detail:
      "No new compatibility calculation was added; the UI uses existing result.scores, result text, personalizedCopy, and couple advice.",
    ownerAction: "Keep calculation changes out of visual packages.",
  },
  {
    area: "result navigation",
    status: "READY",
    detail:
      "The result keeps the existing overview, strengths, risks, communication, 30 days, message, and action anchors while making the card stack easier to scan.",
    ownerAction: "Check long Russian text wrapping in every result section.",
  },
];

const scoreCardPrinciples: readonly AphroditeCompatibilityRedesignRow[] = [
  {
    area: "score percent",
    status: "PASS",
    detail:
      "The percent score is still the existing result.scores.total value and is now framed as a calm romantic metric, not a casino-like progress reward.",
    ownerAction: "Confirm score ring readability on small screens.",
  },
  {
    area: "subscores",
    status: "PASS",
    detail:
      "Love, communication, and household rhythm remain existing subscores and keep the same semantics.",
    ownerAction: "Check that labels and progress bars do not overflow on 360px.",
  },
];

const shareableResultPrinciples: readonly AphroditeCompatibilityRedesignRow[] = [
  {
    area: "shareable result feeling",
    status: "READY",
    detail:
      "The top result card uses a premium rose/violet/gold surface and compact score hierarchy so a result screenshot feels polished without leaking raw birth data.",
    ownerAction: "Manual real-device screenshot QA remains required.",
  },
  {
    area: "safe share CTA",
    status: "PASS",
    detail:
      "Existing save/share handlers remain unchanged; active CTA logic and destinations were not changed.",
    ownerAction: "Verify share text still uses the safe startapp link and no raw birth data.",
  },
];

const vipLockedPreviewPrinciples: readonly AphroditeCompatibilityRedesignRow[] = [
  {
    area: "preview only locked state",
    status: "BLOCKED",
    detail:
      "The locked preview is presentational only and includes the wording preview only, no active payment, no real VIP unlock, entitlement unchanged.",
    ownerAction: "Keep this locked until owner explicitly starts a VIP/payment package.",
  },
  {
    area: "premium value tease",
    status: "DOCUMENTED",
    detail:
      "The preview lists Full compatibility report, Emotional dynamics, Conflict risks, Love calendar, and Birth Matrix connection without granting access.",
    ownerAction: "Review future paywall copy separately.",
  },
];

const telegramWebViewRules: readonly AphroditeCompatibilityRedesignRow[] = [
  {
    area: "360px / 390px / 430px",
    status: "MANUAL REQUIRED",
    detail:
      "The flow is mobile-first and avoids horizontal scroll, tiny buttons, and dense pre-CTA paragraphs at the target widths.",
    ownerAction: "Capture real-device screenshots before soft launch.",
  },
  {
    area: "Telegram keyboard and safe area",
    status: "MANUAL REQUIRED",
    detail:
      "Inputs and CTAs remain in the normal document flow so Telegram keyboard and safe-area behavior can be checked manually.",
    ownerAction: "Run Telegram iOS WebView and Telegram Android WebView QA.",
  },
  {
    area: "browser fallback",
    status: "DOCUMENTED",
    detail:
      "The visual flow remains usable in a normal browser; missing Telegram startapp data in browser mode is not a design failure.",
    ownerAction: "Use the existing Telegram WebView manual QA protocol.",
  },
];

const whatWasNotChanged: readonly AphroditeCompatibilityRedesignRow[] = [
  {
    area: "compatibility calculation logic unchanged",
    status: "PASS",
    detail:
      "buildCompatibilityResult, score formulas, result data semantics, and personalized compatibility copy generation were not changed.",
    ownerAction: "Any future calculation change needs a separate non-visual package.",
  },
  {
    area: "birth-date parsing/validation unchanged",
    status: "PASS",
    detail:
      "parseBirthDateInput, normalizeBirthDateInputDisplay, ZodiacDateInput, and Package 224 date formatting were not changed.",
    ownerAction: "Keep Package 224 smoke coverage green.",
  },
  {
    area: "zodiac sign logic unchanged",
    status: "PASS",
    detail:
      "signFromDate and sign selection rules were not changed.",
    ownerAction: "Re-run autosign checks after deployment.",
  },
  {
    area: "active CTA logic unchanged",
    status: "PASS",
    detail:
      "Save/share/back/reset and Mini App navigation handlers remain existing safe handlers.",
    ownerAction: "Owner content/CTA review still required.",
  },
  {
    area: "Birth Matrix flow",
    status: "DOCUMENTED",
    detail: "Birth Matrix / Natal redesign is intentionally not included in Package 239.",
    ownerAction: "Keep Package 240 separate.",
  },
  {
    area: "Mystic Cards flow",
    status: "DOCUMENTED",
    detail: "Mystic Cards redesign is intentionally not included in Package 239.",
    ownerAction: "Do not start Mystic redesign in this run.",
  },
];

const safetyBoundaries = [
  "Do not start Package 240.",
  "Do not change compatibility calculation logic.",
  "Do not change zodiac sign logic.",
  "Do not change birth-date parsing/validation logic.",
  "Do not break Package 224 date formatting.",
  "Do not change active CTA destinations.",
  "Do not redesign Birth Matrix flow yet.",
  "Do not redesign Mystic Cards flow yet.",
  "Do not add real payment CTA.",
  "Do not add Telegram invoice.",
  "Do not unlock VIP.",
  "Do not add entitlement bypass.",
  "Do not use Telegram API.",
  "Do not send messages.",
  "Do not change BotFather.",
  "Do not add DB writes.",
  "Do not add external analytics.",
  "Do not change cron/workflows/publish scripts.",
  "Do not add real secrets.",
  "Do not connect to production DB.",
  "Do not set publicLaunchApproved=true.",
  "Do not set ownerManualReviewRequired=false.",
] as const;

const safetyNotes = [
  "Compatibility visual/UX redesign only.",
  "No production launch.",
  "No Telegram API.",
  "No messages sent.",
  "No BotFather changes.",
  "No active CTA logic change.",
  "No DB write added.",
  "No external analytics added.",
  "No payment added.",
  "No VIP unlock added.",
  "Compatibility calculation logic unchanged.",
  "Date formatting unchanged.",
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

export function getAphroditeCompatibilityFlowRedesign(): AphroditeCompatibilityFlowRedesignModel {
  return {
    packageNumber: 239,
    title: APHRODITE_COMPATIBILITY_FLOW_REDESIGN_TITLE,
    route: APHRODITE_COMPATIBILITY_FLOW_REDESIGN_ROUTE,
    liveRoutes: ["/compatibility", "/miniapp -> Compatibility"],
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    redesignedSections: redesignedSections.map((item) => ({ ...item })),
    compatibilityInputPrinciples: compatibilityInputPrinciples.map((item) => ({ ...item })),
    resultPresentationPrinciples: resultPresentationPrinciples.map((item) => ({ ...item })),
    scoreCardPrinciples: scoreCardPrinciples.map((item) => ({ ...item })),
    shareableResultPrinciples: shareableResultPrinciples.map((item) => ({ ...item })),
    vipLockedPreviewPrinciples: vipLockedPreviewPrinciples.map((item) => ({ ...item })),
    mobileBreakpoints: ["360px", "390px", "430px", "desktop"],
    telegramWebViewRules: telegramWebViewRules.map((item) => ({ ...item })),
    safetyBoundaries: [...safetyBoundaries],
    whatWasNotChanged: whatWasNotChanged.map((item) => ({ ...item })),
    nextPackageRecommendation: "Package 240 - Birth Matrix / Natal Flow Redesign",
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      appFlowsChanged: false,
      compatibilityCalculationChanged: false,
      zodiacSignLogicChanged: false,
      birthDateParsingValidationChanged: false,
      package224DateFormattingBroken: false,
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
