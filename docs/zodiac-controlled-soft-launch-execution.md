# Zodiac Controlled Soft Launch Execution Pack

Date: 2026-06-20
Scope: controlled soft-launch execution only.

This document is an operational package for inviting the first controlled testers.
It does not approve mass launch, weekly live publishing, payments, Telegram Stars,
profile sync, exact astrology claims, manual live publish, or manual ledger edits.

## Current Launch Status

- Controlled `5-20` users: allowed.
- Mass launch: forbidden.
- Weekly live: OFF.
- Payments/Stars: OFF.
- Profile sync: OFF.
- Redis analytics: `noop`.
- Exact astro: `exact_unavailable`.
- Daily scheduler: active, ledger-protected.
- VIP promo/free access: unchanged.

## Launch Group

Batch 1:

- Invite `5` trusted Telegram users.
- Include at least one iPhone user and one Android user.
- Use only people who can give practical feedback in Telegram.
- Do not include paid users.
- Do not promise exact astrology, payments, or account sync.

Batch 2:

- Expand to `10-15` additional users only if Batch 1 has no open P0/P1.
- Keep total controlled audience within `5-20` users.
- Do not expand if share/save, navigation, or privacy reports are unclear.

Audience rules:

- Telegram users only.
- No paid users yet.
- No public broadcast.
- No mass posting.
- No collection of real names, phone numbers, raw birth data, screenshots, or
  private notes in the repository.

## Test Link

```text
https://t.me/zodiac_love_check_bot?startapp=compat
```

Ask testers to open the link on a phone inside Telegram.

## What Testers Must Check

Ask each tester to try at least `3-5` flows:

- Launch/open: Mini App opens without white screen.
- Compatibility: pair setup, result, save, share, back.
- Premium Natal: result appears, symbolic/exact-unavailable wording is clear.
- Birth Matrix: result appears, visual matrix is readable.
- Tarot/Rune: result appears, share/save work.
- Lunar/Ritual: date/mode selection, result, calendar visual, share/save.
- Angel Numbers: top-level card is easy to find and opens.
- VIP: free access is visible, tools open, Giveaways remains locked.
- Profile/History/Favorites: saved items appear and reopen.
- Feedback panel: can copy/share a feedback draft.
- Share: output is generic and does not expose personal inputs.
- BackButton: Telegram/browser back behavior feels logical.
- Keyboard/scroll/bottom buttons: no overlaps, dead zones, or hidden actions.

## Feedback Table Template

Use anonymous tester labels only. Do not store real names, phone numbers,
Telegram handles, screenshots, raw birth dates, raw questions, raw intentions,
or raw result text in the repository.

```text
Tester ID:
Device:
Telegram version:
Opened successfully: YES/NO
Top feature:
Weakest feature:
Share worked: YES/NO
Save/history worked: YES/NO
P0:
P1:
P2:
Rating 1-10:
Would share with friend: YES/NO
Notes:
```

## Severity Guide

P0:

- Mini App does not open.
- White screen.
- Global share/save failure.
- Privacy leak.
- Daily publish duplicate.
- Critical Telegram WebView overlap blocking main actions.

P1:

- A key result page fails.
- VIP/Mystic/Birth Matrix/Couple Core has a broken primary action.
- Back navigation traps the user.
- Bottom buttons are hidden or hard to tap on a common phone.

P2:

- Copy could be clearer.
- A section feels too long.
- Visual hierarchy is weak but usable.
- One feature feels less valuable than expected.

## Stop Rules

Stop inviting users immediately if any of these happen:

- Mini App does not open.
- White screen.
- Share/save is broken globally.
- Any privacy leak is reported.
- Result pages fail or show empty screens.
- Telegram UI overlaps critical buttons.
- Daily publish duplicates.
- Any P0 is found.

When stopped:

1. Freeze new invites.
2. Reproduce the issue locally or in Telegram WebView.
3. Classify severity.
4. Fix only the confirmed issue.
5. Re-run smoke/safety checks.
6. Resume only after P0 is closed and P1 is either closed or explicitly accepted.

## Expand Rules

Expand from Batch 1 to the full `5-20` controlled group only if:

- P0 = `0`.
- P1 = `0` or fixed.
- Average rating is `>= 7`.
- Share works.
- Save/history works.
- Phone pass is acceptable.
- No privacy leaks.
- No daily publishing duplicate.
- Testers can find Compatibility, Birth Matrix, Angel Numbers, and VIP without
  additional explanation.

## What Not To Enable During Soft Launch

Do not enable:

- Weekly live.
- Payments/Stars.
- Profile sync.
- Exact astrology claims.
- Mass posting.
- Manual live publish without explicit approval.
- Public channel campaign beyond the already approved channel packaging.
- Referral tracking or personal identifiers.

## Operator Checklist Before Batch 1

Run:

```bash
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:desktop:qa
npm run zodiac:profile-sync:check
npm run zodiac:astro:check
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
npm run production:safety:check
git diff --check
```

Confirm:

- Profile sync remains OFF.
- No `/api/zodiac/profile/sync` calls while disabled.
- Redis analytics mode is still expected `noop`, unless Redis env is configured.
- Exact astro remains `exact_unavailable`.
- Weekly live remains OFF.
- Payments/Stars remain OFF.
- Ledger was not manually changed.

## Batch 1 Message Draft

```text
Привет! Запускаю закрытую проверку Telegram Mini App с гороскопами, совместимостью, Матрицей судьбы, таро/рунами, лунными практиками и VIP-разделом.

Открой, пожалуйста, с телефона внутри Telegram:
https://t.me/zodiac_love_check_bot?startapp=compat

Проверь 3-5 функций, которые тебе интересны. Особенно важно:
- открылось ли без белого экрана;
- понятно ли, куда нажимать;
- работают ли результат, сохранить и поделиться;
- удобно ли на телефоне;
- где текст слишком длинный или не даёт пользы;
- какую функцию ты бы отправил(а) другу.

Не присылай личные данные. Если хочешь показать баг, можно описать экран и действие словами.
```

## Output After Batch 1

Create a private/anonymized summary outside the repository or use
`docs/zodiac-soft-launch-batch-template.md` as a blank structure. Commit only
generic conclusions, never real tester feedback, screenshots, handles, raw
personal inputs, or identifying details.

Recommended decision format:

```text
Batch:
Tester count:
P0:
P1:
P2:
Average rating:
Share worked:
Save/history worked:
Privacy issues:
Decision: STOP / FIX / EXPAND
```

## Analytics Baseline & First Users Observation

* Redis analytics is active in production.
* Do not reset counters before first users unless explicitly approved.
* Package 55 test events are baseline noise.
* First 5 users must be observed through analytics + feedback.
