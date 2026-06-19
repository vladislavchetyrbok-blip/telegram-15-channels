# Zodiac New Chat Handoff Snapshot

Date: 2026-06-20
Purpose: safe context handoff for a new ChatGPT/Codex chat.

This document is a compact but complete handoff for the Telegram Zodiac / Horoscope Mini App project. It is documentation-only. It does not authorize live publishing, weekly live, payments, Stars, profile sync, exact astrology claims, manual ledger edits, or product behavior changes.

## 1. Project Identity

```text
Project: Telegram Zodiac / Horoscope Mini App
Repo: vladislavchetyrbok-blip/telegram-15-channels
Local path: G:/telegram-15-channels
Main Mini App route: /compatibility
Bot/startapp link: https://t.me/zodiac_love_check_bot?startapp=compat
Current branch: main
Current HEAD at handoff creation: 90eda298d4b39de029ab841ec8363485f844cff7
```

Important docs to read first in a new chat:

```text
docs/zodiac-new-chat-handoff.md
docs/zodiac-controlled-launch-freeze.md
docs/zodiac-soft-launch-release-candidate.md
docs/zodiac-production-readiness.md
docs/zodiac-real-phone-webview-checklist.md
```

## 2. Current Verdict

```text
Controlled soft launch: GO
Invite first 5 users: GO
Invite 20 users: CONDITIONAL
Mass public launch: STOP
Weekly live: STOP
Payments/Stars: STOP
Profile sync: STOP / disabled
Exact astro claims: STOP / exact_unavailable
Redis analytics: CONDITIONAL / env missing
```

The current product is ready for a small trusted tester loop, not for broad public launch.

## 3. Product Readiness

```text
Readiness for controlled soft launch: about 92%
Mass launch readiness: not yet
Commercial paid readiness: not yet
```

Current product categories:

```text
Horoscope: PASS
Compatibility / Relationship Map: PASS
Angel Numbers: PASS
Birth Matrix: PASS
Numerology: PASS
Mystic: PASS
Tarot/Rune: PASS
Lunar/Ritual: PASS
VIP 11/11: PASS
Profile/History/Favorites: PASS
Feedback flow: PASS
Safe share: PASS
Sonnik/Dream Dictionary: hidden backlog, not part of current soft launch
```

Mini App smoke currently covers the 10-category home, mobile date input normalization, Compatibility, Premium Natal, Birth Matrix, Tarot/Rune, Lunar/Ritual, Angel Numbers, VIP 11/11, Profile/History/Favorites, Feedback, safe Share, Telegram mock, BackButton, haptics, custom selects, hidden Sonnik regression checks, and localStorage privacy.

## 4. Major Completed Packages / Milestones

Use these commits as context anchors:

```text
4a3e077 feat: add final astro map and deepen feature results
2912211 feat: add premium natal chart experience
1ae90a3 feat: polish premium natal chart ux
f5a7826 feat: deepen birth matrix experience
013ac34 feat: deepen tarot and rune mystic flows
d90a1fc feat: deepen lunar ritual experience
6f6bcb8 fix: harden zodiac daily scheduler timing
bfabb69 docs: add zodiac soft launch runbook
8f1db42 docs: add zodiac soft launch feedback triage
cd8d160 feat: add zodiac soft launch feedback flow
d81b908 feat: polish zodiac safe share loops
e54a0fd docs: add zodiac monetization readiness plan
f642e1a docs: add zodiac soft launch release candidate
bc8483c test: add zodiac desktop visual qa harness
8d29264 feat: add zodiac real astro engine readiness layer
30c80ec fix(safety): implement Gemini 36A safety checks and UI light-mode fixes
75ed31c test(safety): add check-zodiac-ledger-safety test script and override bindings
ace0268 fix: recover zodiac mini app qa after Gemini audit
91ee5c6 feat: add telegram webapp initdata auth foundation
c7278c9 feat: add disabled zodiac profile sync api foundation
b2ed94e feat: add disabled zodiac profile sync frontend scaffold
483af64 feat: add disabled zodiac profile sync merge logic
d82cb6c feat: add disabled zodiac profile sync storage readiness
7d7100a feat: show disabled profile sync status
6b275eb test: harden zodiac profile sync privacy checks
9da235e docs: add real astro engine provider fixture plan
457eaa9 docs: add zodiac post sync foundation regression
c0b4975 docs: add zodiac controlled soft launch execution pack
282828e docs: add zodiac real phone evidence intake
aca6dc5 fix: clarify zodiac analytics noop dashboard state
5cfc4ac docs: add zodiac daily autopilot stability report
90eda29 docs: add zodiac controlled launch freeze
```

Current latest package:

```text
Package 51: New Chat Handoff Snapshot
Status: this document
```

## 5. Current Safety Rules

Hard rules for any new chat or agent:

```text
Do not run live publish without explicit approval.
Do not manually edit ledger.
Do not enable weekly live.
Do not enable payments/Stars.
Do not enable profile sync.
Do not enable exact astro claims.
Do not store raw birth date/time/city/question/intention/feedback/result text.
Do not store raw initData.
Do not commit secrets.
Do not commit real user screenshots/feedback with personal data.
```

