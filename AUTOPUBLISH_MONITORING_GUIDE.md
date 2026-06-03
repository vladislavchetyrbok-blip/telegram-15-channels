# Autopublish Monitoring Guide

Current production path:

`GitHub Actions -> npm run publish:due -> JSON store -> Telegram`

The local computer is not required for scheduled publishing. GitHub Actions runs the scheduler on cron and uses GitHub Secrets for the real Telegram publishing flags.

## Current Working Mode

- `storeMode=json`
- `TELEGRAM_DRY_RUN=false`
- `TELEGRAM_REAL_PUBLISH_ENABLED=true`
- `PUBLISH_DUE_MAX_PER_RUN=15`
- Real publishing is controlled by GitHub Actions, not by local Codex runs.

Do not run real `npm run publish:due` from Codex. If a local check is needed, force safe mode first.

## How To Check That It Works

1. Open GitHub repository.
2. Open Actions.
3. Open workflow: `Publish due Telegram posts`.
4. Check the latest run logs.
5. Confirm the result summary:
   - `dryRun=false`
   - `realPublishEnabled=true`
   - `storeMode=json`
   - `published`, `skipped`, `errors`
6. Open `/admin/publish-monitor` locally to inspect queue reserve, recent logs and the workflow checklist.

## Where To Look In GitHub Actions

Workflow file:

`.github/workflows/publish-scheduler.yml`

The workflow runs hourly at minute 17:

```yaml
cron: "17 * * * *"
```

It also supports manual `workflow_dispatch`.

## Status Meanings

- `published`: a post was sent to Telegram and marked as published.
- `skipped`: the scheduler intentionally did not publish the post.
- `errors` or `failed`: a send or processing error happened and needs inspection.

Common skipped reasons:

- `already_published`: duplicate guard found that the post already has a successful publish marker, Telegram message id or success log.
- `dry_run: due post was not sent`: the run was safe mode and intentionally did not send to Telegram.
- no due posts: nothing is scheduled for the current time.

## Why `published=0` Can Be Normal

`published=0` is normal when:

- no post is due yet;
- all due posts were already published;
- duplicate guard skipped already published posts;
- the workflow ran before the next scheduled `publishAt`;
- safe/dry-run mode was intentionally enabled.

Check `skipped` and `message` before treating `published=0` as a failure.

## How To Stop Publishing

Preferred emergency pause:

```env
TELEGRAM_REAL_PUBLISH_ENABLED=false
```

Safe test mode:

```env
TELEGRAM_DRY_RUN=true
```

You can also disable the workflow from the GitHub Actions UI, but the secrets-based pause is usually clearer and reversible.

## If `dryRun` Becomes `true`

Check, in this order:

1. GitHub Secret `TELEGRAM_DRY_RUN`.
2. Workflow env `TELEGRAM_DRY_RUN`.
3. Workflow env `PUBLISH_DUE_DRY_RUN`.
4. Latest Actions log summary.

For real publishing, expected values are:

```env
TELEGRAM_DRY_RUN=false
PUBLISH_DUE_DRY_RUN=false
```

## If `realPublishEnabled` Becomes `false`

Check:

1. GitHub Secret `TELEGRAM_REAL_PUBLISH_ENABLED`.
2. Workflow env `TELEGRAM_REAL_PUBLISH_ENABLED`.
3. Workflow env `PUBLISH_DUE_REAL_PUBLISH_ENABLED`.

For real publishing, expected values are:

```env
TELEGRAM_REAL_PUBLISH_ENABLED=true
PUBLISH_DUE_REAL_PUBLISH_ENABLED=true
```

## How To Know Whether Posts Last Until June 7

Open `/admin/publish-monitor`.

Use:

- `Posts remaining`: ready/scheduled posts dated from today through `2026-06-07`.
- `Estimated days left`: `postsRemaining / maxPostsPerDay`.
- `Enough until June 7`: whether the current reserve covers every day through June 7 at the configured daily limit.

If the reserve is not enough, generate or approve more scheduled posts before the next day’s GitHub Actions runs.

## Operational Rule

Real publishing should remain in GitHub Actions. Local admin pages and Codex checks should read status or use forced dry-run only.
