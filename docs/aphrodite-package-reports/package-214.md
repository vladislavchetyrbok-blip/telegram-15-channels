# Package 214 - Real Device Evidence Pack

Status: completed locally after QA.

## Scope

Package 214 improves the existing real-device readiness page:

- `lib/zodiac/aphrodite-real-device-visual-qa-checklist.ts`
- `app/dashboard/networks/zodiac/real-device-visual-qa-checklist/page.tsx`
- `scripts/qa-aphrodite-real-device-visual-qa-checklist.mjs`
- `scripts/qa-zodiac-dashboard.mjs`
- `docs/aphrodite-real-device-evidence-pack.md`

## Evidence Added

- mandatory evidence checklist for desktop, mobile browser, Telegram WebView, startapp/deep links,
  Mini App main screen, compatibility, Birth Matrix, Mystic cards, VIP locked state, CTA visibility,
  cache/version marker, and owner manual review
- explicit statuses: PASS, NEEDS FIX, BLOCKED, NOT CHECKED, OWNER REVIEW REQUIRED
- per-check required screenshot field
- per-check PASS criteria
- per-check FAIL criteria
- per-check cannot automate rules
- owner review block with `publicLaunchApproved=false` and `ownerManualReviewRequired=true`

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Active CTA logic changed: No
- DB write added: No
- External analytics added: No
- Payment added: No
- VIP unlock added: No
- Cron/workflows/publish scripts changed: No

## Remaining Manual Checks

- collect real desktop browser screenshot
- collect mobile browser screenshots at 360px / 390px / 430px
- collect iOS and Android Telegram WebView screenshots
- verify startapp/deep link routes manually
- verify Mini App main screen, compatibility, Birth Matrix, Mystic cards, VIP locked state, CTA visibility,
  and cache/version marker evidence
- move any NEEDS FIX / BLOCKED items to Visual Issue Triage Board
- owner must manually approve launch outside this package
