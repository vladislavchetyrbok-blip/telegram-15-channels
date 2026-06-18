# Zodiac VIP Functional Core

VIP is free until `2026-09-17`. Payments, Telegram Stars, paid checks, and real monetization remain off.

## Active Tools

The VIP section has 11 active functional tools:

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

Each active tool must show:

- a short explanation;
- an input block;
- `Рассчитать` or `Показать`;
- a non-empty `Результат VIP`;
- `Сохранить результат`;
- `Поделиться результатом`;
- Back to the VIP menu.

`Розыгрыши` remain locked/preview and are not treated as an active VIP tool.

## Local Retention

VIP Save uses the existing local retention model and stores only safe shortcuts:

- section;
- feature key;
- label;
- sign slug;
- first sign slug;
- second sign slug;
- relationship mode;
- score tier;
- timestamp.

It must not store:

- names;
- exact birth dates;
- birth times;
- birth city/city query;
- raw angel number input;
- raw generated messages;
- raw result text;
- Telegram initData.

## Analytics

VIP functional tool events:

```text
vip_tool_started
vip_tool_calculated
vip_tool_saved
vip_tool_shared
vip_input_reused
vip_message_copied
```

Allowed payload fields for these events:

```text
featureKey
sign
firstSign
secondSign
relationshipMode
scoreTier
hasBirthDate
hasBirthTime
hasBirthCity
inputMode
goal
tone
```

Do not send names, exact dates, birth time, city text, raw inputs, generated message text, or raw results.

## Smoke

Run:

```bash
npm run zodiac:miniapp:smoke
```

Expected VIP lines:

```text
VIP cards checked: 11/11
VIP tools calculated: 11/11
VIP save/share checked: 11/11 saved, 11/11 shared
VIP message copy checked: YES
Giveaways locked: YES
```

The smoke command must not run live publish, change Zodiac ledgers, enable weekly live schedule, or enable payments/Stars.
