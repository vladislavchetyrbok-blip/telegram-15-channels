# Zodiac User Profile Database Foundation

This document confirms the safe creation of the User Profile Database Foundation (Package 124).

## Context
Following the Telegram initData Validation (Package 123), the system needed a clear definition of how a verified Telegram user transitions into a local App user and profile. 

Because the project's current primary database uses JSON files, and a live Supabase environment is not yet configured for profiles (`DATABASE_URL is not configured`), we deliberately avoided attempting unsafe database migrations.

## What was implemented
1. **Typed Foundation:** `lib/zodiac/zodiac-user-profile-foundation.ts` defines the strict schema definitions:
   - `ZodiacTelegramUserIdentity`: Information verified from Telegram.
   - `ZodiacUserProfileDraft`: Empty state for user preferences.
   - Pure mapping functions to safely transform raw Telegram objects without any database writes.
2. **Dashboard Overview:** `/dashboard/networks/zodiac/user-profile-foundation` provides an explicit status of all profile-related subsystems.
3. **Local QA Script:** `scripts/qa-zodiac-user-profile-foundation.mjs` verifies the integrity of the mapper logic.

## Safety Boundaries Enforced
- **NO Live Schema Migrations:** Kept explicitly separate since the environment is not ready.
- **NO Payments:** The foundation defines boundaries for future packages, but does not implement Stars.
- **NO VIP Access:** No gating or real premium capabilities added.
- **NO Bot Modifications:** Sending logic remains unchanged.
- **NO API Modifications:** No live routes were created to write profiles.

## Next Steps
The foundation allows us to safely transition towards defining product catalogs (Package 125) knowing exactly how the user profile model will eventually exist.
