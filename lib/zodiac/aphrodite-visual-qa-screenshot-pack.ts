/**
 * Package 245: Visual QA Screenshot Pack.
 *
 * Static readiness/reporting model and checklist for manual visual QA and screenshot
 * evidence capture across the Aphrodite Mini App. Verifies compliance across required
 * viewports (360px, 390px, 430px, desktop sanity width), key user flows, and Telegram
 * WebView constraints without redesigning screens, changing active CTA logic, calling
 * Telegram API, writing to databases, or bypassing safety flags.
 */

export type AphroditeVisualQaStatus =
  | "PASS"
  | "READY"
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED";

export type AphroditeVisualQaSeverity =
  | "BLOCKER"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "POLISH";

export type AphroditeVisualQaRow = {
  area: string;
  status: AphroditeVisualQaStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeVisualQaViewport = {
  name: string;
  width: number;
  height: number;
  notes: string;
};

export type AphroditeVisualQaScreen = {
  id: string;
  name: string;
  route: string;
  priority: string;
  description: string;
};

export type AphroditeVisualQaState = {
  state: string;
  description: string;
  trigger: string;
};

export type AphroditeVisualQaCriterion = {
  criterion: string;
  detail: string;
  checkMethod: string;
};

export type AphroditeVisualQaRisk = {
  area: string;
  risk: string;
  mitigation: string;
};

export type AphroditeVisualQaEvidenceField = {
  field: string;
  required: boolean;
  description: string;
};

export type AphroditeVisualQaSeverityLevel = {
  level: AphroditeVisualQaSeverity;
  description: string;
  action: string;
};

export type AphroditeVisualQaChecklistItem = {
  id: string;
  screen: string;
  viewport: string;
  description: string;
  status: AphroditeVisualQaStatus;
};

export type AphroditeVisualQaScreenshotPackModel = {
  packageNumber: 245;
  title: string;
  route: "/dashboard/networks/zodiac/visual-qa-screenshot-pack";
  liveRoutes: readonly string[];
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  requiredViewports: readonly AphroditeVisualQaViewport[];
  requiredScreens: readonly AphroditeVisualQaScreen[];
  requiredStates: readonly AphroditeVisualQaState[];
  visualAcceptanceCriteria: readonly AphroditeVisualQaCriterion[];
  telegramWebViewCriteria: readonly AphroditeVisualQaRow[];
  knownRiskAreas: readonly AphroditeVisualQaRisk[];
  evidenceFields: readonly AphroditeVisualQaEvidenceField[];
  issueSeverityScale: readonly AphroditeVisualQaSeverityLevel[];
  manualScreenshotChecklist: readonly AphroditeVisualQaChecklistItem[];
  safetyBoundaries: readonly string[];
  whatWasNotChanged: readonly AphroditeVisualQaRow[];
  nextPackageRecommendation: string;
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    appFlowChanged: false;
    dbWriteDone: false;
    externalAnalyticsAdded: false;
    paymentImplemented: false;
    vipUnlocked: false;
    cronWorkflowsChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
    screensRedesigned: false;
  };
};

export const APHRODITE_VISUAL_QA_SCREENSHOT_PACK_TITLE = "Visual QA Screenshot Pack";
export const APHRODITE_VISUAL_QA_SCREENSHOT_PACK_ROUTE = "/dashboard/networks/zodiac/visual-qa-screenshot-pack";

