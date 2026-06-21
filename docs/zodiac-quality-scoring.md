# Zodiac Quality Scoring

**Location:** `/dashboard/networks/zodiac/quality-scoring`

## Overview
The **Zodiac Quality Scoring** module provides a static, read-only preview scoring mechanism for the Zodiac publishing system. It enforces a strict set of evaluation rules for generated astrology posts, verifying structure, uniqueness, Tone-of-Voice (ToV), and Telegram readiness before any soft launch.

## 6-Point Quality Model
The module scores content based on a 100-point system distributed across 6 categories:
1. **Структура поста (20 баллов):** Проверка наличия всех 7 обязательных блоков (Вводная, Энергия, Любовь, Совет и т.д.).
2. **Уникальность знака (20 баллов):** Анализ на наличие якорей знака для избежания шаблонности.
3. **CTA и Mini App-связка (15 баллов):** Мягкий, ненавязчивый призыв к действию, без FOMO.
4. **Безопасность формулировок (20 баллов):** Отсутствие медицинских, финансовых обещаний или фатальных предсказаний.
5. **Повторяемость (15 баллов):** Контроль уникальности аффирмаций и советов.
6. **Telegram-readiness (10 баллов):** Соответствие длины поста, форматированию и объему эмодзи.

## Thresholds (Пороги оценки)
- **90–100:** Готово к soft launch.
- **75–89:** Хорошо, но нужен ручной просмотр (dry-run).
- **60–74:** Нужна доработка генерации.
- **0–59:** Блокировка live-публикации.

## Safety & Context
- This page does not run generation logic.
- The existing daily generation system is preserved untouched.
- No live publishing or database writes are executed from this UI.
- All access is strictly protected by the Aphrodite `/login` authentication module.
