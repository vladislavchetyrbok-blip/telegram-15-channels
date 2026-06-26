/**
 * Package 197: Aphrodite design tokens and UI shell skeleton.
 *
 * Static visual primitives for future Mini App UI work. These tokens do not
 * call APIs, send analytics, write to storage, unlock VIP, or create payments.
 */

export type AphroditeSpacingToken = {
  name: string;
  value: string;
  usage: string;
};

export type AphroditeRadiusToken = {
  name: string;
  value: string;
  usage: string;
};

export type AphroditeTextToken = {
  name: string;
  className: string;
  usage: string;
};

export type AphroditeSurfaceToken = {
  name: string;
  className: string;
  usage: string;
};

export type AphroditeCtaToken = {
  name: string;
  className: string;
  usage: string;
};

export type AphroditeMiniAppDesignTokens = {
  version: "package-197-shell";
  classification: string;
  safetyLabels: readonly string[];
  spacingScale: AphroditeSpacingToken[];
  radiusScale: AphroditeRadiusToken[];
  cardStyle: AphroditeSurfaceToken[];
  textHierarchy: AphroditeTextToken[];
  sectionRhythm: AphroditeSpacingToken[];
  ctaHierarchy: AphroditeCtaToken[];
  darkThemePalette: {
    appBackground: string;
    surface: string;
    surfaceRaised: string;
    border: string;
    primaryText: string;
    secondaryText: string;
    mutedText: string;
    roseAccent: string;
    goldAccent: string;
    emeraldSafe: string;
  };
  gradientUsageRules: string[];
  mobileMaxWidth: string;
  telegramSafeAreaNotes: string[];
  safetyFlags: {
    productionLaunchNow: false;
    paymentChangedNow: false;
    vipUnlockNow: false;
    telegramApiNow: false;
    databaseWriteNow: false;
    sendsAnythingNow: false;
  };
};

export const APHRODITE_DESIGN_TOKENS_TITLE = "Design Tokens & UI Shell Skeleton";

export const APHRODITE_DESIGN_TOKENS_CLASSIFICATION =
  "UI shell skeleton / Live product behavior не изменён / Нет запуска";

export const APHRODITE_DESIGN_TOKENS_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет изменения оплаты",
  "Нет VIP-разблокировки",
  "Нет Telegram API",
  "Нет записи в базу данных",
  "UI shell ничего не отправляет",
] as const;

