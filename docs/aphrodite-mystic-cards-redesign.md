# Aphrodite Mystic Cards Redesign

Package 241 redesigns the live Mystic Cards flow inside the Telegram Mini App. It is visual/UX work only: selection, closed-card state, reveal/result hierarchy, card meaning blocks, and preview-only locked deeper reading.

## Old Flow Issue

The existing Mystic Cards flow worked, but it read like a normal form plus list of result cards. Tarot and Rune had useful data and smoke coverage, yet the experience did not feel like a premium mystical reveal.

## Redesign Goals

- Make Mystic Cards feel premium, mystical, intimate, ritual-like, romantic, and modern.
- Use dark cosmic depth with violet, rose, and gold accents.
- Add closed-card, selected-card, revealed-card, empty/not selected, and preview-only locked states.
- Keep text short and readable in Telegram WebView at 360px, 390px, and 430px.
- Preserve the existing Tarot/Rune smoke selectors and result markers.

## Selection Section Changes

- `DailyCardFeature` now frames the daily/love/money/warning lanes as a closed-card reveal experience.
- `TarotCardFeature` now has a premium ritual frame before topic, question, and spread selection.
- `RuneDayFeature` now has a premium ritual frame before rune mode and question selection.
- Selection markers were added:
  - `data-aphrodite-mystic-cards-redesign="package-241"`
  - `data-aphrodite-mystic-card-selection="package-241"`
  - `data-aphrodite-mystic-card-input="package-241"`
  - `data-aphrodite-mystic-card-closed-state="package-241"`
  - `data-aphrodite-mystic-card-selected-state="package-241"`

## Reveal / Result Section Changes

- Tarot and Rune results now open with a reveal hero before the existing visual spread.
- `TarotSpreadVisual` and `RuneSpreadVisual` remain in place, preserving smoke markers:
  - `data-tarot-spread-visual="true"`
  - `data-tarot-card`
  - `data-rune-spread-visual="true"`
  - `data-rune-card`
- Result sections now separate card meaning / interpretation, risk, action, avoid, conclusion, and talisman blocks more clearly.
- Result markers were added:
  - `data-aphrodite-mystic-card-reveal="package-241"`
  - `data-aphrodite-mystic-card-spread="package-241"`
  - `data-aphrodite-mystic-card-result="package-241"`
  - `data-aphrodite-mystic-card-state="package-241"`
  - `data-aphrodite-mystic-card-empty-state="package-241"`

## Design System Primitives Used

- `AphroditeBadge`
- `AphroditeCard`
- `AphroditeMetricCard`
- `AphroditeMysticCardPreview`
- `AphroditeSectionHeader`

The redesign uses these primitives presentationally. No logic was added to design-system primitives.

## VIP Locked Preview

The Mystic context now includes a preview-only deeper Mystic Reading locked card:

- Deep card interpretation
- Love reading
- Money/luck reading
- Relationship warning
- Personal ritual/advice

This is preview only. There is no active payment, no entitlement bypass, and no real VIP unlock.

## Mobile / Telegram WebView Considerations

- Cards stack on mobile.
- Long Russian copy stays inside glass surfaces.
- No fixed bottom CTA was added.
- Existing Telegram WebView smoke and BackButton behavior remain untouched.
- Manual screenshots are still required for Telegram iOS WebView and Telegram Android WebView.

## What Was Not Changed

- Mystic Cards selection logic unchanged.
- `generateDailyCard`, `generateTarotDay`, `generateTarotSpread`, `generateRuneDay`, and `generateRuneSpread` unchanged.
- random/deterministic logic unchanged.
- storage logic unchanged.
- active CTA logic unchanged.
- compatibility flow not redesigned again.
- Birth Matrix / Natal flow not redesigned again.
- no Telegram API used.
- no messages sent.
- no DB write added.
- no external analytics added.
- no payment added.
- no VIP unlock added.
- no cron/workflow/publish scripts changed.
- no secrets added.
- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.

## QA

Package QA:

```powershell
node scripts/qa-aphrodite-mystic-cards-redesign.mjs
```

Full package checks also run typecheck, lint, build, Mini App smoke, dashboard QA, and key previous safety/design QA scripts.

## Next Package Recommendation

Package 242 - VIP Locked Preview Redesign.
