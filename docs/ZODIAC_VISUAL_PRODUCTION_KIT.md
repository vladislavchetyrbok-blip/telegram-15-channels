# Zodiac Network: Visual Production Kit

This document provides instructions for manually generating the visual assets for the Zodiac Network using AI image generators (e.g. Midjourney, Stable Diffusion).

## Global Art Direction

The network requires a consistent, premium, and atmospheric visual style across all channels.
**Target aesthetics:**
- Luxury mystic
- Dark zodiac
- Cosmic gold
- Deep color palettes (black / gold / deep blue / violet)
- Cinematic light
- Premium Telegram magazine feel

**What to avoid:**
- No cartoon or anime styles
- No cheap horoscope clipart
- No messy text or watermarks inside images
- No overloaded zodiac wheels or fake UI
- No fake religious or cult-like symbols
- No low-quality stock feel

---

## Generation Workflow

Follow these steps to establish the visual identity for each channel:

1. **Generate Avatar:** Use the provided `Avatar Prompt` for each channel. Aspect Ratio: 1:1.
2. **Review & Reroll:** Choose an image that strictly adheres to the global art direction. Ensure consistency across all 13 avatars.
3. **Upload to Telegram:** Set the generated image as the channel avatar.
4. **Generate Cover/Pinned Post Image (Optional):** Use the `Cover Prompt` (Aspect Ratio: 16:9).
5. **Daily Workflow:** When generating images for daily posts, use the `Daily Post Image Prompt` template and substitute `{zodiac_theme}` with the daily topic.

### Global Negative Prompt
Apply this negative prompt to all generations to prevent low-quality outputs:
`text, watermark, logo, cartoon, anime, 3d render, cheap, childish, overloaded, messy, religious symbols, crosses, cult, low quality, messy lines, bad anatomy, bad proportions`

---

## Channel Specific Prompts

### Гороскоп на сегодня ✨ (`zodiac-general`)
- **Avatar:** Macro photography of an elegant glowing crystal sphere floating in deep space, surrounded by subtle golden stardust, cinematic lighting, dark background, premium mystic style, 8k, photorealistic
- **Cover:** Wide cinematic shot of an elegant glowing crystal sphere floating in deep space, surrounded by subtle golden stardust, cinematic lighting, dark background, premium mystic style

### Овен ♈️ Гороскоп (`aries`)
- **Avatar:** Elegant minimal ram horns glowing with soft warm fire, dark obsidian background, subtle golden sparks, luxury mystic style, cinematic light, 8k, photorealistic
- **Negative additions:** angry ram, bloody, violent

*(See `data/zodiacVisualProductionKit.ts` for the complete list of 13 channels' prompts, color palettes, and composition notes.)*
