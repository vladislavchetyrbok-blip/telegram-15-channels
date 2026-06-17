# Zodiac VIP Roadmap

## Current Mode

VIP is open as free early access during the launch period.

- `vipFreeAccessEnabled`: `true`
- `vipFreeAccessUntil`: `2026-09-17`
- `vipPaymentsEnabled`: `false`
- `telegramStarsEnabled`: `false`

The public Mini App wording is `👑 VIP открыт бесплатно` with the subtitle `Ранний доступ на 3 месяца`.

## No Payments Now

There is no payment processing in the current VIP mode.

- No Telegram Stars API.
- No invoices.
- No subscription backend.
- No login requirement.
- No user account storage.

## Privacy

VIP early access does not store personal inputs.

- Names are not persisted.
- Birth dates are not persisted.
- Birth times are not persisted.
- Birth cities are not persisted.
- Message helper text is not stored.

Analytics events may track safe product usage only, such as VIP views and safe feature IDs. They must not include names, birth dates, birth times, or cities.

## Free Early Access Features

The temporary free VIP surface can include:

- Extended relationship map / mental map.
- 30-day couple calendar preview.
- Extended lucky days.
- Extended natal chart interpretation.
- Message helper variants.
- Best days for reconciliation or dates.
- Personal month forecast preview.

## Future Telegram Stars Plan

Later, part of the extended VIP surface may move to a subscription or Telegram Stars flow.

Future implementation should add payments only after a separate product decision and safety pass. Keep subscription code, invoice creation, and Telegram Stars calls out of the current free-access mode.
