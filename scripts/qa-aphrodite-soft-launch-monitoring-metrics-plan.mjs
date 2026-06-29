#!/usr/bin/env node

import { getAphroditeSoftLaunchMonitoringMetricsPlan } from "../lib/zodiac/aphrodite-soft-launch-monitoring-metrics-plan.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeSoftLaunchMonitoringMetricsPlan(),
  packageNumber: 346,
  title: "Soft Launch Monitoring Metrics Plan",
  route: "/dashboard/networks/zodiac/soft-launch-monitoring-metrics-plan",
  statusField: "monitoringMetricsPlanStatus",
  statusValue: "DRAFT_NOT_ACTIVE",
  modelPath: "../lib/zodiac/aphrodite-soft-launch-monitoring-metrics-plan.ts",
  pagePath: "../app/dashboard/networks/zodiac/soft-launch-monitoring-metrics-plan/page.tsx",
  docsPath: "../docs/aphrodite-soft-launch-monitoring-metrics-plan.md",
  reportPath: "../docs/aphrodite-package-reports/package-346.md",
  dashboardRouteKey: "softLaunchMonitoringMetricsPlan",
  requiredStrings: [
  "what to watch after soft launch",
  "errors",
  "clicks",
  "user drop-off",
  "VIP clicks",
  "compatibility usage",
  "no external analytics added",
  "no DB writes"
],
  requiredFalseFields: [],
  requiredExactFields: {},
});
