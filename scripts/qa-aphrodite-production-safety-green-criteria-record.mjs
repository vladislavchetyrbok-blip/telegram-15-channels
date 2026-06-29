#!/usr/bin/env node

import { getAphroditeProductionSafetyGreenCriteriaRecord } from "../lib/zodiac/aphrodite-production-safety-green-criteria-record.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditeProductionSafetyGreenCriteriaRecord(),
  packageNumber: 330,
  title: "Production Safety Green Criteria Record",
  route: "/dashboard/networks/zodiac/production-safety-green-criteria-record",
  statusField: "productionSafetyGreenStatus",
  statusValue: "NOT_GREEN_MANUAL_BLOCKERS_OPEN",
  modelPath: "../lib/zodiac/aphrodite-production-safety-green-criteria-record.ts",
  pagePath: "../app/dashboard/networks/zodiac/production-safety-green-criteria-record/page.tsx",
  docsPath: "../docs/aphrodite-production-safety-green-criteria-record.md",
  reportPath: "../docs/aphrodite-package-reports/package-330.md",
  dashboardRouteKey: "productionSafetyGreenCriteriaRecord",
  requiredStrings: [
  "production:safety:check must turn green before launch",
  "current expected red reasons",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup stale",
  "no launch while red"
],
  requiredFalseFields: [
  "readyForProductionLaunch"
],
  requiredExactFields: {},
});
