#!/usr/bin/env node

import { getAphroditeVipPreviewLockCopyConsistencyGate } from "../lib/zodiac/aphrodite-vip-preview-lock-copy-consistency-gate.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditeVipPreviewLockCopyConsistencyGate(),
  packageNumber: 305,
  title: "VIP Preview Lock and Copy Consistency Gate",
  route: "/dashboard/networks/zodiac/vip-preview-lock-copy-consistency-gate",
  statusField: "vipPreviewLockConsistencyStatus",
  statusValue: "REVIEW_REQUIRED",
  modelPath: "../lib/zodiac/aphrodite-vip-preview-lock-copy-consistency-gate.ts",
  pagePath: "../app/dashboard/networks/zodiac/vip-preview-lock-copy-consistency-gate/page.tsx",
  docsPath: "../docs/aphrodite-vip-preview-lock-copy-consistency-gate.md",
  reportPath: "../docs/aphrodite-package-reports/package-305.md",
  dashboardRouteKey: "vipPreviewLockCopyConsistencyGate",
  requiredStrings: [
  "VIP превью",
  "без оплаты",
  "VIP закрыт",
  "полный отчёт закрыт",
  "no active payment",
  "no unlocked VIP",
  "no entitlement bypass",
  "payment inactive"
],
  requiredFalseFields: [],
});
