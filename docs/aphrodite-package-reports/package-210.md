# Package 210 — Live Version & Cache Marker Readiness

Статус: завершён локально после QA.

## Scope

Package 210 добавляет readiness слой для live version/cache marker проверки:

- `lib/zodiac/aphrodite-live-version-cache-marker-readiness.ts`
- `app/dashboard/networks/zodiac/live-version-cache-marker-readiness/page.tsx`
- `scripts/qa-aphrodite-live-version-cache-marker-readiness.mjs`
- `docs/aphrodite-live-version-cache-marker-readiness.md`

Также обновлены:

- `app/dashboard/networks/zodiac/page.tsx`
- `app/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`

## Покрытие

- source commit marker
- live HTML marker
- route-specific marker
- /miniapp marker/check documented
- /birth-matrix marker/check documented
- /compatibility marker/check documented
- Telegram WebView cache diagnosis
- browser cache-buster diagnosis
- Vercel deployment check notes
- stale build symptoms

## Safety

- Production launch done: Нет
- Deploy settings changed: Нет
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
node --experimental-strip-types scripts/qa-aphrodite-live-version-cache-marker-readiness.mjs
npx tsc --noEmit -p tsconfig.json
node --check scripts/qa-zodiac-dashboard.mjs
npm run build
npm run zodiac:dashboard:qa
npm run production:safety:check
```

## Следующий пакет

Package 211 — Visual Issue Triage Board.

Package 211 не начат.
