# Zodiac Monetization Readiness

Date: 2026-06-19

This document prepares the future VIP / Telegram Stars monetization path without enabling payments. It is an architecture and product-readiness plan only.

## Current State

- VIP is open as free promo access until `2026-09-17`.
- Current VIP config source: `data/config/zodiac-vip-config.json`.
- `vipFreeAccessEnabled`: `true`.
- `vipFreeAccessUntil`: `2026-09-17`.
- `vipPaymentsEnabled`: `false`.
- `telegramStarsEnabled`: `false`.
- Payments and Telegram Stars are OFF.
- No invoices, Stars API calls, checkout sessions, subscription backend, entitlement enforcement, or paid-only locks are active.
- Giveaways remain locked/preview by product decision, not because payment is enabled.
- Existing free/promo flows must remain accessible until an explicit future monetization package changes policy.

## Audit Findings

- VIP is displayed in the main Mini App menu, bottom navigation, retention shortcuts, channel packaging CTA, and VIP section.
- The VIP section clearly says early/free access is active until `2026-09-17`.
- The subscription status text remains `не нужна сейчас` while `vipPaymentsEnabled=false` and `telegramStarsEnabled=false`.
- The active VIP tools are functional, not payment placeholders.
- No active Telegram invoice, Stars, payment provider, or checkout integration was found in the app code.
- Existing analytics tracks safe product usage only; no payment-sensitive data is collected.

## Future Paid Tiers

Future tiers should be introduced only after explicit approval:

1. `Free`
   - Basic compatibility.
   - Basic daily horoscope navigation.
   - Basic Angel Numbers.
   - Limited Mystic day.
   - Profile, history, favorites basics.

2. `VIP Weekly`
   - Short-term access to VIP tools.
   - Useful for testing price sensitivity before subscriptions.

3. `VIP Monthly`
   - Main recurring VIP access.
   - Includes the full VIP tool set.

4. `One-time Deep Reading`
   - Single premium result unlock, such as Premium Natal or Birth Matrix advanced.

5. `Couple Pack`
   - Extended compatibility, mental map, 30-day calendar, and message helper.

6. `Mystic Pack`
   - Tarot/Rune advanced spreads, Lunar/Ritual pack, talismans, and VIP Mystic Day.

## Candidate Paid Features

Strong candidates for later monetization:

- Premium Natal Chart.
- Extended Compatibility.
- Mental Map.
- 30-day Couple Calendar.
- Message Helper.
- Birth Matrix advanced sections.
- Tarot/Rune advanced spreads.
- Lunar ritual pack.
- VIP monthly forecast.
- VIP talismans and symbols of power.

These are candidates only. They must stay free during the current promo window unless a separate package explicitly changes access policy.

## What Remains Free

The future free tier should keep a useful product surface:

- Basic compatibility.
- Basic daily horoscope access.
- Basic Angel Numbers interpretation.
- Limited Mystic day / daily symbolic prompt.
- Main profile shell.
- History/favorites basics with safe local summaries.
- Soft launch feedback and safe share flow.

## Feature Flags

Future monetization must stay behind explicit disabled-by-default flags:

```text
ZODIAC_PAYMENTS_ENABLED=false
ZODIAC_STARS_ENABLED=false
ZODIAC_VIP_ENTITLEMENTS_ENABLED=false
ZODIAC_VIP_FREE_UNTIL=2026-09-17
```

Rules:

- Missing flags must behave as OFF.
- `ZODIAC_PAYMENTS_ENABLED=true` alone must not be enough to charge users.
- `ZODIAC_STARS_ENABLED=true` alone must not be enough to create invoices.
- Entitlement enforcement must not activate while `ZODIAC_VIP_ENTITLEMENTS_ENABLED=false`.
- During promo, free access should override paid gates until `ZODIAC_VIP_FREE_UNTIL`.

## Entitlement Model

Future entitlement records should be server-validated and privacy-minimal:

```text
userSource: telegram | browser | unknown
telegramUserIdHash: optional, hashed if used
plan: free | vip_weekly | vip_monthly | one_time_deep_reading | couple_pack | mystic_pack
status: active | expired | refunded | revoked | promo
expiresAt: ISO date
features: string[]
createdAt: ISO date
updatedAt: ISO date
```

Do not store:

- names;
- birth dates;
- birth times;
- city query;
- raw relationship details;
- raw tarot/rune question;
- raw lunar intention;
- raw result text;
- raw generated messages;
- full Telegram `initData`;
- payment provider secrets or tokens.

Server validation later should decide access. Local storage may cache only safe, non-authoritative UI hints and must never be treated as proof of purchase.

## Activation Gates

Payments/Stars can move from readiness to implementation only when all gates are explicitly satisfied:

- Real phone Telegram WebView pass is complete after the latest UI changes.
- P0/P1 bugs are `0`.
- Redis analytics is enabled or consciously waived with a written decision.
- Payment test mode is implemented and verified without live charges.
- Refund/support text is drafted.
- Pricing and feature gates are approved.
- Giveaways/legal rules are clarified before monetizing giveaway access.
- Daily scheduler remains stable.
- Weekly live remains a separate decision.
- Explicit approval is given for a future payment package.

## Safe Rollout Sequence

Recommended future sequence:

1. Add disabled entitlement reader and tests.
2. Add payment test-mode sandbox only.
3. Add UI copy for paid states behind OFF flags.
4. Verify free promo override.
5. Verify no personal data enters payment metadata.
6. Run phone WebView pass.
7. Enable test-mode only.
8. After explicit approval, enable production payments for a tiny allowlist.

## Current Implementation Decision

No new code scaffold is added in this package. The existing `data/config/zodiac-vip-config.json` already holds the current free/promo payment flags, and adding a second unused helper would create another source of truth before the entitlement design is implemented.

Future code should reuse or wrap the existing config in one authoritative monetization module when the payment package starts.
