# Aphrodite Platform Implementation Plan

## User Review Required

No review required; autopilot mandate granted.

## Package 71.1: Aphrodite Naming Alignment

### Goal
Rename and reorganize visible labels so the product architecture is clear:
- Афродита = whole platform
- Зодиак / Каналы Зодиака = one module inside Афродита
- Валюты, Крипта, Металлы = future modules inside Афродита

### Proposed Changes

#### [MODIFY] `components/Sidebar.tsx`
Change the navigation structure so Aphrodite is the main visible platform.
Use labels:
AФРОДИТА
* Обзор
* Каналы
* Календарь публикаций
* Источники данных
* Каналы Зодиака (formerly Zodiac OS)
* Валюты
* Крипта (future)
* Металлы (future)
* Студия Windows (future)
Move the technical routes `/dashboard/networks/zodiac/...` under "Каналы Зодиака" in a collapsible or grouped format, or rename the group. Currently there are two groups: "Zodiac OS" and "Aphrodite OS". I will merge them into one "АФРОДИТА" structure.

#### [MODIFY] `app/dashboard/networks/aphrodite/page.tsx`
Update to clearly say Aphrodite is the operator platform for all Telegram channels. Zodiac is one module inside Aphrodite.

#### [MODIFY] `app/dashboard/networks/aphrodite/channels/page.tsx`
Update text:
- 15 paused channels = "Пауза / Старая сеть Афродиты"
- 13 Zodiac channels = "Каналы Зодиака"

#### [MODIFY] `docs/aphrodite-channel-registry.md` & `docs/aphrodite-platform-overview.md`
Update wording to clarify Aphrodite is the main platform, Zodiac is a module.

#### [MODIFY] `scripts/qa-zodiac-dashboard.mjs`
Check for new Russian labels.

#### [NEW] `docs/aphrodite-package-reports/package-71-1.md`
Report file for Package 71.1.
