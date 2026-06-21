# Telegram Mini App Production Risk Register & Gates

## Overview
This document outlines the critical risks associated with launching the Zodiac Mini App to a live Telegram channel and defines the explicit go/no-go gates required before launch.

## Critical Risks

### 1. App Store Rejection (Digital Goods)
- **Risk**: Selling digital horoscopes/VIP status via Stripe inside an iOS/Android Mini App violates platform terms and can result in the Telegram bot or channel being banned on those platforms.
- **Severity**: Critical
- **Mitigation**: Strictly mandate Telegram Stars for in-app purchases or force users to an external browser for fiat checkout.

### 2. Token Leakage
- **Risk**: Accidental exposure of `TELEGRAM_BOT_TOKEN` to the frontend client.
- **Severity**: Critical
- **Mitigation**: Maintain strict separation of concerns; token must remain only in server-side `env` variables. Validated continuously via `production:safety:check`.

### 3. Database Overload on Broadcast
- **Risk**: Broadcasting the Mini App link to 15 channels simultaneously will cause a massive spike in concurrent connections.
- **Severity**: High
- **Mitigation**: Implement PgBouncer (connection pooling) and strict rate-limiting on all `/api/miniapp` routes before launch.

## Go/No-Go Rollout Gates

The following gates must be passed sequentially before the Mini App can be attached to a live Telegram broadcast:

1. **Mock Architecture Complete** (Status: Passed)
   - All UI components, mock states, and dashboards are complete.
2. **Backend Wiring Spec Approved** (Status: Passed)
   - Architectural plan for hash validation and session management is documented.
3. **Supabase Integration** (Status: Pending)
   - Database is live, schemas migrated, and capable of handling user profiles.
4. **Payment Provider Integration** (Status: Pending)
   - Telegram Stars or selected provider is wired and tested in a sandbox.
5. **Production Safety Check Passage** (Status: Pending)
   - Automated scripts confirm no secret leaks and correct environment configuration on the CI/CD pipeline.
