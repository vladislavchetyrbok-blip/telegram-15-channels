# Zodiac Pilot Import: Aries

This document serves as the pilot guide for importing the first batch of real visual assets. We will start with a single sign — **Aries** — to verify the end-to-end flow before generating the remaining 44 images.

## 1. Required Pilot Assets (Aries)
You must generate 4 images for the Aries channel. Do not worry about the other signs yet.

### A. Avatar / Logo
- **Format:** `.png`
- **Size:** 1024x1024
- **Aspect Ratio:** 1:1
- **Negative Prompt:** `cartoon, anime, text, typography, letters, watermark, signature, ugly, messy, flat, vector, illustration, cheap, low resolution, crowded, chaotic, neon bright colors, ai artifacts`
- **Prompt:** `Centered icon for Telegram circular crop. Aries premium zodiac visual, fire and gold, sharp energetic lines, deep red luxury backdrop. cinematic, ultra detailed, luxury mystic, high-end editorial photography, deep contrast, elegant composition, 8k resolution --v 6.0 --style raw --ar 1:1`
- **Save to:** `public/assets/zodiac/avatars/avatar-aries.png`

### B. Channel Cover / Banner
- **Format:** `.jpg` (or `.png`)
- **Size:** 1792x1024 or 1600x900
- **Aspect Ratio:** 16:9
- **Negative Prompt:** (Same as above)
- **Prompt:** `Wide atmospheric banner. Aries premium zodiac visual, fire and gold, sharp energetic lines, deep red luxury backdrop. cinematic, ultra detailed, luxury mystic, high-end editorial photography, deep contrast, elegant composition, 8k resolution --v 6.0 --style raw --ar 16:9`
- **Save to:** `public/assets/zodiac/covers/cover-aries.jpg`

### C. Daily Post Visual
- **Format:** `.jpg` (or `.png`)
- **Size:** 1024x1024 or 1080x1350
- **Aspect Ratio:** 4:5
- **Negative Prompt:** (Same as above)
- **Prompt:** `Atmospheric background for daily horoscope. Aries premium zodiac visual, fire and gold, sharp energetic lines, deep red luxury backdrop. cinematic, ultra detailed, luxury mystic, high-end editorial photography, deep contrast, elegant composition, 8k resolution --v 6.0 --style raw --ar 4:5`
- **Save to:** `public/assets/zodiac/daily/daily-aries.jpg`

### D. Weekly Horoscope Visual
- **Format:** `.jpg` (or `.png`)
- **Size:** 1344x768 or 1600x900
- **Aspect Ratio:** 16:9
- **Negative Prompt:** (Same as above)
- **Prompt:** `Atmospheric background for weekly horoscope. Aries premium zodiac visual, fire and gold, sharp energetic lines, deep red luxury backdrop. cinematic, ultra detailed, luxury mystic, high-end editorial photography, deep contrast, elegant composition, 8k resolution --v 6.0 --style raw --ar 16:9`
- **Save to:** `public/assets/zodiac/weekly/weekly-aries.jpg`

## 2. Validation
After generating and saving these 4 files, run:
```bash
npm run zodiac:assets:validate
```

**How to read the result:**
- Look for the `aries` line under `--- PER-SIGN COMPLETENESS ---`
- If you see `aries            | 0/4 | INCOMPLETE`, the files are missing or misnamed.
- If you see `aries            | 4/4 | COMPLETE`, you have successfully imported the pilot!
- It is perfectly fine and expected if all other signs (taurus, gemini, etc.) report `0/4`. We only care about Aries right now.
