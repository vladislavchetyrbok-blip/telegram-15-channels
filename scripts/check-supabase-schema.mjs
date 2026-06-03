import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
const requiredTerms = [
  "create table if not exists channels",
  "create table if not exists posts",
  "create table if not exists publication_logs",
  "create table if not exists scheduler_runs",
  "id text primary key",
  "title text",
  "slug text unique",
  "telegram_chat_id text",
  "language text",
  "category text",
  "is_active boolean",
  "channel_id text",
  "text text",
  "image_url text",
  "image_path text",
  "status text",
  "publish_at timestamptz",
  "telegram_message_id integer",
  "telegram_message_link text",
  "error_message text",
  "run_id text",
  "source text",
  "dry_run boolean",
  "store_mode text",
  "real_publish_enabled boolean",
  "checked integer",
  "published integer",
  "skipped integer",
  "errors integer",
  "started_at timestamptz",
  "finished_at timestamptz",
  "idx_posts_channel_id",
  "idx_posts_status",
  "idx_posts_publish_at",
  "idx_publication_logs_post_id",
  "idx_publication_logs_channel_id",
  "idx_publication_logs_created_at",
  "idx_scheduler_runs_started_at",
];

if (!existsSync(schemaPath)) {
  console.error(JSON.stringify({ ok: false, message: "supabase/schema.sql is missing" }, null, 2));
  process.exit(1);
}

const schema = readFileSync(schemaPath, "utf8").toLowerCase().replace(/\s+/g, " ");
const missing = requiredTerms.filter((term) => !schema.includes(term));
const result = {
  ok: missing.length === 0,
  schemaPath,
  checked: requiredTerms.length,
  missing,
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
