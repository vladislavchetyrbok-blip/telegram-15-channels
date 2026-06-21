export type AuditStatus =
  | "verified"
  | "needs review"
  | "placeholder"
  | "missing"
  | "risky"
  | "protected";

export type RiskLevel = "low" | "medium" | "high" | "none";

export interface NavigationAuditItem {
  id: string;
  area: string;
  label: string;
  status: AuditStatus;
  riskLevel: RiskLevel;
  checked: string;
  nextAction: string;
}

export const zodiacMiniAppNavigationAudit: NavigationAuditItem[] = [
  {
    id: "cta-daily-compatibility",
    area: "Daily Automation CTA",
    label: "💞 Проверить совместимость",
    status: "verified",
    riskLevel: "low",
    checked: "scripts/zodiac-telegram-publisher.mjs - Daily CTA row builder",
    nextAction: "None. Works as designed.",
  },
  {
    id: "cta-daily-mystic",
    area: "Daily Automation CTA",
    label: "🔮 Открыть Mini App (startapp=mystic)",
    status: "verified",
    riskLevel: "low",
    checked: "scripts/zodiac-telegram-publisher.mjs - mystic parameter",
    nextAction: "None. Works as designed.",
  },
  {
    id: "route-compatibility-ui",
    area: "Dashboard / Mini App UI",
    label: "/compatibility",
    status: "verified",
    riskLevel: "none",
    checked: "app/dashboard/networks/zodiac/page.tsx - Platform Sections",
    nextAction: "Consider moving into /dashboard/miniapp structure in future.",
  },
  {
    id: "route-birth-matrix",
    area: "Mini App UI",
    label: "Birth Matrix Flow",
    status: "placeholder",
    riskLevel: "low",
    checked: "General architecture review",
    nextAction: "Design and implement Birth Matrix UI screens and routing.",
  },
  {
    id: "route-mystic-numbers",
    area: "Mini App UI",
    label: "Mystic / Numbers / Affirmations",
    status: "placeholder",
    riskLevel: "medium",
    checked: "General architecture review",
    nextAction: "Define data structure and UI for personalized mystic numbers.",
  },
  {
    id: "route-vip-entry",
    area: "Mini App UI",
    label: "VIP Entry Points",
    status: "missing",
    riskLevel: "medium",
    checked: "General architecture review",
    nextAction: "Design payment gate and VIP routing logic.",
  },
  {
    id: "telegram-bot-handler",
    area: "Telegram Bot API",
    label: "Bot sending logic / Webhooks",
    status: "protected",
    riskLevel: "high",
    checked: "Rule: do not touch live delivery logic",
    nextAction: "Maintain strict separation from Mini App UI changes.",
  },
  {
    id: "route-miniapp-audit",
    area: "Dashboard",
    label: "/dashboard/networks/zodiac/miniapp-audit",
    status: "verified",
    riskLevel: "none",
    checked: "Package 101 creation",
    nextAction: "Keep updated as new Mini App routes are added.",
  },
];
