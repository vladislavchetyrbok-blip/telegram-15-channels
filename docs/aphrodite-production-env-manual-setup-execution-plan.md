# Package 256 - Production Env Manual Setup Execution Plan

Package 256 creates the owner-facing execution plan for manual production env setup before a future soft launch.

This is not production env configuration. It does not add `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `APHRODITE_SESSION_SECRET`, or any real env value. It does not read secrets, print secrets, connect to production DB, use Telegram API, send messages, or approve launch.

## Purpose

The purpose is to document which production env/secrets the owner must configure manually, where they should be configured, how to verify them safely, how to avoid leaking secrets, and what to do if a value leaks.

Current launch posture:

- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`
- Soft Launch Candidate Status: NOT READY

## Required env/secrets

| Name | Required for soft launch | Current status | Safe placeholder example | Owner verification |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Yes | BLOCKED | `DATABASE_URL=<production-database-url-stored-only-in-secret-manager>` | Run production safety check after owner config; missing `DATABASE_URL` blocker should clear. |
| `TELEGRAM_BOT_TOKEN` | Yes | BLOCKED | `TELEGRAM_BOT_TOKEN=<telegram-bot-token-secret-store-only>` | Verify manually without sending Telegram messages. |
| `APHRODITE_SESSION_SECRET` | Yes | MANUAL REQUIRED | `APHRODITE_SESSION_SECRET=<long-random-dashboard-session-secret>` | Verify dashboard auth works without exposing the secret. |
| Public app URL | Yes | MANUAL REQUIRED | `APP_URL=<public-app-url>` | Open public app URL manually and confirm target deployment. |
| Telegram Mini App URL | Yes | MANUAL REQUIRED | `COMPATIBILITY_MINI_APP_URL=<telegram-mini-app-public-url>` | Verify manually in Telegram/BotFather; do not change BotFather automatically. |
| Backup location/freshness config | Yes | BLOCKED | `BACKUP_LOCATION=<owner-managed-backup-location-marker>` | Confirm backup is under 24h and restore rehearsal is recorded. |
| Dry-run/live safety flags | Yes | MANUAL REQUIRED | `TELEGRAM_DRY_RUN=<true-until-owner-launch-approval>` | Confirm live publish flags remain conservative until explicit owner approval. |
| Launch approval flags | Yes | OWNER REVIEW REQUIRED | `publicLaunchApproved=false / ownerManualReviewRequired=true` | Confirm launch remains blocked until owner approval. |

Optional/manual env groups:

- Supabase envs if used: documented only; configure later only if owner approves Supabase-backed mode.
- Analytics envs if used: documented only; no external analytics activation in this package.
- `ZODIAC_DASHBOARD_SESSION_SECRET` legacy name: non-authoritative after Package 225; canonical auth remains `APHRODITE_SESSION_SECRET`.

## Manual setup procedure

1. Owner opens the production hosting secret manager directly.
2. Owner configures required secrets only in the approved secret store.
3. Owner configures public URL markers and verifies target deployment manually.
4. Owner keeps launch gates conservative:
   - `publicLaunchApproved=false`
   - `ownerManualReviewRequired=true`
5. Owner records evidence that env setup happened without exposing values.

Do not create `.env` production files in the repo. Do not commit production values. Do not paste secrets into chat or reports.

## Verification procedure

Run after manual owner setup:

```powershell
git status -sb
npm run typecheck
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:dashboard:qa
```

Then verify manually:

- production safety check if available;
- backup freshness under 24h;
- Telegram bot token presence without sending messages;
- dashboard auth;
- Mini App public URL;
- no production launch happened.

## Secret hygiene

- never commit `.env` production secrets;
- never paste secrets into chat reports;
- never print secrets in logs;
- use masked display only;
- rotate token if leaked;
- do not store real `TELEGRAM_BOT_TOKEN` in docs;
- do not store real `DATABASE_URL` in docs;
- do not expose `APHRODITE_SESSION_SECRET`;
- verify `.env` files remain gitignored;
- verify no hardcoded secrets.

## Leak response protocol

If a secret leaks:

1. Stop work immediately.
2. Rotate the leaked token/secret.
3. Invalidate the old token/session if applicable.
4. Remove the leaked value from repo/chat/logs where possible.
5. Run secret scan/check.
6. Document the incident.
7. Do not continue launch until resolved.

Deletion alone is not enough; leaked values must be treated as compromised.

## What remains blocked

- `DATABASE_URL` manual configuration
- `TELEGRAM_BOT_TOKEN` manual configuration
- backup freshness under 24h
- restore rehearsal
- real-device QA manual execution
- Telegram WebView/startapp QA
- owner approval

## What was not changed

- production launch started: No
- Telegram API used: No
- messages sent: No
- BotFather changed: No
- active CTA logic changed: No
- channel mappings changed: No
- env/secrets configured: No
- production DB connected: No
- payment added: No
- VIP unlock added: No
- entitlement bypass added: No
- DB/storage writes added: No
- cron/workflow changed: No
- owner approval granted: No

## Safety confirmation

- No real secrets were added.
- No `.env` production file was created.
- No secrets were printed.
- No production DB connection was made.
- No Telegram API call was made.
- No Telegram messages were sent.
- No payment or VIP unlock was added.
- No owner approval was granted.

## Next package recommendation

Package 257 - Backup Freshness Restore Rehearsal Execution Plan.
