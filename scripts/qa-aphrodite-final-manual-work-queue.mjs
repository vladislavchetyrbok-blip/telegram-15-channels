#!/usr/bin/env node

import { getAphroditeFinalManualWorkQueue } from "../lib/zodiac/aphrodite-final-manual-work-queue.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeFinalManualWorkQueue(),
  packageNumber: 352,
  title: "Final Manual Work Queue",
  route: "/dashboard/networks/zodiac/final-manual-work-queue",
  statusField: "manualWorkQueueStatus",
  statusValue: "OWNER_ACTION_REQUIRED",
  modelPath: "../lib/zodiac/aphrodite-final-manual-work-queue.ts",
  pagePath: "../app/dashboard/networks/zodiac/final-manual-work-queue/page.tsx",
  docsPath: "../docs/aphrodite-final-manual-work-queue.md",
  reportPath: "../docs/aphrodite-package-reports/package-352.md",
  dashboardRouteKey: "finalManualWorkQueue",
  requiredStrings: [
  "1. screenshots",
  "2. env",
  "3. backup",
  "4. restore",
  "5. public URL",
  "6. route check",
  "7. BotFather",
  "8. safety green",
  "9. go/no-go",
  "10. one-channel soft launch"
],
  requiredFalseFields: [],
  requiredExactFields: {},
});
