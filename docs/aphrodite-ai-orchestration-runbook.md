# Aphrodite AI Orchestration Runbook

Package 285 documents how Codex, Antigravity, Claude, and owner review should coordinate safely.

This package does not launch production, does not auto-merge, does not call Telegram, does not send messages, does not change BotFather, does not add secrets, does not write DB, does not add payment, does not unlock VIP, and does not change cron/workflows.

## Agent Roles

- Claude = read-only audit, no file edits
- Antigravity = visual QA/screenshots/browser checks
- Codex = code changes/commits/pushes only after scoped task
- Owner review is the final approval authority.

## Order

1. Codex implements
2. Antigravity visual checks
3. Claude safety audit
4. Owner review

## Coordination Rules

- no parallel edits in same files
- no auto-merge without audit
- no production launch by agents
- package report format must include package number, branch, commits, files changed, checks, safety flags, blockers, and next package.

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- `.env.local` committed: No
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Next Step

Package 286 - Night Run Final Readiness Summary.
