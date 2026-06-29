#!/usr/bin/env node

import { getAphroditeTelegramMiniappFinalPreManualSummary } from "../lib/zodiac/aphrodite-telegram-miniapp-final-pre-manual-summary.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditeTelegramMiniappFinalPreManualSummary(),
  packageNumber: 333,
  title: "Telegram Mini App Final Pre-Manual Summary",
  route: "/dashboard/networks/zodiac/telegram-miniapp-final-pre-manual-summary",
  statusField: "telegramMiniAppPreManualStatus",
  statusValue: "READY_FOR_OWNER_MANUAL_WORK",
  modelPath: "../lib/zodiac/aphrodite-telegram-miniapp-final-pre-manual-summary.ts",
  pagePath: "../app/dashboard/networks/zodiac/telegram-miniapp-final-pre-manual-summary/page.tsx",
  docsPath: "../docs/aphrodite-telegram-miniapp-final-pre-manual-summary.md",
  reportPath: "../docs/aphrodite-package-reports/package-333.md",
  dashboardRouteKey: "telegramMiniappFinalPreManualSummary",
  requiredStrings: [
  "Packages through 333",
  "Package 303 VIP density fix merged",
  "304-313 merged",
  "all remaining blockers",
  "mobile track is separate",
  "Package 334 - Owner Evidence Review After Real Inputs"
],
  requiredFalseFields: [
  "readyForProductionLaunch"
],
  requiredExactFields: {},
});
