export interface ZodiacStabilityItem {
  id: string;
  area: string;
  status: string;
  riskLevel: "Low" | "Medium" | "High";
  protectedComponent: string;
  doNotModify: string;
  recommendedAction: string;
}

export const ZodiacStabilityMatrix: ZodiacStabilityItem[] = [
  {
    id: "daily-automation",
    area: "Daily Zodiac Automation",
    status: "protected",
    riskLevel: "Low",
    protectedComponent: "publish-zodiac-by-date.mjs, cron schedule",
    doNotModify: "do not modify cron or live logic",
    recommendedAction: "Monitor via dashboard"
  },
  {
    id: "weekly-automation",
    area: "Weekly Zodiac Automation",
    status: "protected",
    riskLevel: "Low",
    protectedComponent: "publish-zodiac-weekly-by-week.mjs, cron schedule",
    doNotModify: "do not modify cron or live logic",
    recommendedAction: "Monitor via dashboard"
  },
  {
    id: "ledger-tracking",
    area: "Ledger Tracking",
    status: "passing",
    riskLevel: "Low",
    protectedComponent: "data/ledger, check-zodiac-publish-ledger.mjs",
    doNotModify: "do not alter ledger format",
    recommendedAction: "Use UI to verify data integrity"
  },
  {
    id: "cta-links",
    area: "CTA Links",
    status: "read-only",
    riskLevel: "Low",
    protectedComponent: "bot sending logic, Zodiac formatting",
    doNotModify: "do not change existing live links",
    recommendedAction: "Verify safe soft launch settings"
  },
  {
    id: "miniapp-smoke",
    area: "Mini App Smoke",
    status: "passing",
    riskLevel: "Low",
    protectedComponent: "smoke-zodiac-mini-app.mjs",
    doNotModify: "do not bypass smoke checks",
    recommendedAction: "Run local smoke checks periodically"
  },
  {
    id: "manual-review",
    area: "Manual Review",
    status: "read-only",
    riskLevel: "Low",
    protectedComponent: "Queue statuses, Dashboard UI",
    doNotModify: "must remain UI-only, do not block daily automation",
    recommendedAction: "Use as approval gate for new features"
  },
  {
    id: "production-safety",
    area: "Production Safety",
    status: "expected locked",
    riskLevel: "Low",
    protectedComponent: "check-production-safety.mjs, live env variables",
    doNotModify: "do not expose tokens or remove safety locks",
    recommendedAction: "needs env before live"
  },
  {
    id: "dashboard-qa",
    area: "Dashboard QA",
    status: "passing",
    riskLevel: "Low",
    protectedComponent: "qa-zodiac-dashboard.mjs",
    doNotModify: "do not skip QA before commits",
    recommendedAction: "Run before any package commit"
  }
];
