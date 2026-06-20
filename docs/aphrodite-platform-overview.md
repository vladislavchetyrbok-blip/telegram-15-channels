# Aphrodite Platform Overview

Aphrodite OS is the overarching operator platform designed to manage and control the entire Telegram publishing network. While initial development heavily focused on the Zodiac module, the architecture has evolved to separate the central control plane (Aphrodite) from the individual domain modules.

## Architecture

Aphrodite OS manages several key pillars:
- **Channels**: A unified registry of all Telegram channels, whether legacy or new.
- **Modules**: The actual content domains (Zodiac, Currency, Crypto, Metals).
- **Publishing**: The core dispatch engine that handles rate-limits and talks to the Telegram API.
- **Sources**: Standardized inputs/feeds that the modules transform into content.
- **Safety**: Pre-flight checks to prevent duplicate messaging and enforce environment safety.
- **Analytics**: Aggregated performance metrics across the entire network.

### Zodiac vs. Aphrodite

- **Zodiac OS** is **one module** inside Aphrodite. It handles the specific logic for horoscopes, astrological data generation, and sign-specific content.
- **Aphrodite OS** is the **parent platform**. It manages the Telegram bots, schedules, rate limiting, and the registry of what channels actually exist.

## Modules & Status

| Module | Status | Safety Level |
|--------|--------|--------------|
| **Zodiac** | Active | Production |
| **Channel Registry** | Active | Read-only |
| **Currency** | Draft | Dry-run Only |
| **Crypto** | Draft | Dry-run Only |
| **Metals** | Draft | Dry-run Only |

## Future Planned Packages
- **Data Sources Integration**: Building reliable feed aggregators for Currency and Crypto.
- **Schedule / Calendar Hub**: A global view of all scheduled posts across all modules.
- **Analytics Hub**: Collecting engagement data and subscriber metrics.
- **Windows Studio**: An advanced visual content generator for rich media.

## Strict Safety Rules
1. **Live Publish Locked**: The global dispatcher is locked down to prevent accidental broadcasts while architecture migrations are underway.
2. **No Fake Routes**: Modules still in planning (e.g., Schedule, Analytics) are displayed on the dashboard for conceptual clarity but do not link to broken or fake routes.
3. **Read-Only Dashboard**: The platform overview and channel registry strictly refrain from utilizing server-write APIs or performing live actions.
