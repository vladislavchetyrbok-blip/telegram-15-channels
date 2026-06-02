# Vercel Deployment Readiness

This project is prepared for a future hosted admin panel, but it is not yet ready for full phone-based write control without a remote database.

## A. Already Ready

- GitHub repository is connected.
- GitHub Actions publish scheduler exists and can publish due Telegram posts.
- Admin pages exist: `/admin`, `/admin/publish-scheduler`, `/admin/mobile-control`, `/admin/deploy-readiness`.
- Admin auth shell exists: `/admin/login`, `ADMIN_AUTH_ENABLED`, signed httpOnly session cookie.
- Publication logs exist through JSON runtime files.
- Mobile control page exists with safe dry-run actions.
- Deploy readiness page exists.
- Supabase/PostgreSQL architecture is prepared: SQL schema and storage adapters exist.

## B. Required Before Vercel

- Set `ADMIN_AUTH_ENABLED=true`.
- Set a strong `ADMIN_PASSWORD`.
- Set a long random `ADMIN_SESSION_SECRET`.
- Check that secrets are not committed to the repository.
- Check `.env.example` only contains placeholders.
- Do not add real Telegram tokens, database URLs or service-role keys to code.

Telegram publishing secrets should stay in GitHub Secrets while GitHub Actions remains the production publisher.

## C. Why JSON Store Is Not Final

- Vercel is not suitable as a persistent JSON database.
- Phone-created edits in a hosted admin panel will not reliably persist as the source of truth.
- GitHub Actions currently publishes from repository/runtime JSON state.
- Full phone control needs Supabase/PostgreSQL so hosted admin, scheduler and logs use one remote source of truth.

## D. Target Architecture

`phone -> Vercel admin panel -> Supabase/PostgreSQL -> GitHub Actions/server worker -> Telegram`

Current architecture remains:

`local/admin panel -> JSON files -> git push -> GitHub Actions -> Telegram`

## E. Safe Next Order

1. Prepare the Vercel project.
2. Add `ADMIN_*` env values in Vercel.
3. Verify admin auth before sharing the URL.
4. Connect Supabase/PostgreSQL.
5. Switch `PUBLISH_DUE_STORE=postgres` only after tests.
6. Run dry-run checks first.
7. Only then allow real publishing in the remote flow.

## F. Environment Placeholders

Current/local:

```env
NEXT_PUBLIC_APP_URL=
ADMIN_AUTH_ENABLED=false
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
ADMIN_SESSION_MAX_AGE_DAYS=14
PUBLISH_DUE_STORE=json
NODE_ENV=development
```

Future remote database:

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## G. Safety Notes

- Manual admin actions must stay dry-run only until the remote database path is tested.
- Real Telegram publishing remains controlled by GitHub Actions secrets.
- `TELEGRAM_REAL_PUBLISH_ENABLED=false` pauses real publishing.
- `TELEGRAM_DRY_RUN=true` forces safe mode.
- Never paste real secrets into chat, docs, code or screenshots.
