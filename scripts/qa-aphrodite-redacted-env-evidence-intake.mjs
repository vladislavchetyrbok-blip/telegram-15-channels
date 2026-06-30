#!/usr/bin/env node

import { getAphroditeRedactedEnvEvidenceIntake } from "../lib/zodiac/aphrodite-redacted-env-evidence-intake.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeRedactedEnvEvidenceIntake(),
  packageNumber: 336,
  title: "Redacted Env Evidence Intake",
  route: "/dashboard/networks/zodiac/redacted-env-evidence-intake",
  statusField: "redactedEnvEvidenceStatus",
  statusValue: "WAITING_FOR_OWNER_ENV_SETUP",
  modelPath: "../lib/zodiac/aphrodite-redacted-env-evidence-intake.ts",
  pagePath: "../app/dashboard/networks/zodiac/redacted-env-evidence-intake/page.tsx",
  docsPath: "../docs/aphrodite-redacted-env-evidence-intake.md",
  reportPath: "../docs/aphrodite-package-reports/package-336.md",
  dashboardRouteKey: "redactedEnvEvidenceIntake",
  requiredStrings: [
  "redacted evidence only",
  "never print values",
  "never paste secrets",
  "no Telegram validation call",
  "no DB connection",
  "env outside Git only"
],
  requiredFalseFields: [],
  requiredExactFields: {
  "databaseUrlPresence": "MISSING_OR_NOT_VERIFIED",
  "telegramBotTokenPresence": "MISSING_OR_NOT_VERIFIED"
},
});
