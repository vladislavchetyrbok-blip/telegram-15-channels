import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import {
  closeSync,
  createReadStream,
  createWriteStream,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { setTimeout as delay } from "node:timers/promises";
import { loadLocalEnv } from "./load-local-env.mjs";
import { buildPgConfig } from "./pg-config.mjs";
import {
  BACKUP_TABLES,
  RESTORE_REHEARSAL_MODE,
  hashIdList,
} from "./backup-gate.mjs";

const RESTORE_DATABASE = "restore_rehearsal";
const CONTAINER_PREFIX = "telegram-15-restore-";
const COMMAND_TIMEOUT_MS = 10 * 60 * 1000;
const DUMP_TABLE_ARGS = Object.freeze([
  "--table=public.channels",
  "--table=public.posts",
  "--table=public.publication_logs",
  "--table=public.scheduler_runs",
]);

export const BASE_SUPAVISOR_LIBPQ_ENV = Object.freeze({
  PGGSSENCMODE: "disable",
  PGSSLMODE: "require",
  PGCONNECT_TIMEOUT: "30",
});

export const PGDUMP_LIBPQ_ENV = Object.freeze({
  ...BASE_SUPAVISOR_LIBPQ_ENV,
  PGOPTIONS: "-c default_transaction_read_only=on",
});

const DIAGNOSTIC_CODES = new Set([
  "gssapi_negotiation_failed",
  "authentication_failed",
  "dns_resolution_failed",
  "connection_timeout",
  "tls_failed",
  "snapshot_import_failed",
  "table_pattern_not_found",
  "permission_denied",
  "client_server_version_mismatch",
  "postgres_connection_failed",
  "container_start_failed",
  "container_shell_failed",
  "dump_write_failed",
  "dump_file_missing",
  "dump_file_empty",
  "dump_file_unreadable",
  "dump_format_invalid",
  "dump_atomic_rename_failed",
  "dump_checksum_failed",
  "unknown_external_failure",
]);

export class SafeExternalCommandError extends Error {
  constructor(details) {
    const diagnosticCode = DIAGNOSTIC_CODES.has(details.diagnosticCode)
      ? details.diagnosticCode
      : "unknown_external_failure";
    const safeMessage = safeMessageForCode(diagnosticCode);
    super(safeMessage);
    this.name = "SafeExternalCommandError";
    this.toolCategory = normalizeToolCategory(details.toolCategory);
    this.stage = safeStage(details.stage);
    this.exitCode = Number.isInteger(details.exitCode) ? details.exitCode : 1;
    this.timeout = details.timeout === true;
    this.diagnosticCode = diagnosticCode;
    this.safeMessage = safeMessage;
  }

  toJSON() {
    return {
      toolCategory: this.toolCategory,
      stage: this.stage,
      exitCode: this.exitCode,
      timeout: this.timeout,
      diagnosticCode: this.diagnosticCode,
      safeMessage: this.safeMessage,
    };
  }
}

export async function runBackupRestoreRehearsal(options = {}) {
  const root = path.resolve(options.root ?? process.cwd());
  if (options.loadEnv !== false) loadLocalEnv({ cwd: root });

  const databaseUrl = process.env.DATABASE_URL;
  const exportDir = path.join(root, "data", "backups", "latest-supabase-export");
  const dumpPath = path.join(exportDir, "supabase.dump");
  const evidencePath = path.join(exportDir, "restore-rehearsal.json");

  cleanupAttemptArtifacts(exportDir);

  if (!databaseUrl) return failure("environment validation");
  mkdirSync(exportDir, { recursive: true });

  let sourceClient;
  let sourceTransactionOpen = false;
  let restoreContainer = null;
  let containerRemoved = true;
  let stage = "Docker availability check";
  let verification = null;
  let failureDetails = null;
  let sourceReadOnly = false;
  let targetEphemeral = false;

  try {
    await runDocker(["version", "--format", "{{.Server.Version}}"]);

    stage = "source read-only snapshot";
    const { Client } = await import("pg");
    sourceClient = new Client(buildPgConfig(databaseUrl));
    await sourceClient.connect();
    await sourceClient.query("begin isolation level repeatable read read only");
    sourceTransactionOpen = true;

    const readOnlyResult = await sourceClient.query("show transaction_read_only");
    if (String(readOnlyResult.rows[0]?.transaction_read_only).toLowerCase() !== "on") {
      throw new Error("Source transaction is not read-only.");
    }
    sourceReadOnly = true;

    const versionResult = await sourceClient.query("show server_version_num");
    const postgresMajor = postgresMajorFromVersion(versionResult.rows[0]?.server_version_num);
    const snapshotResult = await sourceClient.query("select pg_export_snapshot() as snapshot");
    const sourceSnapshot = String(snapshotResult.rows[0]?.snapshot ?? "");
    if (!sourceSnapshot) throw new Error("Source snapshot is unavailable.");

    stage = "same-snapshot source read";
    const sourceRows = await readRowsFromSource(sourceClient);
    const sourceIds = idsFromRows(sourceRows);
    const sourceCounts = countsFromIds(sourceIds);
    const sourceHashes = hashesFromIds(sourceIds);

    stage = "custom-format dump process";
    const dumpSize = await createCustomDump({
      databaseUrl,
      dumpPath,
      postgresMajor,
      sourceSnapshot,
    });

    stage = "custom-format dump checksum";
    const dumpSha256 = await checksumCustomDump(dumpPath);

    stage = "same-snapshot JSON export";
    writeSameSnapshotExport(exportDir, sourceRows, sourceCounts);
    const exported = readExportSnapshot(exportDir);
    assertExportMatchesSource(exported, sourceCounts, sourceHashes);

    await sourceClient.query("rollback");
    sourceTransactionOpen = false;
    await sourceClient.end();
    sourceClient = null;

    stage = "isolated restore container startup";
    restoreContainer = `${CONTAINER_PREFIX}${Date.now()}-${randomBytes(4).toString("hex")}`;
    containerRemoved = false;
    await startRestoreContainer({
      containerName: restoreContainer,
      exportDir,
      postgresMajor,
    });
    targetEphemeral = true;
    await waitForPostgres(restoreContainer);

    stage = "isolated pg_restore";
    await runDocker([
      "exec",
      restoreContainer,
      "pg_restore",
      "--exit-on-error",
      "--no-owner",
      "--no-privileges",
      `--dbname=${RESTORE_DATABASE}`,
      "--username=postgres",
      "/backup/supabase.dump",
    ]);

    stage = "restored table verification";
    await verifyRestoredTables(restoreContainer);
    const restoredIds = await readIdsFromRestore(restoreContainer);
    const restoredCounts = countsFromIds(restoredIds);
    const restoredHashes = hashesFromIds(restoredIds);
    const countMatches = tableFlags((table) => (
      sourceCounts[table] === restoredCounts[table] &&
      exported.counts[table] === sourceCounts[table]
    ));
    const idHashMatches = tableFlags((table) => (
      sourceHashes[table] === restoredHashes[table] &&
      exported.hashes[table] === sourceHashes[table]
    ));

    if (!allFlagsTrue(countMatches) || !allFlagsTrue(idHashMatches)) {
      throw new Error("Restored data verification failed.");
    }

    verification = {
      performedAt: new Date().toISOString(),
      status: "ok",
      mode: RESTORE_REHEARSAL_MODE,
      sourceReadOnly: true,
      targetEphemeral: true,
      targetProduction: false,
      postgresMajor,
      tables: [...BACKUP_TABLES],
      sourceCounts,
      restoredCounts,
      countMatches,
      idHashMatches,
      dumpSha256,
      dumpSize,
      containerRemoved: false,
      secretsIncluded: false,
      productionWrites: 0,
    };
  } catch (error) {
    if (error instanceof SafeExternalCommandError) stage = error.stage;
    failureDetails = safeFailureDetails(error, stage);
    verification = null;
  } finally {
    if (sourceTransactionOpen && sourceClient) {
      await sourceClient.query("rollback").catch(() => undefined);
    }
    if (sourceClient) await sourceClient.end().catch(() => undefined);

    if (restoreContainer) {
      containerRemoved = await removeContainer(restoreContainer);
    }
  }

  if (!verification || !containerRemoved) {
    cleanupAttemptArtifacts(exportDir);
    const failedStage = containerRemoved ? stage : "container cleanup";
    return failure(failedStage, {
      details: containerRemoved ? failureDetails : safeFailureDetails(null, failedStage),
      sourceReadOnly,
      targetEphemeral,
      containerRemoved,
    });
  }

  verification.containerRemoved = true;
  try {
    writeJsonAtomic(evidencePath, verification);
  } catch (error) {
    cleanupAttemptArtifacts(exportDir);
    return failure("evidence write", {
      details: safeFailureDetails(error, "evidence write"),
      sourceReadOnly: true,
      targetEphemeral: true,
      containerRemoved: true,
    });
  }

  return {
    ok: true,
    status: "ok",
    mode: RESTORE_REHEARSAL_MODE,
    evidencePath: path.relative(root, evidencePath).replaceAll("\\", "/"),
    dumpPath: path.relative(root, dumpPath).replaceAll("\\", "/"),
    dumpSize: verification.dumpSize,
    postgresMajor: verification.postgresMajor,
    tables: verification.tables,
    sourceCounts: verification.sourceCounts,
    restoredCounts: verification.restoredCounts,
    countMatches: verification.countMatches,
    idHashMatches: verification.idHashMatches,
    sourceReadOnly: true,
    targetEphemeral: true,
    targetProduction: false,
    productionWrites: 0,
    containerRemoved: true,
    secretsIncluded: false,
  };
}

function readExportSnapshot(exportDir) {
  const manifest = readJson(path.join(exportDir, "export-manifest.json"));
  if (!manifest || manifest.readOnly !== true || manifest.snapshotAligned !== true || !sameTables(manifest.tables)) {
    throw new Error("Export manifest is invalid.");
  }

  const ids = {};
  for (const table of BACKUP_TABLES) {
    const rows = readJson(path.join(exportDir, `${table}.json`));
    if (!Array.isArray(rows)) throw new Error("Export rows are invalid.");
    ids[table] = rows.map((row) => {
      if (row?.id === null || row?.id === undefined) throw new Error("Export row ID is missing.");
      return String(row.id);
    });
    if (manifest.counts?.[table] !== ids[table].length) throw new Error("Export count is invalid.");
  }

  return {
    counts: countsFromIds(ids),
    hashes: hashesFromIds(ids),
  };
}

async function readRowsFromSource(client) {
  const rows = {};
  for (const table of BACKUP_TABLES) {
    const result = await client.query(`select * from public.${table} order by id::text asc`);
    rows[table] = result.rows;
  }
  return rows;
}

function idsFromRows(rows) {
  return Object.fromEntries(BACKUP_TABLES.map((table) => [table, rows[table].map((row) => String(row.id))]));
}

function writeSameSnapshotExport(exportDir, rows, counts) {
  for (const table of BACKUP_TABLES) {
    writeJsonAtomic(path.join(exportDir, `${table}.json`), rows[table]);
  }
  writeJsonAtomic(path.join(exportDir, "export-manifest.json"), {
    exportedAt: new Date().toISOString(),
    source: "rehearsal read-only snapshot",
    readOnly: true,
    snapshotAligned: true,
    tables: [...BACKUP_TABLES],
    counts,
    secretPolicy: {
      databaseUrlCopied: false,
      databasePasswordCopied: false,
      telegramTokenCopied: false,
    },
  });
}

async function createCustomDump({ databaseUrl, dumpPath, postgresMajor, sourceSnapshot }) {
  const connection = parsePostgresConnection(databaseUrl);
  const image = `postgres:${postgresMajor}-alpine`;
  const dumpContainer = `${CONTAINER_PREFIX}dump-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const tableArgs = DUMP_TABLE_ARGS.join(" ");
  const dumpCommand = [
    "umask 077",
    "trap 'rm -f /run/secrets/.pgpass' EXIT INT TERM",
    "IFS= read -r PGPASS_RECORD",
    "printf '%s\\n' \"$PGPASS_RECORD\" > /run/secrets/.pgpass",
    "chmod 0600 /run/secrets/.pgpass",
    "export PGPASSFILE=/run/secrets/.pgpass",
    "IFS= read -r SOURCE_SNAPSHOT",
    [
      "pg_dump",
      '--host="$DB_HOST"',
      '--port="$DB_PORT"',
      '--username="$DB_USER"',
      '--dbname="$DB_NAME"',
      "--format=custom",
      "--no-owner",
      "--no-privileges",
      "--strict-names",
      tableArgs,
      '--snapshot="$SOURCE_SNAPSHOT"',
    ].join(" "),
    "rm -f /run/secrets/.pgpass",
    "trap - EXIT INT TERM",
  ].join("\n");

  try {
    const result = await runCommandToAtomicFile("docker", [
      "run",
      "--rm",
      "--interactive",
      "--entrypoint",
      "sh",
      "--name",
      dumpContainer,
      "--env",
      "DB_HOST",
      "--env",
      "DB_PORT",
      "--env",
      "DB_NAME",
      "--env",
      "DB_USER",
      ...libpqDockerEnvArgs(PGDUMP_LIBPQ_ENV),
      "--tmpfs",
      "/run/secrets:rw,noexec,nosuid,nodev,mode=0700",
      image,
      "-ceu",
      dumpCommand,
    ], dumpPath, {
      env: safeChildEnv(postgresClientEnv(connection, PGDUMP_LIBPQ_ENV)),
      input: `${connection.pgpassLine}\n` + `${sourceSnapshot}\n`,
      stage: "custom-format dump process",
      validationStage: "custom-format dump file validation",
      toolCategory: "pg_dump",
      sensitiveValues: connectionSensitiveValues(databaseUrl, connection, sourceSnapshot),
    });
    return result.size;
  } finally {
    const dumpContainerRemoved = await removeContainer(dumpContainer);
    if (!dumpContainerRemoved) throw new Error("Dump container cleanup was not confirmed.");
  }
}

async function startRestoreContainer({ containerName, exportDir, postgresMajor }) {
  await runDocker([
    "run",
    "--detach",
    "--name",
    containerName,
    "--network",
    "none",
    "--env",
    "POSTGRES_HOST_AUTH_METHOD",
    "--env",
    "POSTGRES_DB",
    "--mount",
    `type=bind,source=${exportDir},target=/backup,readonly`,
    `postgres:${postgresMajor}-alpine`,
  ], {
    POSTGRES_HOST_AUTH_METHOD: "trust",
    POSTGRES_DB: RESTORE_DATABASE,
  });
}

async function waitForPostgres(containerName) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = await runDocker([
      "exec",
      containerName,
      "pg_isready",
      "--username=postgres",
      `--dbname=${RESTORE_DATABASE}`,
      "--quiet",
    ], {}, { allowFailure: true, timeoutMs: 15_000 });
    if (result.code === 0) return;
    await delay(1_000);
  }
  throw new Error("Restore PostgreSQL did not become ready.");
}

async function verifyRestoredTables(containerName) {
  const tableNames = BACKUP_TABLES.map((table) => `'${table}'`).join(",");
  const result = await runPsql(
    containerName,
    `select count(*) from information_schema.tables where table_schema = 'public' and table_name in (${tableNames});`,
  );
  if (Number(result.trim()) !== BACKUP_TABLES.length) throw new Error("Restored tables are missing.");
}

async function readIdsFromRestore(containerName) {
  const ids = {};
  for (const table of BACKUP_TABLES) {
    const output = await runPsql(
      containerName,
      `select encode(convert_to(id::text, 'UTF8'), 'hex') from public.${table} order by id::text asc;`,
    );
    ids[table] = output
      ? output.split(/\r?\n/).filter(Boolean).map((encoded) => Buffer.from(encoded, "hex").toString("utf8"))
      : [];
  }
  return ids;
}

async function runPsql(containerName, sql) {
  const result = await runDocker([
    "exec",
    containerName,
    "psql",
    "--no-psqlrc",
    "--tuples-only",
    "--no-align",
    "--set=ON_ERROR_STOP=1",
    "--username=postgres",
    `--dbname=${RESTORE_DATABASE}`,
    "--command",
    sql,
  ]);
  return result.stdout.trim();
}

async function removeContainer(containerName) {
  try {
    await runDocker(["rm", "--force", containerName], {}, { allowFailure: true, timeoutMs: 60_000 });
    const inspect = await runDocker(["inspect", containerName], {}, { allowFailure: true, timeoutMs: 30_000 });
    return inspect.code !== 0;
  } catch {
    return false;
  }
}

function assertExportMatchesSource(exported, sourceCounts, sourceHashes) {
  for (const table of BACKUP_TABLES) {
    if (exported.counts[table] !== sourceCounts[table] || exported.hashes[table] !== sourceHashes[table]) {
      throw new Error("JSON export does not match the dump snapshot.");
    }
  }
}

function postgresMajorFromVersion(value) {
  const version = Number.parseInt(String(value), 10);
  const major = Number.isInteger(version) ? Math.floor(version / 10_000) : Number.NaN;
  if (!Number.isInteger(major) || major < 10) throw new Error("Unsupported PostgreSQL server version.");
  return major;
}

function countsFromIds(ids) {
  return Object.fromEntries(BACKUP_TABLES.map((table) => [table, ids[table].length]));
}

function hashesFromIds(ids) {
  return Object.fromEntries(BACKUP_TABLES.map((table) => [table, hashIdList(ids[table])]));
}

function tableFlags(predicate) {
  return Object.fromEntries(BACKUP_TABLES.map((table) => [table, Boolean(predicate(table))]));
}

function allFlagsTrue(flags) {
  return BACKUP_TABLES.every((table) => flags[table] === true);
}

function sameTables(value) {
  return Array.isArray(value) && value.length === BACKUP_TABLES.length && BACKUP_TABLES.every((table) => value.includes(table));
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJsonAtomic(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  let fileDescriptor = null;
  try {
    fileDescriptor = openSync(temporaryPath, "wx", 0o600);
    writeFileSync(fileDescriptor, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    fsyncSync(fileDescriptor);
    closeSync(fileDescriptor);
    fileDescriptor = null;
    renameSync(temporaryPath, filePath);
  } finally {
    if (fileDescriptor !== null) closeSync(fileDescriptor);
    rmSync(temporaryPath, { force: true });
  }
}

function cleanupAttemptArtifacts(exportDir) {
  if (!existsSync(exportDir)) return;
  const baseNames = new Set([
    "export-manifest.json",
    "restore-rehearsal.json",
    "supabase.dump",
    ...BACKUP_TABLES.map((table) => `${table}.json`),
  ]);
  for (const entry of readdirSync(exportDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const isAttemptArtifact = baseNames.has(entry.name) || [...baseNames].some((name) => entry.name.startsWith(`${name}.`) && entry.name.endsWith(".tmp"));
    if (isAttemptArtifact) rmSync(path.join(exportDir, entry.name), { force: true });
  }
}

function parsePostgresConnection(databaseUrl) {
  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("PostgreSQL connection URL is invalid.");
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("PostgreSQL connection protocol is invalid.");
  }
  const connection = {
    host: parsed.hostname,
    port: parsed.port || "5432",
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
  };
  if (!connection.host || !connection.database || !connection.username || !connection.password) {
    throw new Error("PostgreSQL connection URL is incomplete.");
  }
  if (Object.values(connection).some((value) => /[\r\n\0]/.test(value))) {
    throw new Error("PostgreSQL connection fields contain unsupported characters.");
  }
  return {
    host: connection.host,
    port: connection.port,
    database: connection.database,
    username: connection.username,
    pgpassLine: [connection.host, connection.port, connection.database, connection.username, connection.password]
      .map(escapePgpassField)
      .join(":"),
  };
}

function postgresClientEnv(connection, libpqEnv) {
  return {
    DB_HOST: connection.host,
    DB_PORT: connection.port,
    DB_NAME: connection.database,
    DB_USER: connection.username,
    ...libpqEnv,
  };
}

function libpqDockerEnvArgs(libpqEnv) {
  return Object.keys(libpqEnv).flatMap((name) => ["--env", name]);
}

function connectionSensitiveValues(databaseUrl, connection, sourceSnapshot) {
  const values = new Set([
    databaseUrl,
    connection.host,
    connection.database,
    connection.username,
    sourceSnapshot,
  ]);
  const parsed = new URL(databaseUrl);
  values.add(decodeURIComponent(parsed.password));
  for (const candidate of [connection.host, connection.username]) {
    for (const part of String(candidate).split(/[.@]/)) {
      if (/^[a-z0-9]{15,40}$/i.test(part)) values.add(part);
    }
  }
  return [...values].filter(Boolean);
}

function escapePgpassField(value) {
  return value.replaceAll("\\", "\\\\").replaceAll(":", "\\:");
}

export function buildSafeFailureReport(stage, options = {}) {
  const details = options.details ?? safeFailureDetails(null, stage);
  const report = {
    status: "error",
    failedStage: safeStage(stage),
    diagnosticCode: details.diagnosticCode,
    safeMessage: details.safeMessage,
    sourceReadOnly: options.sourceReadOnly === true,
    targetEphemeral: options.targetEphemeral === true,
    targetProduction: false,
    productionWrites: 0,
    containerRemoved: options.containerRemoved !== false,
    secretsIncluded: false,
  };
  if (details.toolCategory) report.toolCategory = details.toolCategory;
  if (Number.isInteger(details.exitCode)) report.exitCode = details.exitCode;
  if (typeof details.timeout === "boolean") report.timeout = details.timeout;
  return report;
}

function failure(stage, options = {}) {
  return buildSafeFailureReport(stage, options);
}

async function runDocker(args, extraEnv = {}, options = {}) {
  return runCommand("docker", args, {
    env: safeChildEnv(extraEnv),
    allowFailure: options.allowFailure,
    timeoutMs: options.timeoutMs ?? COMMAND_TIMEOUT_MS,
    input: options.input,
    stage: options.stage,
    toolCategory: options.toolCategory ?? inferToolCategory("docker", args),
    sensitiveValues: options.sensitiveValues,
  });
}

export async function runCommandToAtomicFile(command, args, filePath, options = {}) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  const toolCategory = normalizeToolCategory(options.toolCategory ?? inferToolCategory(command, args));
  const stage = safeStage(options.stage ?? "external command");
  const validationStage = safeStage(options.validationStage ?? "custom-format dump file validation");
  let fileDescriptor = null;
  let child = null;
  let timer = null;
  let succeeded = false;
  let stderr = "";
  let timedOut = false;

  try {
    try {
      rmSync(filePath, { force: true });
    } catch {
      throw safeExternalError({ toolCategory: "filesystem", stage, diagnosticCode: "dump_write_failed" });
    }

    try {
      fileDescriptor = openSync(temporaryPath, "wx", 0o600);
    } catch {
      throw safeExternalError({ toolCategory: "filesystem", stage, diagnosticCode: "dump_write_failed" });
    }

    child = spawn(command, args, {
      cwd: process.cwd(),
      env: options.env,
      shell: false,
      windowsHide: true,
      stdio: [options.input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
    });

    const maxDiagnosticOutput = 16 * 1024 * 1024;
    child.stderr.on("data", (chunk) => {
      const next = stderr + chunk.toString("utf8");
      if (Buffer.byteLength(next, "utf8") > maxDiagnosticOutput) child.kill();
      stderr = next.slice(0, maxDiagnosticOutput);
    });

    const processResult = new Promise((resolve) => {
      let settled = false;
      child.once("error", () => {
        if (settled) return;
        settled = true;
        resolve({ code: 1, spawnFailed: true });
      });
      child.once("close", (code) => {
        if (settled) return;
        settled = true;
        resolve({ code: Number(code ?? 1), spawnFailed: false });
      });
    });

    const outputStream = createWriteStream(temporaryPath, {
      fd: fileDescriptor,
      autoClose: false,
    });
    const outputResult = pipeline(child.stdout, outputStream).then(
      () => ({ error: null }),
      (error) => {
        child.kill();
        return { error };
      },
    );

    if (options.input !== undefined) {
      child.stdin.on("error", () => undefined);
      child.stdin.end(options.input);
    }

    timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, options.timeoutMs ?? COMMAND_TIMEOUT_MS);

    const [processOutcome, outputOutcome] = await Promise.all([processResult, outputResult]);
    clearTimeout(timer);
    timer = null;

    if (processOutcome.spawnFailed) {
      throw safeExternalError({
        toolCategory: command === "docker" ? "docker" : toolCategory,
        stage,
        diagnosticCode: command === "docker" ? "container_start_failed" : "unknown_external_failure",
      });
    }

    if (processOutcome.code !== 0) {
      throw new SafeExternalCommandError(classifyExternalDiagnostic({
        stderr,
        sensitiveValues: options.sensitiveValues,
        toolCategory,
        stage,
        exitCode: processOutcome.code,
        timeout: timedOut,
      }));
    }

    if (outputOutcome.error) {
      throw safeExternalError({ toolCategory: "filesystem", stage, diagnosticCode: "dump_write_failed" });
    }

    try {
      fsyncSync(fileDescriptor);
      closeSync(fileDescriptor);
      fileDescriptor = null;
    } catch {
      throw safeExternalError({ toolCategory: "filesystem", stage, diagnosticCode: "dump_write_failed" });
    }

    const size = validateCustomDumpFile(temporaryPath, { stage: validationStage });
    renameCustomDump(temporaryPath, filePath, validationStage);
    succeeded = true;
    return { code: 0, size };
  } finally {
    if (timer) clearTimeout(timer);
    if (fileDescriptor !== null) {
      try {
        closeSync(fileDescriptor);
      } catch {
        // The safe diagnostic is selected before cleanup.
      }
    }
    rmSync(temporaryPath, { force: true });
    if (!succeeded) rmSync(filePath, { force: true });
  }
}

export function validateCustomDumpFile(filePath, options = {}) {
  const stage = safeStage(options.stage ?? "custom-format dump file validation");
  const fsOps = {
    stat: options.stat ?? statSync,
    open: options.open ?? openSync,
    read: options.read ?? readSync,
    close: options.close ?? closeSync,
  };
  let stats;

  try {
    stats = fsOps.stat(filePath);
  } catch (error) {
    throw dumpFileError(classifyDumpFileDiagnostic({ operation: "stat", errorCode: error?.code }), stage);
  }

  if (!stats?.isFile?.()) throw dumpFileError("dump_format_invalid", stage);
  if (stats.size === 0) throw dumpFileError("dump_file_empty", stage);
  if (!Number.isSafeInteger(stats.size) || stats.size <= 5) throw dumpFileError("dump_format_invalid", stage);

  let fileDescriptor = null;
  const header = Buffer.alloc(5);
  try {
    fileDescriptor = fsOps.open(filePath, "r");
    const bytesRead = fsOps.read(fileDescriptor, header, 0, header.length, 0);
    if (bytesRead !== header.length) throw dumpFileError("dump_format_invalid", stage);
  } catch (error) {
    if (error instanceof SafeExternalCommandError) throw error;
    throw dumpFileError(classifyDumpFileDiagnostic({ operation: "read", errorCode: error?.code }), stage);
  } finally {
    if (fileDescriptor !== null) {
      try {
        fsOps.close(fileDescriptor);
      } catch {
        // Readability has already been determined without exposing OS details.
      }
    }
  }

  if (!header.equals(Buffer.from("PGDMP", "ascii"))) {
    throw dumpFileError("dump_format_invalid", stage);
  }

  return stats.size;
}

export function classifyDumpFileDiagnostic({ operation, errorCode } = {}) {
  if (errorCode === "ENOENT") return "dump_file_missing";
  if (operation === "read" && ["EACCES", "EPERM"].includes(errorCode)) return "dump_file_unreadable";
  if (operation === "rename") return "dump_atomic_rename_failed";
  if (operation === "checksum") return "dump_checksum_failed";
  if (operation === "empty") return "dump_file_empty";
  if (operation === "format") return "dump_format_invalid";
  return operation === "stat" ? "dump_file_missing" : "dump_file_unreadable";
}

function renameCustomDump(temporaryPath, filePath, stage) {
  try {
    renameSync(temporaryPath, filePath);
  } catch (error) {
    throw dumpFileError(classifyDumpFileDiagnostic({ operation: "rename", errorCode: error?.code }), stage);
  }
}

async function checksumCustomDump(filePath) {
  try {
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(filePath)) hash.update(chunk);
    return hash.digest("hex");
  } catch (error) {
    throw dumpFileError(classifyDumpFileDiagnostic({ operation: "checksum", errorCode: error?.code }), "custom-format dump checksum");
  }
}

function dumpFileError(diagnosticCode, stage) {
  return safeExternalError({
    toolCategory: "filesystem",
    stage,
    diagnosticCode,
  });
}

function safeChildEnv(extra = {}) {
  const allowed = [
    "PATH",
    "Path",
    "SystemRoot",
    "WINDIR",
    "COMSPEC",
    "PATHEXT",
    "HOME",
    "USERPROFILE",
    "TEMP",
    "TMP",
    "DOCKER_HOST",
    "DOCKER_CONTEXT",
    "DOCKER_CONFIG",
  ];
  const env = {};
  for (const key of allowed) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return { ...env, ...extra };
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const toolCategory = normalizeToolCategory(options.toolCategory ?? inferToolCategory(command, args));
    const stage = safeStage(options.stage ?? "external command");
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: options.env,
      shell: false,
      windowsHide: true,
      stdio: [options.input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;
    const maxOutput = 16 * 1024 * 1024;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, options.timeoutMs ?? COMMAND_TIMEOUT_MS);

    const collect = (current, chunk) => {
      const next = current + chunk.toString("utf8");
      if (Buffer.byteLength(next, "utf8") > maxOutput) child.kill();
      return next.slice(0, maxOutput);
    };
    child.stdout.on("data", (chunk) => { stdout = collect(stdout, chunk); });
    child.stderr.on("data", (chunk) => { stderr = collect(stderr, chunk); });
    if (options.input !== undefined) {
      child.stdin.on("error", () => undefined);
      child.stdin.end(options.input);
    }
    child.on("error", () => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      reject(safeExternalError({
        toolCategory,
        stage,
        diagnosticCode: toolCategory === "docker" ? "container_start_failed" : "unknown_external_failure",
      }));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      const result = { code: Number(code ?? 1), stdout, stderr };
      if (result.code !== 0 && !options.allowFailure) {
        reject(new SafeExternalCommandError(classifyExternalDiagnostic({
          stdout,
          stderr,
          sensitiveValues: options.sensitiveValues,
          toolCategory,
          stage,
          exitCode: result.code,
          timeout: timedOut,
        })));
        return;
      }
      resolve(result);
    });
  });
}

export function classifyExternalDiagnostic(options = {}) {
  const diagnostic = redactExternalDiagnostic(
    `${String(options.stderr ?? "")}\n${String(options.stdout ?? "")}`,
    options.sensitiveValues,
  );
  const toolCategory = normalizeToolCategory(options.toolCategory);
  const timeout = options.timeout === true;
  let diagnosticCode = "unknown_external_failure";

  if (timeout || /connection timed out|timeout expired|operation timed out|context deadline exceeded/i.test(diagnostic)) {
    diagnosticCode = "connection_timeout";
  } else if (/invalid response to GSSAPI negotiation|GSSAPI negotiation|gssencmode|GSS encryption/i.test(diagnostic)) {
    diagnosticCode = "gssapi_negotiation_failed";
  } else if (/password authentication failed|authentication failed|no password supplied|SASL authentication failed|SCRAM authentication failed/i.test(diagnostic)) {
    diagnosticCode = "authentication_failed";
  } else if (/could not translate host name|name or service not known|temporary failure in name resolution|getaddrinfo|nodename nor servname/i.test(diagnostic)) {
    diagnosticCode = "dns_resolution_failed";
  } else if (/SSL error|TLS handshake|certificate verify failed|server does not support SSL|sslmode/i.test(diagnostic)) {
    diagnosticCode = "tls_failed";
  } else if (/invalid snapshot identifier|snapshot .* does not exist|could not import the requested snapshot|SET TRANSACTION SNAPSHOT/i.test(diagnostic)) {
    diagnosticCode = "snapshot_import_failed";
  } else if (/no matching tables were found|no matching schemas were found|strict-names/i.test(diagnostic)) {
    diagnosticCode = "table_pattern_not_found";
  } else if (/permission denied|insufficient privilege|must be owner|not allowed to/i.test(diagnostic)) {
    diagnosticCode = "permission_denied";
  } else if (/server version:.*pg_dump version|aborting because of server version mismatch|unsupported server version/i.test(diagnostic)) {
    diagnosticCode = "client_server_version_mismatch";
  } else if (/could not open output file|could not write to output file|no space left on device|input\/output error|write failed/i.test(diagnostic)) {
    diagnosticCode = "dump_write_failed";
  } else if (/(?:^|\n)(?:\/bin\/)?(?:sh|bash)(?::|\[\d+\]:)[^\n]*(?:syntax error|unexpected token|unknown operand|illegal option)|shell command parsing failure/i.test(diagnostic)) {
    diagnosticCode = "container_shell_failed";
  } else if (["pg_dump", "psql"].includes(toolCategory) && (
    /server closed the connection unexpectedly|connection to server was lost|could not receive data from server|terminating connection|unexpected EOF on client connection|connection reset by peer/i.test(diagnostic) ||
    (options.exitCode === 2 && !timeout)
  )) {
    diagnosticCode = "postgres_connection_failed";
  } else if (toolCategory === "docker" && /cannot connect to the Docker daemon|OCI runtime|container .* failed|unable to find image/i.test(diagnostic)) {
    diagnosticCode = "container_start_failed";
  }

  return {
    toolCategory,
    stage: safeStage(options.stage),
    exitCode: Number.isInteger(options.exitCode) ? options.exitCode : 1,
    timeout,
    diagnosticCode,
    safeMessage: safeMessageForCode(diagnosticCode),
  };
}

export function redactExternalDiagnostic(value, sensitiveValues = []) {
  let redacted = String(value ?? "");
  const exactValues = [...new Set((sensitiveValues ?? []).map((item) => String(item ?? "")).filter(Boolean))]
    .sort((left, right) => right.length - left.length);
  for (const sensitiveValue of exactValues) {
    redacted = redacted.replaceAll(sensitiveValue, "[REDACTED]");
  }
  return redacted
    .replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, "[REDACTED_JWT]")
    .replace(/\b\d{6,}:[A-Za-z0-9_-]{20,}\b/g, "[REDACTED_TOKEN]")
    .replace(/\b(?:host|user|username|dbname|database|password)\s*=\s*[^\s]+/gi, (match) => `${match.split("=")[0]}=[REDACTED]`)
    .replace(/\b(?:[a-z0-9-]+\.)+supabase\.(?:co|com)\b/gi, "[REDACTED_HOST]")
    .replace(/\b[0-9A-F]{8}-[0-9A-F]{8}-\d+\b/gi, "[REDACTED_SNAPSHOT]")
    .replace(/\b[a-z0-9]{20}\b/gi, "[REDACTED_PROJECT_REF]");
}

function safeFailureDetails(error, stage) {
  if (error instanceof SafeExternalCommandError) {
    return { ...error.toJSON(), stage: safeStage(stage) };
  }
  return {
    stage: safeStage(stage),
    diagnosticCode: "unknown_external_failure",
    safeMessage: safeMessageForCode("unknown_external_failure"),
  };
}

function safeExternalError({ toolCategory, stage, diagnosticCode, exitCode = 1, timeout = false }) {
  return new SafeExternalCommandError({
    toolCategory,
    stage,
    exitCode,
    timeout,
    diagnosticCode,
    safeMessage: safeMessageForCode(diagnosticCode),
  });
}

function safeMessageForCode(code) {
  const messages = {
    gssapi_negotiation_failed: "PostgreSQL client negotiation through the configured pooler failed.",
    authentication_failed: "PostgreSQL client authentication failed.",
    dns_resolution_failed: "PostgreSQL client could not resolve the configured endpoint.",
    connection_timeout: "PostgreSQL client connection timed out.",
    tls_failed: "PostgreSQL TLS negotiation failed.",
    snapshot_import_failed: "PostgreSQL client could not import the synchronized snapshot.",
    table_pattern_not_found: "The allowlisted PostgreSQL table selection did not match.",
    permission_denied: "PostgreSQL denied the requested read-only backup operation.",
    client_server_version_mismatch: "PostgreSQL client and server major versions are incompatible.",
    postgres_connection_failed: "The PostgreSQL client could not maintain the configured database connection.",
    container_start_failed: "The isolated PostgreSQL client container could not start.",
    container_shell_failed: "The isolated PostgreSQL client shell wrapper failed.",
    dump_write_failed: "The PostgreSQL custom-format dump could not be written.",
    dump_file_missing: "The PostgreSQL dump file is missing after the dump process completed.",
    dump_file_empty: "The PostgreSQL dump file is empty.",
    dump_file_unreadable: "The PostgreSQL dump was created but is not readable by the workflow process.",
    dump_format_invalid: "The PostgreSQL output is not a valid custom-format dump.",
    dump_atomic_rename_failed: "The PostgreSQL dump could not be finalized atomically.",
    dump_checksum_failed: "The PostgreSQL dump checksum could not be calculated.",
    unknown_external_failure: "An external backup command failed without exposing diagnostic output.",
  };
  return messages[code] ?? messages.unknown_external_failure;
}

function inferToolCategory(command, args) {
  const commandText = `${command}\n${(args ?? []).join("\n")}`;
  if (/\bpg_dump\b/i.test(commandText)) return "pg_dump";
  if (/\bpg_restore\b/i.test(commandText)) return "pg_restore";
  if (/\bpsql\b/i.test(commandText)) return "psql";
  return "docker";
}

function normalizeToolCategory(value) {
  return ["docker", "psql", "pg_dump", "pg_restore", "filesystem"].includes(value) ? value : "docker";
}

function safeStage(value) {
  const stage = String(value ?? "external command").trim();
  return /^[A-Za-z0-9 -]{1,80}$/.test(stage) ? stage : "external command";
}
