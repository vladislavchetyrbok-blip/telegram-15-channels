# Zodiac Avatar Generation Pack

This document outlines the visual identity and prompt engineering guidelines for generating the avatars for the 13 Zodiac Telegram channels.

## Visual Identity (Luxury-Mystic)
- **Palette**: Deep space backgrounds (midnight blue, void black, deep violet) with celestial gold, silver, and starlight accents.
- **Style**: High-end 3D metallic rendering, sacred geometry, minimalist but detailed astrology symbols. No cartoonish characters.
- **Lighting**: Cinematic edge lighting, glowing nebulas, subtle lens flares.
- **Composition**: Centered astrological symbol (or abstract representation of the sign) within a golden or silver circular frame to look perfect inside Telegram's circular avatar crop.

## Midjourney / DALL-E Prompt Templates

### General Horoscope Channel (`zodiac-general`)
> **Prompt:** A luxurious 3D metallic astrolabe and zodiac wheel glowing in deep space, midnight blue and black background, celestial gold and silver accents, sacred geometry, cinematic lighting, ultra detailed, 8k, centered composition for circular crop --v 6.0 --style raw

### Individual Sign Channel (`aries` to `pisces`)
> **Prompt:** The astrological symbol for [ZODIAC SIGN], crafted from high-end 3D glowing gold, floating in a deep space nebula background of midnight blue and dark violet, subtle starlight, sacred geometry, minimalist but premium, cinematic edge lighting, ultra detailed, centered perfectly for a circular crop --v 6.0 --style raw

## Production Steps
1. **Generate**: Use the prompts above in your preferred AI image generator.
2. **Upscale & Crop**: Ensure the subject is perfectly centered. Crop to a 1:1 square ratio (e.g. 1024x1024).
3. **Format**: Save the final images as `.png` files.
4. **Name**: Rename the files strictly following `docs/ZODIAC_ASSET_NAMING.md` (e.g., `avatar-aries.png`).
5. **Place**: Move the files into `public/assets/zodiac/avatars/`.

## Visual Dashboard
You can monitor the readiness of your visual assets from the **Zodiac Settings Dashboard** inside the application under the "Visuals" tab.
- The UI shows expected assets and missing status is normal before image generation.
- The UI is strictly read-only and does not generate or upload images itself.

## Validation
6. **Validate**: Run `npm run zodiac:validate-assets` to ensure all 13 avatars are present and correctly named.

*Remember: This project does not generate or push large assets to git automatically. Operator must handle production manually and commit them safely.*
