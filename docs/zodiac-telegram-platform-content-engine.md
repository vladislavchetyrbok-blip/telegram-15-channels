# Zodiac Telegram Platform Content Engine

Package 63 | 2026-06-20

Route:

```text
/dashboard/networks/zodiac/content
```

The Content Engine is the owner-facing preparation surface for Telegram content
templates, rubrics, CTA/startapp previews, quality checks, and local drafts. It
does not publish to Telegram, write the ledger, or create a server-side write
API.

## What It Contains

- status cards for templates, rubrics, RU/UA quality, CTA/startapp, drafts, and
  publishing readiness;
- template catalog for daily horoscope, weekly forecast, compatibility,
  Mini App invite, VIP teaser, Birth Matrix, Natal Chart, Tarot/Rune, Lunar
  Ritual, Angel Numbers, navigation posts, soft launch invites, and custom posts;
- Template Studio with Telegram preview and compact channel-card preview;
- generated text, generated config/snippet, and generated checklist;
- RU/UA quality checklist stored in browser `localStorage`;
- rubric planner with suggested cadence, channel, CTA, and draft/ready status.

## Local-Only Model

The Template Studio is safe by default:

- browser `localStorage` only;
- no server writes;
- no Telegram API calls;
- no live publish button;
- no ledger writes;
- no raw Telegram `initData`;
- no raw birth date/time/city/question/intention/result text.

The local draft sanitizer redacts token/env-like values, date/time-like values,
phone/email-like values, and private-field labels before storing the draft.

## Template Studio Fields

- Template type;
- Language: `RU` / `UA` / `EN`;
- Channel/topic;
- Tone: мистический, спокойный, продающий, премиальный, короткий, дружеский;
- Title;
- Body;
- CTA text;
- Mini App `startapp` parameter;
- Emoji intensity: `none` / `low` / `medium`;
- Status: `draft` / `ready` / `needs review`;
- Notes.

## Validation Rules

Blocking checks:

- title required;
- body required;
- language selected;
- `startapp` parameter is URL-safe and not secret-like;
- no token/secret fields;
- no raw personal data;
- no exact astrology claims.

Warning checks:

- text may mix RU/UA/EN accidentally;
- body may be too long for Telegram readability;
- CTA may be missing.

Exact astrology remains:

```text
symbolic only / exact_unavailable
```

Do not claim that the app precisely calculated ascendant, houses, planets, or
other exact astrological data until an approved provider and accuracy process
exist.

## RU/UA Quality Checklist

The `Проверка качества текста` checklist covers:

- понятный заголовок;
- нет канцелярита;
- нет кривого машинного русского;
- нет смешения RU/UA;
- CTA понятен;
- emoji не перегружены;
- текст не слишком длинный;
- нет ложных точных астрологических claims;
- нет персональных данных;
- есть переход в Mini App.

The checklist state is localStorage-only and does not change publishing state.

## Rubric Planner

Rubrics are planning hints only:

- ежедневный прогноз;
- совместимость;
- прогноз недели;
- мистика дня;
- число дня;
- карта дня;
- лунный ритуал;
- VIP teaser;
- вопрос дня;
- soft launch feedback;
- announcement.

No live scheduling changes are made from this page.

## CTA / Startapp Rules

- Default Mini App CTA: `startapp=compat`;
- Mystic CTA: `startapp=mystic`;
- Birth Matrix CTA: `startapp=birth_matrix`;
- VIP CTA: `startapp=vip`;
- Angel Numbers CTA: `startapp=angel_numbers`;
- Weekly forecast CTA: `startapp=week`.

`startapp=compat` must keep opening home/main, not stale Mystic.

## Publishing Center Connection

The Publishing Center links to the Content Engine for local text preparation.
Package 63 intentionally does not auto-import content drafts into publishing
flows. The safe process is still manual:

1. prepare local content draft;
2. review language and CTA;
3. run dry-run;
4. get manual approval;
5. publish only through the approved process outside the dashboard.

## Future Server-Backed CMS Requirements

Before any server-backed content CMS is enabled, the project needs:

- authenticated admin backend;
- Owner/Admin/Editor/Viewer role checks;
- server-side audit log;
- privacy review;
- approval workflow;
- tests proving no raw sensitive data is stored;
- no unauthenticated write routes;
- explicit owner approval for live publish paths.
