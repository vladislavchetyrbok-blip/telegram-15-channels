# Zodiac Mini App Analytics

This feature adds internal, privacy-safe analytics for the Zodiac Mini App.

## What Is Tracked

- Event name from the allowlist.
- Server timestamp and date key.
- Section name.
- Sign slug.
- Compatibility mode.
- Source and startapp category.
- Anonymous in-memory session id for the current browser page.
- Pair sign slugs for compatibility checks.
- Compatibility score tier.

Allowed events live in `lib/zodiac-mini-app-analytics-shared.ts`.

## What Is Not Tracked

- Names.
- Partner names.
- Birth dates.
- Birth times.
- Birth cities.
- Raw Telegram `initData`.
- Message helper text.
- Exact personal profile data.
- Any unrecognized payload fields.

The client strips fields before sending, and the API route sanitizes again before storage.

## Storage

Storage is optional. Without storage, the API returns `ok` in noop mode and the Mini App keeps working.

Optional Redis REST env vars:

```text
ZODIAC_ANALYTICS_REDIS_URL
ZODIAC_ANALYTICS_REDIS_TOKEN
```

The adapter is implemented in `lib/zodiac-mini-app-analytics-store.ts` and uses Redis REST pipeline commands only when both env vars are present. No SDK or external analytics service is required.

## Dashboard

Internal dashboard route:

```text
/dashboard/networks/zodiac/analytics
```

When storage is missing, it shows `Аналитика ещё не подключена` and lists the required env variables.

When storage is configured, it shows:

- Today app opens.
- Last 7 days app opens.
- Top sections.
- Top signs.
- Compatibility mode split.
- VIP and giveaway clicks.
- Natal chart, couple horoscope, relationship map, lucky days, and message helper counters.
- Funnel: `app_open -> sign_selected -> section_open -> calculation`.

## API

Event endpoint:

```text
POST /api/zodiac/analytics/event
```

Allowed event example:

```json
{
  "event": "compatibility_calculated",
  "mode": "fast",
  "firstSign": "gemini",
  "secondSign": "leo",
  "scoreTier": "good"
}
```

Disallowed events return a safe rejected response and are not stored.

## Verification

Run:

```bash
npm run lint
npm run build
```

Route checks:

```text
/compatibility
/dashboard/networks/zodiac/analytics
```

API checks:

```bash
curl -X POST http://127.0.0.1:3000/api/zodiac/analytics/event \
  -H "content-type: application/json" \
  -d '{"event":"app_open","source":"telegram_mini_app","startappType":"compat_sign","name":"SHOULD_BE_STRIPPED"}'

curl -X POST http://127.0.0.1:3000/api/zodiac/analytics/event \
  -H "content-type: application/json" \
  -d '{"event":"not_allowed"}'
```

With storage disabled, the allowed event returns `mode: "noop"` and does not crash.
