# Zodiac Compatibility Pipeline

The Zodiac compatibility pipeline prepares reusable relationship content for sign pairs. It is dry-run first and separate from daily and weekly publishing.

## Purpose

Compatibility content can be used for:

- posts in the general Zodiac channel;
- future bot or Mini App responses;
- future VIP content;
- shareable pair posts such as `Водолей + Лев`.

## Pair Model

The source of truth is:

```text
data/config/zodiac-compatibility-pairs.json
```

It contains 78 unique pairs:

- 12 same-sign pairs;
- 66 unique cross-sign pairs.

Each pair includes:

- `pairId`;
- `signA`;
- `signB`;
- `titleRu`;
- `shortTheme`;
- `compatibilityScore`;
- `elementDynamic`;
- `tags`.

## Content Format

```text
💞 Совместимость: <Sign A> + <Sign B>

Общая энергия:
...

Любовь:
...

Общение:
...

Сильная сторона пары:
...

Риск:
...

Совет:
...
```

## Commands

Generate one pair:

```bash
npm run zodiac:compatibility:generate -- --pair aquarius-leo
```

Generate all pairs for one sign:

```bash
npm run zodiac:compatibility:generate -- --sign aquarius
```

Generate all 78 pairs:

```bash
npm run zodiac:compatibility:generate -- --all
```

Dry-run publish preview:

```bash
npm run zodiac:compatibility:dry -- --pair aquarius-leo
```

Future live command, only after explicit approval:

```bash
npm run zodiac:compatibility:publish -- --pair aquarius-leo --live --approved
```

Check the separate compatibility ledger:

```bash
npm run zodiac:compatibility:ledger:check
```

## Ledger Separation

Compatibility publishing uses:

```text
data/state/zodiac-compatibility-publish-ledger.json
```

It is separate from:

```text
data/state/zodiac-publish-ledger.json
data/state/zodiac-weekly-publish-ledger.json
```

Dry-run writes 0 ledger entries. Live mode blocks duplicate `date+pairId` entries with protected statuses such as `pending`, `locked`, `sent`, or `published`.

## Future Schedule Options

- 1 compatibility post per day in the general channel.
- 3 compatibility posts per week.
- Weekend compatibility series.

## Safety Rules

- Dry-run makes 0 Telegram API calls.
- Live mode requires `--live --approved`.
- The default target is the general Zodiac channel.
- The daily ledger is never read or written.
- The weekly ledger is never read or written.
- No image assets are modified.
- No GitHub Actions workflow is required for this module.
