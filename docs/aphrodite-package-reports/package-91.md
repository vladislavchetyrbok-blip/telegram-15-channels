# Package 91: Audit Existing Zodiac Daily Publishing System

**Status**: Completed
**Date**: June 2026
**Target**: `G:\telegram-15-channels`

## Goal
Audit, preserve, document, and visualize the existing Zodiac daily publishing/content system inside the Aphrodite dashboard. Do not replace it with new fake static content. Find the existing working files, scripts, ledger/config/content generation logic, and expose their status clearly in the UI.

## Actions Taken
1. **Audit & Research**: Explored `scripts/` and `data/` to discover the actual mechanism of Zodiac daily publications (`generate-zodiac-plan.mjs`, `publish-zodiac-dry-run.mjs`, `zodiac-ledger.json`, `zodiac-daily-plan.json`).
2. **Dashboard UI**:
    - Created new route `/dashboard/networks/zodiac/daily-system`.
    - Displayed Status KPI cards (Channels, Logic, Publishing mode, Ledger, Dry-run, Live status).
    - Displayed System map tracing exactly how the existing CLI logic interconnects.
    - Added the "Commands for verification" block indicating safe ways to test.
    - Preserved safety block emphasizing no API calls and no from-scratch content rewrites.
3. **Priority Alignment**: Updated `/dashboard/networks/zodiac/priority` to link to the new daily system page, and reframed Phase 2 / Package 91 from "prepare 7 days of posts" to "audit daily system", to align with reality.
4. **Sidebar Integration**: Added "Ежедневная система" to the sidebar Zodiac section.
5. **QA Coverage**: Enhanced `qa-zodiac-dashboard.mjs` to test the new route, new assertions, and removed old assertions assuming the system needed to be built from scratch.

## Safety Preserved
- No live Telegram publishing triggered.
- No DB writes.
- UI explicitly shows dry-run and safety limits.
- No dummy/mocked Zodiac generation was added; the real system is now properly represented in the dashboard UI.
