# Package 248: Soft Launch Scope Selector

## Summary

Package 248 adds a static owner-facing Soft Launch Scope Selector for Aphrodite/Zodiac. It defines the smallest safe future soft-launch scope and keeps launch approval blocked.

This is not a soft launch and not a production launch.

## Added

- Static model: `lib/zodiac/aphrodite-soft-launch-scope-selector.ts`
- Dashboard page: `/dashboard/networks/zodiac/soft-launch-scope-selector`
- QA script: `scripts/qa-aphrodite-soft-launch-scope-selector.mjs`
- Docs: `docs/aphrodite-soft-launch-scope-selector.md`
- Dashboard navigation link and dashboard QA registration

## Recommended Smallest Scope

- Internal owner review only
- Private link smoke review
- One safe test channel, if owner approves later
- One sign channel, if owner approves later
- General channel only, if owner approves later

The current owner decision state remains APPROVAL NOT GRANTED.

## Excluded Scope

- full 13-channel rollout
- real Telegram Stars payment
- VIP unlock
- paid MVP
- external ads
- influencer traffic
- automated production campaign
- irreversible workflow changes
- BotFather changes without manual checklist

## Candidate Mini App Flows

- Home
- Compatibility
- Birth Matrix
- Mystic Cards
- VIP preview locked-only
- Result/share cards preview-only

## Required Manual Prerequisites

- DATABASE_URL configured manually
- TELEGRAM_BOT_TOKEN configured manually
- backup freshness <24h confirmed
- restore rehearsal completed
- real-device QA completed manually
- Telegram WebView/startapp QA completed manually
- content/CTA owner review completed
- owner explicit approval
- rollback plan understood

## Stop Conditions

- Telegram WebView broken
- content/CTA confusion
- payment or VIP appears active
- runtime errors or high-risk visual issues

## Rollback Conditions

- fresh backup verified
- restore rehearsal completed
- last known good commit recorded
- stop owner identified

## Monitoring Checklist

- Mini App smoke status
- Telegram WebView/startapp behavior
- cache/live marker
- content/CTA owner review
- VIP locked-only state
- no payment, no VIP unlock, no entitlement bypass

## Safety Confirmation

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Active CTA logic changed: No
- Channel mappings changed: No
- DB write added: No
- External analytics added: No
- Payment added: No
- VIP unlock added: No
- Entitlement bypass added: No
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- Production DB connected: No
- Manual checks marked complete: No
- publicLaunchApproved=false
- ownerManualReviewRequired=true

## Next Package

Package 249 - Soft Launch Preflight Checklist.
