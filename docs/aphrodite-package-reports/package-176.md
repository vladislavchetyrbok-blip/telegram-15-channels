# Package 176 — Zodiac Compatibility Copy Personalization Hotfix

## Статус

Package 176 закрывает срочный product hotfix: результат совместимости в Mini App больше не должен показывать одинаковые карточки советов для разных пар.

Это не paywall package и не payment package.

## Что было сломано

Пользователь увидел, что разные проверки совместимости получают повторяющиеся формулировки.

Примеры повторов:

- `Не спорить на усталости: сначала пауза, потом одна конкретная тема.`
- `Не проверять чувства молчанием: лучше назвать ожидание прямо и коротко.`
- `Не превращать любовь в экзамен...`
- `тепло важнее проверки чувств`
- `Главная зона внимания: общение...`
- `не стоит спорить за лидерство там, где помогает партнёрство`

## Root cause

Основной видимый источник был в `components/zodiac-mini-app/ResultCards.tsx`: блок `Риски` рендерил hardcoded список из трёх пунктов.

Дополнительно часть текста результата строилась через общие наборы фраз без единого helper-а, который учитывает пару, даты, имена, режим отношений, score profile и section-level dedupe.

## Изменено

- `lib/zodiac-compatibility-copy-personalization.ts`
- `components/ZodiacCompatibilityMiniApp.tsx`
- `components/zodiac-mini-app/ResultCards.tsx`
- `components/zodiac-mini-app/types.ts`
- `scripts/qa-zodiac-compatibility-copy-personalization.mjs`
- `docs/zodiac-compatibility-copy-personalization.md`
- `docs/aphrodite-package-reports/package-176.md`

## Новый helper

Добавлен deterministic generator:

```text
buildZodiacCompatibilityPersonalizedCopy()
```

Он возвращает:

- `riskIntro`
- `riskLines`
- `communicationTitle`
- `communicationInsight`
- `communicationAdvice`
- `boundaries`
- `emotionalFocus`
- `nextStep`

## Персонализация зависит от

- first sign
- second sign
- порядка знаков
- стихий и темпераментов
- first name
- second name
- first birth date
- second birth date
- relationship mode
- score profile
- section id
- advice index

Одинаковые inputs дают одинаковый результат. `Math.random` не используется.

## Dedup

Добавлен normalizer:

```text
normalizeZodiacCompatibilityCopyPhrase()
```

Он используется для предотвращения дублей внутри одного результата между risk/advice/boundary blocks.

## UI behavior

`CompatibilityResult` получил поле:

```text
personalizedCopy
```

`ResultCards.tsx` больше не использует hardcoded risk cards. Блоки:

- `Риски`
- `Как общаться`
- `Действие сегодня`

берут текст из `result.personalizedCopy`.

Ключевые result fields в `buildCompatibilityResult()` также получают персонализированный текст из helper-а, чтобы соседние preview/result flows не оставались на старой универсальной копии.

## QA

Проверено:

```powershell
npx tsc --noEmit -p tsconfig.json
node --experimental-strip-types scripts/qa-zodiac-compatibility-copy-personalization.mjs
node --experimental-strip-types scripts/qa-zodiac-vip-couple-calendar-personalization.mjs
npm run build
npm run zodiac:dashboard:qa
```

Результат:

- TypeScript: PASS
- New compatibility copy QA: PASS
- Existing couple calendar personalization QA: PASS
- Build: PASS
- Dashboard QA: PASS

## Safety

Реальная оплата добавлена: Нет.

Telegram Stars invoice добавлен: Нет.

`sendInvoice` вызван: Нет.

`createInvoiceLink` вызван: Нет.

`pre_checkout_query` handler добавлен: Нет.

`successful_payment` handler добавлен: Нет.

Payment ledger write добавлен: Нет.

Entitlement creation добавлен: Нет.

Реальная VIP-разблокировка добавлена: Нет.

Запись в базу данных добавлена: Нет.

Схема базы данных изменена: Нет.

Миграции добавлены: Нет.

Telegram API использовался: Нет.

Active Telegram CTA logic изменена: Нет.

Cron/workflow/publish scripts изменены: Нет.

Bot sending logic изменена: Нет.

Daily/weekly automation остаётся незаблокированной.

## Следующий пакет

Package 175 — Production Payment Safety Gate уже завершён.

Следующий рекомендуемый пакет: Package 177 — First Paid MVP Readiness Review.

Package 177 не начинать автоматически.
