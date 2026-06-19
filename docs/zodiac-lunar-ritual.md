# Zodiac Lunar / Ritual Flow

The Mini App Lunar/Ritual feature is a symbolic lunar interpretation for reflection, routine planning, and gentle self-observation. It is not an exact astronomical moon-phase engine.

## Scope

Entry points:

- Home category `Луна и ритуалы`
- Mystic feature `Лунный ритуал`
- Safe share/start link uses `startapp=mystic`

Supported modes:

- `Лунный день`
- `Ритуал дня`
- `Любовный ритуал`
- `Деньги / работа`
- `Очищение`
- `Сон / интуиция`

Date selection:

- `Сегодня`
- `Завтра`
- `Выбрать дату`

The date is used as the deterministic seed for the symbolic cycle. It must not use the current system clock once the Mini App target date is provided.

## Honesty Policy

The UI must keep honest wording:

```text
символический лунный ритм
приближённая лунная интерпретация
символический лунный календарь
```

Do not claim:

- exact astronomical moon phase;
- NASA/ephemeris precision;
- medical results;
- guaranteed money/love outcomes;
- `100%` fulfillment or fate-style claims.

A future package may add a real lunar/ephemeris engine. Until then, the current feature is deterministic and symbolic.

## Result Layout

The result should not be a long wall of text. It should render:

- hero summary `Лунный ритуал`;
- selected mode and selected date;
- energy tier and honesty badge;
- `LunarCalendarVisual` with 14 days;
- selected day marker;
- legend for `рост`, `очищение`, `любовь`, `деньги`, `отдых`, `интуиция`;
- `Энергия дня`;
- `Что делать`;
- `Что не делать`;
- `Ритуал`;
- `Чек-лист`;
- `Действие сегодня`;
- `Вечерний итог`;
- `Сохранить ритуал`;
- `Поделиться`.

## Privacy

The optional `Намерение` field is local UI input only. Raw intention text must not be stored or sent.

Allowed local retention summary fields:

```text
featureKey
mode
dateBucket
selectedDateKey
energyTier
ritualKey
timestamp
label
```

Forbidden local retention and analytics fields:

```text
raw intention
raw question
raw result text
raw generated ritual text
name
birth date
birth time
city query
Telegram initData
```

Safe share text:

```text
Открыл(а) лунный ритуал в Астрологическом центре ✨
Попробуй тоже: https://t.me/zodiac_love_check_bot?startapp=mystic
```

## Analytics

Safe events:

```text
lunar_started
lunar_day_calculated
lunar_ritual_calculated
lunar_ritual_saved
lunar_ritual_shared
feature_depth_viewed
```

Allowed payload fields:

```text
featureKey
mode
dateBucket
energyTier
ritualKey
hasIntention
```

`hasIntention` is boolean only. It confirms the field was used without storing the text.

## Checks

```bash
npm run zodiac:miniapp:smoke
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
```

Smoke must verify:

- `Луна и ритуалы` opens;
- `Ритуал дня` and `Сегодня` can be selected;
- test intention `Хочу спокойствия` can be entered;
- result hero and calendar render;
- selected day and legend render;
- Save and Share states work;
- localStorage does not contain `Хочу спокойствия`.

These checks never run live publish, never write the Zodiac publish ledger, and never enable payments or weekly live scheduling.
