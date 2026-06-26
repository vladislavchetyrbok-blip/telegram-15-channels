# Zodiac compatibility copy personalization

## Проблема

Пользователь обнаружил, что результат совместимости в Mini App выдаёт почти одинаковые карточки советов для разных пар.

Повторявшиеся примеры:

- `Не спорить на усталости: сначала пауза, потом одна конкретная тема.`
- `Не проверять чувства молчанием: лучше назвать ожидание прямо и коротко.`
- `Не превращать любовь в экзамен...`
- `тепло важнее проверки чувств`
- `Главная зона внимания: общение...`
- `не стоит спорить за лидерство там, где помогает партнёрство`

## Root cause

Видимые карточки `Риски` в `components/zodiac-mini-app/ResultCards.tsx` были hardcoded и не зависели от конкретной пары.

Часть соседнего текста в `components/ZodiacCompatibilityMiniApp.tsx` строилась через общие массивы и seed, но без единого cross-section dedupe helper для результата совместимости. Из-за этого несколько блоков могли получать одинаковую или слишком близкую формулировку.

## Исправление

Добавлен общий deterministic helper:

```text
lib/zodiac-compatibility-copy-personalization.ts
```

Он строит персональные поля:

- `riskIntro`
- `riskLines`
- `communicationTitle`
- `communicationInsight`
- `communicationAdvice`
- `boundaries`
- `emotionalFocus`
- `nextStep`

Новый copy зависит от:

- first sign / second sign
- порядка знаков в паре
- стихии и темперамента знаков
- first name / second name
- first birth date / second birth date
- relationship mode
- score profile
- section id
- advice index

Выбор deterministic: одинаковые inputs дают одинаковый результат, без `Math.random`.

Дубли внутри одного результата отсекаются через:

```text
normalizeZodiacCompatibilityCopyPhrase()
```

## UI integration

`buildCompatibilityResult()` теперь создаёт `personalizedCopy` и использует его для основных полей результата:

- `communicationPlanText`
- `conflictPointsText`
- `bestContactFormat`
- `coupleAdvice`
- `weakSpotText`
- `adviceText`
- `riskText`

`ResultCards.tsx` больше не рендерит hardcoded risk cards. Блоки `Риски`, `Как общаться`, `Действие сегодня` читают `result.personalizedCopy`.

## QA

Новый QA:

```powershell
node --experimental-strip-types scripts/qa-zodiac-compatibility-copy-personalization.mjs
```

Проверяет:

- одинаковые inputs стабильны
- разные знаки меняют risk cards
- разные знаки меняют communication cards
- разные даты рождения меняют copy
- разные имена меняют copy
- relationship mode меняет copy
- score profile меняет copy
- внутри результата нет дублей
- старые hardcoded risk cards убраны из `ResultCards.tsx`
- одна и та же тройка advice/risk cards не используется для всех тестовых пар
- similarity разных sign-pair результатов ниже порога
- существующий couple calendar personalization не сломан
- нет payment API
- нет Telegram API
- нет database write
- нет real VIP unlock
- workflows/package/db schema не изменены
- cron/publish scripts не изменены

## Safety boundary

Этот hotfix не реализует и не меняет:

- оплату
- Telegram Stars invoice
- `sendInvoice`
- `createInvoiceLink`
- `pre_checkout_query`
- `successful_payment`
- payment ledger write
- entitlement creation
- VIP unlock
- database schema / migrations
- Telegram API
- workflows / cron
- publish scripts
- bot sending logic
- active Telegram CTA logic
