# Zodiac Channel Packaging

Telegram channels use pinned navigation posts and short descriptions as the entry storefront for the Zodiac Mini App. Source files:

```text
scripts/publish-zodiac-navigation-all.mjs
scripts/zodiac-channel-descriptions.mjs
data/config/zodiac-channel-links.json
data/config/zodiac-channel-descriptions.json
```

## Pin Standard

General channel pin:

```text
🌟 Общий гороскоп

Главный канал ежедневных гороскопов.

Выберите свой знак или откройте Астрологический центр:
✨ гороскопы
💞 совместимость
👼 ангельские числа
🧿 матрица судьбы
🔮 мистика
👑 VIP бесплатно до 17.09.2026
```

Sign channel pin:

```text
♊ Близнецы | Гороскоп

Вы в канале знака Близнецы.

Здесь каждый день:
✨ ежедневный гороскоп
💞 совместимость
🔮 мистика и знаки дня
👼 ангельские числа
🧿 матрица судьбы

Откройте Астрологический центр, чтобы проверить совместимость, матрицу судьбы, ангельские числа и VIP-раздел.
```

## Pin Buttons

All pins include Mini App CTA buttons:

```text
🔮 Открыть Астрологический центр -> startapp=compat
💞 Проверить совместимость / Совместимость -> startapp=compat
👼 Ангельские числа -> startapp=angel_numbers
🧿 Матрица судьбы -> startapp=birth_matrix
👑 VIP бесплатно -> startapp=vip
🔮 Мистика -> startapp=mystic
📅 Прогноз недели -> startapp=week
```

General channel pins include all 12 sign buttons. Sign channel pins include `🌟 Общий гороскоп` plus the other 11 sign buttons; the current sign is intentionally excluded from its own grid.

## Descriptions

General:

```text
Ежедневный гороскоп, совместимость, ангельские числа и Астрологический центр в Telegram Mini App.
```

Sign template:

```text
♊ Близнецы: ежедневный гороскоп, совместимость, ангельские числа, матрица судьбы и Mini App.
```

Descriptions must stay under Telegram's channel description limit and must not include internal/debug wording.

## Commands

Dry-run previews:

```bash
npm run zodiac:navigation:all:dry
npm run zodiac:descriptions:dry
```

Legacy general-only preview:

```bash
npm run zodiac:navigation:dry
```

Live apply/publish only after explicit approval:

```bash
npm run zodiac:navigation:all:publish -- --live --approved --pin
npm run zodiac:descriptions:apply -- --live --approved
```

Dry-runs must show `Telegram API Calls: 0`, `Live Publish Calls: 0`, and `Ledger Writes: 0`. These commands are separate from daily scheduler, weekly scheduler, ledger, and horoscope content generation.

## Safety

- Weekly live schedule remains OFF.
- Daily/weekly post formats are not changed by channel packaging.
- VIP remains free until `2026-09-17`; payments and Telegram Stars remain off.
- Live pin/description changes require separate explicit approval.
