# Media Control Center UI

This document describes the dashboard model for the Telegram media network control center.

## Mission

The web dashboard should feel like a simple, friendly operations room for Telegram channel networks. The main screen should help an operator understand what matters today without reading technical docs or touching dangerous controls.

## Main Dashboard

The main dashboard is organized around four daily operator areas:

1. Today
   - next scheduled run;
   - daily publishing status;
   - current safe mode indicators.
2. Channel Networks
   - visible network categories;
   - active/planned badges;
   - direct entry into the Zodiac workspace.
3. Needs Attention
   - failed runs;
   - blocked content;
   - missing or weak items.
4. Quick Stats
   - total channels;
   - ready content;
   - scheduled queue;
   - visual readiness.

## Channel Networks

The dashboard treats channels as networks, not as one long technical list.

- Zodiac Network: active, 13 channels, daily autopilot, visuals, navigation, compatibility.
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

The first version is UI-only. It does not add backend logic, does not publish, and does not mutate ledgers.

## Design Principles

- Daily operator mode first.
- Hide technical and development tools in Settings, Dev / Diagnostics, and Reports.
- Use cards, badges, status indicators, and direct labels.
- Prefer clear Russian text over internal implementation terms.
- Make the page understandable without reading documentation.
- Keep dangerous live controls away from the first screen.
- Keep the visual mood modern, light, colorful, and calm rather than dense or intimidating.

## Safety Boundaries

This UI layer must not:

- call Telegram APIs;
- modify daily, weekly, or compatibility ledgers;
- edit GitHub Actions workflows;
- change scheduler behavior;
- modify image assets;
- change daily post logic.
