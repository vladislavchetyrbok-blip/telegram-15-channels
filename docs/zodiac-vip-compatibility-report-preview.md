# Zodiac VIP Compatibility Report Preview

This document describes the UI preview implementation for the future VIP Compatibility Deep Report, introduced in **Package 129**.

## Core Concept
The UI preview allows users to experience the structural layout and free sections of the upcoming VIP report without actual payment, database interaction, or access control.

## Strict Boundaries
- **No real payments:** No Stripe, Telegram Stars, or any other payment handler is connected.
- **No real VIP unlock:** Access is purely visual for the preview; no database check is performed to grant access.
- **No database write:** Selections (names and signs) remain local to the React component state.
- **No route gating:** The preview route is completely open and public, but clearly marked as a preview.

## Architecture
1. **User Input (`VipCompatibilityReportClient.tsx`)**: Collects two zodiac signs and optional names.
2. **Mock Generation**: Passes these inputs to `createVipCompatibilityReportMock` (from Package 128).
3. **UI Rendering**: Displays free-preview sections clearly, and explicitly locks future-vip sections with clear disclaimers, avoiding any actionable payment CTA.

## QA Validation
A local validation script `scripts/qa-zodiac-vip-compatibility-report-preview.mjs` enforces that:
- The required mock components load safely.
- No DB/Payment imports are accidentally added.
- The UI properly distinguishes between free-preview and future-vip boundaries.
