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

## Implementation Phases

Phase 1: interface, provider placeholders, UI status, and checks. This package.

Phase 2: geocoding and timezone strategy. Decide how city ambiguity, aliases, DST, and coordinates are resolved without leaking user data.

Phase 3: ephemeris provider integration. Add a real provider only after Windows/build/deploy validation and fixture tests.

Phase 4: exact natal chart UI. Show ascendant, planets, houses, warnings, and source/provider status only when exact mode is genuinely available.

Phase 5: exact compatibility and aspects. Reuse the provider for synastry/aspects after natal exact mode is stable.

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
```

The check must pass before soft launch or future exact-engine work is considered ready.
