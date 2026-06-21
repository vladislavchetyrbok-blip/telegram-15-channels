export const PAYMENT_PROVIDERS = [
  {
    provider: "Telegram Stars (Native API)",
    type: "In-App Currency",
    pros: [
      "Frictionless checkout inside Telegram",
      "Native trust from users",
      "Apple/Google compliant for digital goods",
    ],
    cons: [
      "High platform fees (up to ~30% via Apple/Google tax)",
      "Payouts delayed (21+ days via Fragment)",
      "Strict refund policies",
    ],
    complexity: "Low",
    fees: "High (~30%)",
    recommendation: "Primary option for low-ticket digital horoscopes",
  },
  {
    provider: "Stripe",
    type: "Fiat Gateway",
    pros: [
      "Direct payouts (rolling 2-7 days)",
      "Low processing fees",
      "Subscriptions and recurring billing built-in",
    ],
    cons: [
      "Requires user to enter card details",
      "Apple/Google risk if selling digital goods in Mini App on iOS",
      "Requires strict PCI compliance handling",
    ],
    complexity: "Medium",
    fees: "Low (2.9% + 30¢)",
    recommendation: "Fallback / Web-only flow",
  },
  {
    provider: "Crypto (TON)",
    type: "Cryptocurrency",
    pros: [
      "Very low fees",
      "Instant settlement",
      "Native to the Telegram ecosystem",
    ],
    cons: [
      "High user friction for non-crypto natives",
      "Volatility risk",
      "Regulatory gray area",
    ],
    complexity: "High",
    fees: "Very Low",
    recommendation: "Optional alternative checkout",
  }
];

export const PAYMENT_DECISION_RULES = [
  {
    rule: "Digital Goods Policy",
    description: "Telegram mandates Stars or Apple/Google billing for digital goods in iOS mini apps.",
  },
  {
    rule: "Mock State Enforcement",
    description: "Currently, no payment provider SDKs are loaded. The app is purely informational.",
  }
];
