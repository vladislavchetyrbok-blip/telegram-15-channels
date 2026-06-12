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

## Zodiac Dry-Run Publisher (Phase 3)

The Zodiac dry-run publisher reads a generated or exported JSON plan, validates its structure, and simulates the publishing process without interacting with Telegram.

**Purpose:** To verify that the content is structured correctly, all channels are covered, and there are no blocking issues before moving to actual channel connections or real publishing.

### Command Examples

## Editorial Review (Phase 5)

A local editorial review tool is available to analyze generated Zodiac JSON plans and produce a human-readable report.

**Purpose:** To quickly detect low-quality text, repeated visual prompts, clichés, safety risks, and missing structural elements before the plan goes to publication.
**How it fits in:** It reads the generated or enhanced JSON file and produces a summary. It can also output a full Markdown report for editors to review.

> [!WARNING]
> **The review tool does NOT modify anything.**
> **It does NOT publish.**
> **It does NOT touch `data/runtime`.**

**Command Examples:**
```bash
# Print report to terminal
npm run zodiac:review-plan -- ./exports/zodiac-weekly-plan-2026-06-13.json

# Save full report as Markdown
npm run zodiac:review-plan -- ./exports/zodiac-weekly-plan-2026-06-13.json --out ./exports/zodiac-review-2026-06-13.md
```

## Rewrite Weak Posts Only (Phase 6)

A targeted local tool to selectively rewrite only the weak posts within a plan.

**Purpose:** To improve specific posts (low score, containing clichés, missing sections) without touching the strong ones, saving time and keeping high-quality generated content.
**How it fits in:** It reads an exported or generated JSON plan, identifies weak posts, sends only them to the local LLM, and creates a new `-rewritten.json` file. It does not overwrite the original file unless forced.

> [!WARNING]
> **The rewriter does NOT publish.**
> **It does NOT touch `data/runtime`.**
> **The rewritten JSON remains safely in the `exports/` folder.**

**Command Examples:**
```bash
# Dry run to see what would be rewritten
npm run zodiac:rewrite-weak -- ./exports/zodiac-weekly-plan-2026-06-13.json --dry

# Rewrite posts with score below 85, limit to first 2
npm run zodiac:rewrite-weak -- ./exports/zodiac-weekly-plan-2026-06-13.json --threshold 85 --limit 2

# Rewrite specific posts by ID
npm run zodiac:rewrite-weak -- ./exports/zodiac-weekly-plan-2026-06-13.json --ids "aries-2026-06-14,taurus-2026-06-14"
```

## Safe Local Pipeline (Phase 7)

A unified CLI runner that securely executes the entire Zodiac content preparation process from generation to dry-run publishing, without requiring any manual step-by-step execution.

**Purpose:** Automate the repetitive steps (Generate -> Validate -> Review -> Dry-run) and optionally include LLM enhancement or rewrites, ensuring all safety checks pass automatically.

> [!WARNING]
> **The pipeline does NOT publish.**
> **It does NOT write to `data/runtime`.**
> **Real Telegram channels are not required.**

**Command Examples:**
```bash
# Default safe flow: Generate 7 days -> Validate -> Review -> Dry-run
npm run zodiac:pipeline

# Custom dates and style
npm run zodiac:pipeline -- --start-date 2026-06-13 --days 7 --style luxury-mystic

# Quick 1-day test
npm run zodiac:pipeline -- --start-date 2026-06-13 --days 1 --style luxury-mystic

# Run with optional LM Studio enhancer (enhances ALL posts)
npm run zodiac:pipeline -- --start-date 2026-06-13 --days 1 --enhance --limit 3

# Run with optional targeted rewrites (only weak posts below score 70)
npm run zodiac:pipeline -- --start-date 2026-06-13 --days 7 --rewrite-weak --rewrite-threshold 70
```


## Healthcheck (Phase 8)

A local diagnostics tool to audit the entire Zodiac toolchain. It checks whether all required scripts, configuration files, and safety rules are in place.

**Purpose:** To easily verify the project's state, detect missing optional phases, and ensure that no safety rules have been violated (like staging generated files or touching `.env`).

> [!WARNING]
> **The healthcheck does NOT publish.**
> **It does NOT touch `data/runtime`.**
> **It does NOT read the Telegram token.**

**Command Examples:**
```bash
# Default quick mode (inspects files and git status only)
npm run zodiac:healthcheck

# Quick mode explicit
npm run zodiac:healthcheck -- --quick

# Full mode (runs a safe smoke test: generate 1 day, validate, review, dry-run)
npm run zodiac:healthcheck -- --full

# Machine-readable JSON
npm run zodiac:healthcheck -- --json
```

> [!WARNING]
> **The dry-run publisher does NOT send Telegram messages.**
> **A real publish script for Zodiac is intentionally not created yet.**
> **Do NOT use `npm run publish:due:json` for the Zodiac Network!**

## Local LM Studio Enhancer (Phase 4)

A local enhancer script is available to automatically improve horoscope text using a local LLM via LM Studio. 

**Purpose:** Automatically rewrites generated text to sound more premium, removes clichés, and ensures high editorial quality.
**How it fits in:** It reads an exported or generated JSON plan, sends the text to the local LLM, and creates a new `-enhanced.json` file. It does not overwrite the original file unless forced.

> [!WARNING]
> **The enhancer does NOT publish.**
> **It does NOT touch `data/runtime`.**
> **The enhanced JSON remains safely in the `exports/` folder.**

**How to start LM Studio:**
Open LM Studio, load your preferred model (default is `deepseek-r1-0528-qwen3-8b`), and start the local server on `http://localhost:1234`.

**Command Examples:**
```bash
npm run zodiac:enhance-plan -- ./exports/zodiac-weekly-plan-2026-06-13.json
```
To test on a smaller batch (e.g., just the first day):
```bash
npm run zodiac:enhance-plan -- ./exports/zodiac-weekly-plan-2026-06-13.json --limit 13
```


