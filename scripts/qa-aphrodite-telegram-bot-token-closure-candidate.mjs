#!/usr/bin/env node

import { getAphroditeTelegramBotTokenClosureCandidate } from "../lib/zodiac/aphrodite-telegram-bot-token-closure-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeTelegramBotTokenClosureCandidate(),
  packageNumber: 338,
  title: "TELEGRAM_BOT_TOKEN Closure Candidate",
  route: "/dashboard/networks/zodiac/telegram-bot-token-closure-candidate",
  statusField: "telegramBotTokenClosureStatus",
  statusValue: "NOT_CLOSED_MISSING_OR_UNVERIFIED",
  modelPath: "../lib/zodiac/aphrodite-telegram-bot-token-closure-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/telegram-bot-token-closure-candidate/page.tsx",
  docsPath: "../docs/aphrodite-telegram-bot-token-closure-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-338.md",
  dashboardRouteKey: "telegramBotTokenClosureCandidate",
  requiredStrings: [
  "closure only after redacted presence check says present",
  "no token printed",
  "no Telegram API validation call",
  "no messages sent",
  "no BotFather changes"
],
  requiredFalseFields: [
  "telegramBotTokenConfigured"
],
  requiredExactFields: {},
});
