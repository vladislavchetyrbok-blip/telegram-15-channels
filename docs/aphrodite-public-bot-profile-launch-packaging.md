# Aphrodite Public Bot Profile / Main Mini App Launch Packaging (Package 146)

## What this is

Package 146 creates a **local, read-only launch packaging layer**: recommended copy, manual
checklists, and deep-link concepts a human uses to set up the public bot profile and Main Mini App
by hand.

It is **packaging / planning only**.

## What this package explicitly does NOT do

- It does **not** configure BotFather.
- It does **not** call the Telegram API.
- It does **not** launch production.
- It does **not** implement payments.
- It does **not** implement real VIP access.
- It does **not** write to any database.
- It does **not** modify cron, workflows, publish scripts, or bot-sending logic.
- It does **not** change active Telegram CTA generation.

Daily and weekly automation remain **unblocked**. Manual Review remains UI / read-only.

## Product direction

The public bot profile sells the **emotional product**, not the raw calculation. Weak framing
("compatibility by sign, gender, date and birth time") becomes: "AI Love Reading, compatibility,
red flags, soulmate hints, future timeline, and daily messages inside Telegram."

Primary promise:

> Узнай, что между вами происходит, что он может чувствовать и где ваша главная зона риска.

The Main Mini App entry feels like: "Open Aphrodite", "Get your free Love Reading preview",
"Check your relationship pattern". No payment CTA, no fake urgency, no guaranteed predictions.

## Model

`lib/zodiac/aphrodite-public-bot-profile-launch-packaging.ts` exports:

- `getAphroditePublicLaunchCopy()` — recommended copy (bot name, short description, about, Mini App
  title, short description, first message, start button, support, privacy, terms/refund).
- `getAphroditePublicLaunchChecklist()` — manual setup checklist (BotFather, Mini App button,
  screenshots, video, splash, deep-links, support, legal, owner review, smoke test).
- `getAphroditePublicLaunchDeepLinks()` — safe deep-link concepts (Love Reading, Soulmate Scanner,
  Red Flags, Future Timeline, Daily Message previews).
- `getAphroditePublicLaunchBoundaries()` — safety boundaries.
- `getAphroditePublicLaunchNextSteps()` — next steps.

## Manual owner review

Every launch step is an owner action; a "Manual owner review before launch" item must be approved
by the owner, and the owner configures BotFather and launches manually. Nothing is automated here.

## Next package

**Package 147 — Mini App First Screen Real Integration.**
