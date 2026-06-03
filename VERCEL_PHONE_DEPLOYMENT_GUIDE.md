# Vercel Phone Deployment Guide

This guide prepares the Telegram 15 Channels admin panel for phone access through Vercel.

## A. What Already Works

- GitHub Actions publishes due Telegram posts.
- The local computer can be off while GitHub Actions runs.
- Current live mode is expected to be `TELEGRAM_DRY_RUN=false` and `TELEGRAM_REAL_PUBLISH_ENABLED=true` in GitHub Secrets.
- Current store mode is `json`.
- Prepared posts are stored in `data/runtime/weekly-content-plan.json`.
- Publication logs are stored in `data/runtime/publication_logs.json`.
- `/admin/phone-dashboard` shows phone-friendly monitoring.
- `/admin/publish-monitor` shows queue reserve, today's channel coverage, warnings and GitHub Actions diagnostics.

## B. What Vercel Gives

- A public HTTPS URL for the admin panel.
- Phone access to status, reserve, errors and recent publishing activity.
- A protected `/admin/login` page when admin auth is enabled.
- Read-only monitoring while the system still uses JSON files.

## C. What Vercel Must Not Do Yet

- Do not let Vercel publish Telegram posts while `storeMode=json`.
- Do not treat JSON files on Vercel as a full remote database.
- Do not bypass GitHub Actions for real Telegram publishing.
- Do not add Telegram tokens to code or documentation.

Real publishing stays in the workflow `.github/workflows/publish-scheduler.yml`.

## D. Required Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.example
NEXT_PUBLIC_GITHUB_ACTIONS_URL=https://github.com/OWNER/REPO/actions/workflows/publish-scheduler.yml

ADMIN_AUTH_ENABLED=true
ADMIN_PASSWORD=your-strong-admin-password
ADMIN_SESSION_SECRET=your-long-random-session-secret
ADMIN_SESSION_MAX_AGE_DAYS=14
```

Do not paste real secrets into chat, commits or documentation.

## E. Generate ADMIN_SESSION_SECRET

PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Node:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the generated value into Vercel as `ADMIN_SESSION_SECRET`.

## F. After Deploy

1. Open `/admin/login`.
2. Log in with `ADMIN_PASSWORD`.
3. Open `/admin/phone-dashboard`.
4. Open `/admin/publish-monitor`.
5. Open `/admin/system-status`.
6. Confirm manual admin actions are blocked or dry-run only.
7. Check GitHub Actions separately for real publish runs.

## G. Next Big Stage

For full phone management, move posts and logs out of JSON files:

- Add Supabase/PostgreSQL.
- Store posts, schedule state and publication logs in the remote database.
- Keep duplicate protection based on post status and publication logs.
- Decide whether GitHub Actions remains the publisher or a hosted worker takes over.
- Only then add real write controls from the phone admin panel.
