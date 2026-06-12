# Zodiac Connections Patch Template

This document explains how to update the internal channel registry (`data/zodiacChannelConnections.ts`) once the user has manually created the Telegram channels.

## The Goal
The goal is to safely add the `actualUsername` and `publicLink` to the connections file without immediately enabling real publishing. The system will continue to use `publishStatus: "not_ready"` until the channel IDs are fully verified.

## Before State
Initially, all channel entries look like this (missing usernames and links):

```typescript
export const ZODIAC_CHANNEL_CONNECTIONS = [
  {
    id: "aries",
    telegramChannelId: null, // numeric ID
    actualUsername: null,
    publicLink: null,
    botAdminStatus: "not_added",
    creationStatus: "pending",
    publishStatus: "not_ready"
  },
  // ... other channels
];
```

## After State
Once the user manually creates the channels and returns the JSON payload, we patch the configuration file:

```typescript
export const ZODIAC_CHANNEL_CONNECTIONS = [
  {
    id: "aries",
    telegramChannelId: null, // Still null! We'll fetch this technically later.
    actualUsername: "aries_orbit",
    publicLink: "https://t.me/aries_orbit",
    botAdminStatus: "admin_added",
    creationStatus: "created",
    publishStatus: "not_ready" // Remains not_ready to prevent accidental publishing.
  },
  // ... other channels
];
```

## Important Safety Checks

1. **Keep `telegramChannelId` as `null`**: Do NOT guess or fake numeric IDs (e.g., `-100123456`). If the ID is unknown, it stays `null`.
2. **Keep `publishStatus` as `not_ready`**: Even if the channel is created and the bot is an admin, do not change this until the local dry-run with actual connections passes successfully.
3. **No real publish yet**: Applying this patch does NOT trigger any publishing. It simply updates the local knowledge base.
