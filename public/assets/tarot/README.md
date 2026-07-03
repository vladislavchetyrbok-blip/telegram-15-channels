# Tarot Card Assets

Place approved, optimized `.webp` Major Arcana artwork here.

Expected V1 filenames:

- `major-00-fool.webp`
- `major-01-magician.webp`
- `major-02-high-priestess.webp`
- `major-03-empress.webp`
- `major-04-emperor.webp`
- `major-05-hierophant.webp`
- `major-06-lovers.webp`
- `major-07-chariot.webp`
- `major-08-strength.webp`
- `major-09-hermit.webp`
- `major-10-wheel-of-fortune.webp`
- `major-11-justice.webp`
- `major-12-hanged-man.webp`
- `major-13-death.webp`
- `major-14-temperance.webp`
- `major-15-devil.webp`
- `major-16-tower.webp`
- `major-17-star.webp`
- `major-18-moon.webp`
- `major-19-sun.webp`
- `major-20-judgement.webp`
- `major-21-world.webp`

Use only artwork that is approved for this project. Do not fetch remote images at runtime.

When an approved asset is added, also add its public path to:

`data/config/tarot-card-assets.json`

The Mini App only renders image files listed in that manifest. Missing assets fall back to the built-in premium CSS card without requesting a broken image URL.
