# Package 152 — birth-date text input interaction hotfix

Дата: 2026-06-25

Статус: hotfix по дате рождения. Package 152 Paywall не начинался: оплаты, VIP unlock, Telegram API, database, workflows, cron, publish scripts и bot sending logic не менялись.

## Причина

Package 151 уже заменил native date picker на текстовый ввод, но runtime-проверка показала проблему во время набора: `15.06.1998` посимвольно превращался в `15.06.2019`. Причина была в display formatter на `onChange`: он съедал промежуточные точки и слишком рано расширял двухзначный год.

Дополнительно VIP natal handler нормализовал значение через общий ISO/date helper, что могло давать тот же нестабильный эффект при частичном вводе.

## Исправление

- `lib/zodiac-birth-date-range.ts`: добавлен стабильный `normalizeBirthDateInputDisplay`, который сохраняет промежуточные значения `15.`, `15.06.`, `15.06.19` и нормализует только завершённые даты.
- `components/zodiac-mini-app/ZodiacDateInput.tsx`: birth-date режим использует `type="text"`, `inputMode="decimal"`, placeholder `15.06.1998`, общий marker `data-birth-date-ui="v2-global-1900-today"` и scoped marker `data-birth-date-scope`.
- Birth-date inputs получили scope markers: `birth-matrix`, `miniapp-matrix`, `compatibility`, `vip-natal`, `vip-numerology`, `mystic`.
- `components/ZodiacVipSections.tsx`: VIP natal birth-date handler переведён на birth-date display normalizer.
- QA обновлён route/scope based и проверяет partial typing, accepted formats, future/pre-1900 blocking и отсутствие native birth-date picker.

## Поддерживаемые значения

Принимаются: `15.06.1998`, `15061998`, `1998-06-15`, `01.01.1990`, `31.12.1985`, `01.01.2000`, `1900-01-01`, today.

Отклоняются: `1899-12-31`, tomorrow, `26.06.2026`.

## Audit table

