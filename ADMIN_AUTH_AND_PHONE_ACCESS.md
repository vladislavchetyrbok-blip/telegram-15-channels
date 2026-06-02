# Admin Auth And Phone Access

## Why Admin Protection Is Needed

The admin panel exposes scheduler status, publication logs, dry-run controls, and future queue controls. Before hosting it on Vercel or opening it from a phone, `/admin` must not be publicly accessible without a password.

## Current Mode

Local default:

```text
ADMIN_AUTH_ENABLED=false
```

When auth is disabled, local admin pages remain accessible without login. This keeps the current local workflow simple.

Hosted/Vercel mode:

```text
ADMIN_AUTH_ENABLED=true
ADMIN_PASSWORD=<strong password>
ADMIN_SESSION_SECRET=<long random secret>
ADMIN_SESSION_MAX_AGE_DAYS=14
```

Do not commit real values. Add them only in local `.env.local` or Vercel Environment Variables.

## How It Works

- `/admin/login` accepts the admin password.
- `POST /api/admin/auth/login` verifies the password.
- On success, the server sets an httpOnly signed session cookie.
- `POST /api/admin/auth/logout` clears the session cookie.
- `GET /api/admin/auth/status` returns only:

```json
{
  "authEnabled": true,
  "authenticated": true
}
```

No password, token, cookie secret, Telegram token, or database URL is returned.

## How To Open From A Phone

After Vercel deployment:

1. Open the hosted `/admin` URL.
2. If auth is enabled, enter the password on `/admin/login`.
3. Use `/admin/mobile-control` for the phone-friendly control page.
4. Use the “Выйти” button to clear the session.

## Vercel Env Variables

Required for protected admin access:

- `ADMIN_AUTH_ENABLED=true`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_SESSION_MAX_AGE_DAYS=14`

Existing publish secrets remain separate:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_DRY_RUN`
- `TELEGRAM_REAL_PUBLISH_ENABLED`

Future database secrets:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Never paste real secrets into chat, screenshots, client code, logs, or public docs.

## Why Real Publish Buttons Are Not Added Yet

Real publishing is already handled by GitHub Actions. Manual admin buttons stay dry-run until the hosted admin and remote database are ready. This avoids accidental duplicate sends and keeps production publishing controlled through GitHub Secrets.

## How To Temporarily Disable Access

On Vercel:

- set `ADMIN_AUTH_ENABLED=true`
- change `ADMIN_PASSWORD` to a new unknown value, or
- rotate `ADMIN_SESSION_SECRET` to invalidate all current sessions

To disable real publishing, do not use admin auth settings. Set:

```text
TELEGRAM_REAL_PUBLISH_ENABLED=false
```

## If You Forget The Password

1. Open Vercel project settings.
2. Set a new `ADMIN_PASSWORD`.
3. Rotate `ADMIN_SESSION_SECRET`.
4. Redeploy or let Vercel refresh the runtime.
5. Log in again at `/admin/login`.
