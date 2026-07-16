import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export const BACKUP_TABLES = Object.freeze(["channels", "posts", "publication_logs", "scheduler_runs"]);
export const RESTORE_REHEARSAL_MODE = "isolated-postgres-container";
export const MAX_BACKUP_AGE_HOURS = 24;

const allowedEvidenceFields = new Set([
  "performedAt",
  "status",
  "mode",
  "sourceReadOnly",
  "targetEphemeral",
  "targetProduction",
  "postgresMajor",
  "tables",
  "sourceCounts",
  "restoredCounts",
  "countMatches",
  "idHashMatches",
  "dumpSha256",
  "dumpSize",
  "containerRemoved",
  "secretsIncluded",
  "productionWrites",
]);

export function evaluateBackupGate(options = {}) {
  const root = path.resolve(options.root ?? process.cwd());
  const now = normalizeDate(options.now ?? new Date());
  const backupsDir = path.join(root, "data", "backups");
  const exportDir = path.join(backupsDir, "latest-supabase-export");
  const exportManifestPath = path.join(exportDir, "export-manifest.json");
  const dumpPath = path.join(exportDir, "supabase.dump");
  const rehearsalPath = path.join(exportDir, "restore-rehearsal.json");
  const latestBackup = findLatestBackup(backupsDir);
  const backupManifestPath = latestBackup ? path.join(latestBackup.path, "backup-manifest.json") : null;
  const backupManifest = backupManifestPath ? readJson(backupManifestPath) : null;
  const exportManifest = readJson(exportManifestPath);
  const rehearsal = readJson(rehearsalPath);

  const backupFreshness = getFreshness(backupManifest?.createdAt, now);
  const exportFreshness = getFreshness(exportManifest?.exportedAt, now);
  const rehearsalFreshness = getFreshness(rehearsal?.performedAt, now);
  const dumpPresent = existsSync(dumpPath) && statSync(dumpPath).isFile();
  const dumpSize = dumpPresent ? statSync(dumpPath).size : 0;
  const dumpNonEmpty = dumpSize > 0;
  const exportValidation = validateExportManifest(exportManifest, now);
  const rehearsalValidation = validateRestoreRehearsalEvidence(rehearsal, {
    now,
    dumpPath: dumpPresent ? dumpPath : null,
  });
  const exportCountsMatch = Boolean(
    exportValidation.valid &&
      rehearsal &&
      BACKUP_TABLES.every((table) => Number(exportManifest.counts[table]) === Number(rehearsal.sourceCounts?.[table])),
  );

  const checks = {
    backupsDirExists: existsSync(backupsDir),
    latestBackupPresent: Boolean(latestBackup),
    latestBackupManifestPresent: Boolean(backupManifest),
    latestBackupFresh: backupFreshness.fresh,
    latestSupabaseExportExists: existsSync(exportDir),
    exportManifestPresent: Boolean(exportManifest),
    exportManifestValid: exportValidation.valid,
    exportSnapshotAligned: exportManifest?.snapshotAligned === true,
    exportManifestFresh: exportFreshness.fresh,
    exportCountsMatch,
    dumpPresent,
    dumpNonEmpty,
    restoreRehearsalPresent: Boolean(rehearsal),
    restoreRehearsalFresh: rehearsalFreshness.fresh,
    restoreRehearsalValid: rehearsalValidation.valid,
    targetEphemeral: rehearsal?.targetEphemeral === true,
    targetProductionDisabled: rehearsal?.targetProduction === false,
    sourceReadOnly: rehearsal?.sourceReadOnly === true,
    zeroProductionWrites: rehearsal?.productionWrites === 0,
    allCountMatches: allTableFlagsTrue(rehearsal?.countMatches),
    allIdHashMatches: allTableFlagsTrue(rehearsal?.idHashMatches),
    containerRemoved: rehearsal?.containerRemoved === true,
    secretsExcluded: rehearsal?.secretsIncluded === false,
    dumpSha256Verified: rehearsalValidation.dumpSha256Verified,
  };

  const backupReady = Object.values(checks).every(Boolean);
  const warnings = buildWarnings(checks, exportValidation.issues, rehearsalValidation.issues);

  return {
    backupReady,
    backupStatus: backupReady ? "ok" : "warning",
    checkedAt: now.toISOString(),
    backupsDirExists: checks.backupsDirExists,
    latestBackup: latestBackup ? { createdAt: backupManifest?.createdAt ?? latestBackup.modifiedAt } : null,
    latestBackupTime: backupManifest?.createdAt ?? null,
    latestBackupAgeHours: backupFreshness.ageHours,
    latestBackupOlderThan24h: backupFreshness.ageHours !== null && backupFreshness.ageHours > MAX_BACKUP_AGE_HOURS,
    latestBackupManifestPresent: checks.latestBackupManifestPresent,
    latestSupabaseExportExists: checks.latestSupabaseExportExists,
    exportManifestPresent: checks.exportManifestPresent,
    exportSnapshotAligned: checks.exportSnapshotAligned,
    exportTime: exportManifest?.exportedAt ?? null,
    exportAgeHours: exportFreshness.ageHours,
    exportOlderThan24h: exportFreshness.ageHours !== null && exportFreshness.ageHours > MAX_BACKUP_AGE_HOURS,
    dumpPresent,
    dumpSize,
    restoreRehearsalPresent: checks.restoreRehearsalPresent,
    restoreRehearsalTime: rehearsal?.performedAt ?? null,
    restoreRehearsalAgeHours: rehearsalFreshness.ageHours,
    restoreRehearsalOlderThan24h: rehearsalFreshness.ageHours !== null && rehearsalFreshness.ageHours > MAX_BACKUP_AGE_HOURS,
    restoreRehearsalStatus: rehearsal?.status ?? null,
    tables: [...BACKUP_TABLES],
    sourceCounts: safeCounts(rehearsal?.sourceCounts),
    restoredCounts: safeCounts(rehearsal?.restoredCounts),
    countMatches: safeFlags(rehearsal?.countMatches),
    idHashMatches: safeFlags(rehearsal?.idHashMatches),
    targetEphemeral: checks.targetEphemeral,
    targetProduction: rehearsal?.targetProduction ?? null,
    sourceReadOnly: checks.sourceReadOnly,
    productionWrites: Number.isInteger(rehearsal?.productionWrites) ? rehearsal.productionWrites : null,
    containerRemoved: checks.containerRemoved,
    dumpSha256Verified: checks.dumpSha256Verified,
    checks,
    warnings,
    errors: [],
  };
}

