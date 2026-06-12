# Zodiac Network: Manual Telegram Channel Creation Guide

This guide is designed to help you create all 13 required Telegram channels for the Zodiac Network manually.

## Overview

- **Why manual?** The Telegram Bot API cannot create channels automatically. A human user must create them and add the bot as an administrator.
- **Publishing safety:** Real automated publishing remains fully disabled until all channels are connected, their IDs are verified, and a local dry-run simulation is approved.
- **Workflow:** You will create the channels, fill out the tracking table, and return the data. Then we will securely patch the application configuration.

## Full Channel List

You need to create 13 channels. For each channel, use the provided display name and try to secure the primary username. If it is taken, use one of the backup suffixes.

**Important rules for usernames:**
- Use English letters, numbers, and underscores.
- **Do not** use `ru` in the username.
- Recommended backup suffixes: `_daily`, `_pulse`, `_today`, `_astro`, `_cosmic`, `_orbitua`, `_zodiacua`.

### 1. General Horoscope
- **Internal ID:** `zodiac-general`
- **Display Name:** Гороскоп на сегодня ✨
- **Primary Username:** `zodiac_orbit`
- **Emoji:** ✨
- **Description:** Твой ежедневный астрологический компас. Общая энергетика дня, лунные ритмы и важные события на небе. 

### 2. Aries
- **Internal ID:** `aries`
- **Display Name:** Овен ♈️ Гороскоп
- **Primary Username:** `aries_orbit`
- **Emoji:** ♈️
- **Description:** Ежедневный гороскоп для Овнов. Энергия, страсть, победы.

### 3. Taurus
- **Internal ID:** `taurus`
- **Display Name:** Телец ♉️ Гороскоп
- **Primary Username:** `taurus_orbit`
- **Emoji:** ♉️
- **Description:** Ежедневный гороскоп для Тельцов. Стабильность, комфорт, успех.

### 4. Gemini
- **Internal ID:** `gemini`
- **Display Name:** Близнецы ♊️ Гороскоп
- **Primary Username:** `gemini_orbit`
- **Emoji:** ♊️
- **Description:** Ежедневный гороскоп для Близнецов. Общение, идеи, движение.

### 5. Cancer
- **Internal ID:** `cancer`
- **Display Name:** Рак ♋️ Гороскоп
- **Primary Username:** `cancer_orbit`
- **Emoji:** ♋️
- **Description:** Ежедневный гороскоп для Раков. Эмоции, интуиция, забота.

### 6. Leo
- **Internal ID:** `leo`
- **Display Name:** Лев ♌️ Гороскоп
- **Primary Username:** `leo_orbit`
- **Emoji:** ♌️
- **Description:** Ежедневный гороскоп для Львов. Яркость, лидерство, любовь.

### 7. Virgo
- **Internal ID:** `virgo`
- **Display Name:** Дева ♍️ Гороскоп
- **Primary Username:** `virgo_orbit`
- **Emoji:** ♍️
- **Description:** Ежедневный гороскоп для Дев. Порядок, анализ, достижение.

### 8. Libra
- **Internal ID:** `libra`
- **Display Name:** Весы ♎️ Гороскоп
- **Primary Username:** `libra_orbit`
- **Emoji:** ♎️
- **Description:** Ежедневный гороскоп для Весов. Гармония, красота, отношения.

### 9. Scorpio
- **Internal ID:** `scorpio`
- **Display Name:** Скорпион ♏️ Гороскоп
- **Primary Username:** `scorpio_orbit`
- **Emoji:** ♏️
- **Description:** Ежедневный гороскоп для Скорпионов. Сила, трансформация, страсть.

### 10. Sagittarius
- **Internal ID:** `sagittarius`
- **Display Name:** Стрелец ♐️ Гороскоп
- **Primary Username:** `sagittarius_orbit`
- **Emoji:** ♐️
- **Description:** Ежедневный гороскоп для Стрельцов. Свобода, оптимизм, масштаб.

### 11. Capricorn
- **Internal ID:** `capricorn`
- **Display Name:** Козерог ♑️ Гороскоп
- **Primary Username:** `capricorn_orbit`
- **Emoji:** ♑️
- **Description:** Ежедневный гороскоп для Козерогов. Цели, статус, упорство.

