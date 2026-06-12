# Zodiac Asset Naming Conventions

To maintain strict consistency across the 13 Telegram channels in the Zodiac network, all visual assets must follow these naming rules. 

## General Rules
1. **Lowercase only**: All characters must be lowercase.
2. **Hyphens only**: Use hyphens `-` for separation. No spaces or underscores.
3. **Format**: Use `.png` or `.jpg` depending on alpha channel requirements (typically `.png` for avatars/logos, `.jpg` for large covers).

## Folder Structure
All assets reside in: `public/assets/zodiac/`
- `avatars/` - The profile pictures for the 13 channels.
- `covers/` - Optional channel cover images (premium channels).
- `daily/` - Daily post imagery (managed dynamically, not static).
- `placeholders/` - Fallback imagery when content generation fails.

## Required Avatar Names
Avatars must be placed in `public/assets/zodiac/avatars/`.

| Channel ID | Avatar Filename |
| :--- | :--- |
| `zodiac-general` | `avatar-zodiac-general.png` |
| `aries` | `avatar-aries.png` |
| `taurus` | `avatar-taurus.png` |
| `gemini` | `avatar-gemini.png` |
| `cancer` | `avatar-cancer.png` |
| `leo` | `avatar-leo.png` |
| `virgo` | `avatar-virgo.png` |
| `libra` | `avatar-libra.png` |
| `scorpio` | `avatar-scorpio.png` |
| `sagittarius` | `avatar-sagittarius.png` |
| `capricorn` | `avatar-capricorn.png` |
| `aquarius` | `avatar-aquarius.png` |
| `pisces` | `avatar-pisces.png` |

## Required Placeholders
Placeholders reside in `public/assets/zodiac/placeholders/`.

| Usage | Placeholder Filename |
| :--- | :--- |
| General Post | `placeholder-general.jpg` |
| Sign Post | `placeholder-[sign_id].jpg` (e.g. `placeholder-aries.jpg`) |

## Validation
Use the local validation script to check if the assets meet the naming conventions:
```bash
npm run zodiac:validate-assets
```
*Note: The validator checks names but does not enforce image resolutions.*
