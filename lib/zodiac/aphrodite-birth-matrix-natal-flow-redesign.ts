/**
 * Package 240: Aphrodite Birth Matrix / Natal Flow Redesign.
 *
 * User-facing visual/UX redesign for the Birth Matrix / Natal / birth profile
 * flow only. This model documents what changed and what stayed locked:
 * matrix/natal calculations, zodiac sign logic, birth-date parsing/validation,
 * Package 224 live date formatting, active CTA destinations, payments, VIP
 * unlock, Telegram, database, cron/workflows, publish scripts, secrets, and
 * launch flags were not changed.
 */

export type AphroditeBirthMatrixNatalStatus =
  | "PASS"
  | "READY"
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED";

export type AphroditeBirthMatrixNatalRow = {
  area: string;
  status: AphroditeBirthMatrixNatalStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeBirthMatrixNatalFlowRedesignModel = {
  packageNumber: 240;
  title: string;
  route: "/dashboard/networks/zodiac/birth-matrix-natal-flow-redesign";
  liveRoutes: readonly string[];
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  redesignedSections: readonly AphroditeBirthMatrixNatalRow[];
  birthMatrixInputPrinciples: readonly AphroditeBirthMatrixNatalRow[];
  natalResultPresentationPrinciples: readonly AphroditeBirthMatrixNatalRow[];
  energyCardPrinciples: readonly AphroditeBirthMatrixNatalRow[];
  personalReportPrinciples: readonly AphroditeBirthMatrixNatalRow[];
  vipLockedPreviewPrinciples: readonly AphroditeBirthMatrixNatalRow[];
  mobileBreakpoints: readonly string[];
  telegramWebViewRules: readonly AphroditeBirthMatrixNatalRow[];
  safetyBoundaries: readonly string[];
  whatWasNotChanged: readonly AphroditeBirthMatrixNatalRow[];
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
    birthMatrixNatalCalculationChanged: false;
    zodiacSignLogicChanged: false;
    birthDateParsingValidationChanged: false;
    package224DateFormattingBroken: false;
    compatibilityFlowRedesignedAgain: false;
    mysticCardsFlowRedesigned: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
  };
};

export const APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_TITLE =
  "Birth Matrix / Natal Flow Redesign";

export const APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_ROUTE =
  "/dashboard/networks/zodiac/birth-matrix-natal-flow-redesign" as const;

const redesignedSections: readonly AphroditeBirthMatrixNatalRow[] = [
  {
    area: "birth-date / birth data input",
    status: "READY",
    detail:
      "The Birth Matrix and VIP Natal inputs now frame the existing date field as a personal birth profile setup with clearer value preview, premium glass cards, and explicit privacy copy.",
    ownerAction: "Verify 15.06.1998, 01.01.1990, and 01012000 live formatting on mobile and Telegram WebView.",
  },
  {
    area: "what user gets",
    status: "READY",
    detail:
      "The flow explains the user will receive a personal energy report: life path, soul, realization, relationship number, character, risks, purpose, money, relationships, and a next step.",
    ownerAction: "Owner should confirm product wording is premium, mystical, personal, and not cheap horoscope spam.",
  },
  {
    area: "result visual structure",
    status: "PASS",
    detail:
      "Existing Birth Matrix and Natal result data now render through clearer hero, metric, section, and report card hierarchy without changing the underlying calculations.",
    ownerAction: "Compare screenshots at 360px, 390px, 430px, and desktop.",
  },
  {
    area: "personal energy / matrix / natal sections",
    status: "PASS",
    detail:
      "The UI highlights personal energy, matrix metrics, natal profile sections, strengths, risks, purpose, relationships, money, growth, and today action where existing data already exists.",
    ownerAction: "Manual content review remains required before launch.",
  },
  {
    area: "VIP/Pro locked preview",
    status: "BLOCKED",
    detail:
      "The redesigned flow includes preview-only Pro cards that tease deeper cycles, money, relationships, mission, and natal layers while stating no active payment, no entitlement, and no real VIP unlock.",
    ownerAction: "Do not activate payment or VIP access until a separate owner-approved package.",
  },
];

