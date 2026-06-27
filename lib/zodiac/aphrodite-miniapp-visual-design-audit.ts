/**
 * Package 236: Aphrodite Mini App Visual Design Audit.
 *
 * Static design-audit and design-direction layer only. It does not redesign
 * user-facing Mini App screens and does not perform production, Telegram,
 * database, payment, VIP, cron, workflow, publish, analytics, or secret work.
 */

export type AphroditeMiniAppVisualAuditStatus =
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED";

export type AphroditeMiniAppVisualAuditRow = {
  area: string;
  status: AphroditeMiniAppVisualAuditStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeMiniAppAuditedScreen = AphroditeMiniAppVisualAuditRow & {
  route: string;
  sourceFiles: readonly string[];
};

export type AphroditeMiniAppRedesignPackage = {
  packageNumber: number;
  title: string;
  scope: string;
  priority: "P0" | "P1" | "P2";
};

export type AphroditeMiniAppVisualDesignAuditModel = {
  packageNumber: 236;
  title: string;
  route: "/dashboard/networks/zodiac/aphrodite-miniapp-visual-design-audit";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  currentVisualStatus: readonly AphroditeMiniAppVisualAuditRow[];
  auditedScreens: readonly AphroditeMiniAppAuditedScreen[];
  designFindings: readonly AphroditeMiniAppVisualAuditRow[];
  visualRisks: readonly AphroditeMiniAppVisualAuditRow[];
  recommendedDesignPrinciples: readonly AphroditeMiniAppVisualAuditRow[];
  prioritizedRedesignPackages: readonly AphroditeMiniAppRedesignPackage[];
  mobileBreakpoints: readonly string[];
  safetyBoundaries: readonly string[];
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
    secretsAdded: false;
    productionDbConnected: false;
    miniAppScreensRedesigned: false;
  };
};

export const APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_TITLE =
  "Aphrodite Mini App Visual Design Audit";

export const APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_ROUTE =
  "/dashboard/networks/zodiac/aphrodite-miniapp-visual-design-audit" as const;

const currentVisualStatus: readonly AphroditeMiniAppVisualAuditRow[] = [
  {
    area: "Current Mini App visual status",
    status: "DOCUMENTED",
    detail: "The user-facing Mini App is functional and mobile-safe, but the visual system is still mostly dark utility cards with repeated borders, dense copy, and mixed premium signals.",
    ownerAction: "Use Package 237 to define a coherent Aphrodite design system before redesigning screens.",
  },
  {
    area: "Design phase boundary",
    status: "BLOCKED",
    detail: "Package 236 is an audit only; no Mini App screen redesign was performed.",
    ownerAction: "Approve Package 237 before implementation design tokens or screen changes.",
  },
  {
    area: "Mobile Telegram WebView fit",
    status: "MANUAL REQUIRED",
    detail: "The existing UI uses max-width mobile shells and safe-area aware bottom navigation, but 360-430px screenshots still need owner review for emotional first impression and text density.",
    ownerAction: "Capture 360px, 390px, and 430px Telegram WebView screenshots in Package 245.",
  },
];

