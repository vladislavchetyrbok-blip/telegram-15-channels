# Package 209 — Telegram WebView / StartApp Route Diagnostics

Статус: завершён локально после QA.

## Scope

Package 209 добавляет диагностику Telegram WebView и startapp routes:

- `lib/zodiac/aphrodite-telegram-webview-startapp-diagnostics.ts`
- `app/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics/page.tsx`
- `scripts/qa-aphrodite-telegram-webview-startapp-diagnostics.mjs`
- `docs/aphrodite-telegram-webview-startapp-diagnostics.md`

Также обновлены:

- `app/dashboard/networks/zodiac/page.tsx`
- `app/dashboard/networks/zodiac/real-device-visual-qa-checklist/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`

## Покрытие

- default Mini App open
- startapp `love_reading`
- startapp `compatibility`
- startapp `birth_matrix`
- startapp `daily`
- startapp `weekly`
- startapp `monthly`
- fallback route
- stale Telegram WebView cache
- wrong route symptoms
- version marker check
- cache-buster query check
- iOS Telegram WebView behavior
- Android Telegram WebView behavior
- Telegram Desktop behavior
- browser fallback behavior

## Safety

- Production launch done: Нет
- Telegram API used: Нет
- Messages sent: Нет
- BotFather changed: Нет
- Active CTA logic changed: Нет
- DB write added: Нет
- Payment added: Нет
- VIP unlock added: Нет
- Cron/workflows/publish scripts changed: Нет

## QA

```powershell
node --experimental-strip-types scripts/qa-aphrodite-telegram-webview-startapp-diagnostics.mjs
npx tsc --noEmit -p tsconfig.json
node --check scripts/qa-zodiac-dashboard.mjs
npm run build
npm run zodiac:dashboard:qa
npm run production:safety:check
```

## Следующий пакет

Package 210 — Live Version & Cache Marker Readiness.

Package 210 не начат.
