#!/usr/bin/env node

import { getAphroditePublicUrlOwnerActionGate } from "../lib/zodiac/aphrodite-public-url-owner-action-gate.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditePublicUrlOwnerActionGate(),
  packageNumber: 328,
  title: "Public URL Owner Action Gate",
  route: "/dashboard/networks/zodiac/public-url-owner-action-gate",
  statusField: "publicUrlOwnerActionStatus",
  statusValue: "WAITING_FOR_PUBLIC_HTTPS_URL",
  modelPath: "../lib/zodiac/aphrodite-public-url-owner-action-gate.ts",
  pagePath: "../app/dashboard/networks/zodiac/public-url-owner-action-gate/page.tsx",
  docsPath: "../docs/aphrodite-public-url-owner-action-gate.md",
  reportPath: "../docs/aphrodite-package-reports/package-328.md",
  dashboardRouteKey: "publicUrlOwnerActionGate",
  requiredStrings: [
  "HTTPS required",
  "PUBLIC_APP_URL required",
  "route checks required",
  "dashboard must not be public",
  "public routes must be shell-isolated",
  "no BotFather setup until public URL verified"
],
  requiredFalseFields: [
  "publicUrlApproved"
],
  requiredExactFields: {
  "publicAppUrl": "MISSING"
},
});
