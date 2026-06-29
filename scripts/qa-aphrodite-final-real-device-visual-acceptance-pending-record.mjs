#!/usr/bin/env node

import { getAphroditeFinalRealDeviceVisualAcceptancePendingRecord } from "../lib/zodiac/aphrodite-final-real-device-visual-acceptance-pending-record.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditeFinalRealDeviceVisualAcceptancePendingRecord(),
  packageNumber: 325,
  title: "Final Real Device Visual Acceptance Pending Record",
  route: "/dashboard/networks/zodiac/final-real-device-visual-acceptance-pending-record",
  statusField: "realDeviceVisualAcceptanceStatus",
  statusValue: "PENDING_OWNER_CONFIRMATION",
  modelPath: "../lib/zodiac/aphrodite-final-real-device-visual-acceptance-pending-record.ts",
  pagePath: "../app/dashboard/networks/zodiac/final-real-device-visual-acceptance-pending-record/page.tsx",
  docsPath: "../docs/aphrodite-final-real-device-visual-acceptance-pending-record.md",
  reportPath: "../docs/aphrodite-package-reports/package-325.md",
  dashboardRouteKey: "finalRealDeviceVisualAcceptancePendingRecord",
  requiredStrings: [
  "Android Telegram WebView required",
  "iPhone Telegram WebView optional but preferred",
  "all public routes",
  "VIP density fixed but owner recheck still required",
  "no admin shell",
  "no Aphrodite",
  "no overflow",
  "no broken bottom nav"
],
  requiredFalseFields: [
  "ownerRealDeviceApproval"
],
  requiredExactFields: {},
});
