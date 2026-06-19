# Zodiac Soft Launch Runbook

Date: 2026-06-19

Status: `READY for controlled first users / NOT READY for mass public launch`

This runbook is for a careful first user pass of the Zodiac Telegram Mini App. It does not authorize live publishing, weekly live scheduling, payments, Telegram Stars, or manual ledger changes.

## Current Status

- Launch readiness: `9/10`.
- Daily publishing: active, scheduler-hardened, ledger-protected.
- Mini App: smoke PASS for main menu, compatibility, VIP, Mystic, Birth Matrix, Angel Numbers, Tarot/Rune, Lunar/Ritual, Profile, History, Favorites, Share, and Telegram mock.
- Weekly live: `OFF`.
- Payments/Stars: `OFF`.
- Analytics mode: `noop` until Redis REST env vars are configured.
- Real phone Telegram WebView pass: required before any mass launch.
- VIP access: free until `2026-09-17`.
- In-app feedback CTA: available in `Мой профиль` as `Оставить отзыв` / `Сообщить о баге`; raw comments are not stored in localStorage or analytics.

## First Users Target

Start with `5-20` people.

Recommended audience:

- friends, trusted contacts, or people who can give honest feedback;
- at least one iPhone user;
- at least one Android user;
- at least one person who has not seen the product before.

Do not do a mass public launch until the real phone Telegram WebView pass is completed and all P0/P1 issues are cleared.

## Test Link

Send this link from a phone through Telegram:

```text
https://t.me/zodiac_love_check_bot?startapp=compat
```

Ask testers to open it in Telegram, not in a desktop browser.

## What To Ask People To Check

Ask each tester to check 2-3 flows, not everything. The goal is honest friction, not a perfect test script.

Core checks:

- Does the Mini App open?
- Is the main screen understandable?
- Is it clear what to tap first?
- Does the screen fit the phone width?
- Are buttons easy to tap?
- Does the Back button feel logical?
- Does anything feel slow?
- Where did they feel lost?
- Where did they want to close the app?

Feature checks:

- Compatibility / relationship result.
- Premium Natal Chart.
- Birth Matrix / Матрица судьбы.
- Tarot or Runes.
- Lunar ritual.
- Angel Numbers.
- VIP tools.
- Share.
- Save / History / Favorites.

## Feedback Questions

Use these short questions after the tester has tried the app:

1. What did you like first?
2. Where was it unclear?
3. Which feature felt strongest?
4. Where was the text too long?
5. Where did you want more truth, depth, or specificity?
6. Did Share work?
7. Was it comfortable on your phone?
8. What would you send to a friend?
9. Did anything feel broken or dead?
10. What would you remove or simplify?

Detailed feedback intake:

```text
docs/zodiac-soft-launch-feedback.md
```

Bug triage workflow:

```text
docs/zodiac-bug-triage.md
```

Testers can also use the in-app feedback panel:

```text
Мой профиль -> Оставить отзыв / Сообщить о баге
```

The panel creates a safe copy/share draft with feature, type, optional rating, device hint, and a screenshot reminder. The optional comment is transient only and is not inserted into the copied draft automatically. Do not ask testers to include names, birth dates, birth time, city, private relationship details, or raw result text.

## P0 / P1 / P2 Bug Classification

### P0

Stop and fix before showing more users:

- Mini App does not open.
- White screen or runtime crash.
- Result does not generate for a core feature.
- Share or Save is broken everywhere.
- Privacy leak: name, birth date, birth time, city query, raw input, or raw generated text is stored or sent where it should not be.
- Telegram UI, safe-area, keyboard, or bottom navigation blocks important buttons.
- Any action accidentally triggers live publish, payments, Telegram Stars, or ledger changes.

### P1

Fix before expanding beyond the first small group:

- Layout is broken on a common phone size.
- Text is unreadable in light/dark Telegram theme.
- Keyboard breaks the screen.
- Back navigation gets stuck or exits unexpectedly.
- CTA appears active but does nothing.
- A feature opens but shows an empty screen or placeholder-like result.
- Share works technically but gives confusing feedback.
- Save/history/favorites creates duplicates or cannot reopen saved content.

### P2

Backlog after the first feedback round:

