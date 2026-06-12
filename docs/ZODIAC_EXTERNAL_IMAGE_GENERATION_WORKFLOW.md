# Zodiac External Image Generation Workflow

This document explains how to manually generate and import the 52 required visual assets using external tools like ChatGPT, Midjourney, Leonardo, Stable Diffusion, or any other image generator.

## Requirements

1. **Exact Source File:** `docs/ZODIAC_FINAL_MISSING_VISUALS_QUEUE.md`
2. **Exact Target Folder:** `public/assets/zodiac/`
3. **Required Total:** 52 images
4. **Required Blocks:**
   - zodiac-general
   - aries
   - taurus
   - gemini
   - cancer
   - leo
   - virgo
   - libra
   - scorpio
   - sagittarius
   - capricorn
   - aquarius
   - pisces
5. **Required Asset Types per Block:**
   - avatar/logo (1024x1024, 1:1)
   - cover/banner (1792x1024 or 1600x900, 16:9)
   - daily post visual (1024x1024, 1:1)
   - weekly horoscope visual (1344x768 or 1600x900, 16:9)

## Workflow

1. **Recommended Generation Order:** Generate one block at a time (4 images per block).
2. **Validation After Each Block:** Once you save the 4 images for a block, run the following command to ensure they are detected correctly:
   ```bash
   npm run zodiac:assets:validate
   ```
   You should see your completed block updated to `4/4`.

## Final Steps

1. **Final Validation:**
   Once all 52 images are placed, run the full suite:
   ```bash
   npm run build
   npm run lint
   npm run zodiac:assets:validate
   ```
2. **Required Final Result:** The validator must report `Total: 52/52`.
3. **Commit Command:**
   ```bash
   git add public/assets/zodiac
   git commit -m "feat: add complete zodiac visual asset set"
   git push
   ```
