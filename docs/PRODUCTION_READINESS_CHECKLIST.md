# PRODUCTION READINESS CHECKLIST

## 1. Current commit baseline
- **Recent Important Commits**:
  - `e321497 docs: add supabase reconciliation preflight plan`
  - `3101664 docs: add controlled dependency upgrade plan`
  - `dbca048 docs: add supabase json reconciliation audit`
  - `337430c chore: cancel stale scheduled queue`
  - `ae433b9 docs: add production queue safety audit`
  - `99a55db chore: pause production publish scheduler`
- **Current Branch**: `main`
- **Status**: Working tree clean except for `docs/IMAGE_BATCH_LEO_7_PROMPTS.md` and this checklist.

## 2. Production publishing status
- **Scheduler**: Paused (`publish-scheduler.yml` restricted to dry-run only)
- **Cron**: Disabled
- **Workflow**: Manual triggering only
- **Publish Flags**: `dryRun: true`, `publishToTelegram: false`
- **Live Publish**: Blocked by system constraints and safety scripts.

## 3. Queue status
- **Cancelled Posts**: 90 stale scheduled posts successfully cancelled.
- **Scheduled Posts Count**: 0
- **Ready Posts Count**: 0
- **Next Due Post**: `null`
- **Queue Risk**: Removed (no backlog spam risk).

## 4. Backup/security status
- **Fresh Backup**: Exists (`data/backups/2026-06-13-13-39-19`).
- **Secrets Copied**: `false`
- **Env Cleanup**: `.env.local` successfully removed from previous runtime backups.
- **Env Security**: Environment variables and secrets are NOT present in the backups.

## 5. Supabase/JSON status
- **Mismatch**: Remains (blocks production).
- **Missing in Supabase**: 8 records (7 `publication_logs`, 1 `scheduler_runs`).
- **Extra in Supabase**: 1 record (`scheduler_runs`).
- **Orphan Logs**: 6 references to `weekly-2026-05-31-02-ai-technologies-02` in local JSON.
- **Preflight Actions**: Ready (`docs/SUPABASE_RECONCILIATION_PREFLIGHT_ACTIONS.json`).
- **Apply State**: Not performed yet.
- **Production Status**: Remains blocked by `production:safety:check`.

## 6. Dependencies status
- **Vulnerabilities**: Next.js (High) and PostCSS (Moderate) reported by npm audit.
- **Package Changes**: None made yet.
- **Upgrade Plan**: Controlled upgrade plan exists (`docs/CONTROLLED_DEPENDENCY_UPGRADE_PLAN.md`).
- **Forbidden Action**: `npm audit fix --force` is strictly forbidden to prevent major version breaking changes.

## 7. Zodiac weekly images status
- **Complete Signs**: Gemini, Aries, Taurus, Cancer (7/7 each).
- **Leo**: 0/7 (Prompt ready, waiting on Quota recovery).
- **Other Signs**: 0/7 (Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces).
- **Total Generated**: 28 / 91.
- **Missing Images**: 63.
- **Blocker**: Leo Image generation requires quota reset.

## 8. Remaining blockers before production
- Apply Supabase reconciliation and re-audit.
- Execute controlled dependency security upgrade and audit.
- Generate full weekly assets (91/91) if visually complete launch is strictly required.
- Achieve a fully green final `production:safety:check` with 0 warnings.
- Obtain explicit manual approval before enabling scheduler and live publishing.

## 9. Recommended next steps
1. **Wait for Codex**: Audit Supabase preflight plan if needed.
2. **Supabase Apply**: Perform Supabase fixes **only** with explicit approval.
3. **Safety Check**: Run `production:safety:check` to ensure db mismatch is resolved.
4. **Dependency Upgrade**: Execute controlled dependency upgrade.
5. **Resume Leo**: Generate remaining images when quota returns.
6. **Final Dry-Run**: Perform a final dry-run publishing test.
7. **Production Enablement**: Only then consider turning on production automation.

## 10. Explicit forbidden actions until green
- **NO** live publishing.
- **NO** cron enablement.
- **NO** `:apply` commands (database/sync).
- **NO** `git add .` (only specific tracked files).
- **NO** package force upgrade (`npm audit fix --force`).
- **NO** Supabase writes without explicit approval.

## 11. One-page executive summary
- **Safe for dry-run work**: YES
- **Safe for production/autopublish**: NO
- **Main blocker**: Supabase/JSON mismatch and pending `production:safety:check` failures.
