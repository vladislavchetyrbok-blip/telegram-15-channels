#!/usr/bin/env node

import { getAphroditePost303RealDeviceScreenshotEvidencePack } from "../lib/zodiac/aphrodite-post-303-real-device-screenshot-evidence-pack.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditePost303RealDeviceScreenshotEvidencePack(),
  packageNumber: 304,
  title: "Post-303 Real Device Screenshot Evidence Pack",
  route: "/dashboard/networks/zodiac/post-303-real-device-screenshot-evidence-pack",
  statusField: "post303ScreenshotEvidenceStatus",
  statusValue: "PENDING_OWNER_SCREENSHOTS",
  modelPath: "../lib/zodiac/aphrodite-post-303-real-device-screenshot-evidence-pack.ts",
  pagePath: "../app/dashboard/networks/zodiac/post-303-real-device-screenshot-evidence-pack/page.tsx",
  docsPath: "../docs/aphrodite-post-303-real-device-screenshot-evidence-pack.md",
  reportPath: "../docs/aphrodite-package-reports/package-304.md",
  dashboardRouteKey: "post303RealDeviceScreenshotEvidencePack",
  requiredStrings: [
  "/miniapp",
  "/compatibility",
  "/birth-matrix",
  "/vip-preview",
  "/vip-compatibility-report",
  "/miniapp?startapp=mystic",
  "VIP preview compact result",
  "30-day result after density fix",
  "bottom nav",
  "date input",
  "time input",
  "city Днепр / Дніпро",
  "no fake screenshots"
],
  requiredFalseFields: [],
});
