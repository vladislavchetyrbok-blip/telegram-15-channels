#!/usr/bin/env node

import { getAphroditePost303FinalReadinessSummary } from "../lib/zodiac/aphrodite-post-303-final-readiness-summary.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditePost303FinalReadinessSummary(),
  packageNumber: 313,
  title: "Post-303 Final Readiness Summary",
  route: "/dashboard/networks/zodiac/post-303-final-readiness-summary",
  statusField: "post303FinalReadinessStatus",
  statusValue: "WAITING_FOR_OWNER_AND_PRODUCTION_EVIDENCE",
  modelPath: "../lib/zodiac/aphrodite-post-303-final-readiness-summary.ts",
  pagePath: "../app/dashboard/networks/zodiac/post-303-final-readiness-summary/page.tsx",
  docsPath: "../docs/aphrodite-post-303-final-readiness-summary.md",
  reportPath: "../docs/aphrodite-package-reports/package-313.md",
  dashboardRouteKey: "post303FinalReadinessSummary",
  requiredStrings: [
  "Package 303 density fix",
  "Packages 304-313 readiness records",
  "owner evidence pending",
  "env missing",
  "backup stale",
  "restore not completed",
  "public URL missing",
  "BotFather not done",
  "Package 314 - Owner Evidence Review After Screenshots"
],
  requiredFalseFields: [],
});
