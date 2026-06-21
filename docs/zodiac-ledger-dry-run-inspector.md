# Zodiac Ledger & Dry-run Inspector

## Overview
The **Zodiac Ledger & Dry-run Inspector** is a dedicated dashboard view designed to provide a transparent overview of the daily publishing ledger and the dry-run simulation statuses. Since live publications are strictly blocked until manually enabled via owner approval, the dashboard uses these inspector tools to verify content generation, taxonomy, and channel mappings before any actual post is sent to Telegram.

## Core Capabilities
- **Ledger Verification:** Analyzes `data/zodiac-ledger.json` for all historical and planned posts to prevent duplicates or missed slots across the 13 channels.
- **Dry-run Execution Preview:** Integrates visual blocks mapping to the backend `npm run zodiac:publish:date:dry` and related scripts.
- **Taxonomy Checks:** Explains the definitions for internal script states (`OK`, `REVIEW`, `BLOCKED`, `MISSING`, `DUPLICATE`, `FAILED`).
- **Safety Blockers:** Explicitly highlights conditions that block live dispatch (missing tokens, failed audits, invalid channels, duplicate detection).
- **13-Channel Coverage:** Asserts readiness for all 13 Zodiac scopes simultaneously.

## Dashboard Integrations
- **Soft Launch (`/dashboard/networks/zodiac/soft-launch`):** Added quick action cards navigating to the Ledger page to verify daily readiness before attempting manual dispatches.
- **Daily System (`/dashboard/networks/zodiac/daily-system`):** Quick navigation inserted alongside the existing preview links.
- **Sidebar:** New node `Ledger / dry-run` added under Zodiac for easy access.

## Safe CLI Commands (Dashboard Inspector)
The Inspector maps to the following local automation commands:
- `npm run zodiac:publish:date:dry` — Simulate post dispatch for a single day.
- `npm run zodiac:ledger:check` — Verify publication ledger integrity.
- `npm run zodiac:navigation:all:dry` — Test all cross-links and bottom navigation logic.
- `npm run zodiac:descriptions:dry` — Validate channel profiles and biographies.
- `npm run production:safety:check` — Ensure environment prevents accidental production leaks.

## QA Validation
- Validated via `scripts/qa-zodiac-dashboard.mjs`.
- Respects `aphrodite_session` token authentication requirements (redirects unauthorized users to `/login`).
