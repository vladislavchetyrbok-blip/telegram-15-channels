export const WIRING_STAGES = [
  {
    stage: "1. Secret Configuration",
    description: "Setting up Telegram Bot Tokens securely.",
    requirements: ["TELEGRAM_BOT_TOKEN must be in production environment variables", "Never expose to frontend"],
    status: "Pending",
  },
  {
    stage: "2. Hash Validation Endpoint",
    description: "Backend route to cryptographically verify initData from Telegram.",
    requirements: ["Create /api/miniapp/auth", "Validate hash using HMAC-SHA-256", "Check auth_date is within acceptable window"],
    status: "Pending",
  },
  {
    stage: "3. Session Provider",
    description: "React Context to hold validated user data.",
    requirements: ["Wrap Mini App layout", "Only render protected routes if session is valid"],
    status: "Pending",
  },
  {
    stage: "4. Database Sync",
    description: "Upserting the validated user to the database.",
    requirements: ["Supabase connection required", "Upsert User Profile on successful auth"],
    status: "Pending",
  }
];

export const ENV_VARIABLES_REQUIRED = [
  {
    name: "TELEGRAM_BOT_TOKEN",
    purpose: "Required to validate the initData hash.",
    risk: "Critical secret; leak allows full bot takeover.",
  },
  {
    name: "DATABASE_URL",
    purpose: "Required to sync user profiles and entitlements.",
    risk: "Database access credential.",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    purpose: "For defining webhook and callback URLs if necessary.",
    risk: "Low; public URL.",
  }
];

export const WIRING_RISK_CONTROLS = [
  {
    control: "Mock bypass is active",
    status: "Enforced",
    reason: "No Telegram API call is made; the app renders using mock static data.",
  },
  {
    control: "No /api/miniapp/auth route",
    status: "Enforced",
    reason: "Auth route does not exist to prevent accidental live usage.",
  },
  {
    control: "Protected from automated checks",
    status: "Enforced",
    reason: "production:safety:check verifies TELEGRAM_BOT_TOKEN is not accidentally active in mock state.",
  }
];
