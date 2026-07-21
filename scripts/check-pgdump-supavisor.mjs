import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  BASE_SUPAVISOR_LIBPQ_ENV,
  PGDUMP_LIBPQ_ENV,
  SafeExternalCommandError,
  buildSafeFailureReport,
  classifyDumpFileDiagnostic,
  classifyExternalDiagnostic,
  redactExternalDiagnostic,
  runCommandToAtomicFile,
  validateCustomDumpFile,
} from "./lib/backup-restore-rehearsal.mjs";

const source = readFileSync("scripts/lib/backup-restore-rehearsal.mjs", "utf8");
const workflow = readFileSync(".github/workflows/production-safety-check.yml", "utf8");
const results = [];
const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), "telegram-pgdump-stream-"));
process.once("exit", () => rmSync(fixtureRoot, { recursive: true, force: true }));
const evidenceFields = [
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
].sort();
const failureReportFields = [
  "status",
  "failedStage",
  "toolCategory",
  "exitCode",
  "timeout",
  "diagnosticCode",
  "safeMessage",
  "sourceReadOnly",
  "targetEphemeral",
  "targetProduction",
  "productionWrites",
  "containerRemoved",
  "secretsIncluded",
].sort();
const fixture = Object.freeze({
  databaseUrl: "postgresql://fixture_user:fixture_password@fixture-project.pooler.supabase.com:5432/fixture_db",
  password: "fixture_password",
  host: "fixture-project.pooler.supabase.com",
  username: "postgres.abcdefghijklmnopqrst",
  projectRef: "abcdefghijklmnopqrst",
  database: "fixture_db",
  snapshot: "00000003-0000001B-1",
  jwt: "eyJabcdefghijk.abcdefghijklmnop.qrstuvwxyz012345",
  telegramToken: "123456789:abcdefghijklmnopqrstuvwxyzABCDE",
});
const sensitiveValues = [
  fixture.databaseUrl,
  fixture.password,
  fixture.host,
  fixture.username,
  fixture.projectRef,
  fixture.database,
  fixture.snapshot,
];

test("base Supavisor libpq environment excludes session-level PGOPTIONS", () => {
  assert.deepEqual(BASE_SUPAVISOR_LIBPQ_ENV, {
    PGGSSENCMODE: "disable",
    PGSSLMODE: "require",
    PGCONNECT_TIMEOUT: "30",
  });
  assert.equal(Object.hasOwn(BASE_SUPAVISOR_LIBPQ_ENV, "PGOPTIONS"), false);
});

test("pg_dump keeps the defense-in-depth read-only environment", () => {
  assert.deepEqual(PGDUMP_LIBPQ_ENV, {
    PGGSSENCMODE: "disable",
    PGSSLMODE: "require",
    PGCONNECT_TIMEOUT: "30",
    PGOPTIONS: "-c default_transaction_read_only=on",
  });
});

testCode("GSSAPI negotiation", "received invalid response to GSSAPI negotiation: S", "gssapi_negotiation_failed");
testCode("authentication", `password authentication failed for user "${fixture.username}"`, "authentication_failed");
testCode("DNS resolution", `could not translate host name "${fixture.host}": Name or service not known`, "dns_resolution_failed");
testCode("connection timeout", "connection timed out", "connection_timeout");
testCode("TLS negotiation", "SSL error: certificate verify failed", "tls_failed");
testCode("snapshot import", `invalid snapshot identifier: "${fixture.snapshot}"`, "snapshot_import_failed");
testCode("table pattern", "pg_dump: no matching tables were found", "table_pattern_not_found");
testCode("permission", "permission denied for table posts", "permission_denied");
testCode("client/server version", "server version: 18; pg_dump version: 17", "client_server_version_mismatch");
testCode("dump write", "could not write to output file: No space left on device", "dump_write_failed");

