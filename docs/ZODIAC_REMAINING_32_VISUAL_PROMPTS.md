# Zodiac Remaining 32 Visual Prompts

## Current Status

- Weekly zodiac assets ready: 59/91
- Weekly zodiac assets missing: 32
- Placeholders are forbidden.
- Missing images must be generated as real premium visuals, or the publisher must use text-only fallback.
- Use existing approved visuals as style reference: aries, taurus, gemini, cancer, leo, virgo, zodiac-general, libra, and scorpio monday/tuesday/wednesday.

Missing groups:

- scorpio: 4
- sagittarius: 7
- capricorn: 7
- aquarius: 7
- pisces: 7

## Target Output Paths

### Batch 1: Scorpio Remaining 4

- `public/assets/zodiac-weekly/scorpio/thursday.jpg`
- `public/assets/zodiac-weekly/scorpio/friday.jpg`
- `public/assets/zodiac-weekly/scorpio/saturday.jpg`
- `public/assets/zodiac-weekly/scorpio/sunday.jpg`

### Batch 2: Sagittarius 7

- `public/assets/zodiac-weekly/sagittarius/monday.jpg`
- `public/assets/zodiac-weekly/sagittarius/tuesday.jpg`
- `public/assets/zodiac-weekly/sagittarius/wednesday.jpg`
- `public/assets/zodiac-weekly/sagittarius/thursday.jpg`
- `public/assets/zodiac-weekly/sagittarius/friday.jpg`
- `public/assets/zodiac-weekly/sagittarius/saturday.jpg`
- `public/assets/zodiac-weekly/sagittarius/sunday.jpg`

### Batch 3: Capricorn 7

- `public/assets/zodiac-weekly/capricorn/monday.jpg`
- `public/assets/zodiac-weekly/capricorn/tuesday.jpg`
- `public/assets/zodiac-weekly/capricorn/wednesday.jpg`
- `public/assets/zodiac-weekly/capricorn/thursday.jpg`
- `public/assets/zodiac-weekly/capricorn/friday.jpg`
- `public/assets/zodiac-weekly/capricorn/saturday.jpg`
- `public/assets/zodiac-weekly/capricorn/sunday.jpg`

### Batch 4: Aquarius 7

- `public/assets/zodiac-weekly/aquarius/monday.jpg`
- `public/assets/zodiac-weekly/aquarius/tuesday.jpg`
- `public/assets/zodiac-weekly/aquarius/wednesday.jpg`
- `public/assets/zodiac-weekly/aquarius/thursday.jpg`
- `public/assets/zodiac-weekly/aquarius/friday.jpg`
- `public/assets/zodiac-weekly/aquarius/saturday.jpg`
- `public/assets/zodiac-weekly/aquarius/sunday.jpg`

### Batch 5: Pisces 7

- `public/assets/zodiac-weekly/pisces/monday.jpg`
- `public/assets/zodiac-weekly/pisces/tuesday.jpg`
- `public/assets/zodiac-weekly/pisces/wednesday.jpg`
- `public/assets/zodiac-weekly/pisces/thursday.jpg`
- `public/assets/zodiac-weekly/pisces/friday.jpg`
- `public/assets/zodiac-weekly/pisces/saturday.jpg`
- `public/assets/zodiac-weekly/pisces/sunday.jpg`

## Generation Plan

Generate in small sign-based batches. After each batch, visually inspect every image, save only approved real JPEG files, then run:

```bash
npm run zodiac:weekly-assets:validate
```

Do not overwrite any existing good image unless it is proven corrupt. Do not commit fake placeholders, flat color blocks, generic stock images, watermarked images, or images with embedded text.

## Day Variation Notes

Use the same sign identity across a sign batch, but vary the weekday mood subtly:

- monday: calm start, focus, quiet clarity
- tuesday: action, momentum, decisive energy
- wednesday: communication, choices, mental movement
- thursday: growth, opportunity, broader perspective
- friday: relationships, beauty, closure, soft magnetism
- saturday: rest, personal energy, pleasure, embodied mood
- sunday: reflection, reset, intuition, spiritual quiet

## Sign Group Prompts

Use each sign prompt with the weekday variation appended. Keep all images square `1024x1024` and export as valid JPEG.

### Scorpio

Base prompt:

```text
Premium modern astrology visual for Scorpio, elegant scorpion symbolism, deep cosmic background, dark red and black celestial atmosphere, refined gold accents, mystical but modern editorial style, rich cinematic lighting, luxury zodiac channel aesthetic, dramatic depth, magnetic shadow, high-detail composition, square 1024x1024, valid JPEG output. No text, no watermark, no logo, no random stock photo, no placeholder, no cheap cartoon style, no distorted zodiac symbol, no random people.
```

