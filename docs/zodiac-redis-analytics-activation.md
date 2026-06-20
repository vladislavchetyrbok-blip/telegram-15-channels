# Zodiac Redis Analytics Activation Runbook

Scope: production metrics readiness for Zodiac Mini App analytics.

This runbook prepares Redis activation but does not enable storage by itself.
Do not commit env values, Redis tokens, screenshots with personal data, or raw
event payloads.

## Current State

- Current storage mode without env: `noop`.
- Events are accepted and sanitized.
- Events are not persisted in `noop`.
- Dashboard route: `/dashboard/networks/zodiac/analytics`.
- Redis analytics activation is optional for controlled soft launch.
- Payments/Stars: OFF.
- Profile sync: OFF.
- Weekly live: OFF.
- Live publish: NO.

## Required Env

```text
ZODIAC_ANALYTICS_REDIS_URL
ZODIAC_ANALYTICS_REDIS_TOKEN
```

Use a Redis REST URL/token pair, such as Upstash Redis REST or compatible
provider credentials. Do not use a raw TCP `redis://` URL unless the adapter is
explicitly changed to support TCP.

Never print or commit the token value.

## Activation Steps

1. Create or select a Redis database with REST API support.
2. Copy the REST endpoint URL.
3. Copy the REST token.
4. Add both env vars in hosting/deployment settings only.
5. Redeploy the app.
6. Run the verification commands.

Verification:

```bash
npm run zodiac:analytics:storage:check
npm run zodiac:analytics:check
```

Expected after activation:

- `zodiac:analytics:storage:check` reports mode `redis`.
- Required env configured: `2/2`.
- Sensitive payload fields present: `0`.
- No secret values printed.
- Live publish calls: `0`.
- Ledger writes: `0`.

## Dashboard Check

Open:

```text
/dashboard/networks/zodiac/analytics
```

In `noop`, the dashboard must clearly show:

```text
Analytics storage: noop
Redis env not configured
Events are sanitized but not persisted
Add ZODIAC_ANALYTICS_REDIS_URL and ZODIAC_ANALYTICS_REDIS_TOKEN to enable real counters
```

After Redis activation, confirm:

- Analytics mode is active/redis.
- Storage configured is `YES`.
- Today/7-day counters can move after safe actions.
- Required env names are shown without values.
- The analytics page shows `Production analytics: Redis active`.
- The first-users funnel shows `Mini App opens`, `Feature opens`,
  `Results calculated`, `Save actions`, `Share actions`, and `Feedback opened`.
- The page does not render Redis REST URL/token values.

## Safe Mini App Action Check

Trigger a safe event, for example:

1. Open `/compatibility`.
2. Open a main menu category.
3. Select a zodiac sign.
4. Save or share a safe result draft.
5. Refresh the dashboard.

Only aggregate counters should change.

## First Users Funnel Reading

For the first trusted `5` users, read the dashboard in this order:

1. `Mini App opens`: confirms people reached the Mini App.
2. `Feature opens`: confirms they moved beyond the home screen.
3. `Results calculated`: confirms a flow produced value.
4. `Save actions` and `Share actions`: confirm retention/sharing intent.
5. `Feedback opened`: confirms the feedback entry point is discoverable.

Bad signs:

- opens increase but feature opens stay flat;
- feature opens increase but result events stay flat;
- result events exist but no save/share happens;
- feedback opens spike alongside low result completion;
- any raw sensitive data appears anywhere.

## Privacy Rules

Analytics must never store:

- raw birth date;
- raw birth time;
- raw city/city query;
- names;
- phone numbers;
- raw tarot/rune question;
- raw lunar intention;
- raw feedback comment;
- raw result text;
- raw share text;
- raw Telegram initData;
- tokens/secrets.

Allowed payload fields are safe categorical values and booleans such as section,
featureKey, sign slug, scoreTier, relationshipMode, chartType, inputMode,
hasBirthDate, hasBirthTime, hasBirthCity, hasComment, and shareType.

## Rollback

If Redis counters fail, are noisy, or an env mistake is suspected:

1. Remove `ZODIAC_ANALYTICS_REDIS_URL`.
2. Remove `ZODIAC_ANALYTICS_REDIS_TOKEN`.
3. Redeploy.
4. Run:

```bash
npm run zodiac:analytics:storage:check
npm run zodiac:analytics:check
```

Expected rollback state:

- storage mode returns to `noop`;
- events remain sanitized;
- events are not persisted;
- dashboard shows the noop notice;
- Mini App continues to work.

## Stop Rules

Stop analytics activation if:

- any check prints a secret value;
- sensitive payload fields appear in the allowlist;
- storage writes raw request bodies;
- dashboard exposes personal data;
- Redis endpoint requires unsupported TCP-only access;
- checks report ledger writes or live publish calls.


## Analytics Navigation & Dashboard QA Update

* **Direct Analytics Route**: `/dashboard/networks/zodiac/analytics`
* **Dashboard Navigation Behavior**: The overview page provides clear status indicators, quick action buttons, and operational safety cards. A prominent CTA links directly to the Analytics page. The sidebar also contains an `Аналитика` link pointing to the analytics route.
* **Where to check analytics**: Navigate to the Overview page and use the 'Открыть аналитику' CTA, or use the sidebar link.
* **Current Redis / noop state**: Displayed as a status badge on the Overview page. If Redis is missing env variables, a warning is prominently displayed.
* **Soft launch dashboard checklist**: Review the 'Рекомендованные шаги' card on the Overview page for instructions.
