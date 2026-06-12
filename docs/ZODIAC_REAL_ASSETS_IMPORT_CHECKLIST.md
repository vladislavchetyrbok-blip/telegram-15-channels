# Zodiac Real Assets Import Checklist

Follow this checklist to safely import your generated visual assets into the project before running the live Telegram publishing pipeline.

## 1. Required Asset Types (Per Channel)
Each of the 13 channels (1 general + 12 zodiac signs) requires the following 4 assets:
1. **Avatar/Logo** - Circular profile picture.
2. **Channel Cover/Banner** - Wide header image for the channel.
3. **Daily Post Visual** - Standard image used for daily horoscope posts.
4. **Weekly Horoscope Visual** - Standard image used for weekly recap/forecast posts.

**Total Assets Expected:** 52 (13 channels × 4 assets)

## 2. Required Channels
- `zodiac-general`
- `aries`
- `taurus`
- `gemini`
- `cancer`
- `leo`
- `virgo`
- `libra`
- `scorpio`
- `sagittarius`
- `capricorn`
- `aquarius`
- `pisces`

## 3. Format & Sizing Rules
- **Formats Allowed:** `.png` or `.jpg` (or `.jpeg`, `.webp`).
- **Avatar:** 1:1 Aspect Ratio (Square, keep subject perfectly centered for circular crop). Format: `.png` preferred.
- **Cover:** 16:9 Aspect Ratio (Wide). Format: `.jpg` preferred.
- **Daily/Weekly Post:** 4:5 Aspect Ratio (Vertical). Format: `.jpg` preferred.
- **Size Limit:** Keep individual files under 2MB for fast loading.
- **Rule:** No AI-generated text or typography inside the images.

## 4. Exact Folder Structure & Filename Format
You must save the generated images exactly at these paths using all lowercase letters and hyphens (no spaces or underscores):

- **Avatars:** `public/assets/zodiac/avatars/avatar-[sign].png` (or `.jpg`)
- **Covers:** `public/assets/zodiac/covers/cover-[sign].jpg` (or `.png`)
- **Daily:** `public/assets/zodiac/daily/daily-[sign].jpg` (or `.png`)
- **Weekly:** `public/assets/zodiac/weekly/weekly-[sign].jpg` (or `.png`)

*Example for Aries:*
- `public/assets/zodiac/avatars/avatar-aries.png`
- `public/assets/zodiac/covers/cover-aries.jpg`
- `public/assets/zodiac/daily/daily-aries.jpg`
- `public/assets/zodiac/weekly/weekly-aries.jpg`

## 5. Validation and Tracking
1. We have provided a tracking file at `data/zodiac-visual-assets-tracker.json` that the system uses to verify readiness.
2. Once you place the files in the correct folders, run the validator:
   ```bash
   npm run zodiac:assets:validate
   ```
3. **Understanding Errors:**
   - **Missing [Type]**: The file doesn't exist in the folder. Generate it and save it with the correct name.
   - **Unsupported extension**: Ensure it ends in `.png`, `.jpg`, `.jpeg`, or `.webp`.
   - **Wrong folder**: Make sure avatars are in `/avatars/`, etc.
   
The validator will output a clear report of what is missing. Once the validator says everything is complete, you are ready for the next phase.
