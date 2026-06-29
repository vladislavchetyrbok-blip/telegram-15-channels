#!/usr/bin/env node

import { getAphroditeBotfatherOwnerActionGate } from "../lib/zodiac/aphrodite-botfather-owner-action-gate.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditeBotfatherOwnerActionGate(),
  packageNumber: 329,
  title: "BotFather Owner Action Gate",
  route: "/dashboard/networks/zodiac/botfather-owner-action-gate",
  statusField: "botFatherOwnerActionStatus",
  statusValue: "WAITING_FOR_MANUAL_BOTFATHER_SETUP",
  modelPath: "../lib/zodiac/aphrodite-botfather-owner-action-gate.ts",
  pagePath: "../app/dashboard/networks/zodiac/botfather-owner-action-gate/page.tsx",
  docsPath: "../docs/aphrodite-botfather-owner-action-gate.md",
  reportPath: "../docs/aphrodite-package-reports/package-329.md",
  dashboardRouteKey: "botFatherOwnerActionGate",
  requiredStrings: [
  "BotFather setup manual only",
  "no BotFather automation",
  "no Telegram API calls",
  "no messages",
  "only after owner approval and public URL verification",
  "no launch from this package"
],
  requiredFalseFields: [
  "botFatherSetupDone"
],
  requiredExactFields: {
  "telegramMiniAppUrlStatus": "NOT_DONE"
},
});
