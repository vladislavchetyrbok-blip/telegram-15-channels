#!/usr/bin/env node

import { getAphroditeRedactedEnvClosureOwnerActionGate } from "../lib/zodiac/aphrodite-redacted-env-closure-owner-action-gate.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditeRedactedEnvClosureOwnerActionGate(),
  packageNumber: 326,
  title: "Redacted Env Closure Owner Action Gate",
  route: "/dashboard/networks/zodiac/redacted-env-closure-owner-action-gate",
  statusField: "envClosureStatus",
  statusValue: "WAITING_FOR_OWNER_SECRET_CONFIGURATION",
  modelPath: "../lib/zodiac/aphrodite-redacted-env-closure-owner-action-gate.ts",
  pagePath: "../app/dashboard/networks/zodiac/redacted-env-closure-owner-action-gate/page.tsx",
  docsPath: "../docs/aphrodite-redacted-env-closure-owner-action-gate.md",
  reportPath: "../docs/aphrodite-package-reports/package-326.md",
  dashboardRouteKey: "redactedEnvClosureOwnerActionGate",
  requiredStrings: [
  "configure DATABASE_URL outside Git",
  "configure TELEGRAM_BOT_TOKEN outside Git",
  "never print values",
  "never paste secrets into ChatGPT/Codex/Claude/Antigravity",
  "redacted presence check only",
  "no Telegram validation call",
  "no DB connection"
],
  requiredFalseFields: [],
  requiredExactFields: {
  "databaseUrlStatus": "MISSING",
  "telegramBotTokenStatus": "MISSING"
},
});
