# Media Control Center UI

This document describes the dashboard model for the Telegram media network control center.

## Mission

The web dashboard should feel like a simple, friendly operations room for Telegram channel networks. The main screen should help an operator understand what matters today without reading technical docs or touching dangerous controls.

## Main Dashboard

The main dashboard is organized around four daily operator areas:

1. Today
   - next scheduled run;
   - primary run at 09:00 and backup run at 09:30;
   - daily publishing status;
   - current safe mode indicators.
2. Channel Networks
   - visible network categories;
   - active/planned badges;
   - direct entry into the Zodiac workspace.
3. Needs Attention
   - failed runs;
   - duplicate risk;
   - missing images;
   - blocked content.
4. Quick Stats
   - 13 Zodiac channels;
   - 4,745 expected yearly posts;
   - 91/91 visual assets;
   - 78 compatibility pairs.

## Channel Networks

The dashboard treats channels as networks, not as one long technical list.

- Zodiac Network: active, 13 channels, daily autopilot, visuals, daily buttons, pinned navigation, compatibility, channel descriptions.
- Real Estate Channels: planned.
- General Media Channels: planned.
- Experiments / Future: planned.

The source of truth for network cards is:

```text
data/config/channel-networks.json
```

## Zodiac Network Workspace

Route:

```text
/dashboard/networks/zodiac
```

Sections:

- Overview;
- Today;
- Content;
- Navigation;
- Visuals;
- Compatibility;
- Weekly Horoscope;
- Reports;
- Settings.

Status cards:

- 13 channels;
- 13 posts per day;
- 4,745 posts per year;
- 91/91 visuals;
- Ledger OK;
- Backup cron active;
- 78 compatibility pairs;
- Daily buttons active.

The first version is UI-only. It does not add backend logic, does not publish, and does not mutate ledgers.

## Design Principles

- Daily operator mode first.
- Hide technical and development tools in Settings, Dev / Diagnostics, and Reports.
- Use cards, badges, status indicators, and direct labels.
- Prefer clear Russian text over internal implementation terms.
- Make the page understandable without reading documentation.
- Keep dangerous live controls away from the first screen.
- Keep the visual mood modern, light, colorful, and calm rather than dense or intimidating.
- Use a bright control-center surface with violet, turquoise, amber, mint, and coral accents.
- Keep planned networks visible but clearly separated from the active Zodiac workflow.

## Technical Clutter Placement

Technical and future-facing items should be grouped away from the main daily flow:

- Settings;
- Dev / Diagnostics;
- Reports;
- future network planning such as SENATE / real estate.

## Safety Boundaries

This UI layer must not:

- call Telegram APIs;
- modify daily, weekly, or compatibility ledgers;
- edit GitHub Actions workflows;
- change scheduler behavior;
- modify image assets;
- change daily post logic.
