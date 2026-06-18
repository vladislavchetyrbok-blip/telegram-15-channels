# Zodiac Final AstroMap

`FinalAstroMap` is the shared symbolic visual layer for the Zodiac Mini App.

Source:

```text
components/zodiac-mini-app/AstroChartVisual.tsx
```

## What It Shows

- 12-sign zodiac wheel.
- Highlighted selected sign for personal/VIP tools.
- Highlighted first and second signs for couple tools.
- Deterministic colored energy lines and arrows:
  - emotions;
  - communication;
  - rhythm;
  - tension;
  - growth.
- Legend and optional score/tier in the center.

## Current Usage

- Couple Compatibility result: `Карта отношений`.
- VIP Natal Chart.
- VIP Extended Compatibility.
- VIP Mental Map.
- VIP Numerology.
- VIP Mystic Day.

The legacy `AstroChartVisual` export remains as a wrapper so existing VIP tools keep working while using the upgraded map internally.

## Feature Completion Audit

P0 after this package:

- No known dead screens in the smoke-covered Mini App flow.
- No known native white selects in active Mini App forms.
- No known share/save silence in Couple/VIP/Angel Numbers flows.
- No known unlocked Giveaways regression.

P1 fixed in this package:

- `Совместимость`: relationship result had strong text cards, but lacked a reusable symbolic relationship map. It now renders FinalAstroMap with pair highlights, score/tier, lines, arrows, and legend.
- `VIP раздел`: natal, compatibility, mental map, numerology, and mystic day now use the same visual standard and deeper result blocks.
- `Нумерология`: VIP result now includes what to do and what to avoid, not just score-like numbers.
- `Мистика`: VIP mystic day now has a visual symbolic map and a concrete small action.
- Regression coverage: smoke now checks map SVG, lines, arrows, and legend instead of only checking that a generic chart container exists.

Current P1/P2 backlog:

- `Гороскопы`: daily and weekly formats are ready; future package can add richer in-app archive/search if product data shows demand.
- `Матрица судьбы`: smoke covers non-empty result; future package can deepen calculation explanations.
- `Ангельские числа`: top-level and VIP interpretation work; future package can add saved number collections.
- `Таро и руны`: Mystic features work; future package can add richer spreads without changing current smoke contract.
- `Луна и ритуалы`: current feature is content-complete enough for smoke; future package can add a calendar-like view.
- `Мой профиль`: history/favorites/share are privacy-safe local shortcuts; future package can add cloud sync only after an explicit privacy/storage decision.
- Real astronomical calculations: future only. Do not claim exact houses, ascendant, planet degrees, or transits until a proper ephemeris engine and required user inputs exist.

## Honesty Policy

The map is symbolic and deterministic. It is not an ephemeris engine.

Required wording:

```text
Символическая карта энергий
Базовая визуализация без точных домов и асцендента.
```

Do not claim exact houses, ascendant, planet degrees, or astronomical transits unless a future package adds a real calculation engine and required user inputs.

## Analytics

Allowed safe events:

```text
final_map_opened
final_map_saved
final_map_shared
feature_depth_viewed
```

Allowed safe fields include only routing/category context such as:

```text
section
featureKey
sign
firstSign
secondSign
relationshipMode
scoreTier
chartType
```

Never send names, birth dates, birth times, city query, raw text input, raw result text, generated message text, Telegram initData, or secrets.

## Smoke Coverage

`npm run zodiac:miniapp:smoke` verifies:

- FinalAstroMap appears in Couple result.
- FinalAstroMap appears in VIP Natal Chart, Extended Compatibility, Mental Map, Numerology, and VIP Mystic Day.
- The map has visible SVG, lines, arrows, and legend.
- Save/share, BackButton, VIP, Mystic, Birth Matrix, Angel Numbers, Profile, History, and Favorites still work.
