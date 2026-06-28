# Aphrodite Manual Checklist One-Page Runbook

Package 264 adds a manual checklist one-page runbook.

Can execute soft launch now: No.

## Purpose

- Provide a one-page runbook for owner manual checks.
- Keep this as a manual checklist.
- State stop if any blocker is open.
- Keep owner sign-off required.
- Keep `publicLaunchApproved=false`.
- Keep `ownerManualReviewRequired=true`.

## Runbook

- one-page runbook.
- manual checklist.
- stop if any blocker is open.
- owner sign-off required.
- manual evidence must be recorded by the owner.

## Why Not Launch Now

- DATABASE_URL.
- TELEGRAM_BOT_TOKEN.
- APHRODITE_SESSION_SECRET.
- public app URL.
- Telegram Mini App URL.
- backup freshness.
- restore rehearsal.
- real-device QA.
- Telegram WebView/startapp QA.
- content/CTA owner review.
- owner explicit approval.

## Safety Confirmation

- Production launch done: No.
- Telegram API used: No.
- Messages sent: No.
- DB write added: No.
- DB restore executed: No.
- Secrets added: No.
- Manual checks are not faked.

## Next Package

Package 265 - Final Manual Blocker Board.
