#!/usr/bin/env node

import { getAphroditeMobileResultDensityGuardrails } from "../lib/zodiac/aphrodite-mobile-result-density-guardrails.ts";
import { runAphroditeFinalReadinessPackageQa } from "./lib/qa-aphrodite-post-303-readiness-package.mjs";

runAphroditeFinalReadinessPackageQa({
  model: getAphroditeMobileResultDensityGuardrails(),
  packageNumber: 306,
  title: "Mobile Result Density Guardrails",
  route: "/dashboard/networks/zodiac/mobile-result-density-guardrails",
  statusField: "mobileDensityGuardrailsStatus",
  statusValue: "ACTIVE_DOCUMENTED",
  modelPath: "../lib/zodiac/aphrodite-mobile-result-density-guardrails.ts",
  pagePath: "../app/dashboard/networks/zodiac/mobile-result-density-guardrails/page.tsx",
  docsPath: "../docs/aphrodite-mobile-result-density-guardrails.md",
  reportPath: "../docs/aphrodite-package-reports/package-306.md",
  dashboardRouteKey: "mobileResultDensityGuardrails",
  requiredStrings: [
  "no 30 huge cards in preview",
  "no repeated disclaimer on every card",
  "day card max copy length",
  "first 3-5 days expanded max",
  "rest compact/collapsed",
  "save/share buttons remain visible",
  "no horizontal overflow",
  "no letter-by-letter wrapping"
],
  requiredFalseFields: [],
});
