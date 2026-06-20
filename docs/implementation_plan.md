# Aphrodite Package 75 Plan (Crypto Module)

## User Review Required
No review required; autopilot mandate granted.

## Goal
Create a read-only Crypto module dashboard for Aphrodite OS to monitor cryptocurrency market data and provide structured snapshots.

## Proposed Changes

### [NEW] `app/dashboard/networks/aphrodite/crypto/page.tsx`
Create a dashboard for Crypto displaying mock data (BTC, ETH, SOL, TON, etc.), recent trends, and a safety status noting that it is currently disconnected from any live publishing or DB.

### [NEW] `docs/aphrodite-crypto.md`
Documentation for the Crypto module design.

### [NEW] `docs/aphrodite-package-reports/package-75.md`
Report file for Package 75.

### [MODIFY] `components/Sidebar.tsx`
Update the `href` for the "Крипта" sidebar item to point to `/dashboard/networks/aphrodite/crypto`. Currently it might be pointing to a placeholder.

### [MODIFY] `scripts/qa-zodiac-dashboard.mjs`
Add routes and assertions for `/dashboard/networks/aphrodite/crypto`.

## Verification
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run zodiac:dashboard:qa`
