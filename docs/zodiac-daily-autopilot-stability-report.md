# Zodiac Daily Autopilot Stability Report

Date: 2026-06-20
Scope: daily scheduler timing and duplicate-safety report only.

This report is read-only. It does not authorize live publish, weekly live,
payments, Telegram Stars, profile sync, exact astrology claims, or manual ledger
edits.

## Old Cron Schedule

Before timing hardening, the daily workflow used common GitHub Actions congestion
minutes:

```text
0 6 * * *
30 6 * * *
0 7 * * *
30 7 * * *
0 8 * * *
```

The 2026-06-19 automation eventually succeeded, but arrived late around
`13:36 Kyiv`, with sent ledger entries around `10:46-10:47 UTC`
(`13:46-13:47 Kyiv`).

## Current Cron Schedule

Current staggered UTC attempts:

```text
7 6 * * *
19 6 * * *
37 6 * * *
52 6 * * *
11 7 * * *
```

Why:

- avoids common `:00` and `:30` congestion minutes;
- keeps multiple backup attempts in the Kyiv morning window;
- stays safe because ledger/dedupe blocks repeated runs before Telegram API
  calls.

## 2026-06-19 Result

Read-only checks:

```bash
npm run zodiac:workflow:check -- --date 2026-06-19
npm run zodiac:publish-date:dry -- --date 2026-06-19
```

Result:

- Sent count: `13/13`.
- Failed: `0`.
- Pending: `0`.
- Missing: `0`.
- Already Sent: `13`.
- Duplicate Blocked: `13`.
- Would Publish: `0`.
- Telegram API calls in dry-run: `0`.
- Ledger writes in dry-run: `0`.
- Manual live needed: NO.

Duplicate protection status: PASS. Dry-run sees sent ledger entries and skips
all 13 posts before Telegram calls.

## 2026-06-20 Dry-Run Status

Read-only checks:

```bash
npm run zodiac:workflow:check -- --date 2026-06-20
npm run zodiac:publish-date:dry -- --date 2026-06-20
```

Result at this checkpoint:

- Sent count: `0/13`.
- Missing: `13/13`.
- Would Publish: `13/13`.
- Already Sent: `0`.
- Duplicate Blocked: `0`.
- CTA rows checked: `13/13`.
- CTA rows OK: `13/13`.
- Telegram API calls in dry-run: `0`.
- Ledger writes in dry-run: `0`.
- Live publish calls: `0`.

This is expected before the scheduled 2026-06-20 cron window completes.

## Manual Live Rules

Never start manual live before post-cron read-only checks.

Manual live requires explicit user approval and all of:

- dry-run shows `Would Publish 13`;
- dry-run shows `Already Sent 0`;
- dry-run shows `Duplicate Blocked 0`;
- ledger has no `sent` entries for the target date;
- no GitHub Actions run is currently in progress for the target date;
- target date is explicit and follows Europe/Kyiv calendar policy.

Manual live is forbidden if dry-run/report shows:

- `Already Sent 13`;
- `Duplicate Blocked 13`;
- any `sent` ledger entries for the date;
- corrupted ledger;
- duplicate risk;
- workflow run still in progress.

## Stop Rules

Stop and investigate if any of these appear:

- failed ledger safety check;
- corrupted ledger;
- duplicate risk;
- Telegram API error;
- missing assets;
- failed preflight;
- failed content generation;
- unexpected workflow cron or workflow name change.

## Recommended Daily Monitoring

After each cron window:

```bash
npm run zodiac:workflow:check -- --date YYYY-MM-DD
npm run zodiac:publish-date:dry -- --date YYYY-MM-DD
npm run production:safety:check
```

Expected after successful autopublish:

- `sent=13/13`;
- `failed=0`;
- `pending=0`;
- `missing=0`;
- `Already Sent 13`;
- `Duplicate Blocked 13`;
- `Telegram API Calls 0` in dry-run;
- `Ledger Writes 0` in dry-run.

## Current Decision

- Daily autopilot: ON.
- Timing hardening: active.
- Duplicate protection: PASS.
- Manual live for 2026-06-19: NO.
- Manual live for 2026-06-20: NO at this checkpoint; wait for scheduled cron
  and perform post-cron checks.
- Weekly live: OFF.
- Payments/Stars: OFF.
