# Aphrodite Product Remediation Plan (Package 134)

## What this is

A **static, read-only product remediation plan**. It documents how Aphrodite should be
reframed from a generic horoscope / Mini App utility into an **emotional astrology /
relationship product**.

This package is **planning only**. It does not change runtime behaviour.

## What this package explicitly does NOT do

- It does **not** implement AI generation. The "AI" modules are product descriptions, not implementations.
- It does **not** implement payments.
- It does **not** implement real VIP access or grant entitlements.
- It does **not** call the Telegram API.
- It does **not** write to any database.
- It does **not** change active Telegram CTA logic.
- It does **not** modify cron, workflows, publish scripts, or bot-sending logic.
- It does **not** start Instagram / TikTok automation.
- It does **not** start live Telegram Stars.
- It does **not** perform a production launch.

Daily and weekly automation remain **unblocked** and untouched. Manual Review remains UI / read-only.

## Product direction

Aphrodite should be organised around emotional user questions, not feature names:

- Does he love me?
- Are we compatible?
- What does he feel?
- Why does he pull away?
- Why do I repeat the same relationship pattern?
- What will happen in the next 30 days?
- When will I meet the right person?
- What blocks my love / money / future?

Compatibility percentage, birth matrix, mystic cards, and generic horoscope are **tools, not
the main emotional value**. They become the engine, not the headline.

## Main product modules (documented only)

1. AI Love Reading (hero scenario)
2. Soulmate Scanner
3. Red Flags Scanner
4. Daily Message From Universe
5. AI Future Timeline
6. VIP Love Report (future, no real unlock)
7. Free teaser result
8. Staged / ritual loading
9. Trust blocks before payment
10. Instagram / TikTok future traffic layer

## Remediation priorities

**P0 — first experience & conversion:** reframe first screen to emotional outcome-copy; lead
with AI Love Reading; show a free teaser before the long form; staged ritual loading; more
personal first result; clarify Free vs VIP; trust / support / privacy / refund cues before payment.

**P1 — emotional product foundations:** AI Love Reading, Soulmate Scanner, Red Flags Scanner,
Daily Message From Universe, AI Future Timeline.

**P2 — social traffic layer (spec only):** Instagram Stories / Reels, TikTok viral content,
viral zodiac copy templates, social export dashboard, manual review queue.

## Safety language

Any emotional / relationship claim must use **non-deterministic** language:
*may*, *tends to*, *possible pattern*, *zone of attention*, *not a final judgment*.
This applies especially to the Red Flags Scanner.

## Where this lives

- Static model: `lib/zodiac/aphrodite-product-remediation-plan.ts`
- Dashboard page: `/dashboard/networks/zodiac/aphrodite-product-remediation`
- Dashboard QA: `scripts/qa-zodiac-dashboard.mjs` (route + assertions)

## Next package

**Package 135 — First Result Experience Rewrite** (copy + layout only; still no payments,
no real VIP, no Telegram API, no database writes).
