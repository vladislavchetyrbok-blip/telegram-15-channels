# Package 182 — Mini App Analytics Noop Integration Points

Package 182 adds safe noop integration points to Mini App user journeys.

Main rule:

```text
Integration points may call only the noop event bus.
No external event sending, DB write, Telegram API, or production analytics.
```

## Интегрировано сейчас

- `/miniapp` → `miniapp_opened`
- `/miniapp/love-reading-preview` → `love_reading_opened`
- `/miniapp/love-reading-preview` → `love_reading_preview_viewed`
- `/miniapp/love-reading-preview` → `full_love_report_teaser_viewed`
- `/miniapp/love-reading-preview` → `free_preview_fallback_shown`
- `/birth-matrix` → `birth_matrix_opened`
- `/compatibility` → `compatibility_opened`

## Pending без рискованного рефактора

- `love_reading_form_started`: нет отдельного активного form-start handler на текущем static preview route.
- `love_reading_form_submitted`: нет отдельного active submit handler; добавление было бы изменением продуктового поведения.
- `couple_calendar_opened`: открывается внутри сложного client flow `components/ZodiacCompatibilityMiniApp.tsx`; безопаснее вынести в отдельный client QA пакет.

## Payload policy

Integration payload содержит только safe metadata:

- `eventId`
- `route`
- `source`
- `surface`
- `productCode`
- `previewType`
- `teaserBlock`
- `fallbackRoute`

Integration payload не содержит:

- raw names
- raw birth dates
- payment payloads
- private Telegram message contents
- full report text
- raw Telegram initData

## Safety

- External analytics подключена: Нет
- Events sending добавлен: Нет
- DB analytics write добавлен: Нет
- Telegram API использовался: Нет
- Payment tracking implementation добавлен: Нет
- Реальная оплата добавлена: Нет
- VIP unlock добавлен: Нет
- User-facing behavior changed: Нет

Следующий рекомендуемый пакет: Package 183 — Analytics Funnel Mock Dashboard.
