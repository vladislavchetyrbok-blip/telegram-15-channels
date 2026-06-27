# Aphrodite QA CRLF Cross-Platform Robustness

Package 228 reduces false QA failures caused by CRLF/LF churn and working-tree
scope checks.

## What changed

- Added `scripts/lib/qa-git-scope.mjs`.
- The helper uses `git diff --name-only --ignore-space-at-eol HEAD`.
- EOL-only tracked changes are classified as `eolOnly`.
- Real tracked changes and untracked files still count as `changed`.
- Existing Aphrodite QA scripts with local `gitChangedNames` now use the shared helper.
- Added minimal `.gitattributes` with `* text=auto`.

## What is still blocked

The helper does not hide real unsafe changes:

- untracked files still count;
- real file content changes still count;
- workflow/cron/publish file scope checks still run;
- DB schema and secret file checks still run.

## Safety

- No runtime behavior was changed.
- No production launch was performed.
- No Telegram API call was made.
- No DB write was added.
- No payment or VIP unlock was added.
- No cron, workflow or publish script was changed.

## Current flags

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.
