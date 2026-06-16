# Zodiac Channel Descriptions

The Zodiac network uses short Telegram channel descriptions for branding and navigation. The source of truth is:

```text
data/config/zodiac-channel-descriptions.json
```

## Strategy

- Keep descriptions short enough for Telegram's channel description limit.
- Mention daily horoscope value clearly.
- Point users to the pinned navigation post instead of listing all links in every description.
- Use the same tone across all sign channels.
- Apply descriptions separately from daily publishing, scheduler, ledger, and image workflows.

## General Channel Description

```text
🔮 Общий гороскоп на каждый день.
Навигация по всем 12 знакам — в закреплённом сообщении.
Выберите свой знак и следите за прогнозами каждый день.
```

## Sign Channel Template

```text
<знак> <название> | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.
```

## Final Sign Descriptions

```text
♈ Овен | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♉ Телец | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♊ Близнецы | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♋ Рак | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♌ Лев | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♍ Дева | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♎ Весы | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♏ Скорпион | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♐ Стрелец | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♑ Козерог | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♒ Водолей | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.

♓ Рыбы | ежедневный гороскоп.
Прогноз на день: энергия, любовь, деньги, работа и советы.
Все знаки и общий гороскоп — в закреплённом сообщении.
```

## Commands

Dry-run preview:

```bash
npm run zodiac:descriptions:dry
```

Live apply, only after explicit approval:

```bash
npm run zodiac:descriptions:apply -- --live --approved
```

The live command uses only Telegram `setChatDescription`. It does not publish horoscope posts, write the ledger, alter scheduler state, or modify workflow files.

## Rollback

Rollback is manual: edit the Telegram channel description directly in Telegram, or restore the previous text in `data/config/zodiac-channel-descriptions.json` and re-run the approved live apply command.

## Safety Notes

- Dry-run requires no Telegram token and makes 0 API calls.
- Live mode requires `--live --approved`.
- Token and channel IDs are never printed.
- Daily publish logic remains separate.
