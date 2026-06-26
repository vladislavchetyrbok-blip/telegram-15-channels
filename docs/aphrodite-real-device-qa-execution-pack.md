# Package 223 - Real Device QA Execution Pack

Package 223 adds a safe real-device QA execution pack for Aphrodite/Zodiac before soft launch.

This is not production launch. It is static execution/readiness documentation only.

## Route

`/dashboard/networks/zodiac/real-device-qa-execution-pack`

## Launch gate

- publicLaunchApproved=false.
- ownerManualReviewRequired=true.
- Launch not approved. Real-device QA must be completed manually before soft launch.
- Owner sign-off is still required outside this static package.

## Device checks

- iPhone Safari / mobile browser.
- Android Chrome / mobile browser, if available.
- Telegram iOS WebView.
- Telegram Android WebView, if available.
- Desktop browser sanity check.

Each check records:

- Device / environment.
- Flow.
- Expected result.
- Evidence needed.
- Screenshot required: Yes/No.
- Status: NOT CHECKED / PASS / FAIL / BLOCKED / OWNER REVIEW REQUIRED.
- Blocker severity: blocker / high / medium / low.
- Notes.

## Mini App flow execution checks

- Mini App main screen opens.
- Telegram WebApp ready/expand behavior.
- Back button behavior.
- Haptics behavior, if available.
- startapp/deep link behavior.
- fallback browser mode.
- cache/live version marker.
- compatibility flow.
- Birth Matrix flow.
- Mystic Cards flow.
- VIP locked state.
- CTA visibility.
- no payment shown as active.
- no VIP unlock without entitlement.

## Owner evidence section

- screenshots checklist.
- date/time of manual check.
- device used.
- Telegram app version manual field.
- public URL/manual launch URL checked.
- owner sign-off still required.

## Required before soft launch

- All blocker severity checks are PASS or explicitly resolved.
- All Telegram WebView checks have real-device evidence.
- All screenshots checklist items are attached or manually marked unavailable with reason.
- DATABASE_URL and TELEGRAM_BOT_TOKEN blockers are resolved manually.
- Backup freshness and restore rehearsal blockers are resolved manually.
- Owner manual approval is granted outside this static package.

## Remaining blockers

- DATABASE_URL.
- TELEGRAM_BOT_TOKEN.
- backup freshness <24h.
- restore rehearsal.
- real-device QA manual execution.
- Telegram WebView/startapp manual QA.
- content/CTA owner review.
- owner manual approval.

## Safety confirmation

- Production launch done: No.
- Telegram API used: No.
- Messages sent: No.
- BotFather changed: No.
- Active CTA logic changed: No.
- DB write added: No.
- External analytics added: No.
- Payment added: No.
- VIP unlock added: No.
- Cron/workflows/publish scripts changed: No.
- Secrets added: No.
- Production DB connected: No.

## Next recommended package

Package 224 — Production Env Setup Protocol.
