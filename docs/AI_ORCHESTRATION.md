# AI Orchestration Workflow

This document connects ChatGPT, Codex, Antigravity, and Claude through one practical workflow.

## Core principle

The tools should not all edit the project at the same time.

Use GitHub as the central task board:

1. ChatGPT breaks the owner's idea into small GitHub issues.
2. Codex implements one issue on one branch.
3. Antigravity handles UI/browser-heavy work and verification when needed.
4. Claude reviews architecture, risks, diffs, and creates follow-up issues.
5. The owner approves merge or asks for changes.

## Responsibility map

| Tool | Main role | Best use | Default permission |
|---|---|---|---|
| ChatGPT | Dispatcher / architect | task split, prompts, priorities, reports | planning only |
| Codex | Main coder | features, fixes, tests, refactors | scoped implementation |
| Antigravity | UI/browser executor | Mini App UX, dashboard UX, screenshots, E2E checks | scoped implementation or verification |
| Claude | Reviewer | architecture review, risk review, issue creation | read-only by default |
| Human owner | Final decision | merge, launch, protected actions | final approval |

## Standard loop

### 1. Create issue

Use `.github/ISSUE_TEMPLATE/ai-task.md`.

The issue must include goal, scope, out of scope, acceptance criteria, checks, safety rules, and expected report.

### 2. Assign executor

Use this simple rule:

- logic / backend / TypeScript / scripts -> Codex
- visual flow / browser verification / mobile layout -> Antigravity
- architecture review / risks / cleanup plan -> Claude
- unclear task / big roadmap / product decision -> ChatGPT first

### 3. Implementation branch

Executor creates:

```bash
git checkout main
git pull
git checkout -b ai/<issue-number>-<short-slug>
```

### 4. Checks

Baseline:

```bash
npm run typecheck
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:workflow:check
npm run production:safety:check
```

Add feature-specific checks from `package.json` when relevant.

### 5. Draft PR

PR must include:

- changed files
- commands run
- check results
- screenshots/walkthrough for UI work
- known risks
- manual review needed
- recommended next issue

### 6. Review

Claude reviews the PR in read-only mode.

Review verdicts:

- PASS: safe to review manually
- PASS WITH RISKS: merge possible after owner understands risks
- BLOCKED: missing check or unclear behavior
- FAIL: unsafe or broken

### 7. Owner decision

Owner says one of:

- `правим` -> create follow-up issue or ask executor to revise
- `сохраняем` -> owner approves merge process
- `откатываем` -> close PR or revert branch
- `следующая задача` -> ChatGPT creates next issue

## Copy-paste prompt for ChatGPT

```text
Ты диспетчер проекта telegram-15-channels. Разбей мою задачу на маленький GitHub issue по AI Task Contract. Укажи: цель, scope, out of scope, acceptance criteria, checks, safety rules, кто исполнитель: Codex / Antigravity / Claude / Human. Не предлагай live-публикацию, платежи, внешние настройки, DB apply или merge без моего явного подтверждения.

Задача: <вставить задачу>
```

## Copy-paste prompt for Codex

```text
Work on GitHub issue #<number> only.
Read AGENTS.md first.
Create branch ai/<number>-<short-slug> from main.
Implement only the scoped changes.
Do not touch out-of-scope areas.
Run required checks from the issue and AGENTS.md.
Open a draft PR.
Report: changed files, commands run, check results, risks, manual review needed, next recommended issue.
```

## Copy-paste prompt for Antigravity

```text
Open this repository and work only on GitHub issue #<number>.
Read AGENTS.md first.
Use Antigravity mainly for UI/browser flow and verification.
If implementing, use a new branch ai/<number>-<short-slug> from main.
Verify the result in the browser and include screenshots or a walkthrough in the PR.
Do not change protected or out-of-scope areas.
Open a draft PR and report all checks.
```

## Copy-paste prompt for Claude

```text
Review only. Do not edit files, commit, push, or merge.
Read CLAUDE.md and AGENTS.md.
Review GitHub issue #<number> and PR #<number>.
Return a Claude Review Report with verdict: PASS / PASS WITH RISKS / BLOCKED / FAIL.
Create follow-up GitHub issues only for actionable findings.
```

## Package naming

Use package numbers only when the owner already has a package sequence.

Recommended title format:

```text
AI: Package <number> - <short result>
```

Recommended branch format:

```text
ai/<issue-number>-package-<number>-<short-slug>
```

## Anti-chaos rules

- One issue per executor.
- One branch per issue.
- One PR per package.
- No two agents on the same branch.
- Claude reviews; Codex/Antigravity implement.
- Owner merges only after report and review.
