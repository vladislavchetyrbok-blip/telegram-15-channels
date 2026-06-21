# Zodiac Mini App Internal Link Smoke Matrix

## Package 113 Documentation

**Type:** Internal link smoke / route verification only.

### Context
This document verifies the expected internal routing behavior for the Zodiac Mini App mock system. This is a read-only matrix designed to prove safe boundary limits before any real production routing occurs. 

### Critical Safety Bounds
- **No product features added.**
- **No real payments implemented.**
- **No real VIP access implemented.**
- **No subscription logic implemented.**
- **No database schema changed.**
- **No Telegram API used.**
- **No active Telegram CTA logic changed.**
- **No cron/workflow/publish scripts changed.**
- **Daily/weekly automation remains unblocked.**

The link matrix is for internal route safety only, not production Telegram wiring.

### UI Links Changed
Minor cross-linking navigation was added within the dashboard environment strictly to unify the readiness/audit models:
- Links from `app/dashboard/networks/zodiac/page.tsx` now include the Link Smoke Matrix.
- Links from `app/dashboard/networks/zodiac/miniapp-readiness/page.tsx` were added to connect directly to the other read-only readiness dashboards.

### Link Typology
1. **User-Facing Outbound:** Forward links from the hub to functional mocks.
2. **User-Facing Return:** "Back" logic to prevent user entrapment inside a dead-end route.
3. **Dashboard Readiness Links:** Read-only admin-side navigation for quality assurance and architectural bounds.
4. **Blocked Future Links:** Required architecture transitions that cannot happen until a true payment strategy is decided.

See `/dashboard/networks/zodiac/miniapp-link-smoke` for the living data view.
