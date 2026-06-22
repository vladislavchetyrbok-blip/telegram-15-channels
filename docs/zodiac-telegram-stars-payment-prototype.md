# Telegram Stars Payment Prototype Gate

This document outlines the foundation and boundaries for the Telegram Stars Payment Prototype (Package 130).

## Purpose
Telegram Stars (`XTR`) are the required currency for selling digital goods and services within Telegram Mini Apps and bots to comply with Apple and Google app store policies. 

Before implementing the real `sendInvoice` flow, we need a static, deterministic local prototype to safely model what the payload will look like, while actively blocking any real external calls.

## Boundaries Enforced
The following actions are strictly **blocked** by this prototype gate:
1. No `sendInvoice` API calls are made to Telegram.
2. No Telegram bot token is configured or used.
3. No database writes or connections are utilized.
4. No live successful payment handling is active.
5. No entitlements are granted.
6. No active VIP content is gated.
7. Daily/weekly publishing automation remains completely unaffected.

## Prototype Invoice Shape
The prototype defines a `ZodiacStarsPrototypeInvoice` model with the following forced constraints:
- `currency`: MUST be `"XTR"`
- `providerTokenMode`: MUST be `"omitted-for-stars"`
- `liveSendAllowed`: MUST be `false`

### Initial Product Candidate
- **Product Code:** `vip_compatibility_deep_report`
- **Reason:** It is the first premium feature with a safe UI preview (Package 129) and solid mock content foundation (Package 128). It delivers high emotional value.
- **Prototype Amount:** 300 Stars (Placeholder only).

## Future Flow
When the business owner approves the live implementation, the flow will be:
1. Bot calls `sendInvoice` with `currency="XTR"` and a specific `payload` string.
2. User pays using Telegram's native UI.
3. Bot receives a `pre_checkout_query` from Telegram and responds affirmatively.
4. Bot receives `successful_payment` via webhook.
5. Bot parses the `payload` from the payment, stores the charge ID, and grants an Entitlement to the User Profile.
6. VIP boundaries recognize the Entitlement and allow access to the premium route.

## Safe Next Steps
Package 131 should be either a **Stars Payment Safety Review** or **Telegram Stars Invoice Draft Builder** after explicit owner approval.
