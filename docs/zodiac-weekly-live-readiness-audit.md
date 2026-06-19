# Zodiac Weekly Live Readiness Audit

Status: `NOT READY to enable weekly live now`

Weekly lane status: `dry-run ready / live OFF`

Audit date: 2026-06-19

## Scope

This audit checks whether the weekly Zodiac publisher is prepared for a future controlled live launch. It does not enable weekly live publishing, does not run weekly live publishing, does not run daily live publishing, and does not edit ledgers manually.

## Current Decision

Do not enable weekly live now.

Reason:

1. Weekly dry-runs and assets are ready.
2. Weekly ledger protection is namespaced and present.
3. No weekly cron live schedule is enabled.
4. Real phone Telegram WebView pass is still manual-required.
5. Daily should be observed for several stable post-cron days after the scheduler timing shift.
6. First weekly live should be a controlled manual run with explicit approval, not a cron.

## Commands Run

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git status -sb
git log --oneline -25

npm run zodiac:weekly-assets:validate
npm run zodiac:weekly:dry -- --week 2026-W25
npm run zodiac:weekly:dry -- --week 2026-W26
npm run zodiac:weekly:ledger:check
```

## Assets

Result:

```text
Expected images: 91
Found images   : 91
Missing images : 0
Tracker entries: 91/91
```

All 13 weekly channels have `7/7` visual assets.

## Weekly Dry-Run Results

### 2026-W25

```text
Period               : 2026-06-15 -> 2026-06-21
Week Range           : 15.06-21.06.2026
Expected             : 13
Would Publish        : 13
Weekly Range Lines   : 13/13
CTA Rows Checked     : 13/13
CTA Rows OK          : 13/13
Content Errors       : 0
Image Posts          : 13
Ledger Writes        : 0
Live Publish Calls   : 0
Telegram API Calls   : 0
```

### 2026-W26

```text
Period               : 2026-06-22 -> 2026-06-28
Week Range           : 22.06-28.06.2026
Expected             : 13
Would Publish        : 13
Weekly Range Lines   : 13/13
CTA Rows Checked     : 13/13
CTA Rows OK          : 13/13
Content Errors       : 0
Image Posts          : 13
Ledger Writes        : 0
Live Publish Calls   : 0
Telegram API Calls   : 0
```

## Content Quality Spot Check

Spot-checked generated posts for:

- `zodiac-general`
- `aries`
- `gemini`
- `scorpio`

Result:

- first line includes explicit weekly range;
- text length is above weekly minimum;
- image mode is enabled;
- required weekly blocks are present through `validateWeeklyPostQuality`;
- CTA buttons are present;
- no `TODO`, `lorem ipsum`, or `placeholder`;
- no content quality errors.

Example headers:

```html
<b>✨ Общий гороскоп на неделю 22.06–28.06.2026</b>
<b>♈ Овен | Гороскоп на неделю 22.06–28.06.2026</b>
<b>♊ Близнецы | Гороскоп на неделю 22.06–28.06.2026</b>
```

## CTA / Channel Mapping

Each weekly post has:

- `📅 Прогноз недели`
- `💞 Совместимость`

Each weekly post has `14` inline buttons in dry-run.

Channel mapping:

- general channel includes all 12 sign links;
- sign channels include the general channel link;
- sign channels include 11 other signs and exclude their own self-link;
- all button URLs are valid Telegram `https://t.me/...` links;
- no Telegram API calls are made in dry-run.

## Ledger Protection

Weekly ledger path:

```text
data/state/zodiac-weekly-publish-ledger.json
```

Current ledger status:

```text
Total Entries : 0
Sent Count    : 0
Pending Count : 0
Failed Count  : 0
Problems      : 0
```

Protection model:

- weekly ledger is separate from daily ledger;
- weekly keys are namespaced by `week:slug`;
- protected statuses are `pending`, `locked`, `in_progress`, `publishing`, `sent`, and `published`;
- dry-run reads ledger but does not write it;
- duplicate/protected entries are skipped before live Telegram sends;
- live mode marks `locked` before sending and `sent` after successful publish.

## Workflow / Schedule

Workflow files currently present:

```text
.github/workflows/publish-scheduler.yml
.github/workflows/zodiac-scheduler.yml
```

There is no weekly live GitHub Actions cron workflow.

Package scripts:

```text
npm run zodiac:weekly:dry
npm run zodiac:weekly:publish
npm run zodiac:weekly:ledger:check
```

Safety:

- `zodiac:weekly:dry` always passes `--dry-run`;
- `publish-zodiac-weekly-by-week.mjs` defaults to dry-run if neither `--dry-run` nor `--live` is supplied;
- live mode requires both `--live` and `--approved`;
- no weekly schedule should be enabled until a separate explicit approval package.

## Conditions Before Future Weekly Live

All of these must be true before enabling weekly live:

1. Daily publishing is stable for several consecutive days after the scheduler timing shift.
2. Real phone Telegram WebView pass is completed and no blocking Mini App issues remain.
3. Weekly dry-run passes for at least two consecutive target weeks.
4. Weekly ledger protection is confirmed, including duplicate-block behavior.
5. User gives explicit approval for weekly live.
6. First weekly live is a controlled manual run, not a cron.
7. After first live, run weekly ledger check and a dry-run for the same week to confirm duplicate-block behavior.

## Controlled First Live Plan

When all conditions are satisfied and the user explicitly approves:

1. Run `npm run zodiac:weekly-assets:validate`.
2. Run `npm run zodiac:weekly:dry -- --week YYYY-Www`.
3. Run `npm run zodiac:weekly:ledger:check`.
4. Confirm `Would Publish 13`, `Content Errors 0`, `Telegram API Calls 0`, and `Ledger Writes 0`.
5. Confirm no sent/protected entries exist for that `week:slug` set.
6. Run one controlled live command only after approval.
7. Run `npm run zodiac:weekly:ledger:check`.
8. Run `npm run zodiac:weekly:dry -- --week YYYY-Www` and verify duplicate-block behavior.
9. Only after a successful controlled live should cron scheduling be discussed.

## Rollback / Recovery Plan

If the first controlled weekly live has a problem:

- do not start another live run immediately;
- inspect weekly ledger entries for the target week;
- inspect Telegram channel state manually;
- if some posts are sent and some failed, do not delete or edit ledger manually without a specific recovery plan;
- use ledger status to avoid duplicate sends;
- keep weekly cron OFF until the issue is resolved;
- document exact failed slugs, Telegram errors, and message IDs.

## Recommendation

Enable weekly live now: `NO`

Weekly lane is prepared for a future controlled live trial, but product/ops gates are still open: real phone WebView pass and several stable daily runs after the cron timing shift.
