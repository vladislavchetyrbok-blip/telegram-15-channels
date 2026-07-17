import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { BACKUP_TABLES, RESTORE_REHEARSAL_MODE, evaluateBackupGate } from "./lib/backup-gate.mjs";

const repositoryRoot = process.cwd();
const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), "telegram-backup-gate-"));
const results = [];

try {
  testGateCase("backup folder missing", false, null, { createFixture: false });
  testGateCase("manifest missing", false, ({ backupManifestPath }) => rmSync(backupManifestPath));
  testGateCase("export missing", false, ({ exportDir }) => rmSync(exportDir, { recursive: true, force: true }));
  testGateCase("dump missing", false, ({ dumpPath }) => rmSync(dumpPath));
  testGateCase("rehearsal missing", false, ({ rehearsalPath }) => rmSync(rehearsalPath));
  testGateCase("rehearsal stale", false, ({ rehearsalPath }) => updateJson(rehearsalPath, (value) => ({
    ...value,
    performedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
  })));
  testGateCase("production target enabled", false, ({ rehearsalPath }) => updateJson(rehearsalPath, (value) => ({
    ...value,
    targetProduction: true,
  })));
  testGateCase("source is not read-only", false, ({ rehearsalPath }) => updateJson(rehearsalPath, (value) => ({
    ...value,
    sourceReadOnly: false,
  })));
  testGateCase("production writes detected", false, ({ rehearsalPath }) => updateJson(rehearsalPath, (value) => ({
    ...value,
    productionWrites: 1,
  })));
  testGateCase("count mismatch", false, ({ rehearsalPath }) => updateJson(rehearsalPath, (value) => ({
    ...value,
    restoredCounts: { ...value.restoredCounts, posts: value.restoredCounts.posts + 1 },
    countMatches: { ...value.countMatches, posts: false },
  })));
  testGateCase("ID hash mismatch", false, ({ rehearsalPath }) => updateJson(rehearsalPath, (value) => ({
    ...value,
    idHashMatches: { ...value.idHashMatches, publication_logs: false },
  })));
  testGateCase("container cleanup missing", false, ({ rehearsalPath }) => updateJson(rehearsalPath, (value) => ({
    ...value,
    containerRemoved: false,
  })));
  testGateCase("export snapshot is not aligned", false, ({ exportManifestPath }) => updateJson(exportManifestPath, (value) => ({
    ...value,
    snapshotAligned: false,
  })));
  testGateCase("complete valid evidence", true);

  runStaticChecks();
  console.log(JSON.stringify({
    status: "ok",
    fixtureCases: results.length,
    passed: results.filter((item) => item.passed).length,
    productionCredentialsUsed: false,
    productionDataUsed: false,
    workflowDispatched: false,
  }, null, 2));
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

function testGateCase(name, expectedReady, mutate, options = {}) {
  const root = path.join(fixtureRoot, String(results.length + 1).padStart(2, "0"));
  mkdirSync(root, { recursive: true });
  const paths = options.createFixture === false ? fixturePaths(root) : createValidFixture(root);
  if (mutate) mutate(paths);
  const report = evaluateBackupGate({ root, now: new Date() });
  assert.equal(report.backupReady, expectedReady, `${name}: expected backupReady=${expectedReady}`);
  results.push({ name, passed: true, backupReady: report.backupReady });
}

function createValidFixture(root) {
  const paths = fixturePaths(root);
  const now = new Date().toISOString();
  const counts = { channels: 13, posts: 26, publication_logs: 4, scheduler_runs: 1 };
  const dump = Buffer.from("fixture-only custom dump placeholder\n", "utf8");
  const dumpSha256 = createHash("sha256").update(dump).digest("hex");
  mkdirSync(paths.backupDir, { recursive: true });
  mkdirSync(paths.exportDir, { recursive: true });
  writeJson(paths.backupManifestPath, { createdAt: now, backupId: "fixture-backup" });
  writeJson(paths.exportManifestPath, {
    exportedAt: now,
    readOnly: true,
    snapshotAligned: true,
    tables: [...BACKUP_TABLES],
    counts,
  });
  writeFileSync(paths.dumpPath, dump);
  writeJson(paths.rehearsalPath, {
    performedAt: now,
    status: "ok",
    mode: RESTORE_REHEARSAL_MODE,
    sourceReadOnly: true,
    targetEphemeral: true,
    targetProduction: false,
    postgresMajor: 17,
    tables: [...BACKUP_TABLES],
    sourceCounts: counts,
    restoredCounts: { ...counts },
    countMatches: trueFlags(),
    idHashMatches: trueFlags(),
    dumpSha256,
    dumpSize: dump.length,
    containerRemoved: true,
    secretsIncluded: false,
    productionWrites: 0,
  });
  return paths;
}

function fixturePaths(root) {
  const backupsDir = path.join(root, "data", "backups");
  const backupDir = path.join(backupsDir, "fixture-backup");
  const exportDir = path.join(backupsDir, "latest-supabase-export");
  return {
    backupsDir,
    backupDir,
    backupManifestPath: path.join(backupDir, "backup-manifest.json"),
    exportDir,
    exportManifestPath: path.join(exportDir, "export-manifest.json"),
    dumpPath: path.join(exportDir, "supabase.dump"),
    rehearsalPath: path.join(exportDir, "restore-rehearsal.json"),
  };
}

function runStaticChecks() {
  const workflow = read(".github/workflows/production-safety-check.yml");
  const rehearsal = read("scripts/lib/backup-restore-rehearsal.mjs");
  const gitignore = read(".gitignore");
  const packageJson = JSON.parse(read("package.json"));

  assert.match(workflow, /^on:\s*\r?\n\s+workflow_dispatch:\s*$/m);
  assert.doesNotMatch(workflow, /^\s+(?:push|pull_request|schedule|repository_dispatch):\s*$/m);
  assert.match(workflow, /permissions:\s*\r?\n\s+contents: read/);
  assert.match(workflow, /uses: actions\/upload-artifact@v4/);
  assert.match(workflow, /path: data\/runtime\/backup-artifacts\/\*\.tar\.gz\.age/);
  assert.doesNotMatch(workflow, /path:\s*(?:data\/backups|[^\n]*supabase\.dump|[^\n]*\.json|[^\n]*\.tar\.gz\s*$)/im);
  assert.match(workflow, /BACKUP_AGE_RECIPIENT: "\$\{\{ vars\.BACKUP_AGE_RECIPIENT \}\}"/);
  assert.doesNotMatch(workflow, /AGE-SECRET-KEY|age-identity|\.dpapi/i);
  assert.doesNotMatch(workflow, /npm run (?:publish:|zodiac:[^\s]*publish|[^\s]*ledger[^\s]*(?:write|backfill))/i);
  assert.match(workflow, /if: \$\{\{ always\(\) \}\}/);
  assert.match(workflow, /docker rm --force/);
  assert.match(workflow, /rm -rf data\/backups/);

  const requiredOrder = [
    "npm run backup:create",
    "npm run backup:restore:rehearsal",
    "npm run production:safety:gate",
    "npm run backup:artifact:encrypt",
    "actions/upload-artifact@v4",
    "npm run production:safety:summary",
  ];
  let previous = -1;
  for (const command of requiredOrder) {
    const current = workflow.indexOf(command);
    assert.ok(current > previous, `Workflow command is missing or out of order: ${command}`);
    previous = current;
  }
  const cleanupIndex = workflow.indexOf("rm -rf data/backups");
  assert.ok(cleanupIndex > previous, "Workflow cleanup must run after the safety summary.");

  for (const flag of [
    "--format=custom",
    "--no-owner",
    "--no-privileges",
    "--table=public.channels",
    "--table=public.posts",
    "--table=public.publication_logs",
    "--table=public.scheduler_runs",
    "--snapshot=",
    "pg_restore",
    "--exit-on-error",
  ]) {
    assert.ok(rehearsal.includes(flag), `Restore rehearsal implementation is missing ${flag}`);
  }

  const snapshotLifecycle = [
    "begin isolation level repeatable read read only",
    "select pg_export_snapshot() as snapshot",
    "readRowsFromSource(sourceClient)",
    "await createCustomDump({",
    "writeSameSnapshotExport(exportDir, sourceRows, sourceCounts)",
    'await sourceClient.query("rollback")',
  ];
  let lifecycleIndex = -1;
  for (const token of snapshotLifecycle) {
    const current = rehearsal.toLowerCase().indexOf(token.toLowerCase(), lifecycleIndex + 1);
    assert.ok(current > lifecycleIndex, `Snapshot lifecycle step is missing or out of order: ${token}`);
    lifecycleIndex = current;
  }

  for (const forbiddenMetadataValue of [
    "SOURCE_DATABASE_URL",
    "SUPABASE_DATABASE_URL",
    "POSTGRES_PASSWORD",
    "PGPASSWORD",
    "RESTORE_DATABASE_URL",
    "TARGET_DATABASE_URL",
    "PGRESTORE_TARGET",
    "--target-url",
  ]) {
    assert.equal(rehearsal.includes(forbiddenMetadataValue), false, `Forbidden Docker/restore value found: ${forbiddenMetadataValue}`);
  }
  assert.match(rehearsal, /--interactive/);
  assert.match(rehearsal, /--tmpfs[\s\S]*\/run\/secrets:rw,noexec,nosuid,nodev,mode=0700/);
  assert.match(rehearsal, /cat > \/run\/secrets\/\.pgpass/);
  assert.match(rehearsal, /chmod 0600 \/run\/secrets\/\.pgpass/);
  assert.match(rehearsal, /input: `\$\{connection\.pgpassLine\}\\n`/);
  assert.match(rehearsal, /--network[\s\S]*"none"/);
  assert.match(rehearsal, /if \(!dumpContainerRemoved\) throw new Error\("Dump container cleanup was not confirmed\."\)/);
  assert.doesNotMatch(rehearsal, /(?:--publish|-p)\s*["']?\d+:/i);
  assert.doesNotMatch(rehearsal, /runDocker\([\s\S]{0,1200}(?:connectionString|connection\.password)/i);

  const evidenceLifecycle = [
    "openSync(temporaryPath",
    "fsyncSync(fileDescriptor)",
    "closeSync(fileDescriptor)",
    "renameSync(temporaryPath, filePath)",
  ];
  let evidenceIndex = -1;
  for (const token of evidenceLifecycle) {
    const current = rehearsal.indexOf(token, evidenceIndex + 1);
    assert.ok(current > evidenceIndex, `Atomic evidence step is missing or out of order: ${token}`);
    evidenceIndex = current;
  }
  assert.match(rehearsal, /rmSync\(temporaryPath, \{ force: true \}\)/);
  assert.match(rehearsal, /cleanupAttemptArtifacts\(exportDir\)/);
  assert.doesNotMatch(
    rehearsal,
    /sourceClient\.query\(\s*[`"']\s*(?:insert|update|delete|create|alter|drop|truncate|grant|revoke|call|select\s+pg_advisory)/i,
  );
  assert.doesNotMatch(rehearsal, /console\.(?:log|error)[^\n]*DATABASE_URL/i);
  assert.match(gitignore, /^data\/backups\/$/m);
  assert.equal(packageJson.scripts["backup:restore:rehearsal"], "node scripts/backup-restore-rehearsal.mjs");
  assert.equal(packageJson.scripts["backup:gate:qa"], "node scripts/check-backup-gate.mjs");
  assert.equal(packageJson.scripts["backup:artifact:encrypt"], "node scripts/create-encrypted-backup-artifact.mjs");
  assert.equal(packageJson.scripts["backup:artifact:qa"], "node scripts/check-encrypted-backup-artifact.mjs");
  assert.equal(packageJson.scripts["production:safety:gate"], "node scripts/check-production-safety-gate.mjs");
}

function trueFlags() {
  return Object.fromEntries(BACKUP_TABLES.map((table) => [table, true]));
}

function updateJson(filePath, update) {
  writeJson(filePath, update(JSON.parse(readFileSync(filePath, "utf8"))));
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function read(relativePath) {
  const filePath = path.join(repositoryRoot, relativePath);
  assert.equal(existsSync(filePath), true, `${relativePath} is missing`);
  return readFileSync(filePath, "utf8");
}
