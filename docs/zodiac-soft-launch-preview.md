# Zodiac Soft Launch Preview

## Overview
This document outlines the Soft Launch Preview feature for the Zodiac module. The soft launch preview is designed to act as a bridge between testing and live production by providing a detailed dashboard to verify readiness across all 13 channels over a 7-day period.

## Status
- **Auth Requirement:** The Aphrodite dashboard is authenticated and accessed via `/login`.
- **Existing System:** The daily system is fully configured and operational (Package 91).
- **Current Mode:** **Soft Launch Preview**. This is a read-only environment to plan and audit publication phases.
- **Safety Rule:** Dry-run first. No live publishing occurs without separate manual approval.

## 7-Day Preview
The dashboard UI includes a 7-day calendar preview representing the publishing schedule for all 13 channels. It verifies:
- Content availability for the specified dates.
- Ledger tracking status.
- Next necessary verification step (dry-run).

## 13-Channel Coverage
All 13 Zodiac channels are integrated into the daily system and the soft launch preview:
- Общий гороскоп
- Овен
- Телец
- Близнецы
- Рак
- Лев
- Дева
- Весы
- Скорпион
- Стрелец
- Козерог
- Водолей
- Рыбы

## Soft Launch Phases
The preview defines explicit steps before going live:
1. **Фаза 1** — Проверить текущий день (`npm run zodiac:publish:date:dry`).
2. **Фаза 2** — Проверить 3 дня вперёд.
3. **Фаза 3** — Проверить 7 дней вперёд.
4. **Фаза 4** — Проверить ledger (`npm run zodiac:ledger:check`).
5. **Фаза 5** — Проверить навигацию каналов (`npm run zodiac:navigation:dry`).
6. **Фаза 6** — Ручное разрешение на live.

## Important Note
No API keys or live tokens are exposed or invoked by the preview page. The actual execution relies on safe scripts (e.g., `npm run zodiac:dashboard:qa`, `npm run production:safety:check`). Live publication remains disabled pending explicit authorization.