testDiagnostic("pg_dump exit code 2 fallback", {
  stderr: "pg_dump exited before completing the client operation",
  toolCategory: "pg_dump",
  exitCode: 2,
}, "postgres_connection_failed");
testDiagnostic("psql exit code 2 fallback", {
  stderr: "psql exited before completing the client operation",
  toolCategory: "psql",
  exitCode: 2,
}, "postgres_connection_failed");
testDiagnostic("server closed connection", {
  stderr: "server closed the connection unexpectedly",
  toolCategory: "pg_dump",
  exitCode: 1,
}, "postgres_connection_failed");
testDiagnostic("connection reset", {
  stderr: "connection reset by peer",
  toolCategory: "pg_dump",
  exitCode: 1,
}, "postgres_connection_failed");
for (const [name, stderr] of [
  ["connection lost", "connection to server was lost"],
  ["receive failure", "could not receive data from server"],
  ["terminating connection", "terminating connection"],
  ["unexpected EOF", "unexpected EOF on client connection"],
]) {
  testDiagnostic(name, {
    stderr,
    toolCategory: "pg_dump",
    exitCode: 1,
  }, "postgres_connection_failed");
}
testDiagnostic("confirmed shell syntax failure", {
  stderr: "sh: syntax error: unexpected token",
  toolCategory: "pg_dump",
  exitCode: 2,
}, "container_shell_failed");
testDiagnostic("Docker exit code 2 is not assumed to be a shell failure", {
  stderr: "unclassified Docker failure",
  toolCategory: "docker",
  exitCode: 2,
}, "unknown_external_failure");
testDiagnostic("precise authentication category beats exit code 2 fallback", {
  stderr: "password authentication failed",
  toolCategory: "pg_dump",
  exitCode: 2,
}, "authentication_failed");

test("sensitive diagnostic redaction", () => {
  const raw = [
    fixture.databaseUrl,
    `password=${fixture.password}`,
    `host=${fixture.host}`,
    `user=${fixture.username}`,
    `database=${fixture.database}`,
    fixture.projectRef,
    fixture.snapshot,
    fixture.jwt,
    fixture.telegramToken,
  ].join("\n");
  const redacted = redactExternalDiagnostic(raw, sensitiveValues);
  for (const forbidden of Object.values(fixture)) {
    assert.equal(redacted.includes(forbidden), false, "Sensitive fixture value was not redacted.");
  }
});

test("safe external error contains no raw diagnostics", () => {
  const rawStderr = `pg_dump ${fixture.databaseUrl} password=${fixture.password} invalid response to GSSAPI negotiation: S`;
  const details = classifyExternalDiagnostic({
    stderr: rawStderr,
    sensitiveValues,
    toolCategory: "pg_dump",
    stage: "custom-format dump",
    exitCode: 1,
  });
  const error = new SafeExternalCommandError({ ...details, safeMessage: rawStderr });
  const serialized = JSON.stringify(error);
  assert.deepEqual(Object.keys(error.toJSON()).sort(), [
    "diagnosticCode",
    "exitCode",
    "safeMessage",
    "stage",
    "timeout",
    "toolCategory",
  ]);
  assert.equal(serialized.includes(rawStderr), false);
  assert.equal(serialized.includes(fixture.databaseUrl), false);
  assert.doesNotMatch(serialized, /stderr|stdout|args|env|stack/i);
});

