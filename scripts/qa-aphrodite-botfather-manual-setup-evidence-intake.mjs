#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 298,
  title: "BotFather Manual Setup Evidence Intake",
  slug: "aphrodite-botfather-manual-setup-evidence-intake",
  routeSlug: "botfather-manual-setup-evidence-intake",
  route: "/dashboard/networks/zodiac/botfather-manual-setup-evidence-intake",
  routeKey: "botFatherManualSetupEvidenceIntake",
  getterName: "getAphroditeBotfatherManualSetupEvidenceIntake",
  statuses: {
    botFatherSetupStatus: "NOT_DONE",
    telegramMiniAppUrlStatus: "MANUAL_BOTFATHER_SETUP_NOT_DONE",
    botFatherSetupDone: false,
  },
  requiredPhrases: [
    "BotFather setup is manual only",
    "No Telegram API",
    "No BotFather automation",
    "No messages",
    "Setup only after owner approval and public URL verification",
  ],
});
