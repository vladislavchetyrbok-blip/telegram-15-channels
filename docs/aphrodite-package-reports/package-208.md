# Package 208 — Real Device Visual QA Checklist

Статус: завершён локально после QA.

## Scope

Package 208 добавляет ручной checklist проверки Aphrodite Mini App на реальных устройствах:

- `lib/zodiac/aphrodite-real-device-visual-qa-checklist.ts`
- `app/dashboard/networks/zodiac/real-device-visual-qa-checklist/page.tsx`
- `scripts/qa-aphrodite-real-device-visual-qa-checklist.mjs`
- `docs/aphrodite-real-device-visual-qa-checklist.md`

Также обновлены:

- `app/dashboard/networks/zodiac/page.tsx`
- `app/dashboard/networks/zodiac/public-launch-visual-readiness-review/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`

## Покрытие

- iPhone Telegram WebView
- Android Telegram WebView
- Telegram Desktop
- iPhone Safari
- Android Chrome
- desktop browser
- narrow screens
- slow network mode if possible
- Telegram safe area
- keyboard open state
- back button behavior
- `/miniapp`
- `/miniapp/love-reading-preview`
- `/birth-matrix`
- `/compatibility`
- compatibility result
- Birth Matrix result
- Mystic / Universe
- daily/weekly/monthly horoscope cards
- fallback `/miniapp/love-reading-preview`
- guard denied/future VIP locked state

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
node --experimental-strip-types scripts/qa-aphrodite-real-device-visual-qa-checklist.mjs
npx tsc --noEmit -p tsconfig.json
node --check scripts/qa-zodiac-dashboard.mjs
npm run build
npm run zodiac:dashboard:qa
npm run production:safety:check
```

## Следующий пакет

Package 209 — Telegram WebView / StartApp Route Diagnostics.

Package 209 не начат.
