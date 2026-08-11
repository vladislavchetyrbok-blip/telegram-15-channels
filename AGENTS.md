# AGENTS.md

This file is the operating contract for AI coding agents working in this repository.
It applies to the entire repository unless a more specific `AGENTS.md` exists in a subdirectory.

## Project context

Repository: `telegram-15-channels`.
Primary product: Telegram Zodiac / Aphrodite system with Telegram channels, content automation, Mini App, dashboard, visual/content pipelines, ledgers, dry-run checks, and safety gates.

The owner prefers small, safe, reviewable packages. Do not do broad rewrites.

## Agent roles

### ChatGPT
- Dispatcher, product owner, architect, and final task writer.
- Converts owner intent into GitHub issues, acceptance criteria, prompts, and review checklists.
- Does not approve production actions or merges without the owner's explicit confirmation.

### OpenAI Codex
- Main implementation agent.
- Works one GitHub issue at a time.
- Creates a separate branch per task.
- Implements scoped code changes, runs checks, and opens a draft PR with evidence.

### Google Antigravity
- UI, browser, flow, and multi-agent verification executor.
- Best suited for Mini App UX, dashboard UX, visual regressions, screenshots, browser walkthroughs, and end-to-end verification.
- May implement UI changes only when the assigned issue explicitly scopes those files.

### Claude / Claude Code
- Default mode in this project: read-only reviewer and issue creator.
- May inspect architecture, risks, diffs, and test output.
- May create GitHub issues, PR comments, and review reports.
- Must not edit files, commit, push, merge, or run write/destructive commands unless a GitHub issue explicitly says: `Claude may implement`.

### Human owner
- Final approval for merge, production launch, real publishing, payment changes, secrets, and external service changes.

## Source of truth

GitHub Issue is the source of truth.

Every AI task must include:
- Goal
- Scope
- Out of scope
- Acceptance criteria
- Required checks
- Safety rules
- Expected report format

If the prompt conflicts with the issue, follow the issue and ask for clarification in the PR/issue comments.

## Branch and PR rules

- Use one branch per issue: `ai/<issue-number>-<short-slug>`.
- Do not work directly on `main`.
- Do not let multiple agents modify the same branch at the same time.
- Open PRs as draft unless the owner explicitly requests ready-for-review.
- Keep PRs small. Prefer one functional package per PR.
- Do not merge your own PR.

## Required baseline checks

Run these before reporting completion when the repository state allows it:

```bash
npm run typecheck
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:workflow:check
npm run production:safety:check
```

Run additional checks when relevant to the assigned issue:

```bash
npm run zodiac:dashboard:qa
npm run zodiac:dashboard:auth:check
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
npm run zodiac:ledger:check
npm run zodiac:ledger:safety:check
npm run zodiac:telegram-auth:check
npm run zodiac:profile-sync:check
npm run actions:scheduler:check
npm run ops:health:check
```

If a check cannot run because of missing local environment, report the exact reason and do not fake success.

## Hard safety rules

Never do these without explicit owner approval in the GitHub issue or PR comment:

- Do not edit local environment or secret configuration files.
- Do not run real publishing commands.
- Do not change external bot/platform settings.
- Do not change payment or VIP entitlement behavior in production.
- Do not run database write/apply/migration/sync operations.
- Do not change scheduled production workflows unless the issue specifically requests scheduler work.
- Do not merge to `main`.
- Do not force-push shared branches.

Dry-run variants are allowed when relevant to the issue.

## Code style

- Prefer minimal, explicit TypeScript/React changes.
- Keep existing architecture and naming unless the task requires a change.
- Avoid large refactors in feature PRs.
- Do not introduce new dependencies unless clearly justified.
- Keep user-facing language Russian/Ukrainian as currently intended by the product.
- Remove live English/Aphrodite labels from user-facing surfaces unless the issue explicitly requests otherwise.
- Preserve existing safety gates and dry-run behavior.

## Reporting format

Every agent report must include:

1. Issue / package name
2. Branch
3. Summary of changes
4. Files changed
5. Commands run
6. Check results
7. Risks / unresolved items
8. Manual review needed
9. Recommended next issue

## Failure protocol

If stuck:

- Stop changing files.
- Report the exact failing command, stack trace, and suspected cause.
- Suggest the smallest next fix.
- Do not attempt broad rewrites to bypass a failing check.
