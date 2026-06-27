# Aphrodite Soft Launch Preflight Checklist

Package 249 defines the manual preflight checklist required before any future limited soft launch. It is readiness only.

It does not launch production, does not send Telegram messages, does not call Telegram API, does not change workflows, does not configure env, and does not grant owner approval.

## Current State

- publicLaunchApproved=false
- ownerManualReviewRequired=true
- Production launch done: No
- Telegram API used: No
- Messages sent: No
- Payment added: No
- VIP unlock added: No

## Code Checks

Required PASS before any future limited soft launch:

- typecheck
- lint
- build
- zodiac:miniapp:smoke
- zodiac:dashboard:qa
- relevant package QA scripts

## Production Env

Manual blockers:

- DATABASE_URL manual blocker
- TELEGRAM_BOT_TOKEN manual blocker
- APHRODITE_SESSION_SECRET manual blocker
- public app URL manual verification
- Telegram Mini App URL manual verification
- no secrets committed

No real env values are stored in this checklist.

## Backup / Restore

Manual blockers:

- backup <24h
- restore rehearsal
- rollback point
- last verified commit

Backup freshness must be proven manually. Restore rehearsal must be completed manually in a safe non-production target.

## Real-Device QA

Manual checks:

- iPhone Safari
- Android Chrome
- Telegram iOS WebView
- Telegram Android WebView
- Desktop sanity

These are not marked complete automatically.

## Telegram WebView / Startapp QA

Manual checks:

- startapp present
- startapp missing fallback
- deep link opens
- browser fallback
- Telegram ready/expand/back/haptics
- cache/live marker

Browser fallback without Telegram params is not a code failure if the fallback works.

## Content / CTA Owner Review

Manual checks:

- home CTA
- compatibility CTA
- Birth Matrix CTA
- Mystic Cards CTA
- VIP preview CTA
- share/result cards
- no active payment

The known LOW issue from the audit remains an owner review item: internal CTA destinations were reorganized into the unified `/compatibility?startapp=...` flow.

## Safety

- publicLaunchApproved=false
- ownerManualReviewRequired=true
- no production launch
- no payment
- no VIP unlock
- no DB writes
- no Telegram messages
- no cron/workflow changes

## Stop Conditions

Stop if any of these appear:

- smoke fail
- dashboard QA fail
- stale backup
- broken Telegram WebView
- CTA confusion
- duplicate post risk
- missing rollback plan
- owner approval missing

## Next Package

Package 250 - Owner Manual Review Pack.
