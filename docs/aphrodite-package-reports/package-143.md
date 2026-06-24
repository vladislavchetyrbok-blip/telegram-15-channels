# Package 143 — Social Draft Review Queue

## Summary

Package 143 creates a **local, read-only social draft review queue**: review data, safety rules, a
manual export checklist, a pure review-decision function, and a dashboard view. It sits between the
content engine and any manual posting. Nothing is posted, exported automatically, or stored.

## Scope and boundaries

This package:

- creates a local social draft review queue only;
- does **not** implement auto-posting;
- does **not** call Instagram / TikTok / YouTube / Telegram APIs;
- does **not** store platform credentials;
- does **not** scrape competitors;
- does **not** copy competitor designs or texts;
- does **not** implement payments;
- does **not** implement real VIP access;
- does **not** write to the database;
- does **not** modify cron / workflow / publish scripts or bot-sending logic;
- does **not** perform a production launch.

Daily / weekly automation remains **unblocked**. Manual Review remains **UI / read-only**.

## Deliverables

- `lib/zodiac/aphrodite-social-draft-review-queue.ts` — types and five exported functions
  (`getAphroditeSocialDraftReviewQueue`, `getAphroditeSocialDraftReviewRules`,
  `getAphroditeSocialDraftReviewBoundaries`, `getAphroditeSocialDraftReviewNextSteps`,
  `reviewAphroditeSocialDraft`). Deterministic, local, pure, no external calls.
- `app/dashboard/networks/zodiac/social-draft-review-queue/page.tsx` — read-only dashboard page
  with review summary, review states, sample queue items, safety rules, manual export checklist,
  safety boundaries, and next packages. Classification:
  **Review queue only / Manual export / No auto-posting**.
- `scripts/qa-aphrodite-social-draft-review-queue.mjs` — local QA (31 checks).
- `scripts/qa-zodiac-dashboard.mjs` — route + assertions.
- Conservative dashboard navigation links from twelve existing pages.
- `docs/aphrodite-social-draft-review-queue.md`.

## Review states and decision function

States: Draft, Needs Review, Approved for Manual Export, Rejected, Blocked by Safety. The pure
`reviewAphroditeSocialDraft` function maps a decision to a new status without mutating the input.

## Verified boundaries

- Real auto-posting implemented: No
- Platform API calls implemented: No
- Scraping implemented: No
- Account credentials stored: No
- Database write implemented: No
- External AI API used: No
- Real payment implemented: No
- Real VIP access implemented: No
- Telegram API used: No
- Active Telegram CTA logic changed: No
- Production launch performed: No

## Next package

**Package 144 — Social Export Dashboard.**
