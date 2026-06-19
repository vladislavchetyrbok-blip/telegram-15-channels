# Zodiac Real Astro Engine Readiness

Package 35 adds the architecture contract for a future exact astrology engine without enabling exact calculations today.

## Current State

- Current user-facing natal chart: symbolic.
- Exact engine: `exact_unavailable`.
- Active provider for current UI: `symbolic`.
- Future provider placeholder: `future_exact_provider`.
- No exact planet degrees, houses, ascendant, aspects, or transits are shown.
- The UI must not fabricate exact values with deterministic, random, seeded, or sign-only logic.

The current Premium Natal Chart remains useful as a symbolic premium interpretation. It is not an ephemeris chart.

## What Exact Mode Needs

Exact natal calculation requires all of the following before it can be presented to users:

- birth date;
- birth time;
- birth city;
- timezone;
- latitude and longitude;
- ephemeris provider;
- house system decision;
- validated fixtures for known charts;
- server-side runtime path that works in deployment.

If any of these are missing, the engine must return `exact_unavailable` and the UI must stay symbolic.

## Provider Requirements

Future exact provider requirements:

- deterministic outputs for the same input;
- no external calls that leak raw birth data without a reviewed privacy decision;
- no secret values printed in logs;
- no raw birth date, birth time, city query, or coordinates sent to analytics;
- server-side calculation preferred;
- Windows and production build compatibility proven before adoption;
- no browser-heavy native dependency unless it has passed local and CI build tests.

## Provider Layer

Current files:

```text
lib/zodiac-astro-engine.ts
lib/zodiac-astro-providers/symbolic-provider.ts
lib/zodiac-astro-providers/exact-provider-placeholder.ts
```

`symbolic-provider.ts` powers the current honest symbolic mode. It can return sign, element, modality, and polarity, but it must never claim exact astronomical values.

`exact-provider-placeholder.ts` returns `exact_unavailable`. It does not return planets, houses, ascendant, or degrees.

## Provider Decision and Fixture Harness

Package 44 adds a future-provider fixture harness without enabling exact mode.

Current decision:

- keep the active UI in symbolic mode;
- keep exact provider status `exact_unavailable`;
- do not add external API calls;
- do not send birth data to any remote service;
- validate future fixture shape before choosing an exact provider.

Fixture files:

```text
data/fixtures/zodiac-astro-engine/fixture-set.json
scripts/check-zodiac-astro-fixtures.mjs
```

Fixtures are deterministic placeholders only. They use non-personal sample dates
such as `1990-01-01` and `2000-06-15`, UTC timezone, placeholder city labels,
and placeholder coordinates. They must not include names, user ids, phone
numbers, real user city queries, or any personal notes.

Run:

```bash
npm run zodiac:astro:fixtures:check
```

The fixture check verifies:

- fixture format is valid and marked non-personal;
- symbolic provider returns safe symbolic output;
- exact provider remains `exact_unavailable`;
- no fake planet degrees, houses, or ascendant are returned;
- no external API calls are introduced;
- docs keep exact mode documented as unavailable.

## Implementation Phases

Phase 1: interface, provider placeholders, UI status, and checks. This package.

Phase 2: fixture harness and provider decision docs. Current Package 44 state.

Phase 3: geocoding and timezone strategy. Decide how city ambiguity, aliases, DST, and coordinates are resolved without leaking user data.

Phase 4: ephemeris provider integration. Add a real provider only after Windows/build/deploy validation and fixture tests.

Phase 5: exact natal chart UI. Show ascendant, planets, houses, warnings, and source/provider status only when exact mode is genuinely available.

Phase 6: exact compatibility and aspects. Reuse the provider for synastry/aspects after natal exact mode is stable.

## Risks

- timezone errors;
- ambiguous cities;
- native dependency build failure;
- wrong house system or undocumented house system;
- false precision claims;
- accidental analytics/localStorage leakage of birth data;
- confusing users by mixing symbolic and exact language.

## Required Check

Run:

```bash
npm run zodiac:astro:check
npm run zodiac:astro:fixtures:check
```

The check must pass before soft launch or future exact-engine work is considered ready.
