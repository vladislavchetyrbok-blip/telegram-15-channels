# Zodiac Desktop QA Harness

The desktop QA harness is a local browser/CDP visual regression layer for the Zodiac Mini App. It is not a product feature and it does not replace the real Telegram phone WebView pass.

## Command

```bash
npm run zodiac:desktop:qa
```

Optional arguments:

```bash
npm run zodiac:desktop:qa -- --url http://localhost:3000/compatibility
npm run zodiac:desktop:qa -- --viewports 390x844,412x915,1440x900
```

By default it checks:

- `390x844` iPhone-like viewport;
- `412x915` Android-like viewport;
- `1440x900` desktop viewport.

The command runs the Mini App smoke flow for each viewport and enables screenshot capture through the smoke script. It starts a local Next server when no URL is provided.

## Artifacts

Runtime artifacts are written to:

```text
data/runtime/zodiac-desktop-qa/YYYY-MM-DD-HH-mm/
data/runtime/zodiac-desktop-qa/latest-report.json
```

Each run contains:

- smoke logs per viewport;
- screenshots under `screenshots/<viewport>/`;
- `report.json`;
- `latest-report.json` copied to the root runtime QA folder.

`data/runtime` is ignored by git. Do not commit screenshots or reports if they contain user/session data.

## What It Checks

The harness uses the existing Mini App smoke coverage as its functional backbone:

- main menu 10 categories;
- Compatibility result;
- Premium Natal Chart;
- Premium Natal Chart exact-unavailable engine status;
- Birth Matrix;
- Tarot 3-card spread;
- Rune spread;
- Lunar ritual;
- Angel Numbers;
- VIP 11/11 quick check;
- Profile / History / Favorites;
- Feedback panel;
- safe share drafts;
- Telegram WebApp mock;
- console/runtime/network errors.

During screenshot capture it also checks:

- no horizontal overflow;
- no visible native white `<select>`;
- screenshot artifacts for main menu, compatibility result, premium natal, birth matrix, tarot, rune, lunar ritual, VIP page, profile/history/favorites, and feedback panel.
- the Premium Natal screenshot includes the Real Astro Engine status panel when the result is open.

## Privacy Rules

The QA harness must not commit or publish artifacts containing:

- real names;
- birth dates;
- birth times;
- city query;
- raw tarot/rune question;
- raw lunar intention;
- raw feedback text;
- raw result text;
- Telegram session data;
- private chats or production channel screens.

The scripted test uses synthetic data such as `01012000 -> 01.01.2000`, `12:00`, and `Test City`, and smoke assertions verify these values do not leak into localStorage/share drafts. Runtime artifacts are still intentionally ignored because screenshots can contain transient UI state.

## Manual Limitations

Desktop QA is useful for fast regression checks, but it does not prove:

- native Telegram WebView safe-area behavior on a physical phone;
- real iOS/Android keyboard overlay behavior;
- Telegram app share sheet behavior;
- production bot/startapp deployment wiring;
- real device scrolling feel.

Use `docs/zodiac-real-phone-webview-checklist.md` for the final phone pass.
For screenshot/video intake and bug triage, use
`docs/zodiac-real-phone-evidence-intake.md` and
`docs/zodiac-real-phone-bug-report-template.md`.

Desktop QA must not be used as proof of:

- real Telegram phone WebView behavior;
- real iOS/Android keyboard overlay behavior.

## Before Soft Launch

Recommended local sequence:

```bash
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:desktop:qa
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
npm run production:safety:check
```

Soft launch can proceed only if desktop QA is PASS or its limitations are explicitly accepted, and the real phone pass still has no P0/P1 issues.
