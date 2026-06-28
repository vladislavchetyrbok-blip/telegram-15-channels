export type ZodiacCompatibilityReportSection = {
  id: string;
  title: string;
  purpose: string;
  previewLevel: "free-preview" | "future-vip";
  contentTone: "practical" | "emotional" | "reflective" | "warning" | "growth";
  safetyBoundary: string[];
};

export type ZodiacCompatibilityReportInput = {
  firstSign: string;
  secondSign: string;
  firstName?: string;
  secondName?: string;
};

export type ZodiacCompatibilityReportMockResult = {
  headline: string;
  summary: string;
  sections: Array<{
    title: string;
    text: string;
    practicalHint: string;
    previewLevel: "free-preview" | "future-vip";
  }>;
  vipBoundaryNote: string;
};

export type ZodiacVipCompatibilityProductBoundary = {
  area: string;
  status:
    | "content-foundation-only"
    | "future-entitlement-required"
    | "future-payment-required"
    | "blocked";
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export function getVipCompatibilityReportSections(): ZodiacCompatibilityReportSection[] {
  return [
    {
      id: "headline",
      title: "Relationship Headline",
      purpose: "Provide an immediate sense of the core dynamic.",
      previewLevel: "free-preview",
      contentTone: "reflective",
      safetyBoundary: ["No absolute claims", "No 'soulmate' guarantees"],
    },
    {
      id: "emotional",
      title: "Emotional Compatibility",
      purpose: "Describe how these signs process feelings together.",
      previewLevel: "free-preview",
      contentTone: "emotional",
      safetyBoundary: ["Focus on understanding, not fixing"],
    },
    {
      id: "communication",
      title: "Communication Style",
      purpose: "Highlight how they share ideas and resolve tension.",
      previewLevel: "future-vip",
      contentTone: "practical",
      safetyBoundary: ["Avoid blaming language"],
    },
    {
      id: "trust",
      title: "Trust and Stability",
      purpose: "Examine security and foundational trust.",
      previewLevel: "future-vip",
      contentTone: "growth",
      safetyBoundary: ["Do not declare infidelity risks"],
    },
    {
      id: "conflict",
      title: "Conflict Patterns",
      purpose: "Identify typical friction points.",
      previewLevel: "future-vip",
      contentTone: "warning",
      safetyBoundary: ["Keep constructive and resolvable"],
    },
    {
      id: "romantic",
      title: "Romantic Chemistry",
      purpose: "Explore intimacy and romantic expression.",
      previewLevel: "future-vip",
      contentTone: "emotional",
      safetyBoundary: ["Keep PG/safe for work", "Focus on emotional bond"],
    },
    {
      id: "daily",
      title: "Daily-life Compatibility",
      purpose: "How they handle routines and shared spaces.",
      previewLevel: "future-vip",
      contentTone: "practical",
      safetyBoundary: ["Lighthearted observations"],
    },
    {
      id: "growth",
      title: "Growth Potential",
      purpose: "How the relationship evolves over time.",
      previewLevel: "future-vip",
      contentTone: "growth",
      safetyBoundary: ["Encouraging, not demanding"],
    },
    {
      id: "risk",
      title: "Risk Zones",
      purpose: "Areas that require mindfulness.",
      previewLevel: "future-vip",
      contentTone: "warning",
      safetyBoundary: ["Do not predict relationship failure"],
    },
    {
      id: "advice",
      title: "Practical Advice",
      purpose: "Actionable steps for harmony.",
      previewLevel: "future-vip",
      contentTone: "practical",
      safetyBoundary: ["Suggestions only, no commands"],
    },
    {
      id: "summary",
      title: "Future VIP Summary",
      purpose: "Wrap-up reflection.",
      previewLevel: "future-vip",
      contentTone: "reflective",
      safetyBoundary: ["No fate-sealing conclusions"],
    },
  ];
}

export function createVipCompatibilityReportMock(
  input: ZodiacCompatibilityReportInput
): ZodiacCompatibilityReportMockResult {
  const name1 = input.firstName || input.firstSign;
  const name2 = input.secondName || input.secondSign;

  return {
    headline: `The Cosmic Dynamic Between ${name1} and ${name2}`,
    summary: `When ${input.firstSign} and ${input.secondSign} come together, it often creates a unique and fascinating energy. This mock report outlines the areas where harmony thrives and where mindful effort may be required. Remember, astrology offers a lens for reflection, not a final judgment.`,
    vipBoundaryNote:
      "Это mock-фундамент контента. Реальная VIP-разблокировка, платежи и глубокая персональная генерация сейчас отключены VIP Access Boundary.",
    sections: [
      {
        title: "Emotional Landscape",
        text: `${name1} and ${name2} may experience feelings differently, yet this contrast can offer profound opportunities to learn from one another.`,
        practicalHint: "Take time to listen without intending to reply immediately.",
        previewLevel: "free-preview",
      },
      {
        title: "Communication Patterns",
        text: `The way ${input.firstSign} expresses thoughts might occasionally surprise ${input.secondSign}. Understanding this rhythm is key.`,
        practicalHint: "Clarify intentions before jumping to conclusions.",
        previewLevel: "future-vip",
      },
      {
        title: "Navigating Conflict",
        text: `Friction tends to emerge when expectations aren't voiced. Watch this area, as unresolved minor irritations can build up.`,
        practicalHint: "Address small things gently before they grow.",
        previewLevel: "future-vip",
      },
    ],
  };
}

export function getVipCompatibilityProductBoundaries(): ZodiacVipCompatibilityProductBoundary[] {
  return [
    {
      area: "Content Foundation",
      status: "content-foundation-only",
      allowedNow: ["Static mock reports", "Dashboard read-only previews"],
      blockedUntil: [],
      riskLevel: "low",
    },
    {
      area: "Entitlement Checks",
      status: "future-entitlement-required",
      allowedNow: [],
      blockedUntil: ["Package 127 Entitlement Boundary Integration"],
      riskLevel: "medium",
    },
    {
      area: "Real Payments",
      status: "blocked",
      allowedNow: [],
      blockedUntil: ["Owner approval for Telegram Stars", "Production API keys"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Distribution",
      status: "blocked",
      allowedNow: [],
      blockedUntil: ["Owner approval for VIP content broadcasts"],
      riskLevel: "high",
    },
  ];
}
