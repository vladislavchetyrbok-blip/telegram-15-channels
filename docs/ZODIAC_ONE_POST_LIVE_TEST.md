# Zodiac One-Post Live Test

This runbook covers the first guarded live Telegram publish for the Zodiac network.

## Prerequisites

- `npm run build`, `npm run lint`, `npm run zodiac:assets:validate`, and both zodiac healthchecks pass.
- `npm run zodiac:connections:check` passes.
- `.env.local` exists locally and is never committed.
- `.env.local` contains `TELEGRAM_BOT_TOKEN`.
- `.env.local` contains `ZODIAC_GENERAL_CHANNEL_ID` for the first test channel.
- The Telegram bot is an administrator of the target channel and can post messages.
- The resolved asset exists, for example `public/assets/zodiac/daily/daily-zodiac-general.jpg`.

## Dry-Run

Run the single-channel dry-run first:

```bash
npm run zodiac:pipeline -- --days 1 --style luxury-mystic --channel zodiac-general --limit 1
```

Expected result:

- `Dry-run: passed`
- `Real publish: disabled`
- `Telegram calls: 0`
- one generated post
- one resolved visual asset path
- for long posts, the dry-run plan says it would send a photo with a short caption and then a full text message

## Guarded One-Post Live Command

Run this only after the dry-run and connection check pass:

```bash
npm run zodiac:pipeline -- --days 1 --style luxury-mystic --channel zodiac-general --limit 1 --live
```

The live guard requires both `--channel <id>` and `--limit 1`. Any live command without those arguments is blocked before sending.

Long posts are sent as one controlled live test unit:

- if the text fits safely in a Telegram photo caption, the pipeline sends `sendPhoto` with the full caption;
- if the text is longer than the safe caption limit, the pipeline sends `sendPhoto` with a short dated caption and then `sendMessage` with the full horoscope text;
- if no image is available, the pipeline sends the horoscope text with `sendMessage`.

## Verification

After a live send:

1. Open the target Telegram channel manually.
2. Confirm the post appears only in the requested channel.
3. Confirm it has the resolved zodiac image.
4. For long posts, confirm the image has a short dated caption and the next message contains the full horoscope text.
5. Confirm the text starts with the dated horoscope header.
6. Record the printed `message_id` values if needed.

## Avoiding All-Channel Publishing

- Do not run `--live` without `--channel`.
- Do not run `--live` without `--limit 1`.
- Do not set `TELEGRAM_LIVE_PUBLISH=true` for normal local dry-runs.
- Do not add automation or cron live publishing until the one-post test is verified.
