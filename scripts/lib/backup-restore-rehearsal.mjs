import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { loadLocalEnv } from "./load-local-env.mjs";
import { buildPgConfig } from "./pg-config.mjs";
import {
  BACKUP_TABLES,
  RESTORE_REHEARSAL_MODE,
  hashIdList,
  sha256File,
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

    const versionResult = await sourceClient.query("show server_version_num");
    const postgresMajor = postgresMajorFromVersion(versionResult.rows[0]?.server_version_num);
    const snapshotResult = await sourceClient.query("select pg_export_snapshot() as snapshot");
    const sourceSnapshot = String(snapshotResult.rows[0]?.snapshot ?? "");
    if (!sourceSnapshot) throw new Error("Source snapshot is unavailable.");

    const sourceRows = await readRowsFromSource(sourceClient);
    const sourceIds = idsFromRows(sourceRows);
    const sourceCounts = countsFromIds(sourceIds);
    const sourceHashes = hashesFromIds(sourceIds);

    stage = "custom-format dump";
    await createCustomDump({
      databaseUrl,
      exportDir,
      postgresMajor,
      sourceSnapshot,
    });

    if (!existsSync(dumpPath) || statSync(dumpPath).size <= 0) {
      throw new Error("Dump is missing or empty.");
    }
    const dumpSize = statSync(dumpPath).size;
    const dumpSha256 = sha256File(dumpPath);

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
  } catch {
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
    return failure(containerRemoved ? stage : "container cleanup");
  }

  verification.containerRemoved = true;
  try {
    writeJsonAtomic(evidencePath, verification);
  } catch {
    cleanupAttemptArtifacts(exportDir);
    return failure("evidence write");
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

async function createCustomDump({ databaseUrl, exportDir, postgresMajor, sourceSnapshot }) {
  const connection = parsePostgresConnection(databaseUrl);
  const image = `postgres:${postgresMajor}-alpine`;
  const dumpContainer = `${CONTAINER_PREFIX}dump-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const tableArgs = DUMP_TABLE_ARGS.join(" ");
  const dumpCommand = [
    "umask 077",
    "trap 'rm -f /run/secrets/.pgpass' EXIT INT TERM",
    "cat > /run/secrets/.pgpass",
    "chmod 0600 /run/secrets/.pgpass",
    "export PGPASSFILE=/run/secrets/.pgpass",
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
      "--file=/backup/supabase.dump",
    ].join(" "),
    "rm -f /run/secrets/.pgpass",
    "trap - EXIT INT TERM",
  ].join("\n");

  try {
    await runDocker([
      "run",
      "--rm",
      "--interactive",
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
      "--env",
      "SOURCE_SNAPSHOT",
      "--env",
      "PGOPTIONS",
      "--env",
      "PGSSLMODE",
      "--tmpfs",
      "/run/secrets:rw,noexec,nosuid,nodev,mode=0700",
      "--mount",
      `type=bind,source=${exportDir},target=/backup`,
      image,
      "sh",
      "-ceu",
      dumpCommand,
    ], {
      DB_HOST: connection.host,
      DB_PORT: connection.port,
      DB_NAME: connection.database,
      DB_USER: connection.username,
      SOURCE_SNAPSHOT: sourceSnapshot,
      PGOPTIONS: "-c default_transaction_read_only=on",
      PGSSLMODE: "require",
    }, {
      input: `${connection.pgpassLine}\n`,
    });
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

function escapePgpassField(value) {
  return value.replaceAll("\\", "\\\\").replaceAll(":", "\\:");
}

function failure(stage) {
  return {
    ok: false,
    status: "error",
    mode: RESTORE_REHEARSAL_MODE,
    message: `Restore rehearsal failed during ${stage}. No production writes were made.`,
    sourceReadOnly: null,
    targetEphemeral: null,
    targetProduction: false,
    productionWrites: 0,
    secretsIncluded: false,
  };
}

async function runDocker(args, extraEnv = {}, options = {}) {
  return runCommand("docker", args, {
    env: safeChildEnv(extraEnv),
    allowFailure: options.allowFailure,
    timeoutMs: options.timeoutMs ?? COMMAND_TIMEOUT_MS,
    input: options.input,
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
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: options.env,
      shell: false,
      windowsHide: true,
      stdio: [options.input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const maxOutput = 16 * 1024 * 1024;
    const timer = setTimeout(() => child.kill(), options.timeoutMs ?? COMMAND_TIMEOUT_MS);

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
      reject(new Error("External command could not start."));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const result = { code: Number(code ?? 1), stdout, stderr };
      if (result.code !== 0 && !options.allowFailure) {
        reject(new Error("External command failed."));
        return;
      }
      resolve(result);
    });
  });
}
