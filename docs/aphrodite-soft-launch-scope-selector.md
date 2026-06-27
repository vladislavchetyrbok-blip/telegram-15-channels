# Aphrodite Soft Launch Scope Selector

Package 248 defines the smallest safe future soft-launch scope for Aphrodite/Zodiac. It is a static readiness selector for the owner. It does not start a soft launch, does not perform production launch, and does not approve launch.

## Current State

- Current owner decision state: APPROVAL NOT GRANTED
- publicLaunchApproved=false
- ownerManualReviewRequired=true
- Soft launch started: No
- Production launch done: No
- Telegram API used: No
- Messages sent: No

## Recommended Smallest Scope

The conservative first scope is internal owner review only.

Recommended future sequence:

1. Internal owner review only.
2. Private link smoke review.
3. One safe test channel, if owner approves later.
4. One sign channel, if owner approves later.
5. General channel only, if owner approves later.

The first real exposure must remain limited and manual. Optional 1-2 sign channels are only a future state after manual owner approval.

## Candidate Mini App Flows

Allowed for manual validation only:

- Home
- Compatibility
- Birth Matrix
- Mystic Cards
- VIP preview locked-only
- Result/share cards preview-only

These flows are allowed only for owner review and manual evidence capture. They do not enable real payment, VIP unlock, entitlement bypass, or real Telegram share/send behavior.

## Excluded Scope

The following remain excluded from soft launch:

- full 13-channel rollout
- real Telegram Stars payment
- VIP unlock
- paid MVP
- external ads
- influencer traffic
- automated production campaign
- irreversible workflow changes
- BotFather changes without manual checklist

## Manual Prerequisites

Required before any future soft launch decision:

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

Stop or do not start if any of these occur:

- Telegram WebView/startapp behavior fails on real devices.
- Users land on unexpected routes or CTA copy is misleading.
- Payment or VIP unlock appears active.
- Runtime errors, console errors, or high-risk visual issues appear.
- Backup freshness or restore confidence is missing.

## Rollback Conditions

Rollback readiness requires:

- fresh backup verified below 24 hours;
- restore rehearsal completed;
- last known good commit and deployment recorded;
- rollback owner identified;
- stop authority understood.

## Monitoring Checklist

Manual monitoring must include:

- Mini App smoke status;
- Telegram WebView/startapp behavior;
- cache/live marker;
- content/CTA owner review;
- VIP locked-only state;
- no payment, no VIP unlock, no entitlement bypass;
- no Telegram API/send behavior from this readiness layer.

## Owner Decision States

- NOT READY
- READY FOR OWNER REVIEW
- BLOCKED BY ENV
- BLOCKED BY BACKUP
- BLOCKED BY REAL DEVICE QA
- BLOCKED BY TELEGRAM WEBVIEW QA
- BLOCKED BY CONTENT CTA REVIEW
- APPROVAL NOT GRANTED
- READY FOR LIMITED SOFT LAUNCH, as future state only

Current state is APPROVAL NOT GRANTED.

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

## Next Package

Package 249 - Soft Launch Preflight Checklist.
