/**
 * Aphrodite Public Bot Profile / Main Mini App Launch Packaging (Package 146)
 *
 * STATIC, LOCAL-ONLY, DETERMINISTIC. Prepares copy, checklists, and deep-link concepts
 * for a human to set up the public bot profile and Main Mini App by hand. Packaging only.
 *
 * Hard boundaries (enforced by simply not doing anything else):
 *  - No Telegram API calls. No BotFather mutation. No real bot configuration.
 *  - No production launch / publish. No auto-launch. No workflow / cron change.
 *  - No platform API calls. No auto-posting. No scraping. No browser automation.
 *  - No database write. No external fetch. No account credentials. No AI API.
 *  - No copied competitor content. No active payment CTA. No real VIP unlock.
 *  - No deterministic prophecy; no medical / legal / financial / manipulation advice.
 */

export type AphroditePublicLaunchAssetType =
  | "bot-name"
  | "bot-description"
  | "bot-about"
  | "main-mini-app-title"
  | "mini-app-short-description"
  | "screenshot"
  | "video-preview"
  | "deep-link"
  | "support-link"
  | "terms-link"
  | "privacy-note";

export type AphroditePublicLaunchCopy = {
  id: string;
  assetType: AphroditePublicLaunchAssetType;
  label: string;
  recommendedCopy: string;
  purpose: string;
  safetyNotes: string[];
};

export type AphroditePublicLaunchChecklistItem = {
  id: string;
  area: string;
  task: string;
  ownerAction: string;
  status: "planned" | "needs-manual-action" | "blocked" | "ready-for-owner-review";
  blockedUntil: string[];
};

export type AphroditePublicLaunchDeepLink = {
  id: string;
  label: string;
  path: string;
  startParam: string;
  purpose: string;
  safeCta: string;
  blockedClaims: string[];
};

