# Safe Runbook

Этот runbook фиксирует безопасный порядок работы с проектом после первого успешного real single-channel test.

## Базовое правило

По умолчанию проект должен работать так:

```env
TELEGRAM_DRY_RUN=true
TELEGRAM_REAL_SENDING_ENABLED=false
```

Реальная массовая отправка и автопостинг запрещены. Любой Telegram-flow должен проходить safety checks.

## Запуск проекта

Открой PowerShell в `G:\telegram-15-channels` и выполни:

```powershell
set PATH=G:\telegram-15-channels\.tools\node-v20.18.1-win-x64;%PATH%
.tools\node-v20.18.1-win-x64\npm.cmd run dev
```

Открыть dashboard:

```text
http://localhost:3000/dashboard
```

## Проверка Telegram config

Безопасная проверка:

```text
GET http://localhost:3000/api/telegram/check-config
```

Ожидаемые значения после контрольного теста:

```json
{
  "dryRun": true,
  "realSendingEnabled": false,
  "channelsTotal": 15,
  "channelsWithChatId": 15,
  "realSendsTotal": 1,
  "repeatLock": true
}
```

## Проверка LM Studio

1. Открыть LM Studio.
2. Выбрать модель.
3. Перейти в Local Server.
4. Нажать Start Server.
5. Проверить:

```text
GET http://localhost:3000/api/ai/check
```

LM Studio endpoint:

```text
http://localhost:1234/v1
```

## Проверка preflight

```text
GET http://localhost:3000/api/system/preflight
```

Страница:

```text
http://localhost:3000/preflight
```

Preflight должен показывать:

- Telegram dry-run active.
- Real sending disabled.
- Channels total: 15.
- Channels with chat_id: 15.
- Real sends total: 1.
- Repeat lock: true.
- Production broadcast disabled.
- Currency policy ok.
- Visual policy ok.
- No mass sending.

## Dry-run отправка

Использовать только dry-run endpoints и UI:

- `/telegram-control-test`
- `/single-channel-test`
- `POST /api/telegram/dry-run-send`
- `POST /api/telegram/control-test/dry-run-send`

Dry-run не вызывает реальный Telegram `sendMessage`.

## Single-channel test

Страница:

```text
http://localhost:3000/single-channel-test
```

Сейчас после первого успешного теста включён hard lock:

- `repeatLock=true`
- `realSendsTotal=1`
- повторная реальная отправка заблокирована

Для следующего реального single-channel test нужно отдельное ручное решение. Нельзя просто повторно нажать кнопку и отправить сообщение.

## Как не включить случайно массовую отправку

Не делать:

- не менять `TELEGRAM_DRY_RUN=true` без отдельного решения;
- не менять `TELEGRAM_REAL_SENDING_ENABLED=false` без отдельного решения;
- не отключать `repeatLock`;
- не добавлять broadcast endpoint;
- не запускать автопостинг;
- не связывать single-channel test с календарём или очередью;
- не вызывать production send без `validateTelegramSendSafety()`;
- не отправлять в несколько channelId за один запрос.

## Что нельзя трогать без отдельного решения

- `TELEGRAM_DRY_RUN`
- `TELEGRAM_REAL_SENDING_ENABLED`
- `repeatLock`
- `maxMessagesPerTest`
- production-flow
- любые функции реального `sendMessage`
- массовая отправка в 15 каналов
- автопостинг по расписанию

## Валютная политика

Запрещённая валюта, её символ и код не допускаются в UI, промптах, тестах, черновиках, визуалах и документации. Для Украины использовать `UAH`, `грн`, `₴`; для международных примеров - `USD`/`EUR`.

Проверка:

```text
GET http://localhost:3000/api/system/currency-audit
```

## Перед любым следующим реальным тестом

1. Запустить full preflight.
2. Убедиться, что выбран ровно один канал.
3. Убедиться, что текст проходит CurrencyPolicy и editorial validation.
4. Убедиться, что нет массовой отправки.
5. Получить отдельное ручное разрешение.
6. После теста снова вернуть:

```env
TELEGRAM_DRY_RUN=true
TELEGRAM_REAL_SENDING_ENABLED=false
```
