export type MiniAppCtaAuditItem = {
  sourceRoute: string;
  label: string;
  destination: string;
  ctaType: "primary" | "secondary" | "safety" | "preview" | "navigation";
  safetyStatus: "safe" | "needs-review" | "future-only";
  reason: string;
};

export const miniappCtaAuditBaseline: MiniAppCtaAuditItem[] = [
  {
    sourceRoute: "/miniapp",
    label: "Check compatibility",
    destination: "/compatibility",
    ctaType: "primary",
    safetyStatus: "safe",
    reason: "Links to existing compatibility checker.",
  },
  {
    sourceRoute: "/miniapp",
    label: "Try mock Birth Matrix",
    destination: "/birth-matrix",
    ctaType: "primary",
    safetyStatus: "safe",
    reason: "Links to safe static mock.",
  },
  {
    sourceRoute: "/miniapp",
    label: "Preview Mystic Numbers",
    destination: "/mystic-numbers",
    ctaType: "primary",
    safetyStatus: "safe",
    reason: "Links to safe static mock.",
  },
  {
    sourceRoute: "/miniapp",
    label: "Open Affirmations",
    destination: "/affirmations",
    ctaType: "primary",
    safetyStatus: "safe",
    reason: "Links to safe static mock.",
  },
  {
    sourceRoute: "/miniapp",
    label: "VIP Preview",
    destination: "/vip-preview",
    ctaType: "preview",
    safetyStatus: "safe",
    reason: "Links to safe static shell. No unlock logic.",
  },
  {
    sourceRoute: "/birth-matrix",
    label: "Back",
    destination: "/miniapp",
    ctaType: "navigation",
    safetyStatus: "safe",
    reason: "Safe navigation back to hub.",
  },
  {
    sourceRoute: "/mystic-numbers",
    label: "Back",
    destination: "/miniapp",
    ctaType: "navigation",
    safetyStatus: "safe",
    reason: "Safe navigation back to hub.",
  },
  {
    sourceRoute: "/affirmations",
    label: "Back",
    destination: "/miniapp",
    ctaType: "navigation",
    safetyStatus: "safe",
    reason: "Safe navigation back to hub.",
  },
  {
    sourceRoute: "/vip-preview",
    label: "Back",
    destination: "/miniapp",
    ctaType: "navigation",
    safetyStatus: "safe",
    reason: "Safe navigation back to hub.",
  },
  {
    sourceRoute: "/miniapp",
    label: "View safety baseline",
    destination: "/dashboard/networks/zodiac/miniapp-route-safety",
    ctaType: "safety",
    safetyStatus: "safe",
    reason: "Internal safety documentation link.",
  },
  {
    sourceRoute: "/miniapp",
    label: "Mini App Architecture",
    destination: "/dashboard/networks/zodiac/miniapp-architecture",
    ctaType: "safety",
    safetyStatus: "safe",
    reason: "Internal architecture documentation link.",
  },
  {
    sourceRoute: "/miniapp",
    label: "Mini App Audit",
    destination: "/dashboard/networks/zodiac/miniapp-audit",
    ctaType: "safety",
    safetyStatus: "safe",
    reason: "Internal audit documentation link.",
  },
  {
    sourceRoute: "/miniapp",
    label: "Stability Matrix",
    destination: "/dashboard/networks/zodiac/stability",
    ctaType: "safety",
    safetyStatus: "safe",
    reason: "Internal stability documentation link.",
  }
];
