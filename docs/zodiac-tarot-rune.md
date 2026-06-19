# Zodiac Tarot / Rune Mystic Flow

Package 22 upgrades the Mystic Tarot/Rune lane from simple daily cards into interactive symbolic spreads.

## Product Scope

- Tarot supports topics: `love`, `money`, `work`, `decision`, `hidden_reason`, `daily_advice`.
- Tarot supports spread types: `one_card`, `three_cards`, `five_cards`.
- Runes support modes: `daily_rune`, `three_runes`, `question_rune`, `protection_rune`.
- Results are deterministic from safe inputs: target date, zodiac sign, topic/mode, spread type, and only a normalized question state.
- Optional question text is used only in component state. It must not be saved, shared, logged, or sent to analytics.

## Trust Language

Tarot/Rune copy must stay honest:

- symbolic interpretation;
- spread for reflection and choosing a next action;
- no fatal promises;
- no claims like `точно произойдет`, `судьба решена`, or `100%`.

## Visuals

- `components/zodiac-mini-app/TarotSpreadVisual.tsx` renders card-style visuals with spread positions and legend.
- `components/zodiac-mini-app/RuneSpreadVisual.tsx` renders rune-stone visuals with orientation, position, and legend.
- Smoke relies on `data-tarot-spread-visual`, `data-tarot-card`, `data-tarot-position`, `data-rune-spread-visual`, and `data-rune-card`.

## Privacy

Safe retention may store only:

```text
featureKey
mode
topic
spreadType
cardKeys
runeKeys
timestamp
label
```

Forbidden in localStorage, share text, analytics, and docs examples:

```text
raw question
raw generated result text
name
birth date
birth time
city query
Telegram initData
```

## Analytics

Allowlisted events:

```text
tarot_started
tarot_spread_calculated
tarot_spread_saved
tarot_spread_shared
rune_started
rune_spread_calculated
rune_spread_saved
rune_spread_shared
feature_depth_viewed
```

Payload is limited to safe fields:

```text
featureKey
mode
topic
spreadType
cardCount
runeCount
resultTier
```

## Verification

Run:

```bash
npm run zodiac:miniapp:smoke
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
```

Expected smoke summary includes:

```text
Tarot richer spread checked: YES (3/3 cards)
Rune richer spread checked: YES (3/3 runes)
```
