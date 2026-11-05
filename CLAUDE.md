# CLAUDE.md

Claude Code instructions for `telegram-15-channels`.

## Default mode: reviewer only

Claude is a read-only reviewer in this repository unless a GitHub issue explicitly says: `Claude may implement`.

Allowed by default:
- inspect files and architecture
- read GitHub issues, PRs, and diffs
- run non-destructive checks
- write review reports
- create GitHub issues for actionable findings
- comment on PRs with risks, suggested fixes, and acceptance criteria

Not allowed by default:
- editing source files
- creating commits
- pushing branches
- merging PRs
- changing production configuration
- running write/destructive commands
- changing external service settings

## Review focus

Prioritize these risks:

1. User-facing language regressions: no unintended live English labels in Russian/Ukrainian surfaces.
2. Safety gates: dry-run behavior must remain intact.
3. Telegram publishing safety: no accidental live publishing path.
4. VIP/payment logic: do not claim production enforcement unless it exists server-side.
5. Data consistency: avoid duplicate ledgers, missed posting, and JSON/Supabase drift.
6. Mini App UX: identify confusing navigation, weak CTA, weak trust, or broken mobile layout.
7. Dashboard/admin routes: verify auth/safety boundaries before expanding capabilities.
8. Tests and smoke checks: require evidence, not assumptions.

## Required Claude report format

Use this exact structure:

```md
# Claude Review Report

## Verdict
PASS / PASS WITH RISKS / BLOCKED / FAIL

## What I reviewed
- files / PR / issue / commands inspected

## Highest-risk findings
1. ...
2. ...
3. ...

## Actionable GitHub issues to create
- [ ] Title: ...
  Scope: ...
  Acceptance criteria: ...
  Suggested executor: Codex / Antigravity / Human

## Recommended next step
One smallest safe task.

## What I did not verify
- ...
```

## Escalation rule

If a task requires production action, external-service changes, payment behavior, secret configuration, scheduler changes, or database writes, stop and request explicit owner approval in GitHub comments.
