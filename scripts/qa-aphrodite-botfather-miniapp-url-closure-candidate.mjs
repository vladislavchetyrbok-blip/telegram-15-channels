#!/usr/bin/env node

import { getAphroditeBotfatherMiniappUrlClosureCandidate } from "../lib/zodiac/aphrodite-botfather-miniapp-url-closure-candidate.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeBotfatherMiniappUrlClosureCandidate(),
  packageNumber: 342,
  title: "BotFather Mini App URL Closure Candidate",
  route: "/dashboard/networks/zodiac/botfather-miniapp-url-closure-candidate",
  statusField: "botFatherMiniAppUrlClosureStatus",
  statusValue: "NOT_CLOSED_NOT_DONE",
  modelPath: "../lib/zodiac/aphrodite-botfather-miniapp-url-closure-candidate.ts",
  pagePath: "../app/dashboard/networks/zodiac/botfather-miniapp-url-closure-candidate/page.tsx",
  docsPath: "../docs/aphrodite-botfather-miniapp-url-closure-candidate.md",
  reportPath: "../docs/aphrodite-package-reports/package-342.md",
  dashboardRouteKey: "botFatherMiniAppUrlClosureCandidate",
  requiredStrings: [
  "manual-only BotFather step",
  "no automation",
  "no Telegram API",
  "no messages",
  "only after owner approval and public URL verification"
],
  requiredFalseFields: [
  "botFatherSetupDone"
],
  requiredExactFields: {},
});
