export const RISK_REGISTER = [
  {
    category: "Compliance & App Store",
    risk: "Apple/Google Rejection for Digital Goods",
    description: "Selling digital goods (horoscopes/VIP) via Stripe inside an iOS/Android Mini App violates App Store guidelines.",
    mitigation: "Strictly mandate Telegram Stars for in-app purchases, or move purchase flow to an external web browser.",
    severity: "Critical",
  },
  {
    category: "Security",
    risk: "TELEGRAM_BOT_TOKEN Leakage",
    description: "Accidental exposure of the bot token to the frontend client.",
    mitigation: "Token must only reside in backend environment variables. Validate via `production:safety:check`.",
    severity: "Critical",
  },
  {
    category: "Infrastructure",
    risk: "Database Overload on Launch",
    description: "Massive spike in traffic when the Mini App link is broadcasted to 15 channels.",
    mitigation: "Implement connection pooling (PgBouncer) and rate-limiting on API routes.",
    severity: "High",
  },
  {
    category: "Operations",
    risk: "Missing or Invalid initData",
    description: "Users accessing the web app outside of Telegram without valid context.",
    mitigation: "Enforce strict hash validation. Show a friendly 'Open in Telegram' fallback screen.",
    severity: "Medium",
  }
];

export const ROLLOUT_GATES = [
  {
    gate: "1. Mock Architecture Complete",
    description: "All UI components, content, and routes are built and tested in isolation.",
    status: "Passed",
  },
  {
    gate: "2. Backend Wiring Spec Approved",
    description: "Documentation for hash validation and session management is finalized.",
    status: "Passed",
  },
  {
    gate: "3. Supabase Integration",
    description: "Database is live, migrated, and capable of handling user profiles.",
    status: "Pending",
  },
  {
    gate: "4. Payment Provider Integration",
    description: "Telegram Stars API is wired and tested in the test environment.",
    status: "Pending",
  },
  {
    gate: "5. Production Safety Check Passage",
    description: "Automated checks confirm no secret leaks and environments are correctly configured.",
    status: "Pending",
  }
];
