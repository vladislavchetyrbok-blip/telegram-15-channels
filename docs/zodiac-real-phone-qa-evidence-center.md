# Zodiac Real Phone QA Evidence Center

The Real Phone QA Evidence Center is part of the Zodiac Voice (Feedback) module in Zodiac Control. It tracks manual testing of the Zodiac Mini App on physical devices to ensure the platform meets safety, layout, and functional standards before expanding to real users.

## Core Principles

1. **Desktop is Not Enough:** Telegram Desktop automation (CDP) cannot verify native Telegram keyboard overlays, safe-area clipping, or the native share sheet behavior.
2. **Local Storage Only:** Evidence is tracked in `localStorage` inside the dashboard. No server write API is used.
3. **No Sensitive Data Committed:** No screenshots, phone numbers, real birth data, or raw feedback should be committed to the repository. Only sanitized summaries are allowed.

## Checklists

### iPhone Telegram
* Mini App opens from Telegram link
* `startapp=compat` opens home/main correctly
* `startapp=mystic` opens Mystic correctly
* BackButton works
* Bottom buttons not covered
* Keyboard does not cover date/input fields
* Share works
* Save/history works
* Feedback opens
* Dark theme readable
* Light theme readable

### Android Telegram
* (Same checklist as iPhone)

### Telegram Desktop Sanity
* Mini App opens
* Layout usable
* No fatal UI issue
* Analytics events fire

## Recording Evidence

To record evidence in Zodiac Voice:
1. Complete the manual phone QA passes for iPhone and Android.
2. Check the relevant boxes in the **Real Phone QA Evidence** section.
3. If an issue is found, add a sanitized feedback entry.
    * Provide a Tester Label (e.g., "Tester 1").
    * Set Device, Telegram App, Rating, Would Share, and Severity.
    * Add a sanitized note (no raw data).
4. Save the entry to localStorage.

## Severity Levels

* **P0 (Blocker):** Fatal crash, broken core functionality (e.g., results won't load), privacy leak, or complete layout failure. Stops all user expansion.
* **P1 (Critical):** Major UX issue, keyboard blocks critical input, share/save broken. Must be fixed before reaching 20 users.
* **P2 (Minor):** Visual glitch, sub-optimal spacing, minor typo. Can be backlogged.
* **Backlog / Positive:** Feature request or positive feedback.

## Stop/Go Rules (Readiness Decision Card)

* **First 5 Users:** GO only if at least iPhone or Android smoke test is PASS.
* **20 Users:** CONDITIONAL only if iPhone AND Android are PASS, and there are 0 unresolved P0/P1 issues.
* **Mass Launch:** STOP. Controlled growth only.

## Zodiac OS Naming System (Package 67)

* **Full platform** = Zodiac OS
* **Dashboard/admin** = Zodiac Control
* **Mini App** = Zodiac Mini
