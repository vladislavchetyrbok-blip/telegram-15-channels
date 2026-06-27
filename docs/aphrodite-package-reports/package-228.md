# Package 228 - QA CRLF Cross-Platform Robustness

## Scope

Improved QA robustness for CRLF/LF and cross-platform working-tree checks.

New route:

`/dashboard/networks/zodiac/qa-crlf-cross-platform-robustness`

## Added

- `scripts/lib/qa-git-scope.mjs`.
- `scripts/qa-aphrodite-qa-crlf-cross-platform-robustness.mjs`.
- `.gitattributes` with `* text=auto`.
- dashboard readiness page and static model.
- dashboard navigation link and dashboard QA assertions.

## Behavior

- EOL-only tracked changes are classified separately as `eolOnly`.
- Real tracked changes and untracked files still count as package scope changes.
- `--ignore-space-at-eol` is used for safe tracked diff name checks.
- Existing Aphrodite QA scripts that used local `gitChangedNames` now use the shared helper.

## Safety confirmation

- Production launch done: No.
- Telegram API used: No.
- Messages sent: No.
- BotFather changed: No.
- Active CTA logic changed: No.
- DB write added: No.
- External analytics added: No.
- Payment added: No.
- VIP unlock added: No.
- Cron/workflows/publish scripts changed: No.
- Secrets added: No.
- Production DB connected: No.
- Runtime behavior changed: No.

## Current flags

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.
