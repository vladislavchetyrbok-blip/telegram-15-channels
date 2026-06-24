# Aphrodite Social Content Template Engine (Package 142)

## What this is

Package 142 creates a **local, deterministic social content template engine** for Aphrodite. It
turns the Package 141 social traffic architecture into reusable, original Aphrodite-style **draft**
templates for Instagram, TikTok, Telegram, and future YouTube Shorts.

It produces **drafts only**.

## What this package explicitly does NOT do

- It does **not** implement auto-posting.
- It does **not** call Instagram / TikTok / YouTube / Telegram APIs.
- It does **not** store platform credentials.
- It does **not** scrape competitors.
- It does **not** copy competitor designs or texts (original Aphrodite voice only).
- It does **not** implement payments or any active payment CTA.
- It does **not** implement real VIP access.
- It does **not** modify cron, workflows, publish scripts, or bot-sending logic.
- It does **not** use external AI APIs.
- It does **not** perform a production launch.

Daily and weekly automation remain **unblocked**. Manual Review remains UI / read-only.

## Model

`lib/zodiac/aphrodite-social-content-template-engine.ts` exports:

- `getAphroditeSocialContentTemplates()` — 8 templates (one per content angle).
- `createAphroditeSocialContentDraft(input)` — deterministic local draft generator.
- `getAphroditeSocialContentReviewChecklist()` — human review checklist.
- `getAphroditeSocialContentEngineBoundaries()` — safety boundaries.

Each generated draft includes a title, hook, 3–5 body lines, caption, generic hashtags, a safe
Mini App CTA, the blocked-claims list, a review checklist, and the safety boundaries.

## Templates

If he pulls away…, Your soulmate type by sign…, One red flag your sign ignores…, What the next
30 days may bring…, Message from the Universe today…, Angel number meaning…, Birth matrix hidden
pattern…, Compatibility tension point…

## Safe CTAs and blocked claims

Safe CTAs (no payment): "Open Aphrodite in Telegram", "Get your free Love Reading preview",
"Check your relationship pattern", "Open your personal preview".
Blocked CTAs / claims: Buy VIP now, Unlock full report now, Subscribe now, Pay now, Guaranteed
prediction, "He will return", 100% true, Spell / loyalty magic.

## Hashtags

Generic and safe, e.g. `#aphrodite #zodiac #love #selfreflection #telegramminiapp` plus one
pillar tag. No competitor names.

## Next package

**Package 143 — Social Draft Review Queue.**
