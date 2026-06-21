# Telegram Mini App Production Wiring Spec

## Overview
This specification defines the sequence and requirements for switching the Zodiac Mini App from "mock mode" to "live production wiring" with Telegram.

## Package Scope
- **Package 117** introduces the wiring documentation and dashboard monitoring view only.
- No `TELEGRAM_BOT_TOKEN` validation logic is implemented in the Mini App backend yet.
- The app remains in its isolated UI test mode.

## Implementation Sequence
1. **Secret Configuration**: Ensure `TELEGRAM_BOT_TOKEN` is securely available only in the backend environment.
2. **Hash Validation Endpoint**: Create `/api/miniapp/auth` to receive and cryptographically verify the `initData` payload using HMAC-SHA-256 against the bot token.
3. **Session Provider Context**: Implement a React Context provider at the root of the Mini App layout to hold the validated user session, blocking access if the session is absent or expired.
4. **Database Sync (Upsert)**: Upon successful validation, securely upsert the Telegram user's basic profile (ID, name, language) into the primary database.

## Environment Requirements
To transition to live production, the following variables must be configured in the deployment environment:
- `TELEGRAM_BOT_TOKEN`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL` (for WebApp button configuration)

## Risk Mitigations
- **Never expose `TELEGRAM_BOT_TOKEN` to the frontend client.**
- Hash validation logic must fail safely and quickly (reject any request with missing, malformed, or timed-out data).
- The `auth_date` inside `initData` must be checked to prevent replay attacks (e.g., denying hashes older than 24 hours).
