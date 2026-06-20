# Aphrodite Metals Module

## Overview
The Metals module provides a dedicated, read-only interface for monitoring precious metals markets. It tracks essential commodities such as Gold (XAU), Silver (XAG), and Platinum (XPT). 

## Features
- **Mock Data**: Displays static mock pricing data for precious metals during development to ensure zero cost and safety without live API calls.
- **Safety Status**: Identifies that no live API connections exist and that publishing pipelines are inactive.
- **Read-Only Analytics**: Acts as a foundation for integrating true commodity price feeds (e.g., metals-api) into the Aphrodite OS later.

## Future Plans
- Connect real API data streams.
- Render chart visualizations over time.
- Facilitate the creation of scheduled Telegram channels for precious metals updates.
