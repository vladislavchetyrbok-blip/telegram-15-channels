import { loadLocalEnv } from "./lib/load-local-env.mjs";
import { buildPgConfig, describeDatabaseUrl } from "./lib/pg-config.mjs";

loadLocalEnv();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log(JSON.stringify({
      ok: false,
      databaseUrlConfigured: false,
      message: "DATABASE_URL is not configured.",
      hint: "Add DATABASE_URL to .env.local, then run npm run db:connection:check again.",
    }, null, 2));
    process.exitCode = 1;
    return;
  }

  let connectionInfo;
  try {
    connectionInfo = describeDatabaseUrl(databaseUrl);
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      databaseUrlConfigured: true,
      message: "DATABASE_URL could not be parsed as a URL.",
      error: error instanceof Error ? error.message : String(error),
    }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({
    ok: true,
    step: "parsed DATABASE_URL",
    databaseUrlConfigured: true,
    connection: connectionInfo,
  }, null, 2));

  const { Client } = await import("pg");
  const client = new Client(buildPgConfig(databaseUrl));

  try {
    await client.connect();
    const result = await client.query("select current_user, current_database(), now()");
    const row = result.rows[0] ?? {};

    console.log(JSON.stringify({
      ok: true,
      step: "connected",
      result: {
        currentUser: row.current_user,
        currentDatabase: row.current_database,
        now: row.now,
      },
    }, null, 2));
  } catch (error) {
    console.log(JSON.stringify(connectionErrorReport(error), null, 2));
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

function connectionErrorReport(error) {
  const message = error instanceof Error ? error.message : String(error);
  const report = {
    ok: false,
    step: "connect",
    error: message,
    hint: "Check DATABASE_URL in .env.local.",
  };

  if (/password authentication failed/i.test(message)) {
    report.hint = "Проверьте, что в Transaction pooler URI username имеет вид postgres.<project-ref>, а [YOUR-PASSWORD] заменён на database password. Если пароль содержит спецсимволы, его нужно URL-encode или сбросить на пароль только из латиницы и цифр.";
  } else if (/self-signed|certificate/i.test(message)) {
    report.hint = "Для Supabase pooler используйте sslmode=no-verify или pg config ssl: { rejectUnauthorized: false }. Этот скрипт уже включает ssl: { rejectUnauthorized: false } для Supabase/pooler hosts.";
  }

  return report;
}

await main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  }, null, 2));
  process.exitCode = 1;
});
