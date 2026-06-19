# Zodiac Real Phone Evidence Intake

Scope: real Telegram phone evidence intake for controlled soft launch.

This document explains what screenshots/videos to collect from iPhone and
Android testers and how to triage them without guessing. It does not authorize
live publish, weekly live, payments, Telegram Stars, profile sync, exact
astrology claims, or manual ledger edits.

## Evidence Needed

Collect evidence from the actual Telegram app on a physical phone.

Required screens:

- First open screen from the bot/startapp link.
- Main menu with the 10 categories.
- Compatibility result.
- Premium Natal Chart with keyboard open.
- Birth Matrix result.
- Tarot/Rune result.
- Lunar/Ritual result.
- Profile/History/Favorites.
- Share flow or share fallback.
- BackButton behavior.
- Bottom buttons / safe area.

Use video when the issue involves:

- keyboard overlay;
- scrolling;
- BackButton behavior;
- share sheet/fallback;
- a button that looks tappable but does not respond;
- a bottom action hidden by Telegram UI.

## Device Info To Collect

Do not collect personal identity. Use anonymous tester IDs.

```text
Tester ID:
iPhone/Android:
Model if known:
Telegram version if known:
System dark/light mode:
Approximate screen size:
Network type if relevant:
Startapp param:
```

## Privacy Rules

Before uploading evidence:

- Blur private chats.
- Blur Telegram usernames, phone numbers, and notifications.
- Do not upload tokens/secrets.
- Do not upload personal birth data unless the bug cannot be understood without
  it; prefer synthetic data.
- Do not upload raw tarot/rune questions, lunar intentions, feedback comments,
  or raw result text when not needed.
- Do not commit screenshots/videos with personal data.
- Do not commit real tester feedback, handles, phone numbers, or screenshots.

Safe synthetic values for reproduction:

```text
date: 01012000 -> 01.01.2000
time: 12:00
city: Test City
question: test question
intention: test intention
```

Even synthetic screenshots should stay in ignored runtime folders or external
triage storage unless they are deliberately sanitized.

## Classification

P0:

- Mini App cannot open.
- White screen.
- Privacy leak.
- Global Save/Share failure.
- Daily publish duplicate.

P1:

- Broken layout on a common phone.
- Keyboard blocks an input or submit action.
- BackButton is broken or traps the user.
- Scroll is unusable.
- A core result screen fails or is empty.
- Bottom action is hidden under Telegram UI.

P2:

- Spacing, text, or visual polish.
- A section feels too long.
- Copy is unclear but the flow works.
- Visual hierarchy could be stronger.

## Intake Workflow

1. Receive evidence outside the repository.
2. Remove or blur private content before sharing internally.
3. Create an anonymized bug report using
   `docs/zodiac-real-phone-bug-report-template.md`.
4. Classify severity as P0/P1/P2.
5. Reproduce locally with synthetic data when possible.
6. Only commit generic findings or sanitized docs; never commit raw tester
   evidence.

## Stop Rules

Stop inviting testers if any P0 appears:

- cannot open;
- white screen;
- privacy leak;
- global save/share failure;
- daily publish duplicate.

Pause expansion if any P1 remains open.

## Links

- Real phone checklist: `docs/zodiac-real-phone-webview-checklist.md`
- Controlled launch execution: `docs/zodiac-controlled-soft-launch-execution.md`
- Batch template: `docs/zodiac-soft-launch-batch-template.md`
- Bug template: `docs/zodiac-real-phone-bug-report-template.md`