test("pg_dump failure report uses only the safe allowlist", () => {
  const details = classifyExternalDiagnostic({
    stderr: `server closed the connection unexpectedly at ${fixture.host}`,
    sensitiveValues,
    toolCategory: "pg_dump",
    stage: "custom-format dump",
    exitCode: 2,
  });
  const report = buildSafeFailureReport("custom-format dump", {
    details,
    sourceReadOnly: true,
    targetEphemeral: false,
    containerRemoved: true,
  });
  const serialized = JSON.stringify(report);
  assert.deepEqual(Object.keys(report).sort(), failureReportFields);
  assert.equal(report.status, "error");
  assert.equal(report.failedStage, "custom-format dump");
  assert.equal(report.diagnosticCode, "postgres_connection_failed");
  assert.equal(report.safeMessage, "The PostgreSQL client could not maintain the configured database connection.");
  assert.equal(report.sourceReadOnly, true);
  assert.equal(report.targetEphemeral, false);
  assert.equal(report.targetProduction, false);
  assert.equal(report.productionWrites, 0);
  assert.equal(report.containerRemoved, true);
  assert.doesNotMatch(serialized, /stderr|stdout|args|env|stack|postgresql:\/\//i);
  for (const forbidden of sensitiveValues) assert.equal(serialized.includes(forbidden), false);
});

test("production executor contains no optional psql preflight", () => {
  assert.doesNotMatch(source, /runPostgresClientPreflight|POSTGRES_PREFLIGHT_SQL|parsePostgresPreflightOutput/);
  assert.doesNotMatch(source, /preflightContainer|Docker PostgreSQL preflight|connectionPreflight/);
  assert.doesNotMatch(source, /psql --version|preflight\.sql/);
});

test("executor success evidence has the exact gate schema", () => {
  assert.deepEqual(executorEvidenceKeys(), evidenceFields);
  assert.doesNotMatch(successReportSource(), /connectionPreflight/);
});

test("snapshot lifecycle remains synchronized", () => {
  const orderedTokens = [
    "begin isolation level repeatable read read only",
    "show transaction_read_only",
    "show server_version_num",
    "select pg_export_snapshot() as snapshot",
    "readRowsFromSource(sourceClient)",
    "await createCustomDump({",
    "writeSameSnapshotExport(exportDir, sourceRows, sourceCounts)",
    'await sourceClient.query("rollback")',
  ];
  let previous = -1;
  for (const token of orderedTokens) {
    const current = source.toLowerCase().indexOf(token.toLowerCase(), previous + 1);
    assert.ok(current > previous, `Snapshot lifecycle token is missing or out of order: ${token}`);
    previous = current;
  }
  assert.match(source, /--snapshot="\$SOURCE_SNAPSHOT"/);
});

test("pg_dump keeps GSS, TLS, timeout, read-only, and synchronized snapshot controls", () => {
  const dump = customDumpSource();
  assert.match(dump, /postgres:\$\{postgresMajor\}-alpine/);
  assert.match(dump, /PGDUMP_LIBPQ_ENV/);
  assert.match(dump, /--format=custom/);
  assert.match(dump, /--no-owner/);
  assert.match(dump, /--no-privileges/);
  assert.match(dump, /--strict-names/);
  assert.match(dump, /--snapshot="\$SOURCE_SNAPSHOT"/);
  assert.match(dump, /--interactive/);
  assert.match(dump, /"--entrypoint",\s*"sh"/);
  assert.doesNotMatch(dump, /--tty/);
  assert.match(dump, /--tmpfs[\s\S]*\/run\/secrets:rw,noexec,nosuid,nodev,mode=0700/);
  assert.match(dump, /IFS= read -r PGPASS_RECORD/);
  assert.equal(pgpassSourceBackslashCount(), 2);
  assert.equal(
    pgpassRuntimeCommand(),
    `printf '%s\\n' "$PGPASS_RECORD" > /run/secrets/.pgpass`,
  );
  assert.doesNotMatch(dump, /\|\s*cat\s*>\s*\/run\/secrets\/\.pgpass/);
  assert.match(dump, /IFS= read -r SOURCE_SNAPSHOT/);
  assert.match(dump, /chmod 0600 \/run\/secrets\/\.pgpass/);
  assert.match(dump, /input: `\$\{connection\.pgpassLine\}\\n` \+ `\$\{sourceSnapshot\}\\n`/);
  assert.doesNotMatch(dump, /"--env",\s*"SOURCE_SNAPSHOT"/);
  assert.doesNotMatch(dump, /SOURCE_SNAPSHOT:\s*sourceSnapshot/);
  assert.doesNotMatch(dump, /--file=\/backup\/supabase\.dump/);
  assert.doesNotMatch(dump, /type=bind[^\n]*target=\/backup/);
  assert.match(dump, /finally[\s\S]*removeContainer\(dumpContainer\)/);
});

test("host-owned dump helper streams binary stdout atomically", () => {
  const helper = atomicFileSource();
  assert.match(helper, /openSync\(temporaryPath, "wx", 0o600\)/);
  assert.match(helper, /createWriteStream\(temporaryPath/);
  assert.match(helper, /pipeline\(child\.stdout, outputStream\)/);
  assert.match(helper, /fsyncSync\(fileDescriptor\)/);
  assert.match(helper, /renameCustomDump\(temporaryPath, filePath/);
  assert.match(helper, /rmSync\(temporaryPath, \{ force: true \}\)/);
  assert.match(helper, /if \(!succeeded\) rmSync\(filePath, \{ force: true \}\)/);
  assert.doesNotMatch(helper, /child\.stdout\.on\("data"/);
  assert.doesNotMatch(helper, /stdout[\s\S]{0,120}toString\("utf8"\)/);
});

test("dump process, validation, and checksum stages are distinct", () => {
  assert.match(source, /stage = "custom-format dump process"/);
  assert.match(source, /validationStage: "custom-format dump file validation"/);
  assert.match(source, /stage = "custom-format dump checksum"/);
});

test("pg_dump allowlist contains exactly four approved tables", () => {
  const actual = [...source.matchAll(/"--table=(public\.[a-z_]+)"/g)].map((match) => match[1]);
  assert.deepEqual(actual, [
    "public.channels",
    "public.posts",
    "public.publication_logs",
    "public.scheduler_runs",
  ]);
});

test("no connection fallback or raw diagnostic output", () => {
  assert.doesNotMatch(source, /(?:^|[^0-9])6543(?:[^0-9]|$)/);
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:stderr|stdout|DATABASE_URL)/i);
  assert.doesNotMatch(source, /(?:transaction[_ -]?pooler|fallback[_ -]?(?:url|database))/i);
  assert.doesNotMatch(source, /error\.stack/);
});

test("workflow triggers and publishing safety remain unchanged", () => {
  assert.match(workflow, /on:\s*\r?\n\s+workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /\n\s+(?:schedule|push|pull_request):/m);
  assert.doesNotMatch(workflow, /npm run (?:publish:|zodiac:[^\s]*publish|[^\s]*ledger[^\s]*(?:write|backfill))/i);
});

test("complete non-production pg_dump fixture", () => {
  const details = classifyExternalDiagnostic({
    stderr: `pg_dump: ${fixture.databaseUrl}: snapshot ${fixture.snapshot}: no matching tables were found`,
    sensitiveValues,
    toolCategory: "pg_dump",
    stage: "custom-format dump",
    exitCode: 1,
  });
  assert.equal(details.diagnosticCode, "table_pattern_not_found");
  assert.equal(details.safeMessage, "The allowlisted PostgreSQL table selection did not match.");
  assert.equal(JSON.stringify(details).includes(fixture.snapshot), false);
});

test("custom dump validator accepts a PGDMP fixture", () => {
  const filePath = fixturePath("valid.dump");
  const content = Buffer.concat([Buffer.from("PGDMP", "ascii"), Buffer.from([0, 1, 2, 255])]);
  writeFileSync(filePath, content, { mode: 0o600 });
  assert.equal(validateCustomDumpFile(filePath), content.length);
});

test("pgpass source encodes one runtime newline escape", () => {
  assert.equal(pgpassSourceBackslashCount(), 2);
  assert.equal(
    pgpassRuntimeCommand(),
    `printf '%s\\n' "$PGPASS_RECORD" > /run/secrets/.pgpass`,
  );
});

test("pgpass shell fixture writes the record plus exactly one LF", () => {
  const fixtureResult = runPgpassProtocolFixture("pgpass-bytes");
  const expected = Buffer.concat([Buffer.from(fixtureResult.record, "utf8"), Buffer.from([0x0a])]);
  assert.deepEqual(fixtureResult.pgpass, expected);
  assert.equal(fixtureResult.pgpass.at(-1), 0x0a);
  assert.equal(trailingByteCount(fixtureResult.pgpass, 0x0a), 1);
  assert.equal(fixtureResult.pgpass.includes(Buffer.from([0x5c, 0x6e])), false);
  assert.notDeepEqual(fixtureResult.pgpass.subarray(-2), Buffer.from([0x5c, 0x6e]));
  assert.equal(fixtureResult.pgpass.includes(Buffer.from("\\:", "utf8")), true);
  assert.equal(fixtureResult.pgpass.includes(Buffer.from("\\\\", "utf8")), true);
  if (process.platform !== "win32") assert.equal(fixtureResult.mode, 0o600);
});

test("two-line stdin keeps pgpass and snapshot isolated", () => {
  const fixtureResult = runPgpassProtocolFixture("pgpass-protocol");
  assert.equal(fixtureResult.snapshotBytes.toString("utf8"), fixtureResult.snapshot);
  assert.equal(fixtureResult.pgpass.includes(Buffer.from(fixtureResult.snapshot, "utf8")), false);
  assert.equal(fixtureResult.snapshotBytes.includes(Buffer.from(fixtureResult.record, "utf8")), false);
});

testFileCode("missing dump file", fixturePath("missing.dump"), "dump_file_missing");

test("empty dump file uses dump_file_empty", () => {
  const filePath = fixturePath("empty.dump");
  writeFileSync(filePath, Buffer.alloc(0), { mode: 0o600 });
  assertSafeFileCode(() => validateCustomDumpFile(filePath), "dump_file_empty");
});

test("invalid custom-format header uses dump_format_invalid", () => {
  const filePath = fixturePath("invalid.dump");
  writeFileSync(filePath, Buffer.from("NOTPGDMP", "ascii"), { mode: 0o600 });
  assertSafeFileCode(() => validateCustomDumpFile(filePath), "dump_format_invalid");
});

test("synthetic EACCES read uses dump_file_unreadable", () => {
  const filePath = fixturePath("unreadable.dump");
  writeFileSync(filePath, Buffer.from("PGDMPfixture", "ascii"), { mode: 0o600 });
  const accessError = Object.assign(new Error("fixture access denied"), { code: "EACCES" });
  assertSafeFileCode(() => validateCustomDumpFile(filePath, {
    open: () => { throw accessError; },
  }), "dump_file_unreadable");
});

test("rename and checksum failures have dedicated safe codes", () => {
  assert.equal(classifyDumpFileDiagnostic({ operation: "rename", errorCode: "EPERM" }), "dump_atomic_rename_failed");
  assert.equal(classifyDumpFileDiagnostic({ operation: "checksum", errorCode: "EACCES" }), "dump_checksum_failed");
});

test("filesystem failure report keeps the exact safe schema", () => {
  const filePath = fixturePath("invalid-report.dump");
  writeFileSync(filePath, Buffer.from("invalid custom dump", "ascii"), { mode: 0o600 });
  let caught;
  try {
    validateCustomDumpFile(filePath);
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof SafeExternalCommandError);
  const report = buildSafeFailureReport(caught.stage, {
    details: caught.toJSON(),
    sourceReadOnly: true,
    targetEphemeral: false,
    containerRemoved: true,
  });
  assert.deepEqual(Object.keys(report).sort(), failureReportFields);
  assert.equal(report.toolCategory, "filesystem");
  assert.equal(report.exitCode, 1);
  assert.equal(report.timeout, false);
  assert.equal(report.diagnosticCode, "dump_format_invalid");
  assert.doesNotMatch(JSON.stringify(report), /fixture|\.dump|EACCES|EPERM|stack|path/i);
});

await testAsync("binary stdout streams into a host-owned atomic dump", async () => {
  const filePath = fixturePath("stream-success.dump");
  const binary = Buffer.from([80, 71, 68, 77, 80, 0, 255, 10, 13, 1, 2, 3]);
  const command = `process.stdout.write(Buffer.from([${[...binary].join(",")}]))`;
  const result = await runCommandToAtomicFile(process.execPath, ["-e", command], filePath, {
    toolCategory: "pg_dump",
    stage: "custom-format dump process",
    validationStage: "custom-format dump file validation",
  });
  assert.equal(result.size, binary.length);
  assert.deepEqual(readFileSync(filePath), binary);
  assert.equal(temporaryDumpFiles(filePath).length, 0);
  if (process.platform !== "win32") assert.equal(statSync(filePath).mode & 0o777, 0o600);
});

await testAsync("non-zero pg_dump preserves safe process diagnostics and removes partial files", async () => {
  const filePath = fixturePath("stream-failure.dump");
  const rawDiagnostic = `server closed the connection unexpectedly ${fixture.databaseUrl} ${fixture.snapshot}`;
  const command = [
    "process.stdout.write(Buffer.from([80,71,68,77,80,0,255]))",
    `process.stderr.write(${JSON.stringify(rawDiagnostic)})`,
    "process.exit(2)",
  ].join(";");
  let caught;
  try {
    await runCommandToAtomicFile(process.execPath, ["-e", command], filePath, {
      toolCategory: "pg_dump",
      stage: "custom-format dump process",
      validationStage: "custom-format dump file validation",
      sensitiveValues,
    });
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof SafeExternalCommandError);
  assert.equal(caught.toolCategory, "pg_dump");
  assert.equal(caught.exitCode, 2);
  assert.equal(caught.timeout, false);
  assert.equal(caught.diagnosticCode, "postgres_connection_failed");
  assert.equal(existsSync(filePath), false);
  assert.equal(temporaryDumpFiles(filePath).length, 0);
  const serialized = JSON.stringify(caught);
  assert.equal(serialized.includes(rawDiagnostic), false);
  assert.equal(serialized.includes(fixture.databaseUrl), false);
  assert.equal(serialized.includes(fixture.snapshot), false);
  assert.doesNotMatch(serialized, /stdout|stderr|args|env|stack|PGDMP/i);
});

console.log(JSON.stringify({
  status: "ok",
  fixtureCases: results.length,
  passed: results.filter((result) => result.passed).length,
  productionCredentialsUsed: false,
  productionDataUsed: false,
  dockerRequired: false,
  workflowDispatched: false,
  rawDiagnosticsPrinted: false,
}, null, 2));

function testCode(name, stderr, expectedCode) {
  testDiagnostic(`${name} classification`, {
    stderr,
    toolCategory: "pg_dump",
    stage: "custom-format dump",
    exitCode: 1,
  }, expectedCode);
}

function testDiagnostic(name, options, expectedCode) {
  test(name, () => {
    const details = classifyExternalDiagnostic({
      sensitiveValues,
      stage: "custom-format dump",
      ...options,
    });
    assert.equal(details.diagnosticCode, expectedCode);
    const serialized = JSON.stringify(details);
    assert.doesNotMatch(serialized, /stderr|stdout|args|env|stack/i);
    for (const forbidden of sensitiveValues) assert.equal(serialized.includes(forbidden), false);
  });
}

function test(name, run) {
  run();
  results.push({ name, passed: true });
}

async function testAsync(name, run) {
  await run();
  results.push({ name, passed: true });
}

function testFileCode(name, filePath, expectedCode) {
  test(name, () => assertSafeFileCode(() => validateCustomDumpFile(filePath), expectedCode));
}

function assertSafeFileCode(run, expectedCode) {
  let caught;
  try {
    run();
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof SafeExternalCommandError);
  assert.equal(caught.toolCategory, "filesystem");
  assert.equal(caught.exitCode, 1);
  assert.equal(caught.timeout, false);
  assert.equal(caught.diagnosticCode, expectedCode);
  assert.doesNotMatch(JSON.stringify(caught), /stdout|stderr|args|env|stack/i);
}

function fixturePath(name) {
  return path.join(fixtureRoot, name);
}

function pgpassSourceLine() {
  const line = source.split(/\r?\n/).find((candidate) => candidate.includes("printf '%s"));
  assert.ok(line, "The pgpass printf source line is missing.");
  return line.trim();
}

function pgpassSourceBackslashCount() {
  const match = pgpassSourceLine().match(/%s(\\+)n'/);
  assert.ok(match, "The pgpass printf format is missing.");
  return match[1].length;
}

function pgpassRuntimeCommand() {
  return JSON.parse(pgpassSourceLine().replace(/,$/, ""));
}

function runPgpassProtocolFixture(name) {
  const directory = fixturePath(name);
  rmSync(directory, { recursive: true, force: true });
  mkdirSync(directory, { recursive: true });
  const pgpassName = "fixture.pgpass";
  const snapshotName = "fixture.snapshot";
  const record = String.raw`fixture-host:5432:fixture-db:fixture-user:fixture\:password\\part`;
  const snapshot = "00000003-000001B5-1";
  const printfCommand = pgpassRuntimeCommand().replace("/run/secrets/.pgpass", `./${pgpassName}`);
  const script = [
    "umask 077",
    "IFS= read -r PGPASS_RECORD",
    printfCommand,
    `chmod 0600 ./${pgpassName}`,
    "IFS= read -r SOURCE_SNAPSHOT",
    `printf '%s' "$SOURCE_SNAPSHOT" > ./${snapshotName}`,
  ].join("\n");
  const result = spawnSync(localPosixShell(), ["-ceu", script], {
    cwd: directory,
    input: `${record}\n${snapshot}\n`,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(result.status, 0, "The isolated pgpass shell fixture failed.");
  return {
    record,
    snapshot,
    pgpass: readFileSync(path.join(directory, pgpassName)),
    snapshotBytes: readFileSync(path.join(directory, snapshotName)),
    mode: statSync(path.join(directory, pgpassName)).mode & 0o777,
  };
}

function localPosixShell() {
  const candidates = process.platform === "win32"
    ? [
        process.env.GIT_INSTALL_ROOT ? path.join(process.env.GIT_INSTALL_ROOT, "bin", "sh.exe") : null,
        "C:\\Program Files\\Git\\bin\\sh.exe",
        "C:\\Program Files\\Git\\usr\\bin\\sh.exe",
      ]
    : ["/bin/sh", "/usr/bin/sh"];
  const shell = candidates.filter(Boolean).find((candidate) => existsSync(candidate));
  assert.ok(shell, "A local POSIX shell is required for the pgpass byte fixture.");
  return shell;
}

function trailingByteCount(buffer, byte) {
  let count = 0;
  for (let index = buffer.length - 1; index >= 0 && buffer[index] === byte; index -= 1) count += 1;
  return count;
}

function temporaryDumpFiles(filePath) {
  const directory = path.dirname(filePath);
  const baseName = path.basename(filePath);
  return readdirSync(directory).filter((name) => name.startsWith(`${baseName}.`) && name.endsWith(".tmp"));
}

function executorEvidenceKeys() {
  const start = source.indexOf("verification = {");
  const end = source.indexOf("\n    };", start);
  assert.ok(start >= 0 && end > start, "Executor evidence object is missing.");
  return source.slice(start, end).split(/\r?\n/).map((line) => {
    const match = line.match(/^\s{6}([A-Za-z][A-Za-z0-9]*)(?::|,)/);
    return match?.[1] ?? null;
  }).filter(Boolean).sort();
}

function successReportSource() {
  const marker = source.indexOf("    ok: true,");
  const start = source.lastIndexOf("  return {", marker);
  const end = source.indexOf("\n  };", marker);
  assert.ok(marker >= 0 && start >= 0 && end > start, "Success report is missing.");
  return source.slice(start, end);
}

function customDumpSource() {
  const start = source.indexOf("async function createCustomDump");
  const end = source.indexOf("async function startRestoreContainer", start);
  assert.ok(start >= 0 && end > start, "Custom dump implementation is missing.");
  return source.slice(start, end);
}

function atomicFileSource() {
  const start = source.indexOf("export async function runCommandToAtomicFile");
  const end = source.indexOf("export function validateCustomDumpFile", start);
  assert.ok(start >= 0 && end > start, "Atomic file stream implementation is missing.");
  return source.slice(start, end);
}
