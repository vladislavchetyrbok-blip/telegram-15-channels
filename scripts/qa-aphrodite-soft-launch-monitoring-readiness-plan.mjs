#!/usr/bin/env node

import { runFinalReadinessPackageQa } from "./lib/qa-aphrodite-final-readiness-package.mjs";

runFinalReadinessPackageQa({
  packageNumber: 261,
  slug: "soft-launch-monitoring-readiness-plan",
  route: "/dashboard/networks/zodiac/soft-launch-monitoring-readiness-plan",
  title: "Soft Launch Monitoring Readiness Plan",
  routeKey: "softLaunchMonitoringReadinessPlan",
  requiredMarkers: [
    "monitoring plan",
    "manual monitoring only",
    "no external analytics",
    "no production monitoring activation",
    "owner review required",
    "Package 262 - Incident Rollback Response Drill",
  ],
});
