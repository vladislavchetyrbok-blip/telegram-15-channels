# Package 245 - Visual QA Screenshot Pack

Package 245 provides the visual QA screenshot pack, checklist, and issue triage protocol for the Aphrodite Mini App following the comprehensive design audit and visual polish passes completed in Packages 236–244.

This package is strictly static documentation and readiness reporting. It does not redesign screens, change active CTA logic, invoke Telegram API endpoints, send broadcast messages, implement real Stars payments, unlock VIP entitlements, write to databases, or alter launch approval flags.

## Scope & Target Surfaces

- Home / Mini App Entry (`/miniapp`)
- Compatibility Flow (`/compatibility`)
- Birth Matrix / Natal Flow (`/birth-matrix`)
- Mystic Cards Flow (Tarot, Rune, Lunar Rituals)
- VIP Preview Surfaces (`/vip-preview`, `/vip-compatibility-report`)
- Result / Share Cards
- Empty, Loading, and Error Fallback States

## Required Viewports

1. **Small Android (360px x 740px)**: Verifies narrow horizontal constraints, font wrapping, and touch padding.
2. **Standard iOS / Android (390px x 844px)**: Baseline reference viewport for modern mobile devices.
3. **Large iOS Max / Pro (430px x 932px)**: Verifies visual hierarchy and container expansion.
4. **Desktop Sanity Width (1200px x 900px)**: Verifies desktop centering and background glassmorphism boundaries.

## Visual Acceptance Criteria

- **No Horizontal Overflow**: 0px scrollX across all containers and screens.
- **Touch Target Compliance**: Minimum 44px height for interactive buttons and selectors.
- **Russian Text Wrapping**: Multi-line wrapping without clipping or breaking layout bounds.
- **Clear Primary CTA**: Prominent call to action visible above the fold on initial load.
- **Typography & Contrast**: Readable text tokens against cosmic gradients.

## Issue Triage Severity Scale

- **BLOCKER**: Broken layout, unreachable CTA, application crash, or horizontal scrollbar preventing navigation. Must fix immediately.
- **HIGH**: Text clipping, overlapping cards, or touch targets under 36px. Prioritized for next sprint.
- **MEDIUM**: Minor padding asymmetry or secondary text wrapping anomalies. Routine visual fix.
- **LOW**: Minor icon misalignment (1-2px) or transition glitch. Backlog item.
- **POLISH**: Aesthetic enhancement opportunities.

## Safety Boundaries

- `publicLaunchApproved: false`
- `ownerManualReviewRequired: true`
- No Telegram Bot API calls or broadcast messaging.
- No database or localStorage persistence changes.
- No real Telegram Stars payment handlers or VIP unlock.

## Next Package Recommendation

**Package 246 — Visual Fixes After Screenshot Review**
Focuses on remediating any visual triage anomalies logged during screenshot review.
