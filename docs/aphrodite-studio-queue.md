# Aphrodite Studio Queue

The **Studio Queue** (`/dashboard/networks/aphrodite/studio/queue`) is a read-only Kanban board designed to visualize the content production pipeline across all Aphrodite modules.

## Overview
It tracks the lifecycle of content from initial concept to publication readiness:
`Идея → Сценарий → Визуал → Видео → Подпись → Проверка → Готово`

## Current Implementation (Mock Mode)
The current version of the queue is entirely **read-only** and uses static mock data.
- No real generation APIs are connected.
- No automatic or manual Telegram publishing is enabled from this UI.
- There is no backing database; no state is preserved across reloads.
- The UI strictly serves as a structural placeholder for future feature sets.

## Checklist Constraints
A pre-publish checklist must be strictly followed before any content is moved to "Готово":
1. Текст вычитан
2. Нет запрещённых обещаний
3. Нет финансового совета
4. Дисклеймер добавлен
5. CTA корректный
6. Визуал соответствует теме
7. Дата актуальна
8. Ручная проверка пройдена
9. Публикация только после отдельного разрешения

## Future Roadmap
Future iterations of this queue may include:
- **Phase 1**: Local JSON file storage for persisting queue state.
- **Phase 2**: Real worker integration for generation (requires explicit approval of secrets/API architecture).
- **Phase 3**: Automated pushing to the Zodiac publishing ledger.