export function validateRestoreRehearsalEvidence(evidence, options = {}) {
  const issues = [];
  const now = normalizeDate(options.now ?? new Date());
  let dumpSha256Verified = false;

  if (!isPlainObject(evidence)) {
    return { valid: false, dumpSha256Verified, issues: ["Restore rehearsal evidence is missing or invalid."] };
  }

  const unexpectedFields = Object.keys(evidence).filter((field) => !allowedEvidenceFields.has(field));
  if (unexpectedFields.length) issues.push("Restore rehearsal evidence contains unexpected fields.");
  for (const field of allowedEvidenceFields) {
    if (!(field in evidence)) issues.push(`Restore rehearsal evidence field ${field} is missing.`);
  }

  const freshness = getFreshness(evidence.performedAt, now);
  if (!freshness.fresh) issues.push("Restore rehearsal evidence is missing, stale, invalid, or dated in the future.");
  if (evidence.status !== "ok") issues.push("Restore rehearsal status is not ok.");
  if (evidence.mode !== RESTORE_REHEARSAL_MODE) issues.push("Restore rehearsal mode is not isolated-postgres-container.");
  if (evidence.sourceReadOnly !== true) issues.push("Source database was not confirmed read-only.");
  if (evidence.targetEphemeral !== true) issues.push("Restore target was not confirmed ephemeral.");
  if (evidence.targetProduction !== false) issues.push("Restore target may be production.");
  if (!Number.isInteger(evidence.postgresMajor) || evidence.postgresMajor < 10) issues.push("PostgreSQL major version is invalid.");
  if (!sameTables(evidence.tables)) issues.push("Restore rehearsal table list is invalid.");
  if (!validCounts(evidence.sourceCounts) || !validCounts(evidence.restoredCounts)) issues.push("Restore rehearsal counts are invalid.");
  if (!allTableFlagsTrue(evidence.countMatches)) issues.push("One or more table counts do not match.");
  if (!allTableFlagsTrue(evidence.idHashMatches)) issues.push("One or more table ID hashes do not match.");
  if (validCounts(evidence.sourceCounts) && validCounts(evidence.restoredCounts)) {
    if (!BACKUP_TABLES.every((table) => evidence.sourceCounts[table] === evidence.restoredCounts[table])) {
      issues.push("Source and restored counts differ.");
    }
  }
  if (!/^[a-f0-9]{64}$/i.test(String(evidence.dumpSha256 ?? ""))) issues.push("Dump SHA-256 is invalid.");
  if (!Number.isInteger(evidence.dumpSize) || evidence.dumpSize <= 0) issues.push("Dump size is invalid.");
  if (evidence.containerRemoved !== true) issues.push("Restore container cleanup was not confirmed.");
  if (evidence.secretsIncluded !== false) issues.push("Restore evidence does not confirm secret exclusion.");
  if (evidence.productionWrites !== 0) issues.push("Production writes were not confirmed as zero.");

  if (options.dumpPath && existsSync(options.dumpPath)) {
    const stats = statSync(options.dumpPath);
    const actualHash = sha256File(options.dumpPath);
    dumpSha256Verified = stats.size === evidence.dumpSize && actualHash === String(evidence.dumpSha256).toLowerCase();
    if (!dumpSha256Verified) issues.push("Dump checksum or size does not match restore evidence.");
  } else {
    issues.push("Dump file is missing for evidence verification.");
  }

  return { valid: issues.length === 0, dumpSha256Verified, issues: Array.from(new Set(issues)) };
}

