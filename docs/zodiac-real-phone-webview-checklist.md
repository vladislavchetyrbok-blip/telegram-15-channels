# Zodiac Real Phone Telegram WebView Checklist

Status: `Real phone pass: NOT EXECUTED, manual user pass required`

This document is the manual QA checklist for validating the Zodiac Mini App as a real Telegram Mini App on a physical phone. Browser checks, desktop responsive mode, Telegram mock smoke, and `npm run zodiac:desktop:qa` are useful regressions, but they do not count as a real phone Telegram WebView pass.

Package 37 adds server-side Telegram WebApp `initData` validation readiness. Do
not enable profile sync or remote profile storage during this phone pass.

Desktop QA harness reference:

```text
docs/zodiac-desktop-qa-harness.md
```

Use it before the manual phone pass to catch obvious UI regressions, screenshot key screens, and verify console/network/localStorage privacy. Still complete this checklist on real iPhone/Android Telegram because desktop automation cannot prove Telegram keyboard overlays, safe-area clipping, or native share sheet behavior.

Evidence intake templates:

```text
docs/zodiac-real-phone-evidence-intake.md
docs/zodiac-real-phone-bug-report-template.md
```

Use these templates when screenshots/videos are uploaded. Blur private chats,
avoid personal birth data when possible, and never commit raw tester evidence
with personal data.

## Scope

Open the Mini App from Telegram on a phone:

```text
https://t.me/zodiac_love_check_bot?startapp=compat
```

Use the actual Telegram app and bot/startapp link. If there is a production or staging deployment behind the bot, test that deployed Mini App, not only a local browser URL.

Do not run:

- daily live publish;
- weekly live publish;
- channel navigation live publish;
- manual ledger edits;
- payments, Telegram Stars, or monetization changes.

## Evidence To Capture

For each device/session, record:

- device model;
- OS and version;
- Telegram version, if visible;
- network type, if relevant;
- Mini App launch link/startapp param;
- screenshots for key screens;
- short video if a bug is related to scrolling, keyboard, BackButton, or share flow;
- exact steps to reproduce every bug;
- whether the issue is P0, P1, or P2.

Recommended screenshots:

- first open screen;
- first loaded home screen;
- main menu;
- compatibility result;
- Premium Natal Chart with keyboard open;
- Premium Natal Chart result;
- Birth Matrix result;
- Tarot/Rune result;
- Lunar/Ritual result;
- Profile/History/Favorites;
- Share flow;
- BackButton behavior;
- bottom buttons / safe area;
- one VIP result;
- any visual overflow or keyboard issue.

## Pass / Fail Matrix

Use this table during the phone pass:

| Area | Pass | Fail | Notes / Evidence |
| --- | --- | --- | --- |
| Launch from Telegram bot/startapp |  |  |  |
| Dark/light Telegram theme readable |  |  |  |
| Safe area top/bottom not clipped |  |  |  |
| Bottom actions visible above Telegram UI |  |  |  |
| Main menu 10 categories visible |  |  |  |
| Telegram BackButton logic |  |  |  |
| Compatibility result |  |  |  |
| Premium Natal Chart |  |  |  |
| Birth Matrix |  |  |  |
| Tarot/Rune |  |  |  |
| Lunar/Ritual |  |  |  |
| Angel Numbers |  |  |  |
| VIP 11/11 tools |  |  |  |
| Giveaways locked |  |  |  |
| Profile/History/Favorites |  |  |  |
| Save/share flows |  |  |  |
| Keyboard does not break layout |  |  |  |
| No horizontal overflow |  |  |  |
| No white native select |  |  |  |
| No dead CTA |  |  |  |
| Share text privacy-safe |  |  |  |
| localStorage privacy-safe |  |  |  |

## Launch

Check:

- Mini App opens from Telegram.
- No white screen.
- No long loading stall.
- Main screen renders as `Астрологический центр`.
- Dark theme is readable.
- Light theme is readable if available.
- Safe area does not cut off the top title or bottom navigation.
- Sticky/bottom buttons are not hidden behind Telegram UI.

Fail examples:

- blank screen after opening from bot;
- content starts behind Telegram header;
- bottom button cannot be tapped because it sits under Telegram controls;
- dark theme makes text unreadable.

## Navigation

Check:

- Home has 10 top-level categories.
- Internal navigation does not loop.
- From a result screen, user can return to category and then home.
- Telegram BackButton appears on detail/category screens.
- Telegram BackButton hides on home.
- Browser/internal back controls still work if visible.

Main categories:

1. `Гороскопы`
2. `Совместимость`
3. `Ангельские числа`
4. `Матрица судьбы`
5. `Нумерология`
6. `Мистика`
7. `Таро и руны`
8. `Луна и ритуалы`
9. `VIP раздел`
10. `Мой профиль`

## Compatibility

Check:

- select two signs;
- select relationship mode;
- calculate result;
- result shows `Карта отношений`;
- score/score tier is visible;
- quick metrics are visible;
- `30 дней пары` opens and scrolls;
- `Что написать` opens and copy state appears;
- `Действие сегодня` opens;
- Save works;
- Share opens Telegram/native flow or a clear fallback;
- BackButton returns cleanly.

Privacy:

- share text must not include raw birth dates, times, city, names, or raw generated private messages.

## Premium Natal Chart

Use:

```text
date: 1998-06-15
time: 23:55
city: Dnipro
```

