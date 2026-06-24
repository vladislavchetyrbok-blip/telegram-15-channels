# Aphrodite Soulmate Scanner Foundation (Package 137)

## What this is

Package 137 creates the **local Soulmate Scanner foundation** — the concrete, deterministic local
model behind the Aphrodite "who is meant for me" module. It turns the Soulmate Scanner idea into a
working preview generator, dashboard page, QA, and docs.

There is no real "AI" here. The word describes the product, not the implementation.

## What this package explicitly does NOT do

- It does **not** implement AI generation.
- It does **not** call external AI APIs.
- It does **not** implement payments.
- It does **not** implement real VIP access.
- It does **not** call the Telegram API.
- It does **not** write to any database.
- It does **not** change active Telegram CTA logic.
- It does **not** modify cron, workflows, publish scripts, or bot-sending logic.
- It does **not** perform a production launch.
- It does **not** guarantee meeting a specific person.

Daily and weekly automation remain **unblocked**. Manual Review remains UI / read-only.

## Product promise

> Узнай, какой тип человека тебе подходит, какие отношения тебе нужны и какие сценарии могут мешать встрече.

The module answers, in soft terms: what kind of person is meant for me, what emotional pattern do
I attract, which partner type fits me best, where could I meet this kind of person, what blocks my
relationship path, what should I notice before choosing someone.

## Model

`lib/zodiac/aphrodite-soulmate-scanner-foundation.ts` exports:

- `createAphroditeSoulmateScannerPreview(input)` — deterministic local preview.
- `getAphroditeSoulmateScannerSections()` — section templates.
- `getAphroditeSoulmateScannerBoundaries()` — safety boundaries.
- `getAphroditeSoulmateScannerTrafficHooks()` — social hooks (spec only).

Sections: Partner type, Emotional pattern, Strongest sign energy, Possible meeting context,
Relationship block, What to notice before choosing someone, Future VIP teaser.

Free preview: general partner type, likely emotional pattern, strongest sign energy, one
relationship block, one next step.
Future VIP teaser: where the meeting may happen, age / maturity pattern, signs that may fit best,
blocks preventing relationships, 3-month relationship timeline, personal relationship advice.

## Safety language

Soft, non-deterministic wording only: *may*, *often*, *possible pattern*, *can indicate*,
*zone of attention*, *not a final judgment*. No deterministic soulmate / fate claims, no guarantee
of a specific person, no manipulation advice, no medical / legal / financial claims.

## Next package

**Package 138 — Red Flags Scanner Foundation.**
