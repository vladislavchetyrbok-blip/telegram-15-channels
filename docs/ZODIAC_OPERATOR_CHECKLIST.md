# Zodiac Network: Operator Checklist

A quick one-page checklist for the operator preparing the Zodiac Network launch.

## Before creating channels
- [ ] Read `ZODIAC_MANUAL_CHANNEL_CREATION.md`
- [ ] Prepare Telegram client (Mobile or Desktop)
- [ ] Confirm no `.env` or `data/runtime` modifications are staged in git

## While creating channels
- [ ] Create 13 channels using exact Display Names
- [ ] Secure usernames (or use backups like `_daily`)
- [ ] Set descriptions and avatars
- [ ] Publish a pinned welcome message
- [ ] Add the Application Bot as an Administrator to each channel

## After creating channels
- [ ] Fill out the JSON connection data template with actual usernames and public links
- [ ] Keep `telegramChannelId` as `null`
- [ ] Run `npm run zodiac:prepare-connections` (preview mode)
- [ ] Review the patch preview in `exports/`
- [ ] Run `npm run zodiac:prepare-connections` with `--apply --confirm-apply`
- [ ] Verify `data/zodiacChannelConnections.ts` was updated correctly via `git diff`

## Before dry-run
- [ ] Run `npm run zodiac:pipeline` or manually run generate, validate, and review.
- [ ] Ensure `publishStatus` in config is still `not_ready`.
- [ ] Ensure `botAdminStatus` is `admin_added`.

## Before future real publish
- [ ] Run `npm run zodiac:dry-run` and confirm successful completion.
- [ ] Run `npm run zodiac:healthcheck -- --full`
- [ ] Request explicitly to build the real publish script phase. (Currently unavailable).
- [ ] Wait for final user approval before any real Telegram messages are dispatched.
