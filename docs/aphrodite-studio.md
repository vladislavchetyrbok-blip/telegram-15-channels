# Aphrodite Studio (Content Factory)

Афродита Студия — это фабрика контента для всей сети Telegram-каналов (Зодиак, Валюты, Крипта, Металлы, Недвижимость).

## Overview
Aphrodite Studio is designed to be the central content production module.
- It is a content factory for ideas, scripts, storyboards, short videos, Reels, Shorts, images, covers, captions, and publishing preparation.
- It can later become a native Windows operator app as well.

## Current Status (Package 80)
- **UI/Docs/Dry-run Only**: The current version is strictly a read-only/dry-run interface.
- **Safety**: 
  - No live generation APIs connected.
  - No API keys stored.
  - No live publish to Telegram.
  - Manual review is required for any generation pipeline.
- **Future Integrations**: Future integrations may include video generation tools, image generation tools, auto-captions, voiceover APIs, and automated scheduling. These must be approved separately.

## Content Pipeline
The standard workflow for the factory is:
`Идея → Сценарий → Сториборд → Визуал → Видео → Подпись → Проверка → План публикации`

## Module-Specific Presets
The studio supports presets for different modules:
- **Каналы Зодиака**: Ежедневные гороскопы, советы (Vertical Video, Reels)
- **Валюты**: Ежедневные курсы, тренды (Carousels)
- **Крипта**: Топ-10 монет, аналитика (Vertical Video)
- **Металлы**: Золото и серебро инфографика (Square Image)
- **Недвижимость**: Обзоры рынка (Telegram Video)
- **Общие каналы**: Мемы, новости, дайджесты (Weekly Digest)