const auditedScreens: readonly AphroditeMiniAppAuditedScreen[] = [
  {
    area: "Mini App home screen",
    route: "/miniapp and /compatibility home hub",
    sourceFiles: [
      "app/miniapp/page.tsx",
      "components/ZodiacCompatibilityMiniApp.tsx",
      "components/zodiac-mini-app/MainMenuSections.tsx",
      "components/zodiac-mini-app/AphroditeMiniAppShell.tsx",
    ],
    status: "DOCUMENTED",
    detail: "Home has clear modules and safe CTAs, but the first impression is more dashboard-like than romantic/premium; many cards compete equally for attention.",
    ownerAction: "Package 238 should create a stronger first viewport with one primary promise, one primary CTA, and a calmer module hierarchy.",
  },
  {
    area: "Compatibility input flow",
    route: "/compatibility?startapp=compat_love",
    sourceFiles: [
      "components/ZodiacCompatibilityMiniApp.tsx",
      "components/zodiac-mini-app/WizardControls.tsx",
      "components/zodiac-mini-app/ZodiacDateInput.tsx",
      "components/zodiac-mini-app/ZodiacSelect.tsx",
    ],
    status: "DOCUMENTED",
    detail: "The wizard is complete and safe, but the input flow has many controls and status elements; it needs clearer step focus and warmer relationship language.",
    ownerAction: "Package 239 should simplify the relationship wizard, clarify button hierarchy, and preserve the fixed birth-date text input.",
  },
  {
    area: "Compatibility result flow",
    route: "/compatibility result state",
    sourceFiles: [
      "components/zodiac-mini-app/ResultCards.tsx",
      "components/zodiac-mini-app/AstroChartVisual.tsx",
    ],
    status: "DOCUMENTED",
    detail: "Results include score, map, sections, save and share actions, but the page is long and dense; the strongest shareable result card is not yet the visual anchor.",
    ownerAction: "Package 243 should define compact result/share cards with a stronger hero summary and screenshot-friendly composition.",
  },
  {
    area: "Birth Matrix / Natal flow",
    route: "/birth-matrix and Mini App mystic birth matrix",
    sourceFiles: [
      "app/birth-matrix/BirthMatrixClient.tsx",
      "components/ZodiacMysticSections.tsx",
      "components/ZodiacVipSections.tsx",
      "components/zodiac-mini-app/BirthMatrixVisual.tsx",
      "components/zodiac-mini-app/NatalChartVisual.tsx",
    ],
    status: "DOCUMENTED",
    detail: "Birth Matrix and natal tools have safe date input and meaningful result blocks, but the visual identity should feel more personal, ritual-like, and premium.",
    ownerAction: "Package 240 should unify date-entry, natal visuals, and result hierarchy without changing parsing or data rules.",
  },
  {
    area: "Mystic Cards flow",
    route: "/compatibility mystic tab and /mystic-numbers",
    sourceFiles: [
      "components/ZodiacMysticSections.tsx",
      "components/zodiac-mini-app/AphroditeMysticUniversePanel.tsx",
      "components/zodiac-mini-app/TarotSpreadVisual.tsx",
      "components/zodiac-mini-app/RuneSpreadVisual.tsx",
      "components/zodiac-mini-app/LunarCalendarVisual.tsx",
    ],
    status: "DOCUMENTED",
    detail: "Mystic screens have real feature depth, but reveal moments, card states, and visual storytelling are still understated.",
    ownerAction: "Package 241 should add a polished reveal feeling with static/local UI only and no external assets.",
  },
  {
    area: "VIP locked / preview state",
    route: "/miniapp VIP preview, /vip-preview, /vip-compatibility-report",
    sourceFiles: [
      "app/miniapp/page.tsx",
      "app/vip-preview/page.tsx",
      "app/vip-compatibility-report/page.tsx",
      "app/vip-compatibility-report/VipCompatibilityReportClient.tsx",
      "components/ZodiacVipSections.tsx",
    ],
    status: "DOCUMENTED",
    detail: "VIP previews are explicit about no active payment, but the locked state should look desirable without implying paid access is live.",
    ownerAction: "Package 242 should build a beautiful locked preview, keep payment inactive, and avoid any entitlement unlock.",
  },
  {
    area: "Profile / History / Favorites",
    route: "/compatibility profile tab",
    sourceFiles: [
      "components/zodiac-mini-app/ProfileRetentionPanel.tsx",
      "components/zodiac-mini-app/retention.ts",
      "components/zodiac-mini-app/SoftLaunchFeedbackPanel.tsx",
    ],
    status: "DOCUMENTED",
    detail: "Profile, history, and favorites communicate local-only behavior, but empty states should become warmer and more action-oriented.",
    ownerAction: "Package 244 should polish Telegram WebView mobile utility states without adding remote sync or DB writes.",
  },
  {
    area: "Loading / empty / error states",
    route: "Mini App shared states",
    sourceFiles: [
      "components/zodiac-mini-app/ForecastCards.tsx",
      "components/zodiac-mini-app/ui-primitives.tsx",
      "components/zodiac-mini-app/ProfileRetentionPanel.tsx",
      "app/birth-matrix/BirthMatrixClient.tsx",
    ],
    status: "DOCUMENTED",
    detail: "States exist and are safe, but they read as functional placeholders; loading, empty, and error moments need branded microcopy and calmer spacing.",
    ownerAction: "Package 244 should standardize mobile-friendly state patterns after the design system is defined.",
  },
  {
    area: "CTA visibility and share/result cards",
    route: "All Mini App flows",
    sourceFiles: [
      "components/zodiac-mini-app/AphroditePrimaryCta.tsx",
      "components/zodiac-mini-app/ResultCards.tsx",
      "lib/zodiac-mini-app-share.ts",
    ],
    status: "DOCUMENTED",
    detail: "Primary actions exist, but share/result opportunities should become more visually memorable and easier to screenshot.",
    ownerAction: "Package 243 should define reusable shareable result cards and CTA placement rules.",
  },
];

