#!/usr/bin/env node

import { getAphroditeTelegramMiniappFinalManualWorkStopGate } from "../lib/zodiac/aphrodite-telegram-miniapp-final-manual-work-stop-gate.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditeTelegramMiniappFinalManualWorkStopGate(),
  packageNumber: 332,
  title: "Telegram Mini App Final Manual Work Stop Gate",
  route: "/dashboard/networks/zodiac/telegram-miniapp-final-manual-work-stop-gate",
  statusField: "codingReadinessStatus",
  statusValue: "STOP_NEW_READINESS_PACKAGES_UNTIL_MANUAL_INPUTS",
  modelPath: "../lib/zodiac/aphrodite-telegram-miniapp-final-manual-work-stop-gate.ts",
  pagePath: "../app/dashboard/networks/zodiac/telegram-miniapp-final-manual-work-stop-gate/page.tsx",
  docsPath: "../docs/aphrodite-telegram-miniapp-final-manual-work-stop-gate.md",
  reportPath: "../docs/aphrodite-package-reports/package-332.md",
  dashboardRouteKey: "telegramMiniappFinalManualWorkStopGate",
  requiredStrings: [
  "stop adding readiness packages",
  "next steps are manual evidence",
  "owner screenshots",
  "env",
  "backup",
  "restore",
  "public URL",
  "BotFather",
  "do not continue code packages until evidence exists"
],
  requiredFalseFields: [],
  requiredExactFields: {
  "manualWorkRequired": true
},
});
