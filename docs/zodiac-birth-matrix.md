# Zodiac Birth Matrix

Birth Matrix / `Матрица судьбы` is a Mini App feature that gives a symbolic numerology interpretation by birth date. It is designed as reflective product content, not a deterministic or fatal prediction.

## Product Contract

- Input: birth date only. The UI accepts `YYYY-MM-DD` and `DD.MM.YYYY`.
- Optional name/gender are not required for the current Birth Matrix flow.
- Result wording must stay honest: `символическая интерпретация по дате рождения`.
- The result must not claim exact destiny, diagnosis, guaranteed outcomes, or medical/psychological certainty.

## Calculation

The current deterministic symbolic model calculates:

- `lifePath`: main path / central number;
- `soulNumber`: inner motive;
- `realizationNumber`: money/work/realization line;
- `relationshipNumber`: relationship line;
- `dayNumber`: birthday accent;
- `lessonNumber`: life lesson as a growth theme;
- `resourceNumber`: available support/resource line;
- `archetype`: ASCII-safe archetype key plus user-facing Russian archetype label.

Master numbers `11`, `22`, and `33` are preserved when produced by digit reduction. Other numbers reduce to `1–9`.

## Result Structure

The Mini App result is intentionally structured instead of a long text wall:

- hero summary with archetype, central number, short interpretation, and honesty badge;
- `BirthMatrixVisual` with six zones: character, relationships, money/realization, energy, lesson, and resource;
- visual legend explaining the zones;
- sections/tabs: `Главное`, `Характер`, `Отношения`, `Деньги`, `Урок`, `Сегодня`;
- three recommendations;
- safe actions: `Сохранить матрицу` and `Поделиться`.

## Privacy

Birth Matrix must not store or send:

- raw birth date;
- name;
- birth time;
- city/city query;
- raw result text;
- generated section text.

Local retention may store only safe summary fields:

```text
featureKey
matrixType
archetype
mainNumber
label
timestamp
```

Analytics payloads are limited to:

```text
featureKey
matrixType
mainNumber
archetype
hasBirthDate
hasName
inputMode
```

## Checks

Run:

```bash
npm run zodiac:miniapp:smoke
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
```

Smoke must enter `01012000`, verify the field normalizes to `01.01.2000`, render the visual matrix, central number, legend, at least six Birth Matrix tabs/sections, safe Save/Share states, and verify localStorage does not contain the raw date.
