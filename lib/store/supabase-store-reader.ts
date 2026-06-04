import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  countsFromIds,
  emptyDuplicateIds,
  emptyStoreCounts,
  emptyStoreIds,
  type DuplicateIds,
  type StoreIds,
  type StoreReaderSnapshot,
  storeKeys,
} from "@/lib/store/json-store-reader";

interface QueryClient {
  connect(): Promise<void>;
  end(): Promise<void>;
  query(sql: string): Promise<{ rows: Array<Record<string, unknown>> }>;
}

interface PgClientConfig {
  connectionString: string;
  ssl?: {
    rejectUnauthorized: boolean;
  };
}

export async function readSupabaseStoreSnapshot(): Promise<StoreReaderSnapshot & { configured: boolean }> {
  await loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return {
      configured: false,
      counts: emptyStoreCounts(),
      ids: emptyStoreIds(),
      duplicates: emptyDuplicateIds(),
      warnings: ["DATABASE_URL is not configured"],
      problems: [],
    };
  }

  let client: QueryClient | null = null;
  try {
    const { Client } = await loadPg();
    client = new Client(buildPgConfig(databaseUrl)) as QueryClient;
    await client.connect();

    const ids = await readIds(client);
    const duplicates = await readDuplicates(client);

    return {
      configured: true,
      counts: countsFromIds(ids),
      ids,
      duplicates,
      warnings: [],
      problems: [],
    };
  } catch (error) {
    return {
      configured: true,
      counts: emptyStoreCounts(),
      ids: emptyStoreIds(),
      duplicates: emptyDuplicateIds(),
      warnings: [],
      problems: [sanitizeError(error, databaseUrl)],
    };
  } finally {
    if (client) {
      await client.end().catch(() => undefined);
    }
  }
}

async function readIds(client: QueryClient): Promise<StoreIds> {
  const ids = emptyStoreIds();
  for (const table of storeKeys) {
    const result = await client.query(`select id::text as id from ${table} order by id asc`);
    ids[table] = result.rows.map((row) => String(row.id));
  }
  return ids;
}

async function readDuplicates(client: QueryClient): Promise<DuplicateIds> {
  const duplicates = emptyDuplicateIds();
  for (const table of storeKeys) {
    const result = await client.query(`select id::text as id, count(*)::int as count from ${table} group by id having count(*) > 1 order by id asc`);
    duplicates[table] = result.rows.map((row) => ({ id: String(row.id), count: Number(row.count) }));
  }
  return duplicates;
}

async function loadLocalEnv() {
  const envLoaderUrl = pathToFileURL(path.join(process.cwd(), "scripts", "lib", "load-local-env.mjs")).href;
  const imported = await Function("specifier", "return import(specifier)")(envLoaderUrl) as {
    loadLocalEnv: (options?: { cwd?: string }) => void;
  };
  imported.loadLocalEnv({ cwd: process.cwd() });
}

async function loadPg(): Promise<{ Client: new (config: PgClientConfig) => unknown }> {
  return Function("specifier", "return import(specifier)")("pg") as Promise<{ Client: new (config: PgClientConfig) => unknown }>;
}

function buildPgConfig(databaseUrl: string): PgClientConfig {
  const sslMode = process.env.PGSSLMODE;
  const likelySupabase = isSupabaseHost(databaseUrl);
  if (sslMode === "disable") return { connectionString: databaseUrl };
  if (sslMode === "require" || sslMode === "no-verify" || likelySupabase) {
    return { connectionString: databaseUrl, ssl: { rejectUnauthorized: false } };
  }
  return { connectionString: databaseUrl };
}

function isSupabaseHost(databaseUrl: string): boolean {
  try {
    return /supabase\.(co|com)|pooler\.supabase/i.test(new URL(databaseUrl).hostname);
  } catch {
    return /supabase\.(co|com)|pooler\.supabase/i.test(databaseUrl);
  }
}

function sanitizeError(error: unknown, databaseUrl: string) {
  let message = error instanceof Error ? error.message : String(error);
  message = message.split(databaseUrl).join("[redacted DATABASE_URL]");
  try {
    const parsed = new URL(databaseUrl);
    if (parsed.password) {
      message = message.split(decodeURIComponent(parsed.password)).join("[redacted password]");
      message = message.split(parsed.password).join("[redacted password]");
    }
  } catch {
    // The full URL replacement above is enough when URL parsing fails.
  }
  return message;
}
