/**
 * Package 237: Aphrodite Design System.
 *
 * Static Mini App design-system foundation only. This file defines reusable
 * tokens, principles, and preview guidance for future redesign packages. It
 * does not change live Mini App flows, Telegram, database, payment, VIP,
 * cron, workflow, publish, analytics, secrets, or launch flags.
 */

export type AphroditeDesignSystemStatus =
  | "READY"
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "BLOCKED";

export type AphroditeDesignSystemRow = {
  area: string;
  status: AphroditeDesignSystemStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeDesignToken = {
  name: string;
  value: string;
  usage: string;
};

export type AphroditeNextPackageUsage = {
  packageNumber: number;
  title: string;
  status: AphroditeDesignSystemStatus;
  usage: string;
  boundary: string;
};

export type AphroditeDesignSystemModel = {
  packageNumber: 237;
  title: string;
  route: "/dashboard/networks/zodiac/aphrodite-design-system";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  brandMood: readonly AphroditeDesignSystemRow[];
  colorTokens: readonly AphroditeDesignToken[];
  gradientTokens: readonly AphroditeDesignToken[];
  cardStyles: readonly AphroditeDesignToken[];
  buttonStyles: readonly AphroditeDesignToken[];
  typographyScale: readonly AphroditeDesignToken[];
  spacingRules: readonly AphroditeDesignSystemRow[];
  mobileBreakpoints: readonly string[];
  telegramWebViewSafeAreaRules: readonly AphroditeDesignSystemRow[];
  componentPrinciples: readonly AphroditeDesignSystemRow[];
  resultCardPrinciples: readonly AphroditeDesignSystemRow[];
  vipLockedPreviewPrinciples: readonly AphroditeDesignSystemRow[];
  mysticCardPrinciples: readonly AphroditeDesignSystemRow[];
  accessibilityReadabilityConstraints: readonly AphroditeDesignSystemRow[];
  safetyBoundaries: readonly string[];
  nextPackageUsage: readonly AphroditeNextPackageUsage[];
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
    appFlowsChanged: false;
  };
};

export const APHRODITE_DESIGN_SYSTEM_TITLE = "Aphrodite Design System";

export const APHRODITE_DESIGN_SYSTEM_ROUTE =
  "/dashboard/networks/zodiac/aphrodite-design-system" as const;

const brandMood: readonly AphroditeDesignSystemRow[] = [
  {
    area: "premium mystical romantic modern",
    status: "READY",
    detail:
      "Aphrodite should feel like a polished relationship astrology Mini App: premium, mystical, romantic, modern, mobile-first, emotionally calm, and safe inside Telegram WebView.",
    ownerAction: "Use this as the visual north star for Packages 238-245.",
  },
  {
    area: "not childish / not casino / not cheap horoscope spam",
    status: "DOCUMENTED",
    detail:
      "The system rejects cartoonish clutter, gambling-like urgency, fear copy, fake scarcity, and cheap horoscope spam visual patterns.",
    ownerAction: "Reject future UI work that makes the product feel manipulative or noisy.",
  },
  {
    area: "shareable emotional clarity",
    status: "READY",
    detail:
      "Result cards, compatibility scores, and mystic card previews should feel screenshot-worthy without hiding the user's next action.",
    ownerAction: "Keep result screens expressive, readable, and easy to share in later packages.",
  },
];

const colorTokens: readonly AphroditeDesignToken[] = [
  { name: "cosmic-base", value: "#070713", usage: "dark cosmic base background for the Mini App shell." },
  { name: "cosmic-depth", value: "#111024", usage: "Raised dark surface for panels and section depth." },
  { name: "cosmic-ink", value: "#17152e", usage: "Secondary dark layer for result and mystic cards." },
  { name: "violet-aura", value: "#a78bfa", usage: "Mystical accent for active state, reveal, and navigation emphasis." },
  { name: "rose-aura", value: "#fb7185", usage: "Romantic accent for primary CTAs and relationship tone." },
  { name: "gold-aura", value: "#f6d58a", usage: "Premium accent for score, VIP locked preview, and highlights." },
  { name: "soft-lilac", value: "#ddd6fe", usage: "Readable highlight text on dark cosmic surfaces." },
  { name: "text-primary", value: "#fff7ed", usage: "Main text on dark surfaces." },
  { name: "text-muted", value: "#cbd5e1", usage: "Secondary readable body and helper text." },
  { name: "glass-border", value: "rgba(255,255,255,0.14)", usage: "Thin glass-like card and control border." },
];

