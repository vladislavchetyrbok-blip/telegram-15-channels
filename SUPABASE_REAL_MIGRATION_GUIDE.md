# Supabase Real Migration Guide

This project is ready to prepare Supabase/PostgreSQL, but live publishing must stay on JSON until a separate dry-run migration is reviewed.

## A. Why Supabase Is Needed

- Phone control needs a shared remote queue.
- GitHub Actions and Vercel need to read the same data.
- Publication logs should not depend on local JSON files or workflow cache.
- Scheduler runs, errors and post statuses need one durable source of truth.

## B. Why JSON Store Stays Active For Now

- JSON store already works in production through GitHub Actions.
- Real Telegram publishing is already live.
- Changing the production store too early can create duplicate sends.
- There is already a prepared post reserve in `data/runtime/weekly-content-plan.json`.

Current live path:

```text
GitHub Actions -> npm run publish:due -> JSON store -> Telegram Bot -> Telegram channels
```

## C. Future Migration Order

1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL editor.
3. Add `DATABASE_URL` to GitHub Secrets and Vercel env.
4. Run `npm run migrate:json-to-supabase:dry`.
5. Check channel, post, publication log and scheduler run counts.
6. Run `npm run migrate:json-to-supabase:apply` only after the dry-run is reviewed.
7. Create a separate test workflow with `PUBLISH_DUE_STORE=postgres` and forced dry-run.
8. Check logs and duplicate protection.
9. Only after that, plan a production switch.

Do not change the existing live workflow until the postgres dry-run workflow is proven.

## D. Required Env And Secrets

- `DATABASE_URL`: Supabase/PostgreSQL connection string. Do not expose it in UI or API responses.
- `PGSSLMODE=require`: recommended for Supabase pooled connections when SSL is required.
- `PUBLISH_DUE_STORE=json`: keep this value for the current live publisher.
- `TELEGRAM_REAL_PUBLISH_ENABLED=true`: leave the current working production value unchanged.
- `TELEGRAM_DRY_RUN=false`: leave the current working production value unchanged.
- `TELEGRAM_BOT_TOKEN`: already configured in GitHub Secrets; do not rotate it as part of this migration prep.

Only add `PUBLISH_DUE_STORE=postgres` to a separate dry-run test environment after the JSON to Supabase import has been reviewed.

## E. Avoiding Duplicates

- Do not migrate `published` posts as `ready` or `scheduled`.
- Preserve `telegram_message_id`.
- Preserve `telegram_message_link` when present.
- Preserve successful `publication_logs`.
- Check success logs by `post_id` before publishing.
- Start with dry-run, then apply, then postgres dry-run, then live switch.
- The migration script skips rows whose primary key already exists.
- Re-running `npm run migrate:json-to-supabase:apply` should not rewrite existing rows.

## F. Rollback

- Set `PUBLISH_DUE_STORE=json`.
- Do not change `TELEGRAM_REAL_PUBLISH_ENABLED`.
- Do not delete JSON files.
- Keep `data/runtime/weekly-content-plan.json`, `data/runtime/publication_logs.json` and `data/runtime/publish-scheduler.json`.
- If a postgres test workflow fails, leave the existing GitHub Actions JSON workflow untouched.

## G. Manual Supabase Steps

1. Create the Supabase project.
2. Open the SQL editor.
3. Paste and run `supabase/schema.sql`.
4. Copy the project database connection string into `DATABASE_URL`.
5. Use `PGSSLMODE=require` if the connection requires SSL.
6. Run `npm run db:schema:check` locally.
7. Run `npm run migrate:json-to-supabase:dry` and review counts, skipped duplicates and problems.
8. Run apply only after the dry-run output is reviewed.

## H. GitHub Actions Guardrail

Do not edit `.github/workflows/publish-scheduler.yml` for this preparation unless a separate change explicitly requires it. The current production path remains GitHub Actions with JSON store.

## Commands

```powershell
npm run db:schema:check
npm run migrate:json-to-supabase:dry
npm run migrate:json-to-supabase:apply
```

`migrate:json-to-supabase:dry` is safe by default. Without `DATABASE_URL`, it reads JSON and prints counts without touching any database.
