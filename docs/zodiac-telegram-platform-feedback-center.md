# Zodiac Telegram Platform Feedback Center

Package 61, updated Package 62 | 2026-06-20

Route:

```text
/dashboard/networks/zodiac/feedback
```

Purpose: owner-facing center for first-user feedback, bug triage, and real-phone
QA evidence. It does not publish to Telegram, does not write the ledger, does
not enable weekly live, payments/Stars, profile sync, or exact astrology claims.

## What The Page Does

- Shows overview cards for the first 5 users, average rating, P0/P1/P2 counts,
  and readiness for 20 users.
- Provides a local-only feedback intake board.
- Stores only sanitized summaries in `localStorage`.
- Provides a real-phone QA checklist for iPhone, Android, BackButton, layout,
  keyboard, share, save/history, feedback, theme readability, and white-screen
  checks.
- Links feedback decisions to `/dashboard/networks/zodiac/analytics`.
- Links safety and approval decisions to `/dashboard/networks/zodiac/security`.
- Shows a decision matrix for first 5 users, 20 users, and mass launch.

## How To Enter Sanitized Feedback

Use anonymous tester labels only:

```text
Tester 1
Tester 2
Tester 3
```

Do not store:

- real names;
- phone numbers;
- email addresses;
- Telegram handles;
- raw birth date, birth time, or birth city;
- raw question, intention, feedback, or result text;
- raw Telegram `initData`;
- token, Redis, bot, or env values;
- screenshots with personal data.

The form warns about phone/email/token/date-like patterns and redacts them
before saving the local entry. The safest input is a short product summary:

```text
Compatibility result was clear, but the share CTA was missed.
```

## P0 / P1 / P2 Rules

P0:

- Mini App does not open.
- White screen.
- Privacy leak.
- Global share/save failure.
- Critical Telegram WebView overlap blocking a primary action.
- Daily publishing duplicate.

P1:

- Key result page fails.
- Back navigation traps the tester.
- VIP, Mystic, Birth Matrix, or Compatibility primary action breaks.
- Bottom buttons are hidden or hard to tap on common phones.

P2:

- Copy is unclear.
- Visual hierarchy is weak but usable.
- A feature feels less valuable than expected.
- A section is too long but still works.

Backlog:

- Nice-to-have improvements after P0/P1 are clear.

Positive:

- Clear value, useful feature, or share-worthy moment.

## Real Phone QA Checklist

Complete the checklist on real Telegram clients before expanding:

- iPhone Telegram opens Mini App.
- Android Telegram opens Mini App.
- BackButton works.
- Bottom buttons are not overlapped.
- Keyboard does not cover form controls.
- Share works.
- Save/history works.
- Feedback opens.
- Dark/light theme remains readable.
- No white screen.

No screenshots are committed. If screenshots are needed, keep them outside the
repository until they are explicitly sanitized and approved.

## When To Invite 20 Users

Invite up to 20 users only if:

- first 5 users have sanitized feedback summaries;
- P0 = `0`;
- unresolved P1 = `0`;
- average rating is `>= 7`;
- at least some feature usage exists;
- share/save are not blocked;
- real-phone QA is acceptable;
- no raw sensitive data is visible anywhere.

## When To Stop

Stop immediately if:

- any P0 appears;
- repeated P1 appears;
- raw sensitive data appears in analytics, feedback, localStorage, screenshots,
  logs, or docs;
- app opens grow but feature/result usage does not;
- result usage grows but share/save remains absent and feedback confirms value
  confusion;
- Telegram WebView layout blocks primary actions.

## Why LocalStorage Only

There is no authenticated admin feedback write backend yet. Adding an
unauthenticated server-side write API would create privacy and spam risk. Until
admin auth exists, the Feedback Center is intentionally local-only:

- no server write route;
- no database writes;
- no Telegram API calls;
- no ledger writes;
- no raw tester data stored in the repository.

Use the copied sanitized summary for private owner review, then convert only
generic conclusions into docs or task packages.

## Package 62 Safety Handoff

The Admin Safety Center route is:

```text
/dashboard/networks/zodiac/security
```

Use it to keep local approval notes, review the Approval Matrix, and complete
the `Перед 20 пользователями` checklist. The audit log there is browser-local
only and stores sanitized action metadata, not raw feedback.
