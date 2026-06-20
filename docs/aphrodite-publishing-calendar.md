# Aphrodite Publishing Calendar

## Overview
The Aphrodite Publishing Calendar is a central, read-only planning interface for all outgoing Telegram content across the Aphrodite operator platform.

## Purpose
While the Zodiac OS has its own specific content calendar, the Aphrodite Calendar provides a unified bird's-eye view of everything scheduled across all modules (Zodiac, Currency, Crypto, Metals, and Legacy). It prevents content collision and ensures a steady publishing rhythm without overwhelming subscribers.

## Current State
- **Read-Only**: The calendar currently only displays the *planned* schedule. It does not actively trigger Telegram API calls.
- **No Live Cron**: There are no background jobs (cron or GitHub Actions) tied to this schedule yet.
- **Safety First**: Live publishing remains locked. This dashboard acts as a visual dry-run to align the schedule before activating real distribution.

## Future Integration
Once the Data Sources Center and the Content Engine are fully validated, this calendar will interface with a Publishing Ledger. The ledger will enforce strict rules to prevent duplicate posts and respect rate limits.
