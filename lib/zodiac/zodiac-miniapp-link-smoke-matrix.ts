export type MiniAppLinkSmokeItem = {
  sourceRoute: string;
  destinationRoute: string;
  label: string;
  linkType: "primary" | "secondary" | "safety" | "dashboard" | "preview" | "navigation";
  sourceSurface: "user-facing" | "dashboard" | "docs";
  destinationStatus: "existing" | "active-mock" | "preview-only" | "dashboard-readiness";
  required: boolean;
  safetyStatus: "safe" | "future-only" | "needs-review";
  reason: string;
};

export type MiniAppLinkSmokeGroup = {
  group: string;
  description: string;
  items: MiniAppLinkSmokeItem[];
};

export const ZODIAC_MINIAPP_LINK_SMOKE_MATRIX: MiniAppLinkSmokeGroup[] = [
  {
    group: "User-Facing Hub Outbound Links",
    description: "Links from the central Mini App Hub to functional and mock routes.",
    items: [
      {
        sourceRoute: "/miniapp",
        destinationRoute: "/compatibility",
        label: "Compatibility",
        linkType: "primary",
        sourceSurface: "user-facing",
        destinationStatus: "existing",
        required: true,
        safetyStatus: "safe",
        reason: "Core existing flow."
      },
      {
        sourceRoute: "/miniapp",
        destinationRoute: "/birth-matrix",
        label: "Birth Matrix",
        linkType: "primary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: true,
        safetyStatus: "safe",
        reason: "Mock exploration module."
      },
      {
        sourceRoute: "/miniapp",
        destinationRoute: "/mystic-numbers",
        label: "Mystic Numbers",
        linkType: "primary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: true,
        safetyStatus: "safe",
        reason: "Mock exploration module."
      },
      {
        sourceRoute: "/miniapp",
        destinationRoute: "/affirmations",
        label: "Affirmations",
        linkType: "primary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: true,
        safetyStatus: "safe",
        reason: "Mock exploration module."
      },
      {
        sourceRoute: "/miniapp",
        destinationRoute: "/vip-preview",
        label: "VIP Preview",
        linkType: "preview",
        sourceSurface: "user-facing",
        destinationStatus: "preview-only",
        required: true,
        safetyStatus: "safe",
        reason: "Visual preview shell for VIP boundary."
      }
    ]
  },
  {
    group: "User-Facing Return Links",
    description: "Links from individual modules back to the Hub or cross-linking modules.",
    items: [
      {
        sourceRoute: "/birth-matrix",
        destinationRoute: "/miniapp",
        label: "Back to Mini App Hub",
        linkType: "navigation",
        sourceSurface: "user-facing",
        destinationStatus: "existing",
        required: true,
        safetyStatus: "safe",
        reason: "Prevent user entrapment in mock route."
      },
      {
        sourceRoute: "/birth-matrix",
        destinationRoute: "/compatibility",
        label: "Compatibility",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "existing",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link to existing flow."
      },
      {
        sourceRoute: "/birth-matrix",
        destinationRoute: "/mystic-numbers",
        label: "Mystic Numbers",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link to sibling mock."
      },
      {
        sourceRoute: "/birth-matrix",
        destinationRoute: "/affirmations",
        label: "Affirmations",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link to sibling mock."
      },
      {
        sourceRoute: "/birth-matrix",
        destinationRoute: "/vip-preview",
        label: "VIP Preview",
        linkType: "preview",
        sourceSurface: "user-facing",
        destinationStatus: "preview-only",
        required: false,
        safetyStatus: "safe",
        reason: "Upsell preview hook."
      },
      {
        sourceRoute: "/mystic-numbers",
        destinationRoute: "/miniapp",
        label: "Back to Mini App Hub",
        linkType: "navigation",
        sourceSurface: "user-facing",
        destinationStatus: "existing",
        required: true,
        safetyStatus: "safe",
        reason: "Prevent user entrapment."
      },
      {
        sourceRoute: "/mystic-numbers",
        destinationRoute: "/birth-matrix",
        label: "Birth Matrix",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link."
      },
      {
        sourceRoute: "/mystic-numbers",
        destinationRoute: "/affirmations",
        label: "Affirmations",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link."
      },
      {
        sourceRoute: "/mystic-numbers",
        destinationRoute: "/vip-preview",
        label: "VIP Preview",
        linkType: "preview",
        sourceSurface: "user-facing",
        destinationStatus: "preview-only",
        required: false,
        safetyStatus: "safe",
        reason: "Upsell hook."
      },
      {
        sourceRoute: "/affirmations",
        destinationRoute: "/miniapp",
        label: "Back to Mini App Hub",
        linkType: "navigation",
        sourceSurface: "user-facing",
        destinationStatus: "existing",
        required: true,
        safetyStatus: "safe",
        reason: "Prevent user entrapment."
      },
      {
        sourceRoute: "/affirmations",
        destinationRoute: "/birth-matrix",
        label: "Birth Matrix",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link."
      },
      {
        sourceRoute: "/affirmations",
        destinationRoute: "/mystic-numbers",
        label: "Mystic Numbers",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link."
      },
      {
        sourceRoute: "/affirmations",
        destinationRoute: "/vip-preview",
        label: "VIP Preview",
        linkType: "preview",
        sourceSurface: "user-facing",
        destinationStatus: "preview-only",
        required: false,
        safetyStatus: "safe",
        reason: "Upsell hook."
      },
      {
        sourceRoute: "/vip-preview",
        destinationRoute: "/miniapp",
        label: "Back to Mini App Hub",
        linkType: "navigation",
        sourceSurface: "user-facing",
        destinationStatus: "existing",
        required: true,
        safetyStatus: "safe",
        reason: "Prevent user entrapment."
      },
      {
        sourceRoute: "/vip-preview",
        destinationRoute: "/compatibility",
        label: "Compatibility",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "existing",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link."
      },
      {
        sourceRoute: "/vip-preview",
        destinationRoute: "/birth-matrix",
        label: "Birth Matrix",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link."
      },
      {
        sourceRoute: "/vip-preview",
        destinationRoute: "/mystic-numbers",
        label: "Mystic Numbers",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link."
      },
      {
        sourceRoute: "/vip-preview",
        destinationRoute: "/affirmations",
        label: "Affirmations",
        linkType: "secondary",
        sourceSurface: "user-facing",
        destinationStatus: "active-mock",
        required: false,
        safetyStatus: "safe",
        reason: "Cross-link."
      }
    ]
  },
  {
    group: "Dashboard Readiness Links",
    description: "Links from the dashboard navigating the safety boundaries of the Mini App system.",
    items: [
      {
        sourceRoute: "/dashboard/networks/zodiac",
        destinationRoute: "/dashboard/networks/zodiac/miniapp-readiness",
        label: "Mini App Readiness",
        linkType: "dashboard",
        sourceSurface: "dashboard",
        destinationStatus: "dashboard-readiness",
        required: true,
        safetyStatus: "safe",
        reason: "Central visibility of readiness status."
      },
      {
        sourceRoute: "/dashboard/networks/zodiac",
        destinationRoute: "/dashboard/networks/zodiac/miniapp-route-safety",
        label: "Mini App Route Safety",
        linkType: "safety",
        sourceSurface: "dashboard",
        destinationStatus: "dashboard-readiness",
        required: true,
        safetyStatus: "safe",
        reason: "Safety matrix link."
      },
      {
        sourceRoute: "/dashboard/networks/zodiac",
        destinationRoute: "/dashboard/networks/zodiac/miniapp-cta-audit",
        label: "Mini App CTA Audit",
        linkType: "safety",
        sourceSurface: "dashboard",
        destinationStatus: "dashboard-readiness",
        required: true,
        safetyStatus: "safe",
        reason: "CTA wording verification."
      },
      {
        sourceRoute: "/dashboard/networks/zodiac/miniapp-readiness",
        destinationRoute: "/dashboard/networks/zodiac/miniapp-route-safety",
        label: "View Route Safety",
        linkType: "safety",
        sourceSurface: "dashboard",
        destinationStatus: "dashboard-readiness",
        required: true,
        safetyStatus: "safe",
        reason: "Detailed breakdown of safe routes."
      },
      {
        sourceRoute: "/dashboard/networks/zodiac/miniapp-readiness",
        destinationRoute: "/dashboard/networks/zodiac/miniapp-cta-audit",
        label: "View CTA Audit",
        linkType: "safety",
        sourceSurface: "dashboard",
        destinationStatus: "dashboard-readiness",
        required: true,
        safetyStatus: "safe",
        reason: "Detailed CTA check."
      },
      {
        sourceRoute: "/dashboard/networks/zodiac/miniapp-readiness",
        destinationRoute: "/dashboard/networks/zodiac/miniapp-architecture",
        label: "Architecture Spec",
        linkType: "dashboard",
        sourceSurface: "dashboard",
        destinationStatus: "dashboard-readiness",
        required: true,
        safetyStatus: "safe",
        reason: "Reference spec."
      },
      {
        sourceRoute: "/dashboard/networks/zodiac/miniapp-readiness",
        destinationRoute: "/dashboard/networks/zodiac/stability",
        label: "Stability Matrix",
        linkType: "dashboard",
        sourceSurface: "dashboard",
        destinationStatus: "dashboard-readiness",
        required: true,
        safetyStatus: "safe",
        reason: "System-wide stability baseline."
      }
    ]
  },
  {
    group: "Blocked Future Links & Live CTAs",
    description: "Links that are intentionally blocked or not yet wired.",
    items: [
      {
        sourceRoute: "Live Telegram Posts",
        destinationRoute: "/miniapp",
        label: "Open Mini App Hub",
        linkType: "primary",
        sourceSurface: "user-facing",
        destinationStatus: "existing",
        required: false,
        safetyStatus: "future-only",
        reason: "Must not be wired until production monetization architecture is decided and payments are real."
      },
      {
        sourceRoute: "/vip-preview",
        destinationRoute: "Payment Gateway",
        label: "Unlock VIP / Purchase",
        linkType: "primary",
        sourceSurface: "user-facing",
        destinationStatus: "preview-only",
        required: false,
        safetyStatus: "future-only",
        reason: "Requires database, Telegram Star payments, and user subscription mapping."
      }
    ]
  }
];
