# Zodiac Soft Launch Batch Template

Use this file as a blank structure only. Do not commit real tester names,
Telegram handles, phone numbers, screenshots, birth dates, birth times, cities,
raw questions, raw intentions, raw feedback text, or raw result text.

For real feedback, keep raw notes outside the repository and commit only
anonymous aggregate conclusions when needed.

## Batch Summary

```text
Batch:
Date:
Tester count:
iPhone count:
Android count:
Telegram-only users: YES/NO
P0 count:
P1 count:
P2 count:
Average rating 1-10:
Would share with friend YES count:
Would share with friend NO count:
Decision: STOP / FIX / EXPAND
```

## Anonymous Tester Rows

```text
Tester ID:
Device:
Telegram version:
Opened successfully: YES/NO
Top feature:
Weakest feature:
Share worked: YES/NO
Save/history worked: YES/NO
P0:
P1:
P2:
Rating 1-10:
Would share with friend: YES/NO
Notes:
```

```text
Tester ID:
Device:
Telegram version:
Opened successfully: YES/NO
Top feature:
Weakest feature:
Share worked: YES/NO
Save/history worked: YES/NO
P0:
P1:
P2:
Rating 1-10:
Would share with friend: YES/NO
Notes:
```

```text
Tester ID:
Device:
Telegram version:
Opened successfully: YES/NO
Top feature:
Weakest feature:
Share worked: YES/NO
Save/history worked: YES/NO
P0:
P1:
P2:
Rating 1-10:
Would share with friend: YES/NO
Notes:
```

## Aggregate Findings Only

Use short summaries without personal data.

```text
Most loved flows:

Most confusing flows:

Share/save observations:

Phone UX observations:

Privacy observations:

Recommended next action:
```

## Stop / Expand Decision

Expand only if:

- P0 = `0`.
- P1 = `0` or fixed.
- Average rating is `>= 7`.
- Share works.
- Save/history works.
- Phone pass is acceptable.
- No privacy leaks.

Stop if:

- Mini App does not open.
- White screen.
- Share/save is broken globally.
- Privacy leak.
- Result pages fail.
- Critical Telegram UI overlap.
- Daily publish duplicate.

## Analytics Baseline & First Users Observation

* Redis analytics is active in production.
* Do not reset counters before first users unless explicitly approved.
* Package 55 test events are baseline noise.
* First 5 users must be observed through analytics + feedback.
