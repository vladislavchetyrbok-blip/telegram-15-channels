# Package 270 - Zodiac Brand Cleanup + Unified Input Controls

Package 270 is a visual/UX consistency pass for the live Zodiac Mini App.

## What changed

- Removed visible Aphrodite branding from live user-facing Mini App copy where it appeared in route metadata, shell eyebrows, and hero badges.
- Kept internal Aphrodite component names, dashboard history, and docs because this is not a full codebase rename.
- Replaced remaining live English technical labels such as `revealed rune`, `Birth Matrix / Natal input`, `personal energy report`, and `Natal birth profile` with short Russian labels.
- Fixed bottom navigation from `Прогнозы` to `Прогноз`.
- Compacted large mobile sign and quick-action lists.
- Added shared date, time, and city input components for the Mini App.

## Unified inputs

- `ZodiacUnifiedDateInput` wraps the existing Package 224 date input and preserves `01012000 -> 01.01.2000` behavior.
- `ZodiacUnifiedTimeInput` provides one compact `HH:MM` field and optional known/unknown time controls.
- `ZodiacCityAutocompleteInput` provides local static city suggestions only, including `Днепр / Дніпро`, and keeps manual fallback.

## City suggestions

- Днепр / Дніпро
- Киев / Київ
- Львов / Львів
- Одесса / Одеса
- Харьков / Харків
- Запорожье / Запоріжжя
- Полтава
- Черкассы / Черкаси
- Винница / Вінниця
- Ивано-Франковск / Івано-Франківськ
- Тернополь / Тернопіль
- Ужгород
- Черновцы / Чернівці
- Кривой Рог / Кривий Ріг

## Safety

- publicLaunchApproved=false
- ownerManualReviewRequired=true
- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Active CTA logic changed: No
- DB write added: No
- External analytics added: No
- Payment added: No
- VIP unlock added: No
- Entitlement bypass added: No
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- Production DB connected: No

Next recommended package: Package 271 - Owner Screenshot Recheck After Brand/Input Cleanup.
