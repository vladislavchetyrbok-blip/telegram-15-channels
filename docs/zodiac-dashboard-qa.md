# Zodiac Dashboard QA

Automated QA script to verify the structural integrity and UI correctness of the Telegram Zodiac Platform Dashboard.

## Execution

```bash
npm run zodiac:dashboard:qa
```

## Coverage

The script `scripts/qa-zodiac-dashboard.mjs` verifies:
- `/dashboard/networks/zodiac` page loads successfully.
- Overview page contains "Открыть аналитику" call-to-action.
- Overview page links directly to `/dashboard/networks/zodiac/analytics`.
- No Redis token or URL source code is accidentally leaked on the overview page.
- Visual distinction between overview and analytics pages.
- Correct conditional rendering of `noop` or `redis` state based on available environment variables.