export function getAphroditeVisualQaScreenshotPack(): AphroditeVisualQaScreenshotPackModel {
  return {
    packageNumber: 245,
    title: APHRODITE_VISUAL_QA_SCREENSHOT_PACK_TITLE,
    route: APHRODITE_VISUAL_QA_SCREENSHOT_PACK_ROUTE,
    liveRoutes: [
      "/miniapp",
      "/compatibility",
      "/birth-matrix",
      "/vip-preview",
      "/vip-compatibility-report",
    ],
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    requiredViewports: [
      {
        name: "Small Android (360px)",
        width: 360,
        height: 740,
        notes: "Verifies tight horizontal layout, font scaling, and button spacing on narrow screens.",
      },
      {
        name: "Standard iOS / Android (390px)",
        width: 390,
        height: 844,
        notes: "Baseline reference viewport for iPhone 13/14/15 and modern Android devices.",
      },
      {
        name: "Large iOS Max / Pro (430px)",
        width: 430,
        height: 932,
        notes: "Verifies visual hierarchy, card expansion, and spacing on larger mobile screens.",
      },
      {
        name: "Desktop Sanity Width (1200px)",
        width: 1200,
        height: 900,
        notes: "Verifies desktop wrapper max-width centering and background glass boundaries.",
      },
    ],
    requiredScreens: [
      {
        id: "HOME",
        name: "Home / Mini App Entry",
        route: "/miniapp",
        priority: "P0",
        description: "Primary landing screen featuring hero card, quick actions grid, daily horoscope teaser, and VIP preview.",
      },
      {
        id: "COMPATIBILITY",
        name: "Compatibility Flow",
        route: "/compatibility",
        priority: "P0",
        description: "Two-person input form, interactive wizard controls, date picker, and calculation result cards.",
      },
      {
        id: "BIRTH_MATRIX",
        name: "Birth Matrix / Natal Flow",
        route: "/birth-matrix",
        priority: "P1",
        description: "Deep numerological and natal chart layout with multi-section breakdown and VIP locked preview.",
      },
      {
        id: "MYSTIC_CARDS",
        name: "Mystic Cards Flow",
        route: "/miniapp (Mystic Tab)",
        priority: "P1",
        description: "Interactive Tarot, Rune, and Lunar Ritual cards featuring rich spreads and guidance.",
      },
      {
        id: "VIP_PREVIEW",
        name: "VIP Preview Surfaces",
        route: "/vip-preview & /vip-compatibility-report",
        priority: "P1",
        description: "Preview-only locked VIP boundaries and report foundations showcasing premium features safely.",
      },
      {
        id: "RESULT_SHARE",
        name: "Result / Share Cards",
        route: "/compatibility (Result state)",
        priority: "P1",
        description: "Shareable presentation cards for couples and individual profiles designed for social sharing.",
      },
      {
        id: "STATES",
        name: "Empty / Loading / Error States",
        route: "Multiple routes",
        priority: "P2",
        description: "Consistent UI treatment for missing profile data, loading transitions, and safe error boundaries.",
      },
    ],
    requiredStates: [
      {
        state: "Default / Initial",
        description: "Standard initial view with clean input fields and empty history/favorites.",
        trigger: "Fresh session launch via /miniapp.",
      },
      {
        state: "Loading / Calculating",
        description: "Smooth pulsing skeleton or shimmer transition while compatibility or matrix is calculated.",
        trigger: "Submitting date input form.",
      },
      {
        state: "Result Populated",
        description: "Rich visual cards presenting scores, synastry highlights, and actionable daily advice.",
        trigger: "Completion of calculation.",
      },
      {
        state: "Locked VIP Preview",
        description: "Glassmorphism lock overlay with clear benefit bullets and read-only CTA button.",
        trigger: "Scrolling to deep report sections.",
      },
      {
        state: "Error / Safe Fallback",
        description: "Non-disruptive error card explaining invalid input or connection fallback.",
        trigger: "Invalid date or offline fallback simulation.",
      },
    ],
    visualAcceptanceCriteria: [
      {
        criterion: "No Horizontal Overflow",
        detail: "All containers, cards, and text elements must stay within viewport bounds (0px scrollX).",
        checkMethod: "Chrome DevTools device emulation at 360px width.",
      },
      {
        criterion: "Touch Target Compliance",
        detail: "All interactive buttons, date selects, and tabs must have a minimum interactive height of 44px.",
        checkMethod: "Visual inspection and bounding client rect height measurement.",
      },
      {
        criterion: "Russian Text Wrapping",
        detail: "Long Russian labels (e.g. 'Совместимость', 'Характеристика') must wrap cleanly without clipping or overflowing.",
        checkMethod: "Reviewing rendered headers on 360px width.",
      },
      {
        criterion: "Clear Primary CTA",
        detail: "The first viewport (above the fold) must always display a visually prominent primary action button.",
        checkMethod: "Initial viewport inspection on 390x844 resolution.",
      },
      {
        criterion: "Typography & Contrast",
        detail: "Text color tokens must maintain adequate contrast against cosmic gradient backgrounds.",
        checkMethod: "Visual contrast verification on dark cosmic backgrounds.",
      },
    ],
    telegramWebViewCriteria: [
      {
        area: "Safe-area Top/Bottom Spacing",
        status: "READY",
        detail: "Top header respects Telegram system bar and bottom spacing avoids overlapping native controls.",
        ownerAction: "Verify manual screenshot evidence on iOS/Android Telegram client.",
      },
      {
        area: "No Horizontal Scrollbar",
        status: "READY",
        detail: "100svh and overflow-x-hidden prevent accidental side scrolling inside Telegram WebView.",
        ownerAction: "Check touch swipe behavior in real device container.",
      },
      {
        area: "Bottom CTA Visibility",
        status: "READY",
        detail: "Bottom action buttons include padding bottom (pb-8/pb-12) so they are not cut off by Telegram footer.",
        ownerAction: "Review screenshot evidence on 360px and 390px viewports.",
      },
      {
        area: "Readable Tap Targets",
        status: "READY",
        detail: "Select dropdowns and radio cards maintain min-h-[44px] for comfortable one-handed mobile tapping.",
        ownerAction: "Confirm touch ergonomics during manual smoke test.",
      },
      {
        area: "Long Russian Name Wrapping",
        status: "READY",
        detail: "User names and astrological terms wrap to multiple lines without pushing layout outside card boundaries.",
        ownerAction: "Inspect generated screenshots with long input test data.",
      },
    ],
    knownRiskAreas: [
      {
        area: "360px Android Screens",
        risk: "Multi-column metric grids may become too narrow or text may overlap.",
        mitigation: "Grid layouts collapse to 1-column or use flex-wrap on narrow screens.",
      },
      {
        area: "Telegram Android Header",
        risk: "Telegram Android WebView header can occasionally obscure top 16px of custom UI.",
        mitigation: "Maintained pt-4 to pt-6 safe top padding across top-level screens.",
      },
      {
        area: "Custom Date Selectors",
        risk: "Native select dropdown elements may style inconsistently across iOS Safari and Android Chrome.",
        mitigation: "Standardized appearance-none styling with custom chevron icons.",
      },
    ],
    evidenceFields: [
      { field: "Viewport Resolution", required: true, description: "Exact pixel width and height (e.g. 390x844)." },
      { field: "Device / OS Platform", required: true, description: "Simulated or physical device OS (iOS 17, Android 14, Desktop Chrome)." },
      { field: "Target Screen / Route", required: true, description: "Route path and state being inspected (/miniapp, /compatibility)." },
      { field: "Capture Timestamp", required: true, description: "ISO date or exact review time of screenshot capture." },
      { field: "Reviewer Initials", required: true, description: "Owner or QA reviewer conducting visual inspection." },
      { field: "Triage Notes / Defects", required: false, description: "Observed visual anomalies, polish notes, or logged defect IDs." },
    ],
    issueSeverityScale: [
      {
        level: "BLOCKER",
        description: "Layout completely broken, primary CTA unreachable, crash, or horizontal scroll preventing navigation.",
        action: "Fix immediately before public launch approval.",
      },
      {
        level: "HIGH",
        description: "Text clipping on primary headings, overlapping elements, or touch targets under 36px.",
        action: "Prioritize fix in Package 246 sprint.",
      },
      {
        level: "MEDIUM",
        description: "Minor padding asymmetry, secondary label wrapping awkwardly, or slight contrast dip.",
        action: "Schedule for routine polish during Visual Fixes.",
      },
      {
        level: "LOW",
        description: "Icon slightly misaligned by 1-2px or minor transition glitch.",
        action: "Backlog for future backlog refinement.",
      },
      {
        level: "POLISH",
        description: "Opportunity for enhanced micro-animation or smoother gradient blend.",
        action: "Optional aesthetic enhancement.",
      },
    ],
    manualScreenshotChecklist: [
      { id: "QA-360-HOME", screen: "Home / Mini App Entry", viewport: "360x740", description: "Verify hero card and quick actions fit without horizontal overflow.", status: "MANUAL REQUIRED" },
      { id: "QA-390-HOME", screen: "Home / Mini App Entry", viewport: "390x844", description: "Verify primary CTA prominence and bottom safe area spacing.", status: "MANUAL REQUIRED" },
      { id: "QA-430-HOME", screen: "Home / Mini App Entry", viewport: "430x932", description: "Verify card width expansion and gradient background coverage.", status: "MANUAL REQUIRED" },
      { id: "QA-360-COMPAT", screen: "Compatibility Flow", viewport: "360x740", description: "Verify two-person date form wrapping and touch target spacing.", status: "MANUAL REQUIRED" },
      { id: "QA-390-COMPAT-RES", screen: "Result / Share Cards", viewport: "390x844", description: "Verify calculation score card layout and share button readability.", status: "MANUAL REQUIRED" },
      { id: "QA-390-MATRIX", screen: "Birth Matrix / Natal Flow", viewport: "390x844", description: "Verify numerological grid rendering and long Russian label formatting.", status: "MANUAL REQUIRED" },
      { id: "QA-390-MYSTIC", screen: "Mystic Cards Flow", viewport: "390x844", description: "Verify Tarot and Rune card flip transitions and text alignment.", status: "MANUAL REQUIRED" },
      { id: "QA-390-VIP", screen: "VIP Preview Surfaces", viewport: "390x844", description: "Verify locked preview glass card boundaries and non-interactive CTA styling.", status: "MANUAL REQUIRED" },
      { id: "QA-1200-DESKTOP", screen: "Desktop Sanity Width", viewport: "1200x900", description: "Verify max-w-md or max-w-lg container centering inside desktop browser.", status: "MANUAL REQUIRED" },
    ],
    safetyBoundaries: [
      "Do not redesign screens or alter visual styling during Package 245.",
      "Do not modify active CTA destinations or user navigation flow logic.",
      "Do not invoke real Telegram Bot API endpoints or send broadcast messages.",
      "Do not implement real Telegram Stars payments or unlock VIP access.",
      "Do not write to production databases or external analytics services.",
      "Do not modify cron jobs, github workflows, or automated publish scripts.",
      "Keep publicLaunchApproved=false and ownerManualReviewRequired=true.",
    ],
    whatWasNotChanged: [
      { area: "Visual UI Styling", status: "DOCUMENTED", detail: "Existing design system components and layouts remain untouched.", ownerAction: "No action needed." },
      { area: "Active CTA Logic", status: "DOCUMENTED", detail: "Primary and secondary CTA links and handlers remain identical.", ownerAction: "No action needed." },
      { area: "Telegram API & Bot Tokens", status: "DOCUMENTED", detail: "No network requests or bot operations were introduced.", ownerAction: "No action needed." },
      { area: "Database & Storage", status: "DOCUMENTED", detail: "No database mutations or localStorage key changes occurred.", ownerAction: "No action needed." },
    ],
    nextPackageRecommendation: "Package 246 — Visual Fixes After Screenshot Review",
    safetyNotes: [
      "Visual QA screenshot capture is strictly observational and documentation-driven.",
      "No real Telegram messages, Stars invoices, or DB writes occur during review.",
    ],
    remainingBlockers: [
      "Owner execution of physical/simulated screenshot checklist across 360px, 390px, 430px viewports.",
      "Triage and remediation of logged defects during Package 246 Visual Fixes sprint.",
    ],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      appFlowChanged: false,
      dbWriteDone: false,
      externalAnalyticsAdded: false,
      paymentImplemented: false,
      vipUnlocked: false,
      cronWorkflowsChanged: false,
      secretsAdded: false,
      productionDbConnected: false,
      screensRedesigned: false,
    },
  };
}
