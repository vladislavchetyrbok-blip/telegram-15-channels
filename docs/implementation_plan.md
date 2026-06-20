# Aphrodite Package 77 Plan (UI Polish)

## User Review Required
No review required; autopilot mandate granted.

## Goal
Perform UI Polish on the Aphrodite OS dashboard. This involves creating a unified `AphroditePageHeader` component to standardize the premium "iPhone-like" UI across all 7 Aphrodite module pages, eliminating code duplication and ensuring consistent margins, typography, and safety badges.

## Proposed Changes

### [NEW] `components/AphroditePageHeader.tsx`
Create a reusable header component that accepts `title`, `description`, `icon`, `badgeText`, and `safetyLocked` props.

### [MODIFY] `app/dashboard/networks/aphrodite/page.tsx`
Refactor to use `AphroditePageHeader`.

### [MODIFY] `app/dashboard/networks/aphrodite/channels/page.tsx`
Refactor to use `AphroditePageHeader`.

### [MODIFY] `app/dashboard/networks/aphrodite/calendar/page.tsx`
Refactor to use `AphroditePageHeader`.

### [MODIFY] `app/dashboard/networks/aphrodite/data-sources/page.tsx`
Refactor to use `AphroditePageHeader`.

### [MODIFY] `app/dashboard/networks/aphrodite/currency/page.tsx`
Refactor to use `AphroditePageHeader`.

### [MODIFY] `app/dashboard/networks/aphrodite/crypto/page.tsx`
Refactor to use `AphroditePageHeader`.

### [MODIFY] `app/dashboard/networks/aphrodite/metals/page.tsx`
Refactor to use `AphroditePageHeader`.

### [NEW] `docs/aphrodite-package-reports/package-77.md`
Report file for Package 77.

## Verification
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run zodiac:dashboard:qa`
