# Mini App Route Safety Baseline

## Overview
Package 108 establishes a Route Safety Baseline for all existing Zodiac Mini App mock routes. The goal is to provide absolute clarity on what each route is allowed to do, what it must never do, and how it is protected from accidentally interfering with production Telegram logic or live automation workflows.

## Safety Principles
- **No Product Features**: This baseline adds safety labels and QA assertions without introducing new user-facing logic.
- **No Live Payments**: Transactional capabilities remain completely inactive.
- **No Real VIP Access**: Subscription states and entitlements are safely stubbed.
- **No Database Writes**: Routes operate purely on local component state.
- **No Telegram API Calls**: The Mini App routes do not contact Telegram backend endpoints.
- **No Active Publishing Changes**: Cron jobs, github workflows, and `publish-zodiac-*` scripts remain locked and independent.

## Protected Boundaries
The boundaries have been verified by dashboard QA assertions to ensure stable safety indicators on every route:
- `/miniapp` (Static Hub)
- `/compatibility` (Existing processing)
- `/birth-matrix` (Static mock)
- `/mystic-numbers` (Static mock)
- `/affirmations` (Static mock)
- `/vip-preview` (Preview boundary)

Future packages can safely build on top of these routes, knowing that any violation of these baseline labels will result in a Dashboard QA failure during verification.
