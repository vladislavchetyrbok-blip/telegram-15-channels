# Zodiac Compatibility Interactive Service

Compatibility is not a scheduled channel-post pipeline. It is an interactive bot or Telegram Mini App service opened from Zodiac channel buttons.

## Product Rule

- Do not publish compatibility results into every Zodiac channel feed.
- Do not create a separate compatibility channel for the MVP.
- Do not schedule compatibility posts.
- Keep compatibility separate from daily horoscopes and weekly forecasts.
- Do not persist personal birth data until a separate privacy/storage task explicitly approves it.

## Entry Point

Daily Zodiac posts may include one button:

```text
💞 Совместимость знаков
```

The button target is configurable:

- Prefer `COMPATIBILITY_MINI_APP_URL` when a hosted Mini App URL exists.
- Otherwise use `COMPATIBILITY_BOT_USERNAME` with a Telegram deep link.
- `COMPATIBILITY_MINI_APP_NAME` can be used with `COMPATIBILITY_BOT_USERNAME` for a Telegram Mini App path.

Sign channels pass the first sign:

```text
compat_gemini
compat_leo
```

The general horoscope entry uses:

```text
compat
```

If no Mini App URL or bot username is configured, dry-runs show a warning and the live daily keyboard omits the compatibility button.

## User Flow

1. User reads a Zodiac channel.
2. User taps `💞 Совместимость знаков`.
3. Telegram opens the Compatibility Bot or Mini App.
4. The first sign is preselected from the channel start parameter.
5. User enters data for self and partner.
6. The app returns the result privately or inside the interactive flow.
7. Result screen can link back to both sign channels and all horoscopes.

## Modes

### Fast

Required fields:

- first sign;
- second sign.

No birth date is required.

### Personal

Required fields for each person:

- gender: `male`, `female`, `unspecified`;
- zodiac sign;
- birth date.

### Precise

Required fields:

- all personal mode fields;
- optional exact birth time for each person;
- optional birth city for each person.

If exact birth time is unknown, calculation must still work and show:

```text
Расчёт выполнен без точного времени рождения. Некоторые детали могут быть приблизительными.
```

## Data Model

```ts
type CompatibilityPerson = {
  signSlug: ZodiacSignSlug;
  gender: "male" | "female" | "unspecified";
  birthDate?: string;
  knowsBirthTime: boolean;
  birthTime?: string;
  birthCity?: string;
};

type CompatibilityRequest = {
  source: "fast" | "personal" | "precise";
  first: CompatibilityPerson;
  second: CompatibilityPerson;
};
```

Validation:

- Fast mode requires only both signs.
- Personal mode requires signs and birth dates.
- Precise mode requires birth dates.
- Precise mode requires birth time only when `knowsBirthTime` is true.
- Unknown birth time must not block calculation.
- Personal birth data is used only in memory in the current MVP.

## Pair Model

The source of truth remains:

```text
data/config/zodiac-compatibility-pairs.json
```

It contains 78 unique unordered pairs:

- 12 same-sign pairs;
- 66 cross-sign pairs.

Pair lookup normalizes reversed input:

```text
gemini-leo -> gemini-leo
leo-gemini -> gemini-leo
```

Display order follows the user flow, but stored content remains canonical.

## Result Template

```html
<b>♊️ Близнецы мужчина + ♌️ Лев женщина</b>

<b>Совместимость по дате рождения</b>

🔥 <b>Притяжение:</b> ...
💬 <b>Общение:</b> ...
❤️ <b>В любви:</b> ...
🏠 <b>Быт и ритм:</b> ...
⚠️ <b>Слабое место:</b> ...

<b>Совет паре:</b>
...

<b>Итог:</b>
...
```

## Commands

Fast preview:

```bash
npm run zodiac:compatibility:dry -- --mode fast --first-sign gemini --second-sign leo
```

Legacy pair selector still maps to fast mode:

```bash
npm run zodiac:compatibility:dry -- --pair gemini-leo
```

Personal preview:

```bash
npm run zodiac:compatibility:dry -- --mode personal --first-sign capricorn --first-gender male --first-birth-date 2000-01-01 --second-sign aries --second-gender female --second-birth-date 2000-03-21
```

Precise preview with unknown second birth time:

```bash
npm run zodiac:compatibility:dry -- --mode precise --first-sign capricorn --first-gender male --first-birth-date 2000-01-01 --first-knows-time --first-birth-time 12:00 --first-birth-city "Test City" --second-sign aries --second-gender female --second-birth-date 2000-03-21 --second-unknown-time
```

Live channel publishing is intentionally disabled for this command.

## Safety

- Dry-run makes 0 Telegram API calls.
- Dry-run writes 0 ledger entries.
- No daily, weekly, or compatibility ledger is modified.
- No workflow trigger is required.
- No personal birth data is persisted.
- Bot creation, Mini App hosting, and live Telegram changes require separate explicit approval.
