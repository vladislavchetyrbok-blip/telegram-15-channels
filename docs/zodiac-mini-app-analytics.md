# Zodiac Mini App Analytics

This feature adds internal, privacy-safe analytics for the Zodiac Mini App. It is production-ready from code, but storage stays disabled until the required Redis REST environment variables are configured.

## Routes

Dashboard:

```text
/dashboard/networks/zodiac/analytics
```

Event API:

```text
POST /api/zodiac/analytics/event
```

## Current Modes

- `noop`: default when storage env vars are missing. Events are accepted and sanitized, but not persisted.
- `active`: enabled when both Redis REST env vars are present. Sanitized counters are written through the Redis REST pipeline.

When storage is missing, the dashboard shows:

```text
Аналитика ещё не подключена. События принимаются в безопасном noop-режиме.
```

## What Is Tracked

- `app_open`
- `sign_selected`
- Section opens.
- `compatibility_calculated`
- `natal_chart_started` and `natal_chart_completed`
- `couple_horoscope_viewed`
- `relationship_map_viewed`
- `lucky_day_clicked`
- `vip_clicked`
- `giveaway_clicked`
- `message_helper_used`
- Server timestamp and date key.
- Sign slugs, section slugs, compatibility mode, source category, startapp category, anonymous in-memory session id, pair sign slugs, relationship mode, and compatibility score tier.

Allowed events and payload fields live in `lib/zodiac-mini-app-analytics-shared.ts`.

## Privacy Rules

The analytics system must not store:

- Names.
- Partner names.
- Birth dates.
- Birth times.
- Birth cities.
- Message helper text.
- Bot token.
- Raw sensitive Telegram `initData`.
- Exact personal profile data.
- Any unrecognized payload fields.

The client strips fields before sending, and the API route sanitizes again before storage. The analytics session id is in-memory only and is not written to local storage or session storage.

## Storage Activation

Storage is optional. Without storage, the API returns `ok` in noop mode and the Mini App keeps working.

Required env vars:

```text
ZODIAC_ANALYTICS_REDIS_URL
ZODIAC_ANALYTICS_REDIS_TOKEN
```

The adapter is implemented in `lib/zodiac-mini-app-analytics-store.ts` and uses Redis REST pipeline commands only when both env vars are present. No SDK or external analytics service is required in the app bundle.

## Upstash / Vercel KV Notes

Use an Upstash Redis database, Vercel KV Redis database, or compatible Redis REST endpoint. Configure the REST URL and REST token from that provider; do not use a raw TCP Redis URL.

Creation checklist:

1. Create a Redis database in Upstash, Vercel KV, or another provider with Redis REST support.
2. Open the database connection settings.
3. Copy the REST URL, not the TCP Redis URL.
4. Copy the REST token/password value for server-side use.
5. Store those two values only as deployment environment variables. Do not commit them to the repository.

Expected value shapes:

```text
ZODIAC_ANALYTICS_REDIS_URL=https://your-redis-rest-endpoint
ZODIAC_ANALYTICS_REDIS_TOKEN=your-redacted-rest-token
```

The examples above are placeholders. Do not commit real values.

## Vercel Env Setup

Add the variables in the Vercel project settings:

1. Open the project in Vercel.
2. Go to Settings -> Environment Variables.
3. Add `ZODIAC_ANALYTICS_REDIS_URL`.
4. Add `ZODIAC_ANALYTICS_REDIS_TOKEN`.
5. Select the intended environments, usually Production and Preview.
6. Redeploy so the server runtime receives the new values.

For local testing, use a local env file only if needed and keep it untracked. Never commit `.env*` files with secrets.

## Dashboard

The dashboard shows:

- Analytics mode: `noop` or `active`.
- Storage configured: `YES` or `NO`.
- Events accepted: `YES`.
- Sensitive data stored: `NO`.
- Required setup checklist.
- What is tracked.
- What is not tracked.
- Today app opens.
- Last 7 days app opens.
- Top sections.
- Top signs.
- Compatibility mode split.
- VIP and giveaway clicks.
- Natal chart, couple horoscope, relationship map, lucky days, and message helper counters.
- Funnel: `app_open -> sign_selected -> section_open -> calculation`.

When storage is missing, metric panels stay visible with zero/sample placeholders so the activation state is obvious without hiding the dashboard structure.

## API

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

Disallowed events return a safe rejected response and are not stored:

```json
{
  "ok": false,
  "ignored": true,
  "reason": "event_not_allowed"
}
```

## Verification

Before activation or release:

```bash
npm run lint
npm run build
npm run zodiac:analytics:check
```

The analytics smoke script starts the built app locally in noop mode, checks:

- `/compatibility`
- `/dashboard/networks/zodiac/analytics`
- Allowed event returns safe `ok` / `noop` when storage is missing.
- Disallowed event returns safe rejection.
- Sensitive fields are not part of the analytics payload allowlist and are not echoed.
- Telegram API calls: `0`.
- Ledger writes: `0`.
- Live publish calls: `0`.
- Configured secret values are not printed.

After setting Redis REST env vars in Vercel and redeploying:

1. Open `/dashboard/networks/zodiac/analytics`.
2. Confirm Analytics mode is `active`.
3. Confirm Storage configured is `YES`.
4. Trigger a safe event by opening `/compatibility` and selecting a sign, or by posting an allowed non-sensitive event to `/api/zodiac/analytics/event`.
5. Refresh the dashboard and confirm aggregate counters move.
6. Confirm no names, birth dates, birth times, birth cities, message text, bot token, or raw sensitive Telegram `initData` appear in logs, responses, or stored analytics.
