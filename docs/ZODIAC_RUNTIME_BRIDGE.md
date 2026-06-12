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

## Local Node Generator

While the browser-based export is useful, we also have a fully offline, self-contained local Node.js script that generates the exact same structure without needing a browser or React environment.

**What it does:** It generates a multi-day Zodiac Runtime Plan JSON file containing previews for all 13 Zodiac channels (91 posts total for a 7-day plan).
**Why it exists:** To safely prepare offline dry-runs and automated generation later without hitting Vercel limits or needing the `/content-plan` UI.

### Command Examples

**Default Behavior:**
```bash
npm run zodiac:generate-plan
```
*Generates a 7-day plan starting from today, using the `luxury-mystic` style, and saves it to `./exports/zodiac-weekly-plan-YYYY-MM-DD.json`.*

**Custom Parameters:**
```bash
npm run zodiac:generate-plan -- --start-date 2026-06-13 --days 7 --style luxury-mystic
```

### Validate Generated JSON

Always validate generated or exported files before use:
```bash
npm run zodiac:validate-plan -- ./exports/zodiac-weekly-plan-2026-06-13.json
```

> [!WARNING]
> **Do not move generated files to `data/runtime` yet.**
> **Do not run real publish commands.**
> This is strictly for Phase 2 preparation and dry-runs.

## Future Step (Phase 3)

A dedicated Zodiac dry-run and publish script (`scripts/publish-zodiac.mjs`) will be created in a future phase. It will be able to read this validated JSON file and communicate with Telegram independently of the legacy scripts.
