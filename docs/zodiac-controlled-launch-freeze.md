# Zodiac Controlled Launch Freeze

Date: 2026-06-20
Branch: `main`
Freeze base HEAD: `5cfc4ac6e0ab5f2daa2ff758604fb46608215b6e`

This document freezes the current Zodiac product state as a controlled soft-launch checkpoint. It does not authorize mass launch, weekly live publishing, payments, Telegram Stars, profile sync activation, exact astrology claims, manual daily live publish, or manual ledger edits.

New chat handoff snapshot:

```text
docs/zodiac-new-chat-handoff.md
```

## Launch Status

| Area | Decision |
| --- | --- |
| Controlled launch | YES |
| Invite first 5 users | GO |
| Invite up to 20 users | CONDITIONAL |
| Mass public launch | NO |
| Weekly live | NO |
| Payments/Stars | NO |
| Profile sync | disabled |
| Exact astrology | `exact_unavailable` |
| Redis analytics | `noop` |
| Real phone pass | manual gate |

Controlled launch readiness remains `92%`. The product is ready for a small trusted tester loop, but not for a mass public launch.

## Current Product Boundary

- Daily publishing stays active through the ledger-protected scheduler.
- Weekly live remains OFF.
- Payments, Telegram Stars, and VIP entitlement enforcement remain OFF.
- VIP remains in free promo mode until `2026-09-17`.
- Profile sync remains disabled, unmounted, local-only, and without production writes.
- Exact astrology remains unavailable. Current natal and map features are symbolic and must not claim exact houses, ascendant, real planet degrees, or ephemeris-level precision.
- Redis analytics env is not configured, so dashboard counters remain `noop`.
- Real phone Telegram WebView evidence is still required before wider rollout.
- Sonnik/Dream Dictionary is hidden backlog and is not a current soft-launch feature.
- Mini App date inputs use visible `ДД.ММ.ГГГГ` fields with digit/paste normalization.

## Checks Summary

The Package 50 final suite was run after removing `.next`.

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm run zodiac:miniapp:smoke` | PASS |
| `npm run zodiac:desktop:qa` | PASS |
| `npm run zodiac:astro:check` | PASS |
| `npm run zodiac:astro:fixtures:check` | PASS |
| `npm run zodiac:ledger:safety:check` | PASS, `4/4` fail-closed checks |
| `npm run zodiac:telegram-auth:check` | PASS, `8/8` |
| `npm run zodiac:profile-sync:check` | PASS, `65/65` |
| `npm run zodiac:analytics:check` | PASS, storage mode `noop` |
| `npm run zodiac:analytics:storage:check` | PASS, `noop` warning, Redis env `0/2` |
| `npm run zodiac:workflow:check -- --date 2026-06-20` | Static checks PASS, warning only: no GitHub token and no local report yet |
| `npm run zodiac:publish-date:dry -- --date 2026-06-20` | PASS, Would Publish `13/13`, CTA `13/13`, Telegram API calls `0`, ledger writes `0` |
| `npm run production:safety:check` | PASS |
| `git diff --check` | PASS |

Desktop QA covered `390x844`, `412x915`, and `1440x900`; all viewports passed with console/runtime/network errors `0/0/0`.

Mini App smoke covered the 10-category home, mobile date input normalization, Compatibility, Premium Natal, Birth Matrix, Tarot/Rune, Lunar/Ritual, Angel Numbers, VIP `11/11`, Profile/History/Favorites, Feedback, safe Share, Telegram mock, BackButton, haptics, custom selects, hidden Sonnik regression, and localStorage privacy.

## Final Stop/Go Matrix

```text
Invite first 5 users: GO
Invite 20 users: CONDITIONAL
Mass public launch: STOP
Weekly live: STOP
Payments/Stars: STOP
Profile sync: STOP
Exact astro claims: STOP
Redis analytics activation: CONDITIONAL, requires env
```

## Conditional Expansion Rules

Expand from the first 5 testers only if all of these remain true:

- P0 = `0`.
- P1 = `0` or fixed.
- Average rating is `>= 7`.
- Share works.
- Save/history works.
- Real phone pass is acceptable.
- No privacy leaks are reported.
- No daily publishing duplicate risk appears.

## Stop Rules

Stop the controlled launch immediately if any of these happen:

- Mini App does not open or shows a white screen.
- Result pages fail or show empty content.
- Save/share breaks globally.
- Telegram WebView UI overlaps critical buttons.
- Keyboard blocks required inputs.
- Raw personal data appears in localStorage, analytics, screenshots committed to the repo, logs, reports, or dashboard output.
- Daily publish duplicates or ledger safety fails.
- Any P0 is reported.

## Required Manual Gate

Before expanding beyond the first trusted testers, complete the real phone Telegram WebView pass using:

```text
docs/zodiac-real-phone-webview-checklist.md
docs/zodiac-real-phone-evidence-intake.md
docs/zodiac-real-phone-bug-report-template.md
```

Desktop QA and Telegram mock checks are valuable, but they do not replace real iPhone/Android Telegram WebView evidence.

## Safety Statement

- Live publish: NO.
- Ledger changed manually: NO.
- Weekly live: NO.
- Payments/Stars: OFF.
- Profile sync enabled: NO.
- Production profile writes: NO.
- Exact astrology claims: NO.
- Real tester feedback/screenshots committed: NO.
