# Zodiac Premium Natal Chart

The Mini App natal chart is a premium symbolic interpretation, not a fake exact ephemeris chart.

Source files:

```text
components/ZodiacVipSections.tsx
components/zodiac-mini-app/NatalChartVisual.tsx
lib/zodiac-astro-engine.ts
```

## Current Mode

Current engine status:

```text
symbolic
exact_unavailable
```

The UI must say:

```text
Символическая натальная карта
Базовая визуализация по знаку и введённым данным
Без точных домов и асцендента
```

Do not claim exact houses, ascendant, planet degrees, or aspects until a real astro engine is added.

## Inputs

VIP Natal Chart accepts:

- date of birth;
- optional birth time;
- optional birth city;
- optional gender;
- manual sign fallback.

If date of birth is entered, the sign is auto-detected. Example smoke case:

```text
1998-06-15 -> Близнецы
```

Input modes:

```text
basic: sign only
date: date + sign
extended: date + time + city
```

## Result Blocks

The result is a structured premium result, not a single longread. It must render:

- hero summary with `Символическая натальная карта`, sign, element, input mode, honesty badge, and one concise main conclusion;
- large visual map block;
- compact internal tabs: `Главное`, `Характер`, `Отношения`, `Деньги`, `Рост`, `Сегодня`;
- one bottom action area for Save/Share.

The sections must include:

- Главный код личности;
- Стихия и темперамент;
- Сильные стороны;
- Внутренний конфликт;
- Как человек принимает решения;
- Отношения и близость;
- Работа / деньги / реализация;
- Энергия месяца;
- Зона роста;
- Что делать сегодня;
- 3 персональные рекомендации.

The tone must be useful and non-fatalistic. Avoid medical, diagnostic, or guaranteed outcome language. Keep the screen scannable: do not return to a long uninterrupted stack of every text block.

## Visual Map

`NatalChartVisual` renders:

- large 12-sign circle;
- highlighted selected sign;
- highlighted element sector;
- central sign;
- 5 symbolic aspect/energy lines;
- labels for element, quality, polarity, and leading energy;
- legend for strength, growth, emotions, decisions, and relationships.

It uses SVG/CSS only and no external dependencies.

## Privacy

Save/history/favorites may store only safe summary:

```text
featureKey
sign
mode
timestamp
label
```

Do not store:

- birth date;
- birth time;
- birth city/city query;
- name;
- raw result text.

Share text is generic:

```text
Я открыл(а) натальную карту в Астрологическом центре ✨
Попробуй тоже: https://t.me/zodiac_love_check_bot?startapp=vip
```

## Analytics

Allowed events:

```text
natal_chart_started
natal_chart_calculated
natal_chart_saved
natal_chart_shared
chart_visual_opened
```

Allowed payload fields:

```text
featureKey
sign
chartType
inputMode
hasBirthDate
hasBirthTime
hasBirthCity
```

Never send raw birth date, birth time, city query, name, or raw result text.

## Future Astro Engine

`lib/zodiac-astro-engine.ts` contains a small future adapter/status contract. A future package can replace symbolic mode with exact calculations only after explicit approval and with a real astronomical calculation source.
