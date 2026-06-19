# Zodiac Bug Triage

Date: 2026-06-19

This document defines how to classify soft-launch feedback and bugs for the Zodiac Telegram Mini App. It is intentionally conservative: protect privacy, protect daily publishing, and avoid accidental live changes.

## Severity Levels

### P0

Stop expansion and fix immediately.

Examples:

- Mini App does not open.
- White screen or runtime crash.
- Result does not generate for a core feature.
- Save or Share is globally broken.
- Privacy leak: name, birth date, birth time, city query, raw input, raw result text, raw generated messages, Telegram init data, or secrets are stored, sent, logged, or committed.
- Telegram UI, safe area, keyboard, or bottom navigation covers core buttons.
- Daily publish is broken.
- Any test accidentally triggers live publish, payments, Telegram Stars, weekly live, or manual ledger edits.

### P1

Fix before inviting more users.

Examples:

- One important feature is broken.
- Layout is unreadable on a common phone size.
- Keyboard breaks input.
- Telegram BackButton breaks the flow.
- Dead CTA.
- History/favorites reopen is broken.
- Share works only silently or gives confusing feedback.
- A feature opens but looks empty or placeholder-like.

### P2

Backlog unless repeated by at least 3 testers.

Examples:

- Text is too long.
- Visual could be more premium.
- Minor spacing or typography issue.
- User wants more depth.
- Monetization idea.
- Feature request.
- Copywriting preference.

## Bug Report Template

Use this template for every bug. Do not include personal data.

```text
Bug ID:
Date:
Tester label:
Tester device:
Telegram version:
Screen/feature:
Steps to reproduce:
Expected:
Actual:
Screenshot/video:
Screenshot sanitized: YES/NO/N/A
Severity: P0/P1/P2
Privacy risk: YES/NO
Live/scheduler/ledger risk: YES/NO
Status: new/confirmed/fixed/wontfix/backlog
Owner:
Commit/fix:
```

## In-App Feedback Drafts

Users can open `Мой профиль` and use `Оставить отзыв` / `Сообщить о баге`. Treat that output as a helper draft, not as raw evidence to store blindly.

When triaging in-app drafts:

- keep the selected feature, feedback type, rating bucket, device class, and sanitized reproduction steps;
- do not store raw comment text if it contains names, dates of birth, birth time, city, phone, private relationship details, or raw result text;
- if a screenshot is attached manually, sanitize it before filing;
- analytics for this flow must stay limited to `feedback_opened`, `feedback_draft_copied`, `feedback_share_started` with no raw comment payload.

## Decision Rules

- P0: stop expansion, fix immediately, then rerun smoke and targeted phone verification.
- P1: fix before inviting more users.
- P2: backlog unless repeated by 3+ testers or clearly blocks trust.
- No weekly live until P0/P1 is `0`.
- No payments/Stars until real phone pass and feedback are stable.
- No mass launch until at least 10 testers have tried the app and P0/P1 is `0`.
- No daily manual live unless a separate date-specific dry-run and ledger audit proves it is safe and explicit approval is given.
- No manual ledger edits.

## Confirmation Rules

A bug is confirmed when one of these is true:

- reproduced locally in browser/mobile viewport;
- reproduced in Telegram WebView;
- reported by 2+ testers with matching symptoms;
- visible in smoke output, console errors, runtime errors, or failed network requests.

A bug is not confirmed if:

- it depends on a screenshot with personal data that cannot be safely inspected;
- steps are missing and it cannot be reproduced;
- it is a feature request rather than broken behavior.

## Feedback Summary Template

Use this after each batch.

```text
Soft Launch Batch:
Users:
iPhone:
Android:
P0:
P1:
P2:
Top liked feature:
Most confusing feature:
Most shared feature:
Average rating:
Decision:
- continue testing
- fix P0/P1
- expand audience
- pause
```

## Status Values

Use one of:

- `new`
- `confirmed`
- `fixed`
- `wontfix`
- `backlog`

Do not mark `fixed` until a targeted check passes. For Mini App issues, also run:

```bash
npm run zodiac:miniapp:smoke
```

For analytics/privacy issues, also run:

```bash
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
```

## Privacy Checklist

Before committing any bug documentation:

- no real tester names;
- no phone numbers;
- no birth dates;
- no birth times;
- no city queries;
- no private messages;
- no raw result text from a personal calculation;
- no screenshots with personal data;
- no tokens, env values, or Telegram init data.

## Launch Decision Matrix

```text
P0 > 0:
  pause soft launch, fix immediately

P0 = 0 and P1 > 0:
  continue internal testing only, fix before inviting more people

P0 = 0 and P1 = 0 and tested users < 10:
  keep testing controlled group

P0 = 0 and P1 = 0 and tested users >= 10:
  can expand carefully if real phone pass is complete

Redis analytics noop:
  can continue controlled testing, but metrics will be manual/qualitative

Weekly live:
  remains OFF until separate explicit approval

Payments/Stars:
  remain OFF until separate monetization package
```
