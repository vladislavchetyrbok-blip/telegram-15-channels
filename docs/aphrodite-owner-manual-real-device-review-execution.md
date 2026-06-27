# Aphrodite / Zodiac — Owner Manual Real-Device Review Execution (Package 253)

## Purpose
This document records the manual review execution structure for the Aphrodite / Zodiac Mini App across simulated and physical mobile devices. It confirms successful verification via local browser simulation while explicitly maintaining `MANUAL REQUIRED` status for real hardware and Telegram WebView checks.

---

## 1. Checked URLs & Viewports

### Checked URLs
* `http://localhost:3000/miniapp` (Home Screen)
* `http://localhost:3000/miniapp?startapp=mystic` (Mystic Cards Startapp)
* `http://localhost:3000/birth-matrix` (Birth Matrix Flow)
* `http://localhost:3000/vip-preview` (VIP Preview Surface)
* `http://localhost:3000/vip-compatibility-report` (VIP Compatibility Report)
* `http://localhost:3000/compatibility` (Compatibility Flow)

### Checked Viewports
* **360px x 740px** (Small Android device standard)
* **390px x 844px** (Standard iOS / Android device standard)
* **430px x 932px** (Large iOS Pro Max standard)
* **Desktop Sanity (1280px)**

---

## 2. Verification Status Summary

| Area | Status | Notes |
| :--- | :--- | :--- |
| **Browser Simulation** | `PASS` | Verified via local development server across 360/390/430px viewports. No horizontal scroll, clipping, or unhandled errors. |
| **Real iPhone Safari** | `MANUAL REQUIRED` | Physical hardware verification pending owner execution. |
| **Real Android Chrome** | `MANUAL REQUIRED` | Physical hardware verification pending owner execution. |
| **Telegram iOS WebView** | `MANUAL REQUIRED` | Live sandbox client testing pending owner execution. |
| **Telegram Android WebView** | `MANUAL REQUIRED` | Live sandbox client testing pending owner execution. |
| **Screenshots Evidence** | `VERIFIED / MANUAL` | Local simulation verified via Package 245 visual QA suite. Physical device screenshots must be captured manually by owner. |

---

## 3. Flow Verification Matrix

1. **Home Flow**: First viewport renders cleanly, quick action grid responds safely, VIP teaser boundaries clear (`PASS`).
2. **Compatibility Flow**: Input screen formats dates correctly (`01012000` -> `01.01.2000`), score share cards readable, VIP deeper report locked (`PASS`).
3. **Birth Matrix / Natal Flow**: Calculation matrix renders without horizontal overflow or state mutations (`PASS`).
4. **Mystic Cards Flow**: Modal opens safely via `startapp=mystic`, card states respond cleanly, deeper reading locked (`PASS`).
5. **VIP Preview Surfaces**: Preview-only wording explicit, no live invoice generation or entitlement bypass (`PASS`).
6. **Result / Share Cards**: Shareable layouts formatted cleanly without triggering external Telegram send API (`PASS`).

---

## 4. Visual Findings & Issues Log

* **Blocker Findings**: None (`0`)
* **High Findings**: None (`0`)
* **Medium Findings**: None (`0`)
* **Low Findings**: `DEF-02` (Custom modal scrollbar theming across mobile browsers — deferred to future polish passes).
* **Polish Findings**: `VF-04` (Micro-animation easing curve smoothing on mobile webkit engines — deferred to Package 247 backlog).

---

## 5. Safety Boundaries & Unchanged Scope

* `publicLaunchApproved`: **false**
* `ownerManualReviewRequired`: **true**
* Production launch executed: **No**
* Telegram API invoked: **No**
* Messages sent or BotFather modified: **No**
* Active Telegram CTA logic changed: **No**
* Calculations or date validation changed: **No**
* Database or storage writes executed: **No**
* Payments or VIP unlock added: **No**
* External analytics or tracking scripts added: **No**
* Cron / workflow / publish scripts modified: **No**

---

## 6. Next Package Recommendation
**Package 254 — Telegram WebView Startapp Owner Review Execution**
