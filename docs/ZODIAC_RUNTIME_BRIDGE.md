# Zodiac Runtime Bridge

The Zodiac Network generates its daily and weekly preview content primarily in the browser (client-side React state). This is necessary to keep our Vercel Hobby serverless function count safely at 4 and prevent the need for heavy API compute during the transition phase.

## Current Architecture vs Legacy Architecture

### Legacy (15-Channel Network)
- **Generation:** Server-side API called by `prepare-tomorrow.mjs`.
- **Storage:** Automatically wrote directly to `data/runtime/weekly-content-plan.json`.
- **Publishing:** `scripts/publish-due.mjs` read directly from this runtime file and relied heavily on required images (`imagePath`).

### Zodiac Network (13-Channel Network)
- **Generation:** Client-side UI via `ZodiacWeeklyPreviewPanel`.
- **Storage:** Explicitly exported by the user via "Export Zodiac Plan JSON" button as a local file download. Does **not** automatically write to `data/runtime`.
- **Validation:** Locally validated via `npm run zodiac:validate-plan`.
- **Publishing (MVP Text-only):** Images are optional. The new bridge schema (`ZodiacRuntimePlan`) supports `mediaMode: "text_only"`, ensuring that we can publish text-only horoscopes without being blocked by missing images.

## Workflow (Phase 1)

1. Open `/content-plan`.
2. Generate the 7-day preview.
3. Click **Export Zodiac Plan JSON** to download `zodiac-weekly-plan-YYYY-MM-DD.json`.
4. Locally run validation against the downloaded file:
   ```bash
   npm run zodiac:validate-plan path/to/zodiac-weekly-plan-YYYY-MM-DD.json
   ```
5. Do **not** overwrite `data/runtime/weekly-content-plan.json` yet.
6. Do **not** run real publish (`npm run publish:due:json`).

## Future Step (Phase 2)

A dedicated Zodiac dry-run and publish script (`scripts/publish-zodiac.mjs`) will be created in a future phase. It will be able to read this validated JSON file and communicate with Telegram independently of the legacy scripts.
