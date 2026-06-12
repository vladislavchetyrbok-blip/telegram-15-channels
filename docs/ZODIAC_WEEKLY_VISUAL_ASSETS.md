# Zodiac Weekly Visual Assets

Phase 20 introduces a reusable weekly visual asset system for the Zodiac network. The goal is 13 channels x 7 weekdays = 91 high-quality images.

## Why 91 Pre-Generated Images

Daily horoscope text changes every day, but the visual mood can be selected from a stable weekly library. This keeps Telegram publishing fast, predictable, and independent from paid image generation APIs.

The system does not generate images at publish time. It chooses the image by channel and weekday, then falls back to the current 52/52 asset set until the weekly image pack is complete.

## Folder Structure

Use one JPG per channel and weekday:

```text
public/assets/zodiac-weekly/
  zodiac-general/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  aries/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  taurus/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  gemini/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  cancer/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  leo/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  virgo/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  libra/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  scorpio/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  sagittarius/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  capricorn/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  aquarius/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
  pisces/
    monday.jpg
    tuesday.jpg
    wednesday.jpg
    thursday.jpg
    friday.jpg
    saturday.jpg
    sunday.jpg
```

Expected size: 1024x1024.
Preferred format: JPG.
Do not put text, dates, watermarks, or channel handles inside the image.

## Generation Workflow

1. Open `docs/ZODIAC_WEEKLY_IMAGE_PROMPTS.md`.
2. Copy the prompt for one channel and weekday.
3. Use any external image tool that can create a high-quality square image. No Gemini API is required.
4. Use the matching negative prompt.
5. Export as JPG at 1024x1024.
6. Save to the exact expected path from `data/zodiac-weekly-visual-assets.json`.
7. Run validation.

## Validation

Run:

```bash
npm run zodiac:weekly-assets:validate
```

The validator reports per-channel completeness, global found count, and missing file paths. Missing weekly images are not fatal while the pack is being generated.

The current asset validator remains available:

```bash
npm run zodiac:assets:validate
```

## Runtime Selection

The weekly resolver uses the post date to detect the weekday.

- If `public/assets/zodiac-weekly/<channel>/<weekday>.jpg` exists, it is used.
- If it is missing, the pipeline logs `Weekly zodiac asset missing, using fallback asset.`
- Fallback uses the existing `public/assets/zodiac/daily/` or `public/assets/zodiac/weekly/` asset resolver.

This keeps the existing temporary 52/52 assets working until the new 91-image pack is ready.

## Replacing Temporary Assets Later

When enough weekly images are generated and validated, the weekly pack can become the primary production visual source. Do not delete the current 52/52 assets until all 91 weekly images validate and at least one dry-run confirms the expected image path for each target channel.
