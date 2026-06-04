import { randomUUID } from "node:crypto";
import type {
  PostRecord,
  PublicationLogRecord,
  PublishStore,
  SchedulerRunRecord,
  SchedulerRunResult,
} from "./types";

interface QueryClient {
  connect(): Promise<void>;
  end(): Promise<void>;
  query(sql: string, values?: unknown[]): Promise<{ rows: Array<Record<string, unknown>>; rowCount: number }>;
}

interface PgClientConfig {
  connectionString: string;
  ssl?: {
    rejectUnauthorized: boolean;
  };
}

export class PostgresPublishStore implements PublishStore {
  mode = "postgres" as const;

  constructor(private readonly databaseUrl = process.env.DATABASE_URL) {}

  async getDuePosts(now: Date): Promise<PostRecord[]> {
    return this.withClient(async (client) => {
      const result = await client.query(
        `
          select id, channel_id, title, text, image_url, image_path, status, publish_at,
                 telegram_message_id, telegram_message_link, error_message, created_at, updated_at
          from posts
          where status = any($1::text[])
            and publish_at <= $2
          order by publish_at asc
        `,
        [["draft", "scheduled", "approved", "ready_to_publish"], now.toISOString()],
      );
      return result.rows.map(mapPostRow);
    });
  }

  async markPostPublished(postId: string, telegramMessageId: number, telegramMessageLink: string | null = null): Promise<void> {
    await this.withClient(async (client) => {
      await client.query(
        `
          update posts
          set status = 'published',
              telegram_message_id = $2,
              telegram_message_link = $3,
              error_message = null,
              updated_at = now()
          where id = $1
            and status <> 'published'
        `,
        [postId, telegramMessageId, telegramMessageLink],
      );
    });
  }

  async markPostFailed(postId: string, error: string): Promise<void> {
    await this.withClient(async (client) => {
      await client.query(
        `
          update posts
          set status = 'failed',
              error_message = $2,
              updated_at = now()
          where id = $1
            and status <> 'published'
        `,
        [postId, error],
      );
    });
  }

  async appendPublicationLog(log: PublicationLogRecord): Promise<PublicationLogRecord> {
    return this.withClient(async (client) => {
      const nextLog = {
        ...log,
        id: log.id ?? randomUUID(),
        createdAt: log.createdAt ?? new Date().toISOString(),
      };
      await client.query(
        `
          insert into publication_logs(id, run_id, source, channel_id, post_id, status, message,
                                       telegram_message_id, telegram_message_link, dry_run, created_at)
          values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          nextLog.id,
          nextLog.runId,
          nextLog.source,
          nextLog.channelId,
          nextLog.postId,
          nextLog.status,
          nextLog.message,
          nextLog.telegramMessageId,
          nextLog.telegramMessageLink,
          nextLog.dryRun,
          nextLog.createdAt,
        ],
      );
      return nextLog;
    });
  }

  async getPublicationLogs(limit: number): Promise<PublicationLogRecord[]> {
    return this.withClient(async (client) => {
      const result = await client.query(
        `
          select id, run_id, source, channel_id, post_id, status, message,
                 telegram_message_id, telegram_message_link, dry_run, created_at
          from publication_logs
          order by created_at desc
          limit $1
        `,
        [Math.max(1, limit)],
      );
      return result.rows.map(mapLogRow).reverse();
    });
  }

  async getSchedulerStatus(): Promise<SchedulerRunRecord | null> {
    return this.withClient(async (client) => {
      const result = await client.query(
        `
          select id, source, store_mode, dry_run, real_publish_enabled, checked, published,
                 skipped, errors, message, started_at, finished_at
          from scheduler_runs
          order by started_at desc
          limit 1
        `,
      );
      return result.rows[0] ? mapSchedulerRunRow(result.rows[0]) : null;
    });
  }

  async createSchedulerRun(data: SchedulerRunRecord): Promise<SchedulerRunRecord> {
    await this.withClient(async (client) => {
      await client.query(
        `
          insert into scheduler_runs(id, source, store_mode, dry_run, real_publish_enabled,
                                     checked, published, skipped, errors, message, started_at, finished_at)
          values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `,
        [
          data.id,
          data.source,
          data.storeMode,
          data.dryRun,
          data.realPublishEnabled,
          data.checked,
          data.published,
          data.skipped,
          data.errors,
          data.message,
          data.startedAt,
          data.finishedAt,
        ],
      );
    });
    return data;
  }

  async finishSchedulerRun(runId: string, result: SchedulerRunResult): Promise<void> {
    await this.withClient(async (client) => {
      await client.query(
        `
          update scheduler_runs
          set checked = $2,
              published = $3,
              skipped = $4,
              errors = $5,
              message = $6,
              finished_at = now()
          where id = $1
        `,
        [runId, result.checked, result.published, result.skipped, result.errors, result.message],
      );
    });
  }

  private async withClient<T>(callback: (client: QueryClient) => Promise<T>): Promise<T> {
    if (!this.databaseUrl) {
      throw new Error("DATABASE_URL is required when PUBLISH_DUE_STORE=postgres.");
    }

    const { Client } = await loadPg();
    const client = new Client(buildPgConfig(this.databaseUrl)) as QueryClient;
    await client.connect();
    try {
      return await callback(client);
    } finally {
      await client.end();
    }
  }
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

function mapPostRow(row: Record<string, unknown>): PostRecord {
  return {
    id: String(row.id),
    postId: String(row.id),
    channelId: String(row.channel_id),
    title: nullableString(row.title),
    text: nullableString(row.text),
    imageUrl: nullableString(row.image_url),
    imagePath: nullableString(row.image_path),
    status: String(row.status ?? "draft"),
    publishAt: row.publish_at instanceof Date ? row.publish_at.toISOString() : nullableString(row.publish_at),
    telegramMessageId: typeof row.telegram_message_id === "number" ? row.telegram_message_id : null,
    telegramMessageLink: nullableString(row.telegram_message_link),
    errorMessage: nullableString(row.error_message),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : nullableString(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : nullableString(row.updated_at),
    raw: row,
  };
}

function mapLogRow(row: Record<string, unknown>): PublicationLogRecord {
  return {
    id: String(row.id),
    runId: nullableString(row.run_id),
    source: nullableString(row.source),
    channelId: nullableString(row.channel_id),
    postId: nullableString(row.post_id),
    status: row.status === "success" || row.status === "failed" || row.status === "skipped" ? row.status : "failed",
    message: nullableString(row.message),
    telegramMessageId: typeof row.telegram_message_id === "number" ? row.telegram_message_id : null,
    telegramMessageLink: nullableString(row.telegram_message_link),
    dryRun: typeof row.dry_run === "boolean" ? row.dry_run : null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : nullableString(row.created_at) ?? new Date(0).toISOString(),
  };
}

function mapSchedulerRunRow(row: Record<string, unknown>): SchedulerRunRecord {
  return {
    id: String(row.id),
    source: nullableString(row.source),
    storeMode: String(row.store_mode ?? "postgres"),
    dryRun: Boolean(row.dry_run),
    realPublishEnabled: Boolean(row.real_publish_enabled),
    checked: Number(row.checked ?? 0),
    published: Number(row.published ?? 0),
    skipped: Number(row.skipped ?? 0),
    errors: Number(row.errors ?? 0),
    message: nullableString(row.message),
    startedAt: row.started_at instanceof Date ? row.started_at.toISOString() : nullableString(row.started_at) ?? new Date(0).toISOString(),
    finishedAt: row.finished_at instanceof Date ? row.finished_at.toISOString() : nullableString(row.finished_at),
  };
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
