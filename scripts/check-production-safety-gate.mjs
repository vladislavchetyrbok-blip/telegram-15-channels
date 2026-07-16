import { appendFileSync } from "node:fs";
import { getProductionSafetyReport } from "./lib/production-safety-center.mjs";

const summaryOnly = process.argv.includes("--summary-only");
const report = await getProductionSafetyReport({ loadEnv: true });
const backup = report.checks.backup;
const store = report.checks.store;
const gateChecks = {
  safeForManualPublish: report.safeForManualPublish === true,
  backupReady: report.backupReady === true,
  restoreRehearsalValid: backup.checks?.restoreRehearsalValid === true,
  restoreRehearsalFresh: backup.checks?.restoreRehearsalFresh === true,
  storeComparisonOk: store.storeCompareStatus === "ok" && store.dualReadStatus === "ok" && store.synced === true,
  mirrorDryRunOk: store.mirrorSyncStatus === "ok",
};
const gatePassed = Object.values(gateChecks).every(Boolean);
const safeReport = {
  gatePassed,
  status: gatePassed ? "ok" : "blocked",
  checkedAt: report.lastCheckedAt,
  safeForManualPublish: report.safeForManualPublish,
  safeForScheduledPublishing: report.safeForScheduledPublishing,
  backupReady: report.backupReady,
  failedChecks: Object.entries(gateChecks).filter(([, passed]) => !passed).map(([name]) => name),
  store: {
    synced: store.synced,
    storeCompareStatus: store.storeCompareStatus,
    dualReadStatus: store.dualReadStatus,
    mirrorSyncStatus: store.mirrorSyncStatus,
    counts: store.counts,
    missingInSupabaseCount: store.missingInSupabaseCount,
    extraInSupabaseCount: store.extraInSupabaseCount,
  },
  backup: {
    latestBackupTime: backup.latestBackupTime,
    latestBackupAgeHours: backup.latestBackupAgeHours,
    exportTime: backup.exportTime,
    exportAgeHours: backup.exportAgeHours,
    exportSnapshotAligned: backup.exportSnapshotAligned,
    restoreRehearsalTime: backup.restoreRehearsalTime,
    restoreRehearsalAgeHours: backup.restoreRehearsalAgeHours,
    restoreRehearsalStatus: backup.restoreRehearsalStatus,
    dumpSize: backup.dumpSize,
    sourceCounts: backup.sourceCounts,
    restoredCounts: backup.restoredCounts,
    countMatches: backup.countMatches,
    idHashMatches: backup.idHashMatches,
    targetEphemeral: backup.targetEphemeral,
    targetProduction: backup.targetProduction,
    sourceReadOnly: backup.sourceReadOnly,
    productionWrites: backup.productionWrites,
    containerRemoved: backup.containerRemoved,
    dumpSha256Verified: backup.dumpSha256Verified,
  },
};

console.log(JSON.stringify(safeReport, null, 2));

if (summaryOnly && process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, buildSummary(safeReport), "utf8");
}

if (!summaryOnly && !gatePassed) process.exitCode = 1;

function buildSummary(result) {
  const rows = result.backup.sourceCounts
    ? Object.keys(result.backup.sourceCounts).map((table) => (
        `| ${table} | ${formatValue(result.backup.sourceCounts[table])} | ${formatValue(result.backup.restoredCounts?.[table])} | ${formatValue(result.backup.countMatches?.[table])} | ${formatValue(result.backup.idHashMatches?.[table])} |`
      )).join("\n")
    : "| evidence | unavailable | unavailable | false | false |";

  return [
    "## Production Safety Backup/Restore Gate",
    "",
    `- Gate: **${result.gatePassed ? "PASS" : "BLOCKED"}**`,
    `- Checked at: ${formatValue(result.checkedAt)}`,
    `- Backup ready: ${formatValue(result.backupReady)}`,
    `- Safe for manual publish: ${formatValue(result.safeForManualPublish)}`,
    `- Safe for scheduled publishing: ${formatValue(result.safeForScheduledPublishing)}`,
    `- Backup age (hours): ${formatNumber(result.backup.latestBackupAgeHours)}`,
    `- Export age (hours): ${formatNumber(result.backup.exportAgeHours)}`,
    `- Export snapshot aligned: ${formatValue(result.backup.exportSnapshotAligned)}`,
    `- Restore rehearsal age (hours): ${formatNumber(result.backup.restoreRehearsalAgeHours)}`,
    `- Restore status: ${formatValue(result.backup.restoreRehearsalStatus)}`,
    `- Ephemeral target: ${formatValue(result.backup.targetEphemeral)}`,
    `- Production target: ${formatValue(result.backup.targetProduction)}`,
    `- Source read-only: ${formatValue(result.backup.sourceReadOnly)}`,
    `- Production writes: ${formatValue(result.backup.productionWrites)}`,
    `- Container removed: ${formatValue(result.backup.containerRemoved)}`,
    "",
    "| Table | Source count | Restored count | Count match | ID hash match |",
    "|---|---:|---:|:---:|:---:|",
    rows,
    "",
  ].join("\n");
}

function formatValue(value) {
  return value === null || value === undefined || value === "" ? "unavailable" : String(value);
}

function formatNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : "unavailable";
}
