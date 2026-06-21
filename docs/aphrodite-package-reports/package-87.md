# Package 87 Report: Legacy 15 Channels Module

## Goal
Add the old Aphrodite 15-channel network as its own visible module inside the platform, distinct from Zodiac.

## Execution Summary
1. **Sidebar Integration**: Added "15 каналов" module group under "МОДУЛИ" in `components/Sidebar.tsx`.
2. **Overview Page**: Created `/dashboard/networks/aphrodite/legacy` to display the 15 legacy channels grouped into "Общие темы" (10) and "Недвижимость" (5) with their correct localized content profiles, formats, and disabled/paused statuses.
3. **Aphrodite Dashboard**: Updated `/dashboard/networks/aphrodite` to list "15 каналов" under "Приостановленные модули", maintaining separation from Zodiac, Currency, Crypto, and Metals.
4. **Channel Registry**: Updated `/dashboard/networks/aphrodite/channels` to correctly label the network as "15 каналов / Старая сеть Афродиты" instead of generic placeholders.
5. **Documentation**: Added/Updated `aphrodite-legacy-15-channels.md` and `aphrodite-network-registry.md` to document the architectural relationship of the legacy module.
6. **QA script**: Updated `scripts/qa-zodiac-dashboard.mjs` to test for new 15 channels layout strings and registry identifiers.

## Safety Check
- No live publishing functions were triggered.
- No DB dependencies or env variables were introduced.
- Module correctly states "На паузе" and "Публикации отключены".
