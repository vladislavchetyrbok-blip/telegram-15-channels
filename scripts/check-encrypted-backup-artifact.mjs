import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import { BACKUP_TABLES, RESTORE_REHEARSAL_MODE } from "./lib/backup-gate.mjs";
import { createEncryptedBackupArtifact } from "./lib/encrypted-backup-artifact.mjs";

const repositoryRoot = process.cwd();
const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), "telegram-encrypted-backup-qa-"));
const recipient = `age1${"q".repeat(58)}`;
const results = [];

try {
  await testFailure("missing recipient", (_fixture, options) => { options.recipient = ""; });
  await testFailure("invalid recipient", (_fixture, options) => { options.recipient = "not-an-age-recipient"; });
  await testFailure("missing dump", ({ dumpPath }) => rmSync(dumpPath));
  await testFailure("missing rehearsal", ({ rehearsalPath }) => rmSync(rehearsalPath));
  await testFailure("invalid rehearsal", ({ rehearsalPath }) => updateJson(rehearsalPath, (value) => ({ ...value, status: "error" })));
  await testFailure("unexpected file in system backup", ({ backupDir }) => writeFileSync(path.join(backupDir, "unexpected.txt"), "fixture\n"));
  await testFailure("plaintext env file detected", ({ backupDir }) => writeFileSync(path.join(backupDir, ".env"), "FIXTURE_ONLY=true\n"));
  await testFailure("secret-looking filename detected", ({ backupDir, backupManifestPath }) => {
    const fileName = "service-role-key.json";
    writeJson(path.join(backupDir, "runtime", fileName), { fixture: true });
    updateJson(backupManifestPath, (value) => ({
      ...value,
      copiedRuntimeFiles: [...value.copiedRuntimeFiles, fileName],
    }));
  });
  await testFailure("secret-like content detected", ({ runtimeFilePath }) => {
    writeJson(runtimeFilePath, { fixture: "postgresql://fixture-user:fixture-password@fixture.invalid/db" });
  });
  await testFailure("encryption failure", null, {
    encryptFile: async () => { throw new Error("fixture encryption failure"); },
  });
  await testFailure("empty encrypted artifact", null, {
    encryptFile: async ({ encryptedPath }) => writeFileSync(encryptedPath, ""),
  });
  await testSuccess("complete fixture", (report) => {
    assert.equal(report.ok, true);
    assert.equal(report.encryption, "age");
    assert.equal(report.secretsIncluded, false);
  });
  await testSuccess("raw archive removed", (report) => {
    assert.equal(report.rawArchiveRemoved, true);
    assert.equal(report.rawBackupUploaded, false);
  });
  await testSuccess("only encrypted artifact remains", (report, fixture) => {
    const outputFiles = readdirSync(fixture.artifactDir, { withFileTypes: true });
    assert.equal(outputFiles.length, 1);
    assert.equal(outputFiles[0].isFile(), true);
    assert.equal(outputFiles[0].name, report.artifactName);
    assert.match(outputFiles[0].name, /\.tar\.gz\.age$/);
  });

  runStaticChecks();
  console.log(JSON.stringify({
    status: "ok",
    fixtureCases: results.length,
    passed: results.filter((item) => item.passed).length,
    productionCredentialsUsed: false,
    productionDataUsed: false,
    realBackupCreated: false,
    workflowDispatched: false,
    rawBackupUploaded: false,
    privateIdentityUsed: false,
  }, null, 2));
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

async function testFailure(name, mutate, optionOverrides = {}) {
  const fixture = createValidFixture(results.length + 1);
  const options = fixtureOptions(fixture, optionOverrides);
  if (mutate) mutate(fixture, options);
  await assert.rejects(createEncryptedBackupArtifact(options), `${name}: expected failure`);
  results.push({ name, passed: true, expected: "FAIL" });
}

async function testSuccess(name, verify) {
  const fixture = createValidFixture(results.length + 1);
  const report = await createEncryptedBackupArtifact(fixtureOptions(fixture));
  verify(report, fixture);
  results.push({ name, passed: true, expected: "PASS" });
}

function fixtureOptions(fixture, overrides = {}) {
  return {
    root: fixture.root,
    artifactDir: fixture.artifactDir,
    recipient,
    runId: `fixture-${String(results.length + 1).padStart(2, "0")}`,
    commit: "a".repeat(40),
    now: fixture.now,
    encryptFile: async ({ rawArchivePath, encryptedPath }) => copyFileSync(rawArchivePath, encryptedPath),
    ...overrides,
  };
}

function createValidFixture(index) {
  const root = path.join(fixtureRoot, String(index).padStart(2, "0"));
  const now = new Date();
  const backupId = `fixture-backup-${String(index).padStart(2, "0")}`;
  const backupDir = path.join(root, "data", "backups", backupId);
  const runtimeDir = path.join(backupDir, "runtime");
  const exportDir = path.join(root, "data", "backups", "latest-supabase-export");
  const artifactDir = path.join(root, "data", "runtime", "backup-artifacts");
  const backupManifestPath = path.join(backupDir, "backup-manifest.json");
  const runtimeFilePath = path.join(runtimeDir, "fixture-runtime.json");
  const dumpPath = path.join(exportDir, "supabase.dump");
  const rehearsalPath = path.join(exportDir, "restore-rehearsal.json");
  const counts = { channels: 13, posts: 26, publication_logs: 4, scheduler_runs: 1 };
  const dump = Buffer.from("fixture-only custom dump placeholder\n", "utf8");
  const dumpSha256 = createHash("sha256").update(dump).digest("hex");

  mkdirSync(runtimeDir, { recursive: true });
  mkdirSync(exportDir, { recursive: true });
  writeJson(runtimeFilePath, { fixture: true, rows: [] });
  writeJson(path.join(backupDir, "telegram-posts-assets-manifest.json"), {
    root: "public/assets/telegram-posts",
    fileCount: 0,
    files: [],
  });
  writeJson(backupManifestPath, {
    createdAt: now.toISOString(),
    backupId,
    gitCommit: "a".repeat(40),
    copiedRuntimeFiles: ["fixture-runtime.json"],
    secretPolicy: {
      envLocalCopied: false,
      databaseUrlCopied: false,
      telegramTokenCopied: false,
    },
  });
  writeJson(path.join(exportDir, "export-manifest.json"), {
    exportedAt: now.toISOString(),
    readOnly: true,
    snapshotAligned: true,
    tables: [...BACKUP_TABLES],
    counts,
  });
  writeFileSync(dumpPath, dump);
  writeJson(rehearsalPath, {
    performedAt: now.toISOString(),
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

  return {
    root,
    now,
    backupDir,
    backupManifestPath,
    runtimeFilePath,
    exportDir,
    dumpPath,
    rehearsalPath,
    artifactDir,
  };
}

function runStaticChecks() {
  const workflowSource = read(".github/workflows/production-safety-check.yml");
  const workflow = yaml.load(workflowSource);
  const artifactSource = read("scripts/lib/encrypted-backup-artifact.mjs");
  const packageJson = JSON.parse(read("package.json"));
  const gitignore = read(".gitignore");
  const job = workflow.jobs["production-safety"];
  const uploadStep = job.steps.find((step) => step.uses === "actions/upload-artifact@v4");

  assert.deepEqual(Object.keys(workflow.on), ["workflow_dispatch"]);
  assert.equal(workflow.permissions.contents, "read");
  assert.equal(job.env.BACKUP_AGE_RECIPIENT, "${{ vars.BACKUP_AGE_RECIPIENT }}");
  assert.ok(uploadStep, "Encrypted artifact upload step is missing.");
  assert.equal(uploadStep.id, "upload_encrypted_artifact");
  assert.equal(uploadStep.with.path, "data/runtime/backup-artifacts/*.tar.gz.age");
  assert.equal(uploadStep.with["retention-days"], 30);
  assert.equal(uploadStep.with["if-no-files-found"], "error");
  assert.equal(uploadStep.with["include-hidden-files"], false);
  assert.equal(uploadStep.with["compression-level"], 0);
  assert.notEqual(uploadStep["continue-on-error"], true);
  assert.equal(uploadStep.with.path.includes("data/backups"), false);
  assert.equal(workflowSource.includes("npm run db:mirror:export"), false);
  assert.match(workflowSource, /BACKUP_AGE_RECIPIENT:\s*"\$\{\{ vars\.BACKUP_AGE_RECIPIENT \}\}"/);
  assert.doesNotMatch(workflowSource, /AGE-SECRET-KEY|age-identity|\.dpapi/i);
  assert.doesNotMatch(workflowSource, /npm run (?:publish:|zodiac:[^\s]*publish|[^\s]*ledger[^\s]*(?:write|backfill))/i);
  assert.match(workflowSource, /age-v1\.3\.1-linux-amd64\.tar\.gz/);
  assert.match(workflowSource, /bdc69c09cbdd6cf8b1f333d372a1f58247b3a33146406333e30c0f26e8f51377/);
  assert.match(workflowSource, /rm -rf "\$RUNNER_TEMP"\/telegram-backup-artifact-\*/);

  const requiredOrder = [
    "npm run backup:create",
    "npm run backup:restore:rehearsal",
    "npm run production:safety:gate",
    "npm run backup:artifact:encrypt",
    "actions/upload-artifact@v4",
    "npm run production:safety:summary",
    "rm -rf data/backups",
  ];
  let previous = -1;
  for (const token of requiredOrder) {
    const current = workflowSource.indexOf(token);
    assert.ok(current > previous, `Workflow token is missing or out of order: ${token}`);
    previous = current;
  }

  assert.match(artifactSource, /runCommand\(ageBinary, \["-r", recipient, "-o", encryptedPath, rawArchivePath\]/);
  assert.match(artifactSource, /mkdtempSync\(path\.join\(temporaryBase, "telegram-backup-artifact-"\)\)/);
  assert.match(artifactSource, /rmSync\(rawArchivePath, \{ force: true \}\)/);
  assert.equal(packageJson.scripts["backup:artifact:encrypt"], "node scripts/create-encrypted-backup-artifact.mjs");
  assert.equal(packageJson.scripts["backup:artifact:qa"], "node scripts/check-encrypted-backup-artifact.mjs");
  assert.match(gitignore, /^data\/runtime\/[ \t]*$/m);
  assert.match(gitignore, /^data\/backups\/$/m);

  const tracked = execFileSync("git", ["ls-files"], { cwd: repositoryRoot, encoding: "utf8" });
  assert.doesNotMatch(tracked, /age-identity|\.dpapi|data\/backups\//i);
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
