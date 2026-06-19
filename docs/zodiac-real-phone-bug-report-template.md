# Zodiac Real Phone Bug Report Template

Use this template for anonymized reports from real Telegram WebView testing.
Do not commit real screenshots, videos, Telegram handles, phone numbers, raw
birth data, raw questions, raw intentions, raw feedback, or raw result text.

```text
Device:
Telegram version:
Screen:
Steps:
Expected:
Actual:
Screenshot/video:
Severity:
Privacy risk:
Can reproduce:
Suggested fix:
```

## Severity

```text
P0: cannot open / white screen / privacy leak / global save-share failure / daily duplicate
P1: broken layout / keyboard blocks input / BackButton broken / unusable scroll / core result fails
P2: spacing / text / visual polish / minor clarity issue
```

## Privacy Risk

Use one of:

```text
NONE
LOW
MEDIUM
HIGH
```

HIGH examples:

- raw birth date/time visible in a share draft;
- raw name, city, question, intention, or feedback stored or sent;
- private Telegram chat visible in screenshot;
- token/secret visible.

## Reproduction Notes

Prefer synthetic inputs:

```text
date: 1998-06-15
time: 23:55
city: Dnipro
question: test question
intention: test intention
```

If the bug needs a real screenshot/video, store it outside git and summarize it
anonymously in the report.
