# Aphrodite Package 76 Plan (Metals Module)

## User Review Required
No review required; autopilot mandate granted.

## Goal
Create a read-only Metals module dashboard for Aphrodite OS to monitor precious metals market data.

## Proposed Changes

### [NEW] `app/dashboard/networks/aphrodite/metals/page.tsx`
Create a dashboard for Metals displaying mock data (XAU/USD, XAG/USD, XPT/USD), recent trends, and a safety status noting that it is currently disconnected from any live publishing or DB.

### [NEW] `docs/aphrodite-metals.md`
Documentation for the Metals module design.

### [NEW] `docs/aphrodite-package-reports/package-76.md`
Report file for Package 76.

### [MODIFY] `components/Sidebar.tsx`
Update the `href` for the "Металлы" sidebar item to point to `/dashboard/networks/aphrodite/metals`. Currently it might be pointing to a placeholder or missing. Wait, there is no "Металлы" in `components/Sidebar.tsx` yet, so I will add it under the Aphrodite section.

### [MODIFY] `scripts/qa-zodiac-dashboard.mjs`
Add routes and assertions for `/dashboard/networks/aphrodite/metals`.

## Verification
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run zodiac:dashboard:qa`
