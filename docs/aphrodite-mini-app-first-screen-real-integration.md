# Aphrodite Mini App First Screen Real Integration (Package 148)

## What this is

Package 148 reframes the **actual user-facing Mini App entry screen** (`app/miniapp/page.tsx`,
the `/miniapp` hub) to lead with the emotional product instead of a generic module menu.

## What changed

The first screen now opens with an **AI Love Reading** hero:

- Title: **AI Love Reading**
- Promise: *Узнай, что между вами происходит, что он может чувствовать и где ваша главная зона риска.*
- Safe CTA: **Get free Love Reading preview** → existing `/compatibility` free flow (no payment).
- Safety microcopy: *Free preview only / No payment / No real VIP unlock*.
- An **example free preview** (main energy, one strength, one risk zone, one next step), generated
  deterministically from the existing local model
  `createAphroditeLoveReadingFoundationPreview` (Package 136) — no AI call.
- A locked, explanatory **future / VIP teaser** (what he/she feels, why he/she pulls away,
  30-day forecast, red flags, personal advice) shown as copy only — not unlocked, no payment.
- On-screen safety boundaries: No payment, No real VIP unlock, No Telegram API call,
  No database write, No production launch.

The previous modules — **Compatibility, Birth Matrix, Mystic Numbers, Affirmations, VIP Preview,
Lunar Calendar, Relationship Map** — are preserved and reframed as **secondary modules** ("More
modules") below the hero, plus the existing Quick Launch links. Nothing was removed.

## What this package does NOT do

- It does **not** implement payments or any active payment CTA.
- It does **not** implement real VIP access / unlock.
- It does **not** call AI APIs.
- It does **not** call the Telegram API or change active Telegram post CTA generation.
- It does **not** write to any database.
- It does **not** modify cron, workflows, or publish scripts.
- It does **not** perform a production launch.
- It does **not** break the Telegram WebApp integration (the page structure is unchanged below the
  hero; all existing routes and links remain).

Daily / weekly automation remains **unblocked**. Manual Review remains UI / read-only.

## Next package

**Package 149 — Love Reading Preview Real UI.**
