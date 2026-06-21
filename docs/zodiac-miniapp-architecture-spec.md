# Zodiac Mini App Architecture Spec

**Package 102** | Date: 2026-06-22

This document defines the safe implementation architecture for upcoming Mini App modules within the Aphrodite Zodiac Module.

## Package 102 Rules
* Package 102 is an **architecture and spec package** only.
* It **does not** implement payments or live VIP logic.
* It **does not** alter daily/weekly automation, cron, workflows, or publish scripts.
* It prepares safe blueprints for future packages.

## Architecture Specifications

### 1. VIP Entry Points
* **Status**: Missing
* **Route**: `/vip-access`
* **Dependency**: Telegram Payment API, Subscription Webhook Listener
* **Risk Level**: High
* **Safe Next Action**: Create UI mock for VIP state without real payment integration.

### 2. Birth Matrix
* **Status**: Placeholder
* **Route**: `/birth-matrix`
* **Inputs Required**: Birth Date, Birth Time (Optional), Name (Optional)
* **Risk Level**: Low
* **Safe Next Action**: Design static UI mock and local state calculation without database saving.

### 3. Mystic Numbers / Angel Numbers
* **Status**: Placeholder
* **Route**: `/mystic-numbers`
* **Inputs Required**: Input Number, Daily Active Numbers
* **Risk Level**: Medium
* **Safe Next Action**: Define JSON schema for number meanings and static UI.

### 4. Affirmations
* **Status**: Placeholder
* **Route**: `/affirmations`
* **Inputs Required**: Zodiac Sign, Daily Random Seed
* **Risk Level**: Low
* **Safe Next Action**: Create static pool of affirmations for UI testing.

### 5. Compatibility
* **Status**: Partially Existing
* **Route**: `/compatibility`
* **Inputs Required**: User Sign, Partner Sign
* **Risk Level**: Medium
* **Safe Next Action**: Audit existing flow and map boundaries where VIP upsell will go.

### 6. Relationship Map
* **Status**: Future
* **Route**: `/relationship-map`
* **Dependency**: Database of saved profiles, Compatibility Graphs
* **Risk Level**: High
* **Safe Next Action**: Wait for core compatibility and VIP to be stable.

### 7. Lunar Calendar
* **Status**: Future
* **Route**: `/lunar-calendar`
* **Dependency**: Astronomical API or static calculations
* **Risk Level**: Low
* **Safe Next Action**: Wait for route stability.

## Route Boundaries
* **Mini App Core (`/compatibility*`)**: Safe to modify; isolated from bot webhook endpoints.
* **Telegram Bot Webhooks**: Strictly isolated; DO NOT TOUCH during Mini App dev.
* **Dashboard (`/dashboard/networks/zodiac/*`)**: Administrative only; safe to extend with new read-only views.

## Implementation Phases
1. **Static Mocks & Logic**: UI routing, local state calculation, no DB.
2. **Database Integration**: Supabase schema creation, saving user profiles.
3. **VIP & Payments**: Telegram Payment API, paywalls, premium content.
4. **Expansion Modules**: Lunar Calendar, Relationship Maps.
