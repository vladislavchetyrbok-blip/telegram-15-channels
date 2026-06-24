# Aphrodite Social Draft Review Queue (Package 143)

## What this is

Package 143 creates a **local, read-only social draft review queue**. It sits between the Package
142 content engine and any manual posting, giving a human reviewer clear states, safety rules, and
a manual export checklist before a draft can be exported or posted.

It is **review data + a dashboard view + a pure decision function** only.

## What this package explicitly does NOT do

- It does **not** implement auto-posting.
- It does **not** call Instagram / TikTok / YouTube / Telegram APIs.
- It does **not** store platform credentials.
- It does **not** scrape competitors.
- It does **not** copy competitor designs or texts.
- It does **not** implement payments.
- It does **not** implement real VIP access.
- It does **not** write to any database.
- It does **not** modify cron, workflows, publish scripts, or bot-sending logic.
- It does **not** perform a production launch.

Daily and weekly automation remain **unblocked**. Manual Review remains UI / read-only.

## Review states

Draft, Needs Review, Approved for Manual Export, Rejected, Blocked by Safety.

## Model

`lib/zodiac/aphrodite-social-draft-review-queue.ts` exports:

- `getAphroditeSocialDraftReviewQueue()` — 8 sample review items (one per pillar).
- `getAphroditeSocialDraftReviewRules()` — safety rules with blocked phrases and safe replacements.
- `getAphroditeSocialDraftReviewBoundaries()` — safety boundaries.
- `getAphroditeSocialDraftReviewNextSteps()` — next steps.
- `reviewAphroditeSocialDraft(item, decision, note?)` — pure, deterministic decision function that
  returns a NEW item with an updated status and appended reviewer note (no mutation, no I/O).

Each queue item includes platform, pillar, title, hook, caption, safe CTA, review status, reviewer
notes, safety flags, and a manual export checklist.

## Manual export checklist

Human reviewer approved copy; No platform API call; No auto-posting; No payment CTA; No copied
competitor content; No deterministic claim; No unsafe advice; Manual export only.

## Next package

**Package 144 — Social Export Dashboard.**
