# Aphrodite Studio Brief Builder

The **Brief Builder** (`/dashboard/networks/aphrodite/studio/briefs`) is the content ideation and structuring interface for the Aphrodite platform.

## Overview
Content Briefs are the structured blueprints that connect abstract ideas and templates to the actual Generation Queue. A brief typically contains:
- Target Module and Channel
- Post Format (Reels, Shorts, Telegram Post, Carousel)
- Hook / Initial Idea
- Script Outline
- Visual Prompts (Image, Video)
- Captions and CTAs

## Role in the Pipeline
The flow from idea to publication works as follows:
`Бриф → Сценарий → Промпт → Очередь Студии → Проверка → План публикации`
The Brief Builder manages the first three steps before submitting the structured request to the Production Queue.

## Current Implementation (Mock Mode)
The current version is an entirely **read-only/static** visualization:
- There is no database or saving mechanism.
- Content generation APIs (text, image, video) are NOT connected.
- All buttons are for preview and illustration only.
- The interface aims to validate the UI/UX for editors.

## Future Roadmap
- **Phase 1 (Next Package if approved)**: Implement client-side `localStorage` or local JSON-backed state for saving brief drafts, allowing editors to create and edit briefs across reloads locally without server intervention.
- **Phase 2**: Introduce real JSON/database state and hook into external generation APIs, but only after strict approval of security schemas and secrets management.
