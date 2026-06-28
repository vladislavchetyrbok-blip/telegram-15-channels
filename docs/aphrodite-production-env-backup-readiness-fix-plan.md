# Aphrodite Production Env Backup Readiness Fix Plan

Package 278 documents how to clear the remaining production blockers safely and manually.

This package does not clear the blockers automatically. It does not commit secrets, launch production, call Telegram, connect to production DB, create backups, restore data, enable payment, unlock VIP, or flip launch flags.

## Production Status

- productionReadinessStatus: `BLOCKED_MANUAL_SETUP_REQUIRED`
- `DATABASE_URL`: missing
- `TELEGRAM_BOT_TOKEN`: missing
- backup freshness: older than 24h
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Where Secrets Must Be Configured

- Deployment provider / hosting environment panel.
- Local `.env.local` only if needed for manual local verification.
- `.env.local` must never be committed.
- .env.local must never be committed.
- Real secret values must never be pasted into code, docs, chat, screenshots, or logs.

## Manual Owner Steps

1. Configure `DATABASE_URL` manually in the deployment provider or hosting env panel.
2. Configure `TELEGRAM_BOT_TOKEN` manually in the deployment provider or hosting env panel.
3. Confirm `.env.local` is not tracked, staged, or committed.
4. Create or confirm a backup newer than 24 hours.
5. Record backup timestamp, scope, retention, owner, and evidence location.
6. Run restore rehearsal against a safe non-production target.
7. Validate restored data with masked or aggregate checks only.
8. Record rollback point, latest verified commit, deployment URL, backup timestamp, and rollback owner.

## Backup Checklist

- Latest backup timestamp is under 24 hours.
- Backup covers the intended production data store.
- Retention policy is known.
- Backup owner is named.
- Evidence exists without exposing credentials.

## Restore Rehearsal Checklist

- Restore target is non-production.
- Restore completes without touching production data.
- Restored data is validated safely.
- Rehearsal duration and reviewer are recorded.
- Rollback point is documented.

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- `.env.local` committed: No
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Next Step

Package 279 - Manual Env Setup Execution Checklist.