const gradientTokens: readonly AphroditeDesignToken[] = [
  {
    name: "aphrodite-hero-aura",
    value: "radial violet + rose + gold over cosmic base",
    usage: "First-viewport hero preview and high-value emotional surfaces.",
  },
  {
    name: "rose-gold-cta",
    value: "linear rose -> warm gold",
    usage: "High-contrast primary CTA button while preserving clean hierarchy.",
  },
  {
    name: "violet-mystic-reveal",
    value: "linear deep violet -> cosmic ink with soft lilac edge",
    usage: "Mystic card, Tarot, Rune, and reveal-preview surfaces.",
  },
  {
    name: "glass-depth",
    value: "transparent white overlay with blur and dark depth",
    usage: "Glass-like cards that stay readable on mobile.",
  },
  {
    name: "gold-score-ring",
    value: "gold halo on dark cosmic result card",
    usage: "Compatibility score and shareable result-card emphasis.",
  },
];

const cardStyles: readonly AphroditeDesignToken[] = [
  { name: "AphroditeCard / glass", value: "8px radius, glass border, cosmic surface", usage: "Default repeated modules and readable dashboard previews." },
  { name: "AphroditeHeroCard", value: "hero aura, 16px padding, calm title hierarchy", usage: "Home hero preview and first result summary." },
  { name: "AphroditeResultCardPreview", value: "dark cosmic result with gold score accent", usage: "Shareable compatibility and personal insight results." },
  { name: "AphroditeLockedPreviewCard", value: "gold edge, explicit locked state, no active payment", usage: "VIP locked preview that creates desire without unlock behavior." },
  { name: "AphroditeMysticCardPreview", value: "violet reveal card with symbolic top mark", usage: "Mystic cards, Tarot, Rune, and reflective readings." },
];

const buttonStyles: readonly AphroditeDesignToken[] = [
  { name: "primary", value: "rose-gold high-contrast button", usage: "One primary action per mobile screen." },
  { name: "secondary", value: "glass outline button", usage: "Back, edit, save, or lower-priority action." },
  { name: "share", value: "compact dark result action with gold/violet edge", usage: "Share/result card actions after calculation." },
  { name: "locked", value: "disabled gold glass preview", usage: "VIP preview only, with payment and VIP unlock inactive." },
];

const typographyScale: readonly AphroditeDesignToken[] = [
  { name: "screen-title", value: "text-2xl leading-8 font-semibold", usage: "Mini App screen title and result hero title." },
  { name: "section-title", value: "text-lg leading-7 font-semibold", usage: "Major stacked mobile sections." },
  { name: "card-title", value: "text-base leading-6 font-semibold", usage: "Cards, tools, and preview panels." },
  { name: "body", value: "text-sm leading-6", usage: "Readable mobile copy without dense paragraphs." },
  { name: "caption", value: "text-xs leading-5", usage: "Helper, trust, and metadata copy." },
  { name: "badge", value: "text-[11px] leading-4 uppercase optional", usage: "Status badges where short labels stay readable." },
];

const spacingRules: readonly AphroditeDesignSystemRow[] = [
  {
    area: "Mobile page inset",
    status: "READY",
    detail: "Use 16px horizontal padding on 360px/390px/430px screens with max-width containment on larger displays.",
    ownerAction: "Do not add edge-to-edge text blocks in future Mini App redesign packages.",
  },
  {
    area: "Section rhythm",
    status: "DOCUMENTED",
    detail: "Use 16px gaps between stacked sections and 12px gaps inside compact card groups.",
    ownerAction: "Keep mobile screens scannable instead of dense.",
  },
  {
    area: "CTA clearance",
    status: "READY",
    detail: "Bottom CTAs should reserve calc(24px + env(safe-area-inset-bottom)) for Telegram WebView and iOS safe areas.",
    ownerAction: "Package 244 must verify safe-area clearance on real devices.",
  },
];

const mobileBreakpoints = ["360px", "390px", "430px", "desktop"] as const;

const telegramWebViewSafeAreaRules: readonly AphroditeDesignSystemRow[] = [
  {
    area: "Safe-area bottom",
    status: "READY",
    detail: "Sticky or bottom-aligned controls must avoid Telegram browser chrome and env(safe-area-inset-bottom).",
    ownerAction: "Check Telegram iOS WebView and Telegram Android WebView manually.",
  },
  {
    area: "Keyboard state",
    status: "DOCUMENTED",
    detail: "Forms should keep the active field and helper text visible when the keyboard opens.",
    ownerAction: "Verify date input, compatibility forms, and profile forms in later packages.",
  },
  {
    area: "Browser fallback",
    status: "DOCUMENTED",
    detail: "The visual system must remain readable when opened outside Telegram; missing startapp in browser mode is not a design failure.",
    ownerAction: "Use the manual WebView protocol before any launch approval.",
  },
];

