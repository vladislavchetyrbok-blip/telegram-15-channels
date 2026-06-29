#!/usr/bin/env node

import { getAphroditeIncidentRollbackFinalPlaybook } from "../lib/zodiac/aphrodite-incident-rollback-final-playbook.ts";
import { runAphroditeOwnerManualFinalGatePackageQa } from "./lib/qa-aphrodite-owner-manual-final-gates-package.mjs";

runAphroditeOwnerManualFinalGatePackageQa({
  model: getAphroditeIncidentRollbackFinalPlaybook(),
  packageNumber: 347,
  title: "Incident Rollback Final Playbook",
  route: "/dashboard/networks/zodiac/incident-rollback-final-playbook",
  statusField: "rollbackPlaybookStatus",
  statusValue: "READY_DRAFT_NOT_EXECUTED",
  modelPath: "../lib/zodiac/aphrodite-incident-rollback-final-playbook.ts",
  pagePath: "../app/dashboard/networks/zodiac/incident-rollback-final-playbook/page.tsx",
  docsPath: "../docs/aphrodite-incident-rollback-final-playbook.md",
  reportPath: "../docs/aphrodite-package-reports/package-347.md",
  dashboardRouteKey: "incidentRollbackFinalPlaybook",
  requiredStrings: [
  "disable Mini App URL manually",
  "revert public link if needed",
  "stop posting CTA",
  "keep Telegram send disabled",
  "incident owner checklist",
  "no rollback executed now"
],
  requiredFalseFields: [],
  requiredExactFields: {},
});