Additional boundaries:

- Do not change Mini App product behavior during docs-only packages.
- Do not use real tester notes or screenshots in commits.
- Do not add referral tracking or personal identifiers.
- Do not treat Telegram `initDataUnsafe` as trusted identity.

## 6. Current Infrastructure State

```text
Daily scheduler: ON, hardened
Daily cron shifted away from :00/:30
Weekly live: OFF
Weekly dry-run: ready but not live
Ledger safety: fail-closed check exists
Desktop QA harness: exists, npm run zodiac:desktop:qa
Astro exact engine: exact_unavailable, symbolic active
Profile sync: disabled, no backend writes
Analytics storage: noop
Redis analytics env: missing
Payments/Stars: OFF
VIP free/promo until: 2026-09-17
Giveaways: locked/preview intentional
```

Daily cron attempts:

```text
7 6 * * *
19 6 * * *
37 6 * * *
52 6 * * *
11 7 * * *
```

Daily target date policy: Europe/Kyiv calendar date. Duplicate protection is ledger/dedupe based and must remain in place before Telegram API calls.

Weekly lane: content and dry-run are prepared, but weekly live schedule remains OFF until a separate explicit package and approval.

## 7. Required Env Still Missing

Do not print or commit values. These are names only.

```text
ZODIAC_ANALYTICS_REDIS_URL
ZODIAC_ANALYTICS_REDIS_TOKEN

Optional future profile sync env:
ZODIAC_PROFILE_SYNC_ENABLED=false
ZODIAC_PROFILE_SYNC_BACKEND=none
ZODIAC_PROFILE_SYNC_READ_ENABLED=false
ZODIAC_PROFILE_SYNC_WRITE_ENABLED=false
ZODIAC_PROFILE_SYNC_REDIS_URL
ZODIAC_PROFILE_SYNC_REDIS_TOKEN
```

Redis analytics currently remains `noop` until both Redis REST env vars are configured in hosting and the app is redeployed.

## 8. Canonical Check Commands

Run these when taking over in a new chat or before a controlled launch checkpoint:

```bash
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:desktop:qa
npm run zodiac:astro:check
npm run zodiac:astro:fixtures:check
npm run zodiac:ledger:safety:check
npm run zodiac:telegram-auth:check
npm run zodiac:profile-sync:check
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
npm run zodiac:workflow:check -- --date 2026-06-20
npm run zodiac:publish-date:dry -- --date 2026-06-20
npm run production:safety:check
git diff --check
```

For docs-only packages, the minimum accepted check set is:

```bash
npm run lint
npm run build
npm run production:safety:check
git diff --check
```

## 9. Next Recommended Steps

```text
1. Manual real-phone Telegram WebView sanity pass on iPhone/Android.
2. Invite first 5 controlled testers.
3. Collect feedback using soft-launch templates.
4. Fix P0/P1 if found.
5. Add Redis analytics env if ready.
6. Observe daily scheduler stability for several days.
7. Only later consider weekly live.
8. Only later consider payments/Stars.
9. Only later consider exact astro provider.
10. Only later enable profile sync in controlled mode.
```

Expansion from 5 to 20 users is conditional on P0 = 0, P1 = 0 or fixed, average rating >= 7, share/save working, phone pass acceptable, and no privacy leaks.

## 10. First Tester Message

Use this as a human message. Do not commit real tester replies with personal data.

```text
Привет. Я собрал Telegram Mini App с гороскопами, совместимостью, натальной картой, матрицей судьбы, таро, рунами и лунными ритуалами.

Открой, пожалуйста, именно с телефона через Telegram:
https://t.me/zodiac_love_check_bot?startapp=compat

Проверь 2-3 функции и напиши:
1. что понравилось;
2. где было непонятно;
3. где что-то сломалось;
4. какая функция самая сильная;
5. отправил(а) бы ты это кому-то ещё.
```

## 11. COPY THIS INTO NEW CHAT

```text
We are continuing the Telegram Zodiac Mini App project.

Repo: G:/telegram-15-channels
Branch: main
Current HEAD at handoff creation: 90eda298d4b39de029ab841ec8363485f844cff7

The project is ready for controlled soft launch to first 5 users, but not mass launch.

Critical rules:
- Do not run live publish without explicit approval.
- Do not manually change ledger.
- Do not enable weekly live.
- Do not enable payments/Stars.
- Do not enable profile sync.
- Do not claim exact astrology; exact provider is unavailable.
- Do not store raw birth date/time/city/question/intention/feedback/result text.
- Analytics storage is noop until Redis env is added.

Current product PASS:
10 categories, Compatibility, Premium Natal, Birth Matrix, Tarot/Rune, Lunar/Ritual, Angel Numbers, VIP 11/11, Profile/History/Favorites, Feedback, Safe Share, Desktop QA, Ledger safety, Telegram initData auth foundation, Profile sync foundations disabled.

Current next step:
Manual real-phone Telegram WebView sanity pass, then first 5 testers.
```
