# GitHub Actions Scheduler Monitor

The GitHub Actions Scheduler Monitor is a read-only health check for the Telegram publishing workflow and local JSON queue.

## What It Checks

- GitHub Actions workflow files under `.github/workflows`.
- The Telegram publishing workflow, normally `.github/workflows/publish-scheduler.yml`.
- Whether the workflow has `schedule` and `workflow_dispatch`.
- Whether a push trigger is present.
- Whether `publish-scheduler.yml` has local git changes.
- Production source of truth and store mode.
- Queue counts, next due post, linked channels, and today's publication log counts from JSON runtime files.
- Telegram and autopublish configuration flags without printing tokens.
- Latest GitHub Actions workflow runs through read-only GitHub API calls when `GITHUB_TOKEN` or `GH_TOKEN` is configured.

## Read-Only Policy

The monitor does not publish Telegram posts, does not trigger `workflow_dispatch`, does not retry runs, does not change GitHub Actions settings, does not run migrations, and does not run mirror sync apply.

GitHub API usage is read-only and optional. When no token is configured, the monitor returns:

```json
{
  "githubApiAvailable": false,
  "message": "GitHub API token is not configured; local workflow checks only"
}
```

Secrets are never printed by the CLI, API, or admin page.

Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```

`safeToSwitchToSupabase` remains `false`.

## CLI

Run:

```bash
npm run actions:scheduler:check
```

The command returns a JSON report with workflow, scheduler, queue, Telegram, GitHub Actions API, warnings, and errors.

## Admin Page

Open:

```text
/admin/actions-scheduler
```

The page has only a refresh button. It does not include controls for running workflows, publishing posts, retrying failed jobs, switching stores, applying migrations, or applying mirror sync.

## Before Sleep Or Travel

Recommended read-only checks:

```bash
npm run production:safety:check
npm run actions:scheduler:check
npm run db:store:compare
npm run db:store:dual-read
npm run db:mirror:sync:dry
```
