# Aphrodite Crypto Module

## Overview
The Crypto module provides a dedicated, read-only interface for monitoring cryptocurrency markets. It is designed to track major digital assets (BTC, ETH, SOL, TON, etc.) and surface market trends without executing live trades or publishing content directly. 

## Features
- **Mock Data**: Currently displays mock cryptocurrency rates and trends to avoid hitting rate limits on public APIs during development.
- **Safety Status**: Ensures that the module is disconnected from live publishing pipelines and databases, preserving read-only status.
- **Read-Only Analytics**: Designed to eventually pull from reliable crypto data sources (e.g., CoinGecko, Binance API) to display aggregated data on a daily/weekly basis.

## Future Plans
- Integrate real API data from cryptocurrency exchanges.
- Generate formatted snapshot reports.
- Enable publishing features (only after safety architecture review and manual approval).
