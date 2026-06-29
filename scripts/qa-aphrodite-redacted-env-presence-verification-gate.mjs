#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 294,
  title: "Redacted Env Presence Verification Gate",
  slug: "aphrodite-redacted-env-presence-verification-gate",
  routeSlug: "redacted-env-presence-verification-gate",
  route: "/dashboard/networks/zodiac/redacted-env-presence-verification-gate",
  routeKey: "redactedEnvPresenceVerificationGate",
  getterName: "getAphroditeRedactedEnvPresenceVerificationGate",
  statuses: {
    databaseUrlPresence: "MISSING_OR_NOT_VERIFIED",
    telegramBotTokenPresence: "MISSING_OR_NOT_VERIFIED",
    secretsPrinted: false,
  },
  requiredPhrases: [
    "Use redacted presence checker only",
    "Never print DATABASE_URL",
    "Never print TELEGRAM_BOT_TOKEN",
    "Never paste secrets into chat",
    "Configure env only outside Git",
  ],
});