| Экран / flow | Route | Файл | Есть ввод даты рождения | Тип ввода до фикса | Тип ввода после фикса | Исправлено | Проверка 15.06.1998 | Проверка 01.01.1990 | Future date blocked | Причина исключения, если не birth-date |
|---|---|---|---|---|---|---|---|---|---|---|
| Birth Matrix page | `/birth-matrix` | `app/birth-matrix/BirthMatrixClient.tsx` | Да | Text input, но formatter ломал точки/год при наборе | Shared `ZodiacDateInput`, `type=text`, `inputMode=decimal`, scope `birth-matrix` | Да | PASS runtime | PASS runtime | Да |  |
| Mini App hub | `/miniapp` | `app/miniapp/page.tsx` | Нет | N/A | N/A | Не требовалось | N/A | N/A | N/A | Экран проверен. Дата рождения не используется. Исключён из hotfix. |
| Mini App → Birth Matrix | `/compatibility` → `Матрица судьбы` | `components/ZodiacMysticSections.tsx` | Да | Shared text input, но общий formatter ломал partial typing | Shared `ZodiacDateInput`, scope `miniapp-matrix` | Да | PASS runtime | PASS runtime | Да |  |
| Mini App → Numerology / date-derived mystic tools | `/compatibility` → `Нумерология` | `components/ZodiacCompatibilityMiniApp.tsx` | Да | Shared text input, но общий formatter ломал partial typing | Shared `ZodiacDateInput`, scope `mystic` | Да | PASS runtime | PASS runtime | Да |  |
| Mini App → Mystic cards / Tarot / runes | `/compatibility` → `Мистика` | `components/ZodiacCompatibilityMiniApp.tsx`, `components/ZodiacMysticSections.tsx` | Нет | N/A | N/A | Не требовалось | N/A | N/A | N/A | Экран проверен. Карты/Таро/руны используют знак/день, дата рождения не используется. |
| Mini App → Compatibility relationship form | `/compatibility` → `Совместимость` → personal mode | `components/ZodiacCompatibilityMiniApp.tsx` | Да | Shared text input, но общий formatter ломал partial typing | Shared `ZodiacDateInput`, scope `compatibility` | Да | PASS runtime | PASS runtime | Да |  |
| VIP natal chart | `/compatibility` → `VIP` → `Натал+` | `components/ZodiacVipSections.tsx` | Да | VIP handler мог нормализовать partial value через generic date helper | Shared birth-date display normalizer, scope `vip-natal` | Да | PASS runtime | PASS runtime | Да |  |
| VIP birth chart / profile natal | `/compatibility` → `Профиль/Натал` | `components/ZodiacCompatibilityMiniApp.tsx` | Да | Shared text input, но общий formatter ломал partial typing | Shared `ZodiacDateInput`, scope `vip-natal` | Да | PASS runtime | PASS runtime | Да |  |
| VIP numerology | `/compatibility` → `VIP` → `Расширенная нумерология` | `components/ZodiacVipSections.tsx` | Да | Shared text input, но общий formatter ломал partial typing | Shared `ZodiacDateInput`, scope `vip-numerology` | Да | PASS runtime | PASS runtime | Да |  |
| Love Reading preview / relationship preview | `/miniapp/love-reading-preview` | `app/miniapp/love-reading-preview/page.tsx` | Нет | N/A | N/A | Не требовалось | N/A | N/A | N/A | Экран проверен. Дата рождения не используется. Исключён из hotfix. |
| Shared ZodiacDateInput | shared component | `components/zodiac-mini-app/ZodiacDateInput.tsx` | Да | Text input, но display formatter ломал partial typing | Unified `ДД.ММ.ГГГГ` text input helper + markers | Да | PASS QA/browser | PASS QA/browser | Да |  |
| Shared parsers | helper/parser | `lib/zodiac-birth-date-range.ts`, `lib/zodiac-mystic-content.ts` | N/A | Parser already covered range, display normalizer unstable for typing | Shared parser + stable display normalizer | Да | PASS QA | PASS QA | Да |  |
| Native `type=date` / DatePicker / birthYear audit | source audit | `app`, `components`, `lib`, `scripts`, `docs` | Нет для birth-date | Native birth picker запрещён | Birth-date bundle has no native `type=date`, no DatePicker, no birthYear picker | Не требовалось | PASS QA | PASS QA | Да | Non-birth calendar/date flows remain calendar text mode where applicable. |
| Lunar ritual custom date | `/compatibility` → `Мистика` → `Ритуал` | `components/ZodiacMysticSections.tsx` | Нет | Calendar date text input | `dateKind="calendar"`, no birth marker | Не требовалось | N/A | N/A | N/A | Экран проверен. Это дата ритуала/лунного дня, не дата рождения. |
| VIP mystic day date | `/compatibility` → `VIP` → `VIP мистический день` | `components/ZodiacVipSections.tsx` | Нет | Calendar date text input | `dateKind="calendar"`, no birth marker | Не требовалось | N/A | N/A | N/A | Экран проверен. Это дата прогноза, не дата рождения. |
| VIP couple calendar start date | `/compatibility` → `VIP` → `30 дней пары` | `components/ZodiacVipSections.tsx` | Нет | Calendar date text input | `dateKind="calendar"`, no birth marker | Не требовалось | N/A | N/A | N/A | Экран проверен. Это стартовая дата календаря пары, не дата рождения. |

## Checks

- `npx tsc --noEmit -p tsconfig.json`: PASS
- `npm run build`: PASS
- `node --experimental-strip-types scripts/qa-zodiac-birth-date-runtime-ui-fix.mjs`: PASS
- `node --experimental-strip-types scripts/qa-zodiac-global-birth-date-input-ranges.mjs`: PASS
- `node --experimental-strip-types scripts/qa-zodiac-natal-chart-date-picker-range.mjs`: PASS
- `node --experimental-strip-types scripts/qa-zodiac-birth-date-text-input-interaction.mjs`: PASS
- Local browser interaction smoke: PASS, 14/14 scoped inputs accepted `15.06.1998` and `01.01.1990` without reset or year jump.

## Итог

Все birth-date inputs проверены поэкранно.
Все birth-date inputs используют общий ввод `ДД.ММ.ГГГГ` или общий helper.
`15.06.1998` вводится во всех birth-date сценариях.
`01.01.1990` вводится во всех birth-date сценариях.
Future dates blocked во всех birth-date сценариях.
Native `type=date` не используется для birth-date сценариев.
