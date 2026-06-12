# Zodiac Telegram Connections Runbook

This guide explains how to properly configure the Telegram Bot and channel IDs for the Zodiac automated publishing pipeline.

## 1. Telegram Bot Setup

1. Open Telegram and talk to [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts to create a bot (e.g. `ZodiacPublisherBot`).
3. BotFather will provide an HTTP API Token (e.g. `123456789:ABCDefGhiJkL...`).
4. **DO NOT** share this token. **DO NOT** commit it to git.

## 2. Channel Configuration

The system requires 13 distinct channels (one general + 12 signs).

1. For each channel, open the Channel Settings > Administrators.
2. Add your new Bot as an Administrator.
3. The required bot permissions are:
   - Post Messages
   - Edit Messages of Others (optional but recommended for updates)
   - Delete Messages of Others (optional but recommended for cleanup)
4. Obtain the Channel ID or Username:
   - If the channel is public, you can use the `@username` (e.g., `@zodiac_general_orbit`).
   - If the channel is private, you need the numeric ID (e.g., `-1001234567890`).
     *Tip: Forward a message to `@userinfobot` or use Telegram web to find the `-100...` ID.*

## 3. Environment Variables

Create or open `.env.local` in the project root. **Never commit this file.** Add the following values:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCDefGhiJkL...

ZODIAC_GENERAL_CHANNEL_ID=@your_zodiac_general
ZODIAC_ARIES_CHANNEL_ID=@your_aries_channel
ZODIAC_TAURUS_CHANNEL_ID=@your_taurus_channel
ZODIAC_GEMINI_CHANNEL_ID=@your_gemini_channel
ZODIAC_CANCER_CHANNEL_ID=@your_cancer_channel
ZODIAC_LEO_CHANNEL_ID=@your_leo_channel
ZODIAC_VIRGO_CHANNEL_ID=@your_virgo_channel
ZODIAC_LIBRA_CHANNEL_ID=@your_libra_channel
ZODIAC_SCORPIO_CHANNEL_ID=@your_scorpio_channel
ZODIAC_SAGITTARIUS_CHANNEL_ID=@your_sagittarius_channel
ZODIAC_CAPRICORN_CHANNEL_ID=@your_capricorn_channel
ZODIAC_AQUARIUS_CHANNEL_ID=@your_aquarius_channel
ZODIAC_PISCES_CHANNEL_ID=@your_pisces_channel
```

## 4. Connection Checks

To verify your configuration without sending any messages, run:

```bash
npm run zodiac:connections:check
```

This script will verify that the token exists and that all 13 channel IDs are provided in the environment.

## 5. Dry-Run Configuration

To perform a dry-run for a single channel (e.g., generating only 1 post for testing the pipeline):

```bash
npm run zodiac:pipeline -- --start-date 2026-06-13 --days 1 --style luxury-mystic --channel zodiac-general --limit 1
```

## 6. One-Post Live Test

Once dry-run succeeds, you can run a safe one-channel live publish test. 
**Note:** Live publishing is completely blocked unless explicitly requested.

```bash
npm run zodiac:pipeline -- --start-date 2026-06-13 --days 1 --style luxury-mystic --channel zodiac-general --limit 1 --live
```

## 7. Preventing Accidental Mass-Publishing

- Never use `--live` without `--channel` and `--limit 1` until you are ready for full automation.
- Do not add daily automation cron jobs until a successful single-post live test is complete.
