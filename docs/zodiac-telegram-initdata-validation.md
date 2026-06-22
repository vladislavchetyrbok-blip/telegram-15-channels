# Telegram initData Validation Foundation (Package 123)

## Overview
This document specifies the validation foundation for Telegram Mini App `initData`. 
This is the foundational component for establishing a secure Telegram User Identity.

## Security Boundaries
* **Validation Only:** This package only implements the server-side cryptographic validation.
* **No Database Writes:** No session is stored in the database.
* **No Payments:** Monetization is still fully mocked.
* **No VIP Access:** VIP routes remain locked behind the Owner Review Gate.
* **No Active Telegram CTAs Modified:** We do not launch the bot for real users.

## Algorithm
1. Extract `hash` from `initData` query string.
2. Filter out `hash` and sort remaining parameters by key.
3. Join with newlines to form the data check string.
4. Calculate secret: `HMAC_SHA256(botToken, "WebAppData")`
5. Calculate hash: `HMAC_SHA256(dataCheckString, secret)`
6. Compare hashes safely.
7. Verify `auth_date` is not older than 300 seconds (5 minutes) to prevent replay attacks.

## Implementation Path
Located at `lib/zodiac/telegram-initdata-validation.ts`.
This package has been audited and cleared via the `qa-telegram-initdata-validation.mjs` dashboard QA script.