const componentPrinciples: readonly AphroditeDesignSystemRow[] = [
  {
    area: "AphroditeSurface",
    status: "READY",
    detail: "Provides dark cosmic depth and mobile-first safe spacing for previews without replacing live app screens.",
    ownerAction: "Use only in preview/showcase until redesign packages are explicitly requested.",
  },
  {
    area: "AphroditeCard",
    status: "READY",
    detail: "Glass-like cards with subtle glow, readable contrast, and no nested-card clutter.",
    ownerAction: "Apply levels sparingly so cards do not compete with CTAs.",
  },
  {
    area: "AphroditeButton",
    status: "DOCUMENTED",
    detail: "Button visual hierarchy covers primary, secondary, share, and locked states without changing active CTA logic.",
    ownerAction: "Keep one obvious primary action per screen in future packages.",
  },
  {
    area: "AphroditeBadge",
    status: "DOCUMENTED",
    detail: "Status badges must be readable at 360px and should not rely only on color.",
    ownerAction: "Use short labels and avoid badge overload.",
  },
  {
    area: "AphroditeMetricCard",
    status: "DOCUMENTED",
    detail: "Metric and score cards use restrained premium accents and stable dimensions.",
    ownerAction: "Do not turn scores into casino-like progress feedback.",
  },
];

const resultCardPrinciples: readonly AphroditeDesignSystemRow[] = [
  {
    area: "Compatibility score visual language",
    status: "READY",
    detail: "Scores should feel calm, romantic, and shareable: gold score ring, short insight, and one share/result CTA.",
    ownerAction: "Use for Packages 239 and 243 only after explicit package start.",
  },
  {
    area: "Shareable result cards",
    status: "DOCUMENTED",
    detail: "Result cards should fit a screenshot, avoid long paragraphs, and preserve source/result context.",
    ownerAction: "Verify text wrapping at 360px and 390px.",
  },
];

const vipLockedPreviewPrinciples: readonly AphroditeDesignSystemRow[] = [
  {
    area: "Desire without activation",
    status: "BLOCKED",
    detail: "VIP locked preview can show premium value, gold edge, and blurred/partial insight, but payment and VIP unlock stay inactive.",
    ownerAction: "Do not add payment, entitlement, or unlock logic in Package 237.",
  },
  {
    area: "Honest locked state",
    status: "DOCUMENTED",
    detail: "Locked copy must be clear and should not imply access has already been granted.",
    ownerAction: "Future package must preserve no active payment and no VIP unlock without entitlement.",
  },
];

const mysticCardPrinciples: readonly AphroditeDesignSystemRow[] = [
  {
    area: "Mystic card visual language",
    status: "READY",
    detail: "Mystic cards use violet depth, soft glow accents, symbolic titles, and readable reveal copy without external images.",
    ownerAction: "Use for Package 241 only after explicit package start.",
  },
  {
    area: "Reflective, not scary",
    status: "DOCUMENTED",
    detail: "Mystic cards should avoid fear, fatalism, medical/legal/financial advice, and manipulative urgency.",
    ownerAction: "Keep the tone romantic, mystical, and emotionally safe.",
  },
];

const accessibilityReadabilityConstraints: readonly AphroditeDesignSystemRow[] = [
  {
    area: "Contrast",
    status: "READY",
    detail: "Primary text must remain high-contrast on dark cosmic and glass-like cards.",
    ownerAction: "Avoid low-opacity long body text.",
  },
  {
    area: "Long Russian text wrapping",
    status: "DOCUMENTED",
    detail: "Cards and buttons must wrap long Russian labels without overflow at 360px.",
    ownerAction: "Package 245 screenshot pack must check Russian text on mobile widths.",
  },
  {
    area: "Touch targets",
    status: "DOCUMENTED",
    detail: "Buttons should keep at least 44px touch height and visible disabled/locked states.",
    ownerAction: "Verify Telegram WebView real devices before launch review.",
  },
];

