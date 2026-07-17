import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BASE_SUPAVISOR_LIBPQ_ENV,
  PGDUMP_LIBPQ_ENV,
  SafeExternalCommandError,
  buildSafeFailureReport,
  classifyExternalDiagnostic,
  parsePostgresPreflightOutput,
  redactExternalDiagnostic,
} from "./lib/backup-restore-rehearsal.mjs";

const source = readFileSync("scripts/lib/backup-restore-rehearsal.mjs", "utf8");
const workflow = readFileSync(".github/workflows/production-safety-check.yml", "utf8");
const results = [];
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

test("safe failure report", () => {
  const details = classifyExternalDiagnostic({
    stderr: `invalid response to GSSAPI negotiation from ${fixture.host}`,
    sensitiveValues,
    toolCategory: "pg_dump",
    stage: "custom-format dump",
    exitCode: 1,
  });
  const report = buildSafeFailureReport("custom-format dump", {
    details,
    sourceReadOnly: true,
    targetEphemeral: false,
    containerRemoved: true,
  });
  const serialized = JSON.stringify(report);
  assert.equal(report.status, "error");
  assert.equal(report.failedStage, "custom-format dump");
  assert.equal(report.diagnosticCode, "gssapi_negotiation_failed");
  assert.equal(report.sourceReadOnly, true);
  assert.equal(report.targetProduction, false);
  assert.equal(report.productionWrites, 0);
  assert.equal(report.containerRemoved, true);
  assert.doesNotMatch(serialized, /stderr|stdout|args|env|stack|postgresql:\/\//i);
  for (const forbidden of sensitiveValues) assert.equal(serialized.includes(forbidden), false);
});

test("Docker preflight uses explicit transaction-level read-only SQL", () => {
  const preflight = preflightSource();
  assert.match(source, /postgres:\$\{postgresMajor\}-alpine/);
  assert.match(preflight, /psql --version/);
  assert.match(preflight, /--file=\/run\/secrets\/preflight\.sql/);
  assert.match(preflight, /--set=source_snapshot="\$SOURCE_SNAPSHOT"/);
  assert.match(source, /BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;/);
  assert.match(source, /SET TRANSACTION SNAPSHOT :'source_snapshot';/);
  assert.match(source, /SELECT json_build_object\(/);
  assert.match(source, /ROLLBACK;/);
  assert.match(preflight, /rm -f \/run\/secrets\/\.pgpass \/run\/secrets\/preflight\.sql/);
  assert.doesNotMatch(preflight, /PGOPTIONS|PGDUMP_LIBPQ_ENV/);
  assert.doesNotMatch(preflight, /\b(?:insert|update|delete|truncate|alter|drop|create\s+table|grant|revoke)\b/i);
});

test("valid machine-readable preflight probe passes", () => {
  const probe = parsePostgresPreflightOutput(validPreflightOutput(), 17);
  assert.deepEqual(probe, {
    probe: 1,
    clientMajor: 17,
    serverMajor: 17,
    serverMajorCompatible: true,
    transactionReadOnly: true,
  });
});

test("preflight parser ignores command-tag noise around one JSON probe", () => {
  const output = [
    "docker informational noise",
    "BEGIN",
    "psql (PostgreSQL) 17.5",
    "SET",
    validProbeJson(),
    "ROLLBACK",
    "container informational noise",
  ].join("\n");
  assert.equal(parsePostgresPreflightOutput(output, 17).transactionReadOnly, true);
});

test("preflight parser ignores empty lines", () => {
  const output = `\n\npsql (PostgreSQL) 17.5\n\n${validProbeJson()}\n\n`;
  assert.equal(parsePostgresPreflightOutput(output, 17).serverMajorCompatible, true);
});

testPreflightCode("malformed JSON probe", "psql (PostgreSQL) 17.5\n{not-json}", "preflight_output_invalid");
testPreflightCode("missing JSON probe", "psql (PostgreSQL) 17.5\nBEGIN\nROLLBACK", "preflight_output_invalid");
testPreflightCode(
  "duplicate JSON probes",
  `psql (PostgreSQL) 17.5\n${validProbeJson()}\n${validProbeJson()}`,
  "preflight_output_invalid",
);
testPreflightCode(
  "read-only false probe",
  `psql (PostgreSQL) 17.5\n${validProbeJson({ transactionReadOnly: false })}`,
  "preflight_read_only_not_confirmed",
);
testPreflightCode(
  "wrong server major probe",
  `psql (PostgreSQL) 17.5\n${validProbeJson({ serverVersionNum: 160009 })}`,
  "client_server_version_mismatch",
);

test("semantic preflight errors do not retain raw output", () => {
  const rawOutput = `psql (PostgreSQL) 17.5\n{${fixture.snapshot}:${fixture.databaseUrl}}`;
  let caught;
  try {
    parsePostgresPreflightOutput(rawOutput, 17);
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof SafeExternalCommandError);
  const serialized = JSON.stringify(caught);
  assert.equal(serialized.includes(rawOutput), false);
  assert.equal(serialized.includes(fixture.snapshot), false);
  assert.equal(serialized.includes(fixture.databaseUrl), false);
  assert.doesNotMatch(serialized, /stdout|stderr|args|env|stack/i);
});

test("snapshot lifecycle remains synchronized", () => {
  const orderedTokens = [
    "begin isolation level repeatable read read only",
    "select pg_export_snapshot() as snapshot",
    "await runPostgresClientPreflight({",
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
  assert.match(dump, /PGDUMP_LIBPQ_ENV/);
  assert.match(dump, /--snapshot="\$SOURCE_SNAPSHOT"/);
  assert.equal(PGDUMP_LIBPQ_ENV.PGGSSENCMODE, "disable");
  assert.equal(PGDUMP_LIBPQ_ENV.PGSSLMODE, "require");
  assert.equal(PGDUMP_LIBPQ_ENV.PGCONNECT_TIMEOUT, "30");
  assert.equal(PGDUMP_LIBPQ_ENV.PGOPTIONS, "-c default_transaction_read_only=on");
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

test("complete non-production fixture", () => {
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
  test(`${name} classification`, () => {
    const details = classifyExternalDiagnostic({
      stderr,
      sensitiveValues,
      toolCategory: "pg_dump",
      stage: "custom-format dump",
      exitCode: 1,
    });
    assert.equal(details.diagnosticCode, expectedCode);
    const serialized = JSON.stringify(details);
    assert.doesNotMatch(serialized, /stderr|stdout|args|env|stack/i);
    for (const forbidden of sensitiveValues) assert.equal(serialized.includes(forbidden), false);
  });
}

function testPreflightCode(name, output, expectedCode) {
  test(name, () => {
    let caught;
    try {
      parsePostgresPreflightOutput(output, 17);
    } catch (error) {
      caught = error;
    }
    assert.ok(caught instanceof SafeExternalCommandError);
    assert.equal(caught.diagnosticCode, expectedCode);
    assert.equal(caught.toolCategory, "psql");
    assert.equal(caught.stage, "Docker PostgreSQL preflight");
    const serialized = JSON.stringify(caught);
    assert.equal(serialized.includes(output), false);
    assert.doesNotMatch(serialized, /stdout|stderr|args|env|stack/i);
  });
}

function validPreflightOutput(overrides = {}) {
  return `psql (PostgreSQL) 17.5\n${validProbeJson(overrides)}`;
}

function validProbeJson(overrides = {}) {
  return JSON.stringify({
    probe: 1,
    serverVersionNum: 170005,
    transactionReadOnly: true,
    ...overrides,
  });
}

function test(name, run) {
  run();
  results.push({ name, passed: true });
}

function preflightSource() {
  const start = source.indexOf("async function runPostgresClientPreflight");
  const end = source.indexOf("async function createCustomDump", start);
  assert.ok(start >= 0 && end > start, "Preflight implementation is missing.");
  return source.slice(start, end);
}

function customDumpSource() {
  const start = source.indexOf("async function createCustomDump");
  const end = source.indexOf("async function startRestoreContainer", start);
  assert.ok(start >= 0 && end > start, "Custom dump implementation is missing.");
  return source.slice(start, end);
}
