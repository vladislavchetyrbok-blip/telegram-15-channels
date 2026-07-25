import { spawn } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { BACKUP_TABLES, evaluateBackupGate, sha256File } from "./backup-gate.mjs";

const ARTIFACT_DIRECTORY_NAME = "backup-artifacts";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const COMMAND_TIMEOUT_MS = 5 * 60 * 1000;
const SECRET_CONTENT_PATTERNS = Object.freeze([
  /postgres(?:ql)?:\/\/[^\s"']+/i,
  /\b\d{6,}:[A-Za-z0-9_-]{20,}\b/,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
  /AGE-SECRET-KEY-1[0-9A-Z]+/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]);

export async function createEncryptedBackupArtifact(options = {}) {
  const root = path.resolve(options.root ?? process.cwd());
  const recipient = String(options.recipient ?? process.env.BACKUP_AGE_RECIPIENT ?? "").trim();
  const ageBinary = options.ageBinary ?? "age";
  const encryptFile = options.encryptFile ?? defaultEncryptFile;
  const now = normalizeDate(options.now ?? new Date());
  const runId = safeIdentifier(options.runId ?? process.env.GITHUB_RUN_ID ?? "local", "run ID");
  const sourceCommit = safeCommit(options.commit ?? process.env.GITHUB_SHA ?? gitValue(root, ["rev-parse", "HEAD"]));
  const artifactDir = path.resolve(options.artifactDir ?? path.join(root, "data", "runtime", ARTIFACT_DIRECTORY_NAME));
  const artifactName = `telegram-15-channels-backup-${runId}-${sourceCommit}.tar.gz.age`;
  const encryptedPath = path.join(artifactDir, artifactName);
  const temporaryBase = path.resolve(options.temporaryBase ?? process.env.RUNNER_TEMP ?? os.tmpdir());

  assertRecipient(recipient);
  assertArtifactDirectory(root, artifactDir);
  resetArtifactDirectory(artifactDir);
  mkdirSync(temporaryBase, { recursive: true });
  const temporaryRoot = mkdtempSync(path.join(temporaryBase, "telegram-backup-artifact-"));
  const stagingDir = path.join(temporaryRoot, "bundle");
  const rawArchivePath = path.join(temporaryRoot, "recovery-bundle.tar.gz");
  let succeeded = false;

  try {
    const gate = evaluateBackupGate({ root, now });
    if (gate.backupReady !== true) throw new Error("Verified backup gate evidence is required.");

    const backup = loadSystemBackup(root, now);
    const exportFiles = loadVerifiedExportFiles(root, now);
    mkdirSync(stagingDir, { recursive: true });

    const stagingExpected = new Set();
    const backupPrefix = path.posix.join("system-backup", backup.manifest.backupId);
    for (const relativePath of backup.files) {
      copyIntoBundle(backup.directory, relativePath, stagingDir, path.posix.join(backupPrefix, relativePath));
      stagingExpected.add(path.posix.join(backupPrefix, relativePath));
    }

    for (const item of exportFiles.files) {
      copyIntoBundle(exportFiles.directory, item, stagingDir, path.posix.join("latest-supabase-export", item));
      stagingExpected.add(path.posix.join("latest-supabase-export", item));
    }

    const recoveryManifest = {
      createdAt: now.toISOString(),
      sourceCommit,
      tables: [...BACKUP_TABLES],
      counts: exportFiles.rehearsal.sourceCounts,
      encryptedArtifactFilename: artifactName,
      dumpSha256: exportFiles.rehearsal.dumpSha256,
      restoreStatus: exportFiles.rehearsal.status,
      encryption: "age",
      secretsIncluded: false,
    };
    writeJsonAtomic(path.join(stagingDir, "recovery-manifest.json"), recoveryManifest);
    stagingExpected.add("recovery-manifest.json");

    const stagedFiles = listFilesStrict(stagingDir);
    assertExactFiles(stagedFiles, stagingExpected, "Recovery bundle contains an unexpected file.");
    scanTextFilesForSecrets(stagingDir, stagedFiles.filter((item) => item.endsWith(".json")));

    await runCommand("tar", ["-czf", rawArchivePath, "-C", stagingDir, "."]);
    if (!existsSync(rawArchivePath) || statSync(rawArchivePath).size <= 0) {
      throw new Error("Raw recovery archive is missing or empty.");
    }

    await encryptFile({ ageBinary, recipient, rawArchivePath, encryptedPath });
    if (!existsSync(encryptedPath) || statSync(encryptedPath).size <= 0) {
      throw new Error("Encrypted recovery artifact is missing or empty.");
    }

    rmSync(rawArchivePath, { force: true });
    const outputFiles = listFilesStrict(artifactDir);
    assertExactFiles(outputFiles, new Set([artifactName]), "Encrypted artifact directory contains an unexpected file.");

    const report = {
      ok: true,
      status: "ok",
      artifactPath: path.relative(root, encryptedPath).replaceAll("\\", "/"),
      artifactName,
      encryptedSha256: sha256File(encryptedPath),
      encryptedSize: statSync(encryptedPath).size,
      retentionDays: 30,
      encryption: "age",
      rawArchiveRemoved: !existsSync(rawArchivePath),
      rawBackupUploaded: false,
      privateKeyPresentOnRunner: false,
      secretsIncluded: false,
      tables: [...BACKUP_TABLES],
    };
    succeeded = true;
    return report;
  } finally {
    rmSync(rawArchivePath, { force: true });
    removeTemporaryDirectory(temporaryRoot, temporaryBase);
    if (!succeeded) rmSync(encryptedPath, { force: true });
  }
}

export function writeArtifactOutputs(report, outputPath = process.env.GITHUB_OUTPUT) {
  if (!outputPath) return;
  const values = {
    artifact_path: report.artifactPath,
    artifact_name: report.artifactName,
    encrypted_sha256: report.encryptedSha256,
    retention_days: String(report.retentionDays),
    raw_backup_uploaded: "false",
    private_key_present: "false",
  };
  for (const [name, value] of Object.entries(values)) {
    if (/\r|\n/.test(value)) throw new Error("Artifact output contains an unsupported newline.");
    appendFileSync(outputPath, `${name}=${value}\n`, "utf8");
  }
}

async function defaultEncryptFile({ ageBinary, recipient, rawArchivePath, encryptedPath }) {
  await runCommand(ageBinary, ["-r", recipient, "-o", encryptedPath, rawArchivePath], {
    env: safeChildEnv(),
  });
}

function loadSystemBackup(root, now) {
  const backupsDir = path.join(root, "data", "backups");
  if (!existsSync(backupsDir)) throw new Error("System backup directory is missing.");
  const candidates = readdirSync(backupsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "latest-supabase-export")
    .map((entry) => ({ name: entry.name, directory: path.join(backupsDir, entry.name) }))
    .sort((left, right) => statSync(right.directory).mtimeMs - statSync(left.directory).mtimeMs);
  const latest = candidates[0];
  if (!latest) throw new Error("System backup is missing.");

  const manifest = readJson(path.join(latest.directory, "backup-manifest.json"));
  if (!manifest || manifest.backupId !== latest.name || !isFresh(manifest.createdAt, now)) {
    throw new Error("System backup manifest is invalid or stale.");
  }
  if (!Array.isArray(manifest.copiedRuntimeFiles)) throw new Error("System backup runtime manifest is invalid.");
  if (
    manifest.secretPolicy?.envLocalCopied !== false ||
    manifest.secretPolicy?.databaseUrlCopied !== false ||
    manifest.secretPolicy?.telegramTokenCopied !== false
  ) {
    throw new Error("System backup does not confirm secret exclusion.");
  }

  const runtimeFiles = manifest.copiedRuntimeFiles.map((fileName) => {
    assertSafeRuntimeFileName(fileName);
    return path.posix.join("runtime", fileName);
  });
  const expected = new Set([
    "backup-manifest.json",
    "telegram-posts-assets-manifest.json",
    ...runtimeFiles,
  ]);
  const actual = listFilesStrict(latest.directory);
  assertExactFiles(actual, expected, "System backup contains an unexpected file.");
  scanTextFilesForSecrets(latest.directory, actual.filter((item) => item.endsWith(".json")));
  return { directory: latest.directory, manifest, files: actual };
}

function loadVerifiedExportFiles(root, now) {
  const directory = path.join(root, "data", "backups", "latest-supabase-export");
  const files = ["supabase.dump", "export-manifest.json", "restore-rehearsal.json"];
  for (const fileName of files) {
    const filePath = path.join(directory, fileName);
    if (!existsSync(filePath) || !statSync(filePath).isFile() || statSync(filePath).size <= 0) {
      throw new Error("Verified export file is missing or empty.");
    }
  }
  const exportManifest = readJson(path.join(directory, "export-manifest.json"));
  const rehearsal = readJson(path.join(directory, "restore-rehearsal.json"));
  if (!exportManifest || exportManifest.snapshotAligned !== true || exportManifest.readOnly !== true || !isFresh(exportManifest.exportedAt, now)) {
    throw new Error("Export manifest is invalid or stale.");
  }
  if (!rehearsal || rehearsal.status !== "ok" || rehearsal.secretsIncluded !== false || !isFresh(rehearsal.performedAt, now)) {
    throw new Error("Restore rehearsal evidence is invalid or stale.");
  }
  scanTextFilesForSecrets(directory, ["export-manifest.json", "restore-rehearsal.json"]);
  return { directory, files, exportManifest, rehearsal };
}

function copyIntoBundle(sourceRoot, sourceRelativePath, stagingRoot, targetRelativePath) {
  const sourcePath = safeJoin(sourceRoot, sourceRelativePath);
  const targetPath = safeJoin(stagingRoot, targetRelativePath);
  mkdirSync(path.dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}

function listFilesStrict(directory) {
  const files = [];
  const walk = (currentDirectory, prefix = "") => {
    for (const entry of readdirSync(currentDirectory, { withFileTypes: true })) {
      const absolutePath = path.join(currentDirectory, entry.name);
      const relativePath = path.posix.join(prefix, entry.name);
      const stats = lstatSync(absolutePath);
      if (stats.isSymbolicLink()) throw new Error("Symbolic links are not allowed in recovery bundles.");
      if (entry.isDirectory()) walk(absolutePath, relativePath);
      else if (entry.isFile()) files.push(relativePath);
      else throw new Error("Unsupported filesystem entry found in recovery bundle.");
    }
  };
  walk(directory);
  return files.sort((left, right) => left.localeCompare(right));
}

function assertExactFiles(actual, expected, message) {
  if (actual.length !== expected.size || actual.some((item) => !expected.has(item))) throw new Error(message);
}

function scanTextFilesForSecrets(root, files) {
  for (const relativePath of files) {
    assertNonSecretFileName(relativePath);
    const content = readFileSync(safeJoin(root, relativePath), "utf8");
    if (SECRET_CONTENT_PATTERNS.some((pattern) => pattern.test(content))) {
      throw new Error("Secret-like content was found in a recovery bundle input.");
    }
  }
}

function assertSafeRuntimeFileName(fileName) {
  if (
    typeof fileName !== "string" ||
    fileName !== path.basename(fileName) ||
    !fileName.endsWith(".json") ||
    /[\\/\0\r\n]/.test(fileName)
  ) {
    throw new Error("System backup runtime filename is invalid.");
  }
  assertNonSecretFileName(fileName);
}

function assertNonSecretFileName(relativePath) {
  const normalized = relativePath.toLowerCase();
  if (
    normalized.split("/").some((part) => part === ".env" || part.startsWith(".env.")) ||
    /(?:pgpass|credentials|private[-_]?key|service[-_]?role[-_]?key|database[-_]?url|bot[-_]?token)/i.test(normalized)
  ) {
    throw new Error("Secret-looking filename is not allowed in a recovery bundle.");
  }
}

function assertRecipient(recipient) {
  if (!/^age1[0-9a-z]{20,}$/.test(recipient)) throw new Error("BACKUP_AGE_RECIPIENT is missing or invalid.");
}

function resetArtifactDirectory(directory) {
  rmSync(directory, { recursive: true, force: true });
  mkdirSync(directory, { recursive: true });
}

function assertArtifactDirectory(root, directory) {
  const expected = path.resolve(root, "data", "runtime", ARTIFACT_DIRECTORY_NAME);
  if (directory !== expected) throw new Error("Artifact directory is not dedicated.");
}

function removeTemporaryDirectory(directory, temporaryBase) {
  const resolved = path.resolve(directory);
  const temporaryRoot = `${path.resolve(temporaryBase)}${path.sep}`;
  if (!resolved.startsWith(temporaryRoot)) throw new Error("Temporary cleanup target is invalid.");
  rmSync(resolved, { recursive: true, force: true });
}

function safeJoin(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relativePath);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("Recovery bundle path escapes its root.");
  }
  return resolved;
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
    renameSync(temporaryPath, filePath);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

function isFresh(value, now) {
  const timestamp = typeof value === "string" ? Date.parse(value) : Number.NaN;
  const age = now.getTime() - timestamp;
  return Number.isFinite(timestamp) && age >= -5 * 60 * 1000 && age <= MAX_AGE_MS;
}

function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Artifact creation requires a valid timestamp.");
  return date;
}

function safeIdentifier(value, label) {
  const normalized = String(value ?? "").trim();
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(normalized)) throw new Error(`Artifact ${label} is invalid.`);
  return normalized;
}

function safeCommit(value) {
  const normalized = String(value ?? "").trim();
  if (!/^[a-f0-9]{7,40}$/i.test(normalized)) throw new Error("Artifact source commit is invalid.");
  return normalized.toLowerCase();
}

function gitValue(root, args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "unknown";
  }
}

function safeChildEnv() {
  const allowed = ["PATH", "Path", "SystemRoot", "WINDIR", "COMSPEC", "PATHEXT", "HOME", "USERPROFILE", "TEMP", "TMP"];
  return Object.fromEntries(allowed.filter((name) => process.env[name]).map((name) => [name, process.env[name]]));
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: options.env ?? safeChildEnv(),
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "ignore", "ignore"],
    });
    const timer = setTimeout(() => child.kill(), options.timeoutMs ?? COMMAND_TIMEOUT_MS);
    child.on("error", () => {
      clearTimeout(timer);
      reject(new Error("Backup artifact subprocess could not start."));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error("Backup artifact subprocess failed."));
      else resolve();
    });
  });
}
