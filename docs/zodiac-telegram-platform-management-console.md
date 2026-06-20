# Zodiac Telegram Platform Management Console

Package 59 | 2026-06-20

This document describes the owner-facing Telegram Platform dashboard for the Zodiac network. It is an admin console and runbook index, not a live publisher.

## Dashboard Navigation

Main routes:

| Label | Route | Purpose |
|---|---|---|
| Обзор | `/dashboard/networks/zodiac` | Owner overview for platform status and next actions |
| Каналы | `/dashboard/networks/zodiac/channels` | 13-channel management table and safe new-channel draft builder |
| Mini App | `/compatibility` | User-facing Mini App route |
| Публикации | `/publishing-center` | Publishing center and schedule review |
| Аналитика | `/dashboard/networks/zodiac/analytics` | Privacy-safe Mini App analytics and first-users funnel |
| Soft Launch | `/dashboard/networks/zodiac/operations` | First 5 users GO / mass launch STOP status |
| Безопасность | `/dashboard/networks/zodiac/operations#safety` | Ledger, weekly live, payments, profile sync, exact astro guardrails |
| Документы | `/dashboard/networks/zodiac/docs` | Runbook and project doc paths |

## Channel Management Page

Route:

```text
/dashboard/networks/zodiac/channels
```

The page shows the current 13-channel Zodiac network with:

- sign/topic name;
- slug;
- language;
- Telegram channel handle/URL when available;
- Mini App `startapp` link;
- navigation status;
- description status;
- daily publishing status;
- analytics status;
- risk/status badge.

The action cards are safe by design. Navigation and descriptions are shown as command hints only:

```bash
npm run zodiac:navigation:all:dry
npm run zodiac:descriptions:dry
```

The UI does not call Telegram live APIs and does not write to the ledger.

## New Channel Draft Builder

The builder on `/dashboard/networks/zodiac/channels` is local-only because there is no authenticated admin write backend for channel registry changes.

Safety model:

- no server-side write API;
- draft stored in browser `localStorage`;
- no token, Redis, Telegram bot token, or secret fields;
- generated output is a config snippet and checklist for a later manual commit.

Fields:

- Channel title;
- Slug;
- Language: `RU` / `UA` / `EN`;
- Category/topic;
- Telegram handle or URL;
- Emoji/icon;
- Description;
- Mini App `startapp` parameter;
- Publishing cadence: `daily` / `weekly` / `manual`;
- Status: `draft` / `ready` / `active`;
- Notes.

Validation:

- slug is required;
- slug must be lowercase/url-safe;
- slug must not duplicate an existing channel;
- language must be selected;
- Telegram handle/URL must look like `@channel_name` or `https://t.me/channel_name`;
- `startapp` must be a safe short token;
- no secret fields are present.

## Convert Draft Into Real Config

Manual path after approval:

1. Create Telegram channel.
2. Add bot/admin.
3. Add channel to registry.
4. Run navigation dry-run.
5. Run description dry-run.
6. Run publishing dry-run.
7. Approve live manually.

No generated draft is automatically committed or published.

## Live Publish Rules

Allowed from dashboard:

- read state;
- open docs;
- open analytics;
- open Mini App;
- copy local draft output;
- copy dry-run command hints.

Not allowed from dashboard:

- live Telegram navigation publish;
- live channel description publish;
- ledger mutation;
- weekly live enablement;
- payments or Telegram Stars enablement;
- profile sync enablement;
- exact astro claims.

## Safety Limits

Current operational flags:

| Item | Status |
|---|---|
| Daily autopublish | ON / safe |
| Weekly live | OFF |
| Ledger | protected |
| Analytics | Redis active in production |
| Profile sync | OFF |
| Payments / Stars | OFF |
| Exact astro | `exact_unavailable`, symbolic only |
| First 5 users | GO |
| Mass launch | STOP |

Next safe steps:

1. Invite first 5 users.
2. Watch analytics funnel.
3. Collect feedback.
4. Fix P0/P1.
5. Only then consider 20 users.
