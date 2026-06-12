# Zodiac Connection Update Tool

This document explains how to use the local Node tool (`scripts/prepare-zodiac-connections.mjs`) to safely validate and update channel connection configurations.

## Purpose
After creating 13 manual Telegram channels, you collect their `actualUsername` and `publicLink` values in a JSON payload. This tool validates that payload, ensures no required IDs are missing, checks safety constraints (like banning the "ru" suffix), and generates a safe patch preview. It can also apply the changes.

## JSON Template
You must provide a JSON file containing an array of exactly 13 objects. Use the template provided:
`templates/zodiac-channel-connections-input.example.json`

## Safety Rules
> [!WARNING]
> **This tool does NOT publish.**
> **It does NOT touch `data/runtime`.**
> **It does not mark channels as `publish_ready` automatically.** 
> **`telegramChannelId` can remain `null`, but `publishStatus` will be forced to `not_ready` until it is resolved.**

You cannot apply the default template directly; it will be rejected by the tool. You must use a copy populated with real channel values.

## Preview Mode
Always run the tool in preview mode first to see what it will do.

```bash
# Preview using the example template:
npm run zodiac:prepare-connections -- ./templates/zodiac-channel-connections-input.example.json

# Preview using your real data:
npm run zodiac:prepare-connections -- ./exports/my-real-zodiac-connections.json
```
Check `exports/zodiac-connections-patch-preview.md` to see the validation result.

## Apply Mode
Once the preview validates your input successfully, you can apply the patch. A backup of the old `data/zodiacChannelConnections.ts` will be created in `exports/` before the changes are applied.

**Required flags:** `--apply --confirm-apply`

```bash
npm run zodiac:prepare-connections -- ./exports/my-real-zodiac-connections.json --apply --confirm-apply
```

This will safely patch `data/zodiacChannelConnections.ts` with the new usernames and links. No real Telegram calls will be made, and real publishing remains disabled.