export type AphroditePublicLaunchBoundary = {
  area: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditePublicLaunchNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_LAUNCH_PRIMARY_PROMISE =
  "Узнай, что между вами происходит, что он может чувствовать и где ваша главная зона риска.";

export const APHRODITE_LAUNCH_SAFE_CTAS: string[] = [
  "Open Aphrodite in Telegram",
  "Get your free Love Reading preview",
  "Check your relationship pattern",
  "Open your personal preview",
];

export const APHRODITE_LAUNCH_BLOCKED_CLAIMS: string[] = [
  "Buy VIP now",
  "Unlock full report now",
  "Pay now",
  "Guaranteed prediction",
  "He will return",
  "100% true",
  "Spell / loyalty magic",
];

export const APHRODITE_LAUNCH_SAFETY_BOUNDARIES: string[] = [
  "No Telegram API call",
  "No BotFather mutation",
  "No production launch",
  "No database write",
  "No account credentials",
  "No active payment CTA",
  "No real VIP unlock",
  "No auto-posting",
  "No platform API call",
  "No workflow change",
];

const SOFT_NOTE = ["Soft wording only; no guaranteed predictions.", "Free Mini App preview CTA; no payment CTA."];

export function getAphroditePublicLaunchCopy(): AphroditePublicLaunchCopy[] {
  const c = (
    id: string, assetType: AphroditePublicLaunchAssetType, label: string, recommendedCopy: string, purpose: string
  ): AphroditePublicLaunchCopy => ({ id, assetType, label, recommendedCopy, purpose, safetyNotes: SOFT_NOTE.slice() });

  return [
    c("copy-bot-name", "bot-name", "Bot name", "Aphrodite — AI Love Reading", "Lead with the emotional product, not the calculation."),
    c("copy-bot-description", "bot-description", "Bot short description", "AI Love Reading, compatibility, red flags, soulmate hints, future timeline, and daily messages inside Telegram.", "Replace 'compatibility by sign, gender, date and birth time' with emotional outcomes."),
    c("copy-bot-about", "bot-about", "Bot about text", "Aphrodite gives you a soft, personal read on love: what may be happening, what he may feel, and your main zone of attention. Free preview inside.", "The about text users skim before opening."),
    c("copy-mini-app-title", "main-mini-app-title", "Main Mini App title", "Aphrodite — Love Reading", "The Main Mini App button / title."),
    c("copy-mini-app-short", "mini-app-short-description", "Mini App short description", "Your free Love Reading preview, compatibility, red flags, and what may be coming next.", "Short store-style description for the Mini App."),
    c("copy-first-message", "bot-about", "First Telegram message", "Open Aphrodite for your free Love Reading preview. Узнай, что между вами происходит и где ваша главная зона риска.", "The first message after /start (manual setup)."),
    c("copy-start-button", "deep-link", "Start button copy", "Open Aphrodite", "The primary button copy; opens the Mini App preview."),
    c("copy-support", "support-link", "Support text", "Need help? Message our support — we reply kindly and clearly.", "Support contact copy."),
    c("copy-privacy", "privacy-note", "Privacy note", "Your details are used only to prepare your reading. Nothing is shared.", "Privacy reassurance shown before any input."),
    c("copy-terms", "terms-link", "Terms / refund note", "Clear terms and a friendly refund policy. Payments are not enabled yet.", "Terms / refund link copy (no live payments)."),
  ];
}

export function getAphroditePublicLaunchChecklist(): AphroditePublicLaunchChecklistItem[] {
  const ci = (
    id: string, area: string, task: string, ownerAction: string,
    status: AphroditePublicLaunchChecklistItem["status"], blockedUntil: string[] = []
  ): AphroditePublicLaunchChecklistItem => ({ id, area, task, ownerAction, status, blockedUntil });

  return [
    ci("chk-botfather", "BotFather public profile", "Review name / description / about copy.", "Owner updates BotFather manually.", "needs-manual-action"),
    ci("chk-miniapp-button", "Main Mini App button", "Set the Main Mini App title and button.", "Owner configures in BotFather manually.", "needs-manual-action"),
    ci("chk-screenshots", "Mini App screenshots", "Prepare 3-5 screenshots of the free preview.", "Owner captures and uploads manually.", "planned"),
    ci("chk-video", "Mini App video preview", "Prepare a short preview video.", "Owner records and uploads manually.", "planned"),
    ci("chk-splash", "Splash / launch visual", "Prepare the launch visual.", "Owner adds manually.", "planned"),
    ci("chk-deeplinks", "Deep-link startapp params", "Confirm startapp parameter concepts.", "Owner wires deep links during real integration.", "blocked", ["Package 147 — Mini App First Screen Real Integration"]),
    ci("chk-support", "Support command / contact", "Set a support contact and message.", "Owner configures manually.", "needs-manual-action"),
    ci("chk-legal", "Terms / privacy / refund links", "Attach terms, privacy, and refund links.", "Owner adds links manually (no live payments).", "needs-manual-action"),
    ci("chk-owner-review", "Manual owner review before launch", "Owner reviews all copy and assets.", "Owner approves before any launch.", "ready-for-owner-review"),
    ci("chk-smoke", "Post-launch smoke test", "Manually open the Mini App and verify the free preview.", "Owner runs a manual smoke test after launch.", "blocked", ["owner launches manually"]),
  ];
}

export function getAphroditePublicLaunchDeepLinks(): AphroditePublicLaunchDeepLink[] {
  const dl = (
    id: string, label: string, startParam: string, purpose: string
  ): AphroditePublicLaunchDeepLink => ({
    id, label, path: "aphrodite-mini-app", startParam, purpose,
    safeCta: "Open your personal preview",
    blockedClaims: APHRODITE_LAUNCH_BLOCKED_CLAIMS.slice(),
  });
  return [
    dl("dl-love-reading", "AI Love Reading preview", "love_reading", "Open straight into the AI Love Reading free preview."),
    dl("dl-soulmate", "Soulmate Scanner preview", "soulmate_scanner", "Open into the Soulmate Scanner free preview."),
    dl("dl-red-flags", "Red Flags Scanner preview", "red_flags", "Open into the Red Flags Scanner free preview."),
    dl("dl-future-timeline", "Future Timeline preview", "future_timeline", "Open into the AI Future Timeline free preview."),
    dl("dl-daily-message", "Daily Message preview", "daily_message", "Open into the Daily Message free preview."),
  ];
}

export function getAphroditePublicLaunchBoundaries(): AphroditePublicLaunchBoundary[] {
  return [
    { area: "Copy / checklist / deep-link concepts (read-only packaging)", allowedNow: ["recommended copy", "manual setup checklist", "deep-link concepts"], blockedUntil: [], riskLevel: "low" },
    { area: "BotFather mutation / Telegram API / real bot config", allowedNow: [], blockedUntil: ["owner sets up manually — never automated here"], riskLevel: "critical" },
    { area: "Production launch / auto-publish / workflow change", allowedNow: [], blockedUntil: ["explicit owner approval", "manual launch"], riskLevel: "critical" },
    { area: "Database write / payments / real VIP unlock", allowedNow: [], blockedUntil: ["explicit owner approval", "legal", "real-implementation packages"], riskLevel: "high" },
  ];
}

export function getAphroditePublicLaunchNextSteps(): AphroditePublicLaunchNextStep[] {
  return [
    { package: "Package 147", title: "Mini App First Screen Real Integration", purpose: "Wire the first screen to the real Mini App experience (still no payments / no live VIP).", blockedUntil: ["this packaging approved", "owner review"] },
    { package: "Future", title: "Owner-led manual launch", purpose: "Owner manually configures BotFather and launches; never automated here.", blockedUntil: ["explicit owner approval", "legal review"] },
  ];
}
