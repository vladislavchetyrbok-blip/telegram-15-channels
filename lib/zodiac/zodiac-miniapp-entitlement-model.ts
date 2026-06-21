export const ENTITLEMENT_TIERS = [
  {
    tier: "Free",
    status: "Active (Default)",
    features: ["Daily horoscopes", "Basic birth matrix", "Public compatibility", "Free affirmations"],
    limitations: ["No deep transit insights", "No detailed relationship scores", "No custom numerology cycles"],
  },
  {
    tier: "VIP Subscription",
    status: "Spec Only (Locked)",
    features: ["Deep birth chart analysis", "Full relationship matrix", "Personalized planetary cycles", "Ad-free experience"],
    limitations: ["Requires active payment via Telegram/Stripe", "Requires verified user ID"],
  },
  {
    tier: "One-Time Unlock",
    status: "Spec Only (Locked)",
    features: ["Single life-area deep dive (e.g., career report)"],
    limitations: ["Access limited to specific purchased report", "No ongoing VIP features"],
  }
];

export const DATA_MODEL_MAPPINGS = [
  {
    entity: "User Profile",
    fields: ["telegram_id", "first_name", "username", "language_code", "created_at", "last_active"],
    purpose: "Base identity resolution from Telegram Mini App initialization data.",
    risk: "Must handle ID changes or deleted accounts gracefully.",
  },
  {
    entity: "Birth Profile",
    fields: ["user_id", "birth_date", "birth_time", "birth_place", "zodiac_sign"],
    purpose: "Stores user's astrological base data to prevent re-entering.",
    risk: "PII data; must be encrypted/anonymized where possible.",
  },
  {
    entity: "Entitlement",
    fields: ["user_id", "tier_id", "provider", "provider_transaction_id", "valid_until", "status"],
    purpose: "Tracks active subscriptions or unlocks.",
    risk: "Source of truth for VIP access; must reconcile with payment provider webhooks.",
  },
  {
    entity: "Session Context",
    fields: ["session_id", "user_id", "init_data_hash", "expires_at"],
    purpose: "Validates Telegram initialization data to prevent spoofing.",
    risk: "Hash validation must be strictly enforced on backend routes.",
  }
];

export const ENTITLEMENT_RISK_CONTROLS = [
  {
    control: "No live database writes",
    status: "Enforced",
    reason: "Mock environment does not connect to Supabase/PostgreSQL for user profiles.",
  },
  {
    control: "No Telegram initData validation",
    status: "Enforced",
    reason: "Running in browser mock mode; real Telegram signatures are not validated yet.",
  },
  {
    control: "VIP status is hardcoded mock",
    status: "Enforced",
    reason: "The UI state for VIP is a toggle in the dashboard, not driven by user entitlement data.",
  }
];
