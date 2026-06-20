# Zodiac OS Launch Control Room

The Launch Control Room is the central dashboard for the project owner to assess readiness for different stages of the rollout, track manual QA checklists, and access all operational modules.

## Route
`/dashboard/networks/zodiac/launch`

## Purpose

It answers critical questions before expanding the user base:
* **Can I invite first 5 users?** (GO only after basic real-phone manual pass).
* **Can I invite 20 users?** (WAIT/CONDITIONAL until first 5 provide sanitized feedback with 0 P0/P1 issues).
* **Why mass launch is blocked?** (STOP explicitly enforces the policy that mass launch requires scaling, commercial, and security readiness).
* **What should I do next?** (The Decision Matrix explicitly maps current stage to the next required action).

## Core Rules

1. **First 5 Users Rule:** Requires manual completion of the real-phone QA checklist in the Feedback center.
2. **20 Users Rule:** Requires the first 5 users' feedback to be processed, no P0/P1 bugs, and a minimum average rating.
3. **Mass Launch Blockers:** Server write APIs must be verified, commercial decisions (Payments/Stars) finalized, and Dashboard Auth active in production.
4. **Real Phone QA Requirement:** Emphasizes that automated tests are insufficient for native Telegram UI overlaps.
5. **Dashboard Auth Requirement:** Dashboard auth must be verified as active (PENDING ENV resolved).
6. **No Live Publish Policy:** The Launch Control Room strictly enforces the read-only/dry-run nature of the platform during soft launch. No live publish buttons are present.

## Stop/Go Matrix

| Stage | Status | Required Evidence | Next Action |
|-------|--------|-------------------|-------------|
| Internal QA | DONE | Dev server checks, tests passing | Move to real phone |
| First 5 users | PENDING/GO | Real phone smoke pass | Invite 5 people, observe |
| 20 users | WAIT | First 5 sanitized review, 0 P0/P1 | Expand audience slightly |
| Public beta | STOP | 20 users review, retention signal | Open public links |
| Mass launch | STOP | Server ready, auth ready, scaling | Ads, big channels |
| Commercial launch | STOP | Payments tested, legal ready | Enable stars/payments |

## Modules and Workflow

From the Launch Control Room, the owner can navigate to all essential subsystems:
* **Zodiac Pulse** (`/dashboard/networks/zodiac/analytics`) for funnels.
* **Zodiac Voice** (`/dashboard/networks/zodiac/feedback`) for local real-phone QA and sanitized feedback.
* **Zodiac Shield** (`/dashboard/networks/zodiac/security`) for auth and safety checks.
* **Zodiac Publisher** (`/dashboard/networks/zodiac/publishing`) for safe dry-runs.
