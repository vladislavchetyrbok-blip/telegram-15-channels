# Zodiac Weekly Pipeline

The weekly Zodiac pipeline prepares one weekly horoscope post for each Zodiac channel:

- 12 sign channels;
- 1 general Zodiac channel;
- 13 weekly posts total;
- intended cadence: once per week;
- dry-run first, no live publishing until explicitly approved.

## Weekly Format

Sign-channel weekly posts use this structure:

```text
<emoji> <Sign Name> — гороскоп на неделю

Главная тема недели:
...

Любовь:
...

Работа и деньги:
...

Энергия:
...

Совет недели:
...

Лучший день:
...
```

The general weekly post uses this structure:

```text
🔮 Гороскоп на неделю

Главная энергия недели:
...

Любовь:
...

Деньги и работа:
...

Решения:
...

Совет недели:
...

👇 Выберите свой знак ниже:
```

## Commands

Generate deterministic preview content:

```bash
npm run zodiac:weekly:generate -- --week 2026-W25
```

Dry-run the weekly publish plan:

```bash
npm run zodiac:weekly:dry -- --week 2026-W25
```

Check the separate weekly ledger:

```bash
npm run zodiac:weekly:ledger:check
```

Future live command, only after explicit approval:

```bash
npm run zodiac:weekly:publish -- --week 2026-W25 --live --approved
```

## Ledger Separation

Weekly publishing uses a separate ledger:

```text
data/state/zodiac-weekly-publish-ledger.json
```

It does not read from or write to the daily ledger:

```text
data/state/zodiac-publish-ledger.json
```

Dry-run mode writes 0 weekly ledger entries. Live mode must skip any `week+slug` already marked `sent`, `published`, `pending`, `locked`, `in_progress`, or `publishing`.

## Buttons

Weekly posts use the same navigation rules as daily posts:

- the general weekly post has 12 sign buttons;
- each sign weekly post has the general channel button;
- each sign weekly post includes the other 11 signs;
- each sign weekly post excludes itself.

## Safety

- No external AI API is required.
- No Telegram API calls happen in dry-run mode.
- No daily publish ledger mutation happens.
- No scheduler or workflow changes are required.
- No image assets are modified.
- Live weekly publishing is disabled unless `--live --approved` is passed.