- Text could be shorter or stronger.
- Visual could be more premium.
- Minor spacing or polish.
- More examples or deeper explanations requested.
- Monetization ideas.
- Requests for more personalization.

## Soft Launch Rules

During soft launch:

- Do not enable weekly live.
- Do not enable payments or Telegram Stars.
- Do not run manual daily live without a separate explicit approval.
- Do not run weekly live publish.
- Do not manually edit ledgers.
- Do not change scheduler timing.
- Do not add secrets to the repository.
- Redis env can be configured separately in hosting, but secret values must never be committed.
- Product changes after feedback should be grouped into small packages, starting with P0/P1 issues.

## Manual Phone Checklist

Use the detailed phone/WebView checklist here:

```text
docs/zodiac-real-phone-webview-checklist.md
```

Minimum first pass:

- one iPhone viewport;
- one Android-like narrow viewport;
- Telegram WebView, not only desktop browser;
- dark/light Telegram theme if available;
- check BackButton behavior;
- check long-scroll screens;
- check no horizontal overflow.

## Analytics Status

Current mode:

```text
noop
```

This is privacy-safe, but production metrics will stay empty until Redis REST env is configured.

Required env names:

```text
ZODIAC_ANALYTICS_REDIS_URL
ZODIAC_ANALYTICS_REDIS_TOKEN
```

Do not print or commit env values.

After Redis is configured and the app is redeployed, the dashboard should show aggregate counts for:

- main menu opens;
- category opens;
- compatibility flow;
- Angel Numbers;
- Birth Matrix;
- VIP tools;
- Share;
- Favorites / History;
- Profile;
- Telegram WebApp events.
- soft-launch feedback opens/copies/shares, with only safe categorical payload.

Sensitive data must not be stored or sent:

- names;
- birth dates;
- birth times;
- city query;
- raw personal input;
- raw result text;
- raw generated messages;
- Telegram initData;
- tokens or secrets.

## Decision Gates Before Expanding Audience

Before showing the product to more than the first small group:

- Real phone Telegram WebView pass is completed.
- Redis analytics is enabled, or there is an explicit decision to continue without metrics.
- Daily publishing has been stable for several days after the cron timing shift.
- P0 count is `0`.
- P1 count is `0`.
- Weekly live is still OFF unless a separate explicit weekly live approval package is completed.
- Payments/Stars are still OFF unless a separate monetization package is completed.

## Message To First Testers

```text
Привет! Я собрал Telegram Mini App с гороскопами, совместимостью, натальной картой, матрицей судьбы, таро/рунами, лунными практиками и VIP-разделом.

Открой, пожалуйста, с телефона прямо в Telegram:
https://t.me/zodiac_love_check_bot?startapp=compat

Проверь 2-3 функции, которые тебе интересны. Особенно важно:
- понятно ли, куда нажимать;
- красиво ли выглядит на телефоне;
- работает ли результат;
- работает ли "Поделиться";
- где текст слишком длинный или слишком общий;
- где хочется закрыть приложение.

Напиши честно: что понравилось, что непонятно, что сломано и какую функцию ты бы отправил(а) другу.
```

## Soft Launch Feedback Log Template

Use one entry per tester:

```text
Tester:
Device:
Telegram app version, if known:
Opened successfully: YES/NO
Features tried:
Best feature:
Confusing moment:
Broken moment:
Share worked: YES/NO
Save/history/favorites worked: YES/NO/N/A
Back button worked: YES/NO
Speed: OK/SLOW
Bug severity: P0/P1/P2/NONE
Notes:
```

## Stop Conditions

Pause the soft launch immediately if any of these happen:

- two or more testers cannot open the app;
- any privacy leak is found;
- any P0 appears;
- Telegram WebView blocks core buttons;
- Share produces sensitive content;
- Save/history/favorites stores raw personal data;
- daily scheduler/ledger behavior changes unexpectedly;
- someone accidentally triggers a live publish command.

## Recommended First Feedback Loop

1. Send the tester message to 5 people.
2. Collect device type and first impressions.
3. Classify bugs as P0/P1/P2.
4. Fix only P0/P1 before inviting more people.
5. Invite up to 20 people after P0/P1 is clear.
6. Do not expand publicly until real-phone pass and decision gates are complete.