export const aphroditeMiniAppDesignTokens: AphroditeMiniAppDesignTokens = {
  version: "package-197-shell",
  classification: APHRODITE_DESIGN_TOKENS_CLASSIFICATION,
  safetyLabels: APHRODITE_DESIGN_TOKENS_SAFETY_LABELS,
  spacingScale: [
    { name: "space-1", value: "0.25rem", usage: "small icon gaps" },
    { name: "space-2", value: "0.5rem", usage: "pill and compact control gaps" },
    { name: "space-3", value: "0.75rem", usage: "card inner row rhythm" },
    { name: "space-4", value: "1rem", usage: "standard card padding on mobile" },
    { name: "space-5", value: "1.25rem", usage: "primary section padding" },
    { name: "space-6", value: "1.5rem", usage: "between major Mini App sections" },
    { name: "space-8", value: "2rem", usage: "top and bottom page rhythm" },
  ],
  radiusScale: [
    { name: "radius-sm", value: "0.375rem", usage: "status pills and tiny controls" },
    { name: "radius-md", value: "0.5rem", usage: "cards and primary controls" },
    { name: "radius-lg", value: "0.75rem", usage: "hero shell only when existing style needs softness" },
  ],
  cardStyle: [
    { name: "surface-base", className: "border border-white/10 bg-white/[0.045]", usage: "standard secondary modules" },
    { name: "surface-raised", className: "border border-rose-200/15 bg-rose-950/20", usage: "primary product modules" },
    { name: "surface-safe", className: "border border-emerald-300/20 bg-emerald-950/15", usage: "safety and locked boundaries" },
  ],
  textHierarchy: [
    { name: "screen-title", className: "text-2xl font-semibold leading-8 text-white", usage: "main screen heading" },
    { name: "section-title", className: "text-base font-semibold leading-6 text-white", usage: "section headings inside mobile panels" },
    { name: "body", className: "text-sm leading-6 text-slate-300", usage: "result and product body copy" },
    { name: "caption", className: "text-xs leading-5 text-slate-400", usage: "helper text and safety explanation" },
    { name: "micro", className: "text-[11px] leading-4 text-slate-500", usage: "technical status and compact labels" },
  ],
  sectionRhythm: [
    { name: "screen-padding", value: "px-4 py-5", usage: "Mini App safe content inset" },
    { name: "section-stack", value: "space-y-4", usage: "standard vertical section rhythm" },
    { name: "dense-stack", value: "space-y-3", usage: "result card lists" },
    { name: "bottom-safe-area", value: "pb-[calc(1.5rem+env(safe-area-inset-bottom))]", usage: "Telegram bottom controls" },
  ],
  ctaHierarchy: [
    {
      name: "primary",
      className: "inline-flex min-h-12 items-center justify-center rounded-lg bg-rose-500 px-4 py-3 text-sm font-semibold text-white",
      usage: "one main action per screen",
    },
    {
      name: "secondary",
      className: "inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-slate-200",
      usage: "secondary modules and back actions",
    },
    {
      name: "locked",
      className: "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-400",
      usage: "future locked/paywall teaser without unlock",
    },
  ],
  darkThemePalette: {
    appBackground: "#070b14",
    surface: "#0f172a",
    surfaceRaised: "#1f1020",
    border: "rgba(255,255,255,0.10)",
    primaryText: "#ffffff",
    secondaryText: "#cbd5e1",
    mutedText: "#94a3b8",
    roseAccent: "#f43f5e",
    goldAccent: "#f5c36b",
    emeraldSafe: "#34d399",
  },
  gradientUsageRules: [
    "Use gradients only for the primary product moment, not for every card.",
    "Keep secondary modules on calm dark surfaces.",
    "Do not use decorative orbs or bokeh backgrounds.",
    "Never let gradients reduce text contrast.",
  ],
  mobileMaxWidth: "28rem",
  telegramSafeAreaNotes: [
    "Design from 360px width upward.",
    "Keep primary CTA above Telegram bottom controls.",
    "Use bottom safe-area padding on long screens.",
    "Browser fallback keeps the same shell width and rhythm.",
  ],
  safetyFlags: {
    productionLaunchNow: false,
    paymentChangedNow: false,
    vipUnlockNow: false,
    telegramApiNow: false,
    databaseWriteNow: false,
    sendsAnythingNow: false,
  },
};

export function getAphroditeMiniAppDesignTokens(): AphroditeMiniAppDesignTokens {
  return {
    ...aphroditeMiniAppDesignTokens,
    spacingScale: aphroditeMiniAppDesignTokens.spacingScale.map((item) => ({ ...item })),
    radiusScale: aphroditeMiniAppDesignTokens.radiusScale.map((item) => ({ ...item })),
    cardStyle: aphroditeMiniAppDesignTokens.cardStyle.map((item) => ({ ...item })),
    textHierarchy: aphroditeMiniAppDesignTokens.textHierarchy.map((item) => ({ ...item })),
    sectionRhythm: aphroditeMiniAppDesignTokens.sectionRhythm.map((item) => ({ ...item })),
    ctaHierarchy: aphroditeMiniAppDesignTokens.ctaHierarchy.map((item) => ({ ...item })),
    darkThemePalette: { ...aphroditeMiniAppDesignTokens.darkThemePalette },
    gradientUsageRules: [...aphroditeMiniAppDesignTokens.gradientUsageRules],
    telegramSafeAreaNotes: [...aphroditeMiniAppDesignTokens.telegramSafeAreaNotes],
    safetyFlags: { ...aphroditeMiniAppDesignTokens.safetyFlags },
  };
}
