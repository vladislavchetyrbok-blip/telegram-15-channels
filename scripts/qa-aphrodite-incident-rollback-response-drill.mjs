#!/usr/bin/env node

import { runFinalReadinessPackageQa } from "./lib/qa-aphrodite-final-readiness-package.mjs";

runFinalReadinessPackageQa({
  packageNumber: 262,
  slug: "incident-rollback-response-drill",
  route: "/dashboard/networks/zodiac/incident-rollback-response-drill",
  title: "Incident Rollback Response Drill",
  routeKey: "incidentRollbackResponseDrill",
  requiredMarkers: [
    "incident rollback response drill",
    "rollback drill only",
    "do not retry blindly",
    "no restore executed",
    "owner stop decision",
    "Package 263 - Pre-Soft-Launch Owner Brief",
  ],
});
