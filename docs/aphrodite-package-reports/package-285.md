# Package 285: AI Orchestration Runbook

## Summary

Package 285 adds the AI orchestration runbook for Claude, Antigravity, Codex, and owner review.

## Roles and order

- Claude = read-only audit, no file edits
- Antigravity = visual QA/screenshots/browser checks
- Codex = code changes/commits/pushes only after scoped task
- 1. Codex implements
- 2. Antigravity visual checks
- 3. Claude safety audit
- 4. Owner review

## Rules

- no parallel edits in same files
- no auto-merge without audit
- no production launch by agents
- package report format is required after each package.

## Files changed

- `lib/zodiac/aphrodite-ai-orchestration-runbook.ts`
- `app/dashboard/networks/zodiac/ai-orchestration-runbook/page.tsx`
- `app/dashboard/networks/zodiac/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`
- `scripts/qa-aphrodite-ai-orchestration-runbook.mjs`
- `docs/aphrodite-ai-orchestration-runbook.md`
- `docs/aphrodite-package-reports/package-285.md`

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- External analytics added: No
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- `.env.local` committed: No
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`
