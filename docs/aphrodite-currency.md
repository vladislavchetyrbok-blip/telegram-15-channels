# Aphrodite Currency Module

## Overview
The Currency Module is responsible for managing fiat exchange rates, tracking central bank news, and formatting data for Telegram publication.

## Purpose
Like the Zodiac module, the Currency module transforms raw data (exchange rates) into structured, readable content. It connects to the Data Sources Center for raw values and feeds into the Publishing Calendar.

## Current State
- **Draft UI**: The module interface is built to outline intended functionality, but real API ingestion and automated publishing are inactive.
- **Safety First**: No live API queries are executed. Mock rates are displayed for UI validation.
- **Read-Only**: There are no buttons to manually override rates or force-publish.

## Future Integration
Once fully activated, this module will:
1. Ingest rates daily from configured sources.
2. Draft market briefs using AI models.
3. Automatically dispatch formatted summaries to designated currency channels.
