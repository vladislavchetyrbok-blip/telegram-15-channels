# Telegram 15 Channels - Project Status

Дата контрольной точки: 2026-05-22

## Что делает проект

`telegram-15-channels` - локальная Next.js админ-панель для управления сетью из 15 Telegram-каналов. Проект показывает dashboard, каналы, посты, очередь черновиков, календарь публикаций, контент-план, редакционные правила, preflight-проверки, безопасность Telegram, визуалы и логотипы.

Проект работает локально. Telegram по умолчанию заблокирован в safe/dry-run режиме. Массовая отправка и автопостинг не включены.

## Каналы

1. Деньги и возможности - RU
2. AI и технологии - RU
3. Україна: можливості та ринок - UA
4. Мужской стиль и вещи - RU
5. Техника для дома - RU
6. Рыбалка и отдых - RU
7. Дніпро / Город Днепр - RU/UA
8. Авто и комфорт - RU
9. Ідеї для бізнесу - UA
10. Личный прогресс - RU
11. Недвижимость Днепра - RU
12. Нерухомість Дніпра - UA
13. Коммерческая недвижимость - RU
14. Земля и дома / Земля та будинки - RU/UA
15. Инвестиции в недвижимость - RU

## Telegram status

- Telegram bot token читается только из `.env.local` через `TELEGRAM_BOT_TOKEN`.
- Реальный токен не хранится в документации и не должен попадать в git.
- `chat_id` заполнены для всех 15 каналов.
- `botAdded=true` используется для mock/connected status каналов.
- Первый реальный single-channel test уже выполнен только в канал `AI и технологии`.
- Было отправлено ровно 1 сообщение.
- Массовая отправка не использовалась.
- Остальные 14 каналов не трогались.
- После теста проект возвращён в безопасный режим:
  - `TELEGRAM_DRY_RUN=true`
  - `TELEGRAM_REAL_SENDING_ENABLED=false`
- Post-test hard lock включён:
  - `repeatLock=true`
  - `realSendsTotal=1`
  - `productionBroadcast=disabled`

## AI status

- AI provider: `lmstudio`.
- Local API URL: `http://localhost:1234/v1`.
- Проверка LM Studio выполняется через `GET /api/ai/check`.
- Генерация постов подготовлена через OpenAI-compatible endpoint LM Studio.

## Валютная и визуальная политика

- Основная валюта проекта: `UAH`, `грн`, `₴`.
- Разрешены: `UAH`, `USD`, `EUR`, `₴`, `$`, `€`.
- Запрещённая валюта, её символ и код не допускаются в тексте, промптах, тестовых данных, UI и визуалах.
- Currency audit: `GET /api/system/currency-audit`.
- Currency policy: `GET /api/system/currency-policy`.
- Visual policy: `GET /api/system/visual-policy`.
- Модуль логотипов готов, но текущий `GET /api/channel-logos/audit` показывает `missing=15`, потому что файлы логотипов не загружены в реестр проекта. Это warning для визуального блока, не Telegram-риск.

## Текущая контрольная проверка

Безопасные GET-проверки на локальном dev server подтвердили:

- `GET /api/telegram/check-config`: `ok=true`, `dryRun=true`, `realSendingEnabled=false`, `channelsTotal=15`, `channelsWithChatId=15`, `realSendsTotal=1`, `repeatLock=true`, `mode=dry-run`.
- `GET /api/system/preflight`: `ok=true`, `mode=dry-run`, Telegram token найден, все 15 `chat_id` заполнены, LM Studio подключён, CurrencyPolicy ok, real sends total = 1, production locked, single-channel test locked.
- `GET /api/telegram/single-test/status`: `ok=true`, `dryRun=true`, `testMode=locked`, `realSendingAllowed=false`, `realSendsTotal=1`, `realTestLockedAfterSuccess=true`.
- `GET /api/system/currency-audit`: `ok=true`, forbidden currency found = `false`.
- `GET /api/channel-logos/audit`: `missing=15`, `approvedLogos=0`, `rejected=0`, forbidden currency visuals found = `false`.

## Env variables

Пример без настоящего токена:

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

APP_ENV=local
APP_URL=http://localhost:3000
```

## Как запускать

Из корня проекта `G:\telegram-15-channels`:

```powershell
set PATH=G:\telegram-15-channels\.tools\node-v20.18.1-win-x64;%PATH%
.tools\node-v20.18.1-win-x64\npm.cmd run dev
```

Dashboard открывается на:

```text
http://localhost:3000/dashboard
```

## Основные страницы

- `/dashboard` - главный dashboard сети.
- `/network` - пульт сети.
- `/channels` - список каналов.
- `/channels/1` - страница канала.
- `/posts` - список постов.
- `/posts/new` - генерация нового поста.
- `/drafts` - очередь черновиков.
- `/calendar` - календарь публикаций.
- `/content-plan` - контент-план.
- `/editorial` - редакционные правила.
- `/visuals` - визуальная политика.
- `/logos` - логотипы каналов.
- `/settings` - настройки.
- `/preflight` - полный preflight.
- `/telegram-safety` - безопасность Telegram.
- `/production-send` - заблокированный production flow.
- `/single-channel-test` - ручной single-channel test.
- `/telegram-control-test` - контрольный dry-run test.

## Основные endpoints

- `GET /api/telegram/check-config`
- `GET /api/system/preflight`
- `GET /api/telegram/single-test/status`
- `GET /api/ai/check`
- `POST /api/ai/generate`
- `GET /api/network/analytics`
- `GET /api/network/health`
- `POST /api/network/check-all`
- `GET /api/posts/drafts`
- `POST /api/posts/generate-draft`
- `GET /api/schedule`
- `GET /api/content-plan`
- `GET /api/editorial-profiles`
- `GET /api/system/currency-audit`
- `GET /api/system/currency-policy`
- `GET /api/system/visual-policy`
- `GET /api/channel-logos/audit`
- `POST /api/telegram/dry-run-send`
- `POST /api/telegram/single-test/prepare`
- `POST /api/telegram/single-test/confirm`
- `POST /api/telegram/single-test/send-real`

## Safety guarantees after first real test

- `TELEGRAM_DRY_RUN=true`.
- `TELEGRAM_REAL_SENDING_ENABLED=false`.
- `repeatLock=true`.
- `realSendsTotal=1`.
- `productionBroadcast=disabled`.
- Массовая отправка отсутствует.
- Автопостинг в production отсутствует.
- Для следующего реального single-channel test нужно отдельное ручное решение.

## Следующие безопасные шаги

1. Продолжать работу только в dry-run режиме.
2. Проверять `GET /api/system/preflight` перед любыми изменениями Telegram-flow.
3. Не отключать `repeatLock` без отдельного решения.
4. Не включать массовую отправку.
5. Не включать автопостинг.
6. Для следующего реального теста использовать только один канал, одно сообщение и отдельное ручное подтверждение.
