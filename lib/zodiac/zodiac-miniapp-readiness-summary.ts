export type MiniAppReadinessRoute = {
  route: string;
  title: string;
  status: "existing" | "active-mock" | "preview-only" | "dashboard-readiness";
  packageIntroduced: string;
  safetyBoundary: string[];
  qaCoverage: string;
  nextAction: string;
};

export type MiniAppReadinessPackage = {
  packageNumber: string;
  title: string;
  result: string;
  safetyImpact: string;
};

export type MiniAppReadinessRisk = {
  area: string;
  status: "protected" | "blocked" | "future-only" | "needs-review";
  reason: string;
  safeNextAction: string;
};

export const miniappReadinessRoutes: MiniAppReadinessRoute[] = [
  {
    route: "/miniapp",
    title: "Mini App Hub",
    status: "active-mock",
    packageIntroduced: "Package 106",
    safetyBoundary: ["No active Telegram CTA logic changed", "No payments"],
    qaCoverage: "Route assertions, CTA audit",
    nextAction: "Internal Link Smoke Matrix",
  },
  {
    route: "/compatibility",
    title: "Compatibility Check",
    status: "active-mock",
    packageIntroduced: "Pre-existing (Package 101 audited)",
    safetyBoundary: ["No active Telegram CTA logic changed", "No database writes"],
    qaCoverage: "Route assertions",
    nextAction: "Compatibility Flow Safety Audit",
  },
  {
    route: "/birth-matrix",
    title: "Birth Matrix Mock",
    status: "active-mock",
    packageIntroduced: "Package 103",
    safetyBoundary: ["No database writes", "Static payload only"],
    qaCoverage: "Route assertions, Content Quality check",
    nextAction: "Maintain mock state",
  },
  {
    route: "/mystic-numbers",
    title: "Mystic Numbers Mock",
    status: "active-mock",
    packageIntroduced: "Package 104",
    safetyBoundary: ["No database writes", "Static payload only"],
    qaCoverage: "Route assertions, Content Quality check",
    nextAction: "Maintain mock state",
  },
  {
    route: "/affirmations",
    title: "Affirmations Mock",
    status: "active-mock",
    packageIntroduced: "Package 105",
    safetyBoundary: ["No database writes", "Static payload only"],
    qaCoverage: "Route assertions, Content Quality check",
    nextAction: "Maintain mock state",
  },
  {
    route: "/vip-preview",
    title: "VIP Preview Shell",
    status: "preview-only",
    packageIntroduced: "Package 107",
    safetyBoundary: ["No payments", "No real VIP access"],
    qaCoverage: "Route assertions, CTA audit",
    nextAction: "Maintain mock state",
  },
  {
    route: "/dashboard/networks/zodiac/miniapp-audit",
    title: "Mini App Navigation Audit",
    status: "dashboard-readiness",
    packageIntroduced: "Package 101",
    safetyBoundary: ["Read-only dashboard"],
    qaCoverage: "Dashboard QA",
    nextAction: "Maintain audit",
  },
  {
    route: "/dashboard/networks/zodiac/miniapp-architecture",
    title: "Mini App Architecture",
    status: "dashboard-readiness",
    packageIntroduced: "Package 102",
    safetyBoundary: ["Read-only dashboard"],
    qaCoverage: "Dashboard QA",
    nextAction: "Maintain spec",
  },
  {
    route: "/dashboard/networks/zodiac/miniapp-route-safety",
    title: "Mini App Route Safety",
    status: "dashboard-readiness",
    packageIntroduced: "Package 108",
    safetyBoundary: ["Read-only dashboard"],
    qaCoverage: "Dashboard QA",
    nextAction: "Maintain baseline",
  },
  {
    route: "/dashboard/networks/zodiac/miniapp-cta-audit",
    title: "Mini App CTA Audit",
    status: "dashboard-readiness",
    packageIntroduced: "Package 111",
    safetyBoundary: ["Read-only dashboard"],
    qaCoverage: "Dashboard QA",
    nextAction: "Maintain audit",
  },
  {
    route: "/dashboard/networks/zodiac/stability",
    title: "Stability Matrix",
    status: "dashboard-readiness",
    packageIntroduced: "Package 100",
    safetyBoundary: ["Read-only dashboard"],
    qaCoverage: "Dashboard QA",
    nextAction: "Maintain matrix",
  }
];

export const miniappReadinessPackages: MiniAppReadinessPackage[] = [
  {
    packageNumber: "103",
    title: "Birth Matrix Mock",
    result: "Created static UI for birth matrix",
    safetyImpact: "Safe static route, no DB",
  },
  {
    packageNumber: "104",
    title: "Mystic Numbers Mock",
    result: "Created static UI for mystic numbers",
    safetyImpact: "Safe static route, no DB",
  },
  {
    packageNumber: "105",
    title: "Affirmations Mock",
    result: "Created static UI for affirmations",
    safetyImpact: "Safe static route, no DB",
  },
  {
    packageNumber: "106",
    title: "Mini App Hub",
    result: "Created central hub linking mocks",
    safetyImpact: "Safe static routing",
  },
  {
    packageNumber: "107",
    title: "VIP Preview Shell",
    result: "Created static boundary for VIP",
    safetyImpact: "No real VIP access/payments",
  },
  {
    packageNumber: "108",
    title: "Route Safety Baseline",
    result: "Documented QA and safety rules",
    safetyImpact: "Formalized boundaries",
  },
  {
    packageNumber: "109",
    title: "Mobile UX Polish",
    result: "Improved mock visual layouts",
    safetyImpact: "CSS/UI only",
  },
  {
    packageNumber: "110",
    title: "Content Quality Pass",
    result: "Softened transactional mock language",
    safetyImpact: "Non-transactional wording",
  },
  {
    packageNumber: "111",
    title: "CTA Consistency Audit",
    result: "Standardized links across modules",
    safetyImpact: "Safe internal navigation",
  }
];

export const miniappReadinessRisks: MiniAppReadinessRisk[] = [
  {
    area: "Payments",
    status: "blocked",
    reason: "Payments not implemented",
    safeNextAction: "Mini App Production Monetization Architecture",
  },
  {
    area: "VIP Access",
    status: "blocked",
    reason: "Real VIP access not implemented",
    safeNextAction: "Maintain VIP preview shell",
  },
  {
    area: "Database",
    status: "blocked",
    reason: "Database persistence not implemented",
    safeNextAction: "Future profile storage design",
  },
  {
    area: "Telegram API",
    status: "protected",
    reason: "Telegram API not used by mock routes",
    safeNextAction: "Maintain disconnected mock",
  },
  {
    area: "Telegram CTA",
    status: "protected",
    reason: "Active Telegram CTA generation unchanged",
    safeNextAction: "Do not touch production scripts",
  },
  {
    area: "Production Environment",
    status: "protected",
    reason: "Production env missing is expected in locked mode",
    safeNextAction: "Maintain locked local safety",
  },
  {
    area: "Daily/Weekly Automation",
    status: "protected",
    reason: "Daily/weekly automation must remain protected",
    safeNextAction: "Do not block scripts",
  }
];