const designFindings: readonly AphroditeMiniAppVisualAuditRow[] = [
  {
    area: "First impression",
    status: "DOCUMENTED",
    detail: "The app is coherent enough to use, but the first viewport does not yet feel like a polished relationship/astrology product.",
    ownerAction: "Make the first screen emotionally clear: one promise, one primary CTA, one trust note.",
  },
  {
    area: "Text density",
    status: "DOCUMENTED",
    detail: "Several screens rely on long explanatory paragraphs and many equally weighted cards, which can feel heavy inside a narrow Telegram WebView.",
    ownerAction: "Favor short emotional headers, compressed descriptions, and progressive detail below the fold.",
  },
  {
    area: "Button hierarchy",
    status: "DOCUMENTED",
    detail: "Primary, secondary, locked, save, share, and reset actions exist, but hierarchy should be more consistent across flows.",
    ownerAction: "Define CTA rules in Package 237 and apply them gradually in Packages 238-244.",
  },
  {
    area: "Premium / mystical feeling",
    status: "DOCUMENTED",
    detail: "The current dark-card language is safe but not yet distinctive enough; premium, mystical, romantic cues should be intentional rather than decorative noise.",
    ownerAction: "Use restrained cosmic depth, glass-like cards, gold/violet/rose accents, and strong result cards.",
  },
  {
    area: "Trust and confidence",
    status: "DOCUMENTED",
    detail: "Safety disclaimers are visible and useful, but they sometimes compete with the user journey instead of supporting it quietly.",
    ownerAction: "Keep safety visible but move repeated operational wording out of primary conversion zones.",
  },
];

const visualRisks: readonly AphroditeMiniAppVisualAuditRow[] = [
  {
    area: "One-note dark card system",
    status: "MANUAL REQUIRED",
    detail: "Many sections use similar dark cards, borders, and small text; users may not immediately know what is primary.",
    ownerAction: "Package 237 should define layout rhythm, depth levels, accent usage, and reusable card roles.",
  },
  {
    area: "Mojibake / encoding visibility risk",
    status: "OWNER REVIEW REQUIRED",
    detail: "Some source reads display mojibake in local terminal output; owner should verify deployed UI screenshots show correct Russian text.",
    ownerAction: "Include Russian text screenshot review in Package 245.",
  },
  {
    area: "Conversion clarity",
    status: "MANUAL REQUIRED",
    detail: "The next best action is sometimes split between module cards, bottom nav, save/share, reset, and locked previews.",
    ownerAction: "Each redesigned screen should define exactly one primary next action.",
  },
  {
    area: "VIP perception",
    status: "BLOCKED",
    detail: "VIP previews must look desirable, but payment and entitlement remain inactive by policy.",
    ownerAction: "Package 242 must keep no active payment and no VIP unlock.",
  },
];

const recommendedDesignPrinciples: readonly AphroditeMiniAppVisualAuditRow[] = [
  {
    area: "premium relationship astrology",
    status: "DOCUMENTED",
    detail: "Premium, mystical, romantic, modern, and emotionally calm; not childish, not casino, not cheap horoscope spam.",
    ownerAction: "Use this as the north star for Packages 237-245.",
  },
  {
    area: "mobile-first 360-430px",
    status: "DOCUMENTED",
    detail: "Every screen should be designed for 360px, 390px, and 430px Telegram WebView widths first.",
    ownerAction: "Package 245 should capture screenshots at all target widths.",
  },
  {
    area: "Telegram WebView safe-area friendly",
    status: "DOCUMENTED",
    detail: "Bottom navigation, sticky actions, keyboard states, and safe-area spacing must remain comfortable in Telegram.",
    ownerAction: "Package 244 should polish WebView-specific spacing and CTA placement.",
  },
  {
    area: "glass-like cards",
    status: "DOCUMENTED",
    detail: "Use restrained glass cards, subtle borders, and layered surfaces so information feels premium but still readable.",
    ownerAction: "Define reusable card levels in Package 237 before applying them.",
  },
  {
    area: "gold/violet/rose accents",
    status: "DOCUMENTED",
    detail: "Accent colors should guide attention and emotion instead of coloring every panel equally.",
    ownerAction: "Create tokenized accent roles in Package 237.",
  },
  {
    area: "shareable result cards",
    status: "DOCUMENTED",
    detail: "Compatibility, Birth Matrix, Mystic, and VIP previews should each have a screenshot-friendly result composition.",
    ownerAction: "Package 243 should define result/share card layouts.",
  },
];

