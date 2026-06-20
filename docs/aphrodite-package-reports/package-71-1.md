# Aphrodite Package 71.1 Report

## Goal
Rename and reorganize visible labels so the product architecture is clear:
- Афродита = whole platform
- Зодиак / Каналы Зодиака = one module inside Афродита
- Валюты, Крипта, Металлы = future modules inside Афродита

## Commits
`fix: align aphrodite platform naming`

## Files Modified
* `components/Sidebar.tsx`
* `app/dashboard/login/page.tsx`
* `app/dashboard/networks/aphrodite/page.tsx`
* `app/dashboard/networks/aphrodite/channels/page.tsx`
* `docs/aphrodite-channel-registry.md`
* `docs/aphrodite-platform-overview.md`
* `scripts/qa-zodiac-dashboard.mjs`

## QA Checks
* `npm run lint`: pass
* `npx tsc --noEmit`: pass
* `npm run build`: pass
* `npm run zodiac:dashboard:qa`: pass
* `npm run production:safety:check`: pass
* `git diff --check`: pass

## Safety Confirmation
* Live API requests: none
* Env/secrets: unchanged
* Payments: unchanged
* DB/server writes: none
* Content publishing: locked

## Changes Made
* Restructured `Sidebar.tsx` into a single, Aphrodite-centric hierarchy.
* Updated `page.tsx` texts for both the Overview and Channel Registry to explicitly state Aphrodite is the parent OS and Zodiac is just one module.
* Updated local docs.
* Altered login screen text to "Вход в панель Афродиты".
* Validated no technical backend routes or actual API calls were broken.
