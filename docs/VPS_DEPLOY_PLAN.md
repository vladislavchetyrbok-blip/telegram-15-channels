# VPS deploy plan

## Runtime

- Install Node.js 20 LTS or newer.
- Copy the project to the VPS.
- Run `npm install`.
- Build with `npm run build`.
- Start the app with `npm run start` behind a process manager.

## Environment

Create `.env.local` or service-level environment variables:

```text
TELEGRAM_BOT_TOKEN=...
TELEGRAM_DRY_RUN=false
TELEGRAM_REAL_PUBLISH_ENABLED=false
AUTOPUBLISH_ENABLED=true
AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL=1
AUTOPUBLISH_MAX_POSTS_PER_DAY=15
AUTOPUBLISH_TIME_START=09:00
AUTOPUBLISH_TIME_END=21:00
AUTOPUBLISH_DAYS=0,1,2,3,4,5,6
AUTOPUBLISH_TIME=09:00
AUTOPUBLISH_TIMEZONE=Europe/Kyiv
AUTOPUBLISH_WORKER_INTERVAL_MS=300000
```

## Persistent storage

Keep these files on persistent disk and back them up before deploys:

- `data/runtime/autopublish.json`
- `data/runtime/weekly-content-plan.json`
- `data/runtime/telegram-targets.json`
- `data/runtime/autopublish-worker-heartbeat.json`
- `public/assets/telegram-posts/`

Do not replace `autopublish.json` or `weekly-content-plan.json` with empty local copies during deploy.

## Process manager

Use `pm2` for two processes:

```bash
pm2 start npm --name telegram-dashboard -- run start
pm2 start npm --name telegram-autopublish-worker -- run autopublish:worker
pm2 save
pm2 startup
```

## Worker and schedule

The worker calls the safe scheduler tick. It processes only one due channel per tick and uses the app-level run lock, so it should not publish a batch of overdue posts at once.

## Backups

Before deploy:

```bash
mkdir -p data/runtime/backups/$(date +%F-%H-%M)
cp data/runtime/autopublish.json data/runtime/backups/$(date +%F-%H-%M)/
cp data/runtime/weekly-content-plan.json data/runtime/backups/$(date +%F-%H-%M)/
cp data/runtime/telegram-targets.json data/runtime/backups/$(date +%F-%H-%M)/
```

Also back up generated post images if the VPS is the only copy.
