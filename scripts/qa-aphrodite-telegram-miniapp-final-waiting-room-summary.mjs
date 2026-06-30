#!/usr/bin/env node

import { getAphroditeTelegramMiniappFinalWaitingRoomSummary } from "../lib/zodiac/aphrodite-telegram-miniapp-final-waiting-room-summary.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeTelegramMiniappFinalWaitingRoomSummary(),
  packageNumber: 354,
  title: "Telegram Mini App Final Waiting Room Summary",
  route: "/dashboard/networks/zodiac/telegram-miniapp-final-waiting-room-summary",
  statusField: "telegramMiniAppFinalWaitingRoomStatus",
  statusValue: "WAITING_FOR_OWNER_MANUAL_INPUTS",
  modelPath: "../lib/zodiac/aphrodite-telegram-miniapp-final-waiting-room-summary.ts",
  pagePath: "../app/dashboard/networks/zodiac/telegram-miniapp-final-waiting-room-summary/page.tsx",
  docsPath: "../docs/aphrodite-telegram-miniapp-final-waiting-room-summary.md",
  reportPath: "../docs/aphrodite-package-reports/package-354.md",
  dashboardRouteKey: "telegramMiniappFinalWaitingRoomSummary",
  requiredStrings: [
  "Packages 334-354",
  "all blockers still open",
  "no production launch",
  "mobile track deferred",
  "Package 355 - Owner Manual Evidence Review",
  "only after real screenshots/env/backup/public URL inputs exist"
],
  requiredFalseFields: [
  "readyForProductionLaunch"
],
  requiredExactFields: {},
});
