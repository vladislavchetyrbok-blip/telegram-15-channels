# Aphrodite Red Flags Scanner Foundation (Package 138)

## What this is

Package 138 creates the **local Red Flags Scanner foundation** — a concrete, deterministic local
model that gently surfaces "zones of attention" in a relationship. It is care-first and uses soft,
non-deterministic wording only.

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
- It does **not** diagnose people or make abuse accusations.
- It does **not** provide emergency, safety-critical, legal, or medical advice.
- It does **not** perform a production launch.

Daily and weekly automation remain **unblocked**. Manual Review remains UI / read-only.

## Product promise

> Мягко покажи зоны внимания в отношениях: где может быть дистанция, контроль, молчание, ревность или повторяющийся эмоциональный сценарий.

The module answers, in soft terms: what should I notice before I get hurt, where is the main
emotional risk, is there a distance or silence pattern, is there a jealousy/control risk zone,
what conflict pattern may repeat, what should I do next carefully.

## Model

`lib/zodiac/aphrodite-red-flags-scanner-foundation.ts` exports:

- `createAphroditeRedFlagsScannerPreview(input)` — deterministic local preview.
- `getAphroditeRedFlagsScannerSections()` — section templates.
- `getAphroditeRedFlagsScannerBoundaries()` — safety boundaries.
- `getAphroditeRedFlagsScannerTrafficHooks()` — social hooks (spec only).

Sections: Main red flag zone, Soft warning, Distance / silence pattern, Jealousy or control risk
zone, Conflict pattern, Self-protection next step, Future VIP teaser.

Free preview: one possible red flag, one soft warning, one distance or conflict pattern, one
self-protection step, one next step.
Future VIP teaser: emotional avoidance, jealousy/control risk, silence/conflict pattern,
attachment style hint, what to do next, 30-day relationship risk timeline, personal reflection
prompts.

## Safety language and care-first design

Soft wording only: *may*, *often*, *possible pattern*, *can indicate*, *zone of attention*,
*worth noticing*, *not a final judgment*. The scanner never accuses a real person of abuse, never
diagnoses a mental-health condition, never gives emergency / legal / medical advice, and never
claims anyone is dangerous or safe. Everything is framed as a gentle zone of attention.

## Next package

**Package 139 — AI Future Timeline Foundation.**