const birthMatrixInputPrinciples: readonly AphroditeBirthMatrixNatalRow[] = [
  {
    area: "Package 224 date formatting",
    status: "PASS",
    detail:
      "The flow continues to use ZodiacDateInput and Package 224 live formatting behavior, including 01012000 -> 01.01.2000.",
    ownerAction: "Keep miniapp smoke green after deploy.",
  },
  {
    area: "birth date scope markers",
    status: "PASS",
    detail:
      "Birth Matrix keeps birthDateScope=\"birth-matrix\" and birthDateScope=\"miniapp-matrix\"; VIP Natal keeps birthDateScope=\"vip-natal\".",
    ownerAction: "Use route/scope QA if a real-device screenshot shows an old input.",
  },
  {
    area: "date parsing and validation",
    status: "PASS",
    detail:
      "parseBirthDateInput, sanitizeBirthDateInputDraft, normalizeBirthDateInputDisplay, and ZodiacDateInput were not changed.",
    ownerAction: "Any future parsing behavior change must be a separate hotfix.",
  },
];

const natalResultPresentationPrinciples: readonly AphroditeBirthMatrixNatalRow[] = [
  {
    area: "natal input explainer",
    status: "READY",
    detail:
      "The VIP Natal screen now explains what sign, birth date, optional birth time, and optional city contribute to the existing report.",
    ownerAction: "Check that optional fields are understandable on Telegram mobile keyboards.",
  },
  {
    area: "natal report hierarchy",
    status: "PASS",
    detail:
      "The existing result still uses buildNatalBlocks, NatalChartVisual, NatalResultTabs, and NatalSectionPanel, now wrapped in a report marker for Package 240 QA.",
    ownerAction: "Open each natal tab during manual QA.",
  },
  {
    area: "personal report categories",
    status: "PASS",
    detail:
      "Natal result categories remain character, relationships, money, growth, and today; the package adds visual clarity, not new astrology logic.",
    ownerAction: "Owner content review should verify tone and section naming.",
  },
];

const energyCardPrinciples: readonly AphroditeBirthMatrixNatalRow[] = [
  {
    area: "matrix metrics",
    status: "PASS",
    detail:
      "Life path, soul, realization, and relationship numbers are rendered as premium energy cards using the Aphrodite metric primitive.",
    ownerAction: "Check that values remain readable at 360px and 390px.",
  },
  {
    area: "shareable visual feel",
    status: "READY",
    detail:
      "The matrix hero uses rose/violet/gold depth so a result screenshot feels polished and personal without exposing raw birth data.",
    ownerAction: "Capture manual screenshots before launch.",
  },
];

const personalReportPrinciples: readonly AphroditeBirthMatrixNatalRow[] = [
  {
    area: "strengths / risks / purpose",
    status: "PASS",
    detail:
      "Existing matrix section data is surfaced as strengths, risks and shadow, and purpose cards without changing generateBirthMatrix.",
    ownerAction: "Verify Russian text wrapping with long result bodies.",
  },
  {
    area: "relationships and money",
    status: "PASS",
    detail:
      "Birth Matrix sections and VIP Natal tabs retain existing relationship and money content where the current data model already provides it.",
    ownerAction: "Manual owner review remains required.",
  },
  {
    area: "safe symbolic framing",
    status: "DOCUMENTED",
    detail:
      "The flow keeps non-fatalistic wording and clarifies the report is a reflection tool, not a deterministic promise.",
    ownerAction: "Keep this tone in future copy polish.",
  },
];

const vipLockedPreviewPrinciples: readonly AphroditeBirthMatrixNatalRow[] = [
  {
    area: "preview only locked state",
    status: "BLOCKED",
    detail:
      "The Pro preview states preview only, no active payment, no entitlement, no real VIP unlock.",
    ownerAction: "Keep locked until a separate payment/VIP package is approved.",
  },
  {
    area: "premium value tease",
    status: "DOCUMENTED",
    detail:
      "The preview teases cycles, money, relationships, mission, practices, and natal-to-matrix connection without granting access.",
    ownerAction: "Review monetization copy later without enabling payment here.",
  },
];

const telegramWebViewRules: readonly AphroditeBirthMatrixNatalRow[] = [
  {
    area: "360px / 390px / 430px",
    status: "MANUAL REQUIRED",
    detail:
      "Cards are stacked, touch targets remain large, and long Russian copy is contained inside glass surfaces.",
    ownerAction: "Capture real-device screenshots at target widths.",
  },
  {
    area: "Telegram keyboard and safe area",
    status: "MANUAL REQUIRED",
    detail:
      "Date, time, name, and city inputs remain in the normal document flow so Telegram WebView keyboard behavior can be checked manually.",
    ownerAction: "Run Telegram iOS WebView and Telegram Android WebView QA.",
  },
  {
    area: "browser fallback",
    status: "DOCUMENTED",
    detail:
      "The flow stays usable in a regular browser; missing Telegram startapp data in browser mode is not a visual failure.",
    ownerAction: "Use the existing Telegram WebView manual QA protocol.",
  },
];

