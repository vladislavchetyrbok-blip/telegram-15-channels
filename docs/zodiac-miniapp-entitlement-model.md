# User Profile & Entitlement Data Model Spec

## Overview
This specification details the structure of user profiles, session contexts, and entitlements required to securely map Telegram users to Zodiac Mini App purchases and statuses. 

## Package Scope
- **Package 116** introduces the data model documentation and dashboard monitoring view only.
- No database tables have been created or modified in production.
- Telegram Mini App `initData` is not being validated against a live backend secret.

## Data Models
1. **User Profile**: Base Telegram ID and user properties (language, generic demographic).
2. **Birth Profile**: The user's input variables for astrological calculations (Date, Time, Location).
3. **Entitlements**: Tiers of access (Free, VIP Subscription, One-Time Unlock).
4. **Session Context**: The ephemeral hash matching `initData` against a secure server timestamp to prevent impersonation.

## Risk Mitigations
- All profile data is PII and subject to GDPR regulations for EU users.
- Subscriptions must sync via webhooks, ensuring we do not rely purely on client-side status.
- Test mode accounts must be strictly isolated from production entitlement metrics.
