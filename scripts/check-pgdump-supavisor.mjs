import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BASE_SUPAVISOR_LIBPQ_ENV,
  PGDUMP_LIBPQ_ENV,
  SafeExternalCommandError,
  buildSafeFailureReport,
  classifyExternalDiagnostic,
  redactExternalDiagnostic,
} from "./lib/backup-restore-rehearsal.mjs";

const source = readFileSync("scripts/lib/backup-restore-rehearsal.mjs", "utf8");
const workflow = readFileSync(".github/workflows/production-safety-check.yml", "utf8");
const results = [];
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
  assert.match(dump, /--tmpfs[\s\S]*\/run\/secrets:rw,noexec,nosuid,nodev,mode=0700/);
  assert.match(dump, /cat > \/run\/secrets\/\.pgpass/);
  assert.match(dump, /chmod 0600 \/run\/secrets\/\.pgpass/);
  assert.match(dump, /finally[\s\S]*removeContainer\(dumpContainer\)/);
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
