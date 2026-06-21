# Package 88: Aphrodite Legacy 15 Channels Restart Planner

## Overview
Added the **Restart Planner** for the old paused 15-channel legacy network under Aphrodite. The new page serves as a centralized operator view for relaunch preparation, content audits, and studio integrations.

## Components Implemented
- Created `/dashboard/networks/aphrodite/legacy/restart/page.tsx`
- Added the **Restart Call-to-Action** to the main legacy overview page.
- Updated `Sidebar.tsx` to include `Перезапуск` under the `15 каналов` module group.
- Provided a complete 15-channel matrix with frequency guidelines, first rubric themes, and safety statuses.
- Enforced strict read-only safety markers and documented the integration with Aphrodite Studio.

## Safety Constraints Validated
- Live publishing is strictly disabled.
- Dry-run only.
- No database interactions.
- No live Telegram API requests.
- Full UI compliance with dark theme and responsive Next.js standard.
