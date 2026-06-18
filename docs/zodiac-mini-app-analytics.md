# Zodiac Mini App Analytics

Zodiac Mini App analytics are designed to be privacy-safe before real storage is enabled. The API accepts only allowlisted event names and stores aggregate counters, not raw personal inputs.

## Commands

```bash
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
```

`zodiac:analytics:check` starts the app, posts safe sample events, verifies sensitive fields are stripped, and confirms the API still runs in `noop` mode when storage env is not configured.

`zodiac:analytics:storage:check` is a static/readiness audit. It verifies the storage mode contract, required env names, allowlisted events, server-side sanitization, dashboard presence, and coverage for Compatibility, VIP, Mystic, Birth Matrix, Telegram WebApp, and Profile retention events.

## Routes

Dashboard:

```text
/dashboard/networks/zodiac/analytics
```

Event API:

```text
POST /api/zodiac/analytics/event
```

## Storage Modes

- `noop`: default when storage env is missing. Events are accepted and sanitized, but no metrics are persisted. This is safe for development and smoke checks, but the analytics dashboard will stay empty.
- `redis`: enabled only when both required Upstash Redis REST env vars are configured.

Required env names:

```text
ZODIAC_ANALYTICS_REDIS_URL
ZODIAC_ANALYTICS_REDIS_TOKEN
```

Checks must report env names only. They must never print env values or secrets.

## Storage Activation

Storage is optional. Without storage, the API returns `ok` in `noop` mode and the Mini App keeps working.

Use an Upstash Redis database, Vercel KV Redis database, or compatible Redis REST endpoint. Configure the REST URL and REST token from that provider; do not use a raw TCP Redis URL.

Setup checklist:

1. Create a Redis database with REST support.
2. Copy the REST URL, not the TCP Redis URL.
3. Copy the REST token/password value for server-side use.
4. Store both values only as deployment environment variables.
5. Redeploy so the server runtime receives the new values.

Expected value shapes:

```text
ZODIAC_ANALYTICS_REDIS_URL=https://your-redis-rest-endpoint
ZODIAC_ANALYTICS_REDIS_TOKEN=your-redacted-rest-token
```

The examples above are placeholders. Do not commit real values.

For Vercel, add both variables in Project Settings -> Environment Variables for the intended environments, usually Production and Preview.

## Tracked Event Areas

The allowlist covers:

- main menu opens, main menu category taps, horoscope category opens, Angel Numbers category opens, compatibility category selection, and profile/saved/history preview panels;
- Compatibility core funnel events: `compatibility_wizard_started`, `compatibility_mode_selected`, `compatibility_birthdate_autosign_used`, `compatibility_calendar_opened`, `compatibility_action_opened`, `compatibility_message_copied`, `compatibility_pair_saved`, and `compatibility_pair_reopened`;
- Profile retention events: `profile_opened`, `history_opened`, `favorite_saved`, `favorite_opened`, `share_clicked`, and `local_data_cleared`;
- Interaction hardening events: `dead_cta_resolved`, `pair_required_action_clicked`, and `chart_visual_opened`;
- app open, sign selection, section opens, compatibility calculation;
- natal chart, Chinese horoscope, zodiac stones, name profile, numerology, angel numbers, lunar calendar, daily talisman, dream dictionary, gifts, name compatibility, archetype;
- VIP opened, free access, feature taps, future subscription tap, all active VIP detail screens, and functional VIP tool events: `vip_tool_started`, `vip_tool_calculated`, `vip_tool_saved`, `vip_tool_shared`, `vip_input_reused`, and `vip_message_copied`;
- Mystic category, daily card, Tarot, rune, intuitive sign, talismans, aura, lunar ritual, karmic lessons, and Birth Matrix;
- Telegram WebApp ready, BackButton usage, and haptics;
- giveaways locked/preview events.

Allowed events and payload fields live in `lib/zodiac-mini-app-analytics-shared.ts`.

Mini App navigation events follow the current structure:

```text
Home -> Category -> Feature -> Result
```

These navigation events must not include names, birth dates, birth times, city query, raw text inputs, or Telegram initData. Safe fields are limited to values such as `section`, `category`, `featureKey`, `relationshipMode`, and zodiac sign slugs.