const prioritizedRedesignPackages: readonly AphroditeMiniAppRedesignPackage[] = [
  { packageNumber: 237, title: "Aphrodite Design System", scope: "Define tokens, surfaces, typography, CTA hierarchy, card roles, and mobile spacing rules.", priority: "P0" },
  { packageNumber: 238, title: "Mini App Home Screen Redesign", scope: "Redesign the first viewport, module hierarchy, and primary Love Reading entry.", priority: "P0" },
  { packageNumber: 239, title: "Compatibility Flow Redesign", scope: "Simplify input steps, pair setup, date entry presentation, and relationship CTA focus.", priority: "P0" },
  { packageNumber: 240, title: "Birth Matrix / Natal Flow Redesign", scope: "Polish birth-date flow, natal visual hierarchy, and personal result storytelling.", priority: "P1" },
  { packageNumber: 241, title: "Mystic Cards Redesign", scope: "Create richer Tarot/Rune/Mystic reveal states and calmer symbolic layouts.", priority: "P1" },
  { packageNumber: 242, title: "VIP Locked Preview Redesign", scope: "Make VIP previews desirable while keeping payments and unlocks inactive.", priority: "P1" },
  { packageNumber: 243, title: "Result / Share Cards", scope: "Define screenshot-friendly result cards and share compositions for core flows.", priority: "P0" },
  { packageNumber: 244, title: "Telegram WebView Mobile Polish", scope: "Polish 360-430px spacing, safe-area, sticky navigation, empty/loading/error states.", priority: "P1" },
  { packageNumber: 245, title: "Visual QA Screenshot Pack", scope: "Capture owner-review screenshots and verify mobile/desktop visual readiness.", priority: "P0" },
];

const mobileBreakpoints = ["360px", "390px", "430px", "Telegram iOS WebView", "Telegram Android WebView", "desktop browser sanity"] as const;

const safetyBoundaries = [
  "Do not redesign core Mini App screens in Package 236.",
  "Do not change active CTA logic.",
  "Do not use Telegram API.",
  "Do not send Telegram messages.",
  "Do not add payment.",
  "Do not unlock VIP.",
  "Do not add DB writes.",
  "Do not add external analytics.",
  "Do not change cron/workflows/publish scripts.",
  "Do not add secrets.",
] as const;

const safetyNotes = [
  "Design audit only.",
  "No production launch.",
  "No Mini App screen redesign.",
  "No Telegram API.",
  "No messages sent.",
  "No payment added.",
  "No VIP unlock added.",
  "No DB write added.",
  "No external analytics added.",
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

export function getAphroditeMiniAppVisualDesignAudit(): AphroditeMiniAppVisualDesignAuditModel {
  return {
    packageNumber: 236,
    title: APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_TITLE,
    route: APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    currentVisualStatus: currentVisualStatus.map((item) => ({ ...item })),
    auditedScreens: auditedScreens.map((item) => ({ ...item, sourceFiles: [...item.sourceFiles] })),
    designFindings: designFindings.map((item) => ({ ...item })),
    visualRisks: visualRisks.map((item) => ({ ...item })),
    recommendedDesignPrinciples: recommendedDesignPrinciples.map((item) => ({ ...item })),
    prioritizedRedesignPackages: prioritizedRedesignPackages.map((item) => ({ ...item })),
    mobileBreakpoints: [...mobileBreakpoints],
    safetyBoundaries: [...safetyBoundaries],
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
      secretsAdded: false,
      productionDbConnected: false,
      miniAppScreensRedesigned: false,
    },
  };
}
