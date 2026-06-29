#!/usr/bin/env node

import { getAphroditeManualBlockerEvidenceMatrix } from "../lib/zodiac/aphrodite-manual-blocker-evidence-matrix.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditeManualBlockerEvidenceMatrix(),
  packageNumber: 310,
  title: "Manual Blocker Evidence Matrix",
  route: "/dashboard/networks/zodiac/manual-blocker-evidence-matrix",
  statusField: "manualBlockerEvidenceMatrixStatus",
  statusValue: "BLOCKERS_OPEN",
  modelPath: "../lib/zodiac/aphrodite-manual-blocker-evidence-matrix.ts",
  pagePath: "../app/dashboard/networks/zodiac/manual-blocker-evidence-matrix/page.tsx",
  docsPath: "../docs/aphrodite-manual-blocker-evidence-matrix.md",
  reportPath: "../docs/aphrodite-package-reports/package-310.md",
  dashboardRouteKey: "manualBlockerEvidenceMatrix",
  requiredStrings: [
  "owner screenshots/approval",
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup <24h",
  "restore rehearsal",
  "PUBLIC_APP_URL",
  "BotFather Mini App URL",
  "all remain open unless real evidence exists"
],
  requiredFalseFields: [],
});
