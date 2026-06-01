# Telegram 15 Channels

Telegram 15 Channels is a local Next.js admin dashboard for managing a network of 15 Telegram channels. It tracks channels, drafts, post images, publication readiness, local AI generation, Telegram safety checks, and sandbox test publishing.

The project is safety-first: production publishing is locked and bulk publishing is disabled. The isolated test-send flow can send one selected post to one selected channel ID only.

## Run the Project

Use the portable Node.js runtime stored inside the project folder.

PowerShell:

```powershell
cd G:\telegram-15-channels
$env:Path="G:\telegram-15-channels\.tools\node-v20.18.1-win-x64;$env:Path"
.tools\node-v20.18.1-win-x64\npm.cmd run dev
```

Command Prompt:

```bat
cd /d G:\telegram-15-channels
set PATH=G:\telegram-15-channels\.tools\node-v20.18.1-win-x64;%PATH%
.tools\node-v20.18.1-win-x64\npm.cmd run dev
```

Open:

```text
http://localhost:3000/dashboard
```

## Telegram Network

The dashboard visualizes a 15-channel Telegram network:

- Group A: 10 independent channels across AI, money, city, lifestyle, home tech, auto, fishing, business, and personal progress.
- Group B: 5 real-estate channels for Dnipro property, commercial property, land, houses, and real-estate investments.

Each channel has language badges, Telegram username, autoposting status, scheduled posts, editorial profiles, post images, and publication readiness checks. Subscriber statistics are marked as `real`, `manual`, `demo`, or `unknown`, so demo numbers are never shown as real Telegram data.

## Local AI

The AI generation flow is designed to run locally through LM Studio or Ollama-style local model servers. The planned LM Studio endpoint is OpenAI-compatible:

```text
POST http://localhost:1234/v1/chat/completions
```

Prepared code lives in `lib/ai.ts`:

- `getAiProviderConfig()`
- `checkLocalAiConnection()`
- `generatePostWithAI()`

## Enable LM Studio

To use real local AI checks and generation:

1. Open LM Studio.
2. Download or select a local model.
3. Go to Local Server.
4. Click Start Server.
5. Check that the server is available:

```text
http://localhost:1234/v1/models
```

6. In the admin panel, open Settings and click `Проверить LM Studio`.

The app can call:

```text
GET http://localhost:1234/v1/models
POST http://localhost:1234/v1/chat/completions
```

If LM Studio is not running, the UI shows a friendly warning and the page keeps working.

## Telegram Bot API

The production publishing flow uses one main bot in `single_bot` mode, but it remains locked by safety checks. The app does not send to the 15 real Telegram channels unless production unlock conditions are explicitly added later.

Prepared code lives in `lib/telegram.ts`:

- `validateTelegramSettings()`
- `getTelegramBotStatus()`
- `checkTelegramBotConnection()`
- `publishPostToTelegram()`

The isolated test-send flow is separate:

- Endpoint: `POST /api/telegram/test-send`
- Target: one selected `telegramTarget` saved from the Telegram connection UI
- Method: Telegram `sendPhoto`
- Image source: local file from `public/assets/posts/...`, not a `localhost` URL
- Dry-run mode: returns a preview payload and does not call Telegram

This flow does not trigger mass publishing and does not send to the other 14 channels.

Private channels do not need public `@username` values. Open `Telegram подключение`, use `getUpdates` to find `chat.id`, or enter `-100...` manually for a single channel.

Quick test mode is separate from production publishing:

- Endpoint: `POST /api/telegram/quick-test`
- UI: `/telegram-connection` and `/publish-readiness`
- Requires the confirmation dialog in the browser
- Sends at most one ready test post per linked channel
- Skips channels without `telegramTarget`, bot access, ready text, or post image
- Uses Telegram `sendPhoto` with the image file from disk
- Keeps `TELEGRAM_REAL_PUBLISH_ENABLED=false`, `allowRealPublish=false`, schedule and autoposting disabled

## Dry Run Safety

`TELEGRAM_DRY_RUN=true` protects the project from accidental publication. While dry-run is enabled, Telegram test-send returns a preview payload without calling Telegram.

Use `.env.example` as the template for a future `.env.local`:

```text
LOCAL_AI_PROVIDER=lmstudio
LOCAL_AI_BASE_URL=http://localhost:1234/v1
LOCAL_AI_MODEL=local-model
LOCAL_AI_TEMPERATURE=0.7
LOCAL_AI_MAX_TOKENS=800

TELEGRAM_BOT_MODE=single_bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_DRY_RUN=false
TELEGRAM_REAL_PUBLISH_ENABLED=false

APP_ENV=local
APP_URL=http://localhost:3000
```

Do not commit real Telegram tokens. The UI shows only whether the token is configured.

## Checks

```powershell
cd G:\telegram-15-channels
$env:Path="G:\telegram-15-channels\.tools\node-v20.18.1-win-x64;$env:Path"
.tools\node-v20.18.1-win-x64\npx.cmd tsc --noEmit
.tools\node-v20.18.1-win-x64\npm.cmd run build
```
