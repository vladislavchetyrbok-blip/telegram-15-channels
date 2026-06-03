# Phone Dashboard Guide

This guide describes the safe mobile control layer for Telegram 15 Channels.

## What The Phone Dashboard Shows

Open:

`/admin/phone-dashboard`

It shows:

- whether autopublishing is effectively ON;
- GitHub Actions mode;
- `dryRun`;
- `realPublishEnabled`;
- `storeMode`;
- ready and scheduled post counts;
- published, skipped and failed counts for today;
- estimated days of content reserve;
- whether the reserve is enough through June 7;
- Telegram targets linked count;
- bot access count;
- content quality status;
- next expected GitHub Actions check;
- last successful publish and last error from local runtime logs.

## What The Phone Start Page Does

Open:

`/admin/phone-start`

It is a short iPhone-friendly entry page with links to:

- phone dashboard;
- publish scheduler;
- publication logs;
- deploy readiness;
- publish monitor;
- GitHub Actions, if `NEXT_PUBLIC_GITHUB_ACTIONS_URL` is configured.

## What You Can Do From The Phone Now

- Read publishing health.
- Check queue reserve.
- Check today’s channel coverage.
- Check Telegram target/bot access status from saved diagnostics.
- Open GitHub Actions manually.
- Read emergency instructions.

## What You Cannot Do Yet

- Create or edit posts remotely as a durable source of truth.
- Safely mutate JSON runtime state on a hosted server.
- Trigger real Telegram sends from the admin panel.

Real publishing intentionally remains in GitHub Actions.

## Why Publishing Goes Through GitHub Actions

GitHub Actions can run without the local computer being on. It uses repository files and GitHub Secrets to run:

`npm run publish:due`

Expected live settings:

```env
TELEGRAM_DRY_RUN=false
TELEGRAM_REAL_PUBLISH_ENABLED=true
PUBLISH_DUE_STORE=json
PUBLISH_DUE_MAX_PER_RUN=15
```

## Why The Computer Can Be Off

The scheduled workflow runs in GitHub’s infrastructure. The local computer is only needed when editing code, preparing JSON content locally, or pushing new content/config changes.

## How To Check Everything Works

1. Open `/admin/phone-dashboard`.
2. Confirm:
   - `dryRun=false`;
   - `realPublishEnabled=true`;
   - `storeMode=json`;
   - GitHub Actions mode is active;
   - bot access is `15/15`;
   - enough ready/scheduled posts exist.
3. Open GitHub Actions.
4. Check the latest `Publish due Telegram posts` run.
5. Check Telegram channels manually after due publish windows.

## How To Stop Publishing

In GitHub Secrets:

```env
TELEGRAM_REAL_PUBLISH_ENABLED=false
```

Optional safe test mode:

```env
TELEGRAM_DRY_RUN=true
```

To return to live mode:

```env
TELEGRAM_DRY_RUN=false
TELEGRAM_REAL_PUBLISH_ENABLED=true
```

Do not press `Run workflow` many times in a row. Check logs first.

## If Posts Stop Publishing

- `dryRun=true`: check GitHub Secrets and workflow env.
- `realPublishEnabled=false`: set it back to `true`.
- `errors > 0`: open GitHub Actions logs.
- `published=0` and `errors=0`: maybe no due posts exist yet.
- `already_published`: duplicate protection worked.
- bot access not OK: check that the bot is admin in the channel.
- ready posts low: generate a new 7-day plan and push it.

## If Posts Run Out

Generate or approve a fresh 7-day content plan locally, verify content audit, then commit and push. GitHub Actions only sees repository state after push.

## Next Big Stage

For full phone control:

`phone -> Vercel admin -> Supabase/PostgreSQL -> GitHub Actions/server worker -> Telegram`

Supabase/PostgreSQL is needed before phone-created edits can become durable production state.
