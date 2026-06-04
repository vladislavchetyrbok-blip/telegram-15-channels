# Supabase Connection Troubleshooting

This project keeps production publishing on the JSON store until a Supabase migration dry-run has been reviewed. Do not commit `.env.local`.

## Correct DATABASE_URL

Use the Transaction pooler URI from Supabase:

1. Open Supabase.
2. Go to Connect.
3. Choose Direct.
4. Open Transaction pooler.
5. Copy the URI.

Direct database connections can fail on local networks that do not support IPv6 well. The Transaction pooler is usually better for local diagnostics and hosted app runtimes because it uses the Supabase pooler endpoint.

The pooler username must look like this:

```text
postgres.<project-ref>
```

It should not be just `postgres`.

Replace `[YOUR-PASSWORD]` with the database password. The database password is not the same as your Supabase account password. If the password contains special characters, URL-encode it or reset it to a password that contains only Latin letters and digits.

Store the value locally:

```text
DATABASE_URL=postgresql://postgres.<project-ref>:<database-password>@...pooler.supabase.com:6543/postgres?sslmode=require
```

## Local Diagnostics

Run:

```bash
npm run db:connection:check
```

The script loads `.env.local`, prints only non-secret connection fields, and runs:

```sql
select current_user, current_database(), now();
```

It never prints the password or the full `DATABASE_URL`.

If `DATABASE_URL` is missing, add it to `.env.local` and run the check again.

If you see `password authentication failed`, verify that the Transaction pooler URI uses `postgres.<project-ref>` and that `[YOUR-PASSWORD]` was replaced with the database password. URL-encode special characters in the password, or reset the database password to Latin letters and digits.

If you see a self-signed certificate error, use `sslmode=no-verify` or a pg client config with:

```js
ssl: { rejectUnauthorized: false }
```

The local diagnostic and migration scripts already use `ssl: { rejectUnauthorized: false }` for Supabase and pooler hosts.

## Migration Dry-Run

After the connection check succeeds, run:

```bash
npm run migrate:json-to-supabase:dry
```

The dry-run loads `.env.local`, reads JSON data, checks database duplicates when `DATABASE_URL` is available, and makes no database writes.

Run apply mode only after the dry-run output has been reviewed and the expected inserts are correct:

```bash
npm run migrate:json-to-supabase:apply
```

## Git Safety

`.env`, `.env.local`, and `.env.*` must stay out of git because they can contain database passwords, bot tokens, and other secrets. `.env.example` can stay tracked because it documents variable names without real secrets.

Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```

Keep `PUBLISH_DUE_STORE=json` until the Supabase migration has been validated and intentionally switched.
