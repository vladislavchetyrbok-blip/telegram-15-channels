# Zodiac VIP Access Boundary

## Overview
This document defines the VIP Access Boundary created in Package 127. It defines the local logic for granting or denying access to premium content based on the Entitlement Foundation (Package 126). 

## Boundary Adherence
* **No Real Payments:** The boundary checks for entitlements but does not implement any payment logic.
* **No Real VIP Route Gating:** Routes can use the `evaluateVipAccess` function, but real blocking of live views is suspended until end-to-end payment flows are built.
* **No Database Writes:** Decisions are calculated synchronously using provided entitlement data.
* **No Telegram API Calls:** No interaction with Telegram Stars or bot sending logic.

## Access Decisions

### Allowed States
* `allow-preview`: A free, local preview state intended for internal testing and review. It is not real VIP access.
* `allow-vip`: Granted only when an `active` entitlement exists and has not expired.

### Denied States
Access is denied if the entitlement:
* Is missing (`deny-missing-entitlement`)
* Is pending payment (`deny-pending-payment`)
* Is expired (`deny-expired`)
* Was refunded (`deny-refunded`)
* Was revoked (`deny-revoked`)
* Belongs to an unsupported product (`deny-unsupported-product`)

## Next Steps
The next safe package (Package 128) should either be the Telegram Stars payment prototype (in test mode) or the first VIP report content foundation.
