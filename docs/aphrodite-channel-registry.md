# Aphrodite Channel Registry

Aphrodite is the overarching platform and operator for the Telegram publishing network. This registry provides a unified view of all channels managed across different modules, including legacy setups and newly planned deployments.

## Dashboard Route
- **Route:** `/dashboard/networks/aphrodite/channels`

## Channel Overview
The registry displays an aggregate summary of:
- **Total Channels:** 18
- **Paused Legacy Channels:** 15
- **Draft New Channels:** 3
- **Active:** 0
- **Ready:** 0
- **Errors:** 0

## Network Segments

### 1. Legacy Telegram Network
The existing 15 channels are categorized as part of the "Legacy Telegram Network".
- **Status:** paused/inactive
- **Module/Group:** Legacy, Real Estate, General, Zodiac, or Unknown. Note: Zodiac remains one module inside Aphrodite, not the whole platform.
- **Publishing Mode:** disabled
- **Safety Note:** "Paused legacy channel — no publishing from Aphrodite yet."

### 2. New Draft Modules
We are actively planning the launch of three new modules on the Aphrodite platform:
1. **Currency**
2. **Crypto**
3. **Metals**

These draft channels are strictly local and protected from live publishing.
- **Status:** draft
- **Publishing Mode:** dry-run
- **Safety Note:** "Draft only - no live token"

## Safety & Security
- **Read-only interface:** The channel registry does not contain any server write APIs or live publishing actions.
- **Separation of QA:** Currently, the Aphrodite routes are checked within `scripts/qa-zodiac-dashboard.mjs` for convenience. A future package should split this into a dedicated Aphrodite dashboard QA script to maintain strict architectural boundaries.