export function hashIdList(ids) {
  const hash = createHash("sha256");
  for (const id of [...ids].map(String).sort((left, right) => left.localeCompare(right))) {
    const byteLength = Buffer.byteLength(id, "utf8");
    hash.update(`${byteLength}:`, "utf8");
    hash.update(id, "utf8");
    hash.update("\n", "utf8");
  }
  return hash.digest("hex");
}

export function sha256File(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function findLatestBackup(backupsDir) {
  if (!existsSync(backupsDir)) return null;
  return readdirSync(backupsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "latest-supabase-export")
    .map((entry) => {
      const entryPath = path.join(backupsDir, entry.name);
      const stats = statSync(entryPath);
      return { path: entryPath, modifiedAt: stats.mtime.toISOString(), modifiedTime: stats.mtimeMs };
    })
    .sort((left, right) => right.modifiedTime - left.modifiedTime)[0] ?? null;
}

function validateExportManifest(manifest, now) {
  const issues = [];
  if (!isPlainObject(manifest)) return { valid: false, issues: ["Export manifest is missing or invalid."] };
  if (!sameTables(manifest.tables)) issues.push("Export manifest table list is invalid.");
  if (!validCounts(manifest.counts)) issues.push("Export manifest counts are invalid.");
  if (manifest.readOnly !== true) issues.push("Export manifest does not confirm read-only mode.");
  if (manifest.snapshotAligned !== true) issues.push("Export manifest is not aligned to the restore rehearsal snapshot.");
  if (!getFreshness(manifest.exportedAt, now).valid) issues.push("Export manifest timestamp is invalid.");
  return { valid: issues.length === 0, issues };
}

function buildWarnings(checks, exportIssues, rehearsalIssues) {
  const warnings = [];
  if (!checks.backupsDirExists) warnings.push("data/backups is missing.");
  if (!checks.latestBackupPresent) warnings.push("No backup folder was found.");
  if (!checks.latestBackupManifestPresent) warnings.push("Latest backup manifest is missing.");
  if (!checks.latestBackupFresh) warnings.push("Latest backup is missing, invalid, stale, or dated in the future.");
  if (!checks.latestSupabaseExportExists) warnings.push("latest-supabase-export is missing.");
  if (!checks.exportManifestPresent) warnings.push("Export manifest is missing.");
  if (!checks.exportManifestFresh) warnings.push("Export manifest is missing, invalid, stale, or dated in the future.");
  if (!checks.exportCountsMatch) warnings.push("Export counts do not match source counts in restore evidence.");
  if (!checks.dumpPresent || !checks.dumpNonEmpty) warnings.push("PostgreSQL custom dump is missing or empty.");
  if (!checks.restoreRehearsalPresent) warnings.push("Restore rehearsal evidence is missing.");
  if (!checks.restoreRehearsalFresh) warnings.push("Restore rehearsal evidence is missing, invalid, stale, or dated in the future.");
  warnings.push(...exportIssues, ...rehearsalIssues);
  return Array.from(new Set(warnings));
}

function getFreshness(value, now) {
  const timestamp = typeof value === "string" ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(timestamp)) return { valid: false, fresh: false, ageHours: null };
  const ageHours = (now.getTime() - timestamp) / 36e5;
  const valid = ageHours >= -5 / 60;
  return { valid, fresh: valid && ageHours <= MAX_BACKUP_AGE_HOURS, ageHours: Math.max(0, ageHours) };
}

function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Backup gate requires a valid current timestamp.");
  return date;
}

function sameTables(value) {
  return Array.isArray(value) && value.length === BACKUP_TABLES.length && BACKUP_TABLES.every((table) => value.includes(table));
}

function validCounts(value) {
  return hasExactTableKeys(value) && BACKUP_TABLES.every((table) => Number.isInteger(value[table]) && value[table] >= 0);
}

function allTableFlagsTrue(value) {
  return hasExactTableKeys(value) && BACKUP_TABLES.every((table) => value[table] === true);
}

function hasExactTableKeys(value) {
  return isPlainObject(value) && Object.keys(value).length === BACKUP_TABLES.length && BACKUP_TABLES.every((table) => table in value);
}

function safeCounts(value) {
  return Object.fromEntries(BACKUP_TABLES.map((table) => [table, Number.isInteger(value?.[table]) ? value[table] : null]));
}

function safeFlags(value) {
  return Object.fromEntries(BACKUP_TABLES.map((table) => [table, value?.[table] === true]));
}

function readJson(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