Interaction hardening events for repaired CTAs and pair-required flows use only safe routing context: `section`, `category`, `featureKey`, sign slugs, `relationshipMode`, and `scoreTier`. They must not include raw form values or generated result/message text.

The current Home menu has 10 large top-level categories, in order: `Гороскопы`, `Совместимость`, `Ангельские числа`, `Матрица судьбы`, `Нумерология`, `Мистика`, `Таро и руны`, `Луна и ритуалы`, `VIP раздел`, and `Мой профиль`. Angel Numbers must stay visible in the first screen zone. `Розыгрыши` stays inside VIP as locked/preview and is tracked only through giveaway locked events.

Compatibility product structure:

```text
Compatibility -> Pair Setup -> Relationship Map -> 30-Day Couple Calendar -> Actions / Messages / Save / Share
```

Profile, History, and Favorites are local retention features. They use localStorage on the device and store only safe shortcuts/summaries: selected sign slug, first sign slug, second sign slug, section id/label, featureKey, compatibility mode, score tier, and timestamps. They must not store or send names, exact birth dates, birth times, city query, selected city id, raw result text, raw message text, raw dream text, or raw angel number input. VIP tool Save uses the same safe shortcut model. Safe Share sends only generic Mini App text, safe sign-pair labels, and startapp links.

VIP functional tool payloads are limited to safe categorical fields:

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

The VIP events must never include names, birth dates, birth times, birth city/city query, raw angel number input, generated message text, or raw result text.

Share and interaction-hardening events use only safe routing/status fields such as `section`, `category`, `featureKey`, sign slugs, `relationshipMode`, and `scoreTier`. They must not include copied text, raw generated messages, raw angel-number input, names, dates, time, city query, or Telegram initData.

Supported direct profile and compatibility start params:

```text
startapp=profile
startapp=history
startapp=favorites
startapp=compat_love
startapp=compat_reconciliation
```

## Forbidden Data

Do not send or store:

- names or raw name inputs;
- birth dates;
- birth times;
- city query, selected city id, or raw birth city text;
- message text;
- dream text;
- raw angel number input;
- Telegram initData or raw Telegram profile data;
- tokens, chat ids, or secrets.

Allowed personal context is limited to safe aggregates and flags, for example `sign`, `firstSign`, `secondSign`, `hasName`, `hasBirthDate`, `hasBirthTime`, `hasBirthCity`, `scoreTier`, `section`, `category`, `featureKey`, `inputMode`, `goal`, and `tone`.

## Server-Side Safety Model

The client sanitizes payloads before sending, but the API route repeats the allowlist and sanitization server-side. Unknown fields are ignored. Disallowed events return `400 event_not_allowed`. The storage adapter writes only aggregate Redis counters such as events, funnel steps, sections, signs, modes, pairs, and score tiers.

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

Disallowed events are rejected and not stored:

```json
{
  "ok": false,
  "ignored": true,
  "reason": "event_not_allowed"
}
```

## Dashboard

The dashboard shows analytics mode, storage status, setup checklist, tracked/not-tracked data, today opens, last 7 days opens, top sections, top signs, compatibility mode split, VIP activity, giveaways, Mystic-related counters through aggregate events, and funnel metrics.

When storage is missing, panels stay visible with zero values so the activation state is obvious without hiding the dashboard structure.

## Readiness Policy

`noop` storage is a warning/readiness gap, not a fatal error. It means the Mini App can run safely but metrics will not persist.

Fatal readiness failures are:

- sensitive fields added to the analytics payload allowlist;
- tracked events missing from `ZODIAC_ANALYTICS_EVENTS`;
- server-side sanitization removed;
- storage writing raw request bodies or raw unknown fields;
- checks printing configured secret values.

After setting Redis REST env vars and redeploying:

1. Open `/dashboard/networks/zodiac/analytics`.
2. Confirm Analytics mode is active / Redis.
3. Confirm Storage configured is `YES`.
4. Trigger a safe event by opening `/compatibility` and selecting a sign.
5. Refresh the dashboard and confirm aggregate counters move.
6. Confirm no names, birth dates, birth times, birth cities, raw personal inputs, tokens, or raw Telegram initData appear in logs, responses, or stored analytics.
