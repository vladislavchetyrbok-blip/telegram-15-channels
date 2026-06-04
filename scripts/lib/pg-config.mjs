export function buildPgConfig(databaseUrl, options = {}) {
  const sslMode = options.sslMode ?? process.env.PGSSLMODE;
  const likelySupabase = isSupabaseHost(databaseUrl);

  if (sslMode === "disable") {
    return { connectionString: databaseUrl };
  }

  if (sslMode === "require" || sslMode === "no-verify" || likelySupabase) {
    return { connectionString: databaseUrl, ssl: { rejectUnauthorized: false } };
  }

  return { connectionString: databaseUrl };
}

export function describeDatabaseUrl(databaseUrl) {
  const parsed = new URL(databaseUrl);
  const username = decodeURIComponent(parsed.username);
  const hostname = parsed.hostname;

  return {
    protocol: parsed.protocol,
    username,
    hostname,
    port: parsed.port || null,
    databaseName: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    sslmode: parsed.searchParams.get("sslmode") ?? process.env.PGSSLMODE ?? null,
    isSupabasePooler: isSupabasePoolerHost(hostname),
    isPoolerUserFormat: username.startsWith("postgres."),
  };
}

export function isSupabaseHost(databaseUrl) {
  try {
    return /supabase\.(co|com)|pooler\.supabase/i.test(new URL(databaseUrl).hostname);
  } catch {
    return /supabase\.(co|com)|pooler\.supabase/i.test(databaseUrl);
  }
}

function isSupabasePoolerHost(hostname) {
  return /pooler\.supabase/i.test(hostname);
}
