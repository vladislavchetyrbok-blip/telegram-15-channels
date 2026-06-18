# Zodiac Weekly Pipeline

The weekly Zodiac pipeline prepares one weekly horoscope post for each Zodiac channel:

- 12 sign channels;
- 1 general Zodiac channel;
- 13 weekly posts total;
- intended cadence: once per week;
- dry-run first, no live publishing until explicitly approved.

## Weekly Format

The first line is Telegram preview-friendly and includes the ISO week date range derived from `--week`, not from system time.

For the general channel:

```html
<b>✨ Общий гороскоп на неделю 15.06–21.06.2026</b>
```

For sign channels:

```html
<b>♈ Овен | Гороскоп на неделю 15.06–21.06.2026</b>
```

Range formatting rules:

- same calendar year: `DD.MM–DD.MM.YYYY`;
- cross-year week: `DD.MM.YYYY–DD.MM.YYYY`.

Weekly live schedule is not enabled. The lane is dry-run/prepared only until a separate production decision enables live weekly publishing.

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

Dry-run prints the first line for every slug, reports `Weekly Range Lines`, and must show `Telegram API Calls: 0`, `Live Publish Calls: 0`, and `Ledger Writes: 0`.

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

- every weekly post starts the inline keyboard with a compact CTA row:
  - `📅 Прогноз недели` -> Mini App `startapp=week`;
  - `💞 Совместимость` -> Mini App `startapp=compat` or `startapp=compat_{slug}`;
- the general weekly post has 12 sign buttons;
- each sign weekly post has the general channel button;
- each sign weekly post includes the other 11 signs;
- each sign weekly post excludes itself.

Weekly dry-run prints the CTA labels for each slug and the summary counters `CTA Rows Checked` / `CTA Rows OK`. The weekly lane is still prepared-only; no weekly live schedule is enabled.

## Safety

- No external AI API is required.
- No Telegram API calls happen in dry-run mode.
- No daily publish ledger mutation happens.
- No scheduler or workflow changes are required.
- No weekly live schedule is enabled by this pipeline.
- No image assets are modified.
- Live weekly publishing is disabled unless `--live --approved` is passed.
