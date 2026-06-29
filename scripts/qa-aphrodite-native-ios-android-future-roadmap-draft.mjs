#!/usr/bin/env node

import { getAphroditeNativeIosAndroidFutureRoadmapDraft } from "../lib/zodiac/aphrodite-native-ios-android-future-roadmap-draft.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditeNativeIosAndroidFutureRoadmapDraft(),
  packageNumber: 312,
  title: "Native iPhone Android Future Roadmap Draft",
  route: "/dashboard/networks/zodiac/native-ios-android-future-roadmap-draft",
  statusField: "nativeRoadmapStatus",
  statusValue: "DRAFT_AFTER_TELEGRAM_STABILITY",
  modelPath: "../lib/zodiac/aphrodite-native-ios-android-future-roadmap-draft.ts",
  pagePath: "../app/dashboard/networks/zodiac/native-ios-android-future-roadmap-draft/page.tsx",
  docsPath: "../docs/aphrodite-native-ios-android-future-roadmap-draft.md",
  reportPath: "../docs/aphrodite-package-reports/package-312.md",
  dashboardRouteKey: "nativeIosAndroidFutureRoadmapDraft",
  requiredStrings: [
  "Telegram Mini App first",
  "native app later",
  "shared backend/content core",
  "iPhone/Android only after soft launch metrics",
  "no native app code in this package",
  "no App Store / Google Play action now",
  "no payment changes"
],
  requiredFalseFields: [],
});
