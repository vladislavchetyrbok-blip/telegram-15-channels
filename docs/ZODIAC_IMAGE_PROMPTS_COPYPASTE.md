# Zodiac Visual Prompt Export Pack

This pack contains instructions and base styles for manually generating the visual assets for the Zodiac Network using Midjourney, DALL-E, or Stable Diffusion.

## 1. Global Aesthetic Style
**Theme:** Luxury Mystic
All assets for the Zodiac Network should adhere to this style to ensure a cohesive, premium brand look across all 13 Telegram channels.
> **Universal Style Append:** `cinematic, ultra detailed, luxury mystic, high-end editorial photography, deep contrast, elegant composition, 8k resolution --v 6.0 --style raw`

## 2. Universal Negative Prompt
When generating, ensure you exclude unwanted elements using this negative prompt.
> **Negative Prompt:** `cartoon, anime, text, typography, letters, watermark, signature, ugly, messy, flat, vector, illustration, cheap, low resolution, crowded, chaotic, neon bright colors`

## 3. How to Use the Export Script
To avoid copying and pasting manually from code, use the local CLI script to export all 13 channel prompts into a clean, copy-pasteable Markdown file:

```bash
npm run zodiac:export-image-prompts
```

This will create an `exports/zodiac-image-prompts.md` file containing:
- 13 Avatar Prompts
- 13 Cover Prompts
- Daily Post Template Prompts
- Save paths for each file

## 4. Saving and Validation
Once you have generated your images:
1. Save Avatars to `public/assets/zodiac/avatars/avatar-[id].png`
2. Save Covers to `public/assets/zodiac/covers/cover-[id].jpg`
3. Save Placeholders to `public/assets/zodiac/placeholders/placeholder-[id].jpg`
4. Reference `docs/ZODIAC_ASSET_NAMING.md` for exact naming.
5. Run the validator to ensure everything is in place:
```bash
npm run zodiac:validate-assets
```
