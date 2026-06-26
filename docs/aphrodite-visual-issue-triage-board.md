# Package 211 — Visual Issue Triage Board

Package 211 создаёт ручную visual issue triage board для screenshots и live QA findings.

Это только dashboard/readiness слой. Пакет не создаёт GitHub issues, не вызывает внешние интеграции, не пишет в базу данных, не вызывает Telegram API, не отправляет сообщения, не включает оплату и не открывает VIP.

## Categories

- layout issue
- text too long
- unclear CTA
- mobile overflow
- Telegram WebView issue
- date input issue
- compatibility repeated copy
- visual hierarchy issue
- loading state issue
- error state issue
- route/startapp issue
- cache/deploy issue

## Severity

- blocker
- high
- medium
- low
- polish

## Status

- new
- confirmed
- needs screenshot
- ready for fix
- fixed
- verified

## Manual board rules

- Запись создаётся вручную; dashboard ничего не отправляет.
- Каждый blocker/high требует route, screenshot, device и expected behavior.
- Status `needs screenshot` используется, если нет изображения или точного пути.
- `fixed` не равно `verified`: нужна отдельная проверка на целевом устройстве.
- route/startapp и cache/deploy issues сверяются с Package 209 и Package 210.

## Safety labels

- Нет внешних интеграций
- Нет GitHub API
- Нет Telegram API
- Нет отправки сообщений
- Нет записи в базу данных
- Нет production-запуска
- Нет оплаты
- Нет VIP-разблокировки
- Triage board ничего не отправляет

## Следующий рекомендуемый пакет

Package 212 — Public Launch Go/No-Go Review.

Package 212 не начат.
