# Package 292 - Owner Manual Closure Execution Pack

## Status

Package 292 turns the seven remaining production blockers into an exact owner manual execution pack.

`manualClosureStatus = READY_FOR_OWNER_MANUAL_EXECUTION`

No blockers are closed by this package. `blockersRemainOpen=true`, `publicLaunchApproved=false`, `ownerManualReviewRequired=true`, and soft launch: NO.

## All Seven Blockers Remain Open

1. `ownerRealDeviceApproval = PENDING`
2. `databaseUrl = MISSING`
3. `telegramBotToken = MISSING`
4. `backupFreshness = STALE`
5. `restoreRehearsal = REQUIRED_NOT_COMPLETED`
6. `publicAppUrl = MISSING`
7. `botFatherMiniAppUrl = NOT_DONE`

## Execution Order

1. Owner real-device visual approval
2. Configure DATABASE_URL outside Git
3. Configure TELEGRAM_BOT_TOKEN outside Git
4. Run redacted env presence check
5. Create/refresh backup under 24h
6. Run restore rehearsal
7. Configure PUBLIC_APP_URL
8. Verify public routes
9. Manually configure BotFather Mini App URL
10. Run final production safety check
11. Only then prepare final owner go/no-go

## Owner Actions

- Provide owner real-device visual approval evidence.
- Configure DATABASE_URL outside Git.
- Configure TELEGRAM_BOT_TOKEN outside Git.
- Run redacted env presence check and record only present/missing evidence.
- Create/refresh backup under 24h and record timestamp/path evidence.
- Run restore rehearsal against a non-production target.
- Configure PUBLIC_APP_URL outside Git.
- Verify public routes and confirm no dashboard/admin shell appears.
- Manually configure BotFather Mini App URL only after approval.
- Run final production safety check.
- Only then prepare final owner go/no-go.

## Evidence Templates

- Real-device evidence: device, Telegram app context, viewport, flow, screenshot path, reviewer, decision, timestamp.
- Env evidence: DATABASE_URL present/missing, TELEGRAM_BOT_TOKEN present/missing, checker, timestamp; no values.
- Backup evidence: backup path, createdAt, ageHours, manifest present, reviewer, timestamp.
- Restore rehearsal evidence: non-production target, start time, finish time, aggregate checks, result, reviewer.
- Public route evidence: HTTPS host, required routes checked, status, no dashboard/admin shell, reviewer, timestamp.
- BotFather evidence: owner manual confirmation, action date, approved public URL reference, reviewer.
- Final safety evidence: command, timestamp, expected blockers, unexpected blockers, reviewer, stop/continue decision.

## Redacted Verification Rules

Safe verification commands:

- `node scripts/check-env-presence-redacted.mjs`
- `node scripts/check-backup-freshness-redacted.mjs`
- `node scripts/check-public-url-routes-redacted.mjs`
- `npm run zodiac:miniapp:smoke`
- `npm run zodiac:dashboard:qa`
- `npm run production:safety:check`

Allowed output is redacted evidence only. Secret values must not be printed, pasted, committed, or shown in screenshots.

## Forbidden Actions

- Do not launch production.
- Do not call Telegram API.
- Do not send messages.
- Do not open/change BotFather from automation.
- Do not add secrets.
- Do not commit `.env.local`.
- Do not connect production DB.
- Do not write DB.
- Do not add payment.
- Do not unlock VIP.
- Do not change workflows/cron.
- Do not mark blockers closed without evidence.

## Launch Gate State

- `manualClosureStatus = READY_FOR_OWNER_MANUAL_EXECUTION`
- `blockersRemainOpen=true`
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`
- soft launch: NO
- owner action still required

## Safety Confirmation

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- Production DB connected: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- `.env.local` committed: No
- Blockers closed without evidence: No
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Next Package

Package 293 - Owner Real Device Evidence Intake