const whatWasNotChanged: readonly AphroditeBirthMatrixNatalRow[] = [
  {
    area: "Birth Matrix/Natal calculation logic unchanged",
    status: "PASS",
    detail:
      "calculateMockBirthMatrix, generateBirthMatrix, buildNatalBlocks, natal result section builders, and existing visual chart generation logic were not changed.",
    ownerAction: "Any future calculation change needs a separate non-visual package.",
  },
  {
    area: "birth-date parsing/validation unchanged",
    status: "PASS",
    detail:
      "parseBirthDateInput, sanitizeBirthDateInputDraft, normalizeBirthDateInputDisplay, ZodiacDateInput, and Package 224 date formatting were not changed.",
    ownerAction: "Keep Package 224 smoke coverage green.",
  },
  {
    area: "zodiac sign logic unchanged",
    status: "PASS",
    detail:
      "signFromBirthDate, sign selection, and sign detection behavior were not changed.",
    ownerAction: "Run autosign checks after deployment.",
  },
  {
    area: "active CTA logic unchanged",
    status: "PASS",
    detail:
      "Save, share, back, reset, and Mini App navigation handlers remain existing safe handlers.",
    ownerAction: "Owner content/CTA review still required.",
  },
  {
    area: "Compatibility flow not redesigned again",
    status: "DOCUMENTED",
    detail: "Package 239 compatibility redesign was not expanded or reworked in Package 240.",
    ownerAction: "Keep Package 241 focused on Mystic Cards only if approved.",
  },
  {
    area: "Mystic Cards flow not redesigned",
    status: "DOCUMENTED",
    detail: "Tarot, runes, and mystic cards are intentionally out of scope for Package 240.",
    ownerAction: "Do not start Mystic Cards redesign in this run.",
  },
];

const safetyBoundaries = [
  "Do not start Package 241.",
  "Do not change Birth Matrix/Natal calculation logic.",
  "Do not change zodiac sign logic.",
  "Do not change birth-date parsing/validation logic.",
  "Do not break Package 224 date formatting.",
  "Do not change active CTA destinations.",
  "Do not redesign compatibility flow again.",
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
  "Birth Matrix / Natal visual/UX redesign only.",
  "No production launch.",
  "No Telegram API.",
  "No messages sent.",
  "No BotFather changes.",
  "No active CTA logic change.",
  "No DB write added.",
  "No external analytics added.",
  "No payment added.",
  "No VIP unlock added.",
  "Birth Matrix/Natal calculation logic unchanged.",
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

export function getAphroditeBirthMatrixNatalFlowRedesign(): AphroditeBirthMatrixNatalFlowRedesignModel {
  return {
    packageNumber: 240,
    title: APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_TITLE,
    route: APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_ROUTE,
    liveRoutes: ["/birth-matrix", "/miniapp -> Birth Matrix / Матрица судьбы", "/miniapp -> VIP Natal Chart"],
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    redesignedSections: redesignedSections.map((item) => ({ ...item })),
    birthMatrixInputPrinciples: birthMatrixInputPrinciples.map((item) => ({ ...item })),
    natalResultPresentationPrinciples: natalResultPresentationPrinciples.map((item) => ({ ...item })),
    energyCardPrinciples: energyCardPrinciples.map((item) => ({ ...item })),
    personalReportPrinciples: personalReportPrinciples.map((item) => ({ ...item })),
    vipLockedPreviewPrinciples: vipLockedPreviewPrinciples.map((item) => ({ ...item })),
    mobileBreakpoints: ["360px", "390px", "430px", "desktop"],
    telegramWebViewRules: telegramWebViewRules.map((item) => ({ ...item })),
    safetyBoundaries: [...safetyBoundaries],
    whatWasNotChanged: whatWasNotChanged.map((item) => ({ ...item })),
    nextPackageRecommendation: "Package 241 - Mystic Cards Redesign",
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      appFlowsChanged: false,
      birthMatrixNatalCalculationChanged: false,
      zodiacSignLogicChanged: false,
      birthDateParsingValidationChanged: false,
      package224DateFormattingBroken: false,
      compatibilityFlowRedesignedAgain: false,
      mysticCardsFlowRedesigned: false,
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
