# Package 82: Aphrodite Studio Content Queue & Review Board

## Overview
Added the Queue and Review Board to Aphrodite Studio. This visualizes the content production pipeline across all Aphrodite modules via a read-only Kanban interface. 

## Changes Made
- Created `/dashboard/networks/aphrodite/studio/queue/page.tsx` displaying the Kanban columns (Ideas, Script, Visuals, Video, Captions, Review, Done).
- Added static mock data entries across different modules (Zodiac, Crypto, Currency, Metals, Real Estate).
- Added pre-publish checklist and read-only filter chips.
- Added links connecting the Studio Overview, Templates Library, and the Queue.
- Created `docs/aphrodite-studio-queue.md` to document the purpose and constraints of the queue.
- Updated `scripts/qa-zodiac-dashboard.mjs` to rigorously test the queue's content and safety assertions.

## Safety & Verification
- All queue data is entirely static and strictly read-only.
- No buttons for rendering, generation, saving, or publishing were added.
- The UI contains explicit messaging that "Генерация не подключена" and "Публикация в Telegram отключена".
- QA tests and production safety checks confirmed no server-write actions were introduced.

## Next Recommended Package
- Package 83: Integration of local JSON state management for the Queue (if approved, to allow moving items between Kanban columns locally without a database).
