# Zodiac Mini App CTA Consistency Audit

This document serves as the formal baseline for all Navigation and Call-to-Action (CTA) elements in the Zodiac Mini App mock routes. 

## Audit Objectives
1. Identify all mock and external CTAs within the Zodiac Mini App.
2. Standardize CTA wording to reflect the current non-transactional static mock state.
3. Eliminate any language implying purchases, subscriptions, or real VIP access logic before such logic is developed.

## Standardized Wording Rules
- **Prohibited (Active Transactional)**: `Buy`, `Subscribe`, `Unlock`, `Pay`, `Purchase`, `Activate VIP`, `Premium unlocked`, `Payment successful`
- **Prohibited (Misleading Production Status)**: `Live`, `Production ready`, `Real VIP`, `Connected payment`, `Saved to profile`, `Synced to Telegram`
- **Allowed (Preview & Mock Context)**: `Preview`, `Try mock`, `Explore`, `Check`, `Open`, `View`, `Back to Mini App Hub`

## Model & Dashboard Implementation
A static CTA audit model was created in `lib/zodiac/zodiac-miniapp-cta-audit.ts`.
This model outlines the primary, navigation, and safety CTAs for:
- `/miniapp`
- `/birth-matrix`
- `/mystic-numbers`
- `/affirmations`
- `/vip-preview`

A read-only dashboard view of this audit is accessible at: `/dashboard/networks/zodiac/miniapp-cta-audit`.

## Scope & Safety
- **No changes** were made to the Telegram bot or daily/weekly automation logic.
- **No active payments** or subscriptions were integrated.
- The Mini App remains a safe static mock environment with clear boundaries denoting future planned development.
