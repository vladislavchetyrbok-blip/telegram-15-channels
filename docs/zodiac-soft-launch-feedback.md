# Zodiac Soft Launch Feedback Intake

Date: 2026-06-19

This document defines how to collect feedback from the first `5-20` Zodiac Mini App testers without collecting unnecessary personal data. It is for soft launch only: no live publishing, no weekly live, no payments/Stars, no ledger edits.

## Goal

Soft-launch feedback should answer four practical questions:

- Does the Mini App work in a real Telegram WebView on real phones?
- Which features feel strongest enough to show more people?
- Are there any P0/P1 issues before a wider launch?
- Which texts feel too long, too generic, or not useful enough?

This is not a survey for personal astrological data. Do not collect names, birth dates, birth times, birth cities, raw questions, private chats, or screenshots with personal data.

## Who To Invite

Invite:

- `5-20` people;
- at least one iPhone user;
- at least one Android user;
- people who actually use Telegram;
- trusted contacts who can give direct feedback.

Do not invite a broad public audience yet. Mass launch remains blocked until the real phone pass is complete and P0/P1 issues are `0`.

## What To Ask Them To Try

Ask each tester to try 2-3 flows:

- Compatibility;
- Premium Natal Chart;
- Birth Matrix / Матрица судьбы;
- Tarot / Rune;
- Lunar / Ritual;
- Angel Numbers;
- Profile / History / Favorites;
- Share.

The tester does not need to complete every feature. It is better to get honest reactions from a few real flows than a rushed full checklist.

## Short Feedback Form

Use these questions. Keep the form short so people actually answer it.

```text
1. Телефон: iPhone / Android
2. Telegram открыл Mini App нормально? Да / Нет
3. Какая функция понравилась больше всего?
4. Где было непонятно?
5. Где что-то сломалось?
6. Был ли белый экран, зависание или кнопка, которая не нажалась?
7. Работал ли Share?
8. Работали ли Save / История / Избранное?
9. Был ли текст слишком длинный?
10. Какая функция выглядит самой "вау"?
11. Отправил(а) бы ты это другу?
12. Общая оценка 1-10
13. Скриншот бага, если есть, без личных данных
```

## In-App Feedback CTA

The Mini App now has a soft-launch feedback panel in `Мой профиль`:

- `Оставить отзыв`;
- `Сообщить о баге`.

The panel lets the tester choose `Отзыв`, `Баг`, or `Идея`, choose a feature area, optionally choose a 1-10 rating, and optionally type a short comment. The comment is transient only: it is not written to localStorage, not sent to analytics as raw text, and not inserted into the copied draft automatically. The draft leaves safe fields that the tester can complete manually after checking for personal data.

Allowed analytics from this panel:

```text
feedback_opened
feedback_draft_copied
feedback_share_started
```

Allowed payload only:

```text
feedbackType
featureKey
ratingBucket
hasComment
```

If a tester includes personal data in the optional comment, do not copy it into the tracker. Summarize the issue without the personal detail.

## What Not To Ask

Do not ask testers to send:

- birth date;
- name;
- birth city;
- birth time;
- personal relationship details;
- phone number;
- private chats;
- Telegram init data;
- screenshots with personal data visible.

If a tester sends sensitive information accidentally, do not commit it to the repository and do not copy it into docs. Summarize the bug without the sensitive details.

## Message To Tester

```text
Привет. Я собрал Telegram Mini App с гороскопами, совместимостью, натальной картой, матрицей судьбы, таро, рунами и лунными ритуалами.

Открой, пожалуйста, именно с телефона через Telegram:
https://t.me/zodiac_love_check_bot?startapp=compat

Проверь 2-3 функции и напиши:
1. что понравилось;
2. где было непонятно;
3. где что-то сломалось;
4. какая функция самая сильная;
5. отправил(а) бы ты это кому-то еще.

Если увидишь баг, можно прислать скриншот, но без личных данных.
```

## Feedback Intake Template

Use this internally when copying feedback into a working tracker. Do not store real names or private data.

```text
Feedback ID:
Date:
Tester label: T01/T02/T03
Device: iPhone/Android
Telegram opened Mini App: YES/NO
Features tried:
Strongest feature:
Confusing area:
Broken area:
White screen / hang / dead button: YES/NO
Share worked: YES/NO/N/A
Save/history/favorites worked: YES/NO/N/A
Text too long:
"Wow" feature:
Would send to friend: YES/NO/MAYBE
Rating 1-10:
Screenshot received: YES/NO
Screenshot sanitized: YES/NO/N/A
Potential bug IDs:
Notes without personal data:
```

## Batch Summary

After every 5 testers, summarize:

```text
Soft Launch Batch:
Users:
iPhone:
Android:
Opened successfully:
Average rating:
Top liked feature:
Most confusing feature:
Most shared feature:
P0:
P1:
P2:
Decision:
- continue testing
- fix P0/P1
- expand audience
- pause
```

## Privacy Rules

- Use labels like `T01`, not real names.
- Do not store raw birth dates, birth times, birth cities, names, phone numbers, or private chats.
- Do not commit real user answers.
- Do not commit screenshots with personal data.
- Do not paste full private messages into docs.
- Keep only summarized, anonymized issue descriptions.

## Decision After Feedback

After the first `5-20` users:

- If any P0 exists: stop expansion and fix immediately.
- If any P1 exists: fix before inviting more users.
- If P2 repeats with 3+ testers: consider a focused polish package.
- If rating is below `7/10`: do not expand; identify why.
- If the app opens reliably and P0/P1 is `0`: invite a slightly wider group.

Weekly live, payments, Telegram Stars, and mass launch remain separate decisions.
