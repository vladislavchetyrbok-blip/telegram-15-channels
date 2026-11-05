---
name: AI Task
description: Safe task contract for Codex, Antigravity, Claude, or ChatGPT handoff
title: "AI: "
labels: ["ai-task"]
assignees: []
---

# AI Task Contract

## Goal

<!-- What should be improved or fixed? -->

## Suggested executor

- [ ] ChatGPT: planning / architecture / task breakdown
- [ ] Codex: implementation / tests / draft PR
- [ ] Antigravity: UI, browser flow, screenshots, E2E verification
- [ ] Claude: read-only review / issue creation / PR comments
- [ ] Human: manual approval / production action

## Scope

<!-- Exact files, pages, scripts, or behavior allowed to change. -->

## Out of scope

<!-- What must NOT be touched in this task. -->

## Acceptance criteria

- [ ] 
- [ ] 
- [ ] 

## Required checks

Baseline:

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run zodiac:miniapp:smoke`
- [ ] `npm run zodiac:workflow:check`
- [ ] `npm run production:safety:check`

Task-specific:

- [ ] 

## Safety rules

- [ ] Do not work on `main` directly.
- [ ] Do not run production/write/destructive commands.
- [ ] Do not change environment/secret configuration.
- [ ] Do not change payment/VIP production behavior unless this issue explicitly scopes it.
- [ ] Do not change scheduler behavior unless this issue explicitly scopes it.
- [ ] Open a draft PR and wait for owner approval.

## Expected report

The executor must report:

1. Branch
2. Changed files
3. Commands run
4. Check results
5. Screenshots or walkthrough, if UI changed
6. Risks / unresolved items
7. Manual review needed
8. Recommended next issue
