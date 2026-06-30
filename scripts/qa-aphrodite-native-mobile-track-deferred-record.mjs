#!/usr/bin/env node

import { getAphroditeNativeMobileTrackDeferredRecord } from "../lib/zodiac/aphrodite-native-mobile-track-deferred-record.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeNativeMobileTrackDeferredRecord(),
  packageNumber: 351,
  title: "Native Mobile Track Deferred Record",
  route: "/dashboard/networks/zodiac/native-mobile-track-deferred-record",
  statusField: "nativeMobileTrackStatus",
  statusValue: "DEFERRED_SEPARATE_BRANCH",
  modelPath: "../lib/zodiac/aphrodite-native-mobile-track-deferred-record.ts",
  pagePath: "../app/dashboard/networks/zodiac/native-mobile-track-deferred-record/page.tsx",
  docsPath: "../docs/aphrodite-native-mobile-track-deferred-record.md",
  reportPath: "../docs/aphrodite-package-reports/package-351.md",
  dashboardRouteKey: "nativeMobileTrackDeferredRecord",
  requiredStrings: [
  "mobile branch exists separately",
  "do not merge mobile now",
  "finish Telegram manual blockers first",
  "iPhone/Android later",
  "shared backend later"
],
  requiredFalseFields: [],
  requiredExactFields: {
  "mobileBranch": "codex/package-314-mobile-foundation"
},
});
