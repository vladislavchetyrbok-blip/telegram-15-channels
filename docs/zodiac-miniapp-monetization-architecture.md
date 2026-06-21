# Mini App Monetization Architecture

## Overview
This document specifies the target architecture for future monetization capabilities in the Zodiac Mini App. It acts as a static blueprint to guide future development while preventing premature payment integrations in the current MVP phase.

## Current Status
- Package 115 is architecture only.
- No payments are implemented.
- No real VIP access is implemented.
- No database schema is changed.
- No Telegram API is used.
- No cron/workflow/publish scripts are changed.
- Daily/weekly automation remains unblocked.

## Required Components
1. **VIP Tiers**: Premium features, content, and advanced scoring.
2. **Payment Provider Selection**: Payment processing logic.
3. **Telegram Payments**: Native in-app purchases.
4. **External Payment Providers**: Web-based subscriptions (e.g. Stripe, WayForPay).
5. **Entitlement Model**: Database records linking user ID to purchases.
6. **Refund/Access Rules**: Legal and operational policy for handling purchase disputes.
7. **Privacy Policy**: Compliance with data protection.
8. **Support/Access Recovery**: Allowing users to restore purchases or fix issues.
9. **Fraud/Abuse Prevention**: Prevent account sharing and payment fraud.
10. **Production Rollout Gate**: Prevent accidental launch of broken payment flows.

See `/dashboard/networks/zodiac/miniapp-monetization-architecture` for the live dashboard view of these components and their constraints.
