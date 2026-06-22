# Zodiac Entitlement Model Foundation

## Overview
This document defines the Entitlement Model Foundation for the Zodiac system, established in Package 126. It creates a robust typed foundation for linking users to products without activating live database connections, real VIP access, or payment logic.

## Architecture Context
The Entitlement Model sits after the **Telegram initData Validation Foundation (Package 123)** and **User Profile Foundation (Package 124)**, and utilizes the **Product Catalog Foundation (Package 125)**. 

### Core Concepts
* **User Identity**: A verified Telegram ID (e.g. via `initData`).
* **Product Catalog**: The items users can purchase (e.g. daily, weekly, natal).
* **Entitlement**: The link representing a user's ownership or access right to a product.

### Boundary Rules
This foundation strictly adheres to the following boundaries:
1. **No Real Payments**: It defines the types for a `pending-payment` status but does not handle actual payments or interact with Telegram Stars.
2. **No VIP Access Yet**: It defines the types for `active` or `time-limited` access but does not act as a live paywall.
3. **No Subscription Logic**: Defines the `subscription` access type for future use but does not manage billing.
4. **No Database Writes**: No Prisma or Supabase connections are invoked.

## Types and States

### `ZodiacEntitlementStatus`
* `draft`: Intent generated, no payment initiated.
* `pending-payment`: Payment requested, awaiting provider confirmation.
* `active`: Paid or granted, fully active access.
* `expired`: Time-limited access has concluded.
* `refunded` / `revoked`: Access was removed.

### `ZodiacEntitlementAccessType`
* `one-time-report`: Permanent or specific single item access.
* `time-limited`: Access granted until a specific expiration date.
* `subscription`: Future support for auto-renewing access.
* `preview-only`: Local free preview (not treated as paid VIP).

## Next Steps
The next step is Package 127: VIP Access Boundary, which will implement the UI and routing logic to check for entitlements before granting access, while continuing to remain isolated from real financial transactions.