const safetyBoundaries = [
  "Do not fully redesign Mini App screens in Package 237.",
  "Do not start Package 238.",
  "Do not change active CTA logic.",
  "Do not change app flows.",
  "Do not use Telegram API.",
  "Do not send Telegram messages.",
  "Do not add payment.",
  "Do not unlock VIP.",
  "Do not add DB writes.",
  "Do not add external analytics.",
  "Do not change cron/workflows/publish scripts.",
  "Do not add secrets.",
  "Do not change public launch flags.",
] as const;

const nextPackageUsage: readonly AphroditeNextPackageUsage[] = [
  {
    packageNumber: 238,
    title: "Mini App Home Screen Redesign",
    status: "DOCUMENTED",
    usage: "Apply AphroditeSurface, AphroditeHeroCard, primary CTA hierarchy, module cards, and Telegram-safe spacing.",
    boundary: "Do not start in Package 237.",
  },
  {
    packageNumber: 239,
    title: "Compatibility Flow Redesign",
    status: "DOCUMENTED",
    usage: "Apply relationship tone, form rhythm, compatibility score visual language, and shareable result card previews.",
    boundary: "Do not start in Package 237.",
  },
  {
    packageNumber: 240,
    title: "Birth Matrix / Natal Flow Redesign",
    status: "DOCUMENTED",
    usage: "Apply date-entry visual hierarchy, personal result cards, and calm natal-card presentation.",
    boundary: "Do not start in Package 237.",
  },
  {
    packageNumber: 241,
    title: "Mystic Cards Redesign",
    status: "DOCUMENTED",
    usage: "Apply AphroditeMysticCardPreview, violet reveal surfaces, and reflective safe copy.",
    boundary: "Do not start in Package 237.",
  },
  {
    packageNumber: 242,
    title: "VIP Locked Preview Redesign",
    status: "BLOCKED",
    usage: "Apply AphroditeLockedPreviewCard while keeping payment and VIP unlock inactive.",
    boundary: "Do not start in Package 237.",
  },
  {
    packageNumber: 243,
    title: "Result / Share Cards",
    status: "DOCUMENTED",
    usage: "Apply result-card and share-button primitives for screenshot-friendly output.",
    boundary: "Do not start in Package 237.",
  },
  {
    packageNumber: 244,
    title: "Telegram WebView Mobile Polish",
    status: "DOCUMENTED",
    usage: "Apply safe-area, keyboard, bottom navigation, loading, empty, and error state rules.",
    boundary: "Do not start in Package 237.",
  },
  {
    packageNumber: 245,
    title: "Visual QA Screenshot Pack",
    status: "MANUAL REQUIRED",
    usage: "Verify 360px, 390px, 430px, Telegram iOS WebView, Telegram Android WebView, and desktop screenshots.",
    boundary: "Do not mark screenshots complete automatically.",
  },
] as const;

const safetyNotes = [
  "Design system foundation only.",
  "No production launch.",
  "No Mini App screen redesign.",
  "No app flow change.",
  "No active CTA logic change.",
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

export function getAphroditeDesignSystem(): AphroditeDesignSystemModel {
  return {
    packageNumber: 237,
    title: APHRODITE_DESIGN_SYSTEM_TITLE,
    route: APHRODITE_DESIGN_SYSTEM_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    brandMood: brandMood.map((item) => ({ ...item })),
    colorTokens: colorTokens.map((item) => ({ ...item })),
    gradientTokens: gradientTokens.map((item) => ({ ...item })),
    cardStyles: cardStyles.map((item) => ({ ...item })),
    buttonStyles: buttonStyles.map((item) => ({ ...item })),
    typographyScale: typographyScale.map((item) => ({ ...item })),
    spacingRules: spacingRules.map((item) => ({ ...item })),
    mobileBreakpoints: [...mobileBreakpoints],
    telegramWebViewSafeAreaRules: telegramWebViewSafeAreaRules.map((item) => ({ ...item })),
    componentPrinciples: componentPrinciples.map((item) => ({ ...item })),
    resultCardPrinciples: resultCardPrinciples.map((item) => ({ ...item })),
    vipLockedPreviewPrinciples: vipLockedPreviewPrinciples.map((item) => ({ ...item })),
    mysticCardPrinciples: mysticCardPrinciples.map((item) => ({ ...item })),
    accessibilityReadabilityConstraints: accessibilityReadabilityConstraints.map((item) => ({ ...item })),
    safetyBoundaries: [...safetyBoundaries],
    nextPackageUsage: nextPackageUsage.map((item) => ({ ...item })),
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
      appFlowsChanged: false,
    },
  };
}