Check:

- auto sign is `Близнецы`;
- chart visual is visible;
- hero/summary is visible;
- tabs work;
- honesty badge is visible;
- keyboard does not cover active input;
- result is not empty;
- Save works;
- Share works.

Privacy:

- share text must not expose `1998-06-15`, `23:55`, `Dnipro`, raw city query, or raw result text.

## Birth Matrix

Use:

```text
date: 1998-06-15
```

Check:

- visual matrix is visible;
- central number is visible;
- six zones/sections are visible;
- legend is understandable;
- tabs work;
- Save works;
- Share works;
- saved item appears in Profile/History/Favorites if supported;
- saved item reopens correctly.

Privacy:

- share/local history must not expose the raw birth date, raw name, or raw matrix text.

## Tarot / Rune

Tarot test:

```text
topic: Решение
spread: 3 карты
question: Что мне выбрать?
```

Rune test:

```text
spread: Руна дня or Три руны
```

Check:

- visual cards/runes are readable;
- result sections are not empty;
- Save works;
- Share works;
- tabs or card/rune selectors work;
- BackButton returns cleanly.

Privacy:

- raw question must not appear in share text, saved shortcuts, analytics, or localStorage.

## Lunar / Ritual

Use:

```text
mode: Ритуал дня
date: Сегодня
intention: Хочу спокойствия
```

Check:

- Lunar calendar visual is visible;
- selected mode/date are clear;
- ritual result sections are readable;
- checklist/action blocks are visible;
- Save works;
- Share works;
- long screen scrolls smoothly.

Privacy:

- raw intention must not appear in share text, saved shortcuts, analytics, or localStorage.

## Angel Numbers

Check:

- category is visible from home;
- entering/selecting an angel number produces a result;
- result is not empty;
- Save/Share works if present;
- BackButton returns cleanly.

Privacy:

- raw custom angel number input should not be retained as a sensitive raw input if the privacy model treats it as user input. Safe pattern/category summaries are acceptable.

## VIP

Check all 11 active VIP tools briefly:

1. `Расширенная натальная карта`
2. `Месячный прогноз`
3. `Расширенный именной профиль`
4. `Расширенная совместимость`
5. `Ментальная карта пары`
6. `30-дневный календарь пары`
7. `Помощник сообщений`
8. `Расширенная нумерология`
9. `Толкование ангельских чисел`
10. `Талисманы и символы силы`
11. `VIP мистический день`

For each:

- input is understandable;
- calculate/show action is tappable;
- result appears;
- result is not empty;
- Save appears only after a result where applicable;
- Share appears only after a result where applicable;
- Save/Share state is clear;
- BackButton returns to VIP menu.

Giveaways:

- must remain locked/preview;
- must not open as an active premium tool.

## Profile / History / Favorites

Check:

- empty states are readable;
- saved compatibility result appears;
- saved Birth Matrix appears;
- saved VIP result appears;
- favorites appear if supported;
- reopening saved items works;
- no duplicate weirdness after repeated saves;
- clear local data works only through an intentional user action;
- no broken cards after clearing data.

Privacy:

- saved items must be safe summaries only;
- no names;
- no birth dates;
- no birth times;
- no city query;
- no raw question;
- no raw intention;
- no raw result text;
- no raw generated messages.

## Mobile UX

Check:

- no horizontal overflow;
- no white native select dropdown;
- custom selects can be opened and changed;
- tabs and accordions are finger-friendly;
- cards are not too small to tap;
- long screens scroll normally;
- sticky/bottom actions do not cover content;
- keyboard does not hide the active input or break layout;
- share fallback does not silently fail;
- loading states do not look frozen.

## Error Capture

If remote logs are available, check them after the session:

- no runtime errors;
- no 4xx/5xx caused by Mini App interactions;
- no analytics errors that affect UX;
- no secret values in logs.

If logs are not available, rely on visual evidence:

- screenshot/video of every failure;
- exact flow path;
- input values used;
- device and Telegram version.

## Bug Severity

P0:

- Mini App does not open from Telegram;
- result cannot be calculated;
- Save/Share broken globally;
- BackButton breaks the flow;
- privacy leak in share/localStorage;
- mobile overflow makes a screen unusable.

P1:

- one major section has broken layout;
- tabs do not work;
- important button is hidden under Telegram UI;
- share fallback is unclear or silent;
- visual result is unreadable.

P2:

- minor spacing issue;
- text could be stronger;
- premium polish idea;
- future monetization idea;
- real ephemeris/astro engine improvement.

Fix only P0/P1 in the real-phone QA package. Record P2 as backlog.

## Current Automated Baseline

Latest local non-phone checks expected before manual phone pass:

```bash
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
npm run production:safety:check
git diff --check
```

These checks do not replace the real phone pass.

## Telegram initData Auth Foundation

During the real phone pass, record whether the Mini App opens inside Telegram
normally. Do not enable profile sync or remote profile storage.

Identity safety rules:

- Do not trust `initDataUnsafe` as identity.
- Do not store raw `initData`.
- Do not send raw `initData` to analytics.
- Do not log bot tokens.
- Do not persist names, birth dates, birth times, city queries, raw questions,
  raw intentions, or raw result text.

Optional technical check, only if needed by a developer:

```text
POST /api/zodiac/telegram-auth/check
Authorization: tma <initData>
```

The response must contain only safe status fields and a masked user id.