### 12. Aquarius
- **Internal ID:** `aquarius`
- **Display Name:** Водолей ♒️ Гороскоп
- **Primary Username:** `aquarius_orbit`
- **Emoji:** ♒️
- **Description:** Ежедневный гороскоп для Водолеев. Инновации, свобода, будущее.

### 13. Pisces
- **Internal ID:** `pisces`
- **Display Name:** Рыбы ♓️ Гороскоп
- **Primary Username:** `pisces_orbit`
- **Emoji:** ♓️
- **Description:** Ежедневный гороскоп для Рыб. Интуиция, творчество, мечты.

---

## Manual Creation Steps

For each channel, follow these steps in the Telegram application:

1. Open Telegram and select **New Channel**.
2. Enter the **Display Name** from the list above.
3. Choose **Public Channel** and enter the chosen username. If taken, try `[sign]_daily`, `[sign]_pulse`, etc.
4. Enter the **Description**.
5. Upload an avatar (generate it via the Visual Kit prompts if needed).
6. Post a short welcome message (pinned if desired).
7. Go to Channel Settings -> **Administrators** -> **Add Admin**.
8. Search for your application Bot and add it as an administrator.
9. Ensure the bot has the right to **Post Messages** (and ideally Edit/Delete its own).
10. Copy the public link and the exact username you managed to secure.

---

## Tracking Table

You can use this markdown table to keep track of your progress while creating the channels:

| Internal ID | Display Name | Chosen Username | Public Link | Bot Admin? | Notes |
|-------------|--------------|-----------------|-------------|------------|-------|
| zodiac-general | Гороскоп на сегодня ✨ | | | [ ] | |
| aries | Овен ♈️ Гороскоп | | | [ ] | |
| taurus | Телец ♉️ Гороскоп | | | [ ] | |
| gemini | Близнецы ♊️ Гороскоп | | | [ ] | |
| cancer | Рак ♋️ Гороскоп | | | [ ] | |
| leo | Лев ♌️ Гороскоп | | | [ ] | |
| virgo | Дева ♍️ Гороскоп | | | [ ] | |
| libra | Весы ♎️ Гороскоп | | | [ ] | |
| scorpio | Скорпион ♏️ Гороскоп | | | [ ] | |
| sagittarius | Стрелец ♐️ Гороскоп | | | [ ] | |
| capricorn | Козерог ♑️ Гороскоп | | | [ ] | |
| aquarius | Водолей ♒️ Гороскоп | | | [ ] | |
| pisces | Рыбы ♓️ Гороскоп | | | [ ] | |

---

## Final JSON Return Template

When you are finished creating all channels, please copy the JSON block below, fill in the actual `actualUsername` and `publicLink` values you secured, and provide it back to the assistant. 

*(Note: `telegramChannelId` is left as `null`. The system will automatically resolve the numeric IDs later during safe connection testing.)*

```json
[
  {
    "id": "zodiac-general",
    "actualUsername": "zodiac_orbit",
    "publicLink": "https://t.me/zodiac_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "aries",
    "actualUsername": "aries_orbit",
    "publicLink": "https://t.me/aries_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "taurus",
    "actualUsername": "taurus_orbit",
    "publicLink": "https://t.me/taurus_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "gemini",
    "actualUsername": "gemini_orbit",
    "publicLink": "https://t.me/gemini_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "cancer",
    "actualUsername": "cancer_orbit",
    "publicLink": "https://t.me/cancer_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "leo",
    "actualUsername": "leo_orbit",
    "publicLink": "https://t.me/leo_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "virgo",
    "actualUsername": "virgo_orbit",
    "publicLink": "https://t.me/virgo_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "libra",
    "actualUsername": "libra_orbit",
    "publicLink": "https://t.me/libra_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "scorpio",
    "actualUsername": "scorpio_orbit",
    "publicLink": "https://t.me/scorpio_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "sagittarius",
    "actualUsername": "sagittarius_orbit",
    "publicLink": "https://t.me/sagittarius_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "capricorn",
    "actualUsername": "capricorn_orbit",
    "publicLink": "https://t.me/capricorn_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "aquarius",
    "actualUsername": "aquarius_orbit",
    "publicLink": "https://t.me/aquarius_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  },
  {
    "id": "pisces",
    "actualUsername": "pisces_orbit",
    "publicLink": "https://t.me/pisces_orbit",
    "telegramChannelId": null,
    "botAdminStatus": "admin_added",
    "creationStatus": "created",
    "publishStatus": "not_ready"
  }
]
```
