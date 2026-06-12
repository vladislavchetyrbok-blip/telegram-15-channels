# Gemini Weekly Visual Pilot

This document contains the requirements and prompts for the 7-image weekly visual pilot for the **Gemini** channel.

## Requirements

* **Recommended Size:** 1024x1024
* **Recommended Format:** `.jpg` (optimized for Telegram)
* **Negative Prompt:** `text, watermark, logo, cartoon, cheap, ugly, distorted, messy, low quality, artifacts, 3d render plastic, distorted faces, distorted hands, extra limbs`

## Global Visual Identity

* premium luxury mystic astrology
* two elegant twin figures or dual celestial masks
* air element
* communication, intellect, motion
* dark navy / black cosmic background
* gold details
* cinematic lighting
* expensive editorial style
* no text inside image
* no watermark
* no cheap cartoon style
* no distorted faces/hands
* no low-quality AI artifacts

## 7 Expected File Paths & Prompts

### Monday: Calm Focus, Mental Clarity
**File:** `public/assets/zodiac-weekly/gemini/monday.jpg`

**Prompt:**
```
premium luxury mystic astrology, high-quality Telegram visual, two elegant twin figures or dual celestial masks, air element, communication, intellect, motion, dark navy / black cosmic background, gold details, cinematic lighting, expensive editorial style. Mood: calm focus, mental clarity. no text, no watermark.
```

### Tuesday: Action, Decision, Momentum
**File:** `public/assets/zodiac-weekly/gemini/tuesday.jpg`

**Prompt:**
```
premium luxury mystic astrology, high-quality Telegram visual, two elegant twin figures or dual celestial masks, air element, communication, intellect, motion, dark navy / black cosmic background, gold details, cinematic lighting, expensive editorial style. Mood: action, decision, momentum. no text, no watermark.
```

### Wednesday: Communication, Messages, Ideas
**File:** `public/assets/zodiac-weekly/gemini/wednesday.jpg`

**Prompt:**
```
premium luxury mystic astrology, high-quality Telegram visual, two elegant twin figures or dual celestial masks, air element, communication, intellect, motion, dark navy / black cosmic background, gold details, cinematic lighting, expensive editorial style. Mood: communication, messages, ideas. no text, no watermark.
```

### Thursday: Growth, Opportunity, Useful Connection
**File:** `public/assets/zodiac-weekly/gemini/thursday.jpg`

**Prompt:**
```
premium luxury mystic astrology, high-quality Telegram visual, two elegant twin figures or dual celestial masks, air element, communication, intellect, motion, dark navy / black cosmic background, gold details, cinematic lighting, expensive editorial style. Mood: growth, opportunity, useful connection. no text, no watermark.
```

### Friday: Relationships, Charm, Social Energy
**File:** `public/assets/zodiac-weekly/gemini/friday.jpg`

**Prompt:**
```
premium luxury mystic astrology, high-quality Telegram visual, two elegant twin figures or dual celestial masks, air element, communication, intellect, motion, dark navy / black cosmic background, gold details, cinematic lighting, expensive editorial style. Mood: relationships, charm, social energy. no text, no watermark.
```

### Saturday: Lightness, Rest, Playful Curiosity
**File:** `public/assets/zodiac-weekly/gemini/saturday.jpg`

**Prompt:**
```
premium luxury mystic astrology, high-quality Telegram visual, two elegant twin figures or dual celestial masks, air element, communication, intellect, motion, dark navy / black cosmic background, gold details, cinematic lighting, expensive editorial style. Mood: lightness, rest, playful curiosity. no text, no watermark.
```

### Sunday: Reflection, Reset, Intuition
**File:** `public/assets/zodiac-weekly/gemini/sunday.jpg`

**Prompt:**
```
premium luxury mystic astrology, high-quality Telegram visual, two elegant twin figures or dual celestial masks, air element, communication, intellect, motion, dark navy / black cosmic background, gold details, cinematic lighting, expensive editorial style. Mood: reflection, reset, intuition. no text, no watermark.
```

## Import Checklist

- [ ] Generate or acquire the 7 high-quality images.
- [ ] Crop/Resize to 1024x1024 if necessary.
- [ ] Compress and save as JPG format.
- [ ] Place files exactly at `public/assets/zodiac-weekly/gemini/monday.jpg`, etc.

## Validation Checklist

- [ ] Run `npm run zodiac:weekly-assets:validate` and ensure Gemini shows 7/7 and Global shows 7/91.
- [ ] Run `npm run zodiac:pipeline -- --days 1 --style luxury-mystic --channel gemini --limit 1` to dry-run and verify the correct weekly asset is selected without fallback.
