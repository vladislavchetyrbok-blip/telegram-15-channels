# Aphrodite Data Sources Center

## Overview
The Data Sources Center provides an architectural map of all external APIs, feeds, and scrapers integrated into the Aphrodite operator platform.

## Purpose
While the Publishing Calendar schedules *when* content goes out, the Data Sources Center defines *where* the raw information comes from. It standardizes data ingestion so that different modules (Zodiac, Currency, Crypto, Metals, Real Estate) can process external signals safely.

## Current State
- **Read-Only**: The UI displays integrated sources but does not connect, sync, or hold live API keys.
- **Safety First**: No live API queries are made from the dashboard.
- **Mock Data**: The platform currently uses mock or draft data structures for these APIs to prevent accidental external network requests during development.

## Future Integration
Once fully implemented, the Data Sources engine will include a backend sync service that pulls data safely, caches it in a secure database, and feeds it to the content generation layer without exposing API secrets to the frontend.
