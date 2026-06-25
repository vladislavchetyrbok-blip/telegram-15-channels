# Package 156 — Couple 30-Day Calendar Personalization Fix

## Статус

Пакет завершает срочный hotfix модуля «30 дней пары». Пользователь сообщил, что календарь выдавал одинаковые разборы для разных людей и дат.

Пакет не продолжает Paywall, Entitlement или реальную VIP-разблокировку.

## Где найден генератор

- `components/ZodiacCompatibilityMiniApp.tsx` — основной `buildCoupleCalendar`, который строит календарь для заполненной пары.
- `components/ZodiacVipSections.tsx` — VIP fallback внутри `VipCoupleCalendarFeature`, который строил 30 дней, если готовый календарь не был передан.

## Причина одинаковых результатов

- Основной генератор использовал статические массивы шаблонов и seed без дат рождения пары.
- VIP fallback строил seed только из знаков, режима отношений и даты конкретного дня.
- Имена и даты рождения из формы не участвовали в fallback-генерации.
- Дни календаря различались, но персонализация была слишком слабой для разных людей и дат рождения.

## Что изменено

- Создан общий deterministic helper `lib/zodiac-couple-calendar-personalization.ts`.
- Основной `buildCoupleCalendar` переведён на общий helper.
- `VipCoupleCalendarFeature` получает `firstPerson` и `secondPerson` из compatibility flow.
- VIP fallback переведён на общий helper и больше не строит отдельный набор шаблонов.
- `CoupleCalendarDay` расширен обязательными полями: `dayNumber`, `title`, `emotionalTheme`, `coupleInsight`, `riskZone`, `recommendedAction`, `softDisclaimer`.
- UI календаря пары показывает расширенный разбор дня: тема, инсайт пары, действие, риск, совет и мягкий disclaimer.

## Inputs, которые теперь влияют на результат

- `firstName`
- `secondName`
- `firstBirthDate`
- `secondBirthDate`
- `firstSign`
- `secondSign`
- `relationshipMode`
- `startDate`
- `dateKey`
- `dayNumber`
- `scoreTotal`
- `scoreLove`
- `scoreCommunication`
- `scoreAttraction`

## Стабильность и различия

- Одинаковые inputs дают одинаковые 30 дней.
- Разные имена дают разные результаты.
- Разные даты рождения дают разные результаты.
- Разные знаки дают разные результаты.
- Разный `startDate` даёт другие даты и другой контент.
- День 1 и день 2 внутри одного календаря отличаются.
- Генерация не использует случайный `Math.random`.

## Содержательные границы

- Нет жёстких предсказаний.
- Нет формулировок «точно будет».
- Нет медицинских, юридических или финансовых советов.
- Текст остаётся мягкой навигацией для разговора.

## QA

- `node --experimental-strip-types scripts/qa-zodiac-vip-couple-calendar-personalization.mjs` — PASS.
- `npx tsc --noEmit -p tsconfig.json` — PASS.

Остальные проверки сборки и production safety выполняются перед commit и фиксируются в финальном отчёте.

## Запретные зоны не изменялись

- Реальная оплата не добавлена.
- Реальная VIP-разблокировка не добавлена.
- Telegram Stars invoice не добавлен.
- `successful_payment` handler не добавлен.
- Entitlement creation не добавлен.
- Telegram API не использовался.
- База данных и схема базы данных не изменялись.
- Cron, workflows и publish scripts не изменялись.
- Active Telegram CTA не изменялась.

## Следующий рекомендуемый пакет

Package 157 — продолжить VIP Access Boundary / Paywall / Entitlement план по актуальному номеру.

Не начинать следующий пакет автоматически.
