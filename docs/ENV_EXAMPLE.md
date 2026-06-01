# Env Example

Пример `.env.local` без настоящего Telegram token.

Никогда не вставляй настоящий token в документацию.

```env
LOCAL_AI_PROVIDER=lmstudio
LOCAL_AI_BASE_URL=http://localhost:1234/v1
LOCAL_AI_MODEL=local-model
LOCAL_AI_TEMPERATURE=0.7
LOCAL_AI_MAX_TOKENS=800

TELEGRAM_BOT_MODE=single_bot
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_DRY_RUN=true
TELEGRAM_REAL_SENDING_ENABLED=false

AUTOPUBLISH_ENABLED=false
AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL=1
AUTOPUBLISH_MAX_POSTS_PER_DAY=15
AUTOPUBLISH_TIME_START=09:00
AUTOPUBLISH_TIME_END=21:00
AUTOPUBLISH_TIMEZONE=Europe/Kyiv

APP_ENV=local
APP_URL=http://localhost:3000
```

Safe defaults:

- `TELEGRAM_DRY_RUN=true`
- `TELEGRAM_REAL_SENDING_ENABLED=false`
- настоящий `TELEGRAM_BOT_TOKEN` хранится только в `.env.local`
- `.env.local` должен быть исключён из git