Generate only these Scorpio weekdays now: thursday, friday, saturday, sunday. Match the existing Scorpio monday/tuesday/wednesday style as closely as possible.

### Sagittarius

Base prompt:

```text
Premium modern astrology visual for Sagittarius, elegant archer and arrow symbolism, cosmic night background, gold trail through deep blue and black space, mystical but modern editorial style, rich cinematic lighting, luxury zodiac channel aesthetic, sense of movement and horizon, high-detail composition, square 1024x1024, valid JPEG output. No text, no watermark, no logo, no random stock photo, no placeholder, no cheap cartoon style, no distorted zodiac symbol, no random people.
```

Generate all seven weekdays: monday, tuesday, wednesday, thursday, friday, saturday, sunday.

### Capricorn

Base prompt:

```text
Premium modern astrology visual for Capricorn, elegant goat and mountain symbolism, cosmic architectural background, black and deep navy atmosphere, refined gold accents, mystical but modern editorial style, rich cinematic lighting, luxury zodiac channel aesthetic, discipline, height, structure, quiet power, high-detail composition, square 1024x1024, valid JPEG output. No text, no watermark, no logo, no random stock photo, no placeholder, no cheap cartoon style, no distorted zodiac symbol, no random people.
```

Generate all seven weekdays: monday, tuesday, wednesday, thursday, friday, saturday, sunday.

### Aquarius

Base prompt:

```text
Premium modern astrology visual for Aquarius, elegant water bearer and air-water symbolism, futuristic cosmic background, deep blue and black celestial field, subtle electric-blue energy, refined gold accents, mystical but modern editorial style, rich cinematic lighting, luxury zodiac channel aesthetic, ideas, clarity, innovation, high-detail composition, square 1024x1024, valid JPEG output. No text, no watermark, no logo, no random stock photo, no placeholder, no cheap cartoon style, no distorted zodiac symbol, no random people.
```

Generate all seven weekdays: monday, tuesday, wednesday, thursday, friday, saturday, sunday.

### Pisces

Base prompt:

```text
Premium modern astrology visual for Pisces, elegant two-fish symbolism, deep cosmic water background, violet-blue and black atmosphere, refined gold accents, mystical but modern editorial style, rich cinematic lighting, luxury zodiac channel aesthetic, dreamlike intuition, soft depth, flowing composition, high-detail composition, square 1024x1024, valid JPEG output. No text, no watermark, no logo, no random stock photo, no placeholder, no cheap cartoon style, no distorted zodiac symbol, no random people.
```

Generate all seven weekdays: monday, tuesday, wednesday, thursday, friday, saturday, sunday.

## Per-Image Prompt Template

For each target file, combine:

```text
<SIGN BASE PROMPT>
Weekday mood: <DAY VARIATION>.
Style reference: match the existing approved zodiac weekly visuals in this repository: premium dark cosmic astrology, cinematic lighting, rich contrast, elegant gold accents, no text.
Output: square 1024x1024 JPEG.
```

Negative prompt:

```text
text, letters, numbers, watermark, logo, signature, random stock photo, placeholder, cheap, cartoon, anime, flat vector, messy, low quality, artifacts, distorted zodiac symbol, random people, social media UI, frame, border
```

## QA Checklist

Before accepting any generated file:

- File exists at the exact target path.
- Image is exactly 1024x1024.
- File is a real JPEG with magic bytes `FF D8 FF`.
- No text is visible inside the image.
- No watermark is visible.
- No logo is visible.
- No random people are present.
- Image does not look like a cheap stock photo.
- Image matches the existing premium zodiac style.
- Image is safe for a Telegram channel post.
- Image is not a placeholder.
- Image is not a copied duplicate of another weekday.
- Zodiac symbolism is elegant and recognizable.
- The weekday mood variation is subtle, not a separate visual brand.

## Commit Plan

- Generate and QA one sign batch at a time.
- Run `npm run zodiac:weekly-assets:validate` after each completed batch.
- Commit each completed sign separately after visual QA.
- Suggested commit messages:
  - `feat: add remaining scorpio weekly zodiac visuals`
  - `feat: add sagittarius weekly zodiac visuals`
  - `feat: add capricorn weekly zodiac visuals`
  - `feat: add aquarius weekly zodiac visuals`
  - `feat: add pisces weekly zodiac visuals`
- Never commit placeholders.
- Never mix visual batches with code, scripts, package changes, workflow changes, ledger changes, or publishing changes.
