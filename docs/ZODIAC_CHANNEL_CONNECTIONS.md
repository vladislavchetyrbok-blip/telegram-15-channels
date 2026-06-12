# Zodiac Network: Channel Connections Workflow

This document explains the manual workflow required to connect your newly created Zodiac channels to the SENATE platform.

## Setup Steps

**Step 1: Create Telegram channel manually.**
Using your Telegram client, create a new public channel.

**Step 2: Use recommended name and username from launch kit.**
Set the channel name and username according to `docs/ZODIAC_CHANNEL_LAUNCH_KIT.md`. Do not include "ru" in the username.

**Step 3: Add avatar and description.**
Generate the avatar and upload it. Set the channel description and pin the first welcome message.

**Step 4: Add bot as admin.**
Add the publishing bot (e.g. `@senate_publisher_bot` or your configured bot) to the channel as an Administrator with rights to Post Messages.

**Step 5: Send the final info back for config update.**
Fill out the table below for each channel and provide it back to the system so `data/zodiacChannelConnections.ts` can be updated safely.

**Step 6: Dry-Run Check.**
Only after all 13 channels are connected and the config is updated, run a dry-run check:
`npm run publish:due:json:dry`
Check the logs to ensure all IDs resolve properly.

**Step 7: Real Publish.**
Do not run real publish (`npm run publish:due:json`) until the dry-run is perfectly clean and approved.

---

## Connection Table Template

Please fill in the missing fields (actualUsername, publicLink, channelId) once the channels are created.

| ID | Display Name | Username (Actual) | Public Link | Bot Admin Added? | Channel ID | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| `zodiac-general` | Гороскоп на сегодня ✨ | | | [ ] | | |
| `aries` | Овен ♈️ Гороскоп | | | [ ] | | |
| `taurus` | Телец ♉️ Гороскоп | | | [ ] | | |
| `gemini` | Близнецы ♊️ Гороскоп | | | [ ] | | |
| `cancer` | Рак ♋️ Гороскоп | | | [ ] | | |
| `leo` | Лев ♌️ Гороскоп | | | [ ] | | |
| `virgo` | Дева ♍️ Гороскоп | | | [ ] | | |
| `libra` | Весы ♎️ Гороскоп | | | [ ] | | |
| `scorpio` | Скорпион ♏️ Гороскоп | | | [ ] | | |
| `sagittarius` | Стрелец ♐️ Гороскоп | | | [ ] | | |
| `capricorn` | Козерог ♑️ Гороскоп | | | [ ] | | |
| `aquarius` | Водолей ♒️ Гороскоп | | | [ ] | | |
| `pisces` | Рыбы ♓️ Гороскоп | | | [ ] | | |
