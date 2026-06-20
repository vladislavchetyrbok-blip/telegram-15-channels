# Zodiac First Users Analytics Baseline

## 1. Baseline Identity
* **Baseline Timestamp**: 2026-06-20T04:39:00+03:00
* **Current HEAD**: `fddabe55213365b31078c7cdde899facf2057e3a`
* **Production Analytics Mode**: `redis`
* **Analytics Dashboard**: `/dashboard/networks/zodiac/analytics` (sidebar link: Аналитика; overview CTA: Открыть аналитику)
* **Feedback Center**: `/dashboard/networks/zodiac/feedback` (sidebar link: Отзывы; local-only sanitized first-user triage)

## 2. Verification / Test Events Note
* **Note**: Package 55 created safe test events (app opens, compatibility, tarot, lunar, feedback, share clicks) to verify the production Redis analytics pipeline.
* **Treatment**: These events should be treated as technical baseline/noise.
* **Do Not Reset**: Do not clear Redis before inviting the first 5 users.

## 3. Current Dashboard Counters Snapshot
* **app_open**: 70
* **sign_selected**: 43
* **section_open**: 171
* **calculation**: 3
* **date bucket 2026-06-20**: 10
* *(Other counters like compatibility, birth matrix, tarot, lunar, share, feedback are present but merged into the above section and funnel counters).*

## 4. What to Watch After First 5 Users
When the first 5 trusted users are invited, observe the following in analytics and feedback:
* **Opens**: Are they opening the app multiple times?
* **Top Sections**: What are they clicking on the most?
* **Compatibility**: Are they starting compatibility checks and reaching results?
* **Premium Natal Usage**: Are they opening the natal chart?
* **Birth Matrix Usage**: Are they interacting with the matrix?
* **Tarot/Rune Usage**: Are they doing readings?
* **Lunar/Ritual Usage**: Are they opening lunar rituals?
* **Share events**: Are they trying to share results?
* **Feedback**: Are they opening the feedback panel, drafting comments, or submitting them?
* **Save/History**: Are they trying to save items?

## 5. What Would Be Bad (Red Flags)
* `app_open` occurs but no feature usage (indicates immediate drop-off or crash).
* Many opens but no results/calculations (indicates UX blockers or calculation failures).
* No share or save attempts.
* High volume of feedback bug reports.
* **CRITICAL**: Any raw sensitive data (real names, exact birth dates, times, cities, raw Telegram initData) visible in the analytics stream.

## 6. After First 5 Users Review
After the initial test, perform a comparison:
* Document the new counters.
* Calculate the deltas against this baseline.
* Triage any P0/P1/P2 issues before expanding the rollout.

## 7. Package 58 Dashboard Reading

Use `/dashboard/networks/zodiac/analytics` after the first 5 users and record:

* `Mini App opens`
* `Feature opens`
* `Results calculated`
* `Save actions`
* `Share actions`
* `Feedback opened`
* Top sections for first users:
  `Compatibility`, `Premium Natal`, `Birth Matrix`, `Tarot/Rune`,
  `Lunar/Ritual`, `Angel Numbers`, `VIP`, `Profile`

The funnel to read is:

```text
Open Mini App -> Open Feature -> Get Result -> Save/Share -> Feedback
```

Bad signs:

* Opens grow but feature usage does not.
* Feature usage grows but result events do not.
* Results happen but save/share remains zero.
* Feedback opens only after visible product blockers.
* Any raw birth data, city, question, intention, feedback text, result text,
  Telegram initData, Redis URL value, or Redis token value appears.

After the review, keep mass launch, weekly live, payments/Stars, profile sync,
and exact astro claims OFF until separate packages approve them.

## 8. Package 61 Feedback Center

Use `/dashboard/networks/zodiac/feedback` after the first users reply.

Record only sanitized summaries:

* Tester label (`Tester 1`, `Tester 2`, etc.), not real names.
* Device and Telegram app category.
* Rating 1-10 if provided.
* Strongest feature, confusion, broken flow, and sanitized note.
* Severity: P0 / P1 / P2 / Backlog / Positive.
* Status: New / Accepted / Fixed / Deferred.

The page stores entries in browser `localStorage` only. It does not create a
server write API, does not store raw birth data/questions/intentions/results,
and does not show Redis or Telegram token values.
