# Package 98: Zodiac Real Preview Sample Review

## Objective
Add a real preview sample review layer for Zodiac. Use the existing dry-run/daily system to understand actual preview output, then expose safe sample review cards in the dashboard. This helps compare real generated/dry-run post examples against the Package 97 quality scoring model.

## Changes
1. **Sample Data Layer:** Added `lib/zodiac/zodiac-preview-sample-review.ts` with dry-run sample data for all 13 channels (generated via `npm run zodiac:publish:date:dry`).
2. **Dashboard UI:** Added `/dashboard/networks/zodiac/preview-review` page to display real dry-run generated outputs alongside the Quality Scoring criteria.
3. **Navigation Integration:** Linked the new page in:
   - Priority Page (`/dashboard/networks/zodiac/priority`)
   - Daily System (`/dashboard/networks/zodiac/daily-system`)
   - Soft Launch (`/dashboard/networks/zodiac/soft-launch`)
   - Ledger (`/dashboard/networks/zodiac/ledger`)
   - Content Quality (`/dashboard/networks/zodiac/content-quality`)
   - Template Refinement (`/dashboard/networks/zodiac/template-refinement`)
   - Quality Scoring (`/dashboard/networks/zodiac/quality-scoring`)
4. **Sidebar:** Added `Preview Review` to Zodiac menu in `components/Sidebar.tsx`.
5. **QA Coverage:** Added tests for the new `/preview-review` route in `scripts/qa-zodiac-dashboard.mjs`.

## Verification
- Route `/dashboard/networks/zodiac/preview-review` correctly renders sample data.
- UI validates the Quality Scoring models.
- Build and Lint pass successfully.
- Safety checks confirmed: no Telegram API calls, live publishing disabled.

## Status
✅ Complete and Ready for next step.
